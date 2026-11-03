import React, { useState } from 'react';
import { Copy, Check, Terminal, Shield, RefreshCw, Key, ExternalLink, AlertCircle } from 'lucide-react';
import { OTelConfig } from '../types/telemetry';

interface OTelConfigWizardProps {
  config: OTelConfig;
  onUpdateConfig: (updated: Partial<OTelConfig>) => void;
}

export const OTelConfigWizard: React.FC<OTelConfigWizardProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [shellType, setShellType] = useState<'powershell' | 'bash' | 'dotenv'>('powershell');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string>('1904168');
  const [apiToken, setApiToken] = useState<string>('glc_eyJvIjoi...');
  const [encodedBasicAuth, setEncodedBasicAuth] = useState<string>('Basic MTkwNDE2ODpnbGNfZXlKdklqb2kuLi4=');
  const [verifiedOutput, setVerifiedOutput] = useState<{ service: boolean; endpoint: boolean } | null>(null);

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleGenerateAuthHeader = () => {
    try {
      const combined = `${instanceId.trim()}:${apiToken.trim()}`;
      const encoded = btoa(combined);
      const authHeaderVal = `Authorization=Basic ${encoded}`;
      setEncodedBasicAuth(`Basic ${encoded}`);
      onUpdateConfig({ authorizationHeader: authHeaderVal });
    } catch {
      // fallback
    }
  };

  const generatePowerShellScript = () => {
    return `# Step 9.2: Set OpenTelemetry Environment Variables in Windows PowerShell
$env:OTEL_SERVICE_NAME="${config.serviceName}"
$env:OTEL_EXPORTER_OTLP_ENDPOINT="${config.otlpEndpoint}"
$env:OTEL_EXPORTER_OTLP_PROTOCOL="${config.otlpProtocol}"
$env:OTEL_EXPORTER_OTLP_HEADERS="${config.authorizationHeader}"

# Step 9.3: Verify Grafana configuration
echo $env:OTEL_SERVICE_NAME
echo $env:OTEL_EXPORTER_OTLP_ENDPOINT`;
  };

  const generateBashScript = () => {
    return `# OpenTelemetry Environment Variables for Linux / macOS Bash
export OTEL_SERVICE_NAME="${config.serviceName}"
export OTEL_EXPORTER_OTLP_ENDPOINT="${config.otlpEndpoint}"
export OTEL_EXPORTER_OTLP_PROTOCOL="${config.otlpProtocol}"
export OTEL_EXPORTER_OTLP_HEADERS="${config.authorizationHeader}"

# Verify configuration
echo $OTEL_SERVICE_NAME
echo $OTEL_EXPORTER_OTLP_ENDPOINT`;
  };

  const generateDotEnv = () => {
    return `# .env file for local development
OTEL_SERVICE_NAME=${config.serviceName}
OTEL_EXPORTER_OTLP_ENDPOINT=${config.otlpEndpoint}
OTEL_EXPORTER_OTLP_PROTOCOL=${config.otlpProtocol}
OTEL_EXPORTER_OTLP_HEADERS=${config.authorizationHeader}`;
  };

  const getActiveCode = () => {
    switch (shellType) {
      case 'powershell':
        return generatePowerShellScript();
      case 'bash':
        return generateBashScript();
      case 'dotenv':
        return generateDotEnv();
    }
  };

  const handleSimulateVerification = () => {
    setVerifiedOutput({
      service: true,
      endpoint: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-orange-400">Step 9.2 & 9.3</span>
              <span aria-hidden="true">·</span>
              <span>OpenTelemetry OTLP Exporter Setup</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Environment Variables & Terminal Verification
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Configure OTLP exporters so Python automatically ships spans to Grafana Tempo and Prometheus.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(getActiveCode(), 'full-script')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold cursor-pointer transition-colors shrink-0 shadow-sm"
            >
              {copiedSection === 'full-script' ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Copy All Commands</span>
            </button>
          </div>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-slate-400 mr-2">Target Shell / Format:</span>
          <button
            onClick={() => setShellType('powershell')}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
              shellType === 'powershell'
                ? 'bg-slate-800 text-orange-400 font-bold border border-orange-500/40'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            Windows PowerShell ($env:)
          </button>
          <button
            onClick={() => setShellType('bash')}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
              shellType === 'bash'
                ? 'bg-slate-800 text-orange-400 font-bold border border-orange-500/40'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            Bash / Zsh (export)
          </button>
          <button
            onClick={() => setShellType('dotenv')}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
              shellType === 'dotenv'
                ? 'bg-slate-800 text-orange-400 font-bold border border-orange-500/40'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            .env Configuration
          </button>
        </div>
      </div>

      {/* Grid: Config Form & Terminal Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Config Variables */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              OpenTelemetry Parameters
            </h3>

            {/* Service Name */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                OTEL_SERVICE_NAME
              </label>
              <input
                type="text"
                value={config.serviceName}
                onChange={(e) => onUpdateConfig({ serviceName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Must match the service queried in Grafana Tempo Explorer
              </span>
            </div>

            {/* OTLP Endpoint */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                OTEL_EXPORTER_OTLP_ENDPOINT
              </label>
              <input
                type="text"
                value={config.otlpEndpoint}
                onChange={(e) => onUpdateConfig({ otlpEndpoint: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Your Grafana Cloud OTLP gateway URL (ending with <code className="text-slate-400">/otlp</code>)
              </span>
            </div>

            {/* Protocol */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                OTEL_EXPORTER_OTLP_PROTOCOL
              </label>
              <select
                value={config.otlpProtocol}
                onChange={(e) =>
                  onUpdateConfig({
                    otlpProtocol: e.target.value as 'http/protobuf' | 'http/json' | 'grpc',
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              >
                <option value="http/protobuf">http/protobuf (Recommended for Grafana)</option>
                <option value="http/json">http/json</option>
                <option value="grpc">grpc</option>
              </select>
            </div>

            {/* Basic Auth Encoder Helper */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Key className="w-3.5 h-3.5 text-orange-400" />
                <span>Authorization Header Builder</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Grafana Cloud OTLP requires HTTP Basic authentication formatted as{' '}
                <code className="text-slate-200">Basic base64(instance_id:api_token)</code>.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 font-mono block mb-1">
                    Instance ID:
                  </label>
                  <input
                    type="text"
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                    placeholder="e.g. 1904168"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-mono block mb-1">
                    Token (Keep Secret):
                  </label>
                  <input
                    type="password"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="glc_..."
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateAuthHeader}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                Encode & Update OTEL_EXPORTER_OTLP_HEADERS
              </button>
            </div>
          </div>
        </div>

        {/* Right Terminal & Shell Runner */}
        <div className="lg:col-span-7 space-y-4">
          {/* Terminal Script Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-850 text-slate-400">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-slate-300">
                  {shellType === 'powershell'
                    ? 'Windows PowerShell 7.x Console'
                    : shellType === 'bash'
                    ? 'Bash Shell Terminal'
                    : '.env configuration'}
                </span>
              </span>
              <button
                onClick={() => handleCopy(getActiveCode(), 'terminal-box')}
                className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-sans text-xs cursor-pointer"
              >
                {copiedSection === 'terminal-box' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-slate-300 overflow-x-auto leading-relaxed select-all">
              {getActiveCode()}
            </pre>
          </div>

          {/* Interactive Shell Verification Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Step 9.3 — Configuration Verification Test
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Simulate running <code className="text-slate-300">echo $env:...</code> to verify your environment values.
                </p>
              </div>

              <button
                onClick={handleSimulateVerification}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                <span>Run echo verification</span>
              </button>
            </div>

            {verifiedOutput ? (
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 font-mono text-xs">
                <div>
                  <div className="text-slate-500">PS C:\Users\GANESH KUMAR\OneDrive\Desktop\cloud-observability-system&gt; echo $env:OTEL_SERVICE_NAME</div>
                  <div className="text-emerald-400 font-semibold pl-2 flex items-center gap-1.5 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>{config.serviceName}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500">PS C:\Users\GANESH KUMAR\OneDrive\Desktop\cloud-observability-system&gt; echo $env:OTEL_EXPORTER_OTLP_ENDPOINT</div>
                  <div className="text-emerald-400 font-semibold pl-2 flex items-center gap-1.5 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>{config.otlpEndpoint}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-850 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>OTEL_EXPORTER_OTLP_HEADERS is correctly configured and hidden for security.</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950/60 rounded border border-slate-800/80 text-center text-xs text-slate-500 font-mono">
                Click 'Run echo verification' to inspect the simulated terminal response.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
