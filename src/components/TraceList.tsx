import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Trash2, X, Bookmark, BookmarkPlus } from 'lucide-react';
import type { Theme } from '@principal-ade/industry-theme';
import type { RegisteredTrace } from '../types/otel';
import { TraceExpansion } from './TraceExpansion';
import { getPrimaryScope, isTraceMatched } from '../utils/traceHelpers';
import type { PatternMatchResult, TracePattern, SpanPattern } from '../types/tracePatterns';
import { createPatternFromTrace, extractTraceFingerprint } from '../utils/tracePatternMatching';

/**
 * Modal for saving a trace as a pattern
 */
interface SavePatternModalProps {
  trace: RegisteredTrace;
  theme: Theme;
  onSave: (name: string, description: string, hideByDefault: boolean) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const SavePatternModal: React.FC<SavePatternModalProps> = ({
  trace,
  theme,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [name, setName] = useState(trace.name || 'New Pattern');
  const [description, setDescription] = useState('');
  const [hideByDefault, setHideByDefault] = useState(true);

  // Extract fingerprint for preview
  const fingerprint = useMemo(() => extractTraceFingerprint(trace), [trace]);

  const renderSpanPattern = (pattern: SpanPattern, depth: number = 0): React.ReactNode => (
    <div key={`${pattern.name}-${depth}`} style={{ marginLeft: depth * 16 }}>
      <code style={{
        fontSize: theme.fontSizes[0],
        color: theme.colors.text,
        fontFamily: theme.fonts.monospace,
      }}>
        {pattern.name}
      </code>
      {pattern.children?.map((child) => renderSpanPattern(child, depth + 1))}
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: theme.colors.background,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: '24px',
          width: '400px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          margin: '0 0 16px 0',
          fontFamily: theme.fonts.heading,
          fontSize: theme.fontSizes[3],
          color: theme.colors.text,
        }}>
          Save as Pattern
        </h3>

        {/* Name input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: theme.fontSizes[1],
            fontFamily: theme.fonts.body,
            color: theme.colors.textSecondary,
          }}>
            Pattern Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: theme.fontSizes[2],
              fontFamily: theme.fonts.body,
              background: theme.colors.backgroundSecondary,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '4px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Description input */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: theme.fontSizes[1],
            fontFamily: theme.fonts.body,
            color: theme.colors.textSecondary,
          }}>
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this pattern represent?"
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
              background: theme.colors.backgroundSecondary,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '4px',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Fingerprint preview */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: theme.fontSizes[1],
            fontFamily: theme.fonts.body,
            color: theme.colors.textSecondary,
          }}>
            Span Structure ({trace.spanCount} spans)
          </label>
          <div style={{
            padding: '12px',
            background: theme.colors.backgroundSecondary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '4px',
            maxHeight: '150px',
            overflow: 'auto',
          }}>
            {fingerprint.length > 0 ? (
              fingerprint.map((pattern) => renderSpanPattern(pattern, 0))
            ) : (
              <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes[1] }}>
                No spans to capture
              </span>
            )}
          </div>
        </div>

        {/* Hide by default checkbox */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: theme.fontSizes[1],
            fontFamily: theme.fonts.body,
            color: theme.colors.text,
          }}>
            <input
              type="checkbox"
              checked={hideByDefault}
              onChange={(e) => setHideByDefault(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Hide matching traces by default
          </label>
          <div style={{
            marginTop: '4px',
            marginLeft: '24px',
            fontSize: theme.fontSizes[0],
            color: theme.colors.textSecondary,
          }}>
            {hideByDefault
              ? 'Traces matching this pattern will be filtered out of the list'
              : 'Traces will remain visible but show the pattern badge'}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
              color: theme.colors.textSecondary,
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name, description, hideByDefault)}
            disabled={isSaving || !name.trim()}
            style={{
              padding: '8px 16px',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
              color: 'white',
              background: '#06b6d4',
              border: 'none',
              borderRadius: '4px',
              cursor: isSaving || !name.trim() ? 'not-allowed' : 'pointer',
              opacity: isSaving || !name.trim() ? 0.5 : 1,
            }}
          >
            {isSaving ? 'Saving...' : 'Save Pattern'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  /** Map of trace IDs to their pattern matches */
  patternMatches?: Map<string, PatternMatchResult>;
  /** Callback to save a trace as a new pattern */
  onSaveAsPattern?: (pattern: TracePattern) => Promise<void>;
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
  patternMatches,
  onSaveAsPattern,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [savingPatternForTraceId, setSavingPatternForTraceId] = useState<string | null>(null);
  const [modalTraceId, setModalTraceId] = useState<string | null>(null);

  // Find trace for modal
  const modalTrace = modalTraceId ? traces.find(t => t.traceId === modalTraceId) : null;

  // Open modal
  const handleOpenSavePatternModal = (trace: RegisteredTrace, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setModalTraceId(trace.traceId);
  };

  // Save pattern from modal
  const handleSavePattern = async (name: string, description: string, hideByDefault: boolean) => {
    if (!onSaveAsPattern || !modalTrace) return;

    setSavingPatternForTraceId(modalTrace.traceId);
    try {
      const pattern = createPatternFromTrace(modalTrace, name, description, hideByDefault);
      await onSaveAsPattern(pattern);
      setModalTraceId(null);
    } catch (err) {
      console.error('[TraceList] Failed to save pattern:', err);
    } finally {
      setSavingPatternForTraceId(null);
    }
  };

  // Cancel modal
  const handleCancelModal = () => {
    setModalTraceId(null);
  };

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

                      // Determine badge color based on match status
                      const matchedSpanCount = trace.scenarioMatches?.reduce(
                        (sum, match) => sum + match.matchedSpans.length,
                        0
                      ) ?? 0;
                      const hasMatches = matchedSpanCount > 0;
                      const allMatched = matchedSpanCount === trace.spanCount;

                      // Color: green (all matched), yellow (partial), muted (none)
                      const badgeColor = allMatched
                        ? theme.colors.success
                        : hasMatches
                          ? theme.colors.warning
                          : theme.colors.textMuted;

                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: theme.space[1],
                            padding: '2px 8px',
                            fontFamily: theme.fonts.body,
                            fontSize: theme.fontSizes[1],
                            backgroundColor: `${badgeColor}15`,
                            color: badgeColor,
                            border: `1px solid ${badgeColor}40`,
                            borderRadius: '3px',
                            fontWeight: theme.fontWeights.medium,
                            overflow: 'hidden',
                            minWidth: 0,
                          }}
                          title={`${scope.name}@${scope.version}${allMatched ? ' (fully matched)' : hasMatches ? ' (partially matched)' : ' (no matches)'}`}
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
                              <span style={{ color: `${badgeColor}80` }}>@</span>
                              <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {scope.version}
                              </span>
                            </>
                          )}
                        </span>
                      );
                    })()}
                    {/* Pattern badge for unmatched traces */}
                    {(() => {
                      const patternMatch = patternMatches?.get(trace.traceId);
                      if (!patternMatch) return null;

                      // Use a distinct color (cyan/teal) for pattern badges
                      const patternColor = '#06b6d4';

                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: theme.space[1],
                            padding: '2px 8px',
                            fontFamily: theme.fonts.body,
                            fontSize: theme.fontSizes[1],
                            backgroundColor: `${patternColor}15`,
                            color: patternColor,
                            border: `1px solid ${patternColor}40`,
                            borderRadius: '3px',
                            fontWeight: theme.fontWeights.medium,
                            overflow: 'hidden',
                            minWidth: 0,
                          }}
                          title={`Matches pattern: ${patternMatch.patternName}`}
                        >
                          <Bookmark size={12} />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {patternMatch.patternName}
                          </span>
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
                  {/* Save as Pattern button - only for unmatched traces without an existing pattern match */}
                  {onSaveAsPattern && !isTraceMatched(trace) && !patternMatches?.has(trace.traceId) && (
                    <button
                      onClick={(e) => handleOpenSavePatternModal(trace, e)}
                      title="Save trace structure as a reusable pattern"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.space[1],
                        padding: '2px 6px',
                        fontSize: theme.fontSizes[0],
                        fontFamily: theme.fonts.body,
                        color: '#06b6d4',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: theme.radii[1],
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#06b6d410';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <BookmarkPlus size={12} />
                      Save Pattern
                    </button>
                  )}
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

      {/* Save Pattern Modal - rendered via portal */}
      {modalTrace && createPortal(
        <SavePatternModal
          trace={modalTrace}
          theme={theme}
          onSave={handleSavePattern}
          onCancel={handleCancelModal}
          isSaving={savingPatternForTraceId === modalTrace.traceId}
        />,
        document.body
      )}
    </div>
  );
};
