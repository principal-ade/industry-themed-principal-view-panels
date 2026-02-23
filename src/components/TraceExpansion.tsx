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
  onWorkflowClick?: (workflowId: string, scenarioId: string) => void;
  onSpanClick?: () => void;
}

/**
 * TraceExpansion component displays detailed workflow matching information
 * for a selected trace as a simple categorized list
 */
// Unified span item for sorting
interface SpanItem {
  type: 'matched' | 'orphaned' | 'unmatched';
  spanName: string;
  timestamp: number;
  target?: string; // scenarioId, workflowId, or undefined
  storyboardId?: string;
  scenarioId?: string;
}

export const TraceExpansion: React.FC<TraceExpansionProps> = ({
  trace,
  theme,
  onWorkflowClick,
  onSpanClick,
}) => {
  // Collect all spans and sort by timestamp
  const sortedSpans = useMemo(() => {
    const spans: SpanItem[] = [];

    // Add matched spans (green)
    trace.scenarioMatches?.forEach(match => {
      match.matchedSpans.forEach(span => {
        spans.push({
          type: 'matched',
          spanName: span.spanName,
          timestamp: span.timestamp,
          target: match.scenarioId,
          storyboardId: match.storyboardId,
          scenarioId: match.scenarioId,
        });
      });
    });

    // Add orphaned spans (warning - workflow matched, no scenario)
    trace.storyboardMatches?.forEach(match => {
      match.orphanedSpans.forEach(span => {
        spans.push({
          type: 'orphaned',
          spanName: span.spanName,
          timestamp: span.timestamp,
          target: match.workflowName || match.workflowId,
        });
      });
    });

    // Add unmatched spans (warning - no workflow matched)
    trace.unmatchedSpans?.spans?.forEach(span => {
      spans.push({
        type: 'unmatched',
        spanName: span.spanName,
        timestamp: span.timestamp,
      });
    });

    // Sort by timestamp
    return spans.sort((a, b) => a.timestamp - b.timestamp);
  }, [trace.scenarioMatches, trace.storyboardMatches, trace.unmatchedSpans]);

  const hasAnyMatches = sortedSpans.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.space[2],
        padding: theme.space[3],
        backgroundColor: theme.colors.background,
        borderRadius: theme.radii[2],
      }}
    >
      {/* All spans sorted by timestamp */}
      {sortedSpans.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.space[2] }}>
          {sortedSpans.map((span, index) => {
            const isMatched = span.type === 'matched';
            const hasTarget = span.target !== undefined;
            const color = isMatched ? theme.colors.success : theme.colors.warning;
            const isClickable = onSpanClick || (isMatched && onWorkflowClick);

            return (
              <div
                key={`${span.type}-${span.spanName}-${span.timestamp}-${index}`}
                onClick={() => {
                  onSpanClick?.();
                  if (isMatched && span.storyboardId && span.scenarioId) {
                    onWorkflowClick?.(span.storyboardId, span.scenarioId);
                  }
                }}
                style={{
                  fontSize: theme.fontSizes[2],
                  color,
                  paddingLeft: theme.space[2],
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
                <span>{span.spanName}</span>
                {hasTarget && (
                  <>
                    <span style={{ color: theme.colors.textMuted }}>→</span>
                    <span style={{ color: theme.colors.textSecondary }}>{span.target}</span>
                  </>
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
