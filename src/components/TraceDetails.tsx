import React, { useState } from 'react';
import type { Theme } from '@principal-ade/industry-theme';
import type { OtelSpanData } from '@principal-ai/principal-view-core';
import { getSpanDuration } from '@principal-ai/principal-view-core';

type OtelSpan = OtelSpanData;

export interface TraceDetailsProps {
  spans: OtelSpan[];
  theme: Theme;
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
 */
export const TraceDetails: React.FC<TraceDetailsProps> = ({ spans, theme }) => {
  // Initialize with all spans expanded by default
  const [expandedSpans, setExpandedSpans] = useState<Set<string>>(() => {
    return new Set(spans.map(span => span.spanId));
  });
  const [expandedAttributes, setExpandedAttributes] = useState<Set<string>>(new Set());

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
                color: theme.colors.textMuted,
                background: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[1],
                padding: '4px 8px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {span.attributes.length} attrs
            </button>
          )}
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

            {/* Events (exceptions, logs) */}
            {span.events && span.events.length > 0 && (
              <div style={{ marginTop: theme.space[2] }}>
                <div
                  style={{
                    fontSize: theme.fontSizes[1],
                    color: theme.colors.textSecondary,
                    fontWeight: theme.fontWeights.medium,
                    marginBottom: theme.space[1],
                  }}
                >
                  Events:
                </div>
                {span.events.map((event, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: theme.space[2],
                      background: theme.colors.backgroundSecondary,
                      borderRadius: theme.radii[1],
                      marginBottom: theme.space[1],
                    }}
                  >
                    <div
                      style={{
                        fontSize: theme.fontSizes[1],
                        color: theme.colors.text,
                        fontFamily: theme.fonts.monospace,
                        marginBottom: theme.space[1],
                      }}
                    >
                      {event.name}
                    </div>
                    {event.attributes && event.attributes.map((attr, attrIdx) => (
                      <div
                        key={attrIdx}
                        style={{
                          fontSize: theme.fontSizes[1],
                          color: theme.colors.textMuted,
                          fontFamily: theme.fonts.monospace,
                        }}
                      >
                        {attr.key}: {attr.value.stringValue || '[complex]'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Render Children */}
        {isExpanded && children.map(child => renderSpanNode(child))}
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
