import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
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
