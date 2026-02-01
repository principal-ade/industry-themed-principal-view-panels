import React, { useState, useRef, useMemo } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { TraceList } from '../components/TraceList';
import { groupSpansByTrace } from '../types/otel';
import type { TraceInfo } from '../types/otel';
import { generateRandomTraces, generateCheckoutTrace, generateAuthErrorTrace, generateComplexTrace } from '../mocks/otelMocks';

/**
 * TraceListPanel - Panel for displaying OpenTelemetry traces
 *
 * This panel shows:
 * - List of traces with metadata
 * - Search/filter functionality
 * - Click to select and emit events for trace details
 *
 * Events emitted:
 * - 'custom' with action 'selectTrace' when a trace is clicked
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

  // TODO: Replace with actual trace data from context/telemetry provider
  // For now, using mock data
  const mockTraces = useMemo(() => {
    const checkout = generateCheckoutTrace(true);
    const auth = generateAuthErrorTrace(true);
    const complex = generateComplexTrace(true);
    const random = generateRandomTraces(10);

    const combined = {
      resourceSpans: [
        ...checkout.resourceSpans,
        ...auth.resourceSpans,
        ...complex.resourceSpans,
        ...random.resourceSpans,
      ],
    };

    return groupSpansByTrace(combined);
  }, []);

  const handleTraceClick = (trace: TraceInfo) => {
    setSelectedTraceId(trace.traceId);

    // Emit event for other panels (like TraceDetailsPanel) to handle
    if (events) {
      events.emit({
        type: 'custom',
        source: 'trace-list-panel',
        timestamp: Date.now(),
        payload: {
          action: 'selectTrace',
          trace,
        },
      });
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
        traces={mockTraces}
        theme={theme}
        onTraceClick={handleTraceClick}
        selectedTraceId={selectedTraceId}
      />
    </div>
  );
};
