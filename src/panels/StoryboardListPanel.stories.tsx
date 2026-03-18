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

// Helper to create mock fileTree slice
const createMockFileTreeSlice = (fileTreeData: FileTree | null, loading = false) => ({
  scope: 'repository' as const,
  name: 'fileTree',
  data: fileTreeData,
  loading,
  error: null,
  refresh: async () => {},
});

// Helper to create mock readFile action
const createMockReadFile = (fileTreeData: FileTree | null) => async (path: string) => {
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
    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: createMockFileTreeSlice(mockFileTreeWithCanvases),
        }}
        actionsOverrides={{
          readFile: createMockReadFile(mockFileTreeWithCanvases),
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
                fileTree: createMockFileTreeSlice(mockFileTreeWithCanvases),
              }}
              actionsOverrides={{
                readFile: createMockReadFile(mockFileTreeWithCanvases),
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
    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: createMockFileTreeSlice(null, true),
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
    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: createMockFileTreeSlice(mockFileTreeEmpty),
        }}
        actionsOverrides={{
          readFile: createMockReadFile(mockFileTreeEmpty),
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
    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: createMockFileTreeSlice(mockFileTreeWithCanvases),
        }}
        actionsOverrides={{
          readFile: createMockReadFile(mockFileTreeWithCanvases),
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

    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: createMockFileTreeSlice(fileTree),
        }}
        actionsOverrides={{
          readFile: createMockReadFile(fileTree),
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

    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: createMockFileTreeSlice(fileTree),
        }}
        actionsOverrides={{
          readFile: createMockReadFile(fileTree),
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

    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: createMockFileTreeSlice(fileTree),
        }}
        actionsOverrides={{
          readFile: createMockReadFile(fileTree),
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
          fileTree: createMockFileTreeSlice(mockFileTreeWithNarratives),
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
              fileTree: createMockFileTreeSlice(mockFileTreeWithNarratives),
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

    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: createMockFileTreeSlice(fileTree),
        }}
        actionsOverrides={{
          readFile: createMockReadFile(fileTree),
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
          fileTree: createMockFileTreeSlice(fileTree),
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
          fileTree: createMockFileTreeSlice(fileTree),
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
 * With Implementation Status Bars - Demonstrates node implementation status visualization
 * Shows status bars on canvas nodes indicating draft/approved/implemented node counts
 */
export const WithImplementationStatus: Story = {
  args: {} as never,
  render: () => {
    const allFiles = [
      // Storyboard with ALL implemented nodes (green name)
      ...createStoryboardFiles('checkout-flow', [
        { name: 'complete-purchase', executions: 2 },
      ]),

      // Storyboard with mixed implementation status (gray - has draft)
      ...createStoryboardFiles('user-onboarding', [
        { name: 'signup-flow', executions: 1 },
        { name: 'profile-setup', executions: 0 },
      ]),

      // Storyboard with mostly draft nodes (gray)
      ...createStoryboardFiles('analytics-pipeline', [
        { name: 'data-ingestion', executions: 0 },
      ]),

      // Storyboard with all approved (amber name)
      ...createStoryboardFiles('notification-system', [
        { name: 'email-notifications', executions: 1 },
      ]),

      // Storyboard with implemented + approved, no draft (amber name)
      ...createStoryboardFiles('payment-gateway', [
        { name: 'process-payment', executions: 2 },
      ]),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-impl-status';
    fileTree.allFiles = allFiles;

    // Helper to create nodes with different statuses
    const createNodesWithStatus = (
      implemented: number,
      approved: number,
      draft: number
    ) => {
      const nodes: Array<{
        id: string;
        type: string;
        x: number;
        y: number;
        width: number;
        height: number;
        text: string;
        pv: { status: 'implemented' | 'approved' | 'draft'; name: string };
      }> = [];
      let id = 1;
      let y = 0;

      for (let i = 0; i < implemented; i++) {
        nodes.push({
          id: `node-${id++}`,
          type: 'text',
          x: 0,
          y: y += 100,
          width: 200,
          height: 80,
          text: `Implemented Node ${i + 1}`,
          otel: { status: 'implemented' },
        });
      }
      for (let i = 0; i < approved; i++) {
        nodes.push({
          id: `node-${id++}`,
          type: 'text',
          x: 0,
          y: y += 100,
          width: 200,
          height: 80,
          text: `Approved Node ${i + 1}`,
          otel: { status: 'approved' },
        });
      }
      for (let i = 0; i < draft; i++) {
        nodes.push({
          id: `node-${id++}`,
          type: 'text',
          x: 0,
          y: y += 100,
          width: 200,
          height: 80,
          text: `Draft Node ${i + 1}`,
          otel: { status: 'draft' },
        });
      }
      return nodes;
    };

    // Custom readFile that returns canvas content with otel.status on nodes
    const mockReadFile = async (path: string) => {
      if (path.endsWith('.otel.canvas')) {
        const storyboardName = path.split('/').slice(-2, -1)[0] || 'Mock Canvas';
        let nodes: ReturnType<typeof createNodesWithStatus> = [];

        // Different status distributions per storyboard
        if (storyboardName === 'checkout-flow') {
          nodes = createNodesWithStatus(10, 0, 0); // ALL implemented → green name
        } else if (storyboardName === 'user-onboarding') {
          nodes = createNodesWithStatus(3, 4, 3); // Mixed with draft → gray name
        } else if (storyboardName === 'analytics-pipeline') {
          nodes = createNodesWithStatus(1, 2, 7); // Mostly draft → gray name
        } else if (storyboardName === 'notification-system') {
          nodes = createNodesWithStatus(0, 6, 0); // All approved → amber name
        } else if (storyboardName === 'payment-gateway') {
          nodes = createNodesWithStatus(5, 3, 0); // Implemented + approved, no draft → amber name
        }

        return JSON.stringify({
          pv: {
            name: storyboardName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            version: '1.0.0',
            description: `Canvas for ${storyboardName}`,
          },
          nodes,
          edges: [],
        });
      }

      if (path.endsWith('.workflow.json')) {
        const workflowName = path.split('/').slice(-2, -1)[0] || 'unknown';
        const storyboardName = path.split('/').slice(-3, -2)[0] || 'unknown';

        return JSON.stringify({
          version: '1.0.0',
          name: workflowName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          canvas: `${storyboardName}.otel.canvas`,
          mode: 'flow',
          scenarios: [
            { id: `${workflowName}-scenario-1`, priority: 1, description: `Scenario 1` },
            { id: `${workflowName}-scenario-2`, priority: 2, description: `Scenario 2` },
          ],
        });
      }

      if (path.endsWith('.otel.json')) {
        return JSON.stringify({ events: [], metadata: { timestamp: new Date().toISOString() } });
      }

      return '{}';
    };

    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: createMockFileTreeSlice(fileTree),
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
                maxWidth: '380px',
              }}
            >
              <strong style={{ color: '#10b981' }}>Implementation Status:</strong>
              <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11 }}>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#10b981', borderRadius: 2 }} /> Implemented</span>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2 }} /> Approved</span>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#6b7280', borderRadius: 2 }} /> Draft</span>
              </div>
              <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', border: '1px solid #333', borderRadius: 4, fontSize: 10 }}>
                <strong>Storyboard Name Colors:</strong><br/>
                • <span style={{ color: '#10b981' }}>Green</span> = All nodes implemented<br/>
                • <span style={{ color: '#f59e0b' }}>Amber</span> = Has approved, no draft<br/>
                • <span style={{ color: '#9ca3af' }}>Gray</span> = Has draft nodes
              </div>
              <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', border: '1px solid #333', borderRadius: 4, fontSize: 10 }}>
                <strong>Expected Results:</strong><br/>
                • <span style={{ color: '#10b981' }}>checkout-flow</span>: 10 impl, 0 approved, 0 draft (green - all implemented)<br/>
                • <span style={{ color: '#9ca3af' }}>user-onboarding</span>: 3 impl, 4 approved, 3 draft (gray - has draft)<br/>
                • <span style={{ color: '#9ca3af' }}>analytics-pipeline</span>: 1 impl, 2 approved, 7 draft (gray - has draft)<br/>
                • <span style={{ color: '#f59e0b' }}>notification-system</span>: 0 impl, 6 approved, 0 draft (amber - all approved)<br/>
                • <span style={{ color: '#f59e0b' }}>payment-gateway</span>: 5 impl, 3 approved, 0 draft (amber - no draft)
              </div>
            </div>
          </>
        )}
      </MockPanelProvider>
    );
  },
};

/**
 * Text Nodes Without OTEL Extension - Verifies that label/title nodes are NOT counted
 * in implementation status. Text nodes used as visual labels should be skipped
 * because they don't have otel extensions (they're not functional nodes).
 *
 * This tests the fix for: nodes without otel extension were being counted as 'draft'
 */
export const TextNodesWithoutOtelExtension: Story = {
  args: {} as never,
  render: () => {
    const allFiles = [
      // Storyboard with title node (no pv) + functional nodes
      ...createStoryboardFiles('with-title-label', [
        { name: 'main-flow', executions: 1 },
      ]),

      // Storyboard without any title nodes (baseline comparison)
      ...createStoryboardFiles('no-title-label', [
        { name: 'simple-flow', executions: 1 },
      ]),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-text-nodes';
    fileTree.allFiles = allFiles;

    // Custom readFile that returns canvas with text nodes WITHOUT otel extension
    const mockReadFile = async (path: string) => {
      if (path.endsWith('.otel.canvas')) {
        const storyboardName = path.split('/').slice(-2, -1)[0] || 'Mock Canvas';

        if (storyboardName === 'with-title-label') {
          // Canvas with:
          // - 1 title text node WITHOUT otel extension (should NOT be counted)
          // - 3 functional nodes with otel.status: implemented
          return JSON.stringify({
            pv: {
              name: 'With Title Label',
              version: '1.0.0',
              description: 'Canvas with a title label node that has no otel extension',
            },
            nodes: [
              // Title node - NO otel extension, should be SKIPPED
              {
                id: 'title',
                type: 'text',
                x: 250,
                y: -50,
                width: 400,
                height: 50,
                color: '#64748B',
                text: '# Flow Title\n**This is a label node without otel**',
              },
              // Functional nodes WITH otel extension
              {
                id: 'node-1',
                type: 'otel-event',
                x: 100,
                y: 50,
                width: 200,
                height: 80,
                label: 'Request Received',
                otel: { status: 'implemented' },
              },
              {
                id: 'node-2',
                type: 'otel-event',
                x: 100,
                y: 150,
                width: 200,
                height: 80,
                label: 'Process Data',
                otel: { status: 'implemented' },
              },
              {
                id: 'node-3',
                type: 'otel-event',
                x: 100,
                y: 250,
                width: 200,
                height: 80,
                label: 'Send Response',
                otel: { status: 'implemented' },
              },
            ],
            edges: [],
          });
        } else if (storyboardName === 'no-title-label') {
          // Baseline: Same 3 functional nodes, no title node
          return JSON.stringify({
            pv: {
              name: 'No Title Label',
              version: '1.0.0',
              description: 'Canvas without any title label nodes',
            },
            nodes: [
              {
                id: 'node-1',
                type: 'otel-event',
                x: 100,
                y: 50,
                width: 200,
                height: 80,
                label: 'Request Received',
                otel: { status: 'implemented' },
              },
              {
                id: 'node-2',
                type: 'otel-event',
                x: 100,
                y: 150,
                width: 200,
                height: 80,
                label: 'Process Data',
                otel: { status: 'implemented' },
              },
              {
                id: 'node-3',
                type: 'otel-event',
                x: 100,
                y: 250,
                width: 200,
                height: 80,
                label: 'Send Response',
                otel: { status: 'implemented' },
              },
            ],
            edges: [],
          });
        }

        return JSON.stringify({
          pv: { name: storyboardName, version: '1.0.0' },
          nodes: [],
          edges: [],
        });
      }

      if (path.endsWith('.workflow.json')) {
        const workflowName = path.split('/').slice(-2, -1)[0] || 'unknown';
        const storyboardName = path.split('/').slice(-3, -2)[0] || 'unknown';

        return JSON.stringify({
          version: '1.0.0',
          name: workflowName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          canvas: `${storyboardName}.otel.canvas`,
          mode: 'flow',
          scenarios: [{ id: `${workflowName}-scenario-1`, priority: 1, description: 'Scenario 1' }],
        });
      }

      if (path.endsWith('.otel.json')) {
        return JSON.stringify({ events: [], metadata: { timestamp: new Date().toISOString() } });
      }

      return '{}';
    };

    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: createMockFileTreeSlice(fileTree),
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
                maxWidth: '420px',
              }}
            >
              <strong style={{ color: '#3b82f6' }}>Text Nodes Without PV Extension Test:</strong>
              <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', border: '1px solid #333', borderRadius: 4, fontSize: 10 }}>
                <strong>Bug Fix Being Tested:</strong><br/>
                Text nodes used as labels/titles (without <code>pv</code> extension) should NOT be counted in implementation status.
                Previously, they defaulted to 'draft' and inflated the draft count.
              </div>
              <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', border: '1px solid #333', borderRadius: 4, fontSize: 10 }}>
                <strong>Expected Results (BOTH should be green - all implemented):</strong><br/>
                • <span style={{ color: '#10b981' }}>with-title-label</span>: 3 impl, 0 approved, 0 draft<br/>
                <span style={{ marginLeft: 12, color: '#6b7280' }}>(title node WITHOUT pv is skipped)</span><br/>
                • <span style={{ color: '#10b981' }}>no-title-label</span>: 3 impl, 0 approved, 0 draft<br/>
                <span style={{ marginLeft: 12, color: '#6b7280' }}>(baseline: no title node)</span>
              </div>
              <div style={{ marginTop: 8, padding: 8, background: '#0a0a0a', border: '1px solid #dc2626', borderRadius: 4, fontSize: 10 }}>
                <strong style={{ color: '#dc2626' }}>If Bug Exists:</strong><br/>
                • <span style={{ color: '#9ca3af' }}>with-title-label</span>: 3 impl, 0 approved, <strong>1 draft</strong><br/>
                <span style={{ marginLeft: 12, color: '#6b7280' }}>(title node incorrectly counted as draft)</span>
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
              fileTree: createMockFileTreeSlice(fileTree),
            }}
            actionsOverrides={{
              readFile: createMockReadFile(fileTree),
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
 * Git Status Filtering Test
 * Demonstrates that the panel only re-renders when relevant files change.
 * Unrelated git changes (src/, package.json, etc.) should NOT trigger re-renders.
 */
export const GitStatusFiltering: Story = {
  args: {} as never,
  render: () => {
    const [renderCount, setRenderCount] = useState(0);
    const [gitStatus, setGitStatus] = useState({
      repoPath: '/test',
      branch: 'main',
      isDirty: false,
      hasUntracked: false,
      hasStaged: false,
      ahead: 0,
      behind: 0,
      watchingEnabled: true,
      modifiedFiles: [] as string[],
      untrackedFiles: [] as string[],
      stagedFiles: [] as string[],
      deletedFiles: [] as string[],
      createdFiles: [] as string[],
      hash: 'initial',
    });

    const allFiles = [
      ...createStoryboardFiles('authentication-flow', [
        { name: 'login-flow', executions: 1 },
      ]),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-filtering';
    fileTree.allFiles = allFiles;

    // Increment render count when git status changes
    React.useEffect(() => {
      setRenderCount(c => c + 1);
    }, [gitStatus]);

    const addUnrelatedChange = () => {
      setGitStatus(prev => ({
        ...prev,
        modifiedFiles: [...prev.modifiedFiles, `src/file-${Date.now()}.ts`],
        hash: `hash-${Date.now()}`,
      }));
    };

    const addRelevantChange = () => {
      setGitStatus(prev => ({
        ...prev,
        modifiedFiles: [...prev.modifiedFiles, '.principal-views/authentication-flow/authentication-flow.otel.canvas'],
        hash: `hash-${Date.now()}`,
      }));
    };

    const clearChanges = () => {
      setGitStatus(prev => ({
        ...prev,
        modifiedFiles: [],
        untrackedFiles: [],
        stagedFiles: [],
        deletedFiles: [],
        hash: `hash-${Date.now()}`,
      }));
    };

    return (
      <div style={{ display: 'flex', height: '100vh', gap: 16, padding: 16 }}>
        <div style={{ flex: 1 }}>
          <MockPanelProvider
            contextOverrides={{
              fileTree: createMockFileTreeSlice(fileTree),
              git: {
                scope: 'repository' as const,
                name: 'git',
                data: gitStatus,
                loading: false,
                error: null,
                refresh: async () => {},
              },
            }}
            actionsOverrides={{
              readFile: createMockReadFile(fileTree),
            }}
          >
            {(props) => <StoryboardListPanel {...props} />}
          </MockPanelProvider>
        </div>

        <div style={{
          width: 360,
          padding: 16,
          background: '#1a1a1a',
          borderRadius: 8,
          fontSize: 13,
          lineHeight: 1.6,
          color: '#aaa',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <div>
            <h3 style={{ color: '#fff', marginTop: 0, fontSize: 14, marginBottom: 8 }}>
              Git Status Filtering Test
            </h3>
            <p style={{ margin: 0, fontSize: 12 }}>
              Tests that unrelated git changes don't cause panel re-renders.
              The panel uses <code>filterRelevantGitChanges()</code> to only
              respond to changes in <code>.principal-views/</code> files.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={addUnrelatedChange}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Add Unrelated Change (src/*.ts)
            </button>
            <button
              onClick={addRelevantChange}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Add Relevant Change (.principal-views/*)
            </button>
            <button
              onClick={clearChanges}
              style={{
                background: '#374151',
                color: 'white',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Clear All Changes
            </button>
          </div>

          <div style={{
            padding: 12,
            background: '#0a0a0a',
            borderRadius: 6,
            border: '1px solid #333',
          }}>
            <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>
              State Monitor
            </div>
            <div>Git hash: {gitStatus.hash}</div>
            <div>Modified files: {gitStatus.modifiedFiles.length}</div>
            <div style={{ marginTop: 8, fontSize: 11, maxHeight: 100, overflow: 'auto' }}>
              {gitStatus.modifiedFiles.map((f, i) => (
                <div key={i} style={{ color: f.includes('.principal-views') ? '#22c55e' : '#6b7280' }}>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            padding: 12,
            background: gitStatus.modifiedFiles.some(f => f.includes('.principal-views')) ? '#166534' : '#1f2937',
            borderRadius: 6,
            border: `1px solid ${gitStatus.modifiedFiles.some(f => f.includes('.principal-views')) ? '#22c55e' : '#374151'}`,
          }}>
            <div style={{ color: '#fff', fontWeight: 'bold' }}>
              Panel Should Show Badges: {gitStatus.modifiedFiles.some(f => f.includes('.principal-views')) ? '✓ YES' : '✗ NO'}
            </div>
            <div style={{ fontSize: 11, marginTop: 4 }}>
              {gitStatus.modifiedFiles.some(f => f.includes('.principal-views'))
                ? 'Relevant changes detected - badges will appear'
                : 'Only unrelated changes - no badges shown'}
            </div>
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
/**
 * Drag and Drop Test - Test dragging storyboard items to a terminal-like drop zone
 * Demonstrates the cross-panel drag functionality where storyboard nodes can be
 * dragged to insert paths into a terminal or other panels.
 */
export const DragAndDropTest: Story = {
  args: {} as never,
  render: () => {
    const [droppedItems, setDroppedItems] = useState<Array<{ timestamp: string; dataType: string; primaryData: string; metadata?: Record<string, unknown> }>>([]);

    const allFiles = [
      ...createStoryboardFiles('authentication-flow', [
        { name: 'login-workflow', executions: 1 },
        { name: 'logout-workflow', executions: 0 },
      ]),
      ...createStoryboardFiles('payment-processing', [
        { name: 'checkout-flow', executions: 2 },
      ]),
      ...createStaticCanvasFile('api-design', true),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-drag-drop';
    fileTree.allFiles = allFiles;

    // Handle drop events (simulates terminal drop zone behavior)
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const timestamp = new Date().toLocaleTimeString();

      // Try to get panel data (cross-panel format)
      const panelData = e.dataTransfer.getData('application/x-panel-data');
      if (panelData) {
        try {
          const parsed = JSON.parse(panelData);
          setDroppedItems(prev => [{
            timestamp,
            dataType: parsed.dataType,
            primaryData: parsed.primaryData,
            metadata: parsed.metadata,
          }, ...prev].slice(0, 10));
          return;
        } catch {
          // Fall through to plain text
        }
      }

      // Fallback to plain text
      const text = e.dataTransfer.getData('text/plain');
      if (text) {
        setDroppedItems(prev => [{
          timestamp,
          dataType: 'text/plain',
          primaryData: text,
        }, ...prev].slice(0, 10));
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    return (
      <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a' }}>
        {/* Storyboard Panel */}
        <div style={{ flex: 1 }}>
          <MockPanelProvider
            contextOverrides={{
              fileTree: createMockFileTreeSlice(fileTree),
            }}
            actionsOverrides={{
              readFile: createMockReadFile(fileTree),
            }}
          >
            {(props) => <StoryboardListPanel {...props} />}
          </MockPanelProvider>
        </div>

        {/* Drop Zone (simulates terminal) */}
        <div
          style={{
            width: 400,
            background: '#1a1a1a',
            borderLeft: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: 16, borderBottom: '1px solid #333' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: 14 }}>
              Terminal Drop Zone (Simulated)
            </h3>
            <p style={{ margin: '8px 0 0 0', color: '#888', fontSize: 12 }}>
              Drag items from the storyboard list and drop them here to test the drag-and-drop functionality.
            </p>
          </div>

          {/* Drop target area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              flex: 1,
              margin: 16,
              padding: 16,
              background: '#0a0a0a',
              border: '2px dashed #3b82f6',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <div style={{
              textAlign: 'center',
              padding: '20px 0',
              color: '#3b82f6',
              fontSize: 13,
              borderBottom: '1px solid #333',
              marginBottom: 12,
            }}>
              Drop items here to insert path
            </div>

            {/* Dropped items log */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: 11,
              minHeight: 0,
            }}>
              {droppedItems.length === 0 ? (
                <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>
                  No items dropped yet.<br/>
                  Try dragging a Canvas, Workflow, or Overview node.
                </div>
              ) : (
                droppedItems.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 12,
                      padding: 10,
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ color: '#22c55e', marginBottom: 4 }}>
                      [{item.timestamp}] Dropped!
                    </div>
                    <div style={{ color: '#f59e0b', marginBottom: 2 }}>
                      Type: {item.dataType}
                    </div>
                    <div style={{ color: '#fff', wordBreak: 'break-all' }}>
                      Path: {item.primaryData}
                    </div>
                    {item.metadata && (
                      <div style={{ color: '#888', marginTop: 4, fontSize: 10 }}>
                        Metadata: {JSON.stringify(item.metadata)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {droppedItems.length > 0 && (
              <button
                onClick={() => setDroppedItems([])}
                style={{
                  marginTop: 12,
                  padding: '8px 12px',
                  background: '#333',
                  color: '#aaa',
                  border: '1px solid #444',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                Clear Log
              </button>
            )}
          </div>

          {/* Instructions */}
          <div style={{
            padding: 16,
            borderTop: '1px solid #333',
            fontSize: 11,
            color: '#888',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: '#fff' }}>Draggable Items:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 16 }}>
              <li><span style={{ color: '#f59e0b' }}>Canvas</span> - .otel.canvas file path</li>
              <li><span style={{ color: '#8b5cf6' }}>Workflow</span> - .workflow.json file path</li>
              <li><span style={{ color: '#3b82f6' }}>Overview</span> - .md documentation path</li>
              <li><span style={{ color: '#10b981' }}>Storyboard</span> - folder directory path</li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
};

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

    return (
      <div style={{ display: 'flex', height: '100vh', gap: 16, padding: 16 }}>
        <div style={{ flex: 1 }}>
          <MockPanelProvider
            contextOverrides={{
              fileTree: createMockFileTreeSlice(fileTree),
              gitStatusWithFiles: {
                scope: 'repository' as const,
                name: 'gitStatusWithFiles',
                data: gitStatusData,
                loading: false,
                error: null,
                refresh: async () => {},
              },
            }}
            actionsOverrides={{
              readFile: createMockReadFile(fileTree),
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

/**
 * Programmatic Control - Demonstrates external control of tabs and tree nodes
 * Used for tours and external navigation where the landing page needs to
 * programmatically switch tabs and expand/collapse tree nodes.
 *
 * Supported events:
 * - { action: 'switchTab', tab: 'otel' | 'regular' }
 * - { action: 'toggleNode', nodeId: string, open?: boolean }
 */
export const ProgrammaticTabControl: Story = {
  args: {} as never,
  render: () => {
    const [eventLog, setEventLog] = useState<Array<{ timestamp: string; action: string; detail: string }>>([]);

    // Create a ref to hold event listeners
    const listenersRef = React.useRef<Map<string, Set<(event: unknown) => void>>>(new Map());

    // Create events object with working on/off/emit
    const mockEvents = React.useMemo(() => ({
      emit: (event: PanelEvent<unknown>) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Event emitted:`, event);

        // Dispatch to registered listeners
        const listeners = listenersRef.current.get(event.type);
        if (listeners) {
          listeners.forEach(listener => listener(event));
        }
      },
      on: (type: string, callback: (event: unknown) => void) => {
        if (!listenersRef.current.has(type)) {
          listenersRef.current.set(type, new Set());
        }
        listenersRef.current.get(type)!.add(callback);
        return () => {
          listenersRef.current.get(type)?.delete(callback);
        };
      },
      off: (type: string, callback: (event: unknown) => void) => {
        listenersRef.current.get(type)?.delete(callback);
      },
    }), []);

    // Function to emit tab switch event
    const switchTab = (tab: 'otel' | 'regular') => {
      const timestamp = new Date().toLocaleTimeString();
      setEventLog(prev => [{ timestamp, action: 'switchTab', detail: tab }, ...prev].slice(0, 10));

      mockEvents.emit({
        type: 'custom',
        source: 'external-tour-control',
        timestamp: Date.now(),
        payload: { action: 'switchTab', tab },
      });
    };

    // Function to toggle a tree node
    const toggleNode = (nodeId: string, open?: boolean) => {
      const timestamp = new Date().toLocaleTimeString();
      const detail = open !== undefined ? `${nodeId} → ${open ? 'open' : 'close'}` : `${nodeId} → toggle`;
      setEventLog(prev => [{ timestamp, action: 'toggleNode', detail }, ...prev].slice(0, 10));

      mockEvents.emit({
        type: 'custom',
        source: 'external-tour-control',
        timestamp: Date.now(),
        payload: { action: 'toggleNode', nodeId, open },
      });
    };

    // Function to select a node and emit click events
    const selectNode = (nodeId: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setEventLog(prev => [{ timestamp, action: 'selectNode', detail: nodeId }, ...prev].slice(0, 10));

      mockEvents.emit({
        type: 'custom',
        source: 'external-tour-control',
        timestamp: Date.now(),
        payload: { action: 'selectNode', nodeId },
      });
    };

    const allFiles = [
      // Static canvases for Architecture tab
      ...createStaticCanvasFile('system-architecture', true),
      ...createStaticCanvasFile('database-design', false),
      ...createStaticCanvasFile('api-design', true),

      // OTEL canvases for OTEL Workflows tab
      ...createStoryboardFiles('authentication-flow', [
        { name: 'login-flow', executions: 2 },
        { name: 'logout-flow', executions: 1 },
      ]),
      ...createStoryboardFiles('payment-processing', [
        { name: 'checkout', executions: 1 },
      ]),
    ];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = 'mock-sha-programmatic';
    fileTree.allFiles = allFiles;

    return (
      <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a' }}>
        {/* Panel */}
        <div style={{ flex: 1 }}>
          <MockPanelProvider
            contextOverrides={{
              fileTree: createMockFileTreeSlice(fileTree),
            }}
            actionsOverrides={{
              readFile: createMockReadFile(fileTree),
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
            gap: 20,
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16 }}>
              Programmatic Control
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>
              Simulate external control of tabs and tree nodes (e.g., from a tour).
            </p>
          </div>

          {/* Tab Control */}
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Tab Switching</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => switchTab('regular')}
                style={{
                  flex: 1,
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Architecture
              </button>
              <button
                onClick={() => switchTab('otel')}
                style={{
                  flex: 1,
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                OTEL Workflows
              </button>
            </div>
          </div>

          {/* Node Toggle - Architecture Tab */}
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Toggle Nodes (Architecture)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => toggleNode('canvas-folder:system-architecture')}
                style={{
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  textAlign: 'left',
                }}
              >
                Toggle: System Architecture
              </button>
              <button
                onClick={() => toggleNode('canvas-folder:api-design')}
                style={{
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  textAlign: 'left',
                }}
              >
                Toggle: API Design
              </button>
            </div>
          </div>

          {/* Node Toggle - OTEL Tab */}
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Toggle Nodes (OTEL)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => toggleNode('storyboard:authentication-flow')}
                style={{
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  textAlign: 'left',
                }}
              >
                Toggle: Authentication Flow
              </button>
              <button
                onClick={() => toggleNode('storyboard:payment-processing')}
                style={{
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  textAlign: 'left',
                }}
              >
                Toggle: Payment Processing
              </button>
              <button
                onClick={() => toggleNode('workflows:authentication-flow', true)}
                style={{
                  background: '#065f46',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  textAlign: 'left',
                }}
              >
                Open: Auth Workflows Container
              </button>
            </div>
          </div>

          {/* Select Node (Click Simulation) */}
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Select Node (Simulate Click)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => selectNode('canvas:authentication-flow')}
                style={{
                  background: '#b45309',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  textAlign: 'left',
                }}
              >
                Select Canvas: Authentication Flow
              </button>
              <button
                onClick={() => selectNode('workflow:login-flow')}
                style={{
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  textAlign: 'left',
                }}
              >
                Select Workflow: Login Flow
              </button>
              <button
                onClick={() => selectNode('overview:system-architecture')}
                style={{
                  background: '#0369a1',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11,
                  textAlign: 'left',
                }}
              >
                Select Overview: System Architecture
              </button>
            </div>
          </div>

          {/* Event Format */}
          <div style={{
            padding: 12,
            background: '#0a0a0a',
            borderRadius: 6,
            border: '1px solid #333',
          }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
              Event payload formats:
            </div>
            <pre style={{
              margin: 0,
              fontSize: 10,
              color: '#10b981',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
            }}>
{`// Switch tabs
{ action: 'switchTab', tab: 'otel' | 'regular' }

// Toggle node (flip current state)
{ action: 'toggleNode', nodeId: string }

// Set node open/closed explicitly
{ action: 'toggleNode', nodeId: string, open: boolean }

// Select node (emit click events)
{ action: 'selectNode', nodeId: string }
// nodeId formats:
//   canvas:storyboard-name
//   workflow:workflow-name
//   overview:canvas-name`}
            </pre>
          </div>

          {/* Event Log */}
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
                minHeight: 150,
              }}
            >
              {eventLog.length === 0 ? (
                <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>
                  No events yet. Click a button above.
                </div>
              ) : (
                eventLog.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 8,
                      padding: 8,
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: 4,
                    }}
                  >
                    <span style={{ color: '#666' }}>[{entry.timestamp}]</span>{' '}
                    <span style={{ color: entry.action === 'switchTab' ? '#f59e0b' : '#10b981' }}>
                      {entry.action}
                    </span>
                    {' → '}
                    <span style={{ color: '#aaa' }}>{entry.detail}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Build enterprise file tree outside render to avoid recreation
const buildEnterpriseFileTree = () => {
  const allFiles = [
    // ===== E-COMMERCE DOMAIN =====
    ...createStoryboardFiles('checkout-flow', [
      { name: 'cart-to-payment', executions: 5 },
      { name: 'payment-success', executions: 8 },
      { name: 'payment-declined', executions: 3 },
      { name: 'payment-retry', executions: 2 },
      { name: 'order-confirmation', executions: 7 },
      { name: 'order-cancellation', executions: 1 },
    ]),
    ...createStoryboardFiles('inventory-management', [
      { name: 'stock-check', executions: 12 },
      { name: 'stock-reservation', executions: 6 },
      { name: 'stock-release', executions: 4 },
      { name: 'low-stock-alert', executions: 2 },
      { name: 'reorder-trigger', executions: 1 },
    ]),
    ...createStoryboardFiles('shipping-fulfillment', [
      { name: 'shipping-rate-calculation', executions: 10 },
      { name: 'label-generation', executions: 5 },
      { name: 'tracking-update', executions: 15 },
      { name: 'delivery-confirmation', executions: 8 },
      { name: 'return-initiation', executions: 2 },
    ]),
    // ===== USER MANAGEMENT DOMAIN =====
    ...createStoryboardFiles('user-authentication', [
      { name: 'password-login', executions: 20 },
      { name: 'oauth-google', executions: 8 },
      { name: 'oauth-github', executions: 5 },
      { name: 'mfa-verification', executions: 12 },
      { name: 'session-refresh', executions: 25 },
      { name: 'session-invalidation', executions: 3 },
      { name: 'password-reset', executions: 4 },
    ]),
    ...createStoryboardFiles('user-profile', [
      { name: 'profile-view', executions: 30 },
      { name: 'profile-update', executions: 10 },
      { name: 'avatar-upload', executions: 5 },
      { name: 'preferences-change', executions: 8 },
      { name: 'account-deletion', executions: 1 },
    ]),
    ...createStoryboardFiles('notification-system', [
      { name: 'email-dispatch', executions: 50 },
      { name: 'push-notification', executions: 35 },
      { name: 'sms-alert', executions: 10 },
      { name: 'in-app-notification', executions: 45 },
      { name: 'notification-preferences', executions: 6 },
    ]),
    // ===== API GATEWAY DOMAIN =====
    ...createStoryboardFiles('api-gateway-routing', [
      { name: 'route-resolution', executions: 100 },
      { name: 'load-balancing', executions: 80 },
      { name: 'service-discovery', executions: 40 },
      { name: 'request-transformation', executions: 25 },
      { name: 'response-aggregation', executions: 15 },
    ]),
    ...createStoryboardFiles('api-security', [
      { name: 'rate-limit-check', executions: 200 },
      { name: 'rate-limit-exceeded', executions: 5 },
      { name: 'jwt-validation', executions: 150 },
      { name: 'api-key-validation', executions: 80 },
      { name: 'ip-blacklist-check', executions: 60 },
      { name: 'cors-validation', executions: 30 },
    ]),
    ...createStoryboardFiles('api-caching', [
      { name: 'cache-hit', executions: 300 },
      { name: 'cache-miss', executions: 50 },
      { name: 'cache-invalidation', executions: 20 },
      { name: 'cache-warmup', executions: 5 },
    ]),
    // ===== MICROSERVICES DOMAIN =====
    ...createStoryboardFiles('service-mesh', [
      { name: 'grpc-call', executions: 150 },
      { name: 'rest-call', executions: 200 },
      { name: 'graphql-query', executions: 75 },
      { name: 'event-publish', executions: 100 },
      { name: 'event-consume', executions: 95 },
    ]),
    ...createStoryboardFiles('circuit-breaker', [
      { name: 'circuit-closed', executions: 500 },
      { name: 'circuit-open', executions: 3 },
      { name: 'circuit-half-open', executions: 8 },
      { name: 'fallback-triggered', executions: 10 },
      { name: 'recovery-success', executions: 7 },
    ]),
    ...createStoryboardFiles('service-health', [
      { name: 'health-check', executions: 1000 },
      { name: 'liveness-probe', executions: 800 },
      { name: 'readiness-probe', executions: 750 },
      { name: 'dependency-check', executions: 200 },
    ]),
    // ===== DATA PROCESSING DOMAIN =====
    ...createStoryboardFiles('etl-pipeline', [
      { name: 'data-extraction', executions: 24 },
      { name: 'data-transformation', executions: 24 },
      { name: 'data-loading', executions: 24 },
      { name: 'data-validation', executions: 48 },
      { name: 'schema-migration', executions: 2 },
    ]),
    ...createStoryboardFiles('stream-processing', [
      { name: 'kafka-consume', executions: 10000 },
      { name: 'message-processing', executions: 9500 },
      { name: 'dead-letter-queue', executions: 50 },
      { name: 'offset-commit', executions: 1000 },
      { name: 'partition-rebalance', executions: 5 },
    ]),
    ...createStoryboardFiles('batch-processing', [
      { name: 'daily-report', executions: 30 },
      { name: 'weekly-aggregation', executions: 4 },
      { name: 'monthly-cleanup', executions: 1 },
      { name: 'data-archival', executions: 12 },
      { name: 'backup-job', executions: 30 },
    ]),
    // ===== INFRASTRUCTURE DOMAIN =====
    ...createStoryboardFiles('database-operations', [
      { name: 'query-execution', executions: 5000 },
      { name: 'connection-pool', executions: 100 },
      { name: 'transaction-commit', executions: 800 },
      { name: 'transaction-rollback', executions: 20 },
      { name: 'deadlock-detection', executions: 2 },
    ]),
    ...createStoryboardFiles('redis-operations', [
      { name: 'get-operation', executions: 10000 },
      { name: 'set-operation', executions: 3000 },
      { name: 'delete-operation', executions: 500 },
      { name: 'pipeline-execution', executions: 200 },
      { name: 'pub-sub-message', executions: 1500 },
    ]),
    ...createStoryboardFiles('object-storage', [
      { name: 'upload-object', executions: 200 },
      { name: 'download-object', executions: 500 },
      { name: 'presigned-url', executions: 300 },
      { name: 'multipart-upload', executions: 50 },
      { name: 'lifecycle-transition', executions: 10 },
    ]),
  ];

  const builder = new PathsFileTreeBuilder();
  const fileTree = builder.build({ files: allFiles.map(f => f.path) });
  fileTree.sha = 'mock-sha-enterprise';
  fileTree.allFiles = allFiles;
  return fileTree;
};

// Static file tree instance - created once
const enterpriseFileTree = buildEnterpriseFileTree();

// Static mock readFile function - created once, no dependencies
const enterpriseMockReadFile = async (path: string) => {
  // Return canvas content for .otel.canvas files
  if (path.endsWith('.otel.canvas')) {
    const canvasName = path.split('/').slice(-2, -1)[0] || 'Mock Canvas';
    const displayName = canvasName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return JSON.stringify({
      pv: {
        name: displayName,
        version: '1.0.0',
        description: `Enterprise observability canvas for ${displayName}`,
      },
      nodes: [
        { id: 'start', type: 'text', text: '# Start\n\nWorkflow entry point', x: 0, y: 0, width: 200, height: 100, color: '#10b981' },
        { id: 'process', type: 'text', text: '# Process\n\nMain processing logic', x: 250, y: 0, width: 200, height: 100, color: '#6366f1' },
        { id: 'end', type: 'text', text: '# Complete\n\nWorkflow completion', x: 500, y: 0, width: 200, height: 100, color: '#8b5cf6' },
      ],
      edges: [
        { id: 'e1', fromNode: 'start', toNode: 'process', fromSide: 'right', toSide: 'left' },
        { id: 'e2', fromNode: 'process', toNode: 'end', fromSide: 'right', toSide: 'left' },
      ],
    });
  }

  // Extract workflow info
  const workflowName = path.split('/').slice(-2, -1)[0] || 'unknown';
  const storyboardName = path.split('/').slice(-3, -2)[0] || 'unknown';
  const displayName = workflowName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return JSON.stringify({
    version: '1.0.0',
    name: displayName,
    canvas: `.principal-views/${storyboardName}/${storyboardName}.otel.canvas`,
    description: `Workflow scenarios for ${displayName}`,
    mode: 'timeline',
    scenarioSelection: 'first-match',
    status: 'active',
    scenarios: [
      {
        id: `${workflowName}-happy-path`,
        priority: 1,
        description: `Standard successful ${displayName} flow`,
        template: {
          events: {
            'request.started': 'Request initiated for {{operation.name}}',
            'validation.passed': 'Input validation successful',
            'operation.completed': 'Operation completed in {{duration.ms}}ms',
            'response.sent': 'Response delivered to client',
          },
          summary: `Successfully completed ${displayName}`,
        },
      },
      {
        id: `${workflowName}-error`,
        priority: 2,
        description: `Error handling for ${displayName}`,
        template: {
          events: {
            'request.started': 'Request initiated for {{operation.name}}',
            'error.occurred': 'Error: {{error.message}} ({{error.code}})',
            'error.handled': 'Error handled with fallback',
            'response.sent': 'Error response delivered',
          },
          summary: `Error handled in ${displayName}`,
        },
      },
      {
        id: `${workflowName}-timeout`,
        priority: 3,
        description: `Timeout scenario for ${displayName}`,
        template: {
          events: {
            'request.started': 'Request initiated',
            'timeout.detected': 'Operation exceeded {{timeout.ms}}ms threshold',
            'retry.initiated': 'Retry attempt {{retry.count}} of {{retry.max}}',
            'response.sent': 'Final response after retry',
          },
          summary: `Timeout handled in ${displayName}`,
        },
      },
    ],
  });
};

// Static context slice - created once
const enterpriseFileTreeSlice = createMockFileTreeSlice(enterpriseFileTree);

/**
 * Enterprise Application - Large-scale system with many OTel workflows
 * Demonstrates a realistic enterprise application with comprehensive observability coverage
 * across multiple domains: e-commerce, user management, API gateway, microservices, and data processing
 */
export const EnterpriseOtelWorkflows: Story = {
  args: {} as never,
  render: () => {
    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: enterpriseFileTreeSlice,
        }}
        actionsOverrides={{
          readFile: enterpriseMockReadFile,
        }}
      >
        {(props) => <StoryboardListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

// ============================================================================
// Architecture Canvas Grouping Story
// ============================================================================

// Helper to create architecture-specific canvas files
const createArchitectureCanvasFile = (
  canvasName: string,
  canvasType: 'resources' | 'scopes' | 'spans' | 'regular',
  withMarkdown: boolean = true
) => {
  const extension = canvasType === 'regular' ? '.canvas' : `.${canvasType}.canvas`;
  const files = [
    {
      name: `${canvasName}${extension}`,
      relativePath: `.principal-views/${canvasName}${extension}`,
      path: `.principal-views/${canvasName}${extension}`,
      extension: '.canvas',
      size: 1024,
      lastModified: new Date('2024-01-10'),
      isDirectory: false,
    },
  ];

  if (withMarkdown) {
    files.push({
      name: `${canvasName}.md`,
      relativePath: `.principal-views/${canvasName}.md`,
      path: `.principal-views/${canvasName}.md`,
      extension: '.md',
      size: 512,
      lastModified: new Date('2024-01-10'),
      isDirectory: false,
    });
  }

  return files;
};

// Build file tree with architecture canvas types for grouping demonstration
const buildArchitectureFileTree = (): FileTree => {
  const allFiles = [
    // Resources & Scopes group
    ...createArchitectureCanvasFile('otel-hierarchy', 'resources', true),
    ...createArchitectureCanvasFile('instrumentation', 'scopes', true),
    ...createArchitectureCanvasFile('service-resources', 'resources', true),

    // Spans group
    ...createArchitectureCanvasFile('architecture', 'spans', true),
    ...createArchitectureCanvasFile('api-conventions', 'spans', true),

    // Regular architecture canvases
    ...createArchitectureCanvasFile('system-design', 'regular', true),
    ...createArchitectureCanvasFile('data-flow', 'regular', false),
  ];

  const filePaths = allFiles.map(f => f.path);
  const builder = new PathsFileTreeBuilder();
  const fileTree = builder.build({ files: filePaths });
  fileTree.allFiles = allFiles;

  return fileTree;
};

const architectureFileTree = buildArchitectureFileTree();
const architectureFileTreeSlice = createMockFileTreeSlice(architectureFileTree);

// Mock readFile for architecture canvases
const architectureMockReadFile = async (path: string) => {
  console.log('[Architecture Mock readFile] Called with path:', path);

  if (path.endsWith('.canvas')) {
    const filename = path.split('/').pop() || '';
    const canvasName = filename
      .replace('.resources.canvas', '')
      .replace('.scopes.canvas', '')
      .replace('.spans.canvas', '')
      .replace('.canvas', '');

    // Determine markdown path
    const markdownPath = `.principal-views/${canvasName}.md`;
    const hasMarkdown = architectureFileTree.allFiles.some(f => f.path === markdownPath);

    const content = JSON.stringify({
      pv: {
        name: canvasName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        version: '1.0.0',
        description: `Architecture canvas: ${canvasName}`,
        ...(hasMarkdown && { markdown: markdownPath }),
      },
      nodes: [],
      edges: [],
    });
    return content;
  }

  return '';
};

/**
 * Architecture Canvas Grouping
 *
 * Demonstrates the new architecture canvas grouping feature that groups:
 * - **Resources & Scopes**: .resources.canvas and .scopes.canvas files
 * - **Spans**: .spans.canvas files
 * - Regular .canvas files remain ungrouped
 *
 * This helps organize OTel instrumentation documentation:
 * - Resources define service identity (service.name, deployment.environment)
 * - Scopes define instrumentation libraries (tracer names)
 * - Spans define span conventions and naming patterns
 */
export const ArchitectureCanvasGrouping: Story = {
  args: {} as never,
  parameters: {
    docs: {
      description: {
        story: `
Shows the architecture canvas grouping feature. Architecture canvases are grouped by type:
- **Resources & Scopes** (Layers icon): Groups \`.resources.canvas\` and \`.scopes.canvas\` files
- **Spans** (Network icon): Groups \`.spans.canvas\` files
- Regular \`.canvas\` files appear at the root level

This organization helps teams document their OTel instrumentation strategy:
- Resources: Service identity attributes (service.name, deployment.environment)
- Scopes: Instrumentation library definitions (tracer names, versions)
- Spans: Span naming conventions and patterns
        `,
      },
    },
  },
  render: () => {
    return (
      <MockPanelProvider
        contextOverrides={{
          fileTree: architectureFileTreeSlice,
        }}
        actionsOverrides={{
          readFile: architectureMockReadFile,
        }}
      >
        {(props) => <StoryboardListPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Architecture Canvas Change Detection Test
 *
 * Tests whether the tree updates when new architecture canvas files
 * (scopes.canvas, spans.canvas, resources.canvas) are added dynamically.
 *
 * This story reproduces the bug where adding new canvas files doesn't
 * automatically refresh the tree.
 */
export const ArchitectureCanvasChangeDetection: Story = {
  args: {} as never,
  render: () => {
    const [sha, setSha] = useState('arch-sha-1');
    const [addedCanvases, setAddedCanvases] = useState<Array<{
      name: string;
      type: 'resources' | 'scopes' | 'spans' | 'regular';
    }>>([]);

    // Base architecture canvases
    const baseFiles = [
      ...createArchitectureCanvasFile('system-design', 'regular', true),
    ];

    // Dynamically added canvases
    const dynamicFiles = addedCanvases.flatMap(c =>
      createArchitectureCanvasFile(c.name, c.type, true)
    );

    const allFiles = [...baseFiles, ...dynamicFiles];

    const builder = new PathsFileTreeBuilder();
    const fileTree = builder.build({ files: allFiles.map(f => f.path) });
    fileTree.sha = sha;
    fileTree.allFiles = allFiles;

    // Mock readFile for architecture canvases
    const mockReadFile = async (path: string) => {
      if (path.endsWith('.canvas')) {
        const filename = path.split('/').pop() || '';
        const canvasName = filename
          .replace('.resources.canvas', '')
          .replace('.scopes.canvas', '')
          .replace('.spans.canvas', '')
          .replace('.canvas', '');

        const markdownPath = `.principal-views/${canvasName}.md`;
        const hasMarkdown = allFiles.some(f => f.path === markdownPath);

        return JSON.stringify({
          pv: {
            name: canvasName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            version: '1.0.0',
            description: `Architecture canvas: ${canvasName}`,
            ...(hasMarkdown && { markdown: markdownPath }),
          },
          nodes: [],
          edges: [],
        });
      }
      return '';
    };

    const addCanvas = (type: 'resources' | 'scopes' | 'spans' | 'regular') => {
      const timestamp = Date.now();
      const names: Record<string, string> = {
        resources: `resource-${timestamp}`,
        scopes: `scope-${timestamp}`,
        spans: `span-${timestamp}`,
        regular: `canvas-${timestamp}`,
      };
      setAddedCanvases(prev => [...prev, { name: names[type], type }]);
    };

    // Add canvas AND update SHA together (simulating real file system behavior)
    const addCanvasWithSha = (type: 'resources' | 'scopes' | 'spans' | 'regular') => {
      const timestamp = Date.now();
      const names: Record<string, string> = {
        resources: `resource-${timestamp}`,
        scopes: `scope-${timestamp}`,
        spans: `span-${timestamp}`,
        regular: `canvas-${timestamp}`,
      };
      setAddedCanvases(prev => [...prev, { name: names[type], type }]);
      setSha(`arch-sha-${timestamp}`);
    };

    // Debug: log when fileTree changes
    console.log('[Story] Rendering with:', { sha, fileCount: allFiles.length, files: allFiles.map(f => f.path) });

    return (
      <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a' }}>
        {/* Panel */}
        <div style={{ flex: 1 }}>
          <MockPanelProvider
            contextOverrides={{
              fileTree: createMockFileTreeSlice(fileTree),
            }}
            actionsOverrides={{
              readFile: mockReadFile,
            }}
          >
            {(props) => <StoryboardListPanel {...props} />}
          </MockPanelProvider>
        </div>

        {/* Control Panel */}
        <div
          style={{
            width: 380,
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
              Architecture Canvas Change Detection
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>
              Test if the tree updates when adding new architecture canvas files.
              The tree should update automatically when files are added.
            </p>
          </div>

          <div style={{ padding: 12, background: '#2a2a2a', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 8, fontWeight: 500 }}>
              Bug Reproduction Steps:
            </div>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 11, color: '#aaa', lineHeight: 1.8 }}>
              <li>Click "Add scopes.canvas" or other buttons</li>
              <li>Notice the tree does NOT update</li>
              <li>Click "Change SHA" to force refresh</li>
              <li>Now the new canvas appears</li>
            </ol>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Add Canvas (files only, no SHA change):</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                onClick={() => addCanvas('scopes')}
                style={{
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                + scopes.canvas
              </button>
              <button
                onClick={() => addCanvas('spans')}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                + spans.canvas
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#22c55e', marginBottom: 4 }}>Add Canvas + Update SHA (expected behavior):</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                onClick={() => addCanvasWithSha('scopes')}
                style={{
                  background: '#15803d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                + scopes + SHA
              </button>
              <button
                onClick={() => addCanvasWithSha('spans')}
                style={{
                  background: '#15803d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                + spans + SHA
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #333', paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Force Refresh:</div>
            <button
              onClick={() => setSha(`arch-sha-${Date.now()}`)}
              style={{
                background: '#16a34a',
                color: 'white',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                width: '100%',
              }}
            >
              Change SHA (Force Tree Update)
            </button>
          </div>

          <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5, marginTop: 'auto' }}>
            <strong style={{ color: '#aaa' }}>Current State:</strong>
            <div>SHA: {sha}</div>
            <div>Total Files: {allFiles.length}</div>
            <div>Added Canvases: {addedCanvases.length}</div>
            {addedCanvases.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <strong style={{ color: '#aaa' }}>Added:</strong>
                {addedCanvases.map((c, i) => (
                  <div key={i} style={{ color: '#888' }}>
                    • {c.name}.{c.type === 'regular' ? '' : `${c.type}.`}canvas
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};


