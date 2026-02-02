import React, { useState, useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { TraceList } from '../components/TraceList';
import type { TraceInfo } from '../types/otel';

/**
 * TraceListPanel - Panel for displaying OpenTelemetry traces
 *
 * This panel shows:
 * - List of traces with metadata
 * - Search/filter functionality
 * - Click to select and emit events for trace details
 *
 * Events emitted:
 * - 'trace:selected' when a trace is clicked
 */
export const TraceListPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  usePanelFocusListener('trace-list', events, () => panelRef.current?.focus());
  const [selectedTraceId, setSelectedTraceId] = useState<string | undefined>();

  // Get traces from telemetry slice
  const telemetrySlice = context.getSlice<TraceInfo[]>('telemetry');
  const traces = telemetrySlice?.data || [];

  const handleTraceClick = (trace: TraceInfo) => {
    setSelectedTraceId(trace.traceId);

    // Emit trace:selected event for tab manager to handle
    if (events) {
      events.emit({
        type: 'trace:selected',
        source: 'trace-list-panel',
        timestamp: Date.now(),
        payload: {
          trace,
          traceId: trace.traceId,
        },
      });
    }
  };

  const handleClearAll = () => {
    // Clear selected trace
    setSelectedTraceId(undefined);

    // Call clearTelemetry action if available
    if (actions && 'clearTelemetry' in actions && typeof actions.clearTelemetry === 'function') {
      (actions as { clearTelemetry: () => void }).clearTelemetry();
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
        padding: '16px',
      }}
    >
      <TraceList
        traces={traces}
        theme={theme}
        onTraceClick={handleTraceClick}
        onClearAll={handleClearAll}
        selectedTraceId={selectedTraceId}
        emptyMessage={traces.length === 0 ? 'No traces received yet. Waiting for telemetry data...' : undefined}
      />
    </div>
  );
};
