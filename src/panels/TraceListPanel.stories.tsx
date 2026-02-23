import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TraceListPanel } from './TraceListPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { RegisteredTrace } from '@principal-ai/principal-view-core';
import type { VersionSnapshot } from '@principal-ai/principal-view-core';

// Mock trace data using NEW API structure
const now = Date.now();

/**
 * Create a trace with the new RegisteredTrace API structure
 */
const createTrace = (
  traceId: string,
  name: string,
  serviceName: string,
  scopeName: string,
  scopeVersion: string,
  offset: number,
  duration: number,
  hasError: boolean = false,
  scenarioMatch?: {
    storyboardId: string;
    storyboardName?: string;
    workflowId: string;
    workflowName?: string;
    scenarioId: string;
    coveragePercent?: number;
    matchType?: 'full' | 'partial';
  }
): RegisteredTrace => {
  const startTime = now - offset;
  const endTime = startTime + duration;

  return {
    traceId,
    name,
    startTime,
    endTime,
    duration,
    spanCount: 1,
    hasErrors: hasError,
    resources: [
      {
        serviceIdentifier: `http://localhost:${3000 + Math.floor(Math.random() * 1000)}`,
        serviceName,
        attributes: {
          'service.name': serviceName,
        },
        scopes: [
          {
            scope: {
              name: scopeName,
              version: scopeVersion,
            },
            spanIds: [`span-${traceId}`],
          },
        ],
      },
    ],
    scenarioMatches: scenarioMatch
      ? [
          {
            storyboardId: scenarioMatch.storyboardId,
            storyboardName: scenarioMatch.storyboardName,
            workflowId: scenarioMatch.workflowId,
            workflowName: scenarioMatch.workflowName,
            scenarioId: scenarioMatch.scenarioId,
            scopeName,
            matchedSpans: [
              {
                spanId: `span-${traceId}`,
                spanName: name,
                nodeId: `node-${scenarioMatch.scenarioId}`,
                timestamp: startTime,
                duration,
                events: ['request.started', 'response.completed'],
                matchConfidence: 'exact' as const,
              },
            ],
            coveragePercent: scenarioMatch.coveragePercent || 100,
            matchType: scenarioMatch.matchType || 'full',
          },
        ]
      : [],
    storyboardMatches: [],
    unmatchedSpans: {
      spans: scenarioMatch
        ? []
        : [
            {
              spanId: `span-${traceId}`,
              spanName: name,
              scopeName,
              timestamp: startTime,
              duration,
              reason: 'No workflow matched this span',
            },
          ],
    },
  };
};

/**
 * Create a trace with partial span matching (some spans matched, some not)
 */
const createPartialMatchTrace = (
  traceId: string,
  name: string,
  serviceName: string,
  scopeName: string,
  scopeVersion: string,
  offset: number,
  duration: number,
  matchedSpanCount: number,
  totalSpanCount: number,
  scenarioMatch: {
    storyboardId: string;
    storyboardName?: string;
    workflowId: string;
    workflowName?: string;
    scenarioId: string;
  }
): RegisteredTrace => {
  const startTime = now - offset;
  const endTime = startTime + duration;
  const spanDuration = duration / totalSpanCount;

  // Create matched spans
  const matchedSpans = Array.from({ length: matchedSpanCount }, (_, i) => ({
    spanId: `span-${traceId}-matched-${i}`,
    spanName: `${name} - Step ${i + 1}`,
    nodeId: `node-${scenarioMatch.scenarioId}-${i}`,
    timestamp: startTime + (i * spanDuration),
    duration: spanDuration,
    events: ['request.started', 'response.completed'],
    matchConfidence: 'exact' as const,
  }));

  // Create unmatched spans
  const unmatchedSpans = Array.from({ length: totalSpanCount - matchedSpanCount }, (_, i) => ({
    spanId: `span-${traceId}-unmatched-${i}`,
    spanName: `Unmatched Operation ${i + 1}`,
    scopeName,
    timestamp: startTime + ((matchedSpanCount + i) * spanDuration),
    duration: spanDuration,
    reason: 'No scenario matched this span',
  }));

  return {
    traceId,
    name,
    startTime,
    endTime,
    duration,
    spanCount: totalSpanCount,
    hasErrors: false,
    resources: [
      {
        serviceIdentifier: `http://localhost:${3000 + Math.floor(Math.random() * 1000)}`,
        serviceName,
        attributes: {
          'service.name': serviceName,
        },
        scopes: [
          {
            scope: {
              name: scopeName,
              version: scopeVersion,
            },
            spanIds: [
              ...matchedSpans.map(s => s.spanId),
              ...unmatchedSpans.map(s => s.spanId),
            ],
          },
        ],
      },
    ],
    scenarioMatches: [
      {
        storyboardId: scenarioMatch.storyboardId,
        storyboardName: scenarioMatch.storyboardName,
        workflowId: scenarioMatch.workflowId,
        workflowName: scenarioMatch.workflowName,
        scenarioId: scenarioMatch.scenarioId,
        scopeName,
        matchedSpans,
        coveragePercent: Math.round((matchedSpanCount / totalSpanCount) * 100),
        matchType: matchedSpanCount === totalSpanCount ? 'full' : 'partial',
      },
    ],
    storyboardMatches: [],
    unmatchedSpans: {
      spans: unmatchedSpans,
    },
  };
};

/**
 * Create a trace with storyboard match but no scenario match (orphaned spans)
 * This is Category 2: workflow matched but events didn't match any scenario
 */
const createOrphanedSpansTrace = (
  traceId: string,
  name: string,
  serviceName: string,
  scopeName: string,
  scopeVersion: string,
  offset: number,
  duration: number,
  orphanedSpanCount: number,
  storyboardMatch: {
    storyboardId: string;
    storyboardName?: string;
    workflowId: string;
    workflowName?: string;
  }
): RegisteredTrace => {
  const startTime = now - offset;
  const endTime = startTime + duration;
  const spanDuration = duration / orphanedSpanCount;

  // Create orphaned spans (matched workflow but no scenario)
  const orphanedSpans = Array.from({ length: orphanedSpanCount }, (_, i) => ({
    spanId: `span-${traceId}-orphan-${i}`,
    spanName: `${name} - Step ${i + 1}`,
    nodeId: `node-${storyboardMatch.workflowId}-${i}`,
    timestamp: startTime + (i * spanDuration),
    duration: spanDuration,
    reason: 'Events did not match any scenario',
    observedEvents: ['request.started', 'response.completed'],
    expectedEvents: ['checkout.started', 'payment.processed', 'order.confirmed'],
  }));

  return {
    traceId,
    name,
    startTime,
    endTime,
    duration,
    spanCount: orphanedSpanCount,
    hasErrors: false,
    resources: [
      {
        serviceIdentifier: `http://localhost:${3000 + Math.floor(Math.random() * 1000)}`,
        serviceName,
        attributes: {
          'service.name': serviceName,
        },
        scopes: [
          {
            scope: {
              name: scopeName,
              version: scopeVersion,
            },
            spanIds: orphanedSpans.map(s => s.spanId),
          },
        ],
      },
    ],
    scenarioMatches: [],
    storyboardMatches: [
      {
        storyboardId: storyboardMatch.storyboardId,
        storyboardName: storyboardMatch.storyboardName,
        workflowId: storyboardMatch.workflowId,
        workflowName: storyboardMatch.workflowName,
        scopeName,
        orphanedSpans,
      },
    ],
    unmatchedSpans: {
      spans: [],
    },
  };
};

/**
 * Create a trace with multiple scenario matches (multi-workflow)
 */
const createMultiWorkflowTrace = (
  traceId: string,
  name: string,
  serviceName: string,
  scopeName: string,
  scopeVersion: string,
  offset: number,
  duration: number,
  scenarios: Array<{
    storyboardId: string;
    storyboardName: string;
    workflowId: string;
    workflowName: string;
    scenarioId: string;
    coveragePercent: number;
  }>
): RegisteredTrace => {
  const startTime = now - offset;
  const endTime = startTime + duration;

  return {
    traceId,
    name,
    startTime,
    endTime,
    duration,
    spanCount: scenarios.length,
    hasErrors: false,
    resources: [
      {
        serviceIdentifier: `http://localhost:${3000 + Math.floor(Math.random() * 1000)}`,
        serviceName,
        scopes: [
          {
            scope: {
              name: scopeName,
              version: scopeVersion,
            },
            spanIds: scenarios.map((_, i) => `span-${traceId}-${i}`),
          },
        ],
      },
    ],
    scenarioMatches: scenarios.map((scenario, index) => ({
      storyboardId: scenario.storyboardId,
      storyboardName: scenario.storyboardName,
      workflowId: scenario.workflowId,
      workflowName: scenario.workflowName,
      scenarioId: scenario.scenarioId,
      scopeName,
      matchedSpans: [
        {
          spanId: `span-${traceId}-${index}`,
          spanName: `${name} - ${scenario.workflowName}`,
          nodeId: `node-${scenario.scenarioId}`,
          timestamp: startTime + (index * (duration / scenarios.length)),
          duration: duration / scenarios.length,
          events: ['workflow.started', 'workflow.completed'],
          matchConfidence: 'exact' as const,
        },
      ],
      coveragePercent: scenario.coveragePercent,
      matchType: scenario.coveragePercent === 100 ? 'full' : 'partial',
    })),
    storyboardMatches: [],
    unmatchedSpans: {
      spans: [],
    },
  };
};

const mockTraces: RegisteredTrace[] = [
  // Multiple GET /api/users (successful, no workflow match)
  createTrace('trace-1', 'GET /api/users', 'api-service', 'api-instrumentation', '1.0.0', 1000, 150),
  createTrace('trace-2', 'GET /api/users', 'api-service', 'api-instrumentation', '1.0.0', 2000, 180),
  createTrace('trace-3', 'GET /api/users', 'api-service', 'api-instrumentation', '1.0.0', 3000, 160),
  createTrace('trace-4', 'GET /api/users', 'api-service', 'api-instrumentation', '1.0.0', 4500, 170),

  // Multiple POST /api/orders (with errors, no workflow match)
  createTrace('trace-5', 'POST /api/orders', 'order-service', 'order-instrumentation', '2.1.0', 5000, 250, true),
  createTrace('trace-6', 'POST /api/orders', 'order-service', 'order-instrumentation', '2.1.0', 6000, 300, true),
  createTrace('trace-7', 'POST /api/orders', 'order-service', 'order-instrumentation', '2.1.0', 7000, 280, true),

  // Single successful POST /api/orders (not grouped with errors)
  createTrace('trace-8', 'POST /api/orders', 'order-service', 'order-instrumentation', '2.1.0', 8000, 200, false),

  // User Login Flow with workflow matching (scenario match)
  createTrace(
    'trace-9',
    'User Login Flow',
    'auth-service',
    'auth-instrumentation',
    '1.2.0',
    9000,
    800,
    false,
    {
      storyboardId: 'storyboard-1',
      storyboardName: 'E-Commerce User Journey',
      workflowId: 'workflow-1',
      workflowName: 'Authentication Workflow',
      scenarioId: 'scenario-1',
      coveragePercent: 100,
      matchType: 'full',
    }
  ),
  createTrace(
    'trace-10',
    'User Login Flow',
    'auth-service',
    'auth-instrumentation',
    '1.2.0',
    10000,
    750,
    false,
    {
      storyboardId: 'storyboard-1',
      storyboardName: 'E-Commerce User Journey',
      workflowId: 'workflow-1',
      workflowName: 'Authentication Workflow',
      scenarioId: 'scenario-1',
      coveragePercent: 85,
      matchType: 'partial',
    }
  ),

  // User Login Flow without workflow matching (separate group)
  createTrace('trace-11', 'User Login Flow', 'auth-service', 'auth-instrumentation', '1.2.0', 11000, 820, false),

  // Multi-workflow match - trace that matches multiple workflows
  createMultiWorkflowTrace(
    'trace-12',
    'Complete User Journey',
    'platform-service',
    'platform-instrumentation',
    '3.0.0',
    12000,
    1500,
    [
      {
        storyboardId: 'storyboard-1',
        storyboardName: 'E-Commerce User Journey',
        workflowId: 'workflow-1',
        workflowName: 'Authentication Workflow',
        scenarioId: 'scenario-1',
        coveragePercent: 100,
      },
      {
        storyboardId: 'storyboard-1',
        storyboardName: 'E-Commerce User Journey',
        workflowId: 'workflow-2',
        workflowName: 'Shopping Cart Workflow',
        scenarioId: 'scenario-2',
        coveragePercent: 95,
      },
      {
        storyboardId: 'storyboard-1',
        storyboardName: 'E-Commerce User Journey',
        workflowId: 'workflow-3',
        workflowName: 'Checkout Workflow',
        scenarioId: 'scenario-3',
        coveragePercent: 100,
      },
    ]
  ),
];

// Keep only error traces for the WithErrors story
const mockTracesWithErrors = mockTraces.filter(t => t.hasErrors);

// Keep only workflow-matched traces for the WithWorkflowMatching story
const mockTracesWithWorkflow = mockTraces.filter(t => t.scenarioMatches.length > 0);

const meta = {
  title: 'Panels/TraceListPanel',
  component: TraceListPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Panel for displaying OpenTelemetry traces with registry-based matching. Shows trace metadata, scenario matches, and emits events when traces are selected.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof TraceListPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state - no traces
 */
export const Empty: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <TraceListPanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Default trace list panel with mock data showing:
 * - Unmatched traces (GET /api/users, POST /api/orders)
 * - Scenario-matched traces (User Login Flow)
 * - Multi-scenario trace (Complete User Journey)
 *
 * Expand traces to see the three-category matching results:
 * Category 1: Matched Scenarios (with coverage %)
 * Category 2: Partial Matches (workflow matched, no scenario)
 * Category 3: Unmatched Spans
 */
export const Default: Story = {
  render: () => {
    const [traces, setTraces] = React.useState(mockTraces);

    return (
      <MockPanelProvider
        contextOverrides={{
          telemetry: {
            scope: 'repository' as const,
            name: 'telemetry',
            data: traces,
            loading: false,
            error: null,
            refresh: async () => {
              console.log('[Mock] Refreshing telemetry slice');
            },
          },
        }}
        actionsOverrides={{
          clearTelemetry: () => {
            console.log('[Mock] Clearing telemetry data');
            setTraces([]);
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * With errors - shows traces with error status (grouped)
 */
export const WithErrors: Story = {
  render: () => {
    const [traces, setTraces] = React.useState(mockTracesWithErrors);

    return (
      <MockPanelProvider
        contextOverrides={{
          telemetry: {
            scope: 'repository' as const,
            name: 'telemetry',
            data: traces,
            loading: false,
            error: null,
            refresh: async () => {
              console.log('[Mock] Refreshing telemetry slice');
            },
          },
        }}
        actionsOverrides={{
          clearTelemetry: () => {
            console.log('[Mock] Clearing telemetry data');
            setTraces([]);
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * With partial span matching - traces where only some spans are matched
 *
 * Demonstrates the "X/Y matched spans" display in the trace list.
 * Expand traces to see matched spans (green) and unmatched spans (orange).
 */
export const WithPartialSpanMatching: Story = {
  render: () => {
    const partialMatchTraces: RegisteredTrace[] = [
      // 1 of 3 spans matched
      createPartialMatchTrace(
        'trace-partial-1',
        'User Registration Flow',
        'registration-service',
        'registration-instrumentation',
        '1.0.0',
        1000,
        600,
        1, // matched
        3, // total
        {
          storyboardId: 'storyboard-1',
          storyboardName: 'User Onboarding',
          workflowId: 'workflow-1',
          workflowName: 'Registration Workflow',
          scenarioId: 'scenario-1',
        }
      ),
      // 2 of 5 spans matched
      createPartialMatchTrace(
        'trace-partial-2',
        'Checkout Process',
        'checkout-service',
        'checkout-instrumentation',
        '2.0.0',
        2000,
        800,
        2, // matched
        5, // total
        {
          storyboardId: 'storyboard-2',
          storyboardName: 'E-Commerce Flow',
          workflowId: 'workflow-2',
          workflowName: 'Checkout Workflow',
          scenarioId: 'scenario-2',
        }
      ),
      // 3 of 4 spans matched (high coverage)
      createPartialMatchTrace(
        'trace-partial-3',
        'Payment Processing',
        'payment-service',
        'payment-instrumentation',
        '1.5.0',
        3000,
        500,
        3, // matched
        4, // total
        {
          storyboardId: 'storyboard-2',
          storyboardName: 'E-Commerce Flow',
          workflowId: 'workflow-3',
          workflowName: 'Payment Workflow',
          scenarioId: 'scenario-3',
        }
      ),
      // Fully matched for comparison
      createTrace(
        'trace-full',
        'Simple API Call',
        'api-service',
        'api-instrumentation',
        '1.0.0',
        4000,
        200,
        false,
        {
          storyboardId: 'storyboard-1',
          storyboardName: 'API Operations',
          workflowId: 'workflow-4',
          workflowName: 'API Workflow',
          scenarioId: 'scenario-4',
          coveragePercent: 100,
        }
      ),
    ];

    const [traces, setTraces] = React.useState(partialMatchTraces);

    return (
      <MockPanelProvider
        contextOverrides={{
          telemetry: {
            scope: 'repository' as const,
            name: 'telemetry',
            data: traces,
            loading: false,
            error: null,
            refresh: async () => {
              console.log('[Mock] Refreshing telemetry slice');
            },
          },
        }}
        actionsOverrides={{
          clearTelemetry: () => {
            console.log('[Mock] Clearing telemetry data');
            setTraces([]);
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * With orphaned spans - traces where workflow matched but no scenario matched
 *
 * This demonstrates Category 2: Partial Matches (workflow-orphaned spans).
 * Expand traces to see the warning section with orphaned span details.
 */
export const WithOrphanedSpans: Story = {
  render: () => {
    const orphanedSpansTraces: RegisteredTrace[] = [
      // 1 orphaned span
      createOrphanedSpansTrace(
        'trace-orphan-1',
        'API Request',
        'api-service',
        'api-instrumentation',
        '1.0.0',
        1000,
        300,
        1, // orphaned span count
        {
          storyboardId: 'storyboard-1',
          storyboardName: 'API Operations',
          workflowId: 'workflow-1',
          workflowName: 'Request Handling',
        }
      ),
      // 3 orphaned spans
      createOrphanedSpansTrace(
        'trace-orphan-2',
        'Checkout Flow',
        'checkout-service',
        'checkout-instrumentation',
        '2.0.0',
        2000,
        800,
        3, // orphaned span count
        {
          storyboardId: 'storyboard-2',
          storyboardName: 'E-Commerce Flow',
          workflowId: 'workflow-2',
          workflowName: 'Checkout Workflow',
        }
      ),
      // Mixed: some matched, some orphaned
      {
        ...createOrphanedSpansTrace(
          'trace-mixed-1',
          'Payment Processing',
          'payment-service',
          'payment-instrumentation',
          '1.5.0',
          3000,
          600,
          2, // orphaned span count
          {
            storyboardId: 'storyboard-2',
            storyboardName: 'E-Commerce Flow',
            workflowId: 'workflow-3',
            workflowName: 'Payment Workflow',
          }
        ),
        // Add a scenario match alongside the orphaned spans
        scenarioMatches: [
          {
            storyboardId: 'storyboard-2',
            storyboardName: 'E-Commerce Flow',
            workflowId: 'workflow-3',
            workflowName: 'Payment Workflow',
            scenarioId: 'scenario-success',
            scopeName: 'payment-instrumentation',
            matchedSpans: [
              {
                spanId: 'span-trace-mixed-1-matched',
                spanName: 'Payment Processing - Verify Card',
                nodeId: 'node-verify',
                timestamp: now - 3000,
                duration: 200,
                events: ['card.verified'],
                matchConfidence: 'exact' as const,
              },
            ],
            coveragePercent: 100,
            matchType: 'full' as const,
          },
        ],
        spanCount: 3, // 1 matched + 2 orphaned
      },
    ];

    const [traces, setTraces] = React.useState(orphanedSpansTraces);

    return (
      <MockPanelProvider
        contextOverrides={{
          telemetry: {
            scope: 'repository' as const,
            name: 'telemetry',
            data: traces,
            loading: false,
            error: null,
            refresh: async () => {
              console.log('[Mock] Refreshing telemetry slice');
            },
          },
        }}
        actionsOverrides={{
          clearTelemetry: () => {
            console.log('[Mock] Clearing telemetry data');
            setTraces([]);
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * With span hierarchy - demonstrates indentation based on parent-child relationships
 *
 * Expand "User Checkout Flow" to see:
 * - Root span at depth 0
 * - Child spans indented by depth level
 * - Mix of matched and unmatched spans at different levels
 */
export const WithSpanHierarchy: Story = {
  render: () => {
    const hierarchyTrace: RegisteredTrace = {
      traceId: 'trace-hierarchy',
      name: 'User Checkout Flow',
      startTime: now - 1000,
      endTime: now - 200,
      duration: 800,
      spanCount: 5,
      hasErrors: false,
      resources: [
        {
          serviceIdentifier: 'http://localhost:3000',
          serviceName: 'checkout-service',
          attributes: { 'service.name': 'checkout-service' },
          scopes: [
            {
              scope: { name: 'checkout-instrumentation', version: '1.0.0' },
              spanIds: ['span-root', 'span-validate', 'span-payment', 'span-charge', 'span-confirm'],
            },
          ],
        },
      ],
      scenarioMatches: [
        {
          storyboardId: 'storyboard-checkout',
          storyboardName: 'E-Commerce Checkout',
          workflowId: 'workflow-checkout',
          workflowName: 'Checkout Workflow',
          scenarioId: 'scenario-success',
          scopeName: 'checkout-instrumentation',
          matchedSpans: [
            {
              spanId: 'span-root',
              spanName: 'POST /checkout',
              nodeId: 'node-checkout',
              timestamp: now - 1000,
              duration: 800,
              events: ['checkout.started'],
              matchConfidence: 'exact' as const,
            },
            {
              spanId: 'span-validate',
              parentSpanId: 'span-root',
              spanName: 'Validate Cart',
              nodeId: 'node-validate',
              timestamp: now - 950,
              duration: 100,
              events: ['cart.validated'],
              matchConfidence: 'exact' as const,
            },
            {
              spanId: 'span-payment',
              parentSpanId: 'span-root',
              spanName: 'Process Payment',
              nodeId: 'node-payment',
              timestamp: now - 800,
              duration: 400,
              events: ['payment.started'],
              matchConfidence: 'exact' as const,
            },
            {
              spanId: 'span-charge',
              parentSpanId: 'span-payment',
              spanName: 'Charge Card',
              nodeId: 'node-charge',
              timestamp: now - 700,
              duration: 200,
              events: ['card.charged'],
              matchConfidence: 'exact' as const,
            },
          ],
          coveragePercent: 100,
          matchType: 'full' as const,
        },
      ],
      storyboardMatches: [],
      unmatchedSpans: {
        spans: [
          {
            spanId: 'span-confirm',
            parentSpanId: 'span-root',
            spanName: 'Send Confirmation Email',
            scopeName: 'checkout-instrumentation',
            timestamp: now - 300,
            duration: 100,
            reason: 'No workflow matched this span',
          },
        ],
      },
    };

    const [traces, setTraces] = React.useState([hierarchyTrace]);

    return (
      <MockPanelProvider
        contextOverrides={{
          telemetry: {
            scope: 'repository' as const,
            name: 'telemetry',
            data: traces,
            loading: false,
            error: null,
            refresh: async () => {
              console.log('[Mock] Refreshing telemetry slice');
            },
          },
        }}
        actionsOverrides={{
          clearTelemetry: () => {
            console.log('[Mock] Clearing telemetry data');
            setTraces([]);
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * With multi-workflow matching - shows traces that match multiple workflows
 *
 * Expand "Complete User Journey" to see:
 * - 3 scenario matches (Authentication, Shopping Cart, Checkout)
 * - Coverage percentages for each scenario
 * - Temporal ordering of scenarios
 */
export const WithMultiWorkflowMatching: Story = {
  render: () => {
    const multiWorkflowTraces: RegisteredTrace[] = [
      // Single workflow match for comparison
      createTrace(
        'trace-single',
        'Login Only',
        'auth-service',
        'auth-instrumentation',
        '1.2.0',
        1000,
        500,
        false,
        {
          storyboardId: 'storyboard-1',
          storyboardName: 'E-Commerce User Journey',
          workflowId: 'workflow-1',
          workflowName: 'Authentication Workflow',
          scenarioId: 'scenario-1',
          coveragePercent: 100,
        }
      ),
      // Multi-workflow match - full user journey
      createMultiWorkflowTrace(
        'trace-multi',
        'Complete User Journey',
        'platform-service',
        'platform-instrumentation',
        '3.0.0',
        2000,
        1500,
        [
          {
            storyboardId: 'storyboard-1',
            storyboardName: 'E-Commerce User Journey',
            workflowId: 'workflow-1',
            workflowName: 'Authentication Workflow',
            scenarioId: 'scenario-1',
            coveragePercent: 100,
          },
          {
            storyboardId: 'storyboard-1',
            storyboardName: 'E-Commerce User Journey',
            workflowId: 'workflow-2',
            workflowName: 'Shopping Cart Workflow',
            scenarioId: 'scenario-2',
            coveragePercent: 95,
          },
          {
            storyboardId: 'storyboard-1',
            storyboardName: 'E-Commerce User Journey',
            workflowId: 'workflow-3',
            workflowName: 'Checkout Workflow',
            scenarioId: 'scenario-3',
            coveragePercent: 100,
          },
        ]
      ),
      // Another multi-workflow match with different workflows
      createMultiWorkflowTrace(
        'trace-multi-2',
        'Admin Operations',
        'admin-service',
        'admin-instrumentation',
        '2.0.0',
        3000,
        1200,
        [
          {
            storyboardId: 'storyboard-2',
            storyboardName: 'Admin Dashboard',
            workflowId: 'workflow-4',
            workflowName: 'User Management',
            scenarioId: 'scenario-4',
            coveragePercent: 100,
          },
          {
            storyboardId: 'storyboard-2',
            storyboardName: 'Admin Dashboard',
            workflowId: 'workflow-5',
            workflowName: 'Permissions Management',
            scenarioId: 'scenario-5',
            coveragePercent: 85,
          },
        ]
      ),
    ];

    const [traces, setTraces] = React.useState(multiWorkflowTraces);

    return (
      <MockPanelProvider
        contextOverrides={{
          telemetry: {
            scope: 'repository' as const,
            name: 'telemetry',
            data: traces,
            loading: false,
            error: null,
            refresh: async () => {
              console.log('[Mock] Refreshing telemetry slice');
            },
          },
        }}
        actionsOverrides={{
          clearTelemetry: () => {
            console.log('[Mock] Clearing telemetry data');
            setTraces([]);
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * With workflow matching - shows traces matched to workflows (grouped)
 */
export const WithWorkflowMatching: Story = {
  render: () => {
    const [traces, setTraces] = React.useState(mockTracesWithWorkflow);

    return (
      <MockPanelProvider
        contextOverrides={{
          telemetry: {
            scope: 'repository' as const,
            name: 'telemetry',
            data: traces,
            loading: false,
            error: null,
            refresh: async () => {
              console.log('[Mock] Refreshing telemetry slice');
            },
          },
        }}
        actionsOverrides={{
          clearTelemetry: () => {
            console.log('[Mock] Clearing telemetry data');
            setTraces([]);
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

// Mock schematics data (from version registry)
const mockSchematics: VersionSnapshot[] = [
  {
    repositoryUrl: 'https://github.com/example-org/ecommerce-platform',
    commitSha: 'a1b2c3d4e5f6789012345678901234567890abcd',
    storyboards: [
      {
        id: 'ecommerce-journey',
        name: 'E-Commerce User Journey',
        path: '.principal-views/ecommerce-journey.otel.canvas',
        basename: 'ecommerce-journey',
        scope: 'root' as const,
        canvas: {
          id: 'ecommerce-journey',
          name: 'E-Commerce User Journey',
          path: '.principal-views/ecommerce-journey.otel.canvas',
          basename: 'ecommerce-journey',
          type: 'otel' as const,
          scope: 'root' as const,
        },
        workflows: [
          {
            id: 'authentication-workflow',
            name: 'Authentication Workflow',
            path: '.principal-views/ecommerce-journey/authentication-workflow.workflow.json',
            basename: 'authentication-workflow',
            storyboardId: 'ecommerce-journey',
            scope: 'root' as const,
            testTraces: [],
            content: {
              name: 'Authentication Workflow',
              mode: 'testing' as const,
              scenarios: [
                {
                  id: 'happy-path-login',
                },
                {
                  id: 'failed-login-invalid-password',
                },
                {
                  id: 'failed-login-account-locked',
                },
                {
                  id: 'default-error-scenario',
                },
              ],
            },
          },
          {
            id: 'checkout-workflow',
            name: 'Checkout Workflow',
            path: '.principal-views/ecommerce-journey/checkout-workflow.workflow.json',
            basename: 'checkout-workflow',
            storyboardId: 'ecommerce-journey',
            scope: 'root' as const,
            testTraces: [],
            content: {
              name: 'Checkout Workflow',
              mode: 'testing' as const,
              scenarios: [
                {
                  id: 'standard-checkout',
                },
                {
                  id: 'express-checkout',
                },
                {
                  id: 'checkout-with-coupon',
                },
              ],
            },
          },
        ],
      },
      {
        id: 'admin-operations',
        name: 'Admin Operations',
        path: '.principal-views/admin-operations.otel.canvas',
        basename: 'admin-operations',
        scope: 'root' as const,
        canvas: {
          id: 'admin-operations',
          name: 'Admin Operations',
          path: '.principal-views/admin-operations.otel.canvas',
          basename: 'admin-operations',
          type: 'otel' as const,
          scope: 'root' as const,
        },
        workflows: [
          {
            id: 'product-management',
            name: 'Product Management',
            path: '.principal-views/admin-operations/product-management.workflow.json',
            basename: 'product-management',
            storyboardId: 'admin-operations',
            scope: 'root' as const,
            testTraces: [],
            content: {
              name: 'Product Management',
              mode: 'testing' as const,
              scenarios: [
                {
                  id: 'create-product',
                },
                {
                  id: 'update-product',
                },
                {
                  id: 'delete-product',
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    repositoryUrl: 'https://github.com/example-org/payment-service',
    commitSha: 'f1e2d3c4b5a69780123456789012345678901234',
    storyboards: [
      {
        id: 'payment-processing',
        name: 'Payment Processing',
        path: '.principal-views/payment-processing.otel.canvas',
        basename: 'payment-processing',
        scope: 'root' as const,
        canvas: {
          id: 'payment-processing',
          name: 'Payment Processing',
          path: '.principal-views/payment-processing.otel.canvas',
          basename: 'payment-processing',
          type: 'otel' as const,
          scope: 'root' as const,
        },
        workflows: [
          {
            id: 'credit-card-payment',
            name: 'Credit Card Payment',
            path: '.principal-views/payment-processing/credit-card-payment.workflow.json',
            basename: 'credit-card-payment',
            storyboardId: 'payment-processing',
            scope: 'root' as const,
            testTraces: [],
            content: {
              name: 'Credit Card Payment',
              mode: 'testing' as const,
              scenarios: [
                {
                  id: 'successful-payment',
                },
                {
                  id: 'declined-insufficient-funds',
                },
                {
                  id: 'declined-invalid-card',
                },
              ],
            },
          },
        ],
      },
    ],
  },
];

/**
 * Mock traces with workflow matching for schematics demo
 */
const mockTracesForSchematics: RegisteredTrace[] = [
  createTrace(
    'trace-schematic-1',
    'User Login',
    'auth-service',
    'auth-instrumentation',
    '1.2.0',
    1000,
    500,
    false,
    {
      storyboardId: 'ecommerce-journey',
      storyboardName: 'E-Commerce User Journey',
      workflowId: 'authentication-workflow',
      workflowName: 'Authentication Workflow',
      scenarioId: 'happy-path-login',
      coveragePercent: 100,
    }
  ),
  createTrace(
    'trace-schematic-2',
    'Process Checkout',
    'order-service',
    'order-instrumentation',
    '2.1.0',
    2000,
    600,
    false,
    {
      storyboardId: 'ecommerce-journey',
      storyboardName: 'E-Commerce User Journey',
      workflowId: 'checkout-workflow',
      workflowName: 'Checkout Workflow',
      scenarioId: 'standard-checkout',
      coveragePercent: 100,
    }
  ),
];

/**
 * With schematics - shows workflows and scenarios from version registry
 */
export const WithSchematics: Story = {
  render: () => {
    return (
      <MockPanelProvider
        contextOverrides={{
          schematics: {
            scope: 'repository' as const,
            name: 'schematics',
            data: mockSchematics,
            loading: false,
            error: null,
            refresh: async () => {},
          },
          telemetry: {
            scope: 'repository' as const,
            name: 'telemetry',
            data: mockTracesForSchematics,
            loading: false,
            error: null,
            refresh: async () => {},
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on the "Schematics" tab to view the version-grouped storyboards tree. The mock data includes traces for some workflows, so you can see the trace indicators (● = has traces, ○ = no traces).',
      },
    },
  },
};

/**
 * Schematics with multiple versions (some with traces, some without)
 */
export const SchematicsMultipleVersions: Story = {
  render: () => {
    // Mock traces only for the first version's authentication workflow
    const tracesForFirstVersion: RegisteredTrace[] = [
      createTrace(
        'trace-auth-1',
        'User Login',
        'auth-service',
        'auth-instrumentation',
        '1.2.0',
        1000,
        500,
        false,
        {
          storyboardId: 'ecommerce-journey',
          storyboardName: 'E-Commerce User Journey',
          workflowId: 'authentication-workflow',
          workflowName: 'Authentication Workflow',
          scenarioId: 'happy-path-login',
          coveragePercent: 100,
        }
      ),
    ];

    return (
      <MockPanelProvider
        contextOverrides={{
          schematics: {
            scope: 'repository' as const,
            name: 'schematics',
            data: mockSchematics,
            loading: false,
            error: null,
            refresh: async () => {
              console.log('[Mock] Refreshing schematics slice');
            },
          },
          telemetry: {
            scope: 'repository' as const,
            name: 'telemetry',
            data: tracesForFirstVersion,
            loading: false,
            error: null,
            refresh: async () => {
              console.log('[Mock] Refreshing telemetry slice');
            },
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigate to the "Schematics" tab to see multiple versions. Only the first version\'s authentication workflow has traces (●). Use the filter checkbox to show only workflows with traces - this will hide the second and third versions entirely, and hide the checkout and product management workflows.',
      },
    },
  },
};

/**
 * Simple schematics test - minimal data for testing
 */
export const SchematicsSimpleTest: Story = {
  render: () => {
    const testData: VersionSnapshot[] = [{
      repositoryUrl: 'https://github.com/test/repo',
      commitSha: 'abc123abc123abc123abc123abc123abc123abc1',
      storyboards: [{
        id: 'test-storyboard',
        name: 'Test Storyboard',
        path: '.principal-views/test.otel.canvas',
        basename: 'test',
        scope: 'root' as const,
        canvas: {
          id: 'test',
          name: 'Test',
          path: '.principal-views/test.otel.canvas',
          basename: 'test',
          type: 'otel' as const,
          scope: 'root' as const,
        },
        workflows: [{
          id: 'test-workflow',
          name: 'Test Workflow',
          path: '.principal-views/test/workflow.json',
          basename: 'test-workflow',
          storyboardId: 'test-storyboard',
          scope: 'root' as const,
          testTraces: [],
        }],
      }],
    }];

    return (
      <MockPanelProvider
        contextOverrides={{
          schematics: {
            scope: 'repository' as const,
            name: 'schematics',
            data: testData,
            loading: false,
            error: null,
            refresh: async () => {},
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal test case with one version and one workflow. Click "Schematics" tab to view the tree.',
      },
    },
  },
};

/**
 * Schematics loading state
 */
export const SchematicsLoading: Story = {
  render: () => {
    return (
      <MockPanelProvider
        contextOverrides={{
          schematics: {
            scope: 'repository' as const,
            name: 'schematics',
            data: [],
            loading: true,
            error: null,
            refresh: async () => {
              console.log('[Mock] Refreshing schematics slice');
            },
          },
        }}
      >
        {(props) => <TraceListPanel {...props} />}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigate to the "Schematics" tab to see the loading state.',
      },
    },
  },
};
