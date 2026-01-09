import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ExecutionViewerPanel } from './ExecutionViewerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { DataSlice } from '../types';

/**
 * ExecutionViewerPanel Component
 *
 * Visualizes execution artifacts (test runs) overlaid on canvas diagrams.
 * It discovers execution artifact files from __executions__/ directories.
 *
 * Features:
 * - Auto-discovery of execution artifacts from __executions__/ directories
 * - Automatic linking to matching canvas files
 * - Event playback with timeline controls
 * - Side-by-side canvas and event visualization
 * - Package badges for monorepo support
 * - Metadata display (spans, events, framework, status)
 */
const meta = {
  title: 'Panels/ExecutionViewerPanel',
  component: ExecutionViewerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visualizes execution artifacts captured from test runs and overlays them on canvas diagrams. Reads execution files from __executions__/*.spans.json directories.',
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
} satisfies Meta<typeof ExecutionViewerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Mock Data
// ============================================================================

// Mock canvas for graph-converter-execution
const mockGraphConverterCanvas = {
  nodes: [
    {
      id: 'graph-converter',
      type: 'text',
      text: '# Graph Converter\n\nConverts configuration to graph nodes and edges',
      x: 0,
      y: 0,
      width: 300,
      height: 120,
      pv: {
        nodeType: 'converter',
        name: 'Graph Converter',
        description: 'Converts configuration to graph nodes and edges',
        shape: 'rectangle',
        fill: '#3b82f6',
      },
    },
    {
      id: 'validation',
      type: 'text',
      text: '# Validation\n\nValidates configuration structure',
      x: -250,
      y: 200,
      width: 250,
      height: 100,
      pv: {
        nodeType: 'validator',
        name: 'Configuration Validator',
        shape: 'hexagon',
        fill: '#10b981',
      },
    },
    {
      id: 'graph-output',
      type: 'text',
      text: '# Graph Output\n\nResulting graph structure',
      x: 100,
      y: 200,
      width: 250,
      height: 100,
      pv: {
        nodeType: 'output',
        name: 'Graph Output',
        shape: 'rectangle',
        fill: '#8b5cf6',
      },
    },
  ],
  edges: [
    {
      id: 'validate-before-convert',
      fromNode: 'validation',
      toNode: 'graph-converter',
      fromSide: 'right',
      toSide: 'left',
      label: 'validated config',
      pv: { edgeType: 'data-flow', style: 'solid' },
    },
    {
      id: 'convert-to-output',
      fromNode: 'graph-converter',
      toNode: 'graph-output',
      fromSide: 'right',
      toSide: 'left',
      label: 'graph data',
      pv: { edgeType: 'data-flow', style: 'solid' },
    },
  ],
  pv: {
    version: '1.0.0',
    name: 'Graph Converter Execution',
    description: 'Execution flow for graph conversion',
  },
};

// Mock execution artifact
const mockExecutionArtifact = {
  metadata: {
    canvasName: 'Graph Converter Execution',
    exportedAt: new Date().toISOString(),
    source: 'test:event-validation',
    framework: 'bun',
    status: 'success' as const,
  },
  spans: [
    {
      id: 'span-1',
      name: 'graph conversion with validation',
      startTime: Date.now(),
      endTime: Date.now() + 1000,
      duration: 1000,
      status: 'OK',
      attributes: {
        'span.kind': 'test.case',
        'test.name': 'graph conversion with validation',
        'test.framework': 'bun',
      },
      events: [
        {
          time: Date.now(),
          name: 'conversion.started',
          attributes: {
            'code.filepath': 'GraphConverter.ts',
            'code.lineno': 15,
            'config.nodeTypes': 2,
            'config.edgeTypes': 1,
          },
        },
        {
          time: Date.now() + 200,
          name: 'conversion.processingNodes',
          attributes: {
            'code.filepath': 'GraphConverter.ts',
            'code.lineno': 28,
            'nodes.count': 2,
          },
        },
        {
          time: Date.now() + 400,
          name: 'conversion.processingEdges',
          attributes: {
            'code.filepath': 'GraphConverter.ts',
            'code.lineno': 45,
            'edges.count': 1,
          },
        },
        {
          time: Date.now() + 600,
          name: 'conversion.complete',
          attributes: {
            'code.filepath': 'GraphConverter.ts',
            'code.lineno': 60,
            'result.nodes.count': 2,
            'result.edges.count': 1,
            'duration.ms': 5,
          },
        },
      ],
    },
  ],
};

// Helper to create mock provider setup
const createMockProvider = (files: Array<{ path: string; relativePath: string; name: string; content: string }>) => {
  const fileTreeData = { allFiles: files };
  const mockSlices = new Map<string, DataSlice>();
  mockSlices.set('fileTree', {
    scope: 'repository',
    name: 'fileTree',
    data: fileTreeData,
    loading: false,
    error: null,
    refresh: async () => {},
  });

  return {
    contextOverrides: {
      slices: mockSlices,
      getSlice: <T,>(name: string): DataSlice<T> | undefined => mockSlices.get(name) as DataSlice<T> | undefined,
      hasSlice: (name: string) => mockSlices.has(name),
      isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
      repositoryPath: '/mock/repository',
    } as any,
    actionsOverrides: {
      readFile: async (path: string) => {
        const file = fileTreeData.allFiles.find((f) => path.endsWith(f.path) || path.endsWith(f.name));
        if (!file || !file.content) {
          throw new Error(`File not found: ${path}`);
        }
        return file.content;
      },
    } as any,
  };
};

// ============================================================================
// Stories
// ============================================================================

/**
 * Basic execution viewer with single execution artifact
 */
export const SingleExecution: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/__executions__/graph-converter-execution.spans.json',
        relativePath: '.principal-views/__executions__/graph-converter-execution.spans.json',
        name: 'graph-converter-execution.spans.json',
        content: JSON.stringify(mockExecutionArtifact),
      },
      {
        path: '.principal-views/graph-converter-execution.otel.canvas',
        relativePath: '.principal-views/graph-converter-execution.otel.canvas',
        name: 'graph-converter-execution.otel.canvas',
        content: JSON.stringify(mockGraphConverterCanvas),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => <ExecutionViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Multiple execution artifacts from different packages
 */
export const MultipleExecutions: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/__executions__/graph-converter-execution.spans.json',
        relativePath: '.principal-views/__executions__/graph-converter-execution.spans.json',
        name: 'graph-converter-execution.spans.json',
        content: JSON.stringify(mockExecutionArtifact),
      },
      {
        path: '.principal-views/graph-converter-execution.otel.canvas',
        relativePath: '.principal-views/graph-converter-execution.otel.canvas',
        name: 'graph-converter-execution.otel.canvas',
        content: JSON.stringify(mockGraphConverterCanvas),
      },
      {
        path: 'packages/core/__executions__/api-tests.spans.json',
        relativePath: 'packages/core/__executions__/api-tests.spans.json',
        name: 'api-tests.spans.json',
        content: JSON.stringify({ ...mockExecutionArtifact, metadata: { ...mockExecutionArtifact.metadata, canvasName: 'API Tests', source: 'test:api' } }),
      },
      {
        path: 'packages/db/__executions__/db-tests.spans.json',
        relativePath: 'packages/db/__executions__/db-tests.spans.json',
        name: 'db-tests.spans.json',
        content: JSON.stringify({ ...mockExecutionArtifact, metadata: { ...mockExecutionArtifact.metadata, canvasName: 'DB Tests', source: 'test:db' } }),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => <ExecutionViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Execution with error status
 */
export const ExecutionWithError: Story = {
  args: {} as never,
  render: () => {
    const errorArtifact = {
      metadata: {
        canvasName: 'Failed Test Execution',
        exportedAt: new Date().toISOString(),
        source: 'test:integration',
        framework: 'bun',
        status: 'error' as const,
      },
      spans: [
        {
          id: 'span-1',
          name: 'integration test with error',
          startTime: Date.now(),
          endTime: Date.now() + 1000,
          duration: 1000,
          status: 'ERROR',
          attributes: { 'span.kind': 'test.case', 'error.message': 'Connection timeout' },
          events: [
            { time: Date.now(), name: 'test.started', attributes: { 'test.name': 'integration test' } },
            { time: Date.now() + 500, name: 'test.error', attributes: { 'error.message': 'Connection timeout', 'error.code': 'ETIMEDOUT' } },
          ],
        },
      ],
    };

    const mock = createMockProvider([
      {
        path: '__executions__/failed-test.spans.json',
        relativePath: '__executions__/failed-test.spans.json',
        name: 'failed-test.spans.json',
        content: JSON.stringify(errorArtifact),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => <ExecutionViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * No execution artifacts found
 */
export const NoExecutions: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/some-canvas.otel.canvas',
        relativePath: '.principal-views/some-canvas.otel.canvas',
        name: 'some-canvas.otel.canvas',
        content: JSON.stringify(mockGraphConverterCanvas),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => <ExecutionViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Execution without matching canvas
 */
export const ExecutionWithoutCanvas: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '__executions__/orphan-execution.spans.json',
        relativePath: '__executions__/orphan-execution.spans.json',
        name: 'orphan-execution.spans.json',
        content: JSON.stringify(mockExecutionArtifact),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => <ExecutionViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Legacy format (direct array without metadata)
 */
export const LegacyFormat: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/__executions__/graph-converter-execution.spans.json',
        relativePath: '.principal-views/__executions__/graph-converter-execution.spans.json',
        name: 'graph-converter-execution.spans.json',
        content: JSON.stringify(mockExecutionArtifact.spans), // Direct array
      },
      {
        path: '.principal-views/graph-converter-execution.otel.canvas',
        relativePath: '.principal-views/graph-converter-execution.otel.canvas',
        name: 'graph-converter-execution.otel.canvas',
        content: JSON.stringify(mockGraphConverterCanvas),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => <ExecutionViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};
