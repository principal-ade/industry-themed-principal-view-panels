import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { CanvasListPanel } from './CanvasListPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { PanelEvent } from '../types';
import type { FileTree } from '@principal-ai/repository-abstraction';

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

// Helper to create mock slices with actions
const createMockSlices = (fileTreeData: FileTree | null) => {
  return new Map([
    [
      'fileTree',
      {
        scope: 'repository' as const,
        name: 'fileTree',
        data: fileTreeData,
        loading: false,
        error: null,
        refresh: async () => {},
      },
    ],
    [
      'actions',
      {
        scope: 'repository' as const,
        name: 'actions',
        data: {
          readFile: async (path: string) => {
            console.log('[Mock] readFile:', path);
            return JSON.stringify({
              name: 'Mock Narrative',
              canvas: 'mock.canvas',
              scenarios: [],
            });
          },
        },
        loading: false,
        error: null,
        refresh: async () => {},
      },
    ],
  ]);
};

/**
 * Default story showing the canvas list panel with multiple canvas files
 */
export const Default: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = createMockSlices(mockFileTreeWithCanvases);

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
    const mockSlices = createMockSlices(null);
    mockSlices.get('fileTree')!.loading = true;

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
    const mockSlices = createMockSlices(mockFileTreeEmpty);

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
    const mockSlices = createMockSlices(mockFileTreeWithCanvases);

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
    const mockSlices = createMockSlices({
      sha: 'mock-sha-single',
      allFiles: [
        {
          name: 'authentication-flow.otel.canvas',
          relativePath: '.principal-views/authentication-flow.otel.canvas',
          path: '.principal-views/authentication-flow.otel.canvas',
        },
      ],
    });

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

    const mockSlices = createMockSlices({
      sha: 'mock-sha-many',
      allFiles: manyCanvases,
    });

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

    const mockSlices = createMockSlices(mockFileTreeWithPackages);

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

/**
 * With Narratives - Shows canvases with associated narrative templates
 * Demonstrates the tree structure with expandable narratives
 */
export const WithNarratives: Story = {
  args: {} as never,
  render: () => {
    const mockFileTreeWithNarratives = {
      sha: 'mock-sha-narratives',
      allFiles: [
        // Authentication canvas and its narrative
        {
          name: 'authentication-flow.otel.canvas',
          relativePath: '.principal-views/authentication-flow.otel.canvas',
          path: '.principal-views/authentication-flow.otel.canvas',
        },
        {
          name: 'auth-scenarios.narrative.json',
          relativePath: '.principal-views/__narratives__/auth-scenarios.narrative.json',
          path: '.principal-views/__narratives__/auth-scenarios.narrative.json',
        },

        // Payment canvas and its narrative
        {
          name: 'payment-processing.otel.canvas',
          relativePath: '.principal-views/payment-processing.otel.canvas',
          path: '.principal-views/payment-processing.otel.canvas',
        },
        {
          name: 'payment-scenarios.narrative.json',
          relativePath: '.principal-views/__narratives__/payment-scenarios.narrative.json',
          path: '.principal-views/__narratives__/payment-scenarios.narrative.json',
        },

        // User registration canvas (no narrative)
        {
          name: 'user-registration.otel.canvas',
          relativePath: '.principal-views/user-registration.otel.canvas',
          path: '.principal-views/user-registration.otel.canvas',
        },

        // Data pipeline canvas and its narrative
        {
          name: 'data-pipeline.otel.canvas',
          relativePath: '.principal-views/data-pipeline.otel.canvas',
          path: '.principal-views/data-pipeline.otel.canvas',
        },
        {
          name: 'pipeline-scenarios.narrative.json',
          relativePath: '.principal-views/__narratives__/pipeline-scenarios.narrative.json',
          path: '.principal-views/__narratives__/pipeline-scenarios.narrative.json',
        },
      ],
    };

    // Create mock slices
    const mockSlices = new Map([
      [
        'fileTree',
        {
          scope: 'repository' as const,
          name: 'fileTree',
          data: mockFileTreeWithNarratives,
          loading: false,
          error: null,
          refresh: async () => {},
        },
      ],
    ]);

    // Create custom readFile that returns narrative templates
    const mockReadFile = async (path: string) => {
      console.log('[Mock] readFile:', path);

      // Return appropriate narrative templates based on path
      if (path.includes('auth-scenarios.narrative.json')) {
                return JSON.stringify({
                  version: '1.0.0',
                  name: 'Authentication Scenarios',
                  canvas: 'authentication-flow.otel.canvas',
                  mode: 'flow',
                  scenarios: [
                    {
                      id: 'successful-login',
                      priority: 1,
                      description: 'Successful Login',
                      condition: { type: 'event', event: 'auth.success' },
                      template: {
                        introduction: 'User logged in successfully',
                        flow: ['Credentials validated', 'Session created'],
                      },
                    },
                    {
                      id: 'failed-login',
                      priority: 2,
                      description: 'Failed Login',
                      condition: { type: 'event', event: 'auth.failed' },
                      template: {
                        introduction: 'Login failed',
                        flow: ['Invalid credentials'],
                      },
                    },
                    {
                      id: 'oauth-login',
                      priority: 3,
                      description: 'OAuth Login',
                      condition: { type: 'event', event: 'auth.oauth' },
                      template: {
                        introduction: 'OAuth authentication',
                        flow: ['OAuth provider verified'],
                      },
                    },
                  ],
                });
              }

              if (path.includes('payment-scenarios.narrative.json')) {
                return JSON.stringify({
                  version: '1.0.0',
                  name: 'Payment Flow Scenarios',
                  canvas: 'payment-processing.otel.canvas',
                  mode: 'flow',
                  scenarios: [
                    {
                      id: 'credit-card-success',
                      priority: 1,
                      description: 'Credit Card Payment Success',
                      condition: { type: 'event', event: 'payment.success' },
                      template: {
                        introduction: 'Payment processed successfully',
                        flow: ['Card validated', 'Payment authorized'],
                      },
                    },
                    {
                      id: 'payment-declined',
                      priority: 2,
                      description: 'Payment Declined',
                      condition: { type: 'event', event: 'payment.declined' },
                      template: {
                        introduction: 'Payment declined',
                        flow: ['Card declined by processor'],
                      },
                    },
                    {
                      id: 'refund-flow',
                      priority: 3,
                      description: 'Refund Processing',
                      condition: { type: 'event', event: 'payment.refund' },
                      template: {
                        introduction: 'Refund processed',
                        flow: ['Refund initiated', 'Refund completed'],
                      },
                    },
                    {
                      id: 'partial-refund',
                      priority: 4,
                      description: 'Partial Refund',
                      condition: { type: 'event', event: 'payment.partial_refund' },
                      template: {
                        introduction: 'Partial refund processed',
                        flow: ['Partial amount refunded'],
                      },
                    },
                  ],
                });
              }

              if (path.includes('pipeline-scenarios.narrative.json')) {
                return JSON.stringify({
                  version: '1.0.0',
                  name: 'Data Pipeline Scenarios',
                  canvas: 'data-pipeline.otel.canvas',
                  mode: 'flow',
                  scenarios: [
                    {
                      id: 'batch-processing',
                      priority: 1,
                      description: 'Batch Data Processing',
                      condition: { type: 'event', event: 'pipeline.batch' },
                      template: {
                        introduction: 'Batch processing completed',
                        flow: ['Data ingested', 'Data transformed'],
                      },
                    },
                    {
                      id: 'realtime-streaming',
                      priority: 2,
                      description: 'Real-time Streaming',
                      condition: { type: 'event', event: 'pipeline.stream' },
                      template: {
                        introduction: 'Stream processing active',
                        flow: ['Data streaming', 'Real-time processing'],
                      },
                    },
                  ],
                });
              }

      // Default empty narrative
      return JSON.stringify({
        version: '1.0.0',
        name: 'Default Narrative',
        canvas: 'unknown',
        scenarios: [],
      });
    };

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            const slice = mockSlices.get(name) as T | undefined;
            console.log('[Story] getSlice:', name, slice ? 'found' : 'not found');
            return slice;
          },
        }}
        actionsOverrides={{
          readFile: mockReadFile,
        }}
      >
        {(props) => {
          return (
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
                <strong>Narratives Demo:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '11px' }}>
                  <li>Open browser console to see debug logs</li>
                  <li>Click chevrons to expand/collapse narratives</li>
                  <li>Authentication has 3 scenarios</li>
                  <li>Payment has 4 scenarios</li>
                  <li>User Registration has no narrative</li>
                  <li>Data Pipeline has 2 scenarios</li>
                </ul>
              </div>
            </>
          );
        }}
      </MockPanelProvider>
    );
  },
};

/**
 * Change Detection Test - Interactive story for testing SHA-based change detection
 * Demonstrates how the panel responds to file tree changes and manual refresh
 */
export const ChangeDetectionTest: Story = {
  args: {} as never,
  render: () => {
    const [sha, setSha] = useState('mock-sha-1');
    const [canvasCount, setCanvasCount] = useState(5);
    const [eventLog, setEventLog] = useState<string[]>([]);

    // Generate dynamic file list based on count
    const mockFiles = Array.from({ length: canvasCount }, (_, i) => ({
      name: `canvas-${i + 1}.otel.canvas`,
      relativePath: `.principal-views/canvas-${i + 1}.otel.canvas`,
      path: `.principal-views/canvas-${i + 1}.otel.canvas`,
    }));

    const mockSlices = createMockSlices({ sha, allFiles: mockFiles });

    // Custom events that log activity
    const mockEvents = {
      emit: (event: PanelEvent<unknown>) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${event.type} from ${event.source}`;
        setEventLog((prev) => [logEntry, ...prev].slice(0, 20)); // Keep last 20 events
        console.log(logEntry, event);
      },
      on: () => () => {},
      off: () => {},
    };

    return (
      <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a' }}>
        {/* Panel */}
        <div style={{ flex: 1 }}>
          <MockPanelProvider
            contextOverrides={{
              slices: mockSlices,
              getSlice: <T,>(name: string) => {
                return mockSlices.get(name) as T | undefined;
              },
            }}
            eventsOverride={mockEvents}
          >
            {(props) => <CanvasListPanel {...props} />}
          </MockPanelProvider>
        </div>

        {/* Control Panel */}
        <div
          style={{
            width: 350,
            background: '#1a1a1a',
            padding: 20,
            color: '#fff',
            overflow: 'auto',
            borderLeft: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>
              Change Detection Controls
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>
              Test how the panel responds to file tree SHA changes and manual refresh actions.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setSha(`mock-sha-${Date.now()}`)}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Change SHA (Simulate File Change)
            </button>

            <button
              onClick={() => setCanvasCount((c) => c + 1)}
              style={{
                background: '#16a34a',
                color: 'white',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Add Canvas (+1)
            </button>

            <button
              onClick={() => setCanvasCount((c) => Math.max(0, c - 1))}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Remove Canvas (-1)
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, fontSize: 14 }}>Event Log</h4>
              <button
                onClick={() => setEventLog([])}
                style={{
                  background: '#333',
                  color: '#aaa',
                  border: '1px solid #444',
                  padding: '4px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                Clear
              </button>
            </div>
            <div
              style={{
                flex: 1,
                fontSize: 11,
                fontFamily: 'monospace',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: 6,
                padding: 12,
                overflowY: 'auto',
                minHeight: 0,
              }}
            >
              {eventLog.length === 0 ? (
                <div style={{ color: '#666' }}>No events yet. Try interacting with the panel.</div>
              ) : (
                eventLog.map((log, i) => (
                  <div key={i} style={{ marginBottom: 4, color: '#22c55e' }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5 }}>
            <strong style={{ color: '#aaa' }}>Current State:</strong>
            <div>SHA: {sha.slice(0, 20)}...</div>
            <div>Canvas Count: {canvasCount}</div>
          </div>
        </div>
      </div>
    );
  },
};
