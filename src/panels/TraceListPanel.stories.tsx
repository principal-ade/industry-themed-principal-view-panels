import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TraceListPanel } from './TraceListPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { TraceInfo } from '../types/otel';

// Mock trace data
const now = Date.now();

const createTrace = (
  traceId: string,
  name: string,
  serviceName: string,
  offset: number,
  duration: number,
  hasError: boolean = false,
  matchedWorkflow?: TraceInfo['matchedWorkflow']
): TraceInfo => {
  const startTime = now - offset;
  const endTime = startTime + duration;

  return {
    traceId,
    spans: [
      {
        traceId,
        spanId: `span-${traceId}`,
        name,
        kind: 'SPAN_KIND_SERVER',
        startTimeUnixNano: String(startTime * 1_000_000),
        endTimeUnixNano: String(endTime * 1_000_000),
        attributes: [
          { key: 'http.method', value: { stringValue: 'GET' } },
          { key: 'http.url', value: { stringValue: name } },
        ],
        status: hasError
          ? { code: 'STATUS_CODE_ERROR', message: 'Request failed' }
          : { code: 'STATUS_CODE_OK' },
        ...(hasError && {
          events: [
            {
              timeUnixNano: String((startTime + duration / 2) * 1_000_000),
              name: 'exception',
              attributes: [
                { key: 'exception.type', value: { stringValue: 'Error' } },
                { key: 'exception.message', value: { stringValue: 'Request failed' } },
              ],
            },
          ],
        }),
      },
    ],
    rootSpan: {
      traceId,
      spanId: `span-${traceId}`,
      name,
      kind: 'SPAN_KIND_SERVER',
      startTimeUnixNano: String(startTime * 1_000_000),
      endTimeUnixNano: String(endTime * 1_000_000),
      attributes: [
        { key: 'http.method', value: { stringValue: 'GET' } },
        { key: 'http.url', value: { stringValue: name } },
      ],
      status: hasError
        ? { code: 'STATUS_CODE_ERROR', message: 'Request failed' }
        : { code: 'STATUS_CODE_OK' },
      ...(hasError && {
        events: [
          {
            timeUnixNano: String((startTime + duration / 2) * 1_000_000),
            name: 'exception',
            attributes: [
              { key: 'exception.type', value: { stringValue: 'Error' } },
              { key: 'exception.message', value: { stringValue: 'Request failed' } },
            ],
          },
        ],
      }),
    },
    serviceName,
    startTime,
    endTime,
    duration,
    spanCount: 1,
    hasErrors: hasError,
    resource: {
      attributes: [
        { key: 'service.name', value: { stringValue: serviceName } },
        ...(matchedWorkflow ? [
          { key: 'pv.storyboard.id', value: { stringValue: matchedWorkflow.storyboardId } },
          { key: 'pv.storyboard.name', value: { stringValue: matchedWorkflow.storyboardName } },
          ...(matchedWorkflow.workflowId ? [{ key: 'pv.workflow.id', value: { stringValue: matchedWorkflow.workflowId } }] : []),
          ...(matchedWorkflow.workflowName ? [{ key: 'pv.workflow.name', value: { stringValue: matchedWorkflow.workflowName } }] : []),
          ...(matchedWorkflow.scenarioId ? [{ key: 'pv.scenario.id', value: { stringValue: matchedWorkflow.scenarioId } }] : []),
          ...(matchedWorkflow.scenarioName ? [{ key: 'pv.scenario.name', value: { stringValue: matchedWorkflow.scenarioName } }] : []),
        ] : []),
      ],
    },
    matchedWorkflow,
  };
};

const mockTraces: TraceInfo[] = [
  // Multiple GET /api/users (successful)
  createTrace('trace-1', 'GET /api/users', 'api-service', 1000, 150),
  createTrace('trace-2', 'GET /api/users', 'api-service', 2000, 180),
  createTrace('trace-3', 'GET /api/users', 'api-service', 3000, 160),
  createTrace('trace-4', 'GET /api/users', 'api-service', 4500, 170),

  // Multiple POST /api/orders (with errors)
  createTrace('trace-5', 'POST /api/orders', 'order-service', 5000, 250, true),
  createTrace('trace-6', 'POST /api/orders', 'order-service', 6000, 300, true),
  createTrace('trace-7', 'POST /api/orders', 'order-service', 7000, 280, true),

  // Single successful POST /api/orders (not grouped with errors)
  createTrace('trace-8', 'POST /api/orders', 'order-service', 8000, 200, false),

  // User Login Flow with workflow matching
  createTrace('trace-9', 'User Login Flow', 'auth-service', 9000, 800, false, {
    storyboardId: 'storyboard-1',
    storyboardName: 'E-Commerce User Journey',
    workflowId: 'workflow-1',
    workflowName: 'Authentication Workflow',
    scenarioId: 'scenario-1',
    scenarioName: 'Happy Path Login',
  }),
  createTrace('trace-10', 'User Login Flow', 'auth-service', 10000, 750, false, {
    storyboardId: 'storyboard-1',
    storyboardName: 'E-Commerce User Journey',
    workflowId: 'workflow-1',
    workflowName: 'Authentication Workflow',
    scenarioId: 'scenario-1',
    scenarioName: 'Happy Path Login',
  }),

  // User Login Flow without workflow matching (separate group)
  createTrace('trace-11', 'User Login Flow', 'auth-service', 11000, 820, false),
];

// Keep only error traces for the WithErrors story
const mockTracesWithErrors = mockTraces.filter(t => t.hasErrors);

// Keep only workflow-matched traces for the WithWorkflowMatching story
const mockTracesWithWorkflow = mockTraces.filter(t => t.matchedWorkflow);

const oldMockTraces: TraceInfo[] = [
  {
    traceId: '1234567890abcdef1234567890abcdef',
    spans: [
      {
        traceId: '1234567890abcdef1234567890abcdef',
        spanId: 'span1',
        name: 'GET /api/users',
        kind: 'SPAN_KIND_SERVER',
        startTimeUnixNano: String((now - 5000) * 1_000_000),
        endTimeUnixNano: String((now - 4800) * 1_000_000),
        attributes: [
          { key: 'http.method', value: { stringValue: 'GET' } },
          { key: 'http.url', value: { stringValue: '/api/users' } },
        ],
        status: { code: 'STATUS_CODE_OK' },
      },
    ],
    rootSpan: {
      traceId: '1234567890abcdef1234567890abcdef',
      spanId: 'span1',
      name: 'GET /api/users',
      kind: 'SPAN_KIND_SERVER',
      startTimeUnixNano: String((now - 5000) * 1_000_000),
      endTimeUnixNano: String((now - 4800) * 1_000_000),
      attributes: [
        { key: 'http.method', value: { stringValue: 'GET' } },
        { key: 'http.url', value: { stringValue: '/api/users' } },
      ],
      status: { code: 'STATUS_CODE_OK' },
    },
    serviceName: 'api-service',
    startTime: now - 5000,
    endTime: now - 4800,
    duration: 200,
    spanCount: 1,
    hasErrors: false,
    resource: {
      attributes: [
        { key: 'service.name', value: { stringValue: 'api-service' } },
      ],
    },
  },
  {
    traceId: 'abcdef1234567890abcdef1234567890',
    spans: [
      {
        traceId: 'abcdef1234567890abcdef1234567890',
        spanId: 'span2',
        name: 'POST /api/orders',
        kind: 'SPAN_KIND_SERVER',
        startTimeUnixNano: String((now - 10000) * 1_000_000),
        endTimeUnixNano: String((now - 9500) * 1_000_000),
        attributes: [
          { key: 'http.method', value: { stringValue: 'POST' } },
          { key: 'http.url', value: { stringValue: '/api/orders' } },
        ],
        status: { code: 'STATUS_CODE_ERROR', message: 'Validation failed' },
        events: [
          {
            timeUnixNano: String((now - 9700) * 1_000_000),
            name: 'exception',
            attributes: [
              { key: 'exception.type', value: { stringValue: 'ValidationError' } },
              { key: 'exception.message', value: { stringValue: 'Missing required field: email' } },
            ],
          },
        ],
      },
    ],
    rootSpan: {
      traceId: 'abcdef1234567890abcdef1234567890',
      spanId: 'span2',
      name: 'POST /api/orders',
      kind: 'SPAN_KIND_SERVER',
      startTimeUnixNano: String((now - 10000) * 1_000_000),
      endTimeUnixNano: String((now - 9500) * 1_000_000),
      attributes: [
        { key: 'http.method', value: { stringValue: 'POST' } },
        { key: 'http.url', value: { stringValue: '/api/orders' } },
      ],
      status: { code: 'STATUS_CODE_ERROR', message: 'Validation failed' },
      events: [
        {
          timeUnixNano: String((now - 9700) * 1_000_000),
          name: 'exception',
          attributes: [
            { key: 'exception.type', value: { stringValue: 'ValidationError' } },
            { key: 'exception.message', value: { stringValue: 'Missing required field: email' } },
          ],
        },
      ],
    },
    serviceName: 'order-service',
    startTime: now - 10000,
    endTime: now - 9500,
    duration: 500,
    spanCount: 1,
    hasErrors: true,
    resource: {
      attributes: [
        { key: 'service.name', value: { stringValue: 'order-service' } },
      ],
    },
  },
  {
    traceId: 'fedcba0987654321fedcba0987654321',
    spans: [
      {
        traceId: 'fedcba0987654321fedcba0987654321',
        spanId: 'span3',
        name: 'User Login Flow',
        kind: 'SPAN_KIND_SERVER',
        startTimeUnixNano: String((now - 15000) * 1_000_000),
        endTimeUnixNano: String((now - 14200) * 1_000_000),
        attributes: [
          { key: 'workflow.step', value: { stringValue: 'login' } },
        ],
        status: { code: 'STATUS_CODE_OK' },
      },
    ],
    rootSpan: {
      traceId: 'fedcba0987654321fedcba0987654321',
      spanId: 'span3',
      name: 'User Login Flow',
      kind: 'SPAN_KIND_SERVER',
      startTimeUnixNano: String((now - 15000) * 1_000_000),
      endTimeUnixNano: String((now - 14200) * 1_000_000),
      attributes: [
        { key: 'workflow.step', value: { stringValue: 'login' } },
      ],
      status: { code: 'STATUS_CODE_OK' },
    },
    serviceName: 'auth-service',
    startTime: now - 15000,
    endTime: now - 14200,
    duration: 800,
    spanCount: 1,
    hasErrors: false,
    resource: {
      attributes: [
        { key: 'service.name', value: { stringValue: 'auth-service' } },
        { key: 'pv.storyboard.id', value: { stringValue: 'storyboard-1' } },
        { key: 'pv.storyboard.name', value: { stringValue: 'E-Commerce User Journey' } },
        { key: 'pv.workflow.id', value: { stringValue: 'workflow-1' } },
        { key: 'pv.workflow.name', value: { stringValue: 'Authentication Workflow' } },
        { key: 'pv.scenario.id', value: { stringValue: 'scenario-1' } },
        { key: 'pv.scenario.name', value: { stringValue: 'Happy Path Login' } },
      ],
    },
    matchedWorkflow: {
      storyboardId: 'storyboard-1',
      storyboardName: 'E-Commerce User Journey',
      workflowId: 'workflow-1',
      workflowName: 'Authentication Workflow',
      scenarioId: 'scenario-1',
      scenarioName: 'Happy Path Login',
    },
  },
];

const meta = {
  title: 'Panels/TraceListPanel',
  component: TraceListPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Panel for displaying OpenTelemetry traces. Shows trace metadata and emits events when traces are selected.',
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
 * Default trace list panel with mock data
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
