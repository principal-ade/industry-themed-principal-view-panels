/**
 * Panel-specific OTEL types and utilities
 *
 * Base OTEL types should be imported directly from @principal-ai/principal-view-core
 * This file ONLY contains panel-specific extensions.
 */

import {
  getAttributeValue,
  parseNanoTime,
  type OtelResourceSpansData,
  type OtelResourceData,
  type OtelSpanData,
  type WorkflowMatch,
  type RegisteredTrace,
} from '@principal-ai/principal-view-core';

// Re-export core types
export type { WorkflowMatch, RegisteredTrace };

/**
 * Helper to get service name from resource
 */
export function getServiceName(resource: OtelResourceData): string | undefined {
  const attr = resource.attributes.find(a => a.key === 'service.name');
  return attr?.value.stringValue;
}

/**
 * Extract all spans from a RegisteredTrace
 */
export function getSpansFromTrace(trace: RegisteredTrace): OtelSpanData[] {
  const spans: OtelSpanData[] = [];

  if (!trace.otlpData?.resourceSpans) {
    return spans;
  }

  for (const resourceSpan of trace.otlpData.resourceSpans) {
    for (const scopeSpan of resourceSpan.scopeSpans) {
      for (const span of scopeSpan.spans) {
        spans.push(span);
      }
    }
  }

  return spans;
}

/**
 * Get root span from a RegisteredTrace
 */
export function getRootSpan(trace: RegisteredTrace): OtelSpanData | undefined {
  const spans = getSpansFromTrace(trace);
  return spans.find(s => !s.parentSpanId || s.parentSpanId === '');
}

/**
 * Get resource from a RegisteredTrace
 */
export function getResource(trace: RegisteredTrace): OtelResourceData | undefined {
  return trace.otlpData?.resourceSpans?.[0]?.resource;
}
