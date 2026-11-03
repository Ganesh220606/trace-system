/**
 * Telemetry Simulation Engine for cloud-observability-system
 * Generates OpenTelemetry-compliant traces, spans, Prometheus metrics, and Loki logs.
 */
import { TraceRecord, Span, LokiLogEntry, TelemetryMetricPoint } from '../types/telemetry';

export const ENDPOINTS = [
  {
    path: '/',
    name: 'Home request',
    description: 'Root service greeting & API catalog',
    method: 'GET' as const,
    expectedStatus: 200,
    purpose: 'Basic service reachability test',
  },
  {
    path: '/health',
    name: 'Health check',
    description: 'Service liveness and readiness probe',
    method: 'GET' as const,
    expectedStatus: 200,
    purpose: 'Kubernetes / load-balancer monitoring',
  },
  {
    path: '/work',
    name: 'Response-time test',
    description: 'Simulated CPU-intensive payload processing with sub-spans',
    method: 'GET' as const,
    expectedStatus: 200,
    purpose: 'Latency profiling & child span verification in Tempo',
  },
  {
    path: '/error',
    name: 'Error test',
    description: 'Simulates uncaught ZeroDivisionError with full Python traceback',
    method: 'GET' as const,
    expectedStatus: 500,
    purpose: 'Error rate tracking & span exception event verification',
  },
  {
    path: '/system',
    name: 'CPU & memory readings',
    description: 'Host telemetry via psutil (CPU %, RSS Memory, threads)',
    method: 'GET' as const,
    expectedStatus: 200,
    purpose: 'Resource utilization metrics in Prometheus',
  },
];

function randomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateTraceId(): string {
  return randomHex(32);
}

export function generateSpanId(): string {
  return randomHex(16);
}

export interface EndpointExecutionResult {
  trace: TraceRecord;
  log: LokiLogEntry;
  responsePayload: Record<string, unknown>;
  statusCode: number;
  durationMs: number;
}

export function executeEndpointSimulation(
  path: string,
  serviceName: string = 'cloud-observability-system'
): EndpointExecutionResult {
  const traceId = generateTraceId();
  const rootSpanId = generateSpanId();
  const now = new Date();
  const timestampIso = now.toISOString();
  const timestampMs = now.getTime();

  let statusCode = 200;
  let durationMs = 15;
  let hasError = false;
  let errorMessage: string | undefined;
  let errorTraceback: string | undefined;
  let responsePayload: Record<string, unknown> = {};
  const spans: Span[] = [];

  if (path === '/') {
    durationMs = Math.floor(12 + Math.random() * 15);
    responsePayload = {
      service: serviceName,
      status: 'online',
      message: 'Cloud Observability System Flask Backend',
      version: '1.2.0',
      routes: ['/', '/health', '/work', '/error', '/system'],
      telemetry: {
        sdk: 'opentelemetry-python-1.24.0',
        exporter: 'otlp-http-protobuf',
        service_name: serviceName,
      },
      timestamp: timestampIso,
    };

    spans.push({
      spanId: rootSpanId,
      name: 'GET /',
      serviceName,
      startTimeOffsetMs: 0,
      durationMs,
      statusCode: 'OK',
      attributes: {
        'http.method': 'GET',
        'http.target': '/',
        'http.status_code': 200,
        'http.scheme': 'http',
        'net.host.name': '127.0.0.1',
        'net.host.port': 5000,
        'service.name': serviceName,
        'telemetry.sdk.language': 'python',
        'telemetry.sdk.name': 'opentelemetry',
      },
      events: [
        {
          name: 'request.received',
          timestampMs: timestampMs,
          attributes: { 'client.ip': '127.0.0.1' },
        },
      ],
    });
  } else if (path === '/health') {
    durationMs = Math.floor(6 + Math.random() * 12);
    responsePayload = {
      status: 'healthy',
      service: serviceName,
      uptime_seconds: 4820,
      checks: {
        database_pool: 'UP',
        redis_cache: 'UP',
        otlp_exporter: 'CONNECTED',
      },
      timestamp: timestampIso,
    };

    spans.push({
      spanId: rootSpanId,
      name: 'GET /health',
      serviceName,
      startTimeOffsetMs: 0,
      durationMs,
      statusCode: 'OK',
      attributes: {
        'http.method': 'GET',
        'http.target': '/health',
        'http.status_code': 200,
        'service.name': serviceName,
        'telemetry.sdk.language': 'python',
      },
      events: [],
    });
  } else if (path === '/work') {
    // Multi-span workload
    const step1Duration = Math.floor(18 + Math.random() * 25);
    const step2Duration = Math.floor(45 + Math.random() * 70);
    const step3Duration = Math.floor(30 + Math.random() * 45);
    const step4Duration = Math.floor(10 + Math.random() * 15);
    durationMs = step1Duration + step2Duration + step3Duration + step4Duration;

    const itemsProcessed = Math.floor(500 + Math.random() * 1500);
    const workloadHash = randomHex(16);

    responsePayload = {
      status: 'completed',
      workload_type: 'data_crunching_and_synthesis',
      items_processed: itemsProcessed,
      result_hash: workloadHash,
      execution_latency_ms: durationMs,
      timestamp: timestampIso,
    };

    const span1Id = generateSpanId();
    const span2Id = generateSpanId();
    const span3Id = generateSpanId();

    spans.push(
      {
        spanId: rootSpanId,
        name: 'GET /work',
        serviceName,
        startTimeOffsetMs: 0,
        durationMs,
        statusCode: 'OK',
        attributes: {
          'http.method': 'GET',
          'http.target': '/work',
          'http.status_code': 200,
          'service.name': serviceName,
          'workload.items_count': itemsProcessed,
        },
        events: [
          {
            name: 'work.started',
            timestampMs,
          },
        ],
      },
      {
        spanId: span1Id,
        parentSpanId: rootSpanId,
        name: 'auth.verify_session',
        serviceName,
        startTimeOffsetMs: 4,
        durationMs: step1Duration,
        statusCode: 'OK',
        attributes: {
          'auth.type': 'bearer',
          'auth.valid': true,
        },
        events: [],
      },
      {
        spanId: span2Id,
        parentSpanId: rootSpanId,
        name: 'db.query_batch_records',
        serviceName,
        startTimeOffsetMs: 4 + step1Duration,
        durationMs: step2Duration,
        statusCode: 'OK',
        attributes: {
          'db.system': 'postgresql',
          'db.statement': 'SELECT * FROM records WHERE status = "pending" LIMIT 1000',
          'db.rows_returned': itemsProcessed,
        },
        events: [],
      },
      {
        spanId: span3Id,
        parentSpanId: rootSpanId,
        name: 'crypto.hash_records',
        serviceName,
        startTimeOffsetMs: 4 + step1Duration + step2Duration,
        durationMs: step3Duration,
        statusCode: 'OK',
        attributes: {
          'crypto.algorithm': 'SHA-256',
          'crypto.output_hash': workloadHash,
        },
        events: [],
      }
    );
  } else if (path === '/error') {
    durationMs = Math.floor(22 + Math.random() * 20);
    statusCode = 500;
    hasError = true;
    errorMessage = 'ZeroDivisionError: division by zero';
    errorTraceback = `Traceback (most recent call last):
  File "app.py", line 64, in handle_error
    result = compute_risk_quotient(total_records=100, active_workers=0)
  File "app.py", line 78, in compute_risk_quotient
    quotient = total_records / active_workers
ZeroDivisionError: division by zero`;

    responsePayload = {
      error: 'Internal Server Error',
      exception: 'ZeroDivisionError',
      detail: 'division by zero in compute_risk_quotient()',
      code: 500,
      trace_id: traceId,
      timestamp: timestampIso,
    };

    const errorSpanId = generateSpanId();

    spans.push(
      {
        spanId: rootSpanId,
        name: 'GET /error',
        serviceName,
        startTimeOffsetMs: 0,
        durationMs,
        statusCode: 'ERROR',
        attributes: {
          'http.method': 'GET',
          'http.target': '/error',
          'http.status_code': 500,
          'service.name': serviceName,
          'otel.status_code': 'ERROR',
          'otel.status_description': errorMessage,
        },
        events: [
          {
            name: 'exception',
            timestampMs: timestampMs + durationMs - 5,
            attributes: {
              'exception.type': 'ZeroDivisionError',
              'exception.message': 'division by zero',
              'exception.stacktrace': errorTraceback,
              'exception.escaped': false,
            },
          },
        ],
      },
      {
        spanId: errorSpanId,
        parentSpanId: rootSpanId,
        name: 'compute_risk_quotient',
        serviceName,
        startTimeOffsetMs: 8,
        durationMs: durationMs - 8,
        statusCode: 'ERROR',
        attributes: {
          'function.name': 'compute_risk_quotient',
          'function.file': 'app.py',
          'function.line': 78,
        },
        events: [
          {
            name: 'exception',
            timestampMs: timestampMs + durationMs - 5,
            attributes: {
              'exception.type': 'ZeroDivisionError',
              'exception.message': 'division by zero',
            },
          },
        ],
      }
    );
  } else if (path === '/system') {
    durationMs = Math.floor(15 + Math.random() * 18);
    const cpuVal = (18 + Math.random() * 26).toFixed(1);
    const memoryMbVal = (138 + Math.random() * 18).toFixed(1);

    responsePayload = {
      system_telemetry: {
        cpu_percent: parseFloat(cpuVal),
        memory_used_mb: parseFloat(memoryMbVal),
        memory_total_mb: 16384.0,
        memory_percent: 48.2,
        active_threads: 14,
        python_version: '3.11.8',
        host_platform: 'Windows 11 (PowerShell v7.4)',
        process_pid: 24816,
      },
      timestamp: timestampIso,
    };

    spans.push({
      spanId: rootSpanId,
      name: 'GET /system',
      serviceName,
      startTimeOffsetMs: 0,
      durationMs,
      statusCode: 'OK',
      attributes: {
        'http.method': 'GET',
        'http.target': '/system',
        'http.status_code': 200,
        'service.name': serviceName,
        'system.cpu.percent': parseFloat(cpuVal),
        'system.memory.used_mb': parseFloat(memoryMbVal),
      },
      events: [],
    });
  }

  const trace: TraceRecord = {
    traceId,
    rootEndpoint: path,
    method: 'GET',
    httpStatus: statusCode,
    timestamp: timestampIso,
    timestampMs,
    durationMs,
    spans,
    hasError,
    errorMessage,
    errorTraceback,
  };

  const logLevel = hasError ? 'ERROR' : path === '/system' ? 'DEBUG' : 'INFO';
  const logMessage = hasError
    ? `Failed GET ${path}: ZeroDivisionError: division by zero in app.py:78`
    : `Handled GET ${path} with status ${statusCode} in ${durationMs}ms`;

  const log: LokiLogEntry = {
    id: randomHex(12),
    timestamp: timestampIso,
    level: logLevel,
    message: logMessage,
    service: serviceName,
    traceId,
    spanId: rootSpanId,
    endpoint: path,
    statusCode,
    durationMs,
  };

  return {
    trace,
    log,
    responsePayload,
    statusCode,
    durationMs,
  };
}

export function generateInitialHistory(count = 12): {
  traces: TraceRecord[];
  logs: LokiLogEntry[];
  metrics: TelemetryMetricPoint[];
} {
  const traces: TraceRecord[] = [];
  const logs: LokiLogEntry[] = [];
  const endpoints = ['/', '/health', '/work', '/system', '/work', '/health', '/error', '/'];

  for (let i = 0; i < count; i++) {
    const ep = endpoints[i % endpoints.length];
    const res = executeEndpointSimulation(ep);
    // Artificially space timestamps back in time
    const offsetMs = (count - i) * 3500;
    const oldTime = new Date(Date.now() - offsetMs);
    res.trace.timestamp = oldTime.toISOString();
    res.trace.timestampMs = oldTime.getTime();
    res.log.timestamp = oldTime.toISOString();
    traces.push(res.trace);
    logs.push(res.log);
  }

  const metrics: TelemetryMetricPoint[] = [];
  const now = Date.now();
  for (let i = 20; i >= 0; i--) {
    const t = new Date(now - i * 3000);
    const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const hasErr = i % 7 === 0;
    metrics.push({
      time: timeStr,
      timestamp: t.getTime(),
      requestRate: Number((1.8 + Math.random() * 2.4).toFixed(1)),
      latencyP50: Math.floor(18 + Math.random() * 15),
      latencyP95: Math.floor(110 + Math.random() * 45),
      latencyP99: Math.floor(180 + Math.random() * 70),
      errorRate: hasErr ? 12.5 : 0,
      cpuPercent: Number((22 + Math.random() * 18).toFixed(1)),
      memoryMb: Number((140 + Math.random() * 15).toFixed(1)),
      successCount: 14 + Math.floor(Math.random() * 6),
      errorCount: hasErr ? 2 : 0,
    });
  }

  return { traces, logs, metrics };
}
