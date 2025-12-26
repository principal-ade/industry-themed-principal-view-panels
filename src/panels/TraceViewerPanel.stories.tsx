import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TraceViewerPanel } from './TraceViewerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { DataSlice } from '../types';

/**
 * TraceViewerPanel displays OpenTelemetry traces captured from test runs.
 * It discovers trace canvas files from __traces__/ directories.
 */
const meta = {
  title: 'Panels/TraceViewerPanel',
  component: TraceViewerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visualizes OpenTelemetry traces captured from test runs as canvas diagrams. Reads trace files from __traces__/*.canvas.json directories.',
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
} satisfies Meta<typeof TraceViewerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample trace canvas data (similar to what's generated from tests)
const sampleTraceCanvas = {
  nodes: [
    {
      id: 'service-api-tests',
      type: 'group',
      x: -20,
      y: -50,
      width: 740,
      height: 130,
      label: 'api-tests',
      pv: {
        nodeType: 'service',
        name: 'api-tests',
        icon: 'server',
      },
    },
    {
      id: 'span-1',
      type: 'text',
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      text: 'test:user-auth',
      pv: {
        nodeType: 'span',
        name: 'test:user-auth',
        description: '45.2ms',
        shape: 'circle',
        fill: '#6b7280',
        states: { OK: { color: '#22c55e', label: 'OK' } },
        otel: { kind: 'instance', category: 'span' },
      },
    },
    {
      id: 'span-2',
      type: 'text',
      x: 250,
      y: 0,
      width: 200,
      height: 60,
      text: 'db:query-users',
      pv: {
        nodeType: 'span',
        name: 'db:query-users',
        description: '12.1ms',
        shape: 'diamond',
        fill: '#0891b2',
        states: { OK: { color: '#22c55e', label: 'OK' } },
        otel: { kind: 'instance', category: 'span' },
      },
    },
    {
      id: 'span-3',
      type: 'text',
      x: 500,
      y: 0,
      width: 200,
      height: 60,
      text: 'cache:check',
      pv: {
        nodeType: 'span',
        name: 'cache:check',
        description: '2.3ms',
        shape: 'circle',
        fill: '#6b7280',
        states: { OK: { color: '#22c55e', label: 'OK' } },
        otel: { kind: 'instance', category: 'span' },
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      fromNode: 'span-1',
      toNode: 'span-2',
      fromSide: 'right',
      toSide: 'left',
      toEnd: 'arrow',
      pv: { edgeType: 'span-child', style: 'solid' },
    },
    {
      id: 'edge-2',
      fromNode: 'span-2',
      toNode: 'span-3',
      fromSide: 'right',
      toSide: 'left',
      toEnd: 'arrow',
      pv: { edgeType: 'span-child', style: 'solid' },
    },
  ],
  pv: {
    version: '1.0.0',
    name: 'Trace: api-tests',
    description: 'Exported at 2025-12-26T01:11:11.110Z',
    nodeTypes: {
      span: { description: 'OpenTelemetry span', shape: 'rectangle' },
      service: { description: 'Service grouping', icon: 'server', shape: 'rectangle' },
    },
    edgeTypes: {
      'span-child': { label: 'Child span', directed: true },
    },
    display: { layout: 'manual', animations: { enabled: true, speed: 1 } },
  },
};

// Second sample trace for multi-trace scenario
const secondTraceCanvas = {
  nodes: [
    {
      id: 'service-db-tests',
      type: 'group',
      x: -20,
      y: -50,
      width: 490,
      height: 130,
      label: 'db-tests',
      pv: { nodeType: 'service', name: 'db-tests', icon: 'database' },
    },
    {
      id: 'span-db-1',
      type: 'text',
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      text: 'test:connection',
      pv: {
        nodeType: 'span',
        name: 'test:connection',
        description: '123.4ms',
        shape: 'hexagon',
        fill: '#4f46e5',
        states: { OK: { color: '#22c55e', label: 'OK' } },
        otel: { kind: 'instance', category: 'span' },
      },
    },
    {
      id: 'span-db-2',
      type: 'text',
      x: 250,
      y: 0,
      width: 200,
      height: 60,
      text: 'test:migration',
      pv: {
        nodeType: 'span',
        name: 'test:migration',
        description: '567.8ms',
        shape: 'hexagon',
        fill: '#4f46e5',
        states: { OK: { color: '#22c55e', label: 'OK' } },
        otel: { kind: 'instance', category: 'span' },
      },
    },
  ],
  edges: [],
  pv: {
    version: '1.0.0',
    name: 'Trace: db-tests',
    description: 'Exported at 2025-12-26T02:22:22.222Z',
    nodeTypes: {
      span: { description: 'OpenTelemetry span', shape: 'rectangle' },
      service: { description: 'Service grouping', icon: 'database', shape: 'rectangle' },
    },
    edgeTypes: { 'span-child': { label: 'Child span', directed: true } },
  },
};

// Error trace example
const errorTraceCanvas = {
  nodes: [
    {
      id: 'span-err-1',
      type: 'text',
      x: 0,
      y: 0,
      width: 200,
      height: 60,
      text: 'processOrder()',
      color: 1,
      pv: {
        nodeType: 'span',
        name: 'processOrder()',
        description: '234ms',
        shape: 'circle',
        fill: '#ef4444',
        states: { ERROR: { color: '#ef4444', label: 'ERROR' } },
        otel: { kind: 'instance', category: 'span' },
      },
    },
    {
      id: 'span-err-2',
      type: 'text',
      x: 0,
      y: 100,
      width: 200,
      height: 60,
      text: 'validatePayment()',
      color: 1,
      pv: {
        nodeType: 'span',
        name: 'validatePayment()',
        description: '89ms',
        shape: 'diamond',
        fill: '#ef4444',
        states: { ERROR: { color: '#ef4444', label: 'ERROR' } },
        otel: { kind: 'instance', category: 'span' },
      },
    },
  ],
  edges: [
    {
      id: 'edge-err-1',
      fromNode: 'span-err-1',
      toNode: 'span-err-2',
      fromSide: 'bottom',
      toSide: 'top',
      toEnd: 'arrow',
      color: 1,
      pv: { edgeType: 'span-child', style: 'solid' },
    },
  ],
  pv: {
    version: '1.0.0',
    name: 'Trace: payment-error',
    description: 'Exported at 2025-12-26T03:33:33.333Z',
    nodeTypes: { span: { description: 'OpenTelemetry span', shape: 'rectangle' } },
    edgeTypes: { 'span-child': { label: 'Child span', directed: true } },
  },
};

/**
 * Single trace - basic display with one trace file
 */
export const SingleTrace: Story = {
  args: {} as never,
  render: () => {
    const fileTreeData = {
      allFiles: [
        {
          path: 'packages/core/__traces__/test-run.canvas.json',
          relativePath: 'packages/core/__traces__/test-run.canvas.json',
          name: 'test-run.canvas.json',
          content: JSON.stringify(sampleTraceCanvas, null, 2),
        },
        { path: 'src/index.ts', relativePath: 'src/index.ts', name: 'index.ts' },
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
            const file = fileTreeData.allFiles.find(
              (f) => path.endsWith(f.path) || path.endsWith(f.name)
            );
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return file.content;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <TraceViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Multiple traces - shows the trace selector dropdown
 */
export const MultipleTraces: Story = {
  args: {} as never,
  render: () => {
    const fileTreeData = {
      allFiles: [
        {
          path: 'packages/core/__traces__/api-tests.canvas.json',
          relativePath: 'packages/core/__traces__/api-tests.canvas.json',
          name: 'api-tests.canvas.json',
          content: JSON.stringify(sampleTraceCanvas, null, 2),
        },
        {
          path: 'packages/db/__traces__/db-tests.canvas.json',
          relativePath: 'packages/db/__traces__/db-tests.canvas.json',
          name: 'db-tests.canvas.json',
          content: JSON.stringify(secondTraceCanvas, null, 2),
        },
        {
          path: '__traces__/error-trace.canvas.json',
          relativePath: '__traces__/error-trace.canvas.json',
          name: 'error-trace.canvas.json',
          content: JSON.stringify(errorTraceCanvas, null, 2),
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
            const file = fileTreeData.allFiles.find(
              (f) => path.endsWith(f.path) || path.endsWith(f.name)
            );
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return file.content;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <TraceViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Error trace - shows spans with ERROR status
 */
export const ErrorTrace: Story = {
  args: {} as never,
  render: () => {
    const fileTreeData = {
      allFiles: [
        {
          path: '__traces__/payment-error.canvas.json',
          relativePath: '__traces__/payment-error.canvas.json',
          name: 'payment-error.canvas.json',
          content: JSON.stringify(errorTraceCanvas, null, 2),
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
            const file = fileTreeData.allFiles.find(
              (f) => path.endsWith(f.path) || path.endsWith(f.name)
            );
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return file.content;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <TraceViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Loading state - file tree is being loaded
 */
export const Loading: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: null,
      loading: true,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
        }}
      >
        {(props) => <TraceViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Empty state - no trace files found
 */
export const EmptyState: Story = {
  args: {} as never,
  render: () => {
    const fileTreeData = {
      allFiles: [
        { path: 'src/index.ts', relativePath: 'src/index.ts', name: 'index.ts' },
        { path: 'README.md', relativePath: 'README.md', name: 'README.md' },
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
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
        }}
      >
        {(props) => <TraceViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Error state - failed to load trace
 */
export const ErrorState: Story = {
  args: {} as never,
  render: () => {
    const fileTreeData = {
      allFiles: [
        {
          path: '__traces__/broken.canvas.json',
          relativePath: '__traces__/broken.canvas.json',
          name: 'broken.canvas.json',
          content: '{ invalid json content',
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
            const file = fileTreeData.allFiles.find(
              (f) => path.endsWith(f.path) || path.endsWith(f.name)
            );
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return file.content;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <TraceViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Traces from .principal-views/__traces__/ location
 */
export const PrincipalViewsLocation: Story = {
  args: {} as never,
  render: () => {
    const fileTreeData = {
      allFiles: [
        {
          path: '.principal-views/__traces__/integration-tests.canvas.json',
          relativePath: '.principal-views/__traces__/integration-tests.canvas.json',
          name: 'integration-tests.canvas.json',
          content: JSON.stringify(sampleTraceCanvas, null, 2),
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
            const file = fileTreeData.allFiles.find(
              (f) => path.endsWith(f.path) || path.endsWith(f.name)
            );
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return file.content;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <TraceViewerPanel {...props} />}
      </MockPanelProvider>
    );
  },
};
