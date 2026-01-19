import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useRef } from 'react';
import { CanvasEditorPanel } from './CanvasEditorPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import { ConfigLoader } from './principal-view/ConfigLoader';
import type { DataSlice } from '../types';
import { GraphRenderer, type GraphRendererHandle } from '@principal-ai/principal-view-react';

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
        {(props) => <CanvasEditorPanel {...props} selectedConfigId={firstCanvas?.id} canvasPath={firstCanvas?.path} canvasName={firstCanvas?.name} />}
      </MockPanelProvider>
    );
  },
};
