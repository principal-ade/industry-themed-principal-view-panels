import React, { useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { TraceDetails } from '../components/TraceDetails';
import type { TraceInfo } from '../types/otel';

export interface TraceDetailsPanelProps extends PanelComponentProps {
  /**
   * Optional trace to display.
   * If provided, this takes precedence over context/event-driven modes.
   * This allows the host to control panel state via props instead of events.
   */
  selectedTrace?: TraceInfo | null;
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

  usePanelFocusListener('trace-details', events, () => panelRef.current?.focus());

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
            }}
          >
            <div
              style={{
                fontSize: theme.fontSizes[3],
                fontWeight: theme.fontWeights.medium,
                color: theme.colors.text,
                marginBottom: theme.space[1],
              }}
            >
              {selectedTrace.rootSpan?.name || 'Trace Details'}
            </div>
            <div
              style={{
                fontSize: theme.fontSizes[1],
                color: theme.colors.textMuted,
              }}
            >
              {selectedTrace.serviceName && `${selectedTrace.serviceName} • `}
              {selectedTrace.spanCount} {selectedTrace.spanCount === 1 ? 'span' : 'spans'}
              {selectedTrace.matchedWorkflows && selectedTrace.matchedWorkflows.length > 0 &&
                ` • ${selectedTrace.matchedWorkflows.length} workflow${selectedTrace.matchedWorkflows.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          {/* Trace details */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <TraceDetails key={selectedTrace.traceId} spans={selectedTrace.spans} theme={theme} />
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
