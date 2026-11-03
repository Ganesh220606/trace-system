import React, { useState } from 'react';
import { Search, Filter, Layers, Clock, AlertCircle, CheckCircle, ChevronRight, ChevronDown, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { TraceRecord, Span } from '../types/telemetry';

interface TempoTraceExplorerProps {
  traces: TraceRecord[];
  selectedTraceId: string | null;
  onSelectTraceId: (id: string) => void;
  serviceName: string;
}

export const TempoTraceExplorer: React.FC<TempoTraceExplorerProps> = ({
  traces,
  selectedTraceId,
  onSelectTraceId,
  serviceName,
}) => {
  const [filterEndpoint, setFilterEndpoint] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter traces
  const filteredTraces = traces.filter((t) => {
    if (filterEndpoint !== 'all' && t.rootEndpoint !== filterEndpoint) return false;
    if (filterStatus === 'error' && !t.hasError) return false;
    if (filterStatus === 'success' && t.hasError) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        t.traceId.toLowerCase().includes(q) ||
        t.rootEndpoint.toLowerCase().includes(q) ||
        (t.errorMessage && t.errorMessage.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeTrace = traces.find((t) => t.traceId === selectedTraceId) || filteredTraces[0] || null;
  const activeSpan = activeTrace?.spans.find((s) => s.spanId === selectedSpanId) || activeTrace?.spans[0] || null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Grafana Explore Tempo Header / Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-xs font-bold">
              Tempo
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Grafana Cloud Explore</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-300">Traces Data Source</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Service: <span className="text-orange-400 font-semibold">{serviceName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Total ingested traces:</span>
            <span className="font-mono font-bold text-white tabular-nums bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {traces.length}
            </span>
          </div>
        </div>

        {/* Query Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 text-xs">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Trace ID or exception message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono text-xs"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-slate-400 whitespace-nowrap">Endpoint:</span>
            <select
              value={filterEndpoint}
              onChange={(e) => setFilterEndpoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
            >
              <option value="all">All Endpoints</option>
              <option value="/">GET / (Home)</option>
              <option value="/health">GET /health</option>
              <option value="/work">GET /work (Multi-span)</option>
              <option value="/error">GET /error (Exception)</option>
              <option value="/system">GET /system</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-slate-400 whitespace-nowrap">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
            >
              <option value="all">All Statuses</option>
              <option value="success">200 OK only</option>
              <option value="error">500 Error only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View: Left List + Right Waterfall Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Traces Table */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-300">
              Trace Results ({filteredTraces.length})
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Select to view spans</span>
          </div>

          {filteredTraces.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <p>No traces match the current filter.</p>
              <p className="mt-1 text-slate-600">Generate traffic in the 'Endpoints & Traffic' tab.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredTraces.map((trace) => {
                const isSelected = activeTrace?.traceId === trace.traceId;
                return (
                  <div
                    key={trace.traceId}
                    onClick={() => {
                      onSelectTraceId(trace.traceId);
                      setSelectedSpanId(trace.spans[0]?.spanId || null);
                    }}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-850 border-orange-500 shadow-sm'
                        : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            trace.hasError ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className="text-xs font-mono font-bold text-white">
                          {trace.method} {trace.rootEndpoint}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          trace.httpStatus === 200
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400 font-bold'
                        }`}
                      >
                        {trace.httpStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-slate-400">
                      <span>{trace.spans.length} {trace.spans.length === 1 ? 'span' : 'spans'}</span>
                      <span className="tabular-nums text-slate-200 font-semibold">{trace.durationMs}ms</span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                      id: {trace.traceId}
                    </div>

                    {trace.hasError && (
                      <div className="mt-1.5 text-[11px] text-rose-400 font-mono truncate bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
                        {trace.errorMessage}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Trace Waterfall & Span Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {activeTrace ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-5">
              {/* Trace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        activeTrace.hasError
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {activeTrace.httpStatus} {activeTrace.hasError ? 'ERROR' : 'OK'}
                    </span>
                    <span className="text-base font-bold text-white font-mono">
                      {activeTrace.method} {activeTrace.rootEndpoint}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1.5">
                    <span>Duration: <strong className="text-slate-200 tabular-nums">{activeTrace.durationMs}ms</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Spans: <strong className="text-slate-200">{activeTrace.spans.length}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(activeTrace.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeTrace.traceId, 'trace-id')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer transition-colors border border-slate-700"
                    title="Copy full 128-bit Trace ID"
                  >
                    {copiedId === 'trace-id' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Copy Trace ID</span>
                  </button>
                </div>
              </div>

              {/* Waterfall Gantt View */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>SPAN WATERFALL (TIMELINE)</span>
                  <span className="font-mono text-[11px] tabular-nums">0ms — {activeTrace.durationMs}ms</span>
                </div>

                {/* Timeline axis */}
                <div className="relative h-4 border-b border-slate-800 mb-2 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>0ms</span>
                  <span>{Math.round(activeTrace.durationMs * 0.25)}ms</span>
                  <span>{Math.round(activeTrace.durationMs * 0.5)}ms</span>
                  <span>{Math.round(activeTrace.durationMs * 0.75)}ms</span>
                  <span>{activeTrace.durationMs}ms</span>
                </div>

                <div className="space-y-2">
                  {activeTrace.spans.map((span) => {
                    const isSelected = (activeSpan?.spanId || activeTrace.spans[0].spanId) === span.spanId;
                    const leftPct = Math.min(95, (span.startTimeOffsetMs / Math.max(activeTrace.durationMs, 1)) * 100);
                    const widthPct = Math.max(
                      5,
                      Math.min(100 - leftPct, (span.durationMs / Math.max(activeTrace.durationMs, 1)) * 100)
                    );

                    return (
                      <div
                        key={span.spanId}
                        onClick={() => setSelectedSpanId(span.spanId)}
                        className={`p-2.5 rounded border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-850 border-orange-500/80 shadow-sm'
                            : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                span.statusCode === 'ERROR'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {span.statusCode}
                            </span>
                            <span className="font-semibold text-slate-200 truncate">
                              {span.name}
                            </span>
                            {span.parentSpanId && (
                              <span className="text-[10px] text-slate-500">(child)</span>
                            )}
                          </div>
                          <span className="text-slate-300 font-semibold tabular-nums ml-2 shrink-0">
                            {span.durationMs}ms
                          </span>
                        </div>

                        {/* Proportional Gantt Bar */}
                        <div className="mt-2 w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 relative">
                          <div
                            style={{
                              marginLeft: `${leftPct}%`,
                              width: `${widthPct}%`,
                            }}
                            className={`h-full rounded-full transition-all ${
                              span.statusCode === 'ERROR'
                                ? 'bg-rose-500'
                                : span.parentSpanId
                                ? 'bg-sky-500'
                                : 'bg-orange-500'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Span Detail Panel */}
              {activeSpan && (
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Selected Span Details: <span className="text-orange-400 font-mono normal-case">{activeSpan.name}</span>
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      span_id: {activeSpan.spanId}
                    </span>
                  </div>

                  {/* Attributes Table */}
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5 font-mono">
                      Span Attributes (OTel Semantic Conventions):
                    </div>
                    <div className="border border-slate-800 rounded bg-slate-950 overflow-hidden">
                      <table className="w-full text-left text-xs font-mono">
                        <tbody className="divide-y divide-slate-850">
                          {Object.entries(activeSpan.attributes).map(([key, val]) => (
                            <tr key={key} className="hover:bg-slate-900/60">
                              <td className="py-1.5 px-3 text-slate-400 w-1/3 border-r border-slate-850 truncate">
                                {key}
                              </td>
                              <td className="py-1.5 px-3 text-slate-200 break-all">
                                {String(val)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Exception / Event Callout */}
                  {activeSpan.events.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-semibold text-rose-400 font-mono flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Span Events ({activeSpan.events.length}):</span>
                      </div>
                      {activeSpan.events.map((evt, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-rose-950/20 border border-rose-900/50 rounded text-xs font-mono space-y-2"
                        >
                          <div className="flex items-center justify-between text-rose-300">
                            <span className="font-bold">event: {evt.name}</span>
                            <span className="text-[10px] text-slate-400">
                              +{evt.timestampMs - activeTrace.timestampMs}ms
                            </span>
                          </div>
                          {evt.attributes && (
                            <div className="space-y-1 text-slate-300">
                              {evt.attributes['exception.type'] && (
                                <div>
                                  <span className="text-slate-500">type: </span>
                                  <span className="text-rose-400 font-bold">
                                    {String(evt.attributes['exception.type'])}
                                  </span>
                                </div>
                              )}
                              {evt.attributes['exception.message'] && (
                                <div>
                                  <span className="text-slate-500">message: </span>
                                  <span>{String(evt.attributes['exception.message'])}</span>
                                </div>
                              )}
                              {evt.attributes['exception.stacktrace'] && (
                                <div className="mt-2">
                                  <div className="text-slate-500 text-[10px] mb-1">
                                    Python Exception Traceback:
                                  </div>
                                  <pre className="p-2.5 bg-slate-950 rounded border border-rose-950 text-rose-300 text-[11px] overflow-x-auto leading-relaxed">
                                    {String(evt.attributes['exception.stacktrace'])}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-slate-500 text-sm">
              <p>No trace selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
