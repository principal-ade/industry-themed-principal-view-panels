import React, { useMemo, useState } from 'react';
import { Search, Trash2, X } from 'lucide-react';
import type { Theme } from '@principal-ade/industry-theme';
import type { RegisteredTrace } from '../types/otel';
import { TraceExpansion } from './TraceExpansion';
import { getPrimaryScope } from '../utils/traceHelpers';

export interface TraceListProps {
  traces: RegisteredTrace[];
  theme: Theme;
  onTraceClick?: (trace: RegisteredTrace) => void;
  onTraceSelect?: (trace: RegisteredTrace) => void;
  onWorkflowClick?: (trace: RegisteredTrace, storyboardId: string, workflowId: string, scenarioId: string, spanId: string) => void;
  onRemoveTrace?: (trace: RegisteredTrace) => void;
  onClearAll?: () => void;
  expandedTraceIds?: Set<string>;
  showSearch?: boolean;
  emptyMessage?: string;
  /** Map of scenario visibility state (key: "workflowId/scenarioId", value: true = visible) */
  scenarioVisibilityMap?: Record<string, boolean>;
  /** Callback when scenario visibility is toggled */
  onScenarioVisibilityToggle?: (scenarioKey: string, isVisible: boolean) => void;
}

/**
 * TraceList - Displays a list of OpenTelemetry traces
 *
 * Features:
 * - Displays trace metadata (ID, service, duration, span count, status)
 * - Search/filter functionality
 * - Click to select traces
 * - Visual indicators for errors
 * - Responsive layout
 */
export const TraceList: React.FC<TraceListProps> = ({
  traces,
  theme,
  onTraceClick,
  onTraceSelect,
  onWorkflowClick,
  onRemoveTrace,
  onClearAll,
  expandedTraceIds,
  showSearch = true,
  emptyMessage = 'No traces available',
  scenarioVisibilityMap,
  onScenarioVisibilityToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort traces by search query (most recent first)
  const filteredTraces = useMemo(() => {
    let result = traces;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = traces.filter((trace) => {
        // Search in trace ID
        if (trace.traceId.toLowerCase().includes(query)) return true;
        // Search in scope name
        const scope = getPrimaryScope(trace);
        if (scope?.name.toLowerCase().includes(query)) return true;
        // Search in trace name
        if (trace.name.toLowerCase().includes(query)) return true;
        return false;
      });
    }

    // Sort by start time (most recent first)
    return [...result].sort((a, b) => b.startTime - a.startTime);
  }, [traces, searchQuery]);

  // Format duration for display
  const formatDuration = (durationMs: number): string => {
    if (durationMs < 1) {
      return `${(durationMs * 1000).toFixed(0)}µs`;
    } else if (durationMs < 1000) {
      return `${durationMs.toFixed(0)}ms`;
    } else {
      return `${(durationMs / 1000).toFixed(2)}s`;
    }
  };

  // Truncate trace ID for display (first 12 characters)
  const truncateTraceId = (traceId: string): string => {
    return traceId.slice(0, 12);
  };

  // Handle trace ID click - select trace to show details
  const handleTraceIdClick = (trace: RegisteredTrace, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click (expansion toggle)
    onTraceSelect?.(trace);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minWidth: 0,
        gap: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Search Bar with Clear All button - only show when more than 5 traces */}
      {showSearch && traces.length > 5 && (
        <div
          style={{
            display: 'flex',
            gap: 0,
            flexShrink: 0,
            minWidth: 0,
            width: '100%',
            padding: 0,
            borderBottom: `1px solid ${theme.colors.border}`,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: 1,
              minWidth: 0,
            }}
          >
            <Search
              size={16}
              color={theme.colors.textSecondary}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search traces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 32px 8px 32px',
                fontSize: theme.fontSizes[1],
                fontFamily: theme.fonts.body,
                border: `1px solid ${theme.colors.border}`,
                borderRight: 'none',
                borderRadius: 0,
                background: theme.colors.backgroundSecondary,
                color: theme.colors.text,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.colors.textSecondary,
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {onClearAll && (
            <button
              onClick={onClearAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[1],
                padding: `${theme.space[1]}px ${theme.space[2]}px`,
                fontSize: theme.fontSizes[1],
                fontFamily: theme.fonts.body,
                color: theme.colors.error,
                background: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 0,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${theme.colors.error}10`;
                e.currentTarget.style.borderColor = theme.colors.error;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = theme.colors.border;
              }}
            >
              <Trash2 size={14} />
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Trace List */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {filteredTraces.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontFamily: theme.fonts.body,
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes[2],
              padding: theme.space[4],
              textAlign: 'center',
            }}
          >
            {searchQuery ? 'No traces match your search' : emptyMessage}
          </div>
        ) : (
          filteredTraces.map((trace) => (
            <React.Fragment key={trace.traceId}>
            <div
              onClick={() => onTraceClick?.(trace)}
              style={{
                padding: `${theme.space[3]}px ${theme.space[3]}px`,
                borderBottom: `1px solid ${theme.colors.border}`,
                borderLeft: expandedTraceIds?.has(trace.traceId)
                  ? `2px solid ${theme.colors.primary}`
                  : '2px solid transparent',
                borderTop: 'none',
                borderRight: 'none',
                borderRadius: 0,
                background:
                  expandedTraceIds?.has(trace.traceId)
                    ? `${theme.colors.primary}10`
                    : theme.colors.backgroundSecondary,
                cursor: onTraceClick ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: theme.space[2],
                minWidth: 0,
                width: '100%',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                if (onTraceClick && !expandedTraceIds?.has(trace.traceId)) {
                  e.currentTarget.style.background = `${theme.colors.primary}05`;
                }
              }}
              onMouseLeave={(e) => {
                if (onTraceClick && !expandedTraceIds?.has(trace.traceId)) {
                  e.currentTarget.style.background = theme.colors.backgroundSecondary;
                }
              }}
            >
              {/* Header Row: Operation Name + Trace ID + Status */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: theme.space[2],
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.space[1],
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {/* Trace name + Duration */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.space[2],
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: theme.fonts.body,
                        fontSize: theme.fontSizes[2],
                        fontWeight: theme.fontWeights.medium,
                        color: trace.hasErrors ? theme.colors.error : theme.colors.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {trace.name || 'Unknown Operation'}
                    </span>
                    <span
                      style={{
                        fontFamily: theme.fonts.body,
                        fontSize: theme.fontSizes[1],
                        color: theme.colors.textSecondary,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {formatDuration(trace.duration)}
                    </span>
                  </div>

                  {/* Service name + Span Count */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.space[2],
                      fontFamily: theme.fonts.body,
                      fontSize: theme.fontSizes[1],
                      minWidth: 0,
                    }}
                  >
                    {(() => {
                      const scope = getPrimaryScope(trace);
                      if (!scope) return null;

                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: theme.space[1],
                            padding: '2px 8px',
                            fontFamily: theme.fonts.body,
                            fontSize: theme.fontSizes[1],
                            backgroundColor: `${theme.colors.primary}15`,
                            color: theme.colors.primary,
                            border: `1px solid ${theme.colors.primary}40`,
                            borderRadius: '3px',
                            fontWeight: theme.fontWeights.medium,
                            overflow: 'hidden',
                            minWidth: 0,
                          }}
                          title={`${scope.name}@${scope.version}`}
                        >
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {scope.name}
                          </span>
                          {scope.version !== 'unknown' && (
                            <>
                              <span style={{ color: `${theme.colors.primary}80` }}>@</span>
                              <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {scope.version}
                              </span>
                            </>
                          )}
                        </span>
                      );
                    })()}
                    {(() => {
                      const matchedSpanCount = trace.scenarioMatches?.reduce(
                        (sum, match) => sum + match.matchedSpans.length,
                        0
                      ) ?? 0;
                      const showFraction = matchedSpanCount > 0 && matchedSpanCount < trace.spanCount;

                      return (
                        <span
                          style={{
                            fontFamily: theme.fonts.body,
                            color: theme.colors.textSecondary,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          {showFraction
                            ? `${matchedSpanCount}/${trace.spanCount} matched spans`
                            : `${trace.spanCount} ${trace.spanCount === 1 ? 'span' : 'spans'}`}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Trace ID and Remove button */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: theme.space[1],
                    flexShrink: 0,
                  }}
                >
                  <code
                    onClick={(e) => handleTraceIdClick(trace, e)}
                    title={`View trace ${trace.traceId}`}
                    style={{
                      fontSize: theme.fontSizes[1],
                      fontFamily: theme.fonts.monospace,
                      color: onTraceSelect ? theme.colors.primary : theme.colors.textMuted,
                      whiteSpace: 'nowrap',
                      cursor: onTraceSelect ? 'pointer' : 'default',
                      padding: '2px 4px',
                      borderRadius: theme.radii[1],
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (onTraceSelect) {
                        e.currentTarget.style.background = `${theme.colors.primary}15`;
                        e.currentTarget.style.color = theme.colors.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (onTraceSelect) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = theme.colors.primary;
                      }
                    }}
                  >
                    {truncateTraceId(trace.traceId)}
                  </code>
                  {onRemoveTrace && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTrace(trace);
                      }}
                      title="Remove trace"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.space[1],
                        padding: '2px 6px',
                        fontSize: theme.fontSizes[0],
                        fontFamily: theme.fonts.body,
                        color: theme.colors.textSecondary,
                        background: 'transparent',
                        border: 'none',
                        borderRadius: theme.radii[1],
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = theme.colors.error;
                        e.currentTarget.style.background = `${theme.colors.error}10`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme.colors.textSecondary;
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <X size={12} />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              </div>

            {/* Trace Expansion - Show detailed workflow matching when trace is selected */}
            {expandedTraceIds?.has(trace.traceId) && (
              <div
                style={{
                  borderLeft: `2px solid ${theme.colors.primary}`,
                  paddingLeft: theme.space[3],
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                <TraceExpansion
                  trace={trace}
                  theme={theme}
                  onSpanClick={() => onTraceSelect?.(trace)}
                  onWorkflowClick={(storyboardId, workflowId, scenarioId, spanId) =>
                    onWorkflowClick?.(trace, storyboardId, workflowId, scenarioId, spanId)
                  }
                  scenarioVisibilityMap={scenarioVisibilityMap}
                  onScenarioVisibilityToggle={onScenarioVisibilityToggle}
                />
              </div>
            )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};
