/**
 * Trace Pattern Matching Utilities
 *
 * Functions for fingerprinting traces and matching them against known patterns.
 */

import type { RegisteredTrace, OtelSpanData } from '@principal-ai/principal-view-core';
import type { TracePattern, SpanPattern, PatternMatchResult } from '../types/tracePatterns';
import { getSpansFromTrace } from '../types/otel';

/**
 * Internal representation of a span with children for tree operations.
 */
interface SpanNode {
  spanId: string;
  name: string;
  parentSpanId?: string;
  children: SpanNode[];
}

/**
 * Build a span tree from flat spans list.
 */
function buildSpanTree(spans: OtelSpanData[]): SpanNode[] {
  const nodeMap = new Map<string, SpanNode>();
  const roots: SpanNode[] = [];

  // Create nodes
  for (const span of spans) {
    nodeMap.set(span.spanId, {
      spanId: span.spanId,
      name: span.name,
      parentSpanId: span.parentSpanId || undefined,
      children: [],
    });
  }

  // Build tree
  for (const node of nodeMap.values()) {
    if (node.parentSpanId && nodeMap.has(node.parentSpanId)) {
      nodeMap.get(node.parentSpanId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Convert a span tree to SpanPattern format.
 */
function spanNodeToPattern(node: SpanNode): SpanPattern {
  const pattern: SpanPattern = {
    name: node.name,
  };

  if (node.children.length > 0) {
    // Sort children by name for consistent fingerprints
    const sortedChildren = [...node.children].sort((a, b) => a.name.localeCompare(b.name));
    pattern.children = sortedChildren.map(spanNodeToPattern);
  }

  return pattern;
}

/**
 * Extract a fingerprint (SpanPattern[]) from a RegisteredTrace.
 * This captures the span names and parent-child hierarchy.
 */
export function extractTraceFingerprint(trace: RegisteredTrace): SpanPattern[] {
  const spans = getSpansFromTrace(trace);
  if (spans.length === 0) {
    return [];
  }

  const roots = buildSpanTree(spans);

  // Sort roots by name for consistent fingerprints
  const sortedRoots = [...roots].sort((a, b) => a.name.localeCompare(b.name));
  return sortedRoots.map(spanNodeToPattern);
}

/**
 * Generate a stable ID from a pattern's structure.
 * Used when creating new patterns.
 */
export function generatePatternId(rootSpans: SpanPattern[]): string {
  const serialized = serializePatternStructure(rootSpans);
  // Simple hash - in production you might use a proper hash function
  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    const char = serialized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `pattern-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

/**
 * Serialize pattern structure to a string for hashing.
 */
function serializePatternStructure(patterns: SpanPattern[]): string {
  const parts: string[] = [];

  for (const pattern of patterns) {
    parts.push(pattern.name);
    if (pattern.children && pattern.children.length > 0) {
      parts.push(`[${serializePatternStructure(pattern.children)}]`);
    }
  }

  return parts.join(',');
}

/**
 * Check if a span name matches a pattern name.
 */
function matchesName(spanName: string, pattern: SpanPattern): boolean {
  const matchType = pattern.nameMatch || 'exact';

  switch (matchType) {
    case 'exact':
      return spanName === pattern.name;
    case 'prefix':
      return spanName.startsWith(pattern.name);
    case 'contains':
      return spanName.includes(pattern.name);
    default:
      return spanName === pattern.name;
  }
}

/**
 * Check if a span node matches a pattern (including children).
 * Uses exact structure with flexible sibling order.
 */
function matchSpanNode(node: SpanNode, pattern: SpanPattern): boolean {
  // Check name match
  if (!matchesName(node.name, pattern)) {
    return false;
  }

  // Check children
  const patternChildren = pattern.children || [];
  const nodeChildren = node.children;

  // Exact structure: same number of children
  if (patternChildren.length !== nodeChildren.length) {
    return false;
  }

  if (patternChildren.length === 0) {
    return true;
  }

  // Flexible order: each pattern child must match exactly one node child
  const usedIndices = new Set<number>();

  for (const patternChild of patternChildren) {
    let found = false;

    for (let i = 0; i < nodeChildren.length; i++) {
      if (usedIndices.has(i)) continue;

      if (matchSpanNode(nodeChildren[i], patternChild)) {
        usedIndices.add(i);
        found = true;
        break;
      }
    }

    if (!found) {
      return false;
    }
  }

  return true;
}

/**
 * Match a trace against a single pattern.
 * Returns true if the trace structure matches the pattern.
 */
export function matchTraceToPattern(trace: RegisteredTrace, pattern: TracePattern): boolean {
  const spans = getSpansFromTrace(trace);
  if (spans.length === 0) {
    return pattern.rootSpans.length === 0;
  }

  const roots = buildSpanTree(spans);
  const patternRoots = pattern.rootSpans;

  // Exact structure: same number of root spans
  if (roots.length !== patternRoots.length) {
    return false;
  }

  if (patternRoots.length === 0) {
    return true;
  }

  // Flexible order: each pattern root must match exactly one trace root
  const usedIndices = new Set<number>();

  for (const patternRoot of patternRoots) {
    let found = false;

    for (let i = 0; i < roots.length; i++) {
      if (usedIndices.has(i)) continue;

      if (matchSpanNode(roots[i], patternRoot)) {
        usedIndices.add(i);
        found = true;
        break;
      }
    }

    if (!found) {
      return false;
    }
  }

  return true;
}

/**
 * Find the first pattern that matches a trace.
 * Returns null if no pattern matches.
 */
export function findMatchingPattern(
  trace: RegisteredTrace,
  patterns: TracePattern[]
): PatternMatchResult | null {
  for (const pattern of patterns) {
    if (matchTraceToPattern(trace, pattern)) {
      return {
        pattern,
        patternId: pattern.id,
        patternName: pattern.name,
        confidence: 1.0, // Exact match
      };
    }
  }

  return null;
}

/**
 * Match all traces against all patterns.
 * Returns a map of traceId -> PatternMatchResult.
 */
export function matchTracesToPatterns(
  traces: RegisteredTrace[],
  patterns: TracePattern[]
): Map<string, PatternMatchResult> {
  const results = new Map<string, PatternMatchResult>();

  for (const trace of traces) {
    const match = findMatchingPattern(trace, patterns);
    if (match) {
      results.set(trace.traceId, match);
    }
  }

  return results;
}

/**
 * Create a TracePattern from a trace.
 * Used for "Save as Pattern" functionality.
 */
export function createPatternFromTrace(
  trace: RegisteredTrace,
  name: string,
  description?: string,
  filterDefault: boolean = true
): TracePattern {
  const rootSpans = extractTraceFingerprint(trace);

  return {
    id: generatePatternId(rootSpans),
    name,
    description: description || undefined,
    rootSpans,
    filterDefault,
    createdAt: new Date().toISOString(),
    sampleTraceId: trace.traceId,
  };
}
