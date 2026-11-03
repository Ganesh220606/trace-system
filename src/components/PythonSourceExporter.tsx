import React, { useState } from 'react';
import { Copy, Check, FileCode, Download, ExternalLink, Terminal } from 'lucide-react';

export const PythonSourceExporter: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'app' | 'requirements' | 'script'>('app');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const APP_PY_CODE = `"""
Cloud Observability System - Flask Backend with OpenTelemetry Instrumentation
Endpoints:
  GET /        - Home / Root API reachability
  GET /health  - Health check & probe
  GET /work    - Response-time test with custom sub-spans
  GET /error   - Error test (ZeroDivisionError exception tracing)
  GET /system  - CPU and memory readings via psutil
"""

import os
import time
import psutil
from flask import Flask, jsonify, request

# OpenTelemetry imports
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME

# 1. Initialize OpenTelemetry Provider
service_name = os.getenv("OTEL_SERVICE_NAME", "cloud-observability-system")
resource = Resource(attributes={SERVICE_NAME: service_name})
provider = TracerProvider(resource=resource)

# 2. Configure OTLP HTTP Exporter (Grafana Cloud Tempo)
# Reads endpoint & headers automatically from $env:OTEL_EXPORTER_OTLP_ENDPOINT and $env:OTEL_EXPORTER_OTLP_HEADERS
otlp_exporter = OTLPSpanExporter()
span_processor = BatchSpanProcessor(otlp_exporter)
provider.add_span_processor(span_processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer(__name__)

# 3. Create Flask Application & Instrument
app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)

@app.route("/")
def index():
    """Home request endpoint"""
    return jsonify({
        "service": service_name,
        "status": "running",
        "endpoints": ["/", "/health", "/work", "/error", "/system"],
        "message": "Welcome to Cloud Observability System"
    })

@app.route("/health")
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": service_name,
        "timestamp": time.time()
    }), 200

@app.route("/work")
def work():
    """Response-time test with nested child spans for Tempo profiling"""
    with tracer.start_as_current_span("work.preprocess") as span:
        span.set_attribute("work.stage", "init")
        time.sleep(0.04)

    with tracer.start_as_current_span("work.db_query_simulation") as span:
        span.set_attribute("db.system", "postgresql")
        span.set_attribute("db.statement", "SELECT * FROM records LIMIT 100")
        time.sleep(0.08)

    with tracer.start_as_current_span("work.computation") as span:
        span.set_attribute("crypto.algorithm", "SHA-256")
        time.sleep(0.03)

    return jsonify({
        "status": "completed",
        "workload": "simulated_processing",
        "duration_sec": 0.15
    }), 200

@app.route("/error")
def trigger_error():
    """Error test endpoint: Simulates an uncaught ZeroDivisionError"""
    total_records = 100
    active_workers = 0
    # This intentionally causes a ZeroDivisionError for trace & error alerting
    result = total_records / active_workers
    return jsonify({"result": result})

@app.route("/system")
def system_metrics():
    """CPU and memory readings endpoint via psutil"""
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()

    return jsonify({
        "cpu_percent": cpu_percent,
        "memory_used_mb": round(memory.used / (1024 * 1024), 2),
        "memory_total_mb": round(memory.total / (1024 * 1024), 2),
        "memory_percent": memory.percent
    }), 200

if __name__ == "__main__":
    print(f"[*] Starting {service_name} on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=False)
`;

  const REQUIREMENTS_TXT = `flask==3.0.2
opentelemetry-api==1.24.0
opentelemetry-sdk==1.24.0
opentelemetry-instrumentation-flask==0.45b0
opentelemetry-exporter-otlp-proto-http==1.24.0
psutil==5.9.8
`;

  const RUN_PS1_SCRIPT = `# PowerShell launcher for Cloud Observability System
# 1. Ensure virtualenv is active:
#    .\\venv\\Scripts\\Activate.ps1

# 2. Set OpenTelemetry variables
$env:OTEL_SERVICE_NAME="cloud-observability-system"
$env:OTEL_EXPORTER_OTLP_ENDPOINT="https://your-grafana-otlp-endpoint/otlp"
$env:OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
$env:OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic YOUR_ACTUAL_AUTHORIZATION_HEADER"

# 3. Verify configuration
echo $env:OTEL_SERVICE_NAME
echo $env:OTEL_EXPORTER_OTLP_ENDPOINT

# 4. Start Flask application
python app.py
`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getCode = () => {
    switch (activeFile) {
      case 'app':
        return APP_PY_CODE;
      case 'requirements':
        return REQUIREMENTS_TXT;
      case 'script':
        return RUN_PS1_SCRIPT;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-orange-400">Production Code</span>
              <span aria-hidden="true">·</span>
              <span>Python 3.x + OpenTelemetry Flask</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Complete Python Application Source
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Direct implementation of <code className="text-slate-200">app.py</code> with all 5 endpoints, error handler, and OTLP exporters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(getCode(), activeFile)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
            >
              {copiedKey === activeFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-2 mt-4 text-xs font-mono">
          <button
            onClick={() => setActiveFile('app')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${
              activeFile === 'app'
                ? 'bg-slate-800 text-orange-400 font-bold border border-orange-500/40'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            app.py (Flask + OTel)
          </button>
          <button
            onClick={() => setActiveFile('requirements')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${
              activeFile === 'requirements'
                ? 'bg-slate-800 text-orange-400 font-bold border border-orange-500/40'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            requirements.txt
          </button>
          <button
            onClick={() => setActiveFile('script')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${
              activeFile === 'script'
                ? 'bg-slate-800 text-orange-400 font-bold border border-orange-500/40'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
            }`}
          >
            run.ps1 (PowerShell)
          </button>
        </div>
      </div>

      {/* Code Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-850 text-slate-400">
          <span className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-orange-400" />
            <span className="font-semibold text-slate-300">
              {activeFile === 'app'
                ? 'app.py'
                : activeFile === 'requirements'
                ? 'requirements.txt'
                : 'run.ps1'}
            </span>
          </span>
          <span className="text-[11px] text-slate-500">
            {activeFile === 'app' ? 'Python 3.11+' : 'UTF-8 text'}
          </span>
        </div>

        <pre className="text-slate-200 overflow-x-auto leading-relaxed select-all max-h-[640px]">
          {getCode()}
        </pre>
      </div>
    </div>
  );
};
