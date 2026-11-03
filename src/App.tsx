import React, { useState, useEffect, useRef } from 'react';
import { Header, ActiveTab } from './components/Header';
import { TrafficSimulator } from './components/TrafficSimulator';
import { TempoTraceExplorer } from './components/TempoTraceExplorer';
import { PrometheusMetrics } from './components/PrometheusMetrics';
import { LokiLogStream } from './components/LokiLogStream';
import { OTelConfigWizard } from './components/OTelConfigWizard';
import { SecurityTokenTroubleshooter } from './components/SecurityTokenTroubleshooter';
import { PythonSourceExporter } from './components/PythonSourceExporter';
import {
  executeEndpointSimulation,
  generateInitialHistory,
  EndpointExecutionResult,
} from './services/telemetryEngine';
import { TraceRecord, LokiLogEntry, TelemetryMetricPoint, OTelConfig } from './types/telemetry';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isAutoTraffic, setIsAutoTraffic] = useState<boolean>(false);
  const [trafficRate, setTrafficRate] = useState<number>(1.5); // req/sec

  // Telemetry state
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [logs, setLogs] = useState<LokiLogEntry[]>([]);
  const [metrics, setMetrics] = useState<TelemetryMetricPoint[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

  // OTel configuration state
  const [config, setConfig] = useState<OTelConfig>({
    serviceName: 'cloud-observability-system',
    otlpEndpoint: 'https://otlp-gateway-prod-us-east-0.grafana.net/otlp',
    otlpProtocol: 'http/protobuf',
    authorizationHeader: 'Authorization=Basic MTkwNDE2ODpjMGQ0ZjY3Mi05YmNhLTQ1NWYtYTY5OC1mODNjN2RlMzkyMjc=',
    stackName: 'stack-1904168',
    policyName: 'stack-1904168-otel-cloud-observability-token',
    tokenName: 'cloud-observability-token',
    tokenId: 'c0d4f672-9bca-455f-a698-f83c7de39227',
  });

  // Initialize history on mount
  useEffect(() => {
    const initial = generateInitialHistory(10);
    setTraces(initial.traces);
    setLogs(initial.logs);
    setMetrics(initial.metrics);
    setSelectedTraceId(initial.traces[0]?.traceId || null);
  }, []);

  // Theme synchronization
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Execute endpoint handler
  const handleExecuteEndpoint = (path: string): EndpointExecutionResult => {
    const res = executeEndpointSimulation(path, config.serviceName);

    setTraces((prev) => [res.trace, ...prev.slice(0, 49)]);
    setLogs((prev) => [res.log, ...prev.slice(0, 99)]);

    // Update rolling metrics
    setMetrics((prev) => {
      const last = prev[prev.length - 1];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newPoint: TelemetryMetricPoint = {
        time: timeStr,
        timestamp: now.getTime(),
        requestRate: Number(((last ? last.requestRate * 0.7 : 2) + Math.random() * 1.5).toFixed(1)),
        latencyP50: Math.floor(res.durationMs * 0.6),
        latencyP95: Math.floor(res.durationMs * 1.2),
        latencyP99: Math.floor(res.durationMs * 1.8),
        errorRate: res.statusCode === 500 ? 25 : 0,
        cpuPercent: Number((20 + Math.random() * 22).toFixed(1)),
        memoryMb: Number((140 + Math.random() * 10).toFixed(1)),
        successCount: (last?.successCount || 0) + (res.statusCode === 200 ? 1 : 0),
        errorCount: (last?.errorCount || 0) + (res.statusCode === 500 ? 1 : 0),
      };
      return [...prev.slice(1), newPoint];
    });

    return res;
  };

  // Run 5-endpoint test sweep
  const handleExecuteSweep = () => {
    const endpoints = ['/', '/health', '/work', '/system', '/error'];
    endpoints.forEach((ep, idx) => {
      setTimeout(() => {
        handleExecuteEndpoint(ep);
      }, idx * 120);
    });
  };

  // Jump to specific trace in Tempo Trace Explorer
  const handleSelectTrace = (traceId: string) => {
    setSelectedTraceId(traceId);
    setActiveTab('traces');
  };

  // Auto-traffic loop
  const autoTrafficRef = useRef(isAutoTraffic);
  autoTrafficRef.current = isAutoTraffic;

  useEffect(() => {
    if (!isAutoTraffic) return;
    const intervalMs = Math.max(250, 1000 / trafficRate);

    const timer = setInterval(() => {
      if (!autoTrafficRef.current) return;
      const endpoints = ['/', '/health', '/work', '/work', '/system', '/error'];
      // Weigh 85% towards nominal, 15% towards error
      const rand = Math.random();
      const ep = rand < 0.15 ? '/error' : endpoints[Math.floor(Math.random() * (endpoints.length - 1))];
      handleExecuteEndpoint(ep);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAutoTraffic, trafficRate, config.serviceName]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isAutoTraffic={isAutoTraffic}
        onToggleAutoTraffic={() => setIsAutoTraffic((prev) => !prev)}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        tracesCount={traces.length}
        hasSecurityAlert={config.tokenName === 'cloud-observability-token'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simulator' && (
          <TrafficSimulator
            onExecuteEndpoint={handleExecuteEndpoint}
            onExecuteSweep={handleExecuteSweep}
            recentTraces={traces}
            onSelectTrace={handleSelectTrace}
            trafficRate={trafficRate}
            onChangeTrafficRate={setTrafficRate}
            isAutoTraffic={isAutoTraffic}
            onToggleAutoTraffic={() => setIsAutoTraffic((prev) => !prev)}
          />
        )}

        {activeTab === 'traces' && (
          <TempoTraceExplorer
            traces={traces}
            selectedTraceId={selectedTraceId}
            onSelectTraceId={setSelectedTraceId}
            serviceName={config.serviceName}
          />
        )}

        {activeTab === 'metrics' && (
          <PrometheusMetrics
            metrics={metrics}
            serviceName={config.serviceName}
          />
        )}

        {activeTab === 'logs' && (
          <LokiLogStream
            logs={logs}
            onSelectTrace={handleSelectTrace}
            onClearLogs={() => setLogs([])}
            serviceName={config.serviceName}
          />
        )}

        {activeTab === 'config' && (
          <OTelConfigWizard
            config={config}
            onUpdateConfig={(updated) => setConfig((prev) => ({ ...prev, ...updated }))}
          />
        )}

        {activeTab === 'security' && (
          <SecurityTokenTroubleshooter
            config={config}
            onUpdateConfig={(updated) => setConfig((prev) => ({ ...prev, ...updated }))}
          />
        )}

        {activeTab === 'source' && <PythonSourceExporter />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 text-xs text-slate-500 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">cloud-observability-system</span>
            <span aria-hidden="true">·</span>
            <span>OpenTelemetry 1.24+</span>
            <span aria-hidden="true">·</span>
            <span>Grafana Cloud Tempo / Prometheus / Loki</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Local Target: http://127.0.0.1:5000
          </div>
        </div>
      </footer>
    </div>
  );
}
