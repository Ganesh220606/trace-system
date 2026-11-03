import React, { useState } from 'react';
import { Play, TrendingUp, Cpu, Database, Activity, RefreshCw } from 'lucide-react';
import { TelemetryMetricPoint } from '../types/telemetry';

interface PrometheusMetricsProps {
  metrics: TelemetryMetricPoint[];
  serviceName: string;
}

const PRESET_QUERIES = [
  {
    label: 'Request Rate by Status',
    query: 'sum(rate(http_requests_total{service="cloud-observability-system"}[1m])) by (status)',
  },
  {
    label: '95th Percentile Latency (P95)',
    query: 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))',
  },
  {
    label: 'Host CPU Utilization (%)',
    query: 'system_cpu_percent{service="cloud-observability-system", host="127.0.0.1"}',
  },
  {
    label: 'Process Resident Memory (MB)',
    query: 'process_resident_memory_bytes{service="cloud-observability-system"} / 1024 / 1024',
  },
];

export const PrometheusMetrics: React.FC<PrometheusMetricsProps> = ({
  metrics,
  serviceName,
}) => {
  const [selectedQuery, setSelectedQuery] = useState<string>(PRESET_QUERIES[0].query);
  const [activeQueryInput, setActiveQueryInput] = useState<string>(PRESET_QUERIES[0].query);
  const [executedAt, setExecutedAt] = useState<string>(new Date().toLocaleTimeString());

  const latestPoint = metrics[metrics.length - 1] || {
    requestRate: 2.1,
    latencyP50: 24,
    latencyP95: 112,
    latencyP99: 184,
    cpuPercent: 28.4,
    memoryMb: 142.0,
    errorRate: 0,
  };

  const handleRunQuery = () => {
    setSelectedQuery(activeQueryInput);
    setExecutedAt(new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-6">
      {/* Grafana Explore Prometheus Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs font-bold">
              Prometheus
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Grafana Cloud Explore</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-300">Prometheus Data Source</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Querying metrics exported via OpenTelemetry OTLP to Grafana Mimir
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Last evaluated: <span className="text-slate-200">{executedAt}</span>
          </div>
        </div>

        {/* PromQL Query Input */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={activeQueryInput}
                onChange={(e) => setActiveQueryInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-orange-500 selection:bg-emerald-950"
                placeholder="Enter PromQL query expression..."
              />
            </div>
            <button
              onClick={handleRunQuery}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-semibold cursor-pointer transition-colors shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Query</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px]">Presets:</span>
            {PRESET_QUERIES.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setActiveQueryInput(p.query);
                  setSelectedQuery(p.query);
                  setExecutedAt(new Date().toLocaleTimeString());
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                  selectedQuery === p.query
                    ? 'bg-slate-800 text-orange-400 border-orange-500/40'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Request Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Throughput</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {latestPoint.requestRate}
            </span>
            <span className="text-xs text-slate-400 font-mono">req/sec</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            http_requests_total rate[1m]
          </div>
        </div>

        {/* P95 Latency */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>P95 Latency</span>
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {latestPoint.latencyP95}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            P50: {latestPoint.latencyP50}ms · P99: {latestPoint.latencyP99}ms
          </div>
        </div>

        {/* Host CPU Utilization */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Host CPU (psutil)</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {latestPoint.cpuPercent}%
            </span>
            <span className="text-xs text-slate-400 font-mono">user+sys</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Reported by /system endpoint
          </div>
        </div>

        {/* Memory RSS */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Memory (RSS)</span>
            <Database className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {latestPoint.memoryMb}
            </span>
            <span className="text-xs text-slate-400 font-mono">MB</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Process memory footprint
          </div>
        </div>
      </div>

      {/* SVG Time-Series Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Request Rate & Errors */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Request Throughput & Errors (Rate)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                sum(rate(http_requests_total[1m]))
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full" />
                2xx (Nominal)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-0.5 bg-rose-400 rounded-full" />
                5xx (Exceptions)
              </span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="h-52 w-full pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
              {/* Gridlines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#1e293b" strokeDasharray="4,4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeDasharray="4,4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="4,4" />
              <line x1="0" y1="160" x2="500" y2="160" stroke="#334155" />

              {/* Rate line path */}
              {(() => {
                const count = metrics.length;
                if (count < 2) return null;
                const points = metrics.map((m, idx) => {
                  const x = (idx / (count - 1)) * 500;
                  // normalize requestRate (0 to 6 req/s)
                  const y = 150 - (m.requestRate / 5) * 120;
                  return `${x},${Math.max(20, Math.min(150, y))}`;
                });
                return (
                  <>
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      points={points.join(' ')}
                    />
                    {metrics.map((m, idx) => {
                      const x = (idx / (count - 1)) * 500;
                      const y = 150 - (m.requestRate / 5) * 120;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={Math.max(20, Math.min(150, y))}
                          r="3"
                          fill="#10b981"
                        />
                      );
                    })}
                  </>
                );
              })()}

              {/* Error spikes */}
              {(() => {
                const count = metrics.length;
                if (count < 2) return null;
                const points = metrics.map((m, idx) => {
                  const x = (idx / (count - 1)) * 500;
                  const y = 150 - (m.errorCount * 30);
                  return `${x},${Math.max(30, Math.min(150, y))}`;
                });
                return (
                  <polyline
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                    points={points.join(' ')}
                  />
                );
              })()}
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
            <span>{metrics[0]?.time || 'T-60s'}</span>
            <span>{metrics[Math.floor(metrics.length / 2)]?.time || 'T-30s'}</span>
            <span>{metrics[metrics.length - 1]?.time || 'Now'}</span>
          </div>
        </div>

        {/* Chart 2: System CPU & Memory */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                System CPU & Memory Footprint
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                system_cpu_percent & memory_used_mb
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-2.5 h-0.5 bg-sky-400 rounded-full" />
                CPU % (0-100)
              </span>
              <span className="flex items-center gap-1.5 text-violet-400">
                <span className="w-2.5 h-0.5 bg-violet-400 rounded-full" />
                Memory MB
              </span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="h-52 w-full pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
              <line x1="0" y1="40" x2="500" y2="40" stroke="#1e293b" strokeDasharray="4,4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeDasharray="4,4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" strokeDasharray="4,4" />
              <line x1="0" y1="160" x2="500" y2="160" stroke="#334155" />

              {/* CPU path */}
              {(() => {
                const count = metrics.length;
                if (count < 2) return null;
                const points = metrics.map((m, idx) => {
                  const x = (idx / (count - 1)) * 500;
                  const y = 150 - (m.cpuPercent / 100) * 130;
                  return `${x},${Math.max(15, Math.min(150, y))}`;
                });
                return (
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    points={points.join(' ')}
                  />
                );
              })()}

              {/* Memory path */}
              {(() => {
                const count = metrics.length;
                if (count < 2) return null;
                const points = metrics.map((m, idx) => {
                  const x = (idx / (count - 1)) * 500;
                  // normalize 100MB-200MB range
                  const norm = (m.memoryMb - 100) / 100;
                  const y = 150 - norm * 120;
                  return `${x},${Math.max(20, Math.min(150, y))}`;
                });
                return (
                  <polyline
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    points={points.join(' ')}
                  />
                );
              })()}
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
            <span>{metrics[0]?.time || 'T-60s'}</span>
            <span>{metrics[Math.floor(metrics.length / 2)]?.time || 'T-30s'}</span>
            <span>{metrics[metrics.length - 1]?.time || 'Now'}</span>
          </div>
        </div>
      </div>

      {/* PromQL Result Vector Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-bold text-white tracking-tight mb-3">
          Prometheus Instant Vector Evaluation
        </h3>
        <div className="border border-slate-800 rounded overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Metric Vector Labels</th>
                <th className="py-2 px-3 text-right">Value</th>
                <th className="py-2 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 bg-slate-900">
              <tr>
                <td className="py-2 px-3 text-slate-300">
                  {`http_requests_total{service="${serviceName}", method="GET", status="200"}`}
                </td>
                <td className="py-2 px-3 text-right text-emerald-400 font-bold tabular-nums">
                  {latestPoint.successCount * 8 + 42}
                </td>
                <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                  {latestPoint.time}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-300">
                  {`http_requests_total{service="${serviceName}", method="GET", status="500"}`}
                </td>
                <td className="py-2 px-3 text-right text-rose-400 font-bold tabular-nums">
                  {latestPoint.errorCount * 3 + 4}
                </td>
                <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                  {latestPoint.time}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-300">
                  {`system_cpu_percent{service="${serviceName}", host="127.0.0.1"}`}
                </td>
                <td className="py-2 px-3 text-right text-sky-400 font-bold tabular-nums">
                  {latestPoint.cpuPercent}%
                </td>
                <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                  {latestPoint.time}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-slate-300">
                  {`process_resident_memory_bytes{service="${serviceName}"} / 1024 / 1024`}
                </td>
                <td className="py-2 px-3 text-right text-violet-400 font-bold tabular-nums">
                  {latestPoint.memoryMb} MB
                </td>
                <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                  {latestPoint.time}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
