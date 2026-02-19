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
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export interface TraceExpansionProps {
  trace: RegisteredTrace;
  theme: Theme;
  onWorkflowClick?: (workflowId: string, scenarioId: string) => void;
}

/**
 * TraceExpansion component displays detailed workflow matching information
 * for a selected trace as a simple categorized list
 */
export const TraceExpansion: React.FC<TraceExpansionProps> = ({
  trace,
  theme,
  onWorkflowClick,
}) => {
  // Sort scenario matches by earliest span timestamp (temporal order)
  const sortedScenarioMatches = useMemo(() => {
    if (!trace.scenarioMatches) return [];
    return [...trace.scenarioMatches].sort((a, b) => {
      const aEarliest = Math.min(...a.matchedSpans.map(s => s.timestamp));
      const bEarliest = Math.min(...b.matchedSpans.map(s => s.timestamp));
      return aEarliest - bEarliest;
    });
  }, [trace.scenarioMatches]);

  // Calculate total orphaned spans
  const orphanedSpanCount = useMemo(() => {
    if (!trace.storyboardMatches) return 0;
    return trace.storyboardMatches.reduce((sum, m) => sum + m.orphanedSpans.length, 0);
  }, [trace.storyboardMatches]);

  const hasAnyMatches = (trace.scenarioMatches?.length ?? 0) > 0 ||
                        (trace.storyboardMatches?.length ?? 0) > 0 ||
                        (trace.unmatchedSpans?.spans?.length ?? 0) > 0;

  const getCoverageColor = (coverage: number | undefined) => {
    if (!coverage) return theme.colors.textMuted;
    if (coverage === 100) return theme.colors.success || '#22c55e';
    if (coverage >= 70) return theme.colors.warning || '#f59e0b';
    return theme.colors.error || '#ef4444';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.space[3],
        padding: theme.space[2],
        backgroundColor: theme.colors.background,
        borderRadius: theme.radii[2],
      }}
    >
      {/* Category 1: Matched Scenarios */}
      {sortedScenarioMatches.length > 0 && (
        <div>
          <div
            style={{
              fontSize: theme.fontSizes[1],
              fontWeight: theme.fontWeights.semibold,
              marginBottom: theme.space[2],
              paddingLeft: theme.space[2],
              color: theme.colors.success || '#22c55e',
              display: 'flex',
              alignItems: 'center',
              gap: theme.space[1],
            }}
          >
            <CheckCircle size={14} />
            Matched Scenarios ({sortedScenarioMatches.length})
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.space[1],
            }}
          >
            {sortedScenarioMatches.map((match, index) => (
              <div
                key={`${match.storyboardId}-${match.scenarioId}-${index}`}
                onClick={() => onWorkflowClick?.(match.storyboardId, match.scenarioId)}
                style={{
                  padding: theme.space[2],
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: theme.radii[1],
                  cursor: onWorkflowClick ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  border: `1px solid ${theme.colors.border || theme.colors.backgroundSecondary}`,
                }}
                onMouseEnter={(e) => {
                  if (onWorkflowClick) {
                    e.currentTarget.style.backgroundColor = theme.colors.backgroundTertiary || theme.colors.backgroundSecondary;
                    e.currentTarget.style.borderColor = theme.colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary;
                  e.currentTarget.style.borderColor = theme.colors.border || theme.colors.backgroundSecondary;
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: theme.space[2],
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: theme.fontSizes[1],
                        fontWeight: theme.fontWeights.medium,
                        color: theme.colors.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {match.scenarioId}
                    </div>
                    <div
                      style={{
                        fontSize: theme.fontSizes[0],
                        color: theme.colors.textMuted,
                        marginTop: '2px',
                      }}
                    >
                      Storyboard: {match.storyboardId}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.space[2],
                      flexShrink: 0,
                    }}
                  >
                    {match.coveragePercent !== undefined && (
                      <span
                        style={{
                          fontSize: theme.fontSizes[1],
                          fontWeight: theme.fontWeights.semibold,
                          color: getCoverageColor(match.coveragePercent),
                        }}
                      >
                        {Math.round(match.coveragePercent)}%
                      </span>
                    )}
                    {match.matchType && (
                      <span
                        style={{
                          fontSize: theme.fontSizes[0],
                          padding: '2px 6px',
                          backgroundColor: match.matchType === 'full' ? `${theme.colors.success || '#22c55e'}15` : `${theme.colors.warning || '#f59e0b'}15`,
                          color: match.matchType === 'full' ? theme.colors.success || '#22c55e' : theme.colors.warning || '#f59e0b',
                          borderRadius: '3px',
                          textTransform: 'lowercase',
                        }}
                      >
                        {match.matchType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category 2: Partial Matches (Workflow matched, no scenario) */}
      {(trace.storyboardMatches?.length ?? 0) > 0 && (
        <div>
          <div
            style={{
              fontSize: theme.fontSizes[1],
              fontWeight: theme.fontWeights.semibold,
              marginBottom: theme.space[2],
              paddingLeft: theme.space[2],
              color: theme.colors.warning || '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: theme.space[1],
            }}
          >
            <AlertTriangle size={14} />
            Partial Matches ({orphanedSpanCount} orphaned {orphanedSpanCount === 1 ? 'span' : 'spans'})
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.space[1],
            }}
          >
            {trace.storyboardMatches?.map((match, index) => (
              <div
                key={`${match.storyboardId}-${index}`}
                style={{
                  padding: theme.space[2],
                  backgroundColor: `${theme.colors.warning || '#f59e0b'}10`,
                  border: `1px solid ${theme.colors.warning || '#f59e0b'}40`,
                  borderRadius: theme.radii[1],
                }}
              >
                <div
                  style={{
                    fontSize: theme.fontSizes[1],
                    fontWeight: theme.fontWeights.medium,
                    color: theme.colors.text,
                  }}
                >
                  {match.storyboardId}
                </div>
                <div
                  style={{
                    fontSize: theme.fontSizes[0],
                    color: theme.colors.textMuted,
                    marginTop: '2px',
                  }}
                >
                  Matched workflow but no scenario • {match.orphanedSpans.length} {match.orphanedSpans.length === 1 ? 'span' : 'spans'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category 3: Unmatched Spans */}
      {(trace.unmatchedSpans?.spans?.length ?? 0) > 0 && (
        <div>
          <div
            style={{
              fontSize: theme.fontSizes[1],
              fontWeight: theme.fontWeights.semibold,
              marginBottom: theme.space[2],
              paddingLeft: theme.space[2],
              color: theme.colors.error || '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: theme.space[1],
            }}
          >
            <XCircle size={14} />
            Unmatched Spans ({trace.unmatchedSpans?.spans?.length ?? 0})
          </div>
          <div
            style={{
              padding: theme.space[2],
              backgroundColor: `${theme.colors.error || '#ef4444'}10`,
              border: `1px solid ${theme.colors.error || '#ef4444'}40`,
              borderRadius: theme.radii[1],
              fontSize: theme.fontSizes[0],
              color: theme.colors.textSecondary,
              fontStyle: 'italic',
            }}
          >
            {trace.unmatchedSpans?.spans?.length ?? 0} {(trace.unmatchedSpans?.spans?.length ?? 0) === 1 ? 'span' : 'spans'} didn't match any workflow
          </div>
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
