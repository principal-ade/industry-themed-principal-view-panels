import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Search, Trash2, X } from 'lucide-react';
import type { Theme } from '@principal-ade/industry-theme';
import type { TraceInfo } from '../types/otel';

export interface TraceListProps {
  traces: TraceInfo[];
  theme: Theme;
  onTraceClick?: (trace: TraceInfo) => void;
  onClearAll?: () => void;
  selectedTraceId?: string;
  showSearch?: boolean;
  emptyMessage?: string;
}

interface GroupedTrace {
  key: string;
  traces: TraceInfo[];
  representative: TraceInfo; // Most recent trace in the group
  count: number;
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
  onClearAll,
  selectedTraceId,
  showSearch = true,
  emptyMessage = 'No traces available',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filter traces by search query
  const filteredTraces = useMemo(() => {
    if (!searchQuery.trim()) {
      return traces;
    }

    const query = searchQuery.toLowerCase().trim();
    return traces.filter((trace) => {
      // Search in trace ID
      if (trace.traceId.toLowerCase().includes(query)) return true;
      // Search in service name
      if (trace.serviceName?.toLowerCase().includes(query)) return true;
      // Search in root span name
      if (trace.rootSpan?.name.toLowerCase().includes(query)) return true;
      return false;
    });
  }, [traces, searchQuery]);

  // Group traces by root span name, error status, and workflow matching
  const groupedTraces = useMemo((): GroupedTrace[] => {
    const groups = new Map<string, TraceInfo[]>();

    for (const trace of filteredTraces) {
      // Create a key based on: root span name, error status, workflow presence
      const rootSpanName = trace.rootSpan?.name || 'Unknown Operation';
      const hasErrors = trace.hasErrors ? 'error' : 'success';
      const hasWorkflow = trace.matchedWorkflow ? 'matched' : 'unmatched';
      const key = `${rootSpanName}|${hasErrors}|${hasWorkflow}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(trace);
    }

    // Convert to GroupedTrace array
    return Array.from(groups.entries()).map(([key, traces]) => {
      // Sort traces by start time (most recent first)
      const sortedTraces = [...traces].sort((a, b) => b.startTime - a.startTime);

      return {
        key,
        traces: sortedTraces,
        representative: sortedTraces[0], // Most recent
        count: sortedTraces.length,
      };
    });
  }, [filteredTraces]);

  // Toggle group expansion
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

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

  // Track copied trace IDs
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

  // Handle trace ID copy
  const handleCopyTraceId = (traceId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent trace selection
    navigator.clipboard.writeText(traceId).then(() => {
      setCopiedTraceId(traceId);
      setTimeout(() => setCopiedTraceId(null), 2000);
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minWidth: 0,
        gap: theme.space[2],
        boxSizing: 'border-box',
      }}
    >
      {/* Search Bar with Clear All button */}
      {showSearch && traces.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: theme.space[2],
            flexShrink: 0,
            minWidth: 0,
            width: '100%',
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
                borderRadius: theme.radii[2],
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
                padding: `${theme.space[1]} ${theme.space[2]}`,
                fontSize: theme.fontSizes[1],
                fontFamily: theme.fonts.body,
                color: theme.colors.error,
                background: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[2],
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
          gap: theme.space[2],
        }}
      >
        {groupedTraces.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes[2],
              padding: theme.space[4],
              textAlign: 'center',
            }}
          >
            {searchQuery ? 'No traces match your search' : emptyMessage}
          </div>
        ) : (
          groupedTraces.map((group) => {
            const isExpanded = expandedGroups.has(group.key);
            const isGrouped = group.count > 1;
            const tracesToShow = isExpanded ? group.traces : [group.representative];

            return (
              <div key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: theme.space[1] }}>
                {tracesToShow.map((trace, index) => {
                  const isRepresentative = index === 0;
                  return (
            <div
              key={trace.traceId}
              onClick={() => onTraceClick?.(trace)}
              style={{
                padding: theme.space[3],
                border: `1px solid ${
                  selectedTraceId === trace.traceId
                    ? theme.colors.primary
                    : theme.colors.border
                }`,
                borderRadius: theme.radii[2],
                background:
                  selectedTraceId === trace.traceId
                    ? `${theme.colors.primary}10`
                    : theme.colors.backgroundSecondary,
                cursor: onTraceClick ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: theme.space[2],
                minWidth: 0,
                width: !isRepresentative && isExpanded ? `calc(100% - ${theme.space[3]})` : '100%',
                boxSizing: 'border-box',
                marginLeft: !isRepresentative && isExpanded ? theme.space[3] : '0',
                opacity: !isRepresentative && isExpanded ? 0.9 : 1,
              }}
              onMouseEnter={(e) => {
                if (onTraceClick && selectedTraceId !== trace.traceId) {
                  e.currentTarget.style.borderColor = theme.colors.primary;
                  e.currentTarget.style.background = `${theme.colors.primary}05`;
                }
              }}
              onMouseLeave={(e) => {
                if (onTraceClick && selectedTraceId !== trace.traceId) {
                  e.currentTarget.style.borderColor = theme.colors.border;
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
                  {/* Root span name (operation) - Primary */}
                  <span
                    style={{
                      fontSize: theme.fontSizes[2],
                      fontWeight: theme.fontWeights.medium,
                      color: theme.colors.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {trace.rootSpan?.name || 'Unknown Operation'}
                  </span>

                  {/* Service name + Duration + Span Count */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.space[2],
                      fontSize: theme.fontSizes[0],
                      minWidth: 0,
                    }}
                  >
                    {trace.serviceName && (
                      <span
                        style={{
                          color: theme.colors.textMuted,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0,
                        }}
                      >
                        {trace.serviceName}
                      </span>
                    )}
                    <span
                      style={{
                        color: theme.colors.textMuted,
                        flexShrink: 0,
                      }}
                    >
                      •
                    </span>
                    <span
                      style={{
                        color: theme.colors.textSecondary,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {formatDuration(trace.duration)}
                    </span>
                    <span
                      style={{
                        color: theme.colors.textMuted,
                        flexShrink: 0,
                      }}
                    >
                      •
                    </span>
                    <span
                      style={{
                        color: theme.colors.textSecondary,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {trace.spanCount} {trace.spanCount === 1 ? 'span' : 'spans'}
                    </span>
                  </div>
                </div>

                {/* Trace ID + Status Icon */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.space[2],
                    flexShrink: 0,
                  }}
                >
                  <code
                    onClick={(e) => handleCopyTraceId(trace.traceId, e)}
                    title={copiedTraceId === trace.traceId ? 'Copied!' : trace.traceId}
                    style={{
                      fontSize: theme.fontSizes[0],
                      fontFamily: theme.fonts.monospace,
                      color: copiedTraceId === trace.traceId ? theme.colors.success || '#22c55e' : theme.colors.textMuted,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: theme.radii[1],
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (copiedTraceId !== trace.traceId) {
                        e.currentTarget.style.background = theme.colors.backgroundSecondary;
                        e.currentTarget.style.color = theme.colors.text;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copiedTraceId !== trace.traceId) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = theme.colors.textMuted;
                      }
                    }}
                  >
                    {copiedTraceId === trace.traceId ? '✓ Copied' : truncateTraceId(trace.traceId)}
                  </code>
                  {trace.hasErrors ? (
                    <AlertCircle
                      size={16}
                      color={theme.colors.error}
                      style={{ flexShrink: 0 }}
                    />
                  ) : (
                    <CheckCircle
                      size={16}
                      color={theme.colors.success || '#22c55e'}
                      style={{ flexShrink: 0 }}
                    />
                  )}
                </div>
              </div>

              {/* Workflow Information Row with Count Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: theme.space[2],
                  minWidth: 0,
                }}
              >
                {trace.matchedWorkflow ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: theme.space[0],
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: theme.fontSizes[0],
                        color: theme.colors.textSecondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {trace.matchedWorkflow.storyboardName}
                    </span>
                    {trace.matchedWorkflow.workflowName && (
                      <span
                        style={{
                          fontSize: theme.fontSizes[0],
                          color: theme.colors.textMuted,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        → {trace.matchedWorkflow.workflowName}
                      </span>
                    )}
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: theme.fontSizes[0],
                      color: theme.colors.textMuted,
                      fontStyle: 'italic',
                      flex: 1,
                    }}
                  >
                    No workflow match
                  </span>
                )}
                {isRepresentative && isGrouped && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(group.key);
                    }}
                    style={{
                      fontSize: theme.fontSizes[0],
                      fontWeight: theme.fontWeights.medium,
                      fontFamily: theme.fonts.body,
                      color: theme.colors.textSecondary,
                      background: `${theme.colors.primary}15`,
                      padding: `2px ${theme.space[2]}`,
                      borderRadius: theme.radii[2],
                      border: `1px solid ${theme.colors.border}`,
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${theme.colors.primary}25`;
                      e.currentTarget.style.borderColor = theme.colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${theme.colors.primary}15`;
                      e.currentTarget.style.borderColor = theme.colors.border;
                    }}
                  >
                    {isExpanded ? `Hide ${group.count - 1} more` : `Show ${group.count - 1} more`}
                  </button>
                )}
              </div>
            </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
