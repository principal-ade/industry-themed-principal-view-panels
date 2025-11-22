import type { Meta, StoryObj } from '@storybook/react';
import { VisualValidationGraphPanel } from './VisualValidationGraphPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import { createMockFileTree } from '../mocks/vvfConfigs';
import type { DataSlice } from '../types';

/**
 * VisualValidationGraphPanel visualizes vvf.config.yaml files as interactive graphs.
 * It demonstrates graph rendering with ReactFlow and configuration parsing.
 */
const meta = {
  title: 'Panels/VisualValidationGraphPanel',
  component: VisualValidationGraphPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visualizes Visual Validation Framework configuration files as interactive graph diagrams. Supports multiple node types, edge styles, and real-time updates.',
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
} satisfies Meta<typeof VisualValidationGraphPanel>;

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
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: createMockFileTree('simple'),
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
        {(props) => <VisualValidationGraphPanel {...props} />}
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
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: createMockFileTree('complex'),
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
        {(props) => <VisualValidationGraphPanel {...props} />}
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
        {(props) => <VisualValidationGraphPanel {...props} />}
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
        {(props) => <VisualValidationGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Invalid YAML configuration
 */
export const InvalidYAML: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: [
        {
          path: 'vvf.config.yaml',
          content: 'invalid: yaml: content:\n  - missing\n    proper\n  indentation',
        },
        { path: 'src/api/index.ts', content: '// API code' },
        { path: 'README.md', content: '# Project' },
      ],
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
        {(props) => <VisualValidationGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Missing required metadata
 */
export const MissingMetadata: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: [
        {
          path: 'vvf.config.yaml',
          content: `nodeTypes:
  api-handler:
    shape: rectangle
    icon: server
    color: '#3b82f6'
    dataSchema: {}
    sources:
      - 'src/api/**/*.ts'
`,
        },
        { path: 'src/api/index.ts', content: '// API code' },
        { path: 'README.md', content: '# Project' },
      ],
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
        {(props) => <VisualValidationGraphPanel {...props} />}
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
        {(props) => <VisualValidationGraphPanel {...props} />}
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
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: createMockFileTree('complex'),
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
        }}
      >
        {(props) => <VisualValidationGraphPanel {...props} />}
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
        }}
      >
        {(props) => <VisualValidationGraphPanel {...props} />}
      </MockPanelProvider>
    );
  },
};
