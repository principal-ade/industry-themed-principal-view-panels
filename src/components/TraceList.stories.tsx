import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useMemo } from 'react';
import { TraceList } from './TraceList';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import type { RegisteredTrace } from '../types/otel';
import type { PatternMatchResult, TracePattern } from '../types/tracePatterns';
import {
  generateRandomTraces,
  generateCheckoutTrace,
  generateAuthErrorTrace,
  generateComplexTrace,
  createTraceWithMultiWorkflowData,
  convertToRegisteredTraces,
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
const TraceListWrapper: React.FC<{ traces: RegisteredTrace[] }> = ({ traces }) => {
  const { theme } = useTheme();
  const [selectedTraceId, setSelectedTraceId] = useState<string | undefined>();

  const handleTraceClick = (trace: RegisteredTrace) => {
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

    const traces = convertToRegisteredTraces(combinedResourceSpans);

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
    const traces = convertToRegisteredTraces(randomTraces);

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

    const traces = convertToRegisteredTraces(combinedResourceSpans);

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

    const traces = convertToRegisteredTraces(combinedResourceSpans);

    return <TraceListWrapper traces={traces} />;
  },
};

/**
 * Without search functionality
 */
const NoSearchComponent = () => {
  const randomTraces = generateRandomTraces(10);
  const traces = convertToRegisteredTraces(randomTraces);
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

    const traces = convertToRegisteredTraces(combinedResourceSpans);

    return <TraceListWrapper traces={traces} />;
  },
};

/**
 * Live updating simulation - traces appear over time
 */
const LiveUpdatingComponent = () => {
  const { theme } = useTheme();
  const [traces, setTraces] = useState<RegisteredTrace[]>([]);

  React.useEffect(() => {
    // Add a new trace every 2 seconds
    const interval = setInterval(() => {
      const newTrace = generateRandomTraces(1);
      const newRegisteredTraces = convertToRegisteredTraces(newTrace);

      setTraces((prev) => [...newRegisteredTraces, ...prev].slice(0, 20)); // Keep last 20
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
    const traces = useMemo<RegisteredTrace[]>(() => [
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

    const handleTraceClick = (trace: RegisteredTrace) => {
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

    const traces = useMemo<RegisteredTrace[]>(() => [
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

    const traces = useMemo<RegisteredTrace[]>(() => [
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

/**
 * Pattern Matching Demo
 *
 * Shows traces with pattern matches (cyan badges) and the "Save Pattern" button
 * for unmatched traces. This demonstrates the trace pattern catalog feature.
 */
const PatternMatchingComponent = () => {
  const { theme } = useTheme();
  const [expandedTraceIds, setExpandedTraceIds] = useState<Set<string>>(new Set());
  const [savedPatterns, setSavedPatterns] = useState<TracePattern[]>([]);

  // Create a mix of traces - some unmatched (will show pattern features)
  const { traces, patternMatches, debugInfo } = useMemo(() => {
    // Generate unmatched traces (no workflow matches)
    const unmatchedTrace1 = generateCheckoutTrace(false);
    const unmatchedTrace2 = generateAuthErrorTrace(false);
    const unmatchedTrace3 = generateComplexTrace(false);

    // Generate matched trace (has workflow matches)
    const matchedTrace = generateCheckoutTrace(true);

    const combinedResourceSpans = {
      resourceSpans: [
        ...unmatchedTrace1.resourceSpans,
        ...unmatchedTrace2.resourceSpans,
        ...unmatchedTrace3.resourceSpans,
        ...matchedTrace.resourceSpans,
      ],
    };

    const allTraces = convertToRegisteredTraces(combinedResourceSpans);

    // Create mock pattern matches for some unmatched traces
    const mockPatternMatches = new Map<string, PatternMatchResult>();

    // Find unmatched traces and add pattern matches to some of them
    const unmatchedTraces = allTraces.filter(
      (t) => !t.scenarioMatches?.length && !t.storyboardMatches?.length
    );

    const debug = {
      totalTraces: allTraces.length,
      unmatchedCount: unmatchedTraces.length,
      matchedCount: allTraces.length - unmatchedTraces.length,
      patternMatchCount: 0,
    };

    if (unmatchedTraces.length > 0) {
      // First unmatched trace matches a pattern
      mockPatternMatches.set(unmatchedTraces[0].traceId, {
        pattern: {
          id: 'pattern-http-client',
          name: 'HTTP Client Request',
          description: 'Standard outbound HTTP call pattern',
          rootSpans: [{ name: 'HTTP GET', children: [{ name: 'dns.lookup' }] }],
          filterDefault: false,
        },
        patternId: 'pattern-http-client',
        patternName: 'HTTP Client Request',
        confidence: 1.0,
      });
      debug.patternMatchCount++;

      // Second unmatched trace matches a different pattern
      if (unmatchedTraces.length > 1) {
        mockPatternMatches.set(unmatchedTraces[1].traceId, {
          pattern: {
            id: 'pattern-db-query',
            name: 'Database Query',
            description: 'PostgreSQL query pattern',
            rootSpans: [{ name: 'pg.query' }],
            filterDefault: false,
          },
          patternId: 'pattern-db-query',
          patternName: 'Database Query',
          confidence: 1.0,
        });
        debug.patternMatchCount++;
      }
      // Third unmatched trace has NO pattern - will show "Save Pattern" button
    }

    return { traces: allTraces, patternMatches: mockPatternMatches, debugInfo: debug };
  }, []);

  const handleTraceClick = (trace: RegisteredTrace) => {
    setExpandedTraceIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trace.traceId)) {
        newSet.delete(trace.traceId);
      } else {
        newSet.add(trace.traceId);
      }
      return newSet;
    });
  };

  const handleSaveAsPattern = async (pattern: TracePattern) => {
    console.log('Saving pattern:', pattern);
    setSavedPatterns((prev) => [...prev, pattern]);
    alert(`Pattern "${pattern.name}" saved!\n\nID: ${pattern.id}\nRoot spans: ${pattern.rootSpans.map((s) => s.name).join(', ')}`);
  };

  return (
    <div style={{ height: '100%', width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Info banner */}
      <div
        style={{
          padding: '12px 16px',
          background: '#06b6d415',
          border: '1px solid #06b6d440',
          borderRadius: '4px',
          color: '#06b6d4',
          fontSize: '14px',
        }}
      >
        <strong>Pattern Matching Demo:</strong> Traces with cyan badges match known patterns.
        Unmatched traces (gray badge) show a "Save Pattern" button.
        <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
          Debug: {debugInfo.totalTraces} traces total, {debugInfo.unmatchedCount} unmatched,{' '}
          {debugInfo.patternMatchCount} with pattern matches
        </div>
        <div style={{ marginTop: '8px' }}>
          Look for: <span style={{ background: '#06b6d4', color: 'white', padding: '2px 6px', borderRadius: '3px', marginRight: '8px' }}>cyan pattern badges</span>
          and <span style={{ color: '#06b6d4' }}>Save Pattern</span> buttons on trace cards
        </div>
        {savedPatterns.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            Saved patterns: {savedPatterns.map((p) => p.name).join(', ')}
          </div>
        )}
      </div>

      {/* Trace list */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <TraceList
          traces={traces}
          theme={theme}
          onTraceClick={handleTraceClick}
          expandedTraceIds={expandedTraceIds}
          patternMatches={patternMatches}
          onSaveAsPattern={handleSaveAsPattern}
        />
      </div>
    </div>
  );
};

export const PatternMatching: Story = {
  render: () => <PatternMatchingComponent />,
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates the trace pattern catalog feature:

- **Cyan badge**: Traces that match a known pattern show a badge with the pattern name
- **Save Pattern button**: Unmatched traces without a pattern show a button to save their structure as a new pattern
- **Pattern visibility**: Patterns can have \`filterDefault: true\` to hide matching traces by default

This feature helps identify recurring telemetry shapes that don't match any workflow definition.
        `,
      },
    },
  },
};
