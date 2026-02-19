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
          getSlice: (name: string) => {
            if (name === 'telemetry') {
              return {
                scope: 'repository' as const,
                name: 'telemetry',
                data: traces,
                loading: false,
                error: null,
                refresh: async () => {
                  console.log('[Mock] Refreshing telemetry slice');
                },
              };
            }
            return undefined;
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
          getSlice: (name: string) => {
            if (name === 'telemetry') {
              return {
                scope: 'repository' as const,
                name: 'telemetry',
                data: traces,
                loading: false,
                error: null,
                refresh: async () => {
                  console.log('[Mock] Refreshing telemetry slice');
                },
              };
            }
            return undefined;
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
          getSlice: (name: string) => {
            if (name === 'telemetry') {
              return {
                scope: 'repository' as const,
                name: 'telemetry',
                data: traces,
                loading: false,
                error: null,
                refresh: async () => {
                  console.log('[Mock] Refreshing telemetry slice');
                },
              };
            }
            return undefined;
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
          getSlice: (name: string) => {
            if (name === 'telemetry') {
              return {
                scope: 'repository' as const,
                name: 'telemetry',
                data: traces,
                loading: false,
                error: null,
                refresh: async () => {
                  console.log('[Mock] Refreshing telemetry slice');
                },
              };
            }
            return undefined;
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
          getSlice: (name: string) => {
            if (name === 'schematics') {
              return {
                scope: 'repository' as const,
                name: 'schematics',
                data: mockSchematics,
                loading: false,
                error: null,
                refresh: async () => {},
              };
            }
            if (name === 'telemetry') {
              return {
                scope: 'repository' as const,
                name: 'telemetry',
                data: mockTracesForSchematics,
                loading: false,
                error: null,
                refresh: async () => {},
              };
            }
            return undefined;
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
          getSlice: (name: string) => {
            if (name === 'schematics') {
              return {
                scope: 'repository' as const,
                name: 'schematics',
                data: mockSchematics,
                loading: false,
                error: null,
                refresh: async () => {
                  console.log('[Mock] Refreshing schematics slice');
                },
              };
            }
            if (name === 'telemetry') {
              return {
                scope: 'repository' as const,
                name: 'telemetry',
                data: tracesForFirstVersion,
                loading: false,
                error: null,
                refresh: async () => {
                  console.log('[Mock] Refreshing telemetry slice');
                },
              };
            }
            return undefined;
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
          getSlice: (name: string) => {
            if (name === 'schematics') {
              return {
                scope: 'repository' as const,
                name: 'schematics',
                data: testData,
                loading: false,
                error: null,
                refresh: async () => {},
              };
            }
            return undefined;
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
          getSlice: (name: string) => {
            if (name === 'schematics') {
              return {
                scope: 'repository' as const,
                name: 'schematics',
                data: [],
                loading: true,
                error: null,
                refresh: async () => {
                  console.log('[Mock] Refreshing schematics slice');
                },
              };
            }
            return undefined;
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
