import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useEffect } from 'react';
import { TraceListPanel } from './TraceListPanel';
import { TraceDetailsPanel } from './TraceDetailsPanel';
import { CanvasEditorPanel } from './CanvasEditorPanel';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import { AnimatedResizableLayout } from '@principal-ade/panels';
import { MockPanelProvider } from '../mocks/panelContext';
import type { RegisteredTrace } from '../types/otel';
import type { PanelEvent } from '@principal-ade/panel-framework-core';
import type { WorkflowTemplate } from '@principal-ai/principal-view-core';

// Mock trace data using the same structure as TraceListPanel.stories.tsx
const now = Date.now();

/**
 * Mock canvas for the integration story
 */
const mockCanvas = {
  nodes: [
    {
      id: 'auth-start',
      type: 'text',
      text: '# Auth Start',
      x: 0,
      y: 0,
      width: 150,
      height: 60,
      pv: {
        nodeType: 'event',
        fill: '#3b82f6',
        otel: { kind: 'event' },
        event: { name: 'request.started', description: 'Request started' },
      },
    },
    {
      id: 'auth-validated',
      type: 'text',
      text: '# Auth Validated',
      x: 180,
      y: 0,
      width: 150,
      height: 60,
      pv: {
        nodeType: 'event',
        fill: '#10b981',
        otel: { kind: 'event' },
        event: { name: 'auth.validated', description: 'Auth validated' },
      },
    },
    {
      id: 'session-created',
      type: 'text',
      text: '# Session Created',
      x: 360,
      y: 0,
      width: 150,
      height: 60,
      pv: {
        nodeType: 'event',
        fill: '#10b981',
        otel: { kind: 'event' },
        event: { name: 'session.created', description: 'Session created' },
      },
    },
    {
      id: 'response-completed',
      type: 'text',
      text: '# Response Completed',
      x: 540,
      y: 0,
      width: 150,
      height: 60,
      pv: {
        nodeType: 'event',
        fill: '#10b981',
        otel: { kind: 'event' },
        event: { name: 'response.completed', description: 'Response completed' },
      },
    },
    {
      id: 'checkout-initiated',
      type: 'text',
      text: '# Checkout Initiated',
      x: 0,
      y: 100,
      width: 150,
      height: 60,
      pv: {
        nodeType: 'event',
        fill: '#f59e0b',
        otel: { kind: 'event' },
        event: { name: 'checkout.initiated', description: 'Checkout started' },
      },
    },
    {
      id: 'payment-processed',
      type: 'text',
      text: '# Payment Processed',
      x: 180,
      y: 100,
      width: 150,
      height: 60,
      pv: {
        nodeType: 'event',
        fill: '#10b981',
        otel: { kind: 'event' },
        event: { name: 'payment.processed', description: 'Payment processed' },
      },
    },
    {
      id: 'order-confirmed',
      type: 'text',
      text: '# Order Confirmed',
      x: 360,
      y: 100,
      width: 150,
      height: 60,
      pv: {
        nodeType: 'event',
        fill: '#10b981',
        otel: { kind: 'event' },
        event: { name: 'order.confirmed', description: 'Order confirmed' },
      },
    },
  ],
  edges: [],
};

/**
 * Create mock provider with file system simulation
 */
const createMockProviderForIntegration = () => {
  const files = [
    {
      path: '.principal-views/e-commerce/e-commerce.otel.canvas',
      relativePath: '.principal-views/e-commerce/e-commerce.otel.canvas',
      name: 'e-commerce.otel.canvas',
      content: JSON.stringify(mockCanvas),
    },
  ];

  const dirSet = new Set<string>();
  files.forEach(file => {
    const parts = file.path.split('/');
    for (let i = 1; i < parts.length; i++) {
      const dir = parts.slice(0, i).join('/');
      if (dir) dirSet.add(dir);
    }
  });

  const allDirectories = Array.from(dirSet).map(path => ({
    path,
    relativePath: path,
    name: path.split('/').pop() || '',
  }));

  return {
    fileTree: {
      scope: 'repository' as const,
      name: 'fileTree',
      data: {
        allFiles: files,
        allDirectories,
        sha: 'mock-sha-' + Date.now(),
      },
      loading: false,
      error: null,
      refresh: async () => {},
    },
    repositoryPath: '/mock/repository',
    readFile: async (path: string) => {
      const file = files.find((f) => path.endsWith(f.relativePath));
      if (!file) throw new Error(`File not found: ${path}`);
      return file.content;
    },
  };
};

/**
 * Mock workflow templates for the integration story
 */
const mockWorkflowTemplates: Record<string, WorkflowTemplate> = {
  'workflow-1': {
    version: '1.0.0',
    canvas: 'e-commerce.otel.canvas',
    name: 'Authentication Workflow',
    description: 'User authentication and session management',
    mode: 'timeline' as const,
    scenarioSelection: 'first-match' as const,
    scenarios: [
      {
        id: 'scenario-1',
        priority: 1,
        description: 'User logs in successfully',
        template: {
          introduction: 'Successful Login',
          events: {
            'request.started': 'Login request received',
            'auth.validated': 'Credentials validated successfully',
            'session.created': 'Session created: {{session.id}}',
            'response.completed': 'Login completed',
          },
          summary: 'User successfully authenticated.',
        },
      },
    ],
  } as WorkflowTemplate,
  'workflow-2': {
    version: '1.0.0',
    canvas: 'e-commerce.otel.canvas',
    name: 'Checkout Workflow',
    description: 'E-commerce checkout process',
    mode: 'timeline' as const,
    scenarioSelection: 'first-match' as const,
    scenarios: [
      {
        id: 'scenario-2',
        priority: 1,
        description: 'User completes checkout successfully',
        template: {
          introduction: 'Complete Checkout',
          events: {
            'checkout.initiated': 'Checkout started for {{cart.itemCount}} items',
            'payment.processed': 'Payment processed: ${{payment.amount}}',
            'order.confirmed': 'Order confirmed: {{order.id}}',
          },
          summary: 'Checkout completed successfully.',
        },
      },
    ],
  } as WorkflowTemplate,
  'workflow-3': {
    version: '1.0.0',
    canvas: 'e-commerce.otel.canvas',
    name: 'Checkout',
    description: 'Final checkout step',
    mode: 'timeline' as const,
    scenarioSelection: 'first-match' as const,
    scenarios: [
      {
        id: 'scenario-3',
        priority: 1,
        description: 'Order is placed successfully',
        template: {
          introduction: 'Order Placed',
          events: {
            'order.created': 'Order created: {{order.id}}',
            'confirmation.sent': 'Confirmation email sent',
          },
          summary: 'Order placed successfully.',
        },
      },
    ],
  } as WorkflowTemplate,
};

/**
 * State for CanvasEditorPanel when showing workflow
 */
interface CanvasEditorState {
  canvasPath?: string;
  canvasName?: string;
  workflowId?: string;
  workflowTemplate?: WorkflowTemplate;
  traceMatchInfo?: Array<{
    scenarioId: string;
    matchType: 'full' | 'partial';
    coveragePercent?: number;
  }>;
  selectedScenarioId?: string;
  selectedTrace?: RegisteredTrace;
}

/**
 * Helper to create OTEL KeyValue attribute
 */
const createAttribute = (key: string, value: string | number | boolean) => {
  if (typeof value === 'string') {
    return { key, value: { stringValue: value } };
  } else if (typeof value === 'number') {
    return { key, value: { intValue: value } };
  } else {
    return { key, value: { boolValue: value } };
  }
};

/**
 * Create a trace with the RegisteredTrace API structure
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
  },
  spanEvents?: Array<{
    name: string;
    attributes?: Record<string, string | number | boolean>;
  }>
): RegisteredTrace => {
  const startTime = now - offset;
  const endTime = startTime + duration;
  const startTimeNano = BigInt(startTime * 1_000_000);
  const endTimeNano = BigInt(endTime * 1_000_000);
  const spanId = `span-${traceId}`;

  // Convert span events to OTEL format
  const otelEvents = spanEvents?.map((event, index) => ({
    timeUnixNano: String(startTimeNano + BigInt(index * 10_000_000)), // 10ms apart
    name: event.name,
    attributes: event.attributes
      ? Object.entries(event.attributes).map(([key, value]) => createAttribute(key, value))
      : [],
  })) || [];

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
            spanIds: [spanId],
          },
        ],
      },
    ],
    // Include otlpData for getSpansFromTrace to extract
    otlpData: {
      resourceSpans: [
        {
          resource: {
            attributes: [createAttribute('service.name', serviceName)],
          },
          scopeSpans: [
            {
              scope: {
                name: scopeName,
                version: scopeVersion,
              },
              spans: [
                {
                  traceId,
                  spanId,
                  name,
                  kind: 1,
                  startTimeUnixNano: String(startTimeNano),
                  endTimeUnixNano: String(endTimeNano),
                  attributes: [
                    createAttribute('service.name', serviceName),
                  ],
                  events: otelEvents,
                  status: hasError ? { code: 2 } : { code: 1 },
                },
              ],
            },
          ],
        },
      ],
    },
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
                spanId,
                spanName: name,
                nodeId: `node-${scenarioMatch.scenarioId}`,
                timestamp: startTime,
                duration,
                events: spanEvents?.map(e => e.name) || ['request.started', 'response.completed'],
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
              spanId,
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
    events?: Array<{
      name: string;
      attributes?: Record<string, string | number | boolean>;
    }>;
  }>
): RegisteredTrace => {
  const startTime = now - offset;
  const endTime = startTime + duration;
  const startTimeNano = BigInt(startTime * 1_000_000);
  const spanDuration = duration / scenarios.length;

  // Create spans for each scenario
  const spans = scenarios.map((scenario, index) => {
    const spanStartTime = startTime + (index * spanDuration);
    const spanStartTimeNano = BigInt(spanStartTime * 1_000_000);
    const spanEndTimeNano = BigInt((spanStartTime + spanDuration) * 1_000_000);
    const spanId = `span-${traceId}-${index}`;

    // Convert span events to OTEL format
    const otelEvents = scenario.events?.map((event, eventIndex) => ({
      timeUnixNano: String(spanStartTimeNano + BigInt(eventIndex * 10_000_000)),
      name: event.name,
      attributes: event.attributes
        ? Object.entries(event.attributes).map(([key, value]) => createAttribute(key, value))
        : [],
    })) || [];

    return {
      traceId,
      spanId,
      name: `${name} - ${scenario.workflowName}`,
      kind: 1,
      startTimeUnixNano: String(spanStartTimeNano),
      endTimeUnixNano: String(spanEndTimeNano),
      attributes: [createAttribute('service.name', serviceName)],
      events: otelEvents,
      status: { code: 1 },
    };
  });

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
    // Include otlpData for getSpansFromTrace to extract
    otlpData: {
      resourceSpans: [
        {
          resource: {
            attributes: [createAttribute('service.name', serviceName)],
          },
          scopeSpans: [
            {
              scope: {
                name: scopeName,
                version: scopeVersion,
              },
              spans,
            },
          ],
        },
      ],
    },
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
          timestamp: startTime + (index * spanDuration),
          duration: spanDuration,
          events: scenario.events?.map(e => e.name) || ['workflow.started', 'workflow.completed'],
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

/**
 * Mock traces for the integration story
 */
const mockTraces: RegisteredTrace[] = [
  // Unmatched traces
  createTrace('trace-1', 'GET /api/users', 'api-service', '@otel/http', '1.0.0', 1000, 150),
  createTrace('trace-2', 'POST /api/orders', 'order-service', '@otel/http', '2.1.0', 2000, 250, true),

  // Scenario-matched traces with event attributes for template interpolation
  createTrace(
    'trace-3',
    'User Login Flow',
    'auth-service',
    '@otel/http',
    '1.2.0',
    3000,
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
    },
    // Events with attributes that match template variables
    [
      { name: 'request.started', attributes: { 'http.method': 'POST', 'http.url': '/api/login' } },
      { name: 'auth.validated', attributes: { 'user.id': 'user-12345', 'auth.method': 'password' } },
      { name: 'session.created', attributes: { 'session.id': 'sess-abc123xyz', 'session.ttl': 3600 } },
      { name: 'response.completed', attributes: { 'http.status_code': 200 } },
    ]
  ),
  createTrace(
    'trace-4',
    'Checkout Process',
    'checkout-service',
    '@otel/http',
    '1.0.0',
    4000,
    1200,
    false,
    {
      storyboardId: 'storyboard-1',
      storyboardName: 'E-Commerce User Journey',
      workflowId: 'workflow-2',
      workflowName: 'Checkout Workflow',
      scenarioId: 'scenario-2',
      coveragePercent: 85,
      matchType: 'partial',
    },
    // Events with attributes for checkout template
    [
      { name: 'checkout.initiated', attributes: { 'cart.itemCount': 3, 'cart.total': 149.97 } },
      { name: 'payment.processed', attributes: { 'payment.amount': 149.97, 'payment.method': 'credit_card' } },
      { name: 'order.confirmed', attributes: { 'order.id': 'ORD-78901', 'order.status': 'confirmed' } },
    ]
  ),

  // Multi-workflow trace with events for each scenario
  createMultiWorkflowTrace(
    'trace-5',
    'Complete User Journey',
    'platform-service',
    '@otel/platform',
    '3.0.0',
    5000,
    1500,
    [
      {
        storyboardId: 'storyboard-1',
        storyboardName: 'E-Commerce User Journey',
        workflowId: 'workflow-1',
        workflowName: 'Authentication',
        scenarioId: 'scenario-1',
        coveragePercent: 100,
        events: [
          { name: 'request.started', attributes: { 'http.method': 'POST', 'http.url': '/api/login' } },
          { name: 'auth.validated', attributes: { 'user.id': 'user-67890', 'auth.method': 'oauth' } },
          { name: 'session.created', attributes: { 'session.id': 'sess-journey-auth-001', 'session.ttl': 7200 } },
          { name: 'response.completed', attributes: { 'http.status_code': 200 } },
        ],
      },
      {
        storyboardId: 'storyboard-1',
        storyboardName: 'E-Commerce User Journey',
        workflowId: 'workflow-2',
        workflowName: 'Shopping Cart',
        scenarioId: 'scenario-2',
        coveragePercent: 95,
        events: [
          { name: 'checkout.initiated', attributes: { 'cart.itemCount': 5, 'cart.total': 299.95 } },
          { name: 'payment.processed', attributes: { 'payment.amount': 299.95, 'payment.method': 'paypal' } },
          { name: 'order.confirmed', attributes: { 'order.id': 'ORD-JOURNEY-456', 'order.status': 'confirmed' } },
        ],
      },
      {
        storyboardId: 'storyboard-1',
        storyboardName: 'E-Commerce User Journey',
        workflowId: 'workflow-3',
        workflowName: 'Checkout',
        scenarioId: 'scenario-3',
        coveragePercent: 100,
        events: [
          { name: 'order.created', attributes: { 'order.id': 'ORD-JOURNEY-456', 'order.items': 5 } },
          { name: 'confirmation.sent', attributes: { 'email.recipient': 'user@example.com', 'email.template': 'order-confirmation' } },
        ],
      },
    ]
  ),
];

const meta = {
  title: 'Panels/TraceViewerCanvasEditorIntegration',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Integration story showing TraceListPanel with CanvasEditorPanel (instead of WorkflowScenariosPanel).\n\n' +
          'This story tests the migration path from WorkflowScenariosPanel to CanvasEditorPanel.\n\n' +
          '**Interactions:**\n' +
          '- Click trace ID or unmatched span → Shows TraceDetailsPanel\n' +
          '- Click matched span (green) → Shows CanvasEditorPanel with workflow scenarios\n\n' +
          '**Key Difference from TraceViewerIntegration:**\n' +
          '- Uses CanvasEditorPanel with `workflowTemplate` and `traceMatchInfo` props\n' +
          '- CanvasEditorPanel displays ScenariosList in left panel when workflow is provided',
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
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Inner component that uses hooks and receives panel props
 */
interface PanelInnerProps {
  props: any;
  direction: 'horizontal' | 'vertical';
  selectedTrace: RegisteredTrace | null;
  setSelectedTrace: (trace: RegisteredTrace | null) => void;
  canvasEditorState: CanvasEditorState | null;
  setCanvasEditorState: (state: CanvasEditorState | null) => void;
}

const PanelInner: React.FC<PanelInnerProps> = ({
  props,
  direction,
  selectedTrace,
  setSelectedTrace,
  canvasEditorState,
  setCanvasEditorState,
}) => {
  const { theme } = useTheme();

  // Listen for trace selection events from TraceListPanel (unmatched spans)
  useEffect(() => {
    if (!props.events) return;

    const unsubscribe = props.events.on('trace:selected', (event: PanelEvent) => {
      const payload = event.payload as { trace?: RegisteredTrace; traceId?: string };
      if (payload.trace) {
        setSelectedTrace(payload.trace);
        setCanvasEditorState(null); // Clear canvas state when selecting a trace
      }
    });

    return unsubscribe;
  }, [props.events, setSelectedTrace, setCanvasEditorState]);

  // Listen for openCanvas events from TraceListPanel (matched spans)
  useEffect(() => {
    if (!props.events) return;

    const unsubscribe = props.events.on('custom', (event: PanelEvent) => {
      const payload = event.payload as {
        action?: string;
        canvasId?: string;
        canvasPath?: string;
        canvas?: { id: string; path: string; name: string };
        workflowId?: string;
        workflowPath?: string;
        workflow?: WorkflowTemplate;
        scenarioId?: string;
        traceId?: string;
        spanId?: string;
        trace?: RegisteredTrace;
      };

      if (payload.action === 'openCanvas') {
        // Look up workflow template from our mock data if not provided
        const workflowTemplate = payload.workflow || mockWorkflowTemplates[payload.workflowId || ''];

        // Extract traceMatchInfo from the trace's scenarioMatches
        const trace = payload.trace || mockTraces.find(t => t.traceId === payload.traceId);
        const traceMatchInfo = trace?.scenarioMatches?.map(match => ({
          scenarioId: match.scenarioId,
          matchType: (match.matchType || 'full') as 'full' | 'partial',
          coveragePercent: match.coveragePercent,
        }));

        setCanvasEditorState({
          canvasPath: payload.canvasPath || payload.canvas?.path || '.principal-views/e-commerce/e-commerce.otel.canvas',
          canvasName: payload.canvas?.name || 'E-Commerce User Journey',
          workflowId: payload.workflowId,
          workflowTemplate,
          traceMatchInfo,
          selectedScenarioId: payload.scenarioId,
          selectedTrace: trace,
        });
        setSelectedTrace(null); // Clear trace selection when opening canvas
      }
    });

    return unsubscribe;
  }, [props.events, setCanvasEditorState, setSelectedTrace]);

  // Determine which panel to show on the right
  const rightPanel = canvasEditorState ? (
    <CanvasEditorPanel
      {...props}
      canvasPath={canvasEditorState.canvasPath}
      canvasName={canvasEditorState.canvasName}
      workflowTemplate={canvasEditorState.workflowTemplate}
      selectedWorkflowId={canvasEditorState.workflowId}
      traceMatchInfo={canvasEditorState.traceMatchInfo}
      selectedScenarioId={canvasEditorState.selectedScenarioId}
      selectedTrace={canvasEditorState.selectedTrace}
    />
  ) : (
    <TraceDetailsPanel {...props} selectedTrace={selectedTrace} />
  );

  return (
    <AnimatedResizableLayout
      leftPanel={<TraceListPanel {...props} />}
      rightPanel={rightPanel}
      defaultSize={direction === 'horizontal' ? 40 : 50}
      minSize={direction === 'horizontal' ? 20 : 30}
      theme={theme}
    />
  );
};

/**
 * Integration wrapper that manages trace selection state
 */
const TraceViewerWrapper: React.FC<{ direction: 'horizontal' | 'vertical' }> = ({ direction }) => {
  const [selectedTrace, setSelectedTrace] = useState<RegisteredTrace | null>(null);
  const [canvasEditorState, setCanvasEditorState] = useState<CanvasEditorState | null>(null);

  const mockProvider = createMockProviderForIntegration();

  return (
    <MockPanelProvider
      contextOverrides={{
        telemetry: {
          scope: 'repository' as const,
          name: 'telemetry',
          data: mockTraces,
          loading: false,
          error: null,
          refresh: async () => {
            console.log('[Mock] Refreshing telemetry slice');
          },
        },
        fileTree: mockProvider.fileTree,
        repositoryPath: mockProvider.repositoryPath,
      }}
      actionsOverrides={{
        readFile: mockProvider.readFile,
      }}
    >
      {(props) => (
        <PanelInner
          props={props}
          direction={direction}
          selectedTrace={selectedTrace}
          setSelectedTrace={setSelectedTrace}
          canvasEditorState={canvasEditorState}
          setCanvasEditorState={setCanvasEditorState}
        />
      )}
    </MockPanelProvider>
  );
};

/**
 * Side-by-side layout showing trace list and canvas editor
 * Click a matched span (green) to see the CanvasEditorPanel with workflow scenarios
 */
export const SideBySide: Story = {
  render: () => <TraceViewerWrapper direction="horizontal" />,
};

/**
 * Vertical stack layout
 */
export const Stacked: Story = {
  render: () => <TraceViewerWrapper direction="vertical" />,
};
