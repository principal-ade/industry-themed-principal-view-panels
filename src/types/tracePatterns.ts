/**
 * Trace Pattern Catalog Types
 *
 * Types for fingerprinting and cataloging recurring trace shapes
 * that don't match any workflow definition.
 */

/**
 * A pattern that defines the expected structure of a trace.
 * Used for recognizing recurring telemetry shapes.
 */
export interface TracePattern {
  /** Unique identifier for the pattern */
  id: string;

  /** Human-readable name for the pattern */
  name: string;

  /** Optional description of what this pattern represents */
  description?: string;

  /** Root span patterns that define the trace structure */
  rootSpans: SpanPattern[];

  /**
   * If true, traces matching this pattern are hidden by default.
   * Follows the same semantics as workflow scenario.filterDefault.
   */
  filterDefault: boolean;

  /** ISO timestamp when the pattern was created */
  createdAt?: string;

  /** Trace ID this pattern was extracted from (for reference) */
  sampleTraceId?: string;
}

/**
 * A pattern for matching a single span and its children.
 */
export interface SpanPattern {
  /** Span name to match */
  name: string;

  /**
   * How to match the span name:
   * - 'exact': Name must match exactly (default)
   * - 'prefix': Name must start with pattern
   * - 'contains': Name must contain pattern
   */
  nameMatch?: 'exact' | 'prefix' | 'contains';

  /** Child span patterns (order-independent matching) */
  children?: SpanPattern[];
}

/**
 * Result of matching a trace against a pattern.
 */
export interface PatternMatchResult {
  /** The matched pattern */
  pattern: TracePattern;

  /** Pattern ID for quick reference */
  patternId: string;

  /** Pattern name for display */
  patternName: string;

  /** Confidence of the match (1.0 = exact) */
  confidence: number;
}

/**
 * Trace patterns catalog file structure.
 */
export interface TracePatternsFile {
  /** Schema version */
  version: string;

  /** Array of trace patterns */
  patterns: TracePattern[];
}
