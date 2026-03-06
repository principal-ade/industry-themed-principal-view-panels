import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useRef } from 'react';
import { CanvasEditorPanel } from './CanvasEditorPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import { ConfigLoader } from './principal-view/ConfigLoader';
import type { DataSlice, PanelEvent } from '../types';
import { GraphRenderer, type GraphRendererHandle } from '@principal-ai/principal-view-react';
import type { ComponentLibrary, WorkflowTemplate } from '@principal-ai/principal-view-core';

/**
 * CanvasEditorPanel visualizes .canvas files as interactive graphs.
 * It demonstrates graph rendering with ReactFlow and ExtendedCanvas format.
 */
const meta = {
  title: 'Panels/CanvasEditorPanel',
  component: CanvasEditorPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visualizes .canvas configuration files as interactive graph diagrams. Supports multiple node types, edge styles, and real-time updates.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', width: '100vw', background: '#f5f5f5' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof CanvasEditorPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simple canvas matching the working GraphRenderer editable story
 * Uses the exact same sample data that works in the core library
 */
const sampleCanvas = {
  nodes: [
    {
      id: 'node-1',
      type: 'text' as const,
      x: 100,
      y: 100,
      width: 140,
      height: 70,
      text: 'Input Processor',
      color: '#4A90E2',
      pv: {
        nodeType: 'process',
        shape: 'rectangle' as const,
        icon: 'Settings',
      },
    },
    {
      id: 'node-2',
      type: 'text' as const,
      x: 300,
      y: 100,
      width: 100,
      height: 100,
      text: 'Database',
      color: '#7B68EE',
      pv: {
        nodeType: 'data',
        shape: 'circle' as const,
        icon: 'Database',
      },
    },
    {
      id: 'node-3',
      type: 'text' as const,
      x: 500,
      y: 100,
      width: 140,
      height: 70,
      text: 'Output Handler',
      color: '#4A90E2',
      pv: {
        nodeType: 'process',
        shape: 'rectangle' as const,
        icon: 'Settings',
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      fromNode: 'node-1',
      toNode: 'node-2',
      pv: { edgeType: 'dataflow' },
    },
    {
      id: 'edge-2',
      fromNode: 'node-2',
      toNode: 'node-3',
      pv: { edgeType: 'dataflow' },
    },
  ],
  pv: {
    version: '1.0.0',
    name: 'Sample Validation Graph',
    description: 'Example graph configuration',
    edgeTypes: {
      dataflow: {
        style: 'solid' as const,
        color: '#50E3C2',
        directed: true,
      },
      dependency: {
        style: 'dashed' as const,
        color: '#F5A623',
        directed: true,
      },
    },
  },
};

/**
 * Direct GraphRenderer test - bypasses CanvasEditorPanel completely
 * This should work identically to the core library's editable story
 */
const DirectGraphRendererTemplate = () => {
  const graphRef = useRef<GraphRendererHandle>(null);
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #ddd' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Direct GraphRenderer (Same as Core Library)</div>
        <div style={{ fontSize: 12, color: '#666' }}>
          This renders GraphRenderer directly without CanvasEditorPanel wrapper
        </div>
        {hasChanges && (
          <div style={{ marginTop: 8, padding: '6px 12px', background: '#fef3c7', borderRadius: 4, fontSize: 12 }}>
            ⚠️ You have unsaved changes
          </div>
        )}
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <GraphRenderer
          ref={graphRef}
          canvas={sampleCanvas}
          width={800}
          height={500}
          editable={true}
          onPendingChangesChange={setHasChanges}
        />
      </div>
    </div>
  );
};

export const DirectGraphRenderer: Story = {
  args: {} as never,
  render: () => <DirectGraphRendererTemplate />,
};

export const Default: Story = {
  args: {} as never,
  render: () => {
    const fileTreeData = {
      allFiles: [
        {
          path: '.principal-views/sample.canvas',
          relativePath: '.principal-views/sample.canvas',
          name: 'sample.canvas',
          content: JSON.stringify(sampleCanvas, null, 2),
        },
      ],
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: fileTreeData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    const configs = ConfigLoader.findConfigs(fileTreeData.allFiles);
    const firstCanvas = configs.length > 0 ? configs[0] : null;

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
          repositoryPath: '/mock/repository',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
        actionsOverrides={{
          readFile: async (path: string) => {
            const fileName = path.split('/').pop() || '';
            const file = fileTreeData.allFiles.find((f) => f.path === fileName || f.name === fileName);
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return file.content;
          },
          writeFile: async (path: string, content: string) => {
            const fileName = path.split('/').pop() || '';
            const file = fileTreeData.allFiles.find((f) => f.path.endsWith(fileName) || f.name === fileName);
            if (file) {
              file.content = content;
              console.log('[Storybook Mock] Saved file:', path);
              console.log('[Storybook Mock] Content:', JSON.parse(content));
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <CanvasEditorPanel {...props} canvasPath={firstCanvas?.path} canvasName={firstCanvas?.name} />}
      </MockPanelProvider>
    );
  },
};

// ============================================================================
// With Close Button Story - Shows the optional close panel button
// ============================================================================

export const WithCloseButton: Story = {
  args: {} as never,
  render: () => {
    const [closed, setClosed] = useState(false);

    const fileTreeData = {
      allFiles: [
        {
          path: '.principal-views/sample.canvas',
          relativePath: '.principal-views/sample.canvas',
          name: 'sample.canvas',
          content: JSON.stringify(sampleCanvas, null, 2),
        },
      ],
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: fileTreeData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    const configs = ConfigLoader.findConfigs(fileTreeData.allFiles);
    const firstCanvas = configs.length > 0 ? configs[0] : null;

    if (closed) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 16,
        }}>
          <div style={{ fontSize: 18, color: '#666' }}>Panel closed!</div>
          <button
            onClick={() => setClosed(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Reopen Panel
          </button>
        </div>
      );
    }

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
          repositoryPath: '/mock/repository',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
        actionsOverrides={{
          readFile: async (path: string) => {
            const fileName = path.split('/').pop() || '';
            const file = fileTreeData.allFiles.find((f) => f.path === fileName || f.name === fileName);
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return file.content;
          },
          writeFile: async (path: string, content: string) => {
            const fileName = path.split('/').pop() || '';
            const file = fileTreeData.allFiles.find((f) => f.path.endsWith(fileName) || f.name === fileName);
            if (file) {
              file.content = content;
              console.log('[Storybook Mock] Saved file:', path);
              console.log('[Storybook Mock] Content:', JSON.parse(content));
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => (
          <CanvasEditorPanel
            {...props}
            canvasPath={firstCanvas?.path}
            canvasName={firstCanvas?.name}
            onClosePanel={() => setClosed(true)}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**With Close Button**

This story demonstrates the optional close button that appears in the header when \`onClosePanel\` is provided.

The close button (X icon) appears at the far right of the header toolbar. Clicking it triggers the \`onClosePanel\` callback.

**Usage:**
\`\`\`tsx
<CanvasEditorPanel
  // ... other props
  onClosePanel={() => {
    // Handle panel close
  }}
/>
\`\`\`
        `,
      },
    },
  },
};

// ============================================================================
// Read Only Story - Shows panel without edit button (no writeFile action)
// ============================================================================

export const ReadOnly: Story = {
  args: {} as never,
  render: () => {
    const fileTreeData = {
      allFiles: [
        {
          path: '.principal-views/sample.canvas',
          relativePath: '.principal-views/sample.canvas',
          name: 'sample.canvas',
          content: JSON.stringify(sampleCanvas, null, 2),
        },
      ],
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: fileTreeData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    const configs = ConfigLoader.findConfigs(fileTreeData.allFiles);
    const firstCanvas = configs.length > 0 ? configs[0] : null;

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
          repositoryPath: '/mock/repository',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
        actionsOverrides={{
          readFile: async (path: string) => {
            const fileName = path.split('/').pop() || '';
            const file = fileTreeData.allFiles.find((f) => f.path === fileName || f.name === fileName);
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return file.content;
          },
          // Explicitly set to undefined to hide edit/refresh buttons
          writeFile: undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => (
          <CanvasEditorPanel
            {...props}
            canvasPath={firstCanvas?.path}
            canvasName={firstCanvas?.name}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**Read Only Mode**

This story shows the panel without the edit button. The edit button (pencil icon) is hidden because no \`writeFile\` action is provided.

This is useful for embedding the canvas viewer in contexts where editing should not be allowed.
        `,
      },
    },
  },
};

// ============================================================================
// Library Colors Story - Tests that nodeComponent colors from library.yaml work
// ============================================================================

const libraryColorTestLibrary: ComponentLibrary = {
  version: '1.0.0',
  name: 'Color Test Library',
  description: 'Library for testing color inheritance from library.yaml',
  resources: {},
  nodeComponents: {
    'api-service': {
      description: 'API Service - should be RED',
      shape: 'rectangle',
      color: '#EF4444', // RED
      icon: 'Server',
    },
    'database': {
      description: 'Database - should be GREEN',
      shape: 'circle',
      color: '#22C55E', // GREEN
      icon: 'Database',
    },
    'processor': {
      description: 'Processor - should be BLUE',
      shape: 'hexagon',
      color: '#3B82F6', // BLUE
      icon: 'Cpu',
    },
    'gateway': {
      description: 'Gateway - should be PURPLE',
      shape: 'diamond',
      color: '#A855F7', // PURPLE
      icon: 'Network',
    },
  },
  edgeComponents: {
    'data-flow': {
      description: 'Data flow - should be ORANGE',
      style: 'solid',
      color: '#F97316', // ORANGE
      directed: true,
    },
    'dependency': {
      description: 'Dependency - should be CYAN',
      style: 'dashed',
      color: '#06B6D4', // CYAN
      directed: true,
    },
  },
};

const libraryColorCanvas = {
  nodes: [
    {
      id: 'api',
      type: 'text' as const,
      x: 100,
      y: 100,
      width: 160,
      height: 80,
      text: 'API Service\n(should be RED)',
      pv: {
        nodeType: 'api-service',
        shape: 'rectangle' as const,
      },
    },
    {
      id: 'db',
      type: 'text' as const,
      x: 350,
      y: 100,
      width: 120,
      height: 120,
      text: 'Database\n(should be GREEN)',
      pv: {
        nodeType: 'database',
        shape: 'circle' as const,
      },
    },
    {
      id: 'processor',
      type: 'text' as const,
      x: 550,
      y: 100,
      width: 140,
      height: 100,
      text: 'Processor\n(should be BLUE)',
      pv: {
        nodeType: 'processor',
        shape: 'hexagon' as const,
      },
    },
    {
      id: 'gateway',
      type: 'text' as const,
      x: 100,
      y: 280,
      width: 140,
      height: 100,
      text: 'Gateway\n(should be PURPLE)',
      pv: {
        nodeType: 'gateway',
        shape: 'diamond' as const,
      },
    },
    {
      id: 'override-test',
      type: 'text' as const,
      x: 350,
      y: 280,
      width: 160,
      height: 80,
      text: 'Override Test\n(should be YELLOW)',
      color: '#EAB308', // YELLOW - should override library color
      pv: {
        nodeType: 'api-service', // Would be RED, but node.color overrides
        shape: 'rectangle' as const,
      },
    },
  ],
  edges: [
    {
      id: 'api-to-db',
      fromNode: 'api',
      toNode: 'db',
      pv: { edgeType: 'data-flow' }, // Should be ORANGE from library
    },
    {
      id: 'db-to-processor',
      fromNode: 'db',
      toNode: 'processor',
      pv: { edgeType: 'dependency' }, // Should be CYAN from library
    },
    {
      id: 'gateway-to-api',
      fromNode: 'gateway',
      toNode: 'api',
      pv: { edgeType: 'data-flow' },
    },
  ],
  pv: {
    version: '1.0.0',
    name: 'Library Color Test',
    description: 'Tests that colors from library.yaml nodeComponents are applied',
  },
};

/**
 * Tests that library.yaml nodeComponent colors are correctly applied to nodes.
 * Each node uses a nodeType that maps to a library component with a specific color.
 */
const LibraryColorsTemplate = () => {
  const graphRef = useRef<GraphRendererHandle>(null);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #ddd' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Library Colors Test</div>
        <div style={{ fontSize: 12, color: '#666' }}>
          Tests that nodeComponent colors from library.yaml are applied via the library prop.
          Each node should show the color defined in its nodeType's library component.
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>
          <strong>Expected:</strong> API=RED, Database=GREEN, Processor=BLUE, Gateway=PURPLE, Override=YELLOW (node.color wins)
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <GraphRenderer
          ref={graphRef}
          canvas={libraryColorCanvas}
          library={libraryColorTestLibrary}
          width={800}
          height={500}
        />
      </div>
    </div>
  );
};

export const LibraryColors: Story = {
  args: {} as never,
  render: () => <LibraryColorsTemplate />,
  parameters: {
    docs: {
      description: {
        story: `
**Library Colors Test**

This story verifies that colors defined in \`library.yaml\` nodeComponents are correctly applied
when nodes reference them via \`nodeType\`.

**Test Cases:**
- API Service: Uses \`api-service\` nodeType → should be RED (#EF4444)
- Database: Uses \`database\` nodeType → should be GREEN (#22C55E)
- Processor: Uses \`processor\` nodeType → should be BLUE (#3B82F6)
- Gateway: Uses \`gateway\` nodeType → should be PURPLE (#A855F7)
- Override Test: Uses \`api-service\` but has \`node.color\` → should be YELLOW (#EAB308)

**Edge Colors:**
- API→DB: Uses \`data-flow\` → should be ORANGE (#F97316)
- DB→Processor: Uses \`dependency\` → should be CYAN (#06B6D4)
        `,
      },
    },
  },
};

// ============================================================================
// Programmatic Scenario Control Story - Demonstrates external scenario selection
// ============================================================================

/**
 * Canvas with OTEL events for scenario demonstration
 */
const scenarioCanvas = {
  nodes: [
    {
      id: 'user-action',
      type: 'text' as const,
      x: 200,
      y: 50,
      width: 160,
      height: 70,
      text: 'User Action',
      color: '#3b82f6',
      pv: {
        nodeType: 'event',
        shape: 'rectangle' as const,
        icon: 'User',
        event: {
          name: 'user.action',
          description: 'User initiates action',
        },
      },
    },
    {
      id: 'api-call',
      type: 'text' as const,
      x: 200,
      y: 160,
      width: 160,
      height: 70,
      text: 'API Call',
      color: '#10b981',
      pv: {
        nodeType: 'event',
        shape: 'rectangle' as const,
        icon: 'Server',
        event: {
          name: 'api.request',
          description: 'API request made',
        },
      },
    },
    {
      id: 'db-query',
      type: 'text' as const,
      x: 80,
      y: 270,
      width: 140,
      height: 70,
      text: 'DB Query',
      color: '#8b5cf6',
      pv: {
        nodeType: 'event',
        shape: 'circle' as const,
        icon: 'Database',
        event: {
          name: 'db.query',
          description: 'Database query executed',
        },
      },
    },
    {
      id: 'cache-check',
      type: 'text' as const,
      x: 320,
      y: 270,
      width: 140,
      height: 70,
      text: 'Cache Check',
      color: '#f59e0b',
      pv: {
        nodeType: 'event',
        shape: 'rectangle' as const,
        icon: 'Zap',
        event: {
          name: 'cache.check',
          description: 'Cache lookup',
        },
      },
    },
    {
      id: 'response-sent',
      type: 'text' as const,
      x: 200,
      y: 380,
      width: 160,
      height: 70,
      text: 'Response',
      color: '#22c55e',
      pv: {
        nodeType: 'event',
        shape: 'rectangle' as const,
        icon: 'Check',
        event: {
          name: 'api.response',
          description: 'Response sent to user',
        },
      },
    },
    {
      id: 'error-handler',
      type: 'text' as const,
      x: 400,
      y: 380,
      width: 140,
      height: 70,
      text: 'Error Handler',
      color: '#ef4444',
      pv: {
        nodeType: 'event',
        shape: 'rectangle' as const,
        icon: 'AlertTriangle',
        event: {
          name: 'error.occurred',
          description: 'Error handling',
        },
      },
    },
  ],
  edges: [
    { id: 'e1', fromNode: 'user-action', toNode: 'api-call', pv: { edgeType: 'flow' } },
    { id: 'e2', fromNode: 'api-call', toNode: 'db-query', pv: { edgeType: 'flow' } },
    { id: 'e3', fromNode: 'api-call', toNode: 'cache-check', pv: { edgeType: 'flow' } },
    { id: 'e4', fromNode: 'db-query', toNode: 'response-sent', pv: { edgeType: 'flow' } },
    { id: 'e5', fromNode: 'cache-check', toNode: 'response-sent', pv: { edgeType: 'flow' } },
    { id: 'e6', fromNode: 'db-query', toNode: 'error-handler', pv: { edgeType: 'error', style: 'dashed' } },
  ],
  pv: {
    version: '1.0.0',
    name: 'API Request Flow',
    description: 'Sample workflow with multiple scenarios',
    edgeTypes: {
      flow: { style: 'solid' as const, color: '#64748b', directed: true },
      error: { style: 'dashed' as const, color: '#ef4444', directed: true },
    },
  },
};

/**
 * Workflow template with multiple scenarios
 */
const scenarioWorkflow: WorkflowTemplate = {
  version: '1.0.0',
  canvas: 'api-flow.canvas',
  name: 'API Request Workflow',
  description: 'Workflow scenarios for API requests',
  mode: 'timeline' as const,
  scenarioSelection: 'first-match' as const,
  scenarios: [
    {
      id: 'cache-hit',
      priority: 1,
      description: 'Request served from cache',
      template: {
        introduction: 'Cache Hit - Fast Response',
        events: {
          'user.action': 'User initiated request',
          'api.request': 'API received request',
          'cache.check': 'Cache HIT! Data found in cache',
          'api.response': 'Fast response from cache ({{response.time}}ms)',
        },
        summary: 'Request served from cache. No database access needed.',
      },
    },
    {
      id: 'cache-miss-success',
      priority: 2,
      description: 'Cache miss, successful DB query',
      template: {
        introduction: 'Cache Miss - Database Query',
        events: {
          'user.action': 'User initiated request',
          'api.request': 'API received request',
          'cache.check': 'Cache MISS - querying database',
          'db.query': 'Database query executed ({{query.duration}}ms)',
          'api.response': 'Response sent with fresh data',
        },
        summary: 'Data fetched from database and cached for future requests.',
      },
    },
    {
      id: 'db-error',
      priority: 3,
      description: 'Database query failed',
      template: {
        introduction: 'Database Error',
        events: {
          'user.action': 'User initiated request',
          'api.request': 'API received request',
          'cache.check': 'Cache MISS - querying database',
          'db.query': 'Query started...',
          'error.occurred': 'Database error: {{error.message}}',
        },
        summary: 'Database query failed. Error logged and user notified.',
      },
    },
    {
      id: 'full-flow',
      priority: 99,
      description: 'Complete flow (default)',
      template: {
        introduction: 'Complete API Flow',
        events: {
          'user.action': 'User action received',
          'api.request': 'Processing API request',
          'cache.check': 'Checking cache',
          'db.query': 'Querying database',
          'api.response': 'Sending response',
          'error.occurred': 'Error occurred',
        },
        summary: 'Complete flow executed.',
      },
    },
  ],
};

/**
 * Programmatic Scenario Control - Demonstrates external control of scenario selection
 * Used for tours and external navigation where scenarios need to be selected programmatically.
 *
 * Supported events:
 * - { action: 'selectScenario', scenarioId: string, mode?: 'list' | 'carousel' }
 */
export const ProgrammaticScenarioControl: Story = {
  args: {} as never,
  render: () => {
    const [eventLog, setEventLog] = useState<Array<{ timestamp: string; action: string; detail: string }>>([]);

    // Create a ref to hold event listeners
    const listenersRef = React.useRef<Map<string, Set<(event: unknown) => void>>>(new Map());

    // Create events object with working on/off/emit
    const mockEvents = React.useMemo(() => ({
      emit: (event: PanelEvent<unknown>) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Event emitted:`, event);

        // Dispatch to registered listeners
        const listeners = listenersRef.current.get(event.type);
        if (listeners) {
          listeners.forEach(listener => listener(event));
        }
      },
      on: (type: string, callback: (event: unknown) => void) => {
        if (!listenersRef.current.has(type)) {
          listenersRef.current.set(type, new Set());
        }
        listenersRef.current.get(type)!.add(callback);
        return () => {
          listenersRef.current.get(type)?.delete(callback);
        };
      },
      off: (type: string, callback: (event: unknown) => void) => {
        listenersRef.current.get(type)?.delete(callback);
      },
    }), []);

    // Function to select a scenario
    const selectScenario = (scenarioId: string, mode?: 'list' | 'carousel') => {
      const timestamp = new Date().toLocaleTimeString();
      const detail = mode ? `${scenarioId} (${mode} mode)` : scenarioId;
      setEventLog(prev => [{ timestamp, action: 'selectScenario', detail }, ...prev].slice(0, 10));

      mockEvents.emit({
        type: 'custom',
        source: 'external-tour-control',
        timestamp: Date.now(),
        payload: { action: 'selectScenario', scenarioId, mode },
      });
    };

    // Function to select an event by index
    const selectEventByIndex = (eventIndex: number) => {
      const timestamp = new Date().toLocaleTimeString();
      setEventLog(prev => [{ timestamp, action: 'selectEvent', detail: `index: ${eventIndex}` }, ...prev].slice(0, 10));

      mockEvents.emit({
        type: 'custom',
        source: 'external-tour-control',
        timestamp: Date.now(),
        payload: { action: 'selectEvent', eventIndex },
      });
    };

    // Function to select an event by name
    const selectEventByName = (eventName: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setEventLog(prev => [{ timestamp, action: 'selectEvent', detail: eventName }, ...prev].slice(0, 10));

      mockEvents.emit({
        type: 'custom',
        source: 'external-tour-control',
        timestamp: Date.now(),
        payload: { action: 'selectEvent', eventName },
      });
    };

    const fileTreeData = {
      allFiles: [
        {
          path: '.principal-views/api-flow.canvas',
          relativePath: '.principal-views/api-flow.canvas',
          name: 'api-flow.canvas',
          content: JSON.stringify(scenarioCanvas, null, 2),
        },
      ],
    };

    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: fileTreeData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a' }}>
        {/* Panel */}
        <div style={{ flex: 1 }}>
          <MockPanelProvider
            contextOverrides={{
              slices: mockSlices,
              getSlice: <T,>(name: string): DataSlice<T> | undefined => {
                return mockSlices.get(name) as DataSlice<T> | undefined;
              },
              hasSlice: (name: string) => mockSlices.has(name),
              isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
              repositoryPath: '/mock/repository',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any}
            actionsOverrides={{
              readFile: async (path: string) => {
                const fileName = path.split('/').pop() || '';
                const file = fileTreeData.allFiles.find((f) => f.path === fileName || f.name === fileName || f.path.endsWith(fileName));
                if (!file || !file.content) {
                  throw new Error(`File not found: ${path}`);
                }
                return file.content;
              },
              writeFile: async (path: string, content: string) => {
                console.log('[Mock] writeFile:', path, content.length, 'bytes');
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any}
            eventsOverride={mockEvents}
          >
            {(props) => (
              <CanvasEditorPanel
                {...props}
                canvasPath=".principal-views/api-flow.canvas"
                canvasName="API Request Flow"
                workflowTemplate={scenarioWorkflow}
              />
            )}
          </MockPanelProvider>
        </div>

        {/* Control Panel */}
        <div
          style={{
            width: 320,
            background: '#1a1a1a',
            padding: 20,
            color: '#fff',
            overflow: 'auto',
            borderLeft: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>
              Programmatic Scenario Control
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>
              Simulate external control of scenario selection (e.g., from a tour).
            </p>
          </div>

          {/* Scenario Selection - List Mode */}
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Select Scenario (List View)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scenarioWorkflow.scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => selectScenario(scenario.id, 'list')}
                  style={{
                    background: '#2a2a2a',
                    color: 'white',
                    border: '1px solid #444',
                    padding: '8px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{scenario.id}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{scenario.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Selection - Carousel Mode */}
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Select Scenario (Carousel View)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {scenarioWorkflow.scenarios.map((scenario) => (
                <button
                  key={`carousel-${scenario.id}`}
                  onClick={() => selectScenario(scenario.id, 'carousel')}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  {scenario.id}
                </button>
              ))}
            </div>
          </div>

          {/* Event Selection */}
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Select Event (requires scenario first)</div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
              Events from "full-flow" scenario:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Object.keys(scenarioWorkflow.scenarios.find(s => s.id === 'full-flow')?.template.events || {}).map((eventName, idx) => (
                <div key={eventName} style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => selectEventByIndex(idx)}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 10,
                      minWidth: 24,
                    }}
                    title={`Select by index ${idx}`}
                  >
                    {idx}
                  </button>
                  <button
                    onClick={() => selectEventByName(eventName)}
                    style={{
                      flex: 1,
                      background: '#2a2a2a',
                      color: 'white',
                      border: '1px solid #444',
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 10,
                      textAlign: 'left',
                    }}
                    title={`Select by name "${eventName}"`}
                  >
                    {eventName}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Event Log */}
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Event Log</div>
            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: 6,
                padding: 8,
                maxHeight: 200,
                overflow: 'auto',
                fontSize: 11,
                fontFamily: 'monospace',
              }}
            >
              {eventLog.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic' }}>No events yet...</div>
              ) : (
                eventLog.map((entry, i) => (
                  <div key={i} style={{ padding: '4px 0', borderBottom: i < eventLog.length - 1 ? '1px solid #222' : 'none' }}>
                    <span style={{ color: '#666' }}>{entry.timestamp}</span>{' '}
                    <span style={{ color: '#8b5cf6' }}>{entry.action}</span>{' '}
                    <span style={{ color: '#22c55e' }}>{entry.detail}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* API Reference */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>API Reference:</div>
              <code style={{ display: 'block', background: '#0a0a0a', padding: 8, borderRadius: 4, fontSize: 10, whiteSpace: 'pre-wrap' }}>
                {`// Select scenario
{ action: 'selectScenario',
  scenarioId: 'cache-hit',
  mode: 'list' | 'carousel' }

// Select event (by index or name)
{ action: 'selectEvent',
  eventIndex: 0 }
{ action: 'selectEvent',
  eventName: 'user.action' }`}
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**Programmatic Scenario & Event Control**

This story demonstrates how to control scenario and event selection programmatically from external sources like tours or navigation systems.

**Supported Actions:**
- \`selectScenario\` - Select a scenario by ID and display mode
- \`selectEvent\` - Select an event within the current scenario

**Display Modes (for selectScenario):**
- \`list\` (default) - Expanded list view with full event details
- \`carousel\` - Compact carousel for step-by-step navigation

**Usage:**
\`\`\`typescript
// Select a scenario first
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'selectScenario', scenarioId: 'full-flow', mode: 'list' }
});

// Then select an event by index or name
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'selectEvent', eventIndex: 2 }
});
// or
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'selectEvent', eventName: 'api.request' }
});
\`\`\`

See docs/PROGRAMMATIC_CONTROL.md for complete API documentation.
        `,
      },
    },
  },
};
