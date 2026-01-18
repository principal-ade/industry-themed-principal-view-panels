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
          getSlice: <T,>(name: string) => {
            return mockSlices.get(name) as any;
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
          getSlice: <T,>(name: string) => {
            return mockSlices.get(name) as any;
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
          getSlice: <T,>(name: string) => {
            return mockSlices.get(name) as any;
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
          getSlice: <T,>(name: string) => {
            return mockSlices.get(name) as any;
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
          getSlice: <T,>(name: string) => {
            return mockSlices.get(name) as any;
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
          getSlice: <T,>(name: string) => {
            return mockSlices.get(name) as any;
          },
        }}
      >
        {(props) => <CanvasListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};
