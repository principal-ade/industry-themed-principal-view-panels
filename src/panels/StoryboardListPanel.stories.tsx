import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { StoryboardListPanel } from './StoryboardListPanel';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { PanelEvent } from '../types';
import type { FileTree } from '@principal-ai/repository-abstraction';
import { PathsFileTreeBuilder } from '@principal-ai/repository-abstraction';
import { DynamicFileTree } from '@principal-ade/dynamic-file-tree';

const meta = {
  title: 'Panels/StoryboardListPanel',
  component: StoryboardListPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Lists and manages storyboards using the new discovery system (v0.15.1+). Displays hierarchical storyboard structures with canvases, workflows, and executions.',
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
} satisfies Meta<typeof StoryboardListPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create a static canvas file (documentation/design - .canvas files)
const createStaticCanvasFile = (canvasName: string, withMarkdown: boolean = false) => {
  const files = [
    {
      name: `${canvasName}.canvas`,
      relativePath: `.principal-views/${canvasName}/${canvasName}.canvas`,
      path: `.principal-views/${canvasName}/${canvasName}.canvas`,
      extension: '.canvas',
      size: 1024,
      lastModified: new Date('2024-01-10'),
      isDirectory: false,
    },
  ];

  if (withMarkdown) {
    files.push({
      name: `${canvasName}.md`,
      relativePath: `.principal-views/${canvasName}/${canvasName}.md`,
      path: `.principal-views/${canvasName}/${canvasName}.md`,
      extension: '.md',
      size: 512,
      lastModified: new Date('2024-01-10'),
      isDirectory: false,
    });
  }

  return files;
};

// Helper to create a storyboard file structure
const createStoryboardFiles = (storyboardName: string, workflows: Array<{ name: string; executions: number }> = []) => {
  const files: any[] = [
    {
      name: `${storyboardName}.otel.canvas`,
      relativePath: `.principal-views/${storyboardName}/${storyboardName}.otel.canvas`,
      path: `.principal-views/${storyboardName}/${storyboardName}.otel.canvas`,
      extension: '.canvas',
      size: 1024,
      lastModified: new Date('2024-01-15'),
      isDirectory: false,
    },
  ];

  workflows.forEach(workflow => {
    files.push({
      name: `${workflow.name}.workflow.json`,
      relativePath: `.principal-views/${storyboardName}/${workflow.name}/${workflow.name}.workflow.json`,
      path: `.principal-views/${storyboardName}/${workflow.name}/${workflow.name}.workflow.json`,
      extension: '.json',
      size: 512,
      lastModified: new Date('2024-01-15'),
      isDirectory: false,
    });

    for (let i = 1; i <= workflow.executions; i++) {
      files.push({
        name: `execution-${i}.otel.json`,
        relativePath: `.principal-views/${storyboardName}/${workflow.name}/execution-${i}.otel.json`,
        path: `.principal-views/${storyboardName}/${workflow.name}/execution-${i}.otel.json`,
        extension: '.json',
        size: 2048,
        lastModified: new Date('2024-01-16'),
        isDirectory: false,
      });
    }
  });

  return files;
};

// Build mock file tree with both static and runtime-validated canvas files
const buildMockFileTree = (): FileTree => {
  const allFiles = [
    // Static canvas files (documentation/design - .canvas files, no workflows)
    ...createStaticCanvasFile('architecture', true),        // with markdown
    ...createStaticCanvasFile('system-overview', true),     // with markdown
    ...createStaticCanvasFile('database-design', false),    // without markdown
    ...createStaticCanvasFile('deployment-diagram', false), // without markdown

    // Runtime-validated storyboards (.otel.canvas files with workflows)
    ...createStoryboardFiles('authentication-flow', [
      { name: 'happy-path', executions: 2 },
      { name: 'error-handling', executions: 1 },
    ]),
    ...createStoryboardFiles('payment-processing', [
      { name: 'successful-payment', executions: 3 },
    ]),
    ...createStoryboardFiles('user-registration', [
      { name: 'new-user', executions: 1 },
    ]),
  ];

  // Extract paths from the file objects
  const filePaths = allFiles.map(f => f.path);

  // Use PathsFileTreeBuilder to build proper tree structure
  const builder = new PathsFileTreeBuilder();
  const fileTree = builder.build({ files: filePaths });

  // Merge in the FileInfo details from our mock files
  fileTree.allFiles = allFiles;

  return fileTree;
};

const mockFileTreeWithCanvases: FileTree = buildMockFileTree();

const mockFileTreeEmpty: FileTree = (() => {
  const builder = new PathsFileTreeBuilder();
  return builder.build({ files: [] });
})();

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
            console.log('[Mock readFile] Called with path:', path);

            // Return proper canvas JSON for .canvas and .otel.canvas files
            if (path.endsWith('.canvas') || path.endsWith('.otel.canvas')) {
              const pathParts = path.split('/');
              const canvasName = pathParts[pathParts.length - 2] || 'Mock Canvas';

              // Check if this is a static .canvas file (not .otel.canvas)
              const isStaticCanvas = path.endsWith('.canvas') && !path.endsWith('.otel.canvas');

              // For static canvas files, check if markdown exists
              const markdownPath = isStaticCanvas
                ? `.principal-views/${canvasName}/${canvasName}.md`
                : null;

              // Check if markdown file exists in allFiles (for static canvases only)
              const hasMarkdown = isStaticCanvas && fileTreeData?.allFiles.some(f => f.path === markdownPath);

              const content = JSON.stringify({
                pv: {
                  name: canvasName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  version: '1.0.0',
                  description: `Mock canvas for ${canvasName}`,
                  // Add markdown path for static canvases with markdown files
                  ...(hasMarkdown && { markdown: markdownPath }),
                },
                nodes: [],
                edges: [],
              });
              console.log('[Mock readFile] Returning canvas content for:', canvasName, isStaticCanvas ? '(static)' : '(otel)', hasMarkdown ? 'with markdown' : '');
              return content;
            }

            // Return workflow JSON for .workflow.json files
            if (path.endsWith('.workflow.json')) {
              const workflowName = path.split('/').slice(-2)[0] || 'Mock Workflow';
              const content = JSON.stringify({
                name: workflowName,
                description: `Mock workflow for ${workflowName}`,
                scenarios: [],
              });
              console.log('[Mock readFile] Returning workflow content for:', workflowName);
              return content;
            }

            // Return execution JSON for .otel.json files
            if (path.endsWith('.otel.json')) {
              const content = JSON.stringify({
                events: [],
                metadata: { timestamp: new Date().toISOString() },
              });
              console.log('[Mock readFile] Returning execution content');
              return content;
            }

            console.warn('[Mock readFile] Unknown file type:', path);
            return '{}';
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
 * Default story showing the canvas list panel with both static and runtime-validated canvas files.
 * Use the toggle in the header to switch between:
 * - OTEL: Runtime-validated .otel.canvas files with workflows (authentication-flow, payment-processing, user-registration)
 * - Static: Documentation .canvas files without workflows (architecture, system-overview, database-design, deployment-diagram)
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
        {(props) => <StoryboardListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Debug View - Shows file tree structure alongside the storyboard panel
 * This helps verify the file structure is correct for storyboard discovery
 */
export const DebugWithFileTree: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = createMockSlices(mockFileTreeWithCanvases);

    const DebugContent = () => {
      const { theme } = useTheme();

      return (
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', display: 'flex' }}>
          {/* Left side - File Tree */}
          <div style={{ width: '50%', height: '100%', borderRight: '1px solid #333', padding: '20px', overflow: 'auto' }}>
            <h3 style={{ color: theme.colors.text, marginTop: 0 }}>File Tree Structure</h3>
            <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '16px' }}>
              This shows the actual file structure that the discovery system sees.
              Storyboards require files to be at least 3 levels deep:
              <code style={{ display: 'block', marginTop: '8px', padding: '8px', background: '#1a1a1a', borderRadius: '4px' }}>
                .principal-views/storyboard-name/workflow-name/file.json
              </code>
            </div>
            <DynamicFileTree
              fileTree={mockFileTreeWithCanvases}
              theme={theme}
              selectedFile={undefined}
              onFileSelect={() => {}}
            />
          </div>

          {/* Right side - Storyboard Panel */}
          <div style={{ width: '50%', height: '100%' }}>
            <MockPanelProvider
              contextOverrides={{
                slices: mockSlices,
                getSlice: <T,>(name: string): T | undefined => {
                  return mockSlices.get(name) as T | undefined;
                },
              }}
            >
              {(props) => <StoryboardListPanel {...props} />}
            </MockPanelProvider>
          </div>
        </div>
      );
    };

    return (
      <ThemeProvider>
        <DebugContent />
      </ThemeProvider>
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
        {(props) => <StoryboardListPanel {...props} />}
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
        {(props) => <StoryboardListPanel {...props} />}
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
            <StoryboardListPanel {...props} />
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
 * Single storyboard with one workflow
 */
export const SingleCanvas: Story = {
  args: {} as never,
  render: () => {
    const allFiles = createStoryboardFiles('authentication-flow', [
      { name: 'happy-path', executions: 1 },
    ]);

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-single';
    fileTree.allFiles = allFiles;

    const mockSlices = createMockSlices(fileTree);

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
      >
        {(props) => <StoryboardListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Many storyboards (scrolling behavior)
 */
export const ManyCanvases: Story = {
  args: {} as never,
  render: () => {
    const manyStoryboards = Array.from({ length: 20 }, (_, i) =>
      createStoryboardFiles(`workflow-${i + 1}`, [
        { name: 'scenario-1', executions: 1 },
      ])
    ).flat();

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: manyStoryboards.map(f => f.path) });
    fileTree.sha = 'mock-sha-many';
    fileTree.allFiles = manyStoryboards;

    const mockSlices = createMockSlices(fileTree);

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
      >
        {(props) => <StoryboardListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Monorepo with multiple packages - demonstrates package-aware storyboard discovery
 * Shows storyboard structures from both root and package-level .principal-views/ directories
 */
export const MonorepoWithPackages: Story = {
  args: {} as never,
  render: () => {
    const allFiles = [
      // Root package.json
      {
        name: 'package.json',
        relativePath: 'package.json',
        path: 'package.json',
        extension: '.json',
        size: 512,
        lastModified: new Date('2024-01-15'),
        isDirectory: false,
      },
      // Root storyboard - system-overview
      ...createStoryboardFiles('system-overview', [
        { name: 'integration-test', executions: 2 },
      ]).map(f => ({ ...f, relativePath: f.path, path: f.path })),

      // Core package
      {
        name: 'package.json',
        relativePath: 'packages/core/package.json',
        path: 'packages/core/package.json',
        extension: '.json',
        size: 512,
        lastModified: new Date('2024-01-15'),
        isDirectory: false,
      },
      // Core package storyboards
      ...createStoryboardFiles('authentication-flow', [
        { name: 'happy-path', executions: 2 },
        { name: 'error-handling', executions: 1 },
      ]).map(f => ({
        ...f,
        relativePath: `packages/core/${f.path}`,
        path: `packages/core/${f.path}`
      })),
      ...createStoryboardFiles('data-validation', [
        { name: 'schema-validation', executions: 1 },
      ]).map(f => ({
        ...f,
        relativePath: `packages/core/${f.path}`,
        path: `packages/core/${f.path}`
      })),

      // API package
      {
        name: 'package.json',
        relativePath: 'packages/api/package.json',
        path: 'packages/api/package.json',
        extension: '.json',
        size: 512,
        lastModified: new Date('2024-01-15'),
        isDirectory: false,
      },
      // API package storyboards
      ...createStoryboardFiles('rest-endpoints', [
        { name: 'crud-operations', executions: 3 },
      ]).map(f => ({
        ...f,
        relativePath: `packages/api/${f.path}`,
        path: `packages/api/${f.path}`
      })),
      ...createStoryboardFiles('graphql-schema', [
        { name: 'query-execution', executions: 2 },
      ]).map(f => ({
        ...f,
        relativePath: `packages/api/${f.path}`,
        path: `packages/api/${f.path}`
      })),

      // UI package
      {
        name: 'package.json',
        relativePath: 'packages/ui/package.json',
        path: 'packages/ui/package.json',
        extension: '.json',
        size: 512,
        lastModified: new Date('2024-01-15'),
        isDirectory: false,
      },
      // UI package storyboards
      ...createStoryboardFiles('component-lifecycle', [
        { name: 'mount-unmount', executions: 1 },
      ]).map(f => ({
        ...f,
        relativePath: `packages/ui/${f.path}`,
        path: `packages/ui/${f.path}`
      })),
      ...createStoryboardFiles('user-interactions', [
        { name: 'click-events', executions: 2 },
        { name: 'form-submission', executions: 1 },
      ]).map(f => ({
        ...f,
        relativePath: `packages/ui/${f.path}`,
        path: `packages/ui/${f.path}`
      })),

      // Worker package (nested deeper)
      {
        name: 'package.json',
        relativePath: 'services/background/worker/package.json',
        path: 'services/background/worker/package.json',
        extension: '.json',
        size: 512,
        lastModified: new Date('2024-01-15'),
        isDirectory: false,
      },
      // Worker package storyboards
      ...createStoryboardFiles('job-processing', [
        { name: 'batch-jobs', executions: 2 },
      ]).map(f => ({
        ...f,
        relativePath: `services/background/worker/${f.path}`,
        path: `services/background/worker/${f.path}`
      })),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-monorepo';
    fileTree.allFiles = allFiles;

    const mockSlices = createMockSlices(fileTree);

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
            <StoryboardListPanel {...props} />
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
              <strong>Package-Aware Storyboards:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '11px' }}>
                <li>Storyboards from multiple packages (root, core, api, ui, worker)</li>
                <li>Each storyboard has workflows and executions</li>
                <li>Package badges show which package each storyboard belongs to</li>
                <li>IDs are prefixed (e.g., core/authentication-flow)</li>
                <li>Demonstrates monorepo structure with nested packages</li>
              </ul>
            </div>
          </>
        )}
      </MockPanelProvider>
    );
  },
};

/**
 * With Workflows - Shows storyboards with multiple workflow templates
 * Demonstrates the tree structure with expandable workflows
 */
export const WithNarratives: Story = {
  args: {} as never,
  render: () => {
    const allFiles = [
      // Authentication storyboard with 3 workflows
      ...createStoryboardFiles('authentication-flow', [
        { name: 'auth-scenarios', executions: 0 },
        { name: 'successful-login', executions: 2 },
        { name: 'failed-login', executions: 1 },
      ]),

      // Payment storyboard with 4 workflows
      ...createStoryboardFiles('payment-processing', [
        { name: 'payment-scenarios', executions: 0 },
        { name: 'credit-card', executions: 3 },
        { name: 'payment-declined', executions: 1 },
        { name: 'refund-flow', executions: 2 },
      ]),

      // User registration storyboard (single workflow)
      ...createStoryboardFiles('user-registration', [
        { name: 'new-user', executions: 1 },
      ]),

      // Data pipeline storyboard with 2 workflows
      ...createStoryboardFiles('data-pipeline', [
        { name: 'pipeline-scenarios', executions: 0 },
        { name: 'batch-processing', executions: 2 },
      ]),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-narratives';
    fileTree.allFiles = allFiles;

    const mockFileTreeWithNarratives = fileTree;

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

    // Create custom readFile that returns workflow templates or canvas content
    const mockReadFile = async (path: string) => {
      console.log('[Mock] readFile:', path);

      // Return canvas content for .otel.canvas files
      if (path.endsWith('.otel.canvas')) {
        const canvasName = path.split('/').slice(-2, -1)[0] || 'Mock Canvas';
        return JSON.stringify({
          pv: {
            name: canvasName,
            version: '1.0.0',
            description: `Mock canvas for ${canvasName}`,
          },
          nodes: [],
          edges: [],
        });
      }

      // Extract workflow name from path for creating appropriate mock data
      const workflowName = path.split('/').slice(-2, -1)[0] || 'unknown';
      const storyboardName = path.split('/').slice(-3, -2)[0] || 'unknown';

      // Return workflow templates based on the workflow name
      return JSON.stringify({
        version: '1.0.0',
        name: workflowName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        canvas: `${storyboardName}.otel.canvas`,
        mode: 'flow',
        scenarios: [
          {
            id: `${workflowName}-scenario-1`,
            priority: 1,
            description: `Scenario 1 for ${workflowName}`,
          },
          {
            id: `${workflowName}-scenario-2`,
            priority: 2,
            description: `Scenario 2 for ${workflowName}`,
          },
        ],
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
              <StoryboardListPanel {...props} />
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
                <strong>Workflows Demo:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '11px' }}>
                  <li>Open browser console to see debug logs</li>
                  <li>Click chevrons to expand/collapse workflows</li>
                  <li>Authentication has 3 workflows</li>
                  <li>Payment has 4 workflows</li>
                  <li>User Registration has 1 workflow</li>
                  <li>Data Pipeline has 2 workflows</li>
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
 * Canvas Events Test - Interactive story for testing canvas open events
 * Shows visual feedback for openCanvas events from Storyboard and Workflow clicks
 *
 * Tree Structure:
 * - Storyboard (folder, always expandable)
 *   - Canvas (canvas file - opens canvas editor)
 *   - Workflow 1 (opens canvas detail with workflow)
 *   - Workflow 2 (opens canvas detail with workflow)
 */
export const CanvasEventsTest: Story = {
  args: {} as never,
  render: () => {
    const [eventLog, setEventLog] = useState<Array<{ timestamp: string; action: string; canvasId: string; canvasPath: string; workflowId?: string }>>([]);
    const lastEventRef = React.useRef<{ action: string; canvasId: string; time: number } | null>(null);

    const allFiles = [
      // Authentication storyboard with 3 workflows
      ...createStoryboardFiles('authentication-flow', [
        { name: 'successful-login', executions: 0 },
        { name: 'failed-login', executions: 0 },
        { name: 'oauth-login', executions: 0 },
      ]),

      // Payment storyboard with 2 workflows
      ...createStoryboardFiles('payment-processing', [
        { name: 'credit-card-success', executions: 0 },
        { name: 'payment-declined', executions: 0 },
      ]),

      // User registration storyboard (single workflow)
      ...createStoryboardFiles('user-registration', [
        { name: 'new-user', executions: 0 },
      ]),

      // Data pipeline storyboard with 1 workflow
      ...createStoryboardFiles('data-pipeline', [
        { name: 'batch-processing', executions: 0 },
      ]),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-events-test';
    fileTree.allFiles = allFiles;

    const mockFileTreeWithNarratives = fileTree;

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

    // Create custom readFile that returns workflow templates or canvas content
    const mockReadFile = async (path: string) => {
      console.log('[Mock] readFile:', path);

      // Return canvas content for .otel.canvas files
      if (path.endsWith('.otel.canvas')) {
        const canvasName = path.split('/').slice(-2, -1)[0] || 'Mock Canvas';
        return JSON.stringify({
          pv: {
            name: canvasName,
            version: '1.0.0',
            description: `Mock canvas for ${canvasName}`,
          },
          nodes: [],
          edges: [],
        });
      }

      // Extract workflow name from path for creating appropriate mock data
      const workflowName = path.split('/').slice(-2, -1)[0] || 'unknown';
      const storyboardName = path.split('/').slice(-3, -2)[0] || 'unknown';

      // Return workflow templates
      return JSON.stringify({
        version: '1.0.0',
        name: workflowName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        canvas: `${storyboardName}.otel.canvas`,
        mode: 'flow',
        scenarios: [
          {
            id: `${workflowName}-scenario-1`,
            priority: 1,
            description: `Primary scenario for ${workflowName}`,
          },
        ],
      });
    };

    // Custom events that log both selectCanvas and openCanvas activity (with deduplication)
    const mockEvents = {
      emit: (event: PanelEvent<unknown>) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Event:`, event);

        // Check if this is a canvas-related event
        if (event.type === 'custom' && event.payload && typeof event.payload === 'object') {
          const payload = event.payload as { action?: string; canvasId?: string; canvas?: { path?: string }; workflowId?: string };
          if (payload.action === 'openCanvas' || payload.action === 'selectCanvas') {
            const now = Date.now();
            const lastEvent = lastEventRef.current;

            // Deduplicate events: ignore if same action+canvasId within 100ms
            if (
              lastEvent &&
              lastEvent.action === payload.action &&
              lastEvent.canvasId === payload.canvasId &&
              now - lastEvent.time < 100
            ) {
              console.log(`[${timestamp}] Duplicate event ignored`);
              return;
            }

            // Update last event tracking
            lastEventRef.current = {
              action: payload.action,
              canvasId: payload.canvasId || 'unknown',
              time: now,
            };

            setEventLog((prev) => [
              {
                timestamp,
                action: payload.action || 'unknown',
                canvasId: payload.canvasId || 'unknown',
                canvasPath: payload.canvas?.path || 'unknown',
                workflowId: payload.workflowId,
              },
              ...prev,
            ].slice(0, 10)); // Keep last 10 events
          }
        }
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
            actionsOverrides={{
              readFile: mockReadFile,
            }}
            eventsOverride={mockEvents}
          >
            {(props) => <StoryboardListPanel {...props} />}
          </MockPanelProvider>
        </div>

        {/* Event Log Panel */}
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
              Storyboard Events Monitor
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>
              All storyboards have a tree structure with Canvas and Workflow children. Click nodes to trigger events:
            </p>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, fontSize: 11, color: '#888', lineHeight: 1.6 }}>
              <li><span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Canvas</span> (yellow) - Opens canvas editor</li>
              <li><span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Workflow</span> (purple) - Opens canvas detail view with workflow scenarios</li>
            </ul>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, fontSize: 14 }}>Canvas Events</h4>
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
                <div style={{ color: '#666' }}>
                  No events yet. Expand a storyboard and click Canvas or Workflow to test.
                </div>
              ) : (
                eventLog.map((log, i) => {
                  // Color code based on whether it's a workflow (purple) or canvas (yellow)
                  const isWorkflow = !!log.workflowId;
                  const bgColor = isWorkflow ? '#8b5cf620' : '#f59e0b20';
                  const borderColor = isWorkflow ? '#8b5cf6' : '#f59e0b';
                  const textColor = isWorkflow ? '#a78bfa' : '#fbbf24';
                  const nodeType = isWorkflow ? 'Workflow' : 'Canvas';

                  return (
                    <div
                      key={i}
                      style={{
                        marginBottom: 12,
                        padding: 8,
                        background: bgColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: 4,
                      }}
                    >
                      <div style={{ color: textColor, marginBottom: 4, fontWeight: 'bold' }}>
                        [{log.timestamp}] {nodeType} clicked
                      </div>
                      <div style={{ color: '#aaa', fontSize: 10 }}>
                        Canvas ID: {log.canvasId}
                      </div>
                      <div style={{ color: '#aaa', fontSize: 10 }}>
                        Path: {log.canvasPath}
                      </div>
                      {log.workflowId && (
                        <div style={{ color: '#fbbf24', fontSize: 10, marginTop: 4 }}>
                          Workflow ID: {log.workflowId}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5, padding: 8, background: '#0a0a0a', borderRadius: 4, border: '1px solid #333' }}>
            <strong style={{ color: '#aaa' }}>How to Test:</strong>
            <ol style={{ margin: '8px 0 0 0', paddingLeft: 16, lineHeight: 1.8 }}>
              <li><strong>Click storyboard dropdown</strong> → expands to show children</li>
              <li><strong>Click Canvas</strong> → see <span style={{ color: '#fbbf24' }}>yellow</span> event (opens canvas editor)</li>
              <li><strong>Click Workflow</strong> → see <span style={{ color: '#a78bfa' }}>purple</span> event (opens canvas detail with workflow)</li>
            </ol>
            <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', border: '1px solid #444', borderRadius: 4 }}>
              <strong style={{ color: '#aaa' }}>Tree Structure:</strong>
              <div style={{ marginTop: 4, fontSize: 10, lineHeight: 1.6 }}>
                All storyboards are folders with:<br/>
                • <span style={{ color: '#fbbf24' }}>Canvas</span> - Opens canvas editor<br/>
                • <span style={{ color: '#a78bfa' }}>Workflows</span> - Opens canvas detail with workflow scenarios
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Storyboards Without Workflows - Test case for bug fix #CORE-201
 * Previously, storyboards without workflows were not displayed due to a bug in CanvasDiscovery.
 * This story verifies that storyboards without workflows are now properly discovered and shown.
 *
 * According to the design spec (STORYBOARD_DISCOVERY_DESIGN.md), workflows are optional (0 or more).
 * The bug was at CanvasDiscovery.ts:201-202 which incorrectly skipped storyboards with no workflows.
 */
export const StoryboardsWithoutWorkflows: Story = {
  args: {} as never,
  render: () => {
    const allFiles = [
      // Storyboard with workflows (control group - should work)
      ...createStoryboardFiles('payment-flow', [
        { name: 'successful-payment', executions: 2 },
      ]),

      // Storyboards WITHOUT workflows (test group - these should now appear after fix)
      ...createStoryboardFiles('architecture-overview', []),
      ...createStoryboardFiles('system-design', []),
      ...createStoryboardFiles('data-model', []),
      ...createStoryboardFiles('api-endpoints', []),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-no-workflows';
    fileTree.allFiles = allFiles;

    const mockSlices = createMockSlices(fileTree);

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
            <StoryboardListPanel {...props} />
            <div
              style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: '#1a1a1a',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                fontSize: '12px',
                maxWidth: '340px',
              }}
            >
              <strong style={{ color: '#f59e0b' }}>Bug Fix Verification (v0.15.3):</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '11px', lineHeight: 1.6 }}>
                <li><strong>Expected:</strong> 5 storyboards should be visible</li>
                <li><strong>payment-flow:</strong> Has workflows (control)</li>
                <li><strong>4 others:</strong> NO workflows (previously hidden)</li>
                <li><strong>Fix:</strong> Removed lines 201-202 from CanvasDiscovery.ts that incorrectly skipped storyboards without workflows</li>
              </ul>
              <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', border: '1px solid #f59e0b', borderRadius: 4, fontSize: 10 }}>
                ⚠️ <strong>Before fix:</strong> Only "payment-flow" visible (1/5)<br/>
                ✅ <strong>After fix:</strong> All 5 storyboards visible
              </div>
            </div>
          </>
        )}
      </MockPanelProvider>
    );
  },
};

/**
 * With Markdown Documentation - Test case for markdown overview nodes
 * Verifies that canvases with pv.markdown field show Overview nodes in the tree.
 * This tests the fix for includeContent: true in useCanvasData hook.
 *
 * Expected behavior:
 * - Canvases WITH pv.markdown should show an Overview child node
 * - Canvases WITHOUT pv.markdown should NOT show an Overview node
 * - Overview nodes should appear before workflows in the tree
 */
export const WithMarkdownDocumentation: Story = {
  args: {} as never,
  render: () => {
    const allFiles = [
      // Storyboard WITH markdown documentation
      ...createStoryboardFiles('authentication-flow', [
        { name: 'login-workflow', executions: 2 },
        { name: 'logout-workflow', executions: 1 },
      ]),

      // Storyboard WITH markdown documentation
      ...createStoryboardFiles('payment-processing', [
        { name: 'payment-workflow', executions: 1 },
      ]),

      // Storyboard WITHOUT markdown documentation (control)
      ...createStoryboardFiles('legacy-feature', [
        { name: 'legacy-workflow', executions: 0 },
      ]),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-markdown';
    fileTree.allFiles = allFiles;

    // Custom mock slices with readFile that includes markdown paths
    const mockSlices = new Map([
      [
        'fileTree',
        {
          scope: 'repository' as const,
          name: 'fileTree',
          data: fileTree,
          loading: false,
          error: null,
          refresh: async () => {},
        },
      ],
    ]);

    // Custom readFile that returns canvas JSON with pv.markdown for some canvases
    const mockReadFile = async (path: string) => {
      console.log('[Mock readFile] Called with path:', path);

      // Return proper canvas JSON for .otel.canvas files
      if (path.endsWith('.otel.canvas')) {
        const storyboardName = path.split('/').slice(-2, -1)[0] || 'Mock Canvas';

        // Add markdown path for authentication-flow and payment-processing, but NOT legacy-feature
        const hasMarkdown = storyboardName === 'authentication-flow' || storyboardName === 'payment-processing';

        const content = JSON.stringify({
          pv: {
            name: storyboardName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            version: '1.0.0',
            description: `Mock canvas for ${storyboardName}`,
            // Include markdown path for some canvases
            ...(hasMarkdown && { markdown: `.principal-views/${storyboardName}/${storyboardName}.md` }),
          },
          nodes: [],
          edges: [],
        });
        console.log('[Mock readFile] Returning canvas content for:', storyboardName, hasMarkdown ? 'WITH markdown' : 'WITHOUT markdown');
        return content;
      }

      // Return workflow JSON for .workflow.json files
      if (path.endsWith('.workflow.json')) {
        const workflowName = path.split('/').slice(-2, -1)[0] || 'Mock Workflow';
        const content = JSON.stringify({
          name: workflowName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `Mock workflow for ${workflowName}`,
          scenarios: [],
        });
        console.log('[Mock readFile] Returning workflow content for:', workflowName);
        return content;
      }

      // Return execution JSON for .otel.json files
      if (path.endsWith('.otel.json')) {
        const content = JSON.stringify({
          events: [],
          metadata: { timestamp: new Date().toISOString() },
        });
        console.log('[Mock readFile] Returning execution content');
        return content;
      }

      console.warn('[Mock readFile] Unknown file type:', path);
      return '{}';
    };

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
        actionsOverrides={{
          readFile: mockReadFile,
        }}
      >
        {(props) => (
          <>
            <StoryboardListPanel {...props} />
            <div
              style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: '#1a1a1a',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                fontSize: '12px',
                maxWidth: '360px',
              }}
            >
              <strong style={{ color: '#3b82f6' }}>Markdown Documentation Test:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '11px', lineHeight: 1.6 }}>
                <li><strong>authentication-flow:</strong> Has Overview node ✓ (has pv.markdown)</li>
                <li><strong>payment-processing:</strong> Has Overview node ✓ (has pv.markdown)</li>
                <li><strong>legacy-feature:</strong> NO Overview node (missing pv.markdown)</li>
                <li>Expand storyboards to verify Overview nodes appear with <span style={{ color: '#3b82f6' }}>📖 BookOpen</span> icon</li>
                <li>Overview should appear BEFORE workflows in the tree</li>
              </ul>
              <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', border: '1px solid #3b82f6', borderRadius: 4, fontSize: 10 }}>
                <strong style={{ color: '#3b82f6' }}>Fix:</strong> useCanvasData now uses includeContent: true to parse canvas JSON and extract pv.markdown field
              </div>
            </div>
          </>
        )}
      </MockPanelProvider>
    );
  },
};

/**
 * With Coverage Indicators - Demonstrates workflow test coverage checkmarks
 * Shows green checkmarks next to workflows where ALL scenarios have test traces
 */
export const WithCoverageIndicators: Story = {
  args: {} as never,
  render: () => {
    const allFiles = [
      // Storyboard with FULL test coverage (all scenarios in all workflows have test traces)
      ...createStoryboardFiles('authentication-flow', [
        { name: 'successful-login', executions: 2 },      // 2 scenarios, 2 traces - FULL coverage ✓
        { name: 'failed-login', executions: 2 },          // 2 scenarios, 2 traces - FULL coverage ✓
        { name: 'password-reset', executions: 2 },        // 2 scenarios, 2 traces - FULL coverage ✓
      ]),

      // Storyboard with PARTIAL test coverage (some workflows fully covered, some not)
      ...createStoryboardFiles('payment-processing', [
        { name: 'credit-card-success', executions: 2 },   // 2 scenarios, 2 traces - FULL coverage ✓
        { name: 'payment-declined', executions: 1 },      // 2 scenarios, 1 trace - PARTIAL coverage (no checkmark)
      ]),

      // Storyboard with NO test coverage
      ...createStoryboardFiles('user-registration', [
        { name: 'new-user-signup', executions: 0 },       // 2 scenarios, 0 traces - NO coverage
        { name: 'email-verification', executions: 0 },    // 2 scenarios, 0 traces - NO coverage
      ]),

      // Single workflow WITH full coverage
      ...createStoryboardFiles('data-pipeline', [
        { name: 'batch-processing', executions: 2 },      // 2 scenarios, 2 traces - FULL coverage ✓
      ]),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-coverage';
    fileTree.allFiles = allFiles;

    // Create mock slices with custom readFile that returns workflow templates with scenarios
    const mockSlices = new Map([
      [
        'fileTree',
        {
          scope: 'repository' as const,
          name: 'fileTree',
          data: fileTree,
          loading: false,
          error: null,
          refresh: async () => {},
        },
      ],
    ]);

    // Custom readFile that returns workflow templates with 2 scenarios each
    const mockReadFile = async (path: string) => {
      // Return canvas content for .otel.canvas files
      if (path.endsWith('.otel.canvas')) {
        const storyboardName = path.split('/').slice(-2, -1)[0] || 'Mock Canvas';
        return JSON.stringify({
          pv: {
            name: storyboardName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            version: '1.0.0',
            description: `Mock canvas for ${storyboardName}`,
          },
          nodes: [],
          edges: [],
        });
      }

      // Return workflow templates with 2 scenarios each
      if (path.endsWith('.workflow.json')) {
        const workflowName = path.split('/').slice(-2, -1)[0] || 'unknown';
        const storyboardName = path.split('/').slice(-3, -2)[0] || 'unknown';

        return JSON.stringify({
          version: '1.0.0',
          name: workflowName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          canvas: `${storyboardName}.otel.canvas`,
          mode: 'flow',
          scenarios: [
            {
              id: `${workflowName}-scenario-1`,
              priority: 1,
              description: `Primary scenario for ${workflowName}`,
            },
            {
              id: `${workflowName}-scenario-2`,
              priority: 2,
              description: `Secondary scenario for ${workflowName}`,
            },
          ],
        });
      }

      // Return execution JSON for .otel.json files
      if (path.endsWith('.otel.json')) {
        return JSON.stringify({
          events: [],
          metadata: { timestamp: new Date().toISOString() },
        });
      }

      return '{}';
    };

    const testTraceFiles = allFiles.filter(f => f.path.includes('.otel.json'));

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): T | undefined => {
            return mockSlices.get(name) as T | undefined;
          },
        }}
        actionsOverrides={{
          readFile: mockReadFile,
        }}
      >
        {(props) => (
          <>
            <StoryboardListPanel {...props} />
            <div
              style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: '#1a1a1a',
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                fontSize: '12px',
                maxWidth: '360px',
              }}
            >
              <strong style={{ color: '#10b981' }}>Full Scenario Coverage:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '11px', lineHeight: 1.6 }}>
                <li><span style={{ color: '#10b981' }}>✓</span> Green checkmark = ALL scenarios have test traces</li>
                <li>No checkmark = Missing coverage for some scenarios</li>
              </ul>
              <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', border: '1px solid #10b981', borderRadius: 4, fontSize: 10 }}>
                <strong>Expected Results (each workflow has 2 scenarios):</strong><br/>
                • authentication-flow: All 3 workflows ✓ (2/2 scenarios covered each)<br/>
                • payment-processing: credit-card-success ✓ (2/2), payment-declined ✗ (1/2)<br/>
                • user-registration: No checkmarks (0/2 scenarios covered each)<br/>
                • data-pipeline: batch-processing ✓ (2/2)
                <br/><br/>
                <strong>Test traces:</strong> {testTraceFiles.length} files
              </div>
            </div>
          </>
        )}
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

    // Generate dynamic storyboard list based on count
    const mockFiles = Array.from({ length: canvasCount }, (_, i) =>
      createStoryboardFiles(`storyboard-${i + 1}`, [
        { name: 'workflow-1', executions: 1 },
      ])
    ).flat();

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: mockFiles.map(f => f.path) });
    fileTree.sha = sha;
    fileTree.allFiles = mockFiles;

    const mockSlices = createMockSlices(fileTree);

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
            {(props) => <StoryboardListPanel {...props} />}
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
              Add Storyboard (+1)
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
              Remove Storyboard (-1)
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
            <div>Storyboard Count: {canvasCount}</div>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Git Status Badges
 * Shows git change indicators on canvas, workflow, and overview files
 */
export const WithGitStatusBadges: Story = {
  args: {} as never,
  render: () => {
    const allFiles = [
      // Modified storyboard (OTEL canvas modified)
      ...createStoryboardFiles('authentication-flow', [
        { name: 'login-flow', executions: 2 },
        { name: 'logout-flow', executions: 1 },
      ]),

      // Added storyboard (new OTEL canvas, staged)
      ...createStoryboardFiles('payment-processing', [
        { name: 'checkout', executions: 0 },
      ]),

      // Storyboard with modified workflow
      ...createStoryboardFiles('user-management', [
        { name: 'create-user', executions: 1 },
        { name: 'delete-user', executions: 0 },
      ]),

      // Static canvases (some modified, some with markdown)
      ...createStaticCanvasFile('api-design', true),
      ...createStaticCanvasFile('database-schema', false),
      ...createStaticCanvasFile('new-feature', true),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-git-status';
    fileTree.allFiles = allFiles;

    // Create git status data matching some of the files
    const gitStatusData = {
      repoPath: '/Users/developer/my-project',
      branch: 'feature/add-git-badges',
      isDirty: true,
      hasUntracked: true,
      hasStaged: true,
      ahead: 3,
      behind: 0,
      watchingEnabled: true,
      lastChangedAt: new Date().toISOString(),

      // Modified files (M - shows blue edit icon)
      modifiedFiles: [
        '.principal-views/authentication-flow/authentication-flow.otel.canvas',
        '.principal-views/api-design/api-design.md',
      ],

      // Staged/Added files (A - shows green plus icon)
      stagedFiles: [
        '.principal-views/payment-processing/payment-processing.otel.canvas',
        '.principal-views/new-feature/new-feature.canvas',
      ],

      // Untracked files (?? - shows gray question mark icon)
      untrackedFiles: [
        '.principal-views/user-management/delete-user/delete-user.workflow.json',
      ],

      // Deleted files (D - shows red minus icon)
      deletedFiles: [
        '.principal-views/database-schema/database-schema.canvas',
      ],

      createdFiles: [],
      hash: 'git-status-mock',
    };

    const mockSlices = createMockSlices(fileTree);

    // Add git status slice
    mockSlices.set('git', {
      scope: 'repository' as const,
      name: 'git',
      data: gitStatusData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <div style={{ display: 'flex', height: '100vh', gap: 16, padding: 16 }}>
        <div style={{ flex: 1 }}>
          <MockPanelProvider
            contextOverrides={{
              slices: mockSlices,
              getSlice: <T,>(name: string): T | undefined => {
                return mockSlices.get(name) as T | undefined;
              },
            }}
          >
            {(props) => <StoryboardListPanel {...props} />}
          </MockPanelProvider>
        </div>

        <div style={{
          width: 320,
          padding: 16,
          background: '#1a1a1a',
          borderRadius: 8,
          fontSize: 13,
          lineHeight: 1.6,
          color: '#aaa',
          overflowY: 'auto',
        }}>
          <h3 style={{ color: '#fff', marginTop: 0, fontSize: 14, marginBottom: 12 }}>Git Status Legend</h3>

          <div style={{ marginBottom: 16 }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Modified (M)</strong>
            <div style={{ color: '#3b82f6', marginBottom: 4 }}>• authentication-flow.otel.canvas</div>
            <div style={{ color: '#3b82f6' }}>• api-design.md (Overview)</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Added/Staged (A)</strong>
            <div style={{ color: '#28a745', marginBottom: 4 }}>• payment-processing.otel.canvas</div>
            <div style={{ color: '#28a745' }}>• new-feature.canvas</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Untracked (??)</strong>
            <div style={{ color: '#6c757d' }}>• delete-user.workflow.json</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Deleted (D)</strong>
            <div style={{ color: '#dc3545' }}>• database-schema.canvas</div>
          </div>

          <div style={{ borderTop: '1px solid #333', paddingTop: 12, marginTop: 16 }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Branch Info</strong>
            <div>Branch: feature/add-git-badges</div>
            <div>Ahead: 3 commits</div>
            <div>Status: Dirty</div>
          </div>

          <div style={{ borderTop: '1px solid #333', paddingTop: 12, marginTop: 16, fontSize: 12 }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Icon Reference</strong>
            <div>📝 Edit icon = Modified</div>
            <div>➕ Plus icon = Added</div>
            <div>❓ Question icon = Untracked</div>
            <div>➖ Minus icon = Deleted</div>
          </div>
        </div>
      </div>
    );
  },
};
