/**
 * Workflow matching utilities for multi-workflow trace analysis
 *
 * @deprecated These utilities are deprecated in favor of registry-based matching in RegisteredTrace
 */

import { renderWorkflow, getAttributeValue } from '@principal-ai/principal-view-core';
import type { WorkflowTemplate, OtelEvent, OtelSpanData, OtelKeyValue, OtelAttributes, WorkflowMatch } from '@principal-ai/principal-view-core';
import type { RegisteredTrace } from '../types/otel';
import { getSpansFromTrace } from '../types/otel';

export interface WorkflowMatchingResult {
  matches: WorkflowMatch[];
  unmatchedEventNames: string[];
  totalEventCount: number;
  matchedEventCount: number;
}

/**
 * Convert OtelKeyValue array to OtelAttributes record
 */
function keyValueArrayToAttributes(keyValues: OtelKeyValue[]): OtelAttributes {
  const attributes: OtelAttributes = {};
  for (const kv of keyValues) {
    const value = getAttributeValue([kv], kv.key);
    if (value !== undefined) {
      attributes[kv.key] = value;
    }
  }
  return attributes;
}

/**
 * Convert OtelSpanData to OtelEvents for workflow matching
 *
 * Extracts events from span.events array
 */
function convertSpanToOtelEvents(span: OtelSpanData): OtelEvent[] {
  if (!span.events || span.events.length === 0) {
    return [];
  }

  return span.events.map(event => ({
    name: event.name,
    timestamp: event.timeUnixNano ? parseInt(event.timeUnixNano) / 1_000_000 : 0, // Convert nanoseconds to milliseconds
    type: 'span' as const,
    attributes: event.attributes ? keyValueArrayToAttributes(event.attributes) : undefined,
  }));
}

export interface WorkflowMetadata {
  id: string;
  storyboardId: string;
  storyboardName: string;
  template: WorkflowTemplate;
}

/**
 * Match a trace against multiple workflows to determine which workflows it touches
 *
 * This function:
 * 1. Converts trace spans to OtelEvents
 * 2. Runs renderWorkflow() against each workflow template
 * 3. Tracks which events matched vs unmatched
 * 4. Returns comprehensive matching results
 *
 * @deprecated Use registry-based matching in RegisteredTrace instead
 * @param trace - The trace to analyze
 * @param workflows - Array of workflows with metadata (from DiscoveredWorkflow)
 * @returns Matching results with matched workflows, unmatched events, and coverage metrics
 */
export function matchTraceToWorkflows(
  trace: RegisteredTrace,
  workflows: WorkflowMetadata[]
): WorkflowMatchingResult {
  // Convert all spans to OtelEvents
  const spans = getSpansFromTrace(trace);
  const allEvents = spans.flatMap(span => {
    try {
      return convertSpanToOtelEvents(span);
    } catch (e) {
      console.warn('[workflowMatching] Failed to convert span to events:', e);
      return [];
    }
  });

  const allEventNames = new Set(allEvents.map(e => e.name));
  const _matchedEventNames = new Set<string>(); // TODO: Populate when renderWorkflow returns matched event names
  const matches: WorkflowMatch[] = [];

  // Try matching against each workflow
  for (const workflow of workflows) {
    try {
      const result = renderWorkflow(workflow.template, allEvents);

      // If a scenario matched, record it
      if (result.scenarioId) {
        const scenario = workflow.template.scenarios.find(s => s.id === result.scenarioId);
        const matchedEventCount = result.metadata?.eventCount || 0;

        // Note: renderWorkflow doesn't currently return which events matched
        // For now, we'll estimate based on event count
        // TODO: Enhance renderWorkflow to return matched event names

        matches.push({
          storyboardId: workflow.storyboardId,
          storyboardName: workflow.storyboardName,
          workflowId: workflow.id,
          workflowName: workflow.template.name,
          scenarioId: result.scenarioId,
          scenarioName: scenario?.description || result.scenarioId,
          matchedEventCount,
          // matchedEventNames would go here when available
        });

        // Mark events as matched (simplified approach)
        // In reality, we'd need renderWorkflow to tell us which specific events matched
        // For now, we'll assume if a scenario matched, we don't double-count events
      }
    } catch (e) {
      // Skip workflows that error during matching
      console.warn(`[workflowMatching] Error matching workflow ${workflow.id}:`, e);
      continue;
    }
  }

  // Calculate unmatched events
  // Note: This is approximate without knowing exact matched event names from renderWorkflow
  const totalMatchedEvents = matches.reduce((sum, m) => sum + m.matchedEventCount, 0);
  const unmatchedEventNames = Array.from(allEventNames);

  // If we have matches but they don't cover all events, identify unmatched ones
  // This is a simplified approach - ideally we'd track exact event matching
  const matchedEventCount = Math.min(totalMatchedEvents, allEvents.length);

  return {
    matches,
    unmatchedEventNames: matchedEventCount < allEvents.length ? unmatchedEventNames : [],
    totalEventCount: allEvents.length,
    matchedEventCount,
  };
}

/**
 * Enrich a trace with multi-workflow matching information
 *
 * This updates the trace object with matchedWorkflows, unmatchedEventNames, and totalEventCount
 *
 * @deprecated Use registry-based matching in RegisteredTrace instead
 * @param trace - The trace to enrich
 * @param workflows - Array of workflows with metadata to match against
 * @returns The enriched trace
 */
export function enrichTraceWithWorkflowMatches(
  trace: RegisteredTrace,
  workflows: WorkflowMetadata[]
): RegisteredTrace {
  // This function is deprecated - RegisteredTrace already has matching info from the registry
  console.warn('[workflowMatching] enrichTraceWithWorkflowMatches is deprecated. RegisteredTrace already includes matching info.');
  return trace;
}

/**
 * Calculate coverage percentage for a trace
 *
 * @deprecated Use RegisteredTrace.matchedNodesSummary.coveragePercent instead
 * @param trace - Trace with workflow matching information
 * @returns Coverage percentage (0-100)
 */
export function calculateCoveragePercentage(trace: RegisteredTrace): number {
  return trace.matchedNodesSummary?.coveragePercent || 0;
}
