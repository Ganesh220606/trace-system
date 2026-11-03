/**
 * Telemetry and Observability Type Definitions
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type SpanStatusCode = 'OK' | 'ERROR' | 'UNSET';

export interface SpanEvent {
  name: string;
  timestampMs: number;
  attributes?: Record<string, string | number | boolean>;
}

export interface Span {
  spanId: string;
  parentSpanId?: string;
  name: string;
  serviceName: string;
  startTimeOffsetMs: number;
  durationMs: number;
  statusCode: SpanStatusCode;
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
}

export interface TraceRecord {
  traceId: string;
  rootEndpoint: string;
  method: HttpMethod;
  httpStatus: number;
  timestamp: string;
  timestampMs: number;
  durationMs: number;
  spans: Span[];
  hasError: boolean;
  errorMessage?: string;
  errorTraceback?: string;
}

export interface EndpointDefinition {
  path: string;
  name: string;
  description: string;
  method: HttpMethod;
  expectedStatus: number;
  purpose: string;
}

export interface TelemetryMetricPoint {
  time: string;
  timestamp: number;
  requestRate: number; // req/sec
  latencyP50: number; // ms
  latencyP95: number; // ms
  latencyP99: number; // ms
  errorRate: number; // %
  cpuPercent: number; // %
  memoryMb: number; // MB RSS
  successCount: number;
  errorCount: number;
}

export interface LokiLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  service: string;
  traceId: string;
  spanId: string;
  endpoint: string;
  statusCode: number;
  durationMs: number;
}

export interface OTelConfig {
  serviceName: string;
  otlpEndpoint: string;
  otlpProtocol: 'http/protobuf' | 'http/json' | 'grpc';
  authorizationHeader: string;
  stackName: string;
  policyName: string;
  tokenName: string;
  tokenId: string;
}
