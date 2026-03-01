/**
 * TraceExpansion - Detailed view of trace workflow matches and coverage
 *
 * Shows:
 * - Matched scenarios with coverage metrics
 * - Partial matches (workflow matched, no scenario)
 * - Unmatched spans
 * - Validation issues
 */

import React, { useMemo } from 'react';
import type { Theme } from '@principal-ade/industry-theme';
import type { RegisteredTrace } from '../types/otel';

export interface TraceExpansionProps {
  trace: RegisteredTrace;
  theme: Theme;
  onWorkflowClick?: (storyboardId: string, workflowId: string, scenarioId: string, spanId: string) => void;
  onSpanClick?: () => void;
}

/**
 * TraceExpansion component displays detailed workflow matching information
 * for a selected trace as a simple categorized list
 */
// Unified span item for sorting
interface SpanItem {
  type: 'matched' | 'orphaned' | 'unmatched';
  spanId: string;
  parentSpanId?: string;
  spanName: string;
  timestamp: number;
  target?: string; // scenarioId, workflowId, or undefined
  storyboardId?: string;
  workflowId?: string;
  scenarioId?: string;
  reason?: string; // Why the span didn't match (for unmatched/orphaned)
  scopeName?: string; // Scope name for context
  depth: number;
}

export const TraceExpansion: React.FC<TraceExpansionProps> = ({
  trace,
  theme,
  onWorkflowClick,
  onSpanClick,
}) => {
  // Build span index map from original OTLP data (preserves ingestion order)
  const spanIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let index = 0;

    for (const resourceSpan of trace.otlpData?.resourceSpans || []) {
      for (const scopeSpan of resourceSpan.scopeSpans || []) {
        for (const span of scopeSpan.spans || []) {
          map.set(span.spanId, index++);
        }
      }
    }

    return map;
  }, [trace.otlpData]);

  // Collect all spans and sort by timestamp, calculating depth from parent relationships
  const sortedSpans = useMemo(() => {
    const spans: Omit<SpanItem, 'depth'>[] = [];

    // Add matched spans (green)
    trace.scenarioMatches?.forEach(match => {
      match.matchedSpans.forEach(span => {
        spans.push({
          type: 'matched',
          spanId: span.spanId,
          parentSpanId: span.parentSpanId,
          spanName: span.spanName,
          timestamp: span.timestamp,
          target: match.scenarioId,
          storyboardId: match.storyboardId,
          workflowId: match.workflowId,
          scenarioId: match.scenarioId,
        });
      });
    });

    // Add orphaned spans (warning - workflow matched, no scenario)
    trace.storyboardMatches?.forEach(match => {
      match.orphanedSpans.forEach(span => {
        spans.push({
          type: 'orphaned',
          spanId: span.spanId,
          parentSpanId: span.parentSpanId,
          spanName: span.spanName,
          timestamp: span.timestamp,
          target: match.workflowName || match.workflowId,
          storyboardId: match.storyboardId,
          workflowId: match.workflowId,
          reason: span.reason,
        });
      });
    });

    // Add unmatched spans (warning - no workflow matched)
    trace.unmatchedSpans?.spans?.forEach(span => {
      spans.push({
        type: 'unmatched',
        spanId: span.spanId,
        parentSpanId: span.parentSpanId,
        spanName: span.spanName,
        timestamp: span.timestamp,
        reason: span.reason,
        scopeName: span.scopeName,
      });
    });

    // Build a map for depth calculation
    const spanMap = new Map(spans.map(s => [s.spanId, s]));

    // Calculate depth for each span
    const getDepth = (spanId: string, visited = new Set<string>()): number => {
      if (visited.has(spanId)) return 0; // Prevent cycles
      visited.add(spanId);

      const span = spanMap.get(spanId);
      if (!span || !span.parentSpanId) return 0;

      const parent = spanMap.get(span.parentSpanId);
      if (!parent) return 0; // Parent not in our list

      return 1 + getDepth(span.parentSpanId, visited);
    };

    // Add depth to each span and sort by timestamp
    const spansWithDepth: SpanItem[] = spans.map(span => ({
      ...span,
      depth: getDepth(span.spanId),
    }));

    return spansWithDepth.sort((a, b) => {
      const timeDiff = a.timestamp - b.timestamp;
      if (timeDiff !== 0) return timeDiff;
      // Tiebreaker: original ingestion order from OTLP data
      const indexA = spanIndexMap.get(a.spanId) ?? Infinity;
      const indexB = spanIndexMap.get(b.spanId) ?? Infinity;
      return indexA - indexB;
    });
  }, [trace.scenarioMatches, trace.storyboardMatches, trace.unmatchedSpans, spanIndexMap]);

  const hasAnyMatches = sortedSpans.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.space[2],
        paddingTop: theme.space[3],
        paddingRight: theme.space[3],
        paddingBottom: theme.space[3],
        paddingLeft: theme.space[1],
        backgroundColor: theme.colors.background,
        borderRadius: theme.radii[2],
      }}
    >
      {/* All spans sorted by timestamp */}
      {sortedSpans.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.space[3] }}>
          {sortedSpans.map((span, index) => {
            const isMatched = span.type === 'matched';
            const hasTarget = span.target !== undefined;
            const color = isMatched ? theme.colors.success : theme.colors.warning;
            const isMatchedOrOrphaned = span.type === 'matched' || span.type === 'orphaned';
            const isClickable = onSpanClick || (isMatchedOrOrphaned && onWorkflowClick);

            return (
              <div
                key={`${span.type}-${span.spanName}-${span.timestamp}-${index}`}
                onClick={() => {
                  // Open workflow for matched and orphaned spans (even without scenarioId)
                  if (isMatchedOrOrphaned && span.storyboardId && onWorkflowClick) {
                    onWorkflowClick(span.storyboardId, span.workflowId || '', span.scenarioId || '', span.spanId);
                  } else {
                    // Only open trace details for unmatched spans
                    onSpanClick?.();
                  }
                }}
                style={{
                  fontSize: theme.fontSizes[2],
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.space[1],
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (isClickable) {
                    e.currentTarget.style.opacity = '0.7';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {/* Depth indicator blocks */}
                {span.depth > 0 && (
                  <span style={{ display: 'flex', gap: '2px', marginRight: '4px', alignSelf: 'stretch' }}>
                    {Array.from({ length: span.depth }).map((_, i) => (
                      <span
                        key={i}
                        style={{
                          width: '8px',
                          height: '100%',
                          minHeight: '1em',
                          backgroundColor: color,
                          opacity: 0.3,
                          borderRadius: '1px',
                        }}
                      />
                    ))}
                  </span>
                )}
                <span>{span.spanName}</span>
                {hasTarget && (
                  <>
                    <span style={{ color: theme.colors.textMuted }}>-</span>
                    <span style={{ color: theme.colors.textSecondary }}>{span.target}</span>
                  </>
                )}
                {/* Show reason for unmatched/orphaned spans */}
                {(span.type === 'unmatched' || span.type === 'orphaned') && span.reason && (
                  <span
                    style={{
                      fontSize: theme.fontSizes[1],
                      color: span.reason.includes('not registered in any owned-scopes') ||
                             span.reason.includes('has no storyboards')
                        ? theme.colors.error || '#ef4444'
                        : theme.colors.textMuted,
                      marginLeft: theme.space[2],
                      fontStyle: 'italic',
                    }}
                    title={span.scopeName ? `Scope: ${span.scopeName}` : undefined}
                  >
                    ({span.reason})
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Validation Issues */}
      {trace.validationIssues && trace.validationIssues.length > 0 && (
        <div>
          <div
            style={{
              fontSize: theme.fontSizes[1],
              fontWeight: theme.fontWeights.semibold,
              marginBottom: theme.space[2],
              paddingLeft: theme.space[2],
              color: theme.colors.warning || '#f59e0b',
            }}
          >
            Validation Issues ({trace.validationIssues.length})
          </div>
          <div
            style={{
              padding: theme.space[3],
              backgroundColor: `${theme.colors.warning || '#f59e0b'}10`,
              border: `1px solid ${theme.colors.warning || '#f59e0b'}40`,
              borderRadius: theme.radii[2],
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {trace.validationIssues.map((issue, index) => (
              <div
                key={`${issue.category}-${issue.message}-${index}`}
                style={{
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.text,
                  padding: `${theme.space[1]} 0`,
                  fontFamily: theme.fonts.monospace || 'monospace',
                }}
              >
                • {issue.message}
                {issue.suggestion && (
                  <span style={{ color: theme.colors.textMuted, marginLeft: theme.space[2] }}>
                    ({issue.suggestion})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No matches message */}
      {!hasAnyMatches && (!trace.validationIssues || trace.validationIssues.length === 0) && (
        <div
          style={{
            padding: theme.space[3],
            fontSize: theme.fontSizes[1],
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          No workflow matching data available
        </div>
      )}
    </div>
  );
};
