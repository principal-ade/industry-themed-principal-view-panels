/**
 * OpenTelemetry OTLP/JSON type definitions
 *
 * Based on: https://opentelemetry.io/docs/specs/otlp/
 */

export interface OtelResourceSpans {
  resourceSpans: OtelResourceSpan[];
}

export interface OtelResourceSpan {
  resource: OtelResource;
  scopeSpans: OtelScopeSpan[];
}

export interface OtelResource {
  attributes: OtelAttribute[];
}

export interface OtelScopeSpan {
  scope: {
    name: string;
    version?: string;
  };
  spans: OtelSpan[];
}

export interface OtelSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind?: OtelSpanKind;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes?: OtelAttribute[];
  events?: OtelSpanEvent[];
  status?: {
    code?: 'STATUS_CODE_UNSET' | 'STATUS_CODE_OK' | 'STATUS_CODE_ERROR';
    message?: string;
  };
}

export interface OtelAttribute {
  key: string;
  value: {
    stringValue?: string;
    intValue?: number;
    doubleValue?: number;
    boolValue?: boolean;
    arrayValue?: { values: OtelAttributeValue[] };
    kvlistValue?: { values: OtelAttribute[] };
  };
}

export type OtelAttributeValue = OtelAttribute['value'];

export interface OtelSpanEvent {
  timeUnixNano: string;
  name: string;
  attributes?: OtelAttribute[];
}

export type OtelSpanKind =
  | 'SPAN_KIND_UNSPECIFIED'
  | 'SPAN_KIND_INTERNAL'
  | 'SPAN_KIND_SERVER'
  | 'SPAN_KIND_CLIENT'
  | 'SPAN_KIND_PRODUCER'
  | 'SPAN_KIND_CONSUMER';

/**
 * Helper functions
 */

export function getAttributeStringValue(attr: OtelAttribute): string | undefined {
  return attr.value.stringValue;
}

export function getAttributeValue(
  attributes: OtelAttribute[] | undefined,
  key: string
): string | number | boolean | undefined {
  const attr = attributes?.find(a => a.key === key);
  if (!attr) return undefined;

  return (
    attr.value.stringValue ??
    attr.value.intValue ??
    attr.value.doubleValue ??
    attr.value.boolValue
  );
}

export function flattenResourceAttributes(resource: OtelResource): Record<string, string> {
  const result: Record<string, string> = {};

  for (const attr of resource.attributes) {
    const value = getAttributeStringValue(attr);
    if (value !== undefined) {
      result[attr.key] = value;
    }
  }

  return result;
}

export function parseNanoTime(nanos: string): number {
  return parseInt(nanos, 10) / 1_000_000;
}

export function getSpanDuration(span: OtelSpan): number {
  const start = parseInt(span.startTimeUnixNano, 10);
  const end = parseInt(span.endTimeUnixNano, 10);
  return (end - start) / 1_000_000; // milliseconds
}

export function getServiceName(resource: OtelResource): string | undefined {
  const attr = resource.attributes.find(a => a.key === 'service.name');
  return attr?.value.stringValue;
}

/**
 * Trace-level aggregations
 */

export interface TraceInfo {
  traceId: string;
  spans: OtelSpan[];
  rootSpan: OtelSpan | undefined;
  serviceName: string | undefined;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  duration: number; // milliseconds
  spanCount: number;
  hasErrors: boolean;
  resource: OtelResource;
  matchedWorkflow?: {
    storyboardId: string;
    storyboardName: string;
    workflowId?: string;
    workflowName?: string;
    scenarioId?: string;
    scenarioName?: string;
    matchedNodeIds?: string[];
  };
}

/**
 * Group spans by trace ID and compute trace-level information
 */
export function groupSpansByTrace(
  resourceSpans: OtelResourceSpans
): TraceInfo[] {
  const traceMap = new Map<string, { spans: OtelSpan[]; resource: OtelResource }>();

  // Collect all spans by trace ID
  for (const resourceSpan of resourceSpans.resourceSpans) {
    for (const scopeSpan of resourceSpan.scopeSpans) {
      for (const span of scopeSpan.spans) {
        if (!traceMap.has(span.traceId)) {
          traceMap.set(span.traceId, {
            spans: [],
            resource: resourceSpan.resource,
          });
        }
        traceMap.get(span.traceId)!.spans.push(span);
      }
    }
  }

  // Convert to TraceInfo array
  const traces: TraceInfo[] = [];
  for (const [traceId, { spans, resource }] of traceMap) {
    const rootSpan = spans.find(s => !s.parentSpanId || s.parentSpanId === '');
    const startTime = Math.min(...spans.map(s => parseNanoTime(s.startTimeUnixNano)));
    const endTime = Math.max(...spans.map(s => parseNanoTime(s.endTimeUnixNano)));
    const hasErrors = spans.some(
      s => s.status?.code === 'STATUS_CODE_ERROR' || s.events?.some(e => e.name === 'exception')
    );

    // Extract workflow matching information from resource attributes
    const storyboardId = getAttributeValue(resource.attributes, 'pv.storyboard.id') as string | undefined;
    const storyboardName = getAttributeValue(resource.attributes, 'pv.storyboard.name') as string | undefined;
    const workflowId = getAttributeValue(resource.attributes, 'pv.workflow.id') as string | undefined;
    const workflowName = getAttributeValue(resource.attributes, 'pv.workflow.name') as string | undefined;
    const scenarioId = getAttributeValue(resource.attributes, 'pv.scenario.id') as string | undefined;
    const scenarioName = getAttributeValue(resource.attributes, 'pv.scenario.name') as string | undefined;

    const matchedWorkflow = storyboardId && storyboardName ? {
      storyboardId,
      storyboardName,
      workflowId,
      workflowName,
      scenarioId,
      scenarioName,
    } : undefined;

    traces.push({
      traceId,
      spans,
      rootSpan,
      serviceName: getServiceName(resource),
      startTime,
      endTime,
      duration: endTime - startTime,
      spanCount: spans.length,
      hasErrors,
      resource,
      matchedWorkflow,
    });
  }

  // Sort by start time (most recent first)
  traces.sort((a, b) => b.startTime - a.startTime);

  return traces;
}
