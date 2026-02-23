import React, { useRef, useState } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { Copy, Check } from 'lucide-react';
import { TraceDetails } from '../components/TraceDetails';
import type { RegisteredTrace } from '../types/otel';
import { getRootSpan, getSpansFromTrace } from '../types/otel';
import { getServiceName, getPrimaryStoryboardId, isTraceMatched } from '../utils/traceHelpers';

export interface TraceDetailsPanelProps extends PanelComponentProps {
  /**
   * Optional trace to display.
   * If provided, this takes precedence over context/event-driven modes.
   * This allows the host to control panel state via props instead of events.
   */
  selectedTrace?: RegisteredTrace | null;
}

/**
 * TraceDetailsPanel - Panel for displaying detailed trace information
 *
 * This panel shows:
 * - Detailed span tree for a selected trace
 * - Span attributes and events
 * - Expandable/collapsible spans
 *
 * Prop-controlled mode (recommended):
 * - Pass `selectedTrace` prop to control what trace is displayed
 * - Panel content loads immediately when prop changes
 */
export const TraceDetailsPanel: React.FC<TraceDetailsPanelProps> = ({
  context: _context,
  actions: _actions,
  events,
  selectedTrace,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  usePanelFocusListener('trace-details', events, () => panelRef.current?.focus());

  const handleCopyTrace = async () => {
    if (!selectedTrace) return;

    // Prefer raw OTLP data, fall back to full trace
    const dataToCopy = selectedTrace.otlpData || selectedTrace;

    try {
      await navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy trace:', err);
    }
  };

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      style={{
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        outline: 'none',
      }}
    >
      {selectedTrace ? (
        <>
          {/* Header with trace info */}
          <div
            style={{
              padding: '16px',
              borderBottom: `1px solid ${theme.colors.border}`,
              background: theme.colors.backgroundSecondary,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: theme.space[3],
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: theme.fontSizes[3],
                  fontWeight: theme.fontWeights.medium,
                  color: theme.colors.text,
                  marginBottom: theme.space[1],
                }}
              >
                {getRootSpan(selectedTrace)?.name || selectedTrace.name || 'Trace Details'}
              </div>
              <div
                style={{
                  fontSize: theme.fontSizes[1],
                  color: theme.colors.textMuted,
                }}
              >
                {(() => {
                  const serviceName = getServiceName(selectedTrace);
                  const matched = isTraceMatched(selectedTrace);
                  const storyboardId = getPrimaryStoryboardId(selectedTrace);

                  return (
                    <>
                      {serviceName !== 'unknown' && `${serviceName} • `}
                      {selectedTrace.spanCount} {selectedTrace.spanCount === 1 ? 'span' : 'spans'}
                      {matched && storyboardId && ` • Matched: ${storyboardId}`}
                    </>
                  );
                })()}
              </div>
            </div>
            <button
              onClick={handleCopyTrace}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[1],
                padding: `${theme.space[1]} ${theme.space[2]}`,
                fontSize: theme.fontSizes[1],
                color: copied ? theme.colors.success : theme.colors.textSecondary,
                background: 'transparent',
                border: `1px solid ${copied ? theme.colors.success : theme.colors.border}`,
                borderRadius: theme.radii[1],
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Full Trace'}
            </button>
          </div>

          {/* Trace details */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <TraceDetails key={selectedTrace.traceId} spans={getSpansFromTrace(selectedTrace)} theme={theme} />
          </div>
        </>
      ) : (
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
          Select a trace to view details
        </div>
      )}
    </div>
  );
};
