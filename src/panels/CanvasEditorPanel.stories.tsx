import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useRef } from 'react';
import { CanvasEditorPanel } from './CanvasEditorPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import { ConfigLoader } from './principal-view/ConfigLoader';
import type { DataSlice, PanelEvent } from '../types';
import { GraphRenderer, type GraphRendererHandle } from '@principal-ai/principal-view-react';
import type { ComponentLibrary, WorkflowTemplate, ExtendedCanvas } from '@principal-ai/principal-view-core';

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

// ============================================================================
// Spans Canvas Story - Shows how .spans.canvas renders span conventions
// ============================================================================

/**
 * Sample spans.canvas data showing span conventions with distinct colors
 * Each span convention defines a telemetry span pattern with its own color
 */
const spansCanvasData = {
  nodes: [
    {
      id: 'cli-command',
      type: 'text' as const,
      text: '# cli-command\n\nRoot span for CLI command execution',
      x: 100,
      y: 50,
      width: 280,
      height: 100,
      color: '#8B5CF6', // Purple - CLI operations
      pv: {
        nodeType: 'span-convention',
        shape: 'hexagon' as const,
      },
    },
    {
      id: 'validate',
      type: 'text' as const,
      text: '# validate\n\nSpan for validation operations',
      x: 50,
      y: 200,
      width: 240,
      height: 100,
      color: '#22C55E', // Green - validation success-oriented
      pv: {
        nodeType: 'span-convention',
        shape: 'hexagon' as const,
      },
    },
    {
      id: 'discover',
      type: 'text' as const,
      text: '# discover\n\nSpan for file/resource discovery',
      x: 320,
      y: 200,
      width: 240,
      height: 100,
      color: '#3B82F6', // Blue - discovery/exploration
      pv: {
        nodeType: 'span-convention',
        shape: 'hexagon' as const,
      },
    },
    {
      id: 'parse',
      type: 'text' as const,
      text: '# parse\n\nSpan for parsing files',
      x: 50,
      y: 350,
      width: 240,
      height: 100,
      color: '#F97316', // Orange - parsing/processing
      pv: {
        nodeType: 'span-convention',
        shape: 'hexagon' as const,
      },
    },
    {
      id: 'file',
      type: 'text' as const,
      text: '# file\n\nSpan for file I/O operations',
      x: 320,
      y: 350,
      width: 240,
      height: 100,
      color: '#6B7280', // Gray - low-level file ops
      pv: {
        nodeType: 'span-convention',
        shape: 'hexagon' as const,
      },
    },
  ],
  edges: [
    {
      id: 'edge-cli-validate',
      fromNode: 'cli-command',
      toNode: 'validate',
      fromSide: 'bottom',
      toSide: 'top',
      label: 'child',
      pv: { edgeType: 'provides' },
    },
    {
      id: 'edge-cli-discover',
      fromNode: 'cli-command',
      toNode: 'discover',
      fromSide: 'bottom',
      toSide: 'top',
      label: 'child',
      pv: { edgeType: 'provides' },
    },
    {
      id: 'edge-validate-parse',
      fromNode: 'validate',
      toNode: 'parse',
      fromSide: 'bottom',
      toSide: 'top',
      label: 'child',
      pv: { edgeType: 'provides' },
    },
    {
      id: 'edge-discover-file',
      fromNode: 'discover',
      toNode: 'file',
      fromSide: 'bottom',
      toSide: 'top',
      label: 'child',
      pv: { edgeType: 'provides' },
    },
  ],
  pv: {
    name: 'CLI Span Conventions',
    version: '1.0.0',
    description: 'Defines span hierarchy patterns for CLI operations',
  },
};

/**
 * Library with span-convention nodeType defined
 */
const spansLibrary: ComponentLibrary = {
  version: '1.0.0',
  name: 'Spans Library',
  description: 'Library for rendering span conventions',
  resources: {},
  nodeComponents: {
    'span-convention': {
      description: 'Span convention defining a telemetry span pattern',
      shape: 'hexagon',
      color: '#06b6d4', // Default cyan, overridden by node.color
      icon: 'Activity',
    },
  },
  edgeComponents: {
    provides: {
      description: 'Parent span provides child span',
      style: 'solid',
      color: '#84cc16',
      directed: true,
    },
  },
};

/**
 * Spans Canvas Story - Shows how .spans.canvas files render
 * Span conventions define telemetry span patterns with unique colors per span type
 */
const SpansCanvasTemplate = () => {
  const graphRef = useRef<GraphRendererHandle>(null);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #ddd' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Spans Canvas (.spans.canvas)</div>
        <div style={{ fontSize: 12, color: '#666' }}>
          Span convention files define telemetry span patterns. Each span has its own color
          which is used as the fill color for events within that span context.
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>
          <strong>Color Legend:</strong>{' '}
          <span style={{ color: '#8B5CF6' }}>●</span> CLI{' '}
          <span style={{ color: '#22C55E' }}>●</span> Validate{' '}
          <span style={{ color: '#3B82F6' }}>●</span> Discover{' '}
          <span style={{ color: '#F97316' }}>●</span> Parse{' '}
          <span style={{ color: '#6B7280' }}>●</span> File
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <GraphRenderer
          ref={graphRef}
          canvas={spansCanvasData}
          library={spansLibrary}
          width={700}
          height={500}
        />
      </div>
    </div>
  );
};

export const SpansCanvas: Story = {
  args: {} as never,
  render: () => <SpansCanvasTemplate />,
  parameters: {
    docs: {
      description: {
        story: `
**Spans Canvas (.spans.canvas)**

This story demonstrates how \`.spans.canvas\` files render span conventions.

**What is a Spans Canvas?**
- Defines telemetry span patterns (OpenTelemetry spans)
- Each node represents a span convention with a unique color
- Colors from spans.canvas become the FILL color for events in that span context
- Uses hexagon shapes to visually distinguish from event nodes

**Node Structure:**
\`\`\`json
{
  "id": "validate",
  "type": "text",
  "text": "# validate\\n\\nSpan for validation operations",
  "color": "#22C55E",  // Required - becomes event fill color
  "pv": {
    "nodeType": "span-convention",
    "shape": "hexagon"
  }
}
\`\`\`

**Color Contract:**
- Span colors are REQUIRED in .spans.canvas files
- These colors are used as the FILL color for events rendered within that span context
- See the ScopeSpanColorContract story for how scope and span colors work together
        `,
      },
    },
  },
};

// ============================================================================
// Scope/Span Color Contract Story - Shows how scopeColor and spanColor work
// ============================================================================

/**
 * Sample OTEL events canvas - events don't need colors (derived at render time)
 */
const otelEventsCanvas = {
  nodes: [
    {
      id: 'command-start',
      type: 'text' as const,
      text: 'command.start',
      x: 100,
      y: 50,
      width: 180,
      height: 60,
      // No color - will be derived from span context
      pv: {
        nodeType: 'event',
        shape: 'rectangle' as const,
        event: { name: 'command.start' },
      },
    },
    {
      id: 'validate-begin',
      type: 'text' as const,
      text: 'validate.begin',
      x: 50,
      y: 150,
      width: 160,
      height: 60,
      pv: {
        nodeType: 'event',
        shape: 'rectangle' as const,
        event: { name: 'validate.begin' },
      },
    },
    {
      id: 'validate-complete',
      type: 'text' as const,
      text: 'validate.complete',
      x: 50,
      y: 250,
      width: 160,
      height: 60,
      pv: {
        nodeType: 'event',
        shape: 'rectangle' as const,
        event: { name: 'validate.complete' },
      },
    },
    {
      id: 'discover-files',
      type: 'text' as const,
      text: 'discover.files',
      x: 250,
      y: 150,
      width: 160,
      height: 60,
      pv: {
        nodeType: 'event',
        shape: 'rectangle' as const,
        event: { name: 'discover.files' },
      },
    },
    {
      id: 'command-end',
      type: 'text' as const,
      text: 'command.end',
      x: 100,
      y: 350,
      width: 180,
      height: 60,
      pv: {
        nodeType: 'event',
        shape: 'rectangle' as const,
        event: { name: 'command.end' },
      },
    },
  ],
  edges: [
    { id: 'e1', fromNode: 'command-start', toNode: 'validate-begin', pv: { edgeType: 'triggers' } },
    { id: 'e2', fromNode: 'command-start', toNode: 'discover-files', pv: { edgeType: 'triggers' } },
    { id: 'e3', fromNode: 'validate-begin', toNode: 'validate-complete', pv: { edgeType: 'triggers' } },
    { id: 'e4', fromNode: 'validate-complete', toNode: 'command-end', pv: { edgeType: 'triggers' } },
    { id: 'e5', fromNode: 'discover-files', toNode: 'command-end', pv: { edgeType: 'triggers' } },
  ],
  pv: {
    name: 'CLI Events',
    version: '1.0.0',
    description: 'OTEL events for CLI command execution',
  },
};

/**
 * Library with owned-scopes defining scope colors (for borders)
 */
const scopeColorLibrary: ComponentLibrary = {
  version: '1.0.0',
  name: 'Scope Color Library',
  description: 'Library demonstrating scope and span colors',
  resources: {},
  nodeComponents: {
    event: {
      description: 'OTEL event node',
      shape: 'rectangle',
      color: '#888888', // Default gray, overridden by span color
    },
  },
  edgeComponents: {
    triggers: {
      description: 'Event triggers another event',
      style: 'solid',
      color: '#64748b',
      directed: true,
    },
  },
  // Scope colors become BORDER colors
  'owned-scopes': {
    'cli-package': {
      color: '#EF4444', // Red border
      description: 'CLI package scope',
    },
    'core-package': {
      color: '#3B82F6', // Blue border
      description: 'Core library scope',
    },
    'react-package': {
      color: '#10B981', // Green border
      description: 'React package scope',
    },
  },
};

/**
 * Scope/Span Color Contract Story
 * Demonstrates how scopeColor (border) and spanColor (fill) work together
 */
const ScopeSpanColorContractTemplate = () => {
  const graphRef = useRef<GraphRendererHandle>(null);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #ddd' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Scope/Span Color Contract</div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          Event nodes can have two color sources: scope (border) and span (fill).
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 11 }}>
          <div>
            <strong>Scope → Border:</strong>
            <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
              <span><span style={{ color: '#EF4444' }}>■</span> cli-package</span>
              <span><span style={{ color: '#3B82F6' }}>■</span> core-package</span>
              <span><span style={{ color: '#10B981' }}>■</span> react-package</span>
            </div>
          </div>
          <div>
            <strong>Span → Fill:</strong>
            <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
              <span><span style={{ color: '#8B5CF6' }}>●</span> cli-command</span>
              <span><span style={{ color: '#22C55E' }}>●</span> validate</span>
              <span><span style={{ color: '#3B82F6' }}>●</span> discover</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        {/* With span color (validate span) */}
        <div style={{ flex: 1, borderRight: '1px solid #ddd', position: 'relative' }}>
          <div style={{ padding: '8px', background: '#f0fdf4', fontSize: 11, textAlign: 'center' }}>
            Span: <strong>validate</strong> (Green Fill) + Scope: <strong>cli-package</strong> (Red Border)
          </div>
          <GraphRenderer
            ref={graphRef}
            canvas={otelEventsCanvas}
            library={scopeColorLibrary}
            spansCanvas={spansCanvasData}
            workflowSpanPattern="validate"
            width={450}
            height={400}
          />
        </div>
        {/* With different span color (discover span) */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ padding: '8px', background: '#eff6ff', fontSize: 11, textAlign: 'center' }}>
            Span: <strong>discover</strong> (Blue Fill) + Scope: <strong>core-package</strong> (Blue Border)
          </div>
          <GraphRenderer
            canvas={otelEventsCanvas}
            library={{
              ...scopeColorLibrary,
              // Override to show different scope
              'owned-scopes': {
                'core-package': {
                  color: '#3B82F6',
                  description: 'Core library scope',
                },
              },
            }}
            spansCanvas={spansCanvasData}
            workflowSpanPattern="discover"
            width={450}
            height={400}
          />
        </div>
      </div>
    </div>
  );
};

export const ScopeSpanColorContract: Story = {
  args: {} as never,
  render: () => <ScopeSpanColorContractTemplate />,
  parameters: {
    docs: {
      description: {
        story: `
**Scope/Span Color Contract**

This story demonstrates the color contract for event nodes:

**Color Sources:**
1. **Scope Color → Border** (from library.yaml \`owned-scopes\`)
   - Represents which package/module owns the event
   - Applied as the node's stroke/border color

2. **Span Color → Fill** (from .spans.canvas via workflow context)
   - Represents which telemetry span the event belongs to
   - Applied as the node's fill/background color

**How It Works:**
1. \`.otel.canvas\` event nodes do NOT require colors
2. At render time, \`GraphRenderer\` receives:
   - \`spansCanvas\` - the .spans.canvas file with span colors
   - \`workflowSpanPattern\` - which span context to use
3. The renderer builds a color map and injects \`spanColor\` into each node
4. \`scopeColor\` comes from the library's \`owned-scopes\` based on file location

**Benefits:**
- Events can be recolored dynamically based on workflow context
- Same event can appear in different colors when viewed in different span contexts
- Clear visual distinction between ownership (border) and behavior (fill)

**Props:**
\`\`\`tsx
<GraphRenderer
  canvas={otelEventsCanvas}
  library={library}
  spansCanvas={spansCanvasData}      // .spans.canvas with colors
  workflowSpanPattern="validate"      // Which span context
/>
\`\`\`
        `,
      },
    },
  },
};

/**
 * Canvas with new OTEL node format (type: "otel-event" with top-level fields)
 * This tests the migrated node format where:
 * - type is "otel-event" (not "text")
 * - label is at top level (not extracted from text)
 * - event is at top level (not in pv.event)
 */
const newOtelFormatCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'user-login',
      type: 'otel-event',
      x: 100,
      y: 100,
      width: 200,
      height: 80,
      color: '#6366f1',
      label: 'User Login',
      event: {
        name: 'auth.user.login',
        attributes: {
          'user.id': 'string',
          'auth.method': 'string',
        },
      },
      otel: {
        status: 'implemented',
      },
    },
    {
      id: 'session-created',
      type: 'otel-event',
      x: 350,
      y: 100,
      width: 200,
      height: 80,
      color: '#10b981',
      label: 'Session Created',
      event: {
        name: 'auth.session.created',
        attributes: {
          'session.id': 'string',
          'session.ttl': 'number',
        },
      },
      otel: {
        status: 'approved',
      },
    },
    {
      id: 'token-issued',
      type: 'otel-event',
      x: 600,
      y: 100,
      width: 200,
      height: 80,
      color: '#f59e0b',
      label: 'Token Issued',
      event: {
        name: 'auth.token.issued',
        attributes: {
          'token.type': 'string',
          'token.expires_at': 'string',
        },
      },
      otel: {
        status: 'draft',
      },
    },
  ],
  edges: [
    {
      id: 'login-to-session',
      fromNode: 'user-login',
      toNode: 'session-created',
      fromSide: 'right',
      toSide: 'left',
    },
    {
      id: 'session-to-token',
      fromNode: 'session-created',
      toNode: 'token-issued',
      fromSide: 'right',
      toSide: 'left',
    },
  ],
  pv: {
    name: 'Auth Flow - New OTEL Format',
    version: '1.0.0',
    description: 'Tests the new OTEL node format with top-level label and event fields',
  },
} as ExtendedCanvas;

const NewOtelFormatTemplate = () => {
  const graphRef = useRef<GraphRendererHandle>(null);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #ddd' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>New OTEL Node Format Test</div>
        <div style={{ fontSize: 12, color: '#666' }}>
          Tests nodes with <code>type: "otel-event"</code> and top-level <code>label</code> and <code>event</code> fields.
          <br />
          Nodes should show: <strong>Label</strong> (e.g., "User Login") with <strong>event.name</strong> below (e.g., "auth.user.login")
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <GraphRenderer
          ref={graphRef}
          canvas={newOtelFormatCanvas}
          editable={false}
        />
      </div>
    </div>
  );
};

/**
 * Tests the new OTEL node format after migration.
 * Nodes should display their label (not ID) and show event.name underneath.
 */
export const NewOtelFormat: Story = {
  args: {} as never,
  render: () => <NewOtelFormatTemplate />,
  parameters: {
    docs: {
      description: {
        story: `
**New OTEL Node Format**

This story tests the migrated OTEL node format where nodes use semantic types:

**Old Format (Legacy):**
\`\`\`json
{
  "id": "user-login",
  "type": "text",
  "text": "# User Login",
  "pv": {
    "nodeType": "event",
    "event": { "name": "auth.user.login" }
  }
}
\`\`\`

**New Format (Migrated):**
\`\`\`json
{
  "id": "user-login",
  "type": "otel-event",
  "label": "User Login",
  "event": { "name": "auth.user.login" }
}
\`\`\`

**Expected Behavior:**
- Node displays "User Login" (the label), NOT "user-login" (the id)
- Below the label, shows "auth.user.login" (the event.name) in smaller text
- Status badges show based on otel.status (draft/approved/implemented)
        `,
      },
    },
  },
};
