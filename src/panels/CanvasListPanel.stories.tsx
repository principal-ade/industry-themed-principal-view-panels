import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { CanvasListPanel } from './CanvasListPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';

const meta = {
  title: 'Panels/CanvasListPanel',
  component: CanvasListPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Lists and manages .otel.canvas files in the project with search and selection capabilities.',
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
} satisfies Meta<typeof CanvasListPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock file tree with .otel.canvas files
const mockFileTreeWithCanvases = {
  sha: 'mock-sha-123',
  allFiles: [
    {
      name: 'authentication-flow.otel.canvas',
      relativePath: '.principal-views/authentication-flow.otel.canvas',
      path: '.principal-views/authentication-flow.otel.canvas',
    },
    {
      name: 'payment-processing.otel.canvas',
      relativePath: '.principal-views/payment-processing.otel.canvas',
      path: '.principal-views/payment-processing.otel.canvas',
    },
    {
      name: 'user-registration.otel.canvas',
      relativePath: '.principal-views/user-registration.otel.canvas',
      path: '.principal-views/user-registration.otel.canvas',
    },
    {
      name: 'data-pipeline.otel.canvas',
      relativePath: '.principal-views/data-pipeline.otel.canvas',
      path: '.principal-views/data-pipeline.otel.canvas',
    },
    {
      name: 'api-gateway.otel.canvas',
      relativePath: '.principal-views/api-gateway.otel.canvas',
      path: '.principal-views/api-gateway.otel.canvas',
    },
  ],
};

const mockFileTreeEmpty = {
  sha: 'mock-sha-empty',
  allFiles: [],
};

/**
 * Default story showing the canvas list panel with multiple canvas files
 */
export const Default: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map([
      [
        'fileTree',
        {
          scope: 'repository' as const,
          name: 'fileTree',
          data: mockFileTreeWithCanvases,
          loading: false,
          error: null,
          refresh: async () => {},
        },
      ],
    ]);

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
      >
        {(props) => <CanvasListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map([
      [
        'fileTree',
        {
          scope: 'repository' as const,
          name: 'fileTree',
          data: null,
          loading: true,
          error: null,
          refresh: async () => {},
        },
      ],
    ]);

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
      >
        {(props) => <CanvasListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Empty state with no canvas files
 */
export const Empty: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map([
      [
        'fileTree',
        {
          scope: 'repository' as const,
          name: 'fileTree',
          data: mockFileTreeEmpty,
          loading: false,
          error: null,
          refresh: async () => {},
        },
      ],
    ]);

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
      >
        {(props) => <CanvasListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * With event handling - demonstrates event emission on canvas selection
 */
export const WithEventHandling: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map([
      [
        'fileTree',
        {
          scope: 'repository' as const,
          name: 'fileTree',
          data: mockFileTreeWithCanvases,
          loading: false,
          error: null,
          refresh: async () => {},
        },
      ],
    ]);

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
      >
        {(props) => (
          <>
            <CanvasListPanel {...props} />
            <div
              style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                fontSize: '12px',
                maxWidth: '300px',
              }}
            >
              <strong>Instructions:</strong> Click on a canvas to see event emission in the browser
              console
            </div>
          </>
        )}
      </MockPanelProvider>
    );
  },
};

/**
 * Single canvas file
 */
export const SingleCanvas: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map([
      [
        'fileTree',
        {
          scope: 'repository' as const,
          name: 'fileTree',
          data: {
            sha: 'mock-sha-single',
            allFiles: [
              {
                name: 'authentication-flow.otel.canvas',
                relativePath: '.principal-views/authentication-flow.otel.canvas',
                path: '.principal-views/authentication-flow.otel.canvas',
              },
            ],
          },
          loading: false,
          error: null,
          refresh: async () => {},
        },
      ],
    ]);

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
      >
        {(props) => <CanvasListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Many canvas files (scrolling behavior)
 */
export const ManyCanvases: Story = {
  args: {} as never,
  render: () => {
    const manyCanvases = Array.from({ length: 20 }, (_, i) => ({
      name: `workflow-${i + 1}.otel.canvas`,
      relativePath: `.principal-views/workflow-${i + 1}.otel.canvas`,
      path: `.principal-views/workflow-${i + 1}.otel.canvas`,
    }));

    const mockSlices = new Map([
      [
        'fileTree',
        {
          scope: 'repository' as const,
          name: 'fileTree',
          data: {
            sha: 'mock-sha-many',
            allFiles: manyCanvases,
          },
          loading: false,
          error: null,
          refresh: async () => {},
        },
      ],
    ]);

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
      >
        {(props) => <CanvasListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Monorepo with multiple packages - demonstrates package-aware canvas discovery
 * Shows canvas files from both root and package-level .principal-views/ directories
 */
export const MonorepoWithPackages: Story = {
  args: {} as never,
  render: () => {
    const mockFileTreeWithPackages = {
      sha: 'mock-sha-monorepo',
      allFiles: [
        // Root package.json
        {
          name: 'package.json',
          relativePath: 'package.json',
          path: 'package.json',
        },
        // Root canvas files
        {
          name: 'system-overview.otel.canvas',
          relativePath: '.principal-views/system-overview.otel.canvas',
          path: '.principal-views/system-overview.otel.canvas',
        },
        {
          name: 'integration-tests.canvas',
          relativePath: '.principal-views/integration-tests.canvas',
          path: '.principal-views/integration-tests.canvas',
        },

        // Core package
        {
          name: 'package.json',
          relativePath: 'packages/core/package.json',
          path: 'packages/core/package.json',
        },
        {
          name: 'authentication-flow.otel.canvas',
          relativePath: 'packages/core/.principal-views/authentication-flow.otel.canvas',
          path: 'packages/core/.principal-views/authentication-flow.otel.canvas',
        },
        {
          name: 'data-validation.otel.canvas',
          relativePath: 'packages/core/.principal-views/data-validation.otel.canvas',
          path: 'packages/core/.principal-views/data-validation.otel.canvas',
        },

        // API package
        {
          name: 'package.json',
          relativePath: 'packages/api/package.json',
          path: 'packages/api/package.json',
        },
        {
          name: 'rest-endpoints.otel.canvas',
          relativePath: 'packages/api/.principal-views/rest-endpoints.otel.canvas',
          path: 'packages/api/.principal-views/rest-endpoints.otel.canvas',
        },
        {
          name: 'graphql-schema.canvas',
          relativePath: 'packages/api/.principal-views/graphql-schema.canvas',
          path: 'packages/api/.principal-views/graphql-schema.canvas',
        },

        // UI package
        {
          name: 'package.json',
          relativePath: 'packages/ui/package.json',
          path: 'packages/ui/package.json',
        },
        {
          name: 'component-lifecycle.otel.canvas',
          relativePath: 'packages/ui/.principal-views/component-lifecycle.otel.canvas',
          path: 'packages/ui/.principal-views/component-lifecycle.otel.canvas',
        },
        {
          name: 'user-interactions.otel.canvas',
          relativePath: 'packages/ui/.principal-views/user-interactions.otel.canvas',
          path: 'packages/ui/.principal-views/user-interactions.otel.canvas',
        },

        // Worker package (nested deeper)
        {
          name: 'package.json',
          relativePath: 'services/background/worker/package.json',
          path: 'services/background/worker/package.json',
        },
        {
          name: 'job-processing.otel.canvas',
          relativePath: 'services/background/worker/.principal-views/job-processing.otel.canvas',
          path: 'services/background/worker/.principal-views/job-processing.otel.canvas',
        },
      ],
    };

    const mockSlices = new Map([
      [
        'fileTree',
        {
          scope: 'repository' as const,
          name: 'fileTree',
          data: mockFileTreeWithPackages,
          loading: false,
          error: null,
          refresh: async () => {},
        },
      ],
    ]);

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
      >
        {(props) => (
          <>
            <CanvasListPanel {...props} />
            <div
              style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                fontSize: '12px',
                maxWidth: '320px',
              }}
            >
              <strong>Package-Aware Discovery:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '11px' }}>
                <li>Package canvases show package badges</li>
                <li>IDs are prefixed (e.g., core/authentication-flow)</li>
                <li>Filter by package using dropdown (shows counts)</li>
                <li>Both .otel.canvas and .canvas types shown</li>
                <li>Sorted alphabetically by name</li>
              </ul>
            </div>
          </>
        )}
      </MockPanelProvider>
    );
  },
};
