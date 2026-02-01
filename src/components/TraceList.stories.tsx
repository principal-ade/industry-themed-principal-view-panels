import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { TraceList } from './TraceList';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import { groupSpansByTrace } from '../types/otel';
import type { TraceInfo } from '../types/otel';
import {
  generateRandomTraces,
  generateCheckoutTrace,
  generateAuthErrorTrace,
  generateComplexTrace,
} from '../mocks/otelMocks';

const meta = {
  title: 'Components/TraceList',
  component: TraceList,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Displays a list of OpenTelemetry traces with metadata, search functionality, and error indicators. Useful for visualizing telemetry data in real-time.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', padding: '24px', boxSizing: 'border-box', overflow: 'hidden' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof TraceList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to use theme and handle selection
const TraceListWrapper: React.FC<{ traces: TraceInfo[] }> = ({ traces }) => {
  const { theme } = useTheme();
  const [selectedTraceId, setSelectedTraceId] = useState<string | undefined>();

  const handleTraceClick = (trace: TraceInfo) => {
    setSelectedTraceId(trace.traceId);
    console.log('Trace clicked:', trace);
  };

  return (
    <div style={{ height: '100%', width: '100%', minWidth: 0 }}>
      <TraceList
        traces={traces}
        theme={theme}
        onTraceClick={handleTraceClick}
        selectedTraceId={selectedTraceId}
      />
    </div>
  );
};

/**
 * Default story with a few example traces
 */
export const Default: Story = {
  render: () => {
    const checkoutTrace = generateCheckoutTrace(true); // Include workflow match
    const authTrace = generateAuthErrorTrace(true); // Include workflow match
    const complexTrace = generateComplexTrace(true); // Include workflow match

    // Combine all traces
    const combinedResourceSpans = {
      resourceSpans: [
        ...checkoutTrace.resourceSpans,
        ...authTrace.resourceSpans,
        ...complexTrace.resourceSpans,
      ],
    };

    const traces = groupSpansByTrace(combinedResourceSpans);

    return <TraceListWrapper traces={traces} />;
  },
};

/**
 * Empty state with no traces
 */
export const Empty: Story = {
  render: () => {
    const { theme } = useTheme();
    return (
      <div style={{ height: '100%', width: '100%', minWidth: 0 }}>
        <TraceList traces={[]} theme={theme} />
      </div>
    );
  },
};

/**
 * Large list with many traces to test scrolling and search
 */
export const ManyTraces: Story = {
  render: () => {
    const randomTraces = generateRandomTraces(50);
    const traces = groupSpansByTrace(randomTraces);

    return <TraceListWrapper traces={traces} />;
  },
};

/**
 * Only error traces
 */
export const ErrorTraces: Story = {
  render: () => {
    const trace1 = generateAuthErrorTrace();
    const trace2 = generateAuthErrorTrace();
    const trace3 = generateAuthErrorTrace();

    const combinedResourceSpans = {
      resourceSpans: [
        ...trace1.resourceSpans,
        ...trace2.resourceSpans,
        ...trace3.resourceSpans,
      ],
    };

    const traces = groupSpansByTrace(combinedResourceSpans);

    return <TraceListWrapper traces={traces} />;
  },
};

/**
 * Complex multi-service traces
 */
export const ComplexTraces: Story = {
  render: () => {
    const trace1 = generateComplexTrace();
    const trace2 = generateComplexTrace();
    const trace3 = generateComplexTrace();

    const combinedResourceSpans = {
      resourceSpans: [
        ...trace1.resourceSpans,
        ...trace2.resourceSpans,
        ...trace3.resourceSpans,
      ],
    };

    const traces = groupSpansByTrace(combinedResourceSpans);

    return <TraceListWrapper traces={traces} />;
  },
};

/**
 * Without search functionality
 */
export const NoSearch: Story = {
  render: () => {
    const randomTraces = generateRandomTraces(10);
    const traces = groupSpansByTrace(randomTraces);
    const { theme } = useTheme();

    return (
      <div style={{ height: '100%', width: '100%', minWidth: 0 }}>
        <TraceList
          traces={traces}
          theme={theme}
          showSearch={false}
        />
      </div>
    );
  },
};

/**
 * With custom empty message
 */
export const CustomEmptyMessage: Story = {
  render: () => {
    const { theme } = useTheme();
    return (
      <div style={{ height: '100%', width: '100%', minWidth: 0 }}>
        <TraceList
          traces={[]}
          theme={theme}
          emptyMessage="No telemetry data received yet. Waiting for traces..."
        />
      </div>
    );
  },
};

/**
 * Mix of matched and unmatched traces
 */
export const MixedMatching: Story = {
  render: () => {
    const checkoutTrace = generateCheckoutTrace(true); // With workflow
    const authTrace = generateAuthErrorTrace(false); // Without workflow
    const complexTrace = generateComplexTrace(true); // With workflow
    const unmatchedTrace = generateCheckoutTrace(false); // Without workflow

    // Combine all traces
    const combinedResourceSpans = {
      resourceSpans: [
        ...checkoutTrace.resourceSpans,
        ...authTrace.resourceSpans,
        ...complexTrace.resourceSpans,
        ...unmatchedTrace.resourceSpans,
      ],
    };

    const traces = groupSpansByTrace(combinedResourceSpans);

    return <TraceListWrapper traces={traces} />;
  },
};

/**
 * Live updating simulation - traces appear over time
 */
export const LiveUpdating: Story = {
  render: () => {
    const { theme } = useTheme();
    const [traces, setTraces] = useState<TraceInfo[]>([]);

    React.useEffect(() => {
      // Add a new trace every 2 seconds
      const interval = setInterval(() => {
        const newTrace = generateRandomTraces(1);
        const newTraceInfos = groupSpansByTrace(newTrace);

        setTraces((prev) => [...newTraceInfos, ...prev].slice(0, 20)); // Keep last 20
      }, 2000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div style={{ height: '100%', width: '100%', minWidth: 0 }}>
        <TraceList
          traces={traces}
          theme={theme}
          emptyMessage="Waiting for traces to arrive..."
        />
      </div>
    );
  },
};
