import React, { useState } from 'react';
import { Search, Filter, Terminal, ArrowRight, Trash2, Pause, Play, Check, Copy } from 'lucide-react';
import { LokiLogEntry } from '../types/telemetry';

interface LokiLogStreamProps {
  logs: LokiLogEntry[];
  onSelectTrace: (traceId: string) => void;
  onClearLogs: () => void;
  serviceName: string;
}

export const LokiLogStream: React.FC<LokiLogStreamProps> = ({
  logs,
  onSelectTrace,
  onClearLogs,
  serviceName,
}) => {
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.traceId.toLowerCase().includes(q) ||
        log.endpoint.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold';
      case 'WARN':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'DEBUG':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Loki Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">
              Loki
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Grafana Cloud Explore</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-300">Loki Logs Stream</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                LogQL query: <code className="text-orange-400">{`{service="${serviceName}"}`}</code> with trace-to-log correlation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear Stream</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 text-xs">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search log messages, trace IDs, endpoints..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono text-xs"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-slate-400 whitespace-nowrap">Level:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
            >
              <option value="all">ALL Levels</option>
              <option value="INFO">INFO only</option>
              <option value="ERROR">ERROR only</option>
              <option value="DEBUG">DEBUG only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log Console Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-850 text-slate-400">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-orange-400" />
            <span className="font-semibold text-slate-300">Live Log Stream</span>
          </span>
          <span className="text-[11px] tabular-nums">
            Showing {filteredLogs.length} events
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-600">
            <p>No log entries found.</p>
            <p className="mt-1 text-slate-700">Trigger traffic in 'Endpoints & Traffic' to generate live records.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded border transition-colors ${
                  log.level === 'ERROR'
                    ? 'bg-rose-950/20 border-rose-900/40 hover:bg-rose-950/30'
                    : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${getLevelBadgeClass(
                        log.level
                      )}`}
                    >
                      {log.level}
                    </span>
                    <span className="text-slate-400 font-semibold">{log.endpoint}</span>
                    <span
                      className={`text-[11px] px-1 rounded ${
                        log.statusCode === 200 ? 'text-emerald-400' : 'text-rose-400 font-bold'
                      }`}
                    >
                      {log.statusCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500">trace_id:</span>
                    <span className="text-orange-300 truncate max-w-[120px] select-all">
                      {log.traceId.slice(0, 12)}...
                    </span>
                    <button
                      onClick={() => handleCopy(log.traceId, log.id)}
                      className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                      title="Copy Trace ID"
                    >
                      {copiedId === log.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => onSelectTrace(log.traceId)}
                      className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-sans text-xs font-semibold ml-2 cursor-pointer"
                    >
                      <span>Jump to Trace</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-slate-200 leading-relaxed break-words font-mono text-[12px]">
                  {log.message}
                </div>

                {log.level === 'ERROR' && (
                  <div className="mt-2 p-2 bg-slate-950 rounded border border-rose-950 text-rose-300 text-[11px]">
                    ZeroDivisionError: division by zero in /error route (app.py:78 in compute_risk_quotient)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
