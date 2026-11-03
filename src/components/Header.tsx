import React from 'react';
import { Activity, ShieldAlert, Sun, Moon, Play, Pause } from 'lucide-react';

export type ActiveTab =
  | 'simulator'
  | 'traces'
  | 'metrics'
  | 'logs'
  | 'config'
  | 'security'
  | 'source';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isAutoTraffic: boolean;
  onToggleAutoTraffic: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  tracesCount: number;
  hasSecurityAlert: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isAutoTraffic,
  onToggleAutoTraffic,
  isDark,
  onToggleTheme,
  tracesCount,
  hasSecurityAlert,
}) => {
  const navItems: { id: ActiveTab; label: string; badge?: string }[] = [
    { id: 'simulator', label: 'Endpoints & Traffic' },
    { id: 'traces', label: 'Tempo Traces', badge: `${tracesCount}` },
    { id: 'metrics', label: 'Prometheus' },
    { id: 'logs', label: 'Loki Logs' },
    { id: 'config', label: 'OTel Config' },
    { id: 'security', label: 'Token Security', badge: hasSecurityAlert ? 'Action Required' : undefined },
    { id: 'source', label: 'app.py Source' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-orange-600 dark:bg-orange-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap block">
                Cloud Observability System
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">
                service: cloud-observability-system
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-line, clean text hover) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 text-xs font-semibold ${
                    isActive
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-sm ${
                        item.id === 'security'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action & Utility Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleAutoTraffic}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isAutoTraffic
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
              title={isAutoTraffic ? 'Pause auto-generated background traffic' : 'Start auto-generated test traffic'}
            >
              {isAutoTraffic ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-white" />
                  <span>Traffic: Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Start Traffic Gen</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-200 dark:border-slate-800 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
