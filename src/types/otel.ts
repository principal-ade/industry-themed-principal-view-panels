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
} from '@principal-ai/principal-view-core';

/**
 * Panel-specific TraceInfo type
 *
 * This is different from core's TraceInfo - it includes the full spans array
 * for display purposes in the panels UI.
 */
export interface TraceInfo {
  traceId: string;
  spans: OtelSpanData[];
  rootSpan: OtelSpanData | undefined;
  serviceName: string | undefined;
  serviceVersion: string | undefined;
  repositoryUrl: string | undefined;
  commitSha: string | undefined;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  duration: number; // milliseconds
  spanCount: number;
  hasErrors: boolean;
  resource: OtelResourceData;
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
 * Helper to get service name from resource
 */
export function getServiceName(resource: OtelResourceData): string | undefined {
  const attr = resource.attributes.find(a => a.key === 'service.name');
  return attr?.value.stringValue;
}

/**
 * Group spans by trace ID and compute trace-level information
 *
 * This returns the panel-specific TraceInfo type with full span data.
 */
export function groupSpansByTrace(
  resourceSpans: { resourceSpans: OtelResourceSpansData[] }
): TraceInfo[] {
  const traceMap = new Map<string, { spans: OtelSpanData[]; resource: OtelResourceData }>();

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
      s => s.status?.code === 2 || s.events?.some(e => e.name === 'exception')
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

    // Extract version information from resource attributes
    const serviceVersion = getAttributeValue(resource.attributes, 'service.version') as string | undefined;
    const repositoryUrl = getAttributeValue(resource.attributes, 'service.repository.url') as string | undefined;
    const commitSha = getAttributeValue(resource.attributes, 'service.commit.sha') as string | undefined;

    traces.push({
      traceId,
      spans,
      rootSpan,
      serviceName: getServiceName(resource),
      serviceVersion,
      repositoryUrl,
      commitSha,
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
