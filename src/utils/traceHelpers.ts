/**
 * Helper utilities for working with RegisteredTrace (new API)
 *
 * These helpers abstract away the complexity of the new multi-resource,
 * multi-scope, three-category matching structure.
 */

import type { RegisteredTrace } from '@principal-ai/principal-view-core';

/**
 * Get primary service name from trace
 * Uses first resource's serviceName
 */
export function getServiceName(trace: RegisteredTrace): string {
  return trace.resources?.[0]?.serviceName || 'unknown';
}

/**
 * Get all service names from trace (for multi-service traces)
 */
export function getAllServiceNames(trace: RegisteredTrace): string[] {
  return trace.resources?.map(r => r.serviceName) ?? [];
}

/**
 * Get primary scope from trace
 * Uses first resource's first scope
 */
export function getPrimaryScope(trace: RegisteredTrace): { name: string; version: string } | null {
  const firstScope = trace.resources?.[0]?.scopes?.[0];
  if (!firstScope) return null;
  return {
    name: firstScope.scope.name,
    version: firstScope.scope.version || 'unknown',
  };
}

/**
 * Get all scopes from trace (across all resources)
 */
export function getAllScopes(trace: RegisteredTrace): Array<{ name: string; version: string }> {
  const scopes: Array<{ name: string; version: string }> = [];

  trace.resources?.forEach(resource => {
    resource.scopes?.forEach(scopeInfo => {
      scopes.push({
        name: scopeInfo.scope.name,
        version: scopeInfo.scope.version || 'unknown',
      });
    });
  });

  return scopes;
}

/**
 * Check if trace has any matches (scenario or storyboard)
 * Replaces: registryStatus === 'matched'
 */
export function isTraceMatched(trace: RegisteredTrace): boolean {
  return (trace.scenarioMatches?.length ?? 0) > 0 || (trace.storyboardMatches?.length ?? 0) > 0;
}

/**
 * Check if trace has full scenario matches
 * More strict than isTraceMatched - requires actual scenario matches
 */
export function hasScenarioMatches(trace: RegisteredTrace): boolean {
  return (trace.scenarioMatches?.length ?? 0) > 0;
}

/**
 * Get all scenario IDs that matched this trace
 */
export function getMatchedScenarioIds(trace: RegisteredTrace): string[] {
  return trace.scenarioMatches?.map(m => m.scenarioId) ?? [];
}

/**
 * Get all storyboard IDs that matched this trace (from scenario matches)
 */
export function getMatchedStoryboardIds(trace: RegisteredTrace): string[] {
  const ids = new Set<string>();

  trace.scenarioMatches?.forEach(m => ids.add(m.storyboardId));
  trace.storyboardMatches?.forEach(m => ids.add(m.storyboardId));

  return Array.from(ids);
}

/**
 * Get primary storyboard ID
 * Returns first matched storyboard from scenario matches, then storyboard matches
 */
export function getPrimaryStoryboardId(trace: RegisteredTrace): string | null {
  if ((trace.scenarioMatches?.length ?? 0) > 0) {
    return trace.scenarioMatches![0].storyboardId;
  }
  if ((trace.storyboardMatches?.length ?? 0) > 0) {
    return trace.storyboardMatches![0].storyboardId;
  }
  return null;
}

/**
 * Get primary scenario ID
 * Returns first matched scenario ID
 */
export function getPrimaryScenarioId(trace: RegisteredTrace): string | null {
  if ((trace.scenarioMatches?.length ?? 0) > 0) {
    return trace.scenarioMatches![0].scenarioId;
  }
  return null;
}

/**
 * Calculate matched nodes summary
 * Replaces: trace.matchedNodesSummary
 */
export function getMatchedNodesSummary(trace: RegisteredTrace): {
  totalNodes: number;
  matchedNodes: number;
  coveragePercent: number;
} {
  // Count unique node IDs across all scenario matches
  const matchedNodeIds = new Set<string>();

  trace.scenarioMatches?.forEach(match => {
    match.matchedSpans.forEach(span => {
      matchedNodeIds.add(span.nodeId);
    });
  });

  const matchedNodes = matchedNodeIds.size;

  // Calculate coverage from scenario matches if available
  let totalCoverage = 0;
  let coverageCount = 0;

  trace.scenarioMatches?.forEach(match => {
    if (match.coveragePercent !== undefined) {
      totalCoverage += match.coveragePercent;
      coverageCount++;
    }
  });

  const averageCoverage = coverageCount > 0 ? totalCoverage / coverageCount : 0;

  return {
    matchedNodes,
    totalNodes: matchedNodes, // TODO: Get from canvas definition if available
    coveragePercent: averageCoverage,
  };
}

/**
 * Filter traces by scenario ID
 * Replaces: traces.filter(t => t.matchInfo?.scenarioId === scenarioId)
 */
export function filterTracesByScenario(
  traces: RegisteredTrace[],
  scenarioId: string
): RegisteredTrace[] {
  return traces.filter(trace =>
    trace.scenarioMatches?.some(match => match.scenarioId === scenarioId) ?? false
  );
}

/**
 * Filter traces by storyboard ID
 */
export function filterTracesByStoryboard(
  traces: RegisteredTrace[],
  storyboardId: string
): RegisteredTrace[] {
  return traces.filter(trace =>
    (trace.scenarioMatches?.some(match => match.storyboardId === storyboardId) ?? false) ||
    (trace.storyboardMatches?.some(match => match.storyboardId === storyboardId) ?? false)
  );
}

/**
 * Get match quality indicator
 * Replaces: trace.registryStatus
 */
export function getMatchQuality(trace: RegisteredTrace): 'matched' | 'partial' | 'unmatched' {
  if ((trace.scenarioMatches?.length ?? 0) > 0) {
    return 'matched';
  }
  if ((trace.storyboardMatches?.length ?? 0) > 0) {
    return 'partial';
  }
  return 'unmatched';
}

/**
 * Get scope version (schema version)
 * Replaces: trace.scope.version or trace.matchInfo?.schemaVersion
 */
export function getSchemaVersion(trace: RegisteredTrace): string | null {
  const primaryScope = getPrimaryScope(trace);
  return primaryScope?.version || null;
}

/**
 * Check if trace has validation issues
 */
export function hasValidationIssues(trace: RegisteredTrace): boolean {
  return (trace.validationIssues?.length ?? 0) > 0;
}

/**
 * Get validation issues by severity
 */
export function getValidationIssuesBySeverity(
  trace: RegisteredTrace,
  severity: 'error' | 'warning' | 'info'
): Array<{ category: string; message: string; suggestion?: string }> {
  return (trace.validationIssues || [])
    .filter(issue => issue.level === severity)
    .map(issue => ({
      category: issue.category,
      message: issue.message,
      suggestion: issue.suggestion,
    }));
}

/**
 * Create a grouping key for traces by service and scope
 * Used for grouping traces in lists
 */
export function getTraceGroupKey(trace: RegisteredTrace): string {
  const serviceName = getServiceName(trace);
  const scope = getPrimaryScope(trace);
  return `${serviceName}-${scope?.name || 'unknown'}`;
}

/**
 * Get match info structure for backward compatibility
 * Creates a structure similar to the old matchInfo for easier migration
 */
export function getMatchInfo(trace: RegisteredTrace): {
  storyboardId: string | null;
  scenarioId: string | null;
  schemaVersion: string | null;
  hasMatch: boolean;
} {
  const primaryMatch = trace.scenarioMatches?.[0];

  return {
    storyboardId: primaryMatch?.storyboardId || getPrimaryStoryboardId(trace),
    scenarioId: primaryMatch?.scenarioId || null,
    schemaVersion: getSchemaVersion(trace),
    hasMatch: isTraceMatched(trace),
  };
}
