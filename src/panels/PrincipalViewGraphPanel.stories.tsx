import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PrincipalViewGraphPanel } from './PrincipalViewGraphPanel';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import { createMockFileTree } from '../mocks/vvfConfigs';
import type { DataSlice } from '../types';
import { EditableConfigurablePanelLayout, type PanelLayout } from '@principal-ade/panel-layouts';

/**
 * PrincipalViewGraphPanel visualizes .canvas files as interactive graphs.
 * It demonstrates graph rendering with ReactFlow and ExtendedCanvas format.
 */
const meta = {
  title: 'Panels/PrincipalViewGraphPanel',
  component: PrincipalViewGraphPanel,
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
} satisfies Meta<typeof PrincipalViewGraphPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with simple configuration
 * Shows a basic 3-node graph with API, database, and logger components
 */
export const SimpleConfiguration: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = createMockFileTree('simple');
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
            const fileName = path.split('/').pop() || '';
            const file = fileTreeData.allFiles.find((f) => f.path === fileName || f.name === fileName);
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return file.content;
          },
          writeFile: async (path: string, content: string) => {
            // Update mock file tree with new content
            const fileName = path.split('/').pop() || '';
            const file = fileTreeData.allFiles.find((f) => f.path.endsWith(fileName) || f.name === fileName);
            if (file) {
              file.content = content;
              console.log('[Storybook Mock] Saved file:', path);
              console.log('[Storybook Mock] Content:', JSON.parse(content));
            } else {
              console.log('[Storybook Mock] Would save to:', path);
              console.log('[Storybook Mock] Content:', JSON.parse(content));
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Complex configuration with multiple components and states
 * Shows the Repository Traffic Controller with lock manager, GitHub API, and database
 */
export const ComplexConfiguration: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = createMockFileTree('complex');
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
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Control Tower configuration with manual layout
 * Shows client-server architecture with explicit node positions
 */
export const ControlTowerConfiguration: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = createMockFileTree('control-tower');
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
        {(props) => <PrincipalViewGraphPanel {...props} />}
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
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Empty state - no configuration file found in project
 * Shows educational content and copyable template to get started
 */
export const EmptyState: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: createMockFileTree('none'),
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
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Invalid JSON configuration
 */
export const InvalidJSON: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = {
      allFiles: [
        {
          path: '.principal-views/invalid.canvas',
          relativePath: '.principal-views/invalid.canvas',
          name: 'invalid.canvas',
          content: '{ invalid json content',
        },
        { path: 'src/api/index.ts', relativePath: 'src/api/index.ts', name: 'index.ts', content: '// API code' },
        { path: 'README.md', relativePath: 'README.md', name: 'README.md', content: '# Project' },
      ],
    };
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
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * File tree slice not available
 */
export const NoFileTreeSlice: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    // Don't add fileTree slice

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          hasSlice: (name) => name !== 'fileTree',
        }}
      >
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Interactive example with custom repository
 */
export const CustomRepository: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = createMockFileTree('complex');
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
          currentScope: {
            type: 'repository',
            workspace: {
              name: 'principal-ai',
              path: '/Users/developer/principal-ai',
            },
            repository: {
              name: 'repository-traffic-controller',
              path: '/Users/developer/principal-ai/repository-traffic-controller',
              branch: 'main',
              remote: 'origin',
            },
          },
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
          repositoryPath: '/Users/developer/principal-ai/repository-traffic-controller',
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
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Node Colors Demo - demonstrates pv.fill and pv.stroke properties
 * Shows how different node types can have distinct fill and stroke colors
 */
export const NodeColorsDemo: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = createMockFileTree('node-colors');
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
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Color Priority Test - demonstrates color source priority
 * Shows how pv.fill takes priority over node.color
 * Priority: pv.fill > node.color > default
 */
export const ColorPriorityTest: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = createMockFileTree('color-priority');
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
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Multiple Configurations - demonstrates the canvas selector overlay
 * Click the panel icon next to the title to open the canvas selector
 */
export const MultipleConfigurations: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = createMockFileTree('multiple');
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
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Empty project with workspace scope only
 */
export const WorkspaceScope: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = createMockFileTree('none');
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
          currentScope: {
            type: 'workspace',
            workspace: {
              name: 'my-workspace',
              path: '/Users/developer/my-workspace',
            },
          },
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
          repositoryPath: '/Users/developer/my-workspace',
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
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Node Sizing Test - demonstrates that width/height from canvas are applied
 * All nodes are rectangles but with different explicit sizes
 */
export const NodeSizingTest: Story = {
  args: {} as never,
  render: () => {
    const canvasWithSizes = {
      nodes: [
        {
          id: 'small',
          type: 'text',
          x: 50,
          y: 100,
          width: 80,
          height: 60,
          text: 'Small (80x60)',
          color: '#3b82f6',
          pv: { nodeType: 'service', shape: 'rectangle', icon: 'Box' },
        },
        {
          id: 'medium',
          type: 'text',
          x: 200,
          y: 100,
          width: 140,
          height: 100,
          text: 'Medium (140x100)',
          color: '#10b981',
          pv: { nodeType: 'service', shape: 'rectangle', icon: 'Box' },
        },
        {
          id: 'large',
          type: 'text',
          x: 400,
          y: 100,
          width: 200,
          height: 150,
          text: 'Large (200x150)',
          color: '#f59e0b',
          pv: { nodeType: 'service', shape: 'rectangle', icon: 'Box' },
        },
        {
          id: 'wide',
          type: 'text',
          x: 100,
          y: 300,
          width: 250,
          height: 80,
          text: 'Wide (250x80)',
          color: '#8b5cf6',
          pv: { nodeType: 'service', shape: 'rectangle', icon: 'Box' },
        },
        {
          id: 'tall',
          type: 'text',
          x: 450,
          y: 280,
          width: 100,
          height: 180,
          text: 'Tall (100x180)',
          color: '#ef4444',
          pv: { nodeType: 'service', shape: 'rectangle', icon: 'Box' },
        },
      ],
      edges: [],
      pv: {
        name: 'Node Sizing Test',
        version: '1.0.0',
        nodeTypes: { service: { shape: 'rectangle', color: '#666' } },
        edgeTypes: {},
      },
    };

    const fileTreeData = {
      allFiles: [
        {
          path: '.principal-views/sizing-test.canvas',
          relativePath: '.principal-views/sizing-test.canvas',
          name: 'sizing-test.canvas',
          content: JSON.stringify(canvasWithSizes, null, 2),
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
        } as never}
        actionsOverrides={{
          readFile: async () => JSON.stringify(canvasWithSizes, null, 2),
          writeFile: async (path: string, content: string) => {
            console.log('[Storybook Mock] Saved:', path);
            console.log('[Storybook Mock] Content:', JSON.parse(content));
          },
        } as never}
      >
        {(props) => <PrincipalViewGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Resizable Panel Layout - replicates Electron environment
 * This story wraps the panel in EditableConfigurablePanelLayout to reproduce
 * the ResizeObserver issues seen in the Electron app
 */
const ResizablePanelLayoutInner: React.FC = () => {
  const { theme } = useTheme();
  const [layout, setLayout] = useState<PanelLayout>({
    left: 'placeholder',
    middle: 'principalView',
    right: 'placeholder',
  });
  const [collapsed, setCollapsed] = useState({ left: false, right: false });

  const mockSlices = new Map<string, DataSlice>();
  const fileTreeData = createMockFileTree('complex');
  mockSlices.set('fileTree', {
    scope: 'repository',
    name: 'fileTree',
    data: fileTreeData,
    loading: false,
    error: null,
    refresh: async () => {},
  });

  const panels = [
    {
      id: 'placeholder',
      label: 'Placeholder',
      content: (
        <div style={{ padding: 20, color: theme.colors.textMuted }}>
          Placeholder panel - resize this to trigger ResizeObserver
        </div>
      ),
    },
    {
      id: 'principalView',
      label: 'Principal View',
      content: (
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
            <div style={{ height: '100%', width: '100%', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <PrincipalViewGraphPanel {...props} />
            </div>
          )}
        </MockPanelProvider>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: theme.colors.background }}>
      <EditableConfigurablePanelLayout
        panels={panels}
        layout={layout}
        onLayoutChange={setLayout}
        isEditMode={false}
        collapsiblePanels={{ left: true, right: true }}
        defaultSizes={{ left: 25, middle: 50, right: 25 }}
        minSizes={{ left: 15, middle: 30, right: 15 }}
        collapsed={collapsed}
        showCollapseButtons={false}
        theme={theme}
      />
    </div>
  );
};

export const ResizablePanelLayout: Story = {
  args: {} as never,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', width: '100vw' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  render: () => <ResizablePanelLayoutInner />,
};

/**
 * Edge Disappearing Debug - simulates conditions that might cause edges to vanish
 * Use the controls to:
 * - Simulate file reload (as if the file changed on disk)
 * - Toggle fileTree loading state
 * - Rapidly switch between canvas versions
 */
const EdgeDisappearingDebugInner: React.FC = () => {
  const { theme } = useTheme();
  const [version, setVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [canvasVariant, setCanvasVariant] = useState<'with-edges' | 'fewer-edges' | 'no-edges'>('with-edges');
  const fileTreeDataRef = useRef(createMockFileTree('complex'));
  const mockSlicesRef = useRef(new Map<string, DataSlice>());
  const [, forceUpdate] = useState({});

  // tldraw architecture canvas - complex real-world example (14 nodes, 17 edges)
  const tldrawArchitecture = {
    pv: {
      name: 'tldraw Architecture',
      version: '1.0.0',
      nodeTypes: {
        CorePackage: { description: 'Core SDK package', color: 4, icon: 'Package' },
        SupportPackage: { description: 'Supporting library package', color: 5, icon: 'Box' },
        Application: { description: 'Application or demo', color: 2, icon: 'Globe' },
      },
      edgeTypes: {
        Depends: { style: 'solid', label: 'depends on' },
        Uses: { style: 'dashed', label: 'uses' },
      },
    },
    nodes: [
      { id: 'state', type: 'geo', x: 236, y: 795, width: 200, height: 100, color: 5, pv: { nodeType: 'SupportPackage', shape: 'rectangle', name: '@tldraw/state', description: 'Reactive signals library for state management' } },
      { id: 'utils', type: 'geo', x: -6, y: 795, width: 200, height: 100, color: 5, pv: { nodeType: 'SupportPackage', shape: 'rectangle', name: '@tldraw/utils', description: 'Shared utility functions' } },
      { id: 'validate', type: 'geo', x: 207, y: 237, width: 200, height: 100, color: 5, pv: { nodeType: 'SupportPackage', shape: 'rectangle', name: '@tldraw/validate', description: 'Lightweight validation library' } },
      { id: 'store', type: 'geo', x: -202, y: 516, width: 200, height: 100, color: 4, pv: { nodeType: 'CorePackage', shape: 'rectangle', name: '@tldraw/store', description: 'Reactive client-side database' } },
      { id: 'tlschema', type: 'geo', x: -209, y: 241, width: 200, height: 100, color: 4, pv: { nodeType: 'CorePackage', shape: 'rectangle', name: '@tldraw/tlschema', description: 'Type definitions and validators' } },
      { id: 'assets', type: 'geo', x: 377, y: -20, width: 200, height: 100, color: 5, pv: { nodeType: 'SupportPackage', shape: 'rectangle', name: '@tldraw/assets', description: 'Icons, fonts, and translations' } },
      { id: 'editor', type: 'geo', x: -12, y: 73, width: 200, height: 100, color: 4, pv: { nodeType: 'CorePackage', shape: 'rectangle', name: '@tldraw/editor', description: 'Foundational infinite canvas editor' } },
      { id: 'sync', type: 'geo', x: -417, y: 74, width: 200, height: 100, color: 4, pv: { nodeType: 'CorePackage', shape: 'rectangle', name: '@tldraw/sync', description: 'Multiplayer synchronization SDK' } },
      { id: 'tldraw', type: 'geo', x: -12, y: -120, width: 200, height: 100, color: 4, pv: { nodeType: 'CorePackage', shape: 'rectangle', name: '@tldraw/tldraw', description: 'Complete batteries-included SDK' } },
      { id: 'examples', type: 'geo', x: -216, y: -336, width: 150, height: 80, color: 2, pv: { nodeType: 'Application', shape: 'circle', name: 'examples', description: 'SDK examples and demos' } },
      { id: 'docs', type: 'geo', x: 12, y: -340, width: 150, height: 80, color: 2, pv: { nodeType: 'Application', shape: 'circle', name: 'docs', description: 'Documentation site (tldraw.dev)' } },
      { id: 'dotcom-client', type: 'geo', x: 458, y: -345, width: 150, height: 80, color: 2, pv: { nodeType: 'Application', shape: 'circle', name: 'dotcom', description: 'tldraw.com application' } },
      { id: 'dotcom-sync', type: 'geo', x: -397, y: -98, width: 160, height: 80, color: 2, pv: { nodeType: 'Application', shape: 'circle', name: 'sync-worker', description: 'Multiplayer backend worker' } },
      { id: 'vscode', type: 'geo', x: 230, y: -342, width: 150, height: 80, color: 2, pv: { nodeType: 'Application', shape: 'circle', name: 'vscode', description: 'VSCode extension' } },
    ],
    edges: [
      { id: 'edge-store-state', fromNode: 'store', fromSide: 'bottom', toNode: 'state', toSide: 'top', pv: { edgeType: 'Depends' } },
      { id: 'edge-store-utils', fromNode: 'store', fromSide: 'bottom', toNode: 'utils', toSide: 'top', pv: { edgeType: 'Depends' } },
      { id: 'edge-tlschema-store', fromNode: 'tlschema', fromSide: 'bottom', toNode: 'store', toSide: 'top', pv: { edgeType: 'Depends' } },
      { id: 'edge-tlschema-validate', fromNode: 'tlschema', fromSide: 'right', toNode: 'validate', toSide: 'left', pv: { edgeType: 'Depends' } },
      { id: 'edge-editor-store', fromNode: 'editor', fromSide: 'bottom', toNode: 'store', toSide: 'top', pv: { edgeType: 'Depends' } },
      { id: 'edge-editor-tlschema', fromNode: 'editor', fromSide: 'bottom', toNode: 'tlschema', toSide: 'top', pv: { edgeType: 'Depends' } },
      { id: 'edge-editor-state', fromNode: 'editor', fromSide: 'bottom', toNode: 'state', toSide: 'top', pv: { edgeType: 'Depends' } },
      { id: 'edge-editor-utils', fromNode: 'editor', fromSide: 'bottom', toNode: 'utils', toSide: 'top', pv: { edgeType: 'Depends' } },
      { id: 'edge-tldraw-editor', fromNode: 'tldraw', fromSide: 'bottom', toNode: 'editor', toSide: 'top', pv: { edgeType: 'Depends' } },
      { id: 'edge-tldraw-assets', fromNode: 'tldraw', fromSide: 'right', toNode: 'assets', toSide: 'left', pv: { edgeType: 'Depends' } },
      { id: 'edge-sync-store', fromNode: 'sync', fromSide: 'bottom', toNode: 'store', toSide: 'top', pv: { edgeType: 'Depends' } },
      { id: 'edge-sync-tlschema', fromNode: 'sync', fromSide: 'bottom', toNode: 'tlschema', toSide: 'top', pv: { edgeType: 'Depends' } },
      { id: 'edge-examples-tldraw', fromNode: 'examples', fromSide: 'bottom', toNode: 'tldraw', toSide: 'top', pv: { edgeType: 'Uses' } },
      { id: 'edge-docs-tldraw', fromNode: 'docs', fromSide: 'bottom', toNode: 'tldraw', toSide: 'top', pv: { edgeType: 'Uses' } },
      { id: 'edge-dotcom-tldraw', fromNode: 'dotcom-client', fromSide: 'bottom', toNode: 'tldraw', toSide: 'right', pv: { edgeType: 'Uses' } },
      { id: 'edge-dotcom-sync', fromNode: 'dotcom-sync', fromSide: 'bottom', toNode: 'sync', toSide: 'top', pv: { edgeType: 'Uses' } },
      { id: 'edge-vscode-tldraw', fromNode: 'vscode', fromSide: 'bottom', toNode: 'tldraw', toSide: 'top', pv: { edgeType: 'Uses' } },
    ],
  };

  // Canvas variants to simulate file changes - using tldraw architecture as base
  const canvasVariants = {
    'with-edges': tldrawArchitecture,
    'fewer-edges': {
      ...tldrawArchitecture,
      pv: { ...tldrawArchitecture.pv, name: 'tldraw Architecture (Fewer Edges)' },
      edges: tldrawArchitecture.edges.slice(0, 5), // Only first 5 edges
    },
    'no-edges': {
      ...tldrawArchitecture,
      pv: { ...tldrawArchitecture.pv, name: 'tldraw Architecture (No Edges)' },
      edges: [],
    },
  };

  // Create file tree data based on current variant
  const createFileTreeData = useCallback((variant: typeof canvasVariant) => ({
    allFiles: [
      {
        path: '.principal-views/debug.canvas',
        relativePath: '.principal-views/debug.canvas',
        name: 'debug.canvas',
        content: JSON.stringify(canvasVariants[variant], null, 2),
      },
    ],
  }), []);

  // Update file tree data when variant changes
  const updateFileTree = useCallback((variant: typeof canvasVariant) => {
    fileTreeDataRef.current = createFileTreeData(variant);
    mockSlicesRef.current.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: fileTreeDataRef.current,
      loading: false,
      error: null,
      refresh: async () => {},
    });
    setVersion(v => v + 1);
    forceUpdate({});
  }, [createFileTreeData]);

  // Simulate loading state toggle
  const toggleLoading = useCallback(() => {
    setIsLoading(prev => {
      const newLoading = !prev;
      mockSlicesRef.current.set('fileTree', {
        scope: 'repository',
        name: 'fileTree',
        data: newLoading ? null : fileTreeDataRef.current,
        loading: newLoading,
        error: null,
        refresh: async () => {},
      });
      forceUpdate({});
      return newLoading;
    });
  }, []);

  // Simulate rapid file changes
  const simulateRapidChanges = useCallback(async () => {
    const variants: Array<typeof canvasVariant> = ['with-edges', 'fewer-edges', 'no-edges', 'with-edges'];
    for (const variant of variants) {
      setCanvasVariant(variant);
      updateFileTree(variant);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, [updateFileTree]);

  // Simulate loading cycle
  const simulateLoadingCycle = useCallback(async () => {
    toggleLoading(); // Start loading
    await new Promise(resolve => setTimeout(resolve, 200));
    toggleLoading(); // Stop loading
  }, [toggleLoading]);

  // Initialize mock slices
  if (mockSlicesRef.current.size === 0) {
    fileTreeDataRef.current = createFileTreeData(canvasVariant);
    mockSlicesRef.current.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: fileTreeDataRef.current,
      loading: false,
      error: null,
      refresh: async () => {},
    });
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Control Panel */}
      <div style={{
        padding: '12px 16px',
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <span style={{ color: theme.colors.text, fontWeight: 500 }}>Edge Debug Controls:</span>

        <select
          value={canvasVariant}
          onChange={(e) => {
            const variant = e.target.value as typeof canvasVariant;
            setCanvasVariant(variant);
            updateFileTree(variant);
          }}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            color: theme.colors.text,
          }}
        >
          <option value="with-edges">Full tldraw (17 edges)</option>
          <option value="fewer-edges">Fewer Edges (5)</option>
          <option value="no-edges">No Edges (0)</option>
        </select>

        <button
          onClick={() => updateFileTree(canvasVariant)}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.primary,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Simulate File Reload
        </button>

        <button
          onClick={toggleLoading}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: `1px solid ${theme.colors.border}`,
            background: isLoading ? '#ef4444' : theme.colors.background,
            color: isLoading ? 'white' : theme.colors.text,
            cursor: 'pointer',
          }}
        >
          {isLoading ? 'Stop Loading' : 'Start Loading'}
        </button>

        <button
          onClick={simulateRapidChanges}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: `1px solid ${theme.colors.border}`,
            background: '#f59e0b',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Rapid Changes (x4)
        </button>

        <button
          onClick={simulateLoadingCycle}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            border: `1px solid ${theme.colors.border}`,
            background: '#8b5cf6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Loading Cycle
        </button>

        <span style={{ color: theme.colors.textMuted, fontSize: 12 }}>
          Version: {version} | Check console for edge counts
        </span>
      </div>

      {/* Graph Panel */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MockPanelProvider
          key={version}
          contextOverrides={{
            slices: mockSlicesRef.current,
            getSlice: <T,>(name: string): DataSlice<T> | undefined => {
              return mockSlicesRef.current.get(name) as DataSlice<T> | undefined;
            },
            hasSlice: (name: string) => mockSlicesRef.current.has(name),
            isSliceLoading: (name: string) => mockSlicesRef.current.get(name)?.loading || false,
            repositoryPath: '/mock/repository',
          } as never}
          actionsOverrides={{
            readFile: async () => {
              const file = fileTreeDataRef.current.allFiles[0];
              return file?.content || '{}';
            },
            writeFile: async (path: string, content: string) => {
              console.log('[Mock] File saved:', path);
              if (fileTreeDataRef.current.allFiles[0]) {
                fileTreeDataRef.current.allFiles[0].content = content;
              }
            },
          } as never}
        >
          {(props) => <PrincipalViewGraphPanel {...props} />}
        </MockPanelProvider>
      </div>
    </div>
  );
};

export const EdgeDisappearingDebug: Story = {
  args: {} as never,
  parameters: {
    docs: {
      description: {
        story: 'Debug story for investigating edge disappearing issues. Use the controls to simulate file reloads, loading states, and rapid canvas changes. Watch the browser console for edge count logs.',
      },
    },
  },
  render: () => <EdgeDisappearingDebugInner />,
};

/**
 * Recenter Coordinates Test - tests the recenter button functionality
 * Nodes are intentionally positioned with a non-zero center offset.
 * Use the crosshair button (in edit mode) to recenter, then save.
 * Switch to another config and back to verify persistence.
 */
const RecenterCoordinatesTestInner: React.FC = () => {
  const { theme } = useTheme();
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null);
  const [, forceUpdate] = useState({});
  const [viewport, setViewport] = useState<{ x: number; y: number; zoom: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track viewport changes by observing the React Flow transform
  useEffect(() => {
    const checkViewport = () => {
      if (!containerRef.current) return;

      // React Flow applies transform to .react-flow__viewport
      const viewportEl = containerRef.current.querySelector('.react-flow__viewport') as HTMLElement;
      if (!viewportEl) return;

      const transform = viewportEl.style.transform;
      // Parse transform: "translate(Xpx, Ypx) scale(Z)"
      const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)\s*scale\(([-\d.]+)\)/);
      if (match) {
        const newViewport = {
          x: Math.round(parseFloat(match[1])),
          y: Math.round(parseFloat(match[2])),
          zoom: Math.round(parseFloat(match[3]) * 100) / 100,
        };
        setViewport(prev => {
          if (!prev || prev.x !== newViewport.x || prev.y !== newViewport.y || prev.zoom !== newViewport.zoom) {
            return newViewport;
          }
          return prev;
        });
      }
    };

    // Check periodically and after fitView settles
    const interval = setInterval(checkViewport, 200);
    const timeout = setTimeout(checkViewport, 500); // After fitView animation

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Canvas with nodes far from origin (center should be around x:500, y:350)
  const offCenterCanvas1 = {
    nodes: [
      {
        id: 'node-a',
        type: 'text',
        x: 300,
        y: 200,
        width: 140,
        height: 80,
        text: 'Node A',
        pv: { nodeType: 'service', shape: 'rectangle', fill: '#3b82f6', stroke: '#1d4ed8', icon: 'Server' },
      },
      {
        id: 'node-b',
        type: 'text',
        x: 550,
        y: 200,
        width: 140,
        height: 80,
        text: 'Node B',
        pv: { nodeType: 'service', shape: 'rectangle', fill: '#8b5cf6', stroke: '#6d28d9', icon: 'Database' },
      },
      {
        id: 'node-c',
        type: 'text',
        x: 425,
        y: 400,
        width: 140,
        height: 100,
        text: 'Node C',
        pv: { nodeType: 'service', shape: 'hexagon', fill: '#22c55e', stroke: '#16a34a', icon: 'Cpu' },
      },
    ],
    edges: [
      { id: 'e1', fromNode: 'node-a', toNode: 'node-b', pv: { edgeType: 'flow' } },
      { id: 'e2', fromNode: 'node-a', toNode: 'node-c', pv: { edgeType: 'flow' } },
      { id: 'e3', fromNode: 'node-b', toNode: 'node-c', pv: { edgeType: 'flow' } },
    ],
    pv: {
      name: 'Off-Center Canvas 1',
      description: 'Nodes positioned around (500, 350) - use recenter to shift to origin',
      version: '1.0.0',
      edgeTypes: {
        flow: { style: 'solid', color: '#64748b', width: 2, directed: true },
      },
    },
  };

  // Another canvas with different offset (center around x:800, y:600)
  const offCenterCanvas2 = {
    nodes: [
      {
        id: 'api',
        type: 'text',
        x: 600,
        y: 400,
        width: 160,
        height: 80,
        text: 'API Gateway',
        pv: { nodeType: 'api', shape: 'rectangle', fill: '#06b6d4', stroke: '#0891b2', icon: 'Globe' },
      },
      {
        id: 'auth',
        type: 'text',
        x: 850,
        y: 400,
        width: 140,
        height: 80,
        text: 'Auth Service',
        pv: { nodeType: 'auth', shape: 'rectangle', fill: '#ef4444', stroke: '#dc2626', icon: 'Shield' },
      },
      {
        id: 'db',
        type: 'text',
        x: 600,
        y: 600,
        width: 140,
        height: 100,
        text: 'Database',
        pv: { nodeType: 'db', shape: 'hexagon', fill: '#f59e0b', stroke: '#d97706', icon: 'Database' },
      },
      {
        id: 'cache',
        type: 'text',
        x: 850,
        y: 600,
        width: 140,
        height: 100,
        text: 'Cache',
        pv: { nodeType: 'cache', shape: 'circle', fill: '#ec4899', stroke: '#db2777', icon: 'Zap' },
      },
    ],
    edges: [
      { id: 'e1', fromNode: 'api', toNode: 'auth', pv: { edgeType: 'http' } },
      { id: 'e2', fromNode: 'api', toNode: 'db', pv: { edgeType: 'query' } },
      { id: 'e3', fromNode: 'auth', toNode: 'cache', pv: { edgeType: 'cache-lookup' } },
    ],
    pv: {
      name: 'Off-Center Canvas 2',
      description: 'Nodes positioned around (800, 600) - use recenter to shift to origin',
      version: '1.0.0',
      edgeTypes: {
        http: { style: 'solid', color: '#06b6d4', width: 2, directed: true },
        query: { style: 'dashed', color: '#f59e0b', width: 2, directed: true },
        'cache-lookup': { style: 'dotted', color: '#ec4899', width: 1, directed: true },
      },
    },
  };

  // Store file contents with refs so they persist across renders
  const fileContentsRef = useRef<Record<string, string>>({
    'off-center-1.canvas': JSON.stringify(offCenterCanvas1, null, 2),
    'off-center-2.canvas': JSON.stringify(offCenterCanvas2, null, 2),
  });

  const fileTreeData = {
    allFiles: [
      {
        path: '.principal-views/off-center-1.canvas',
        relativePath: '.principal-views/off-center-1.canvas',
        name: 'off-center-1.canvas',
        get content() { return fileContentsRef.current['off-center-1.canvas']; },
        set content(val: string) { fileContentsRef.current['off-center-1.canvas'] = val; },
      },
      {
        path: '.principal-views/off-center-2.canvas',
        relativePath: '.principal-views/off-center-2.canvas',
        name: 'off-center-2.canvas',
        get content() { return fileContentsRef.current['off-center-2.canvas']; },
        set content(val: string) { fileContentsRef.current['off-center-2.canvas'] = val; },
      },
      { path: 'README.md', relativePath: 'README.md', name: 'README.md', content: '# Test' },
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

  // Helper to calculate bounding box info
  const calculateBounds = (content: string) => {
    try {
      const canvas = JSON.parse(content);
      if (!canvas.nodes || canvas.nodes.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0, centerX: 0, centerY: 0, width: 0, height: 0 };
      }
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const node of canvas.nodes) {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x + node.width);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y + node.height);
      }
      return {
        minX: Math.round(minX),
        minY: Math.round(minY),
        maxX: Math.round(maxX),
        maxY: Math.round(maxY),
        centerX: Math.round((minX + maxX) / 2),
        centerY: Math.round((minY + maxY) / 2),
        width: Math.round(maxX - minX),
        height: Math.round(maxY - minY),
      };
    } catch {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, centerX: 0, centerY: 0, width: 0, height: 0 };
    }
  };

  const bounds1 = calculateBounds(fileContentsRef.current['off-center-1.canvas']);
  const bounds2 = calculateBounds(fileContentsRef.current['off-center-2.canvas']);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Info Panel */}
      <div style={{
        padding: '12px 16px',
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        fontSize: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4, color: theme.colors.text }}>
              Recenter Coordinates Test
            </div>
            <div style={{ color: theme.colors.textMuted, fontSize: 11 }}>
              1. Pencil → edit mode | 2. Crosshair → recenter | 3. Save | 4. Switch configs to verify
            </div>
          </div>
          {lastSaveTime && (
            <div style={{ color: theme.colors.success || '#22c55e', fontWeight: 500 }}>
              Saved: {lastSaveTime}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 12, flexWrap: 'wrap' }}>
          {/* Canvas 1 bounds */}
          <div style={{ background: theme.colors.background, padding: '8px 12px', borderRadius: 4, border: `1px solid ${theme.colors.border}` }}>
            <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: 4 }}>Canvas 1 Bounds</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6 }}>
              <div><span style={{ color: theme.colors.textMuted }}>X range:</span> <span style={{ color: theme.colors.primary }}>{bounds1.minX}</span> → <span style={{ color: theme.colors.primary }}>{bounds1.maxX}</span></div>
              <div><span style={{ color: theme.colors.textMuted }}>Y range:</span> <span style={{ color: theme.colors.primary }}>{bounds1.minY}</span> → <span style={{ color: theme.colors.primary }}>{bounds1.maxY}</span></div>
              <div><span style={{ color: theme.colors.textMuted }}>Center:</span> <span style={{ color: bounds1.centerX === 0 && bounds1.centerY === 0 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>({bounds1.centerX}, {bounds1.centerY})</span></div>
              <div><span style={{ color: theme.colors.textMuted }}>Size:</span> {bounds1.width} × {bounds1.height}</div>
            </div>
          </div>

          {/* Canvas 2 bounds */}
          <div style={{ background: theme.colors.background, padding: '8px 12px', borderRadius: 4, border: `1px solid ${theme.colors.border}` }}>
            <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: 4 }}>Canvas 2 Bounds</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6 }}>
              <div><span style={{ color: theme.colors.textMuted }}>X range:</span> <span style={{ color: theme.colors.primary }}>{bounds2.minX}</span> → <span style={{ color: theme.colors.primary }}>{bounds2.maxX}</span></div>
              <div><span style={{ color: theme.colors.textMuted }}>Y range:</span> <span style={{ color: theme.colors.primary }}>{bounds2.minY}</span> → <span style={{ color: theme.colors.primary }}>{bounds2.maxY}</span></div>
              <div><span style={{ color: theme.colors.textMuted }}>Center:</span> <span style={{ color: bounds2.centerX === 0 && bounds2.centerY === 0 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>({bounds2.centerX}, {bounds2.centerY})</span></div>
              <div><span style={{ color: theme.colors.textMuted }}>Size:</span> {bounds2.width} × {bounds2.height}</div>
            </div>
          </div>

          {/* Current Viewport */}
          <div style={{ background: theme.colors.background, padding: '8px 12px', borderRadius: 4, border: `1px solid ${theme.colors.border}` }}>
            <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: 4 }}>Current Viewport (fitView result)</div>
            {viewport ? (
              <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6 }}>
                <div><span style={{ color: theme.colors.textMuted }}>translate:</span> <span style={{ color: '#22c55e', fontWeight: 600 }}>({viewport.x}, {viewport.y})</span></div>
                <div><span style={{ color: theme.colors.textMuted }}>zoom:</span> <span style={{ color: theme.colors.primary }}>{viewport.zoom}</span></div>
                <div style={{ marginTop: 4, fontSize: 10, color: theme.colors.textMuted }}>
                  To skip fitView animation, set initial viewport to these values
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: theme.colors.textMuted }}>Loading...</div>
            )}
          </div>
        </div>
      </div>

      {/* Graph Panel */}
      <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}>
        <MockPanelProvider
          contextOverrides={{
            slices: mockSlices,
            getSlice: <T,>(name: string): DataSlice<T> | undefined => {
              return mockSlices.get(name) as DataSlice<T> | undefined;
            },
            hasSlice: (name: string) => mockSlices.has(name),
            isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
            repositoryPath: '/mock/repository',
          } as never}
          actionsOverrides={{
            readFile: async (path: string) => {
              const fileName = path.split('/').pop() || '';
              const content = fileContentsRef.current[fileName];
              if (!content) throw new Error(`File not found: ${path}`);
              return content;
            },
            writeFile: async (path: string, content: string) => {
              const fileName = path.split('/').pop() || '';
              fileContentsRef.current[fileName] = content;
              setLastSaveTime(new Date().toLocaleTimeString());
              forceUpdate({}); // Trigger re-render to update center display

              // Log the new bounds for verification
              const bounds = calculateBounds(content);
              console.log(`[RecenterTest] Saved ${fileName}`);
              console.log(`  Bounds: X(${bounds.minX} → ${bounds.maxX}), Y(${bounds.minY} → ${bounds.maxY})`);
              console.log(`  Center: (${bounds.centerX}, ${bounds.centerY}), Size: ${bounds.width} × ${bounds.height}`);
            },
          } as never}
        >
          {(props) => <PrincipalViewGraphPanel {...props} />}
        </MockPanelProvider>
      </div>
    </div>
  );
};

export const RecenterCoordinatesTest: Story = {
  args: {} as never,
  parameters: {
    docs: {
      description: {
        story: 'Tests the recenter coordinates button. Canvases have intentionally off-center node positions. Enter edit mode, click the crosshair button to recenter, save, then switch configs to verify persistence.',
      },
    },
  },
  render: () => <RecenterCoordinatesTestInner />,
};
