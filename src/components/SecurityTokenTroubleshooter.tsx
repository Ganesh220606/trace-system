import React, { useState } from 'react';
import { ShieldAlert, Trash2, Key, CheckCircle, AlertTriangle, ExternalLink, HelpCircle, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import { OTelConfig } from '../types/telemetry';

interface SecurityTokenTroubleshooterProps {
  config: OTelConfig;
  onUpdateConfig: (updated: Partial<OTelConfig>) => void;
}

export const SecurityTokenTroubleshooter: React.FC<SecurityTokenTroubleshooterProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [activeGuide, setActiveGuide] = useState<'revocation' | '404error' | 'venv' | 'grafanastack'>('revocation');
  const [tokenStatus, setTokenStatus] = useState<'exposed' | 'deleted' | 'recreated'>('exposed');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTokenName, setNewTokenName] = useState('cloud-observability-token-v2');
  const [scopes, setScopes] = useState({
    metrics: true,
    logs: true,
    traces: true,
  });

  const handleDeleteToken = () => {
    setShowDeleteConfirm(false);
    setTokenStatus('deleted');
  };

  const handleCreateNewToken = () => {
    const randomHex = Math.random().toString(16).substring(2, 10);
    const newId = `c0d4f672-${randomHex}-455f-a698-f83c7de39227`;
    onUpdateConfig({
      tokenName: newTokenName,
      tokenId: newId,
    });
    setTokenStatus('recreated');
  };

  return (
    <div className="space-y-6">
      {/* Security Alert Header */}
      <div className={`p-5 rounded-lg border transition-all ${
        tokenStatus === 'exposed'
          ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
          : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded mt-0.5 ${
              tokenStatus === 'exposed' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {tokenStatus === 'exposed' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                <span>Security Diagnostic</span>
                <span aria-hidden="true">·</span>
                <span>Grafana Cloud Access Policies</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {tokenStatus === 'exposed'
                  ? 'Exposed Token Revocation & Replacement Workflow'
                  : tokenStatus === 'deleted'
                  ? 'Compromised Token Revoked — Ready for Replacement'
                  : 'New Secret Token Generated & Active'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {tokenStatus === 'exposed'
                  ? 'A screenshot exposed token "cloud-observability-token". Delete this token only (keep the parent Access Policy intact) and generate a replacement with metrics:write, logs:write, and traces:write.'
                  : 'Exposed credential has been revoked from Grafana Cloud. OpenTelemetry will safely use the newly authorized secret.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {tokenStatus === 'exposed' ? (
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded border border-amber-500/40">
                Action Required
              </span>
            ) : (
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded border border-emerald-500/40">
                Protected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Guide Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveGuide('revocation')}
          className={`px-3 py-1.5 font-medium rounded-t transition-colors cursor-pointer whitespace-nowrap ${
            activeGuide === 'revocation'
              ? 'bg-slate-800 text-orange-400 border-b-2 border-orange-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          1. Interactive Token Revocation UI
        </button>
        <button
          onClick={() => setActiveGuide('404error')}
          className={`px-3 py-1.5 font-medium rounded-t transition-colors cursor-pointer whitespace-nowrap ${
            activeGuide === '404error'
              ? 'bg-slate-800 text-orange-400 border-b-2 border-orange-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          2. "Resource Not Found" Fix
        </button>
        <button
          onClick={() => setActiveGuide('venv')}
          className={`px-3 py-1.5 font-medium rounded-t transition-colors cursor-pointer whitespace-nowrap ${
            activeGuide === 'venv'
              ? 'bg-slate-800 text-orange-400 border-b-2 border-orange-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          3. PowerShell '(venv)' Error Fix
        </button>
        <button
          onClick={() => setActiveGuide('grafanastack')}
          className={`px-3 py-1.5 font-medium rounded-t transition-colors cursor-pointer whitespace-nowrap ${
            activeGuide === 'grafanastack'
              ? 'bg-slate-800 text-orange-400 border-b-2 border-orange-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          4. Docs vs Actual Stack URL
        </button>
      </div>

      {/* Tab 1: Interactive Token Revocation Simulator */}
      {activeGuide === 'revocation' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Grafana Cloud Portal: Security → Access Policies
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Policy: <span className="text-orange-400">{config.policyName}</span>
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Instance: stack-1904168
              </span>
            </div>

            {/* Simulated Grafana Cloud Access Policy Box */}
            <div className="mt-4 border border-slate-800 rounded bg-slate-950 p-4 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-200">Access Policy Tokens</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  DO NOT delete the policy — only delete the exposed token
                </span>
              </div>

              {tokenStatus === 'exposed' && (
                <div className="p-3 rounded border border-amber-900/60 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-xs font-mono font-bold text-white">
                        {config.tokenName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Exposed in screenshot
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 flex flex-wrap gap-x-4">
                      <span>ID: <code className="text-slate-300">{config.tokenId}</code></span>
                      <span>Created: 6 hours ago</span>
                      <span>Last used: Never</span>
                      <span>Expiration: Never</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                      title="Delete this token only"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Token</span>
                    </button>
                  </div>
                </div>
              )}

              {tokenStatus === 'deleted' && (
                <div className="p-4 rounded border border-slate-800 bg-slate-900/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold font-mono">
                    <CheckCircle className="w-4 h-4" />
                    <span>Token "{config.tokenName}" successfully deleted from Access Policy</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    The exposed token cannot be used anymore. Now generate a replacement token with required OTLP write scopes.
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">Ready to issue new token?</span>
                    <button
                      onClick={() => setTokenStatus('exposed')}
                      className="text-xs text-slate-500 hover:text-slate-400 underline mr-2 cursor-pointer"
                    >
                      Reset simulation
                    </button>
                  </div>
                </div>
              )}

              {tokenStatus === 'recreated' && (
                <div className="p-3 rounded border border-emerald-900/60 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-mono font-bold text-white">
                        {config.tokenName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Active & Secure
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 flex flex-wrap gap-x-4">
                      <span>ID: <code className="text-slate-300">{config.tokenId}</code></span>
                      <span>Created: Just now</span>
                      <span>Scopes: metrics:write, logs:write, traces:write</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setTokenStatus('exposed')}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 rounded bg-slate-900 cursor-pointer"
                    >
                      Reset Test
                    </button>
                  </div>
                </div>
              )}

              {/* Generator Form for Replacement */}
              {(tokenStatus === 'deleted' || tokenStatus === 'exposed') && (
                <div className="mt-4 p-4 border border-slate-800/80 rounded bg-slate-900/50 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-orange-400" />
                    <span>Create Replacement Token (Step 3 in Guide)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Token Name:
                      </label>
                      <input
                        type="text"
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-400 block mb-1">
                        Required Scopes (checked):
                      </label>
                      <div className="flex items-center gap-3 pt-1">
                        <label className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                          <input
                            type="checkbox"
                            checked={scopes.metrics}
                            onChange={(e) => setScopes({ ...scopes, metrics: e.target.checked })}
                            className="accent-orange-500"
                          />
                          metrics:write
                        </label>
                        <label className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                          <input
                            type="checkbox"
                            checked={scopes.logs}
                            onChange={(e) => setScopes({ ...scopes, logs: e.target.checked })}
                            className="accent-orange-500"
                          />
                          logs:write
                        </label>
                        <label className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                          <input
                            type="checkbox"
                            checked={scopes.traces}
                            onChange={(e) => setScopes({ ...scopes, traces: e.target.checked })}
                            className="accent-orange-500"
                          />
                          traces:write
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleCreateNewToken}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                    >
                      Generate New Secret Token
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-3 text-rose-400">
                  <div className="p-2 rounded bg-rose-500/20">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Delete Token Only?</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to delete token <strong className="text-white font-mono">{config.tokenName}</strong>?
                </p>
                <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div>✓ This revokes the exposed token immediately.</div>
                  <div>✓ Your access policy <code className="text-orange-400">{config.policyName}</code> will NOT be deleted.</div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteToken}
                    className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Delete Token
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Resource Not Found Resolution */}
      {activeGuide === '404error' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3 text-rose-400 pb-3 border-b border-slate-800">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">
              Why did Grafana show "The requested resource was not found"?
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              In Grafana Cloud's Portal (under Access Policies), clicking directly into a token URL or refreshing when a token has not been used yet (<code className="text-slate-400">Last used: Never</code>) can trigger a client-side route miss:
            </p>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-rose-300">
              The requested resource was not found.
            </div>

            <h4 className="font-bold text-white pt-2 text-xs uppercase tracking-wider">
              Exact steps to resolve without getting stuck:
            </h4>

            <ol className="list-decimal pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Click the browser Back button once</strong>: This returns you to the main Access Policies table view.
              </li>
              <li>
                <strong>Do NOT click to open the token's detail page again</strong>.
              </li>
              <li>
                Instead, find the row for policy <code className="text-orange-400">stack-1904168-otel-cloud-observability-token</code> and expand it.
              </li>
              <li>
                Locate the token named <code className="text-orange-400">cloud-observability-token</code>.
              </li>
              <li>
                Look at the far right of the row: click the <strong>Trash/Bin icon</strong> directly on that row.
              </li>
              <li>
                Confirm deletion in the popup. The token is deleted without needing to open the broken subpage.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Tab 3: PowerShell (venv) Error Fix */}
      {activeGuide === 'venv' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3 text-sky-400 pb-3 border-b border-slate-800">
            <HelpCircle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">
              Understanding the "(venv)" Terminal Error in PowerShell
            </h3>
          </div>

          <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-rose-300 space-y-1">
            <div className="text-slate-500">(venv) PS C:\Users\GANESH KUMAR\OneDrive\Desktop\cloud-observability-system&gt; (venv)</div>
            <div className="text-rose-400 font-bold">
              venv : The term 'venv' is not recognized as the name of a cmdlet, function, script file, or operable program.
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <h4 className="font-bold text-white text-xs">What happened:</h4>
            <p>
              When Python's virtual environment is active in PowerShell, it prints <code className="text-emerald-400">(venv)</code> at the start of your prompt line.
              It is an indicator that your environment is ready — it is <strong>not</strong> a command to execute.
            </p>

            <h4 className="font-bold text-white text-xs">What to do next:</h4>
            <p>
              Do not type <code className="text-slate-400">(venv)</code>. Run your environment variable commands directly:
            </p>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-emerald-300 space-y-1">
              <div>$env:OTEL_SERVICE_NAME="cloud-observability-system"</div>
              <div>$env:OTEL_EXPORTER_OTLP_ENDPOINT="https://your-grafana-endpoint/otlp"</div>
              <div>$env:OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"</div>
              <div>$env:OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic ..."</div>
              <div>python app.py</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Docs vs Actual Stack URL */}
      {activeGuide === 'grafanastack' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3 text-orange-400 pb-3 border-b border-slate-800">
            <ExternalLink className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">
              Grafana Documentation vs Your Actual Grafana Stack
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded space-y-2">
              <span className="text-rose-400 font-bold text-xs uppercase tracking-wider block">
                ❌ WRONG WEBSITE: Documentation Only
              </span>
              <p className="text-slate-300">
                <code className="text-rose-300">https://grafana.com/docs/...</code>
              </p>
              <p className="text-slate-400 text-[11px]">
                This is a public handbook. You cannot view your application's live traces or manage your credentials here.
              </p>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded space-y-2">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider block">
                ✅ CORRECT PORTAL: Your Live Grafana Stack
              </span>
              <p className="text-slate-300">
                <code className="text-emerald-300">https://your-stack-name.grafana.net</code>
              </p>
              <p className="text-slate-400 text-[11px]">
                Log in here → Click <strong>Explore</strong> in the left sidebar → Select <strong>Tempo</strong> for traces or <strong>Prometheus</strong> for metrics!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
