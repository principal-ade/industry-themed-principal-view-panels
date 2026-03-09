import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useMemo } from 'react';
import { TraceTape } from './TraceTape';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import type { RegisteredTrace } from '../types/otel';
import type { OtelSpanData } from '@principal-ai/principal-view-core';
import {
  generateRandomTraces,
  generateCheckoutTrace,
  generateAuthErrorTrace,
  generateComplexTrace,
  convertToRegisteredTraces,
} from '../mocks/otelMocks';

const meta = {
  title: 'Components/TraceTape',
  component: TraceTape,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A horizontal timeline scrubber for navigating trace spans. Displays all trace spans as vertical lines on a tape, allowing users to scrub through and highlight individual spans.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div
          style={{
            width: '100vw',
            height: '100vh',
            background: '#0a0a0a',
            padding: '48px 24px 24px 24px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof TraceTape>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to use theme and handle span highlighting
const TraceTapeWrapper: React.FC<{
  traces: RegisteredTrace[];
  selectedTraceId?: string;
  focusTraceId?: string | null;
}> = ({ traces, selectedTraceId, focusTraceId }) => {
  const { theme } = useTheme();
  const [highlightedSpanId, setHighlightedSpanId] = useState<string | undefined>();
  const [highlightedSpan, setHighlightedSpan] = useState<OtelSpanData | null>(null);

  const handleSpanHighlight = (spanId: string | null, span: OtelSpanData | null) => {
    setHighlightedSpanId(spanId ?? undefined);
    setHighlightedSpan(span);
    if (span) {
      console.log('Span highlighted:', span.name, spanId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <TraceTape
        traces={traces}
        theme={theme}
        highlightedSpanId={highlightedSpanId}
        selectedTraceId={selectedTraceId}
        focusTraceId={focusTraceId}
        onSpanHighlight={handleSpanHighlight}
      />
      {/* Span info display */}
      <div
        style={{
          padding: '16px',
          background: theme.colors.backgroundSecondary,
          borderRadius: theme.radii[2],
          fontFamily: theme.fonts.monospace,
          fontSize: theme.fontSizes[2],
          color: theme.colors.text,
        }}
      >
        {highlightedSpan ? (
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 600 }}>
              Highlighted Span: {highlightedSpan.name}
            </div>
            <div style={{ color: theme.colors.textSecondary }}>
              Span ID: {highlightedSpan.spanId}
            </div>
          </div>
        ) : (
          <div style={{ color: theme.colors.textMuted }}>
            Click and drag on the tape to highlight spans
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Default story with a few example traces
 */
export const Default: Story = {
  render: () => {
    const checkoutTrace = generateCheckoutTrace(true);
    const authTrace = generateAuthErrorTrace(true);
    const complexTrace = generateComplexTrace(true);

    const combinedResourceSpans = {
      resourceSpans: [
        ...checkoutTrace.resourceSpans,
        ...authTrace.resourceSpans,
        ...complexTrace.resourceSpans,
      ],
    };

    const traces = convertToRegisteredTraces(combinedResourceSpans);

    return <TraceTapeWrapper traces={traces} />;
  },
};

/**
 * Empty state with no traces
 */
const EmptyComponent = () => {
  const { theme } = useTheme();
  return (
    <TraceTape
      traces={[]}
      theme={theme}
      onSpanHighlight={() => {}}
    />
  );
};

export const Empty: Story = {
  render: () => <EmptyComponent />,
};

/**
 * Single trace with multiple spans
 */
export const SingleTrace: Story = {
  render: () => {
    const complexTrace = generateComplexTrace(true);
    const traces = convertToRegisteredTraces(complexTrace);

    return <TraceTapeWrapper traces={traces} />;
  },
};

/**
 * Many traces to demonstrate scrubbing through a dense timeline
 */
export const ManyTraces: Story = {
  render: () => {
    const randomTraces = generateRandomTraces(20);
    const traces = convertToRegisteredTraces(randomTraces);

    return <TraceTapeWrapper traces={traces} />;
  },
};

/**
 * With selected trace - shows highlighted spans with glow effect
 */
const WithSelectedTraceComponent = () => {
  const { theme } = useTheme();
  const [highlightedSpanId, setHighlightedSpanId] = useState<string | undefined>();
  const [selectedTraceId, setSelectedTraceId] = useState<string | undefined>();

  const traces = useMemo(() => {
    const checkoutTrace = generateCheckoutTrace(true);
    const authTrace = generateAuthErrorTrace(true);
    const complexTrace = generateComplexTrace(true);

    const combinedResourceSpans = {
      resourceSpans: [
        ...checkoutTrace.resourceSpans,
        ...authTrace.resourceSpans,
        ...complexTrace.resourceSpans,
      ],
    };

    return convertToRegisteredTraces(combinedResourceSpans);
  }, []);

  // Select first trace by default
  React.useEffect(() => {
    if (traces.length > 0 && !selectedTraceId) {
      setSelectedTraceId(traces[0].traceId);
    }
  }, [traces, selectedTraceId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TraceTape
        traces={traces}
        theme={theme}
        highlightedSpanId={highlightedSpanId}
        selectedTraceId={selectedTraceId}
        onSpanHighlight={(spanId) => setHighlightedSpanId(spanId ?? undefined)}
      />
      {/* Trace selector buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {traces.map((trace) => (
          <button
            key={trace.traceId}
            onClick={() => setSelectedTraceId(trace.traceId)}
            style={{
              padding: '8px 16px',
              background:
                selectedTraceId === trace.traceId
                  ? theme.colors.primary
                  : theme.colors.backgroundSecondary,
              color:
                selectedTraceId === trace.traceId
                  ? theme.colors.background
                  : theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[2],
              cursor: 'pointer',
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes[1],
            }}
          >
            {trace.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export const WithSelectedTrace: Story = {
  render: () => <WithSelectedTraceComponent />,
};

/**
 * With focus trace - clicking a trace moves the scrubber to it
 */
const WithFocusTraceComponent = () => {
  const { theme } = useTheme();
  const [highlightedSpanId, setHighlightedSpanId] = useState<string | undefined>();
  const [focusTraceId, setFocusTraceId] = useState<string | null>(null);

  const traces = useMemo(() => {
    const randomTraces = generateRandomTraces(10);
    return convertToRegisteredTraces(randomTraces);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TraceTape
        traces={traces}
        theme={theme}
        highlightedSpanId={highlightedSpanId}
        focusTraceId={focusTraceId}
        onSpanHighlight={(spanId) => {
          setHighlightedSpanId(spanId ?? undefined);
          setFocusTraceId(null); // Clear focus after scrubbing
        }}
      />
      {/* Trace buttons to jump to */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          maxHeight: '200px',
          overflowY: 'auto',
        }}
      >
        {traces.map((trace, index) => (
          <button
            key={trace.traceId}
            onClick={() => setFocusTraceId(trace.traceId)}
            style={{
              padding: '6px 12px',
              background: theme.colors.backgroundSecondary,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[1],
              cursor: 'pointer',
              fontFamily: theme.fonts.monospace,
              fontSize: theme.fontSizes[1],
            }}
          >
            Jump to Trace {index + 1}
          </button>
        ))}
      </div>
      <div
        style={{
          fontSize: theme.fontSizes[1],
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.body,
        }}
      >
        Click a button to jump the scrubber to that trace
      </div>
    </div>
  );
};

export const WithFocusTrace: Story = {
  render: () => <WithFocusTraceComponent />,
};

/**
 * Custom height - taller tape for better visibility
 */
export const CustomHeight: Story = {
  render: () => {
    const { theme } = useTheme();
    const traces = useMemo(() => {
      const randomTraces = generateRandomTraces(15);
      return convertToRegisteredTraces(randomTraces);
    }, []);

    return (
      <TraceTape
        traces={traces}
        theme={theme}
        height={80}
        onSpanHighlight={(spanId, span) => {
          if (span) console.log('Highlighted:', span.name);
        }}
      />
    );
  },
};

/**
 * Non-interactive - display only, no scrubbing
 */
export const NonInteractive: Story = {
  render: () => {
    const { theme } = useTheme();
    const traces = useMemo(() => {
      const randomTraces = generateRandomTraces(10);
      return convertToRegisteredTraces(randomTraces);
    }, []);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TraceTape
          traces={traces}
          theme={theme}
          interactive={false}
          onSpanHighlight={() => {}}
        />
        <div
          style={{
            fontSize: '13px',
            color: theme.colors.textMuted,
            fontFamily: theme.fonts.body,
          }}
        >
          This tape is non-interactive (display only)
        </div>
      </div>
    );
  },
};

/**
 * Custom colors - override theme colors
 */
export const CustomColors: Story = {
  render: () => {
    const { theme } = useTheme();
    const traces = useMemo(() => {
      const randomTraces = generateRandomTraces(10);
      return convertToRegisteredTraces(randomTraces);
    }, []);

    return (
      <TraceTape
        traces={traces}
        theme={theme}
        colors={{
          line: '#f59e0b', // amber
          scrubber: '#ef4444', // red
          highlighted: '#ffffff',
          background: 'rgba(245, 158, 11, 0.1)',
        }}
        onSpanHighlight={(spanId, span) => {
          if (span) console.log('Highlighted:', span.name);
        }}
      />
    );
  },
};

/**
 * Live updating - traces appear over time
 */
const LiveUpdatingComponent = () => {
  const { theme } = useTheme();
  const [traces, setTraces] = useState<RegisteredTrace[]>([]);
  const [highlightedSpanId, setHighlightedSpanId] = useState<string | undefined>();

  React.useEffect(() => {
    // Add a new trace every 1.5 seconds
    const interval = setInterval(() => {
      const newTrace = generateRandomTraces(1);
      const newRegisteredTraces = convertToRegisteredTraces(newTrace);

      setTraces((prev) => [...newRegisteredTraces, ...prev].slice(0, 30)); // Keep last 30
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TraceTape
        traces={traces}
        theme={theme}
        highlightedSpanId={highlightedSpanId}
        onSpanHighlight={(spanId) => setHighlightedSpanId(spanId ?? undefined)}
      />
      <div
        style={{
          fontSize: theme.fontSizes[2],
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.body,
        }}
      >
        {traces.length} traces ({traces.reduce((sum, t) => sum + t.spanCount, 0)} spans) - new
        traces arrive every 1.5s
      </div>
    </div>
  );
};

export const LiveUpdating: Story = {
  render: () => <LiveUpdatingComponent />,
};

/**
 * With max visible items and minimap - scrolling kicks in when there are too many spans
 */
const WithMaxVisibleItemsComponent = () => {
  const { theme } = useTheme();
  const [highlightedSpanId, setHighlightedSpanId] = useState<string | undefined>();
  const [focusTraceId, setFocusTraceId] = useState<string | null>(null);

  // Generate a lot of traces to trigger scrolling
  const traces = useMemo(() => {
    const randomTraces = generateRandomTraces(50);
    return convertToRegisteredTraces(randomTraces);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TraceTape
        traces={traces}
        theme={theme}
        highlightedSpanId={highlightedSpanId}
        focusTraceId={focusTraceId}
        maxVisibleItems={15}
        showMinimap={true}
        onSpanHighlight={(spanId) => {
          setHighlightedSpanId(spanId ?? undefined);
          setFocusTraceId(null);
        }}
      />
      {/* Trace buttons to jump to */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          maxHeight: '150px',
          overflowY: 'auto',
        }}
      >
        {traces.slice(0, 20).map((trace, index) => (
          <button
            key={trace.traceId}
            onClick={() => setFocusTraceId(trace.traceId)}
            style={{
              padding: '4px 8px',
              background: theme.colors.backgroundSecondary,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[1],
              cursor: 'pointer',
              fontFamily: theme.fonts.monospace,
              fontSize: theme.fontSizes[0],
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div
        style={{
          fontSize: theme.fontSizes[1],
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.body,
        }}
      >
        {traces.length} traces with maxVisibleItems=15 - use minimap or scroll to navigate
      </div>
    </div>
  );
};

export const WithMaxVisibleItems: Story = {
  render: () => <WithMaxVisibleItemsComponent />,
};

/**
 * Without minimap - scrolling only, no overview bar
 */
const WithoutMinimapComponent = () => {
  const { theme } = useTheme();
  const [highlightedSpanId, setHighlightedSpanId] = useState<string | undefined>();

  const traces = useMemo(() => {
    const randomTraces = generateRandomTraces(50);
    return convertToRegisteredTraces(randomTraces);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TraceTape
        traces={traces}
        theme={theme}
        highlightedSpanId={highlightedSpanId}
        maxVisibleItems={15}
        showMinimap={false}
        onSpanHighlight={(spanId) => setHighlightedSpanId(spanId ?? undefined)}
      />
      <div
        style={{
          fontSize: theme.fontSizes[1],
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.body,
        }}
      >
        {traces.length} traces with maxVisibleItems=15, minimap disabled - scroll only
      </div>
    </div>
  );
};

export const WithoutMinimap: Story = {
  render: () => <WithoutMinimapComponent />,
};

/**
 * Live updating with scroll and minimap - adds 3 traces per second to test scrolling behavior
 */
const LiveUpdatingWithScrollComponent = () => {
  const { theme } = useTheme();
  const [traces, setTraces] = useState<RegisteredTrace[]>([]);
  const [highlightedSpanId, setHighlightedSpanId] = useState<string | undefined>();
  const [focusTraceId, setFocusTraceId] = useState<string | null>(null);

  React.useEffect(() => {
    // Add a new trace every 333ms (3 per second)
    const interval = setInterval(() => {
      const newTrace = generateRandomTraces(1);
      const newRegisteredTraces = convertToRegisteredTraces(newTrace);

      setTraces((prev) => [...newRegisteredTraces, ...prev].slice(0, 100)); // Keep last 100
    }, 333);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TraceTape
        traces={traces}
        theme={theme}
        highlightedSpanId={highlightedSpanId}
        focusTraceId={focusTraceId}
        maxVisibleItems={20}
        showMinimap={true}
        onSpanHighlight={(spanId) => {
          setHighlightedSpanId(spanId ?? undefined);
          setFocusTraceId(null);
        }}
      />
      {/* Jump buttons for first 10 traces */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {traces.slice(0, 10).map((trace, index) => (
          <button
            key={trace.traceId}
            onClick={() => setFocusTraceId(trace.traceId)}
            style={{
              padding: '4px 10px',
              background: theme.colors.backgroundSecondary,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[1],
              cursor: 'pointer',
              fontFamily: theme.fonts.monospace,
              fontSize: theme.fontSizes[1],
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div
        style={{
          fontSize: theme.fontSizes[2],
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.body,
        }}
      >
        {traces.length} traces ({traces.reduce((sum, t) => sum + t.spanCount, 0)} spans) - 3 new
        traces/sec, maxVisibleItems=20, minimap enabled
      </div>
    </div>
  );
};

export const LiveUpdatingWithScroll: Story = {
  render: () => <LiveUpdatingWithScrollComponent />,
};
