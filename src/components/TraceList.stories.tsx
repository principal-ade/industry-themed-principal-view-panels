import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useMemo } from 'react';
import { TraceList } from './TraceList';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import { groupSpansByTrace } from '../types/otel';
import type { TraceInfo } from '../types/otel';
import {
  generateRandomTraces,
  generateCheckoutTrace,
  generateAuthErrorTrace,
  generateComplexTrace,
  createTraceWithMultiWorkflowData,
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
const EmptyComponent = () => {
  const { theme } = useTheme();
  return (
    <div style={{ height: '100%', width: '100%', minWidth: 0 }}>
      <TraceList traces={[]} theme={theme} />
    </div>
  );
};

export const Empty: Story = {
  render: () => <EmptyComponent />,
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
const NoSearchComponent = () => {
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
};

export const NoSearch: Story = {
  render: () => <NoSearchComponent />,
};

/**
 * With custom empty message
 */
const CustomEmptyMessageComponent = () => {
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
};

export const CustomEmptyMessage: Story = {
  render: () => <CustomEmptyMessageComponent />,
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
const LiveUpdatingComponent = () => {
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
};

export const LiveUpdating: Story = {
  render: () => <LiveUpdatingComponent />,
};

/**
 * Multi-workflow trace expansion
 *
 * Shows traces with multiple workflow matches. Click on a trace to see the expansion
 * with matched workflows, unmatched events, and coverage metrics.
 */
export const MultiWorkflowExpansion: Story = {
  render: () => {
    const { theme } = useTheme();
    const [selectedTraceId, setSelectedTraceId] = useState<string | undefined>();

    // Create traces with multi-workflow data (memoized to prevent regeneration)
    const traces = useMemo<TraceInfo[]>(() => [
      createTraceWithMultiWorkflowData({
        name: 'ProcessPayment',
        workflows: [
          {
            storyboardId: 'ecommerce',
            storyboardName: 'E-commerce Platform',
            workflowId: 'checkout-flow',
            workflowName: 'Checkout Flow',
            scenarioId: 'happy-path',
            scenarioName: 'Standard successful checkout',
            matchedEventCount: 8,
          },
          {
            storyboardId: 'payment',
            storyboardName: 'Payment Processing',
            workflowId: 'payment-gateway',
            workflowName: 'Payment Gateway',
            scenarioId: 'credit-card',
            scenarioName: 'Credit card payment',
            matchedEventCount: 5,
          },
        ],
        unmatchedEventNames: ['cache.hit', 'logging.debug'],
        totalEventCount: 15,
      }),
      createTraceWithMultiWorkflowData({
        name: 'UserLogin',
        workflows: [
          {
            storyboardId: 'auth',
            storyboardName: 'Authentication',
            workflowId: 'login-flow',
            workflowName: 'User Login',
            scenarioId: 'email-login',
            scenarioName: 'Email and password login',
            matchedEventCount: 6,
          },
        ],
        unmatchedEventNames: [],
        totalEventCount: 6,
      }),
      createTraceWithMultiWorkflowData({
        name: 'BackgroundJob',
        workflows: [
          {
            storyboardId: 'jobs',
            storyboardName: 'Background Jobs',
            workflowId: 'data-sync',
            workflowName: 'Data Sync',
            scenarioId: 'incremental',
            scenarioName: 'Incremental sync',
            matchedEventCount: 3,
          },
        ],
        unmatchedEventNames: [
          'job.started',
          'cache.invalidate',
          'metrics.timer',
          'logging.trace',
          'internal.checkpoint',
        ],
        totalEventCount: 8,
      }),
    ], []);

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
  },
};

/**
 * Perfect coverage trace expansion
 *
 * Shows a trace where all events match workflows (100% coverage)
 */
export const PerfectCoverageExpansion: Story = {
  render: () => {
    const { theme } = useTheme();
    const [selectedTraceId, setSelectedTraceId] = useState<string | undefined>();

    const traces = useMemo<TraceInfo[]>(() => [
      createTraceWithMultiWorkflowData({
        name: 'UserRegistration',
        workflows: [
          {
            storyboardId: 'auth',
            storyboardName: 'Authentication',
            workflowId: 'registration',
            workflowName: 'User Registration',
            scenarioId: 'new-user',
            scenarioName: 'New user signup',
            matchedEventCount: 10,
          },
        ],
        unmatchedEventNames: [],
        totalEventCount: 10,
      }),
    ], []);

    // Auto-select the trace to show expansion
    React.useEffect(() => {
      if (traces.length > 0 && !selectedTraceId) {
        setSelectedTraceId(traces[0].traceId);
      }
    }, [traces, selectedTraceId]);

    return (
      <div style={{ height: '100%', width: '100%', minWidth: 0 }}>
        <TraceList
          traces={traces}
          theme={theme}
          onTraceClick={(trace) => setSelectedTraceId(trace.traceId)}
          selectedTraceId={selectedTraceId}
        />
      </div>
    );
  },
};

/**
 * Low coverage trace expansion
 *
 * Shows a trace with many unmatched events (unexpected telemetry)
 */
export const LowCoverageExpansion: Story = {
  render: () => {
    const { theme } = useTheme();
    const [selectedTraceId, setSelectedTraceId] = useState<string | undefined>();

    const traces = useMemo<TraceInfo[]>(() => [
      createTraceWithMultiWorkflowData({
        name: 'DataMigration',
        workflows: [
          {
            storyboardId: 'admin',
            storyboardName: 'Admin Tools',
            workflowId: 'migration',
            workflowName: 'Data Migration',
            scenarioId: 'batch-process',
            scenarioName: 'Batch processing',
            matchedEventCount: 4,
          },
        ],
        unmatchedEventNames: [
          'migration.checkpoint.1',
          'migration.checkpoint.2',
          'migration.checkpoint.3',
          'db.transaction.begin',
          'db.transaction.commit',
          'cache.clear',
          'index.rebuild.start',
          'index.rebuild.complete',
          'validation.error.skip',
          'metrics.batch.processed',
          'metrics.batch.failed',
          'logging.performance',
        ],
        totalEventCount: 16,
      }),
    ], []);

    // Auto-select the trace
    React.useEffect(() => {
      if (traces.length > 0 && !selectedTraceId) {
        setSelectedTraceId(traces[0].traceId);
      }
    }, [traces, selectedTraceId]);

    return (
      <div style={{ height: '100%', width: '100%', minWidth: 0 }}>
        <TraceList
          traces={traces}
          theme={theme}
          onTraceClick={(trace) => setSelectedTraceId(trace.traceId)}
          selectedTraceId={selectedTraceId}
        />
      </div>
    );
  },
};
