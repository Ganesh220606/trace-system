import React, { useState } from 'react';
import { Play, Flame, Send, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Database, HeartPulse, Layers } from 'lucide-react';
import { ENDPOINTS, EndpointExecutionResult } from '../services/telemetryEngine';
import { TraceRecord } from '../types/telemetry';

interface TrafficSimulatorProps {
  onExecuteEndpoint: (path: string) => EndpointExecutionResult;
  onExecuteSweep: () => void;
  recentTraces: TraceRecord[];
  onSelectTrace: (traceId: string) => void;
  trafficRate: number;
  onChangeTrafficRate: (rate: number) => void;
  isAutoTraffic: boolean;
  onToggleAutoTraffic: () => void;
}

export const TrafficSimulator: React.FC<TrafficSimulatorProps> = ({
  onExecuteEndpoint,
  onExecuteSweep,
  recentTraces,
  onSelectTrace,
  trafficRate,
  onChangeTrafficRate,
  isAutoTraffic,
  onToggleAutoTraffic,
}) => {
  const [lastResult, setLastResult] = useState<EndpointExecutionResult | null>(null);
  const [selectedPath, setSelectedPath] = useState<string>('/work');
  const [isFiringSweep, setIsFiringSweep] = useState(false);

  const handleSend = (path: string) => {
    setSelectedPath(path);
    const result = onExecuteEndpoint(path);
    setLastResult(result);
  };

  const handleRunSweep = async () => {
    setIsFiringSweep(true);
    onExecuteSweep();
    setTimeout(() => {
      setIsFiringSweep(false);
    }, 600);
  };

  const getEndpointIcon = (path: string) => {
    switch (path) {
      case '/':
        return <Layers className="w-4 h-4 text-sky-500" />;
      case '/health':
        return <HeartPulse className="w-4 h-4 text-emerald-500" />;
      case '/work':
        return <Database className="w-4 h-4 text-amber-500" />;
      case '/error':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case '/system':
        return <Cpu className="w-4 h-4 text-indigo-500" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Context Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-orange-400">Step 9.5 & 10</span>
              <span aria-hidden="true">·</span>
              <span>Local Flask Target: <code className="text-slate-200">http://127.0.0.1:5000</code></span>
              <span aria-hidden="true">·</span>
              <span>Service: <code className="text-slate-200">cloud-observability-system</code></span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Live Endpoint Traffic Generator
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Trigger live HTTP calls across your instrumented Flask routes to push spans, traces, and metrics into OpenTelemetry and Grafana Cloud.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRunSweep}
              disabled={isFiringSweep}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isFiringSweep ? 'animate-spin' : ''}`} />
              <span>Run 5-Endpoint Sweep</span>
            </button>
            <button
              onClick={onToggleAutoTraffic}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                isAutoTraffic
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-white" />
              <span>{isAutoTraffic ? 'Streaming Live Traffic' : 'Start Auto Traffic'}</span>
            </button>
          </div>
        </div>

        {/* Speed slider when auto traffic is enabled */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Traffic Generator Rate:</span>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={trafficRate}
              onChange={(e) => onChangeTrafficRate(parseFloat(e.target.value))}
              className="w-32 accent-orange-500 cursor-pointer"
            />
            <span className="font-mono text-slate-200 tabular-nums">{trafficRate} req/sec</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Auto telemetry pipeline:</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
              <CheckCircle2 className="w-3 h-3" />
              OTel Batch Exporter active
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Endpoint Controls + Live Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5 Endpoints */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
            Instrumented Routes (app.py)
          </h3>

          <div className="space-y-2.5">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedPath === ep.path;
              return (
                <div
                  key={ep.path}
                  className={`p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-orange-500/60 shadow-sm'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 rounded bg-slate-800/80 border border-slate-700/60">
                        {getEndpointIcon(ep.path)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {ep.method}
                          </span>
                          <span className="text-sm font-mono font-semibold text-white">
                            http://127.0.0.1:5000{ep.path}
                          </span>
                          <span
                            className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                              ep.expectedStatus === 200
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            HTTP {ep.expectedStatus}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-300 mt-1">
                          {ep.name}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {ep.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSend(ep.path)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-orange-600 hover:bg-orange-500 text-white shrink-0 transition-colors cursor-pointer shadow-sm"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live HTTP Response & Trace Bridge */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs flex items-center justify-between">
            <span>Inspector & Response Payload</span>
            {lastResult && (
              <span className="text-[11px] font-mono text-slate-400 normal-case">
                Latency: <span className="text-white tabular-nums">{lastResult.durationMs}ms</span>
              </span>
            )}
          </h3>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 min-h-[380px] flex flex-col justify-between">
            {lastResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        lastResult.statusCode === 200
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {lastResult.statusCode} {lastResult.statusCode === 200 ? 'OK' : 'ERROR'}
                    </span>
                    <span className="text-xs font-mono text-slate-300 font-semibold">
                      {lastResult.trace.rootEndpoint}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    {lastResult.durationMs}ms
                  </span>
                </div>

                {/* Trace ID Callout with Bridge Button */}
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-md">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>OpenTelemetry Trace ID:</span>
                    <button
                      onClick={() => onSelectTrace(lastResult.trace.traceId)}
                      className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>Inspect in Tempo</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="font-mono text-xs text-orange-300 mt-1 truncate select-all">
                    {lastResult.trace.traceId}
                  </div>
                </div>

                {/* Response Body JSON */}
                <div>
                  <div className="text-[11px] font-medium text-slate-400 mb-1">
                    HTTP Response Body (JSON):
                  </div>
                  <pre className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-56 leading-relaxed">
                    {JSON.stringify(lastResult.responsePayload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 text-slate-500">
                <Send className="w-8 h-8 mb-3 text-slate-600" />
                <p className="text-sm font-medium text-slate-400">No request sent yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Click 'Send' on any endpoint on the left, or click 'Run 5-Endpoint Sweep' to test all routes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Request Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Recent Local Requests Ledger
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Showing last {Math.min(recentTraces.length, 10)} requests
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 font-medium">Timestamp</th>
                <th className="pb-2 font-medium">Method & Route</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Duration</th>
                <th className="pb-2 font-medium">Trace ID</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {recentTraces.slice(0, 10).map((t) => (
                <tr key={t.traceId} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-2.5 text-slate-400 tabular-nums">
                    {new Date(t.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 text-slate-200 font-semibold">
                    <span className="text-slate-400 font-normal mr-2">{t.method}</span>
                    {t.rootEndpoint}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        t.httpStatus === 200
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {t.httpStatus}
                    </span>
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-slate-300">
                    {t.durationMs}ms
                  </td>
                  <td className="py-2.5 text-slate-400 truncate max-w-[160px]">
                    {t.traceId.slice(0, 16)}...
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => onSelectTrace(t.traceId)}
                      className="text-orange-400 hover:text-orange-300 font-sans text-xs font-semibold cursor-pointer"
                    >
                      View Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
