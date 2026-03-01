import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useRef } from 'react';
import { CanvasEditorPanel } from './CanvasEditorPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import { ConfigLoader } from './principal-view/ConfigLoader';
import type { DataSlice } from '../types';
import { GraphRenderer, type GraphRendererHandle } from '@principal-ai/principal-view-react';
import type { ComponentLibrary } from '@principal-ai/principal-view-core';

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
