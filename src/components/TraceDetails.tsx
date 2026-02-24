import React, { useState } from 'react';
import type { Theme } from '@principal-ade/industry-theme';
import type { OtelSpanData } from '@principal-ai/principal-view-core';
import { getSpanDuration } from '@principal-ai/principal-view-core';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

type OtelSpan = OtelSpanData;

/**
 * Scope information for grouping spans
 */
export interface ScopeInfo {
  /** Scope name (e.g., "@opentelemetry/instrumentation-http" or "pkg:npm/@acme/auth") */
  name: string;
  /** Scope version */
  version?: string;
  /** Span IDs that belong to this scope */
  spanIds: string[];
}

export interface TraceDetailsProps {
  spans: OtelSpan[];
  theme: Theme;
  /** Optional scope information for grouping spans by scope */
  scopes?: ScopeInfo[];
  /** Callback when copying a span */
  onCopySpan?: (span: OtelSpan) => void;
}

interface SpanNode {
  span: OtelSpan;
  children: SpanNode[];
  depth: number;
}

/**
 * TraceDetails - Simple view of trace spans
 *
 * Shows spans in a tree structure with key information:
 * - Span name
 * - Duration
 * - Status (success/error)
 * - Attributes (expandable)
 *
 * When scopes are provided, groups spans by scope for better organization.
 */
export const TraceDetails: React.FC<TraceDetailsProps> = ({ spans, theme, scopes, onCopySpan }) => {
  // Initialize with all spans expanded by default
  const [expandedSpans, setExpandedSpans] = useState<Set<string>>(() => {
    return new Set(spans.map(span => span.spanId));
  });
  const [expandedAttributes, setExpandedAttributes] = useState<Set<string>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [expandedScopes, setExpandedScopes] = useState<Set<string>>(() => {
    return new Set(scopes?.map(s => s.name) || []);
  });
  const [copiedSpanId, setCopiedSpanId] = useState<string | null>(null);

  // Build tree structure from flat span list
  const buildSpanTree = (spans: OtelSpan[]): SpanNode[] => {
    const spanMap = new Map<string, SpanNode>();
    const roots: SpanNode[] = [];

    // Create nodes
    spans.forEach(span => {
      spanMap.set(span.spanId, { span, children: [], depth: 0 });
    });

    // Build tree
    spans.forEach(span => {
      const node = spanMap.get(span.spanId)!;
      if (!span.parentSpanId || span.parentSpanId === '') {
        roots.push(node);
      } else {
        const parent = spanMap.get(span.parentSpanId);
        if (parent) {
          node.depth = parent.depth + 1;
          parent.children.push(node);
        } else {
          roots.push(node); // Orphaned span
        }
      }
    });

    return roots;
  };

  const spanTree = buildSpanTree(spans);

  const toggleSpan = (spanId: string) => {
    setExpandedSpans(prev => {
      const next = new Set(prev);
      if (next.has(spanId)) {
        next.delete(spanId);
      } else {
        next.add(spanId);
      }
      return next;
    });
  };

  const toggleAttributes = (spanId: string) => {
    setExpandedAttributes(prev => {
      const next = new Set(prev);
      if (next.has(spanId)) {
        next.delete(spanId);
      } else {
        next.add(spanId);
      }
      return next;
    });
  };

  const toggleEvents = (spanId: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(spanId)) {
        next.delete(spanId);
      } else {
        next.add(spanId);
      }
      return next;
    });
  };

  const toggleScope = (scopeName: string) => {
    setExpandedScopes(prev => {
      const next = new Set(prev);
      if (next.has(scopeName)) {
        next.delete(scopeName);
      } else {
        next.add(scopeName);
      }
      return next;
    });
  };

  const handleCopySpan = async (span: OtelSpan) => {
    if (onCopySpan) {
      onCopySpan(span);
    } else {
      try {
        await navigator.clipboard.writeText(JSON.stringify(span, null, 2));
        setCopiedSpanId(span.spanId);
        setTimeout(() => setCopiedSpanId(null), 2000);
      } catch (err) {
        console.error('Failed to copy span:', err);
      }
    }
  };

  const formatDuration = (durationMs: number): string => {
    if (durationMs < 1) {
      return `${(durationMs * 1000).toFixed(0)}µs`;
    } else if (durationMs < 1000) {
      return `${durationMs.toFixed(0)}ms`;
    } else {
      return `${(durationMs / 1000).toFixed(2)}s`;
    }
  };

  const hasError = (span: OtelSpan): boolean => {
    return span.status?.code === 2 || // 2 = ERROR status code
           span.events?.some(e => e.name === 'exception') ||
           false;
  };

  const renderSpanNode = (node: SpanNode): React.ReactNode => {
    const { span, children, depth } = node;
    const isExpanded = expandedSpans.has(span.spanId);
    const showAttributes = expandedAttributes.has(span.spanId);
    const hasChildren = children.length > 0;
    const duration = getSpanDuration(span);
    const error = hasError(span);

    return (
      <div key={span.spanId} style={{ width: '100%' }}>
        {/* Span Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.space[3],
            padding: `${theme.space[2]}px ${theme.space[3]}px`,
            paddingLeft: `${theme.space[3] + depth * 32}px`,
            borderBottom: `1px solid ${theme.colors.border}`,
            background: theme.colors.backgroundSecondary,
            cursor: hasChildren ? 'pointer' : 'default',
          }}
          onClick={() => hasChildren && toggleSpan(span.spanId)}
        >
          
          {/* Span Name */}
          <span
            style={{
              flex: 1,
              fontSize: theme.fontSizes[2],
              color: error ? theme.colors.error : theme.colors.success,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {span.name}
          </span>

          {/* Duration */}
          <span
            style={{
              fontSize: theme.fontSizes[1],
              color: theme.colors.textSecondary,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {formatDuration(duration)}
          </span>

          
          {/* Attributes Toggle */}
          {span.attributes && span.attributes.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleAttributes(span.spanId);
              }}
              style={{
                fontSize: theme.fontSizes[1],
                color: showAttributes ? theme.colors.text : theme.colors.textMuted,
                background: showAttributes ? theme.colors.primary + '20' : 'transparent',
                border: `1px solid ${showAttributes ? theme.colors.primary : theme.colors.border}`,
                borderRadius: theme.radii[1],
                padding: '4px 8px',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              {span.attributes.length} attrs
            </button>
          )}

          {/* Events Toggle */}
          {(() => {
            const hasEvents = span.events && span.events.length > 0;
            const isExpanded = expandedEvents.has(span.spanId);
            return (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasEvents) {
                    toggleEvents(span.spanId);
                  }
                }}
                style={{
                  fontSize: theme.fontSizes[1],
                  color: isExpanded ? theme.colors.text : hasEvents ? theme.colors.textMuted : theme.colors.textMuted,
                  background: isExpanded ? theme.colors.primary + '20' : 'transparent',
                  border: `1px solid ${isExpanded ? theme.colors.primary : theme.colors.border}`,
                  borderRadius: theme.radii[1],
                  padding: '4px 8px',
                  cursor: hasEvents ? 'pointer' : 'default',
                  flexShrink: 0,
                  opacity: hasEvents ? 1 : 0.5,
                  transition: 'all 0.15s ease',
                }}
              >
                {span.events?.length || 0} {(span.events?.length || 0) === 1 ? 'event' : 'events'}
              </button>
            );
          })()}

          {/* Copy Span Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopySpan(span);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: theme.fontSizes[1],
              color: copiedSpanId === span.spanId ? theme.colors.success : theme.colors.textMuted,
              background: 'transparent',
              border: `1px solid ${copiedSpanId === span.spanId ? theme.colors.success : theme.colors.border}`,
              borderRadius: theme.radii[1],
              padding: '4px 8px',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            title="Copy span as JSON"
          >
            {copiedSpanId === span.spanId ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>

        {/* Attributes Section */}
        {showAttributes && span.attributes && span.attributes.length > 0 && (
          <div
            style={{
              padding: theme.space[3],
              paddingLeft: `${theme.space[4] + depth * 32 + 20}px`,
              background: theme.colors.background,
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: `${theme.space[2]}px ${theme.space[3]}px`,
                fontSize: theme.fontSizes[1],
              }}
            >
              {span.attributes.map((attr, idx) => {
                const value =
                  attr.value.stringValue ??
                  attr.value.intValue ??
                  attr.value.doubleValue ??
                  attr.value.boolValue?.toString() ??
                  '[complex]';

                return (
                  <React.Fragment key={idx}>
                    <span
                      style={{
                        color: theme.colors.textSecondary,
                        fontFamily: theme.fonts.monospace,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {attr.key}:
                    </span>
                    <span
                      style={{
                        color: theme.colors.textMuted,
                        fontFamily: theme.fonts.monospace,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {value}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Events Section */}
        {expandedEvents.has(span.spanId) && span.events && span.events.length > 0 && (
          <div
            style={{
              padding: theme.space[3],
              paddingLeft: `${theme.space[4] + depth * 32 + 20}px`,
              background: theme.colors.background,
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            {span.events.map((event, idx) => (
              <div
                key={idx}
                style={{
                  padding: theme.space[2],
                  background: theme.colors.backgroundSecondary,
                  borderRadius: theme.radii[1],
                  marginBottom: idx < span.events.length - 1 ? theme.space[2] : 0,
                }}
              >
                <div
                  style={{
                    fontSize: theme.fontSizes[2],
                    color: theme.colors.text,
                    fontFamily: theme.fonts.monospace,
                    marginBottom: event.attributes && event.attributes.length > 0 ? theme.space[1] : 0,
                  }}
                >
                  {event.name}
                </div>
                {event.attributes && event.attributes.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      gap: `${theme.space[1]}px ${theme.space[2]}px`,
                      fontSize: theme.fontSizes[1],
                    }}
                  >
                    {event.attributes.map((attr, attrIdx) => {
                      const value =
                        attr.value.stringValue ??
                        attr.value.intValue ??
                        attr.value.doubleValue ??
                        attr.value.boolValue?.toString() ??
                        '[complex]';

                      return (
                        <React.Fragment key={attrIdx}>
                          <span
                            style={{
                              color: theme.colors.textSecondary,
                              fontFamily: theme.fonts.monospace,
                            }}
                          >
                            {attr.key}:
                          </span>
                          <span
                            style={{
                              color: theme.colors.textMuted,
                              fontFamily: theme.fonts.monospace,
                            }}
                          >
                            {value}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Render Children */}
        {isExpanded && children.map(child => renderSpanNode(child))}
      </div>
    );
  };

  // Build span lookup for scope grouping
  const spanById = new Map(spans.map(s => [s.spanId, s]));

  // Render a scope section with its spans
  const renderScopeSection = (scope: ScopeInfo) => {
    const scopeSpans = scope.spanIds
      .map(id => spanById.get(id))
      .filter((s): s is OtelSpan => s !== undefined);

    if (scopeSpans.length === 0) return null;

    const isExpanded = expandedScopes.has(scope.name);
    const scopeTree = buildSpanTree(scopeSpans);

    return (
      <div key={scope.name} style={{ marginBottom: theme.space[2] }}>
        {/* Scope Header */}
        <div
          onClick={() => toggleScope(scope.name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.space[2],
            padding: `${theme.space[2]}px ${theme.space[3]}px`,
            background: theme.colors.backgroundTertiary || theme.colors.backgroundSecondary,
            borderBottom: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {isExpanded ? (
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          ) : (
            <ChevronRight size={16} color={theme.colors.textSecondary} />
          )}
          <span
            style={{
              fontSize: theme.fontSizes[2],
              fontWeight: theme.fontWeights.medium,
              color: theme.colors.text,
              fontFamily: theme.fonts.monospace,
            }}
          >
            {scope.name}
          </span>
          {scope.version && (
            <span
              style={{
                fontSize: theme.fontSizes[1],
                color: theme.colors.textMuted,
              }}
            >
              v{scope.version}
            </span>
          )}
          <span
            style={{
              fontSize: theme.fontSizes[1],
              color: theme.colors.textSecondary,
              marginLeft: 'auto',
            }}
          >
            {scopeSpans.length} {scopeSpans.length === 1 ? 'span' : 'spans'}
          </span>
        </div>

        {/* Scope Spans */}
        {isExpanded && (
          <div>
            {scopeTree.map(node => renderSpanNode(node))}
          </div>
        )}
      </div>
    );
  };

  if (spans.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.colors.textSecondary,
          fontSize: theme.fontSizes[3],
        }}
      >
        No spans available
      </div>
    );
  }

  // If scopes provided, render grouped by scope
  if (scopes && scopes.length > 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          overflowY: 'auto',
          background: theme.colors.background,
        }}
      >
        {scopes.map(scope => renderScopeSection(scope))}
      </div>
    );
  }

  // Default: flat tree view
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        background: theme.colors.background,
      }}
    >
      {spanTree.map(node => renderSpanNode(node))}
    </div>
  );
};
