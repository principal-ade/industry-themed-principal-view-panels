import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useEffect } from 'react';
import { StoryboardListPanel } from './StoryboardListPanel';
import { CanvasEditorPanel } from './CanvasEditorPanel';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import { AnimatedResizableLayout } from '@principal-ade/panels';
import { MockPanelProvider } from '../mocks/panelContext';
import type { PanelEvent } from '@principal-ade/panel-framework-core';
import type { WorkflowTemplate } from '@principal-ai/principal-view-core';
import type { FileTree } from '@principal-ai/repository-abstraction';
import { PathsFileTreeBuilder } from '@principal-ai/repository-abstraction';

/**
 * Mock canvas with nodes that have eventRef for scenario highlighting
 */
const createMockCanvas = (canvasName: string) => ({
  pv: {
    name: canvasName.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    version: '1.0.0',
    description: `Mock canvas for ${canvasName}`,
    edgeTypes: {
      'data-flow': { color: '#3b82f6', width: 2, style: 'solid', directed: true },
      'triggers': { color: '#10b981', width: 2, style: 'dashed', directed: true },
    },
  },
  nodes: [
    {
      id: 'request-received',
      type: 'text',
      text: 'Request Received',
      x: 50,
      y: 100,
      width: 160,
      height: 70,
      pv: {
        nodeType: 'event',
        fill: '#3b82f6',
        eventRef: 'request.received',
        sources: ['src/handlers/request.ts:25'],
      },
    },
    {
      id: 'validate-input',
      type: 'text',
      text: 'Validate Input',
      x: 280,
      y: 100,
      width: 160,
      height: 70,
      pv: {
        nodeType: 'event',
        fill: '#f59e0b',
        eventRef: 'input.validated',
        sources: ['src/validators/input.ts:42'],
      },
    },
    {
      id: 'process-data',
      type: 'text',
      text: 'Process Data',
      x: 510,
      y: 100,
      width: 160,
      height: 70,
      pv: {
        nodeType: 'event',
        fill: '#8b5cf6',
        eventRef: 'data.processed',
        sources: ['src/services/processor.ts:88'],
      },
    },
    {
      id: 'send-response',
      type: 'text',
      text: 'Send Response',
      x: 740,
      y: 100,
      width: 160,
      height: 70,
      pv: {
        nodeType: 'event',
        fill: '#10b981',
        eventRef: 'response.sent',
        sources: ['src/handlers/response.ts:15'],
      },
    },
    {
      id: 'log-error',
      type: 'text',
      text: 'Log Error',
      x: 280,
      y: 220,
      width: 160,
      height: 70,
      pv: {
        nodeType: 'event',
        fill: '#ef4444',
        eventRef: 'error.logged',
        sources: ['src/utils/logger.ts:33'],
      },
    },
  ],
  edges: [
    { id: 'e1', fromNode: 'request-received', toNode: 'validate-input', pv: { edgeType: 'data-flow' } },
    { id: 'e2', fromNode: 'validate-input', toNode: 'process-data', pv: { edgeType: 'data-flow' } },
    { id: 'e3', fromNode: 'process-data', toNode: 'send-response', pv: { edgeType: 'data-flow' } },
    { id: 'e4', fromNode: 'validate-input', toNode: 'log-error', pv: { edgeType: 'triggers' } },
  ],
});

/**
 * Mock workflow templates with scenarios
 */
const createMockWorkflowTemplate = (workflowName: string, storyboardName: string): WorkflowTemplate => ({
  version: '1.0.0',
  name: workflowName.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
  canvas: `${storyboardName}.otel.canvas`,
  mode: 'timeline',
  scenarioSelection: 'first-match',
  scenarios: [
    {
      id: `${workflowName}-happy-path`,
      priority: 1,
      description: 'The successful path through the workflow where all validations pass and data is processed correctly.',
      template: {
        introduction: 'Successful Processing',
        events: {
          'request.received': 'Request received from {{client.name}} at {{request.timestamp}}',
          'input.validated': 'Input validated successfully - {{validation.fields}} fields checked',
          'data.processed': 'Data processed in {{processing.duration}}ms',
          'response.sent': 'Response sent with status {{response.status}}',
        },
        summary: 'Request completed successfully.',
      },
    },
    {
      id: `${workflowName}-validation-error`,
      priority: 2,
      description: 'Error path when input validation fails.',
      template: {
        introduction: 'Validation Error',
        events: {
          'request.received': 'Request received from {{client.name}}',
          'input.validated': 'Validation failed: {{validation.error}}',
          'error.logged': 'Error logged: {{error.message}}',
        },
        summary: 'Request failed due to validation error.',
      },
    },
  ],
});

// Helper to create storyboard files
const createStoryboardFiles = (storyboardName: string, workflows: string[]) => {
  const files: Array<{
    name: string;
    relativePath: string;
    path: string;
    extension: string;
    size: number;
    lastModified: Date;
    isDirectory: boolean;
  }> = [
    {
      name: `${storyboardName}.otel.canvas`,
      relativePath: `.principal-views/${storyboardName}/${storyboardName}.otel.canvas`,
      path: `.principal-views/${storyboardName}/${storyboardName}.otel.canvas`,
      extension: '.canvas',
      size: 2048,
      lastModified: new Date('2024-01-15'),
      isDirectory: false,
    },
  ];

  workflows.forEach(workflow => {
    files.push({
      name: `${workflow}.workflow.json`,
      relativePath: `.principal-views/${storyboardName}/${workflow}/${workflow}.workflow.json`,
      path: `.principal-views/${storyboardName}/${workflow}/${workflow}.workflow.json`,
      extension: '.json',
      size: 1024,
      lastModified: new Date('2024-01-15'),
      isDirectory: false,
    });
  });

  return files;
};

// Build mock file tree
const buildMockFileTree = (): FileTree => {
  const allFiles = [
    ...createStoryboardFiles('authentication-flow', ['login-process', 'logout-process', 'password-reset']),
    ...createStoryboardFiles('payment-processing', ['checkout-flow', 'refund-flow']),
    ...createStoryboardFiles('user-registration', ['new-user-signup']),
  ];

  const filePaths = allFiles.map(f => f.path);
  const builder = new PathsFileTreeBuilder();
  const fileTree = builder.build({ files: filePaths });
  fileTree.allFiles = allFiles;
  fileTree.sha = 'mock-sha-integration';

  return fileTree;
};

const mockFileTree = buildMockFileTree();

/**
 * State for the canvas editor panel
 */
interface EditorPanelState {
  canvasPath?: string;
  canvasName?: string;
  workflowId?: string;
  workflowPath?: string;
  workflowTemplate?: WorkflowTemplate;
  traceMatchInfo?: Array<{
    scenarioId: string;
    matchType: 'full' | 'partial';
    coveragePercent?: number;
  }>;
}

const meta = {
  title: 'Panels/StoryboardEditorIntegration',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Integration story showing StoryboardListPanel and CanvasEditorPanel working together.\n\n' +
          '**Interactions:**\n' +
          '- Click Canvas node (yellow) → Opens CanvasEditorPanel in editor mode\n' +
          '- Click Workflow node (purple) → Opens CanvasEditorPanel with ScenariosList side panel\n\n' +
          '**Features:**\n' +
          '- Hover over scenarios to highlight nodes on canvas\n' +
          '- Click scenario to show EventCarousel with step details\n' +
          '- Edit mode toggle still works when viewing workflow scenarios',
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
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Inner component that handles panel props and events
 */
interface PanelInnerProps {
  props: any;
  editorState: EditorPanelState | null;
  setEditorState: (state: EditorPanelState | null) => void;
}

const PanelInner: React.FC<PanelInnerProps> = ({
  props,
  editorState,
  setEditorState,
}) => {
  const { theme } = useTheme();

  // Listen for openCanvas events from StoryboardListPanel
  useEffect(() => {
    if (!props.events) return;

    const unsubscribe = props.events.on('custom', (event: PanelEvent) => {
      const payload = event.payload as {
        action?: string;
        openMode?: 'editor' | 'detail';
        canvasId?: string;
        canvasPath?: string;
        canvas?: { id: string; path: string; name: string };
        workflowId?: string;
        workflowPath?: string;
        workflow?: WorkflowTemplate; // StoryboardListPanel uses 'workflow', not 'workflowTemplate'
        workflowFileInfo?: { path: string };
      };

      if (payload.action === 'openCanvas') {
        // Extract canvas info
        const canvasPath = payload.canvasPath || payload.canvas?.path;
        const canvasName = payload.canvas?.name || payload.canvasId;

        if (payload.openMode === 'detail' && payload.workflowId) {
          // Workflow clicked - show with scenarios
          // Note: StoryboardListPanel emits 'workflow', we map it to 'workflowTemplate'
          setEditorState({
            canvasPath,
            canvasName,
            workflowId: payload.workflowId,
            workflowPath: payload.workflowFileInfo?.path,
            workflowTemplate: payload.workflow,
          });
        } else {
          // Canvas clicked - show editor only
          setEditorState({
            canvasPath,
            canvasName,
          });
        }
      }
    });

    return unsubscribe;
  }, [props.events, setEditorState]);

  // Determine what to show in the right panel
  const rightPanel = editorState ? (
    <CanvasEditorPanel
      {...props}
      canvasPath={editorState.canvasPath}
      canvasName={editorState.canvasName}
      workflowTemplate={editorState.workflowTemplate}
      selectedWorkflowId={editorState.workflowId}
      workflowPath={editorState.workflowPath}
      traceMatchInfo={editorState.traceMatchInfo}
    />
  ) : (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: theme.colors.background,
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.body,
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ fontSize: 48, opacity: 0.3 }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="M3 9h6" />
        </svg>
      </div>
      <div style={{ textAlign: 'center', maxWidth: 300 }}>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
          Select a Canvas or Workflow
        </div>
        <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.5 }}>
          Click a <span style={{ color: '#f59e0b' }}>Canvas</span> to edit it, or click a{' '}
          <span style={{ color: '#8b5cf6' }}>Workflow</span> to view its scenarios.
        </div>
      </div>
    </div>
  );

  return (
    <AnimatedResizableLayout
      leftPanel={<StoryboardListPanel {...props} />}
      rightPanel={rightPanel}
      defaultSize={30}
      minSize={20}
      theme={theme}
    />
  );
};

/**
 * Integration wrapper that manages state
 */
const StoryboardEditorWrapper: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorPanelState | null>(null);

  // Mock readFile that returns canvas and workflow JSON
  const mockReadFile = async (path: string) => {
    console.log('[Mock readFile]', path);

    // Return canvas content
    if (path.endsWith('.otel.canvas') || path.endsWith('.canvas')) {
      const storyboardName = path.split('/').slice(-2, -1)[0] || 'mock-canvas';
      return JSON.stringify(createMockCanvas(storyboardName));
    }

    // Return workflow template
    if (path.endsWith('.workflow.json')) {
      const workflowName = path.split('/').slice(-2, -1)[0] || 'mock-workflow';
      const storyboardName = path.split('/').slice(-3, -2)[0] || 'mock-storyboard';
      return JSON.stringify(createMockWorkflowTemplate(workflowName, storyboardName));
    }

    return '{}';
  };

  return (
    <MockPanelProvider
      contextOverrides={{
        fileTree: {
          scope: 'repository' as const,
          name: 'fileTree',
          data: mockFileTree,
          loading: false,
          error: null,
          refresh: async () => {},
        },
        repositoryPath: '/mock/repository',
      }}
      actionsOverrides={{
        readFile: mockReadFile,
        writeFile: async (path: string, content: string) => {
          console.log('[Mock writeFile]', path, content.slice(0, 100) + '...');
        },
      }}
    >
      {(props) => (
        <PanelInner
          props={props}
          editorState={editorState}
          setEditorState={setEditorState}
        />
      )}
    </MockPanelProvider>
  );
};

/**
 * Side-by-side layout showing storyboard list and canvas editor
 * - Click Canvas to edit it
 * - Click Workflow to view scenarios with ScenariosList
 */
export const SideBySide: Story = {
  render: () => <StoryboardEditorWrapper />,
};

/**
 * With pre-selected workflow - demonstrates the scenario list and event carousel
 */
export const WithWorkflowSelected: Story = {
  render: () => {
    const PreSelectedWrapper: React.FC = () => {
      const [editorState, setEditorState] = useState<EditorPanelState | null>({
        canvasPath: '.principal-views/authentication-flow/authentication-flow.otel.canvas',
        canvasName: 'Authentication Flow',
        workflowId: 'login-process',
        workflowPath: '.principal-views/authentication-flow/login-process/login-process.workflow.json',
        workflowTemplate: createMockWorkflowTemplate('login-process', 'authentication-flow'),
      });

      const mockReadFile = async (path: string) => {
        if (path.endsWith('.otel.canvas') || path.endsWith('.canvas')) {
          const storyboardName = path.split('/').slice(-2, -1)[0] || 'mock-canvas';
          return JSON.stringify(createMockCanvas(storyboardName));
        }
        if (path.endsWith('.workflow.json')) {
          const workflowName = path.split('/').slice(-2, -1)[0] || 'mock-workflow';
          const storyboardName = path.split('/').slice(-3, -2)[0] || 'mock-storyboard';
          return JSON.stringify(createMockWorkflowTemplate(workflowName, storyboardName));
        }
        return '{}';
      };

      return (
        <MockPanelProvider
          contextOverrides={{
            fileTree: {
              scope: 'repository' as const,
              name: 'fileTree',
              data: mockFileTree,
              loading: false,
              error: null,
              refresh: async () => {},
            },
            repositoryPath: '/mock/repository',
          }}
          actionsOverrides={{
            readFile: mockReadFile,
            writeFile: async (path: string, content: string) => {
              console.log('[Mock writeFile]', path, content.slice(0, 100) + '...');
            },
          }}
        >
          {(props) => (
            <PanelInner
              props={props}
              editorState={editorState}
              setEditorState={setEditorState}
            />
          )}
        </MockPanelProvider>
      );
    };

    return <PreSelectedWrapper />;
  },
};

/**
 * Editor mode only - demonstrates pure canvas editing without workflow
 */
export const EditorModeOnly: Story = {
  render: () => {
    const EditorOnlyWrapper: React.FC = () => {
      const [editorState, setEditorState] = useState<EditorPanelState | null>({
        canvasPath: '.principal-views/payment-processing/payment-processing.otel.canvas',
        canvasName: 'Payment Processing',
        // No workflowTemplate - pure editor mode
      });

      const mockReadFile = async (path: string) => {
        if (path.endsWith('.otel.canvas') || path.endsWith('.canvas')) {
          const storyboardName = path.split('/').slice(-2, -1)[0] || 'mock-canvas';
          return JSON.stringify(createMockCanvas(storyboardName));
        }
        if (path.endsWith('.workflow.json')) {
          const workflowName = path.split('/').slice(-2, -1)[0] || 'mock-workflow';
          const storyboardName = path.split('/').slice(-3, -2)[0] || 'mock-storyboard';
          return JSON.stringify(createMockWorkflowTemplate(workflowName, storyboardName));
        }
        return '{}';
      };

      return (
        <MockPanelProvider
          contextOverrides={{
            fileTree: {
              scope: 'repository' as const,
              name: 'fileTree',
              data: mockFileTree,
              loading: false,
              error: null,
              refresh: async () => {},
            },
            repositoryPath: '/mock/repository',
          }}
          actionsOverrides={{
            readFile: mockReadFile,
            writeFile: async (path: string, content: string) => {
              console.log('[Mock writeFile]', path, content.slice(0, 100) + '...');
            },
          }}
        >
          {(props) => (
            <PanelInner
              props={props}
              editorState={editorState}
              setEditorState={setEditorState}
            />
          )}
        </MockPanelProvider>
      );
    };

    return <EditorOnlyWrapper />;
  },
};

/**
 * With matched trace - demonstrates scenario highlighting when a span matches
 * Shows how scenarios display full/partial match indicators
 */
export const WithMatchedTrace: Story = {
  render: () => {
    const MatchedTraceWrapper: React.FC = () => {
      const [editorState, setEditorState] = useState<EditorPanelState | null>({
        canvasPath: '.principal-views/authentication-flow/authentication-flow.otel.canvas',
        canvasName: 'Authentication Flow',
        workflowId: 'login-process',
        workflowPath: '.principal-views/authentication-flow/login-process/login-process.workflow.json',
        workflowTemplate: createMockWorkflowTemplate('login-process', 'authentication-flow'),
        // Simulating a trace that fully matched the first scenario
        traceMatchInfo: [
          {
            scenarioId: 'login-process-happy-path',
            matchType: 'full',
            coveragePercent: 100,
          },
        ],
      });

      const mockReadFile = async (path: string) => {
        if (path.endsWith('.otel.canvas') || path.endsWith('.canvas')) {
          const storyboardName = path.split('/').slice(-2, -1)[0] || 'mock-canvas';
          return JSON.stringify(createMockCanvas(storyboardName));
        }
        if (path.endsWith('.workflow.json')) {
          const workflowName = path.split('/').slice(-2, -1)[0] || 'mock-workflow';
          const storyboardName = path.split('/').slice(-3, -2)[0] || 'mock-storyboard';
          return JSON.stringify(createMockWorkflowTemplate(workflowName, storyboardName));
        }
        return '{}';
      };

      return (
        <MockPanelProvider
          contextOverrides={{
            fileTree: {
              scope: 'repository' as const,
              name: 'fileTree',
              data: mockFileTree,
              loading: false,
              error: null,
              refresh: async () => {},
            },
            repositoryPath: '/mock/repository',
          }}
          actionsOverrides={{
            readFile: mockReadFile,
            writeFile: async (path: string, content: string) => {
              console.log('[Mock writeFile]', path, content.slice(0, 100) + '...');
            },
          }}
        >
          {(props) => (
            <PanelInner
              props={props}
              editorState={editorState}
              setEditorState={setEditorState}
            />
          )}
        </MockPanelProvider>
      );
    };

    return <MatchedTraceWrapper />;
  },
};

/**
 * With partial match - demonstrates partial coverage indicator
 * Shows how scenarios display when only some events matched
 */
export const WithPartialMatch: Story = {
  render: () => {
    const PartialMatchWrapper: React.FC = () => {
      const [editorState, setEditorState] = useState<EditorPanelState | null>({
        canvasPath: '.principal-views/authentication-flow/authentication-flow.otel.canvas',
        canvasName: 'Authentication Flow',
        workflowId: 'login-process',
        workflowPath: '.principal-views/authentication-flow/login-process/login-process.workflow.json',
        workflowTemplate: createMockWorkflowTemplate('login-process', 'authentication-flow'),
        // Simulating a trace that partially matched the second scenario
        traceMatchInfo: [
          {
            scenarioId: 'login-process-validation-error',
            matchType: 'partial',
            coveragePercent: 67,
          },
        ],
      });

      const mockReadFile = async (path: string) => {
        if (path.endsWith('.otel.canvas') || path.endsWith('.canvas')) {
          const storyboardName = path.split('/').slice(-2, -1)[0] || 'mock-canvas';
          return JSON.stringify(createMockCanvas(storyboardName));
        }
        if (path.endsWith('.workflow.json')) {
          const workflowName = path.split('/').slice(-2, -1)[0] || 'mock-workflow';
          const storyboardName = path.split('/').slice(-3, -2)[0] || 'mock-storyboard';
          return JSON.stringify(createMockWorkflowTemplate(workflowName, storyboardName));
        }
        return '{}';
      };

      return (
        <MockPanelProvider
          contextOverrides={{
            fileTree: {
              scope: 'repository' as const,
              name: 'fileTree',
              data: mockFileTree,
              loading: false,
              error: null,
              refresh: async () => {},
            },
            repositoryPath: '/mock/repository',
          }}
          actionsOverrides={{
            readFile: mockReadFile,
            writeFile: async (path: string, content: string) => {
              console.log('[Mock writeFile]', path, content.slice(0, 100) + '...');
            },
          }}
        >
          {(props) => (
            <PanelInner
              props={props}
              editorState={editorState}
              setEditorState={setEditorState}
            />
          )}
        </MockPanelProvider>
      );
    };

    return <PartialMatchWrapper />;
  },
};

/**
 * Demonstrates workflow subset focusing behavior:
 * - Canvas has 8 nodes spread across the view
 * - Two separate workflows, each covering different subsets of nodes
 * - Click "request-processing" workflow → focuses on 5 nodes (right side)
 * - Click "observability" workflow → focuses on 3 nodes (left side)
 */
export const WorkflowFocusSubset: Story = {
  render: () => {
    // Extended canvas with 8 nodes
    const extendedCanvas = {
      pv: {
        name: 'System Overview',
        version: '1.0.0',
        description: 'Canvas with 8 nodes covered by 2 different workflows',
        edgeTypes: {
          'data-flow': { color: '#3b82f6', width: 2, style: 'solid', directed: true },
          'triggers': { color: '#10b981', width: 2, style: 'dashed', directed: true },
          'monitoring': { color: '#6366f1', width: 2, style: 'dotted', directed: true },
        },
      },
      nodes: [
        // === Request processing nodes (5 nodes, right side) ===
        {
          id: 'request-received',
          type: 'text',
          text: 'Request Received',
          x: 200,
          y: 200,
          width: 160,
          height: 70,
          pv: { nodeType: 'event', fill: '#3b82f6', eventRef: 'request.received' },
        },
        {
          id: 'validate-input',
          type: 'text',
          text: 'Validate Input',
          x: 430,
          y: 200,
          width: 160,
          height: 70,
          pv: { nodeType: 'event', fill: '#f59e0b', eventRef: 'input.validated' },
        },
        {
          id: 'process-data',
          type: 'text',
          text: 'Process Data',
          x: 660,
          y: 200,
          width: 160,
          height: 70,
          pv: { nodeType: 'event', fill: '#8b5cf6', eventRef: 'data.processed' },
        },
        {
          id: 'send-response',
          type: 'text',
          text: 'Send Response',
          x: 890,
          y: 200,
          width: 160,
          height: 70,
          pv: { nodeType: 'event', fill: '#10b981', eventRef: 'response.sent' },
        },
        {
          id: 'log-error',
          type: 'text',
          text: 'Log Error',
          x: 430,
          y: 350,
          width: 160,
          height: 70,
          pv: { nodeType: 'event', fill: '#ef4444', eventRef: 'error.logged' },
        },
        // === Observability nodes (3 nodes, left side) ===
        {
          id: 'metrics-collected',
          type: 'text',
          text: 'Metrics Collected',
          x: -150,
          y: 50,
          width: 160,
          height: 70,
          pv: { nodeType: 'event', fill: '#6366f1', eventRef: 'metrics.collected' },
        },
        {
          id: 'cache-updated',
          type: 'text',
          text: 'Cache Updated',
          x: -150,
          y: 200,
          width: 160,
          height: 70,
          pv: { nodeType: 'event', fill: '#06b6d4', eventRef: 'cache.updated' },
        },
        {
          id: 'audit-logged',
          type: 'text',
          text: 'Audit Logged',
          x: -150,
          y: 350,
          width: 160,
          height: 70,
          pv: { nodeType: 'event', fill: '#a855f7', eventRef: 'audit.logged' },
        },
      ],
      edges: [
        { id: 'e1', fromNode: 'request-received', toNode: 'validate-input', pv: { edgeType: 'data-flow' } },
        { id: 'e2', fromNode: 'validate-input', toNode: 'process-data', pv: { edgeType: 'data-flow' } },
        { id: 'e3', fromNode: 'process-data', toNode: 'send-response', pv: { edgeType: 'data-flow' } },
        { id: 'e4', fromNode: 'validate-input', toNode: 'log-error', pv: { edgeType: 'triggers' } },
        { id: 'e5', fromNode: 'request-received', toNode: 'metrics-collected', pv: { edgeType: 'monitoring' } },
        { id: 'e6', fromNode: 'process-data', toNode: 'cache-updated', pv: { edgeType: 'monitoring' } },
        { id: 'e7', fromNode: 'send-response', toNode: 'audit-logged', pv: { edgeType: 'monitoring' } },
      ],
    };

    // Workflow 1: Request Processing (covers 5 nodes)
    const requestProcessingWorkflow: WorkflowTemplate = {
      version: '1.0.0',
      name: 'Request Processing',
      canvas: 'system-overview.otel.canvas',
      mode: 'timeline',
      scenarioSelection: 'first-match',
      scenarios: [
        {
          id: 'happy-path',
          priority: 1,
          description: 'Successful request flow',
          template: {
            introduction: 'Request Processing',
            events: {
              'request.received': 'Request received from {{client.name}}',
              'input.validated': 'Input validated successfully',
              'data.processed': 'Data processed in {{processing.duration}}ms',
              'response.sent': 'Response sent with status {{response.status}}',
              'error.logged': 'Error logged if validation fails',
            },
            summary: 'Request completed.',
          },
        },
      ],
    };

    // Workflow 2: Observability (covers 3 nodes)
    const observabilityWorkflow: WorkflowTemplate = {
      version: '1.0.0',
      name: 'Observability',
      canvas: 'system-overview.otel.canvas',
      mode: 'timeline',
      scenarioSelection: 'first-match',
      scenarios: [
        {
          id: 'monitoring-flow',
          priority: 1,
          description: 'System monitoring and audit trail',
          template: {
            introduction: 'Observability',
            events: {
              'metrics.collected': 'Metrics collected: {{metrics.count}} data points',
              'cache.updated': 'Cache updated with TTL {{cache.ttl}}s',
              'audit.logged': 'Audit entry created for {{audit.action}}',
            },
            summary: 'Monitoring complete.',
          },
        },
      ],
    };

    // Build file tree with the new storyboard
    const buildExtendedFileTree = (): FileTree => {
      const files = [
        // system-overview storyboard with 2 workflows
        {
          name: 'system-overview.otel.canvas',
          relativePath: '.principal-views/system-overview/system-overview.otel.canvas',
          path: '.principal-views/system-overview/system-overview.otel.canvas',
          extension: '.canvas',
          size: 2048,
          lastModified: new Date('2024-01-15'),
          isDirectory: false,
        },
        {
          name: 'request-processing.workflow.json',
          relativePath: '.principal-views/system-overview/request-processing/request-processing.workflow.json',
          path: '.principal-views/system-overview/request-processing/request-processing.workflow.json',
          extension: '.json',
          size: 1024,
          lastModified: new Date('2024-01-15'),
          isDirectory: false,
        },
        {
          name: 'observability.workflow.json',
          relativePath: '.principal-views/system-overview/observability/observability.workflow.json',
          path: '.principal-views/system-overview/observability/observability.workflow.json',
          extension: '.json',
          size: 1024,
          lastModified: new Date('2024-01-15'),
          isDirectory: false,
        },
      ];

      const filePaths = files.map(f => f.path);
      const builder = new PathsFileTreeBuilder();
      const fileTree = builder.build({ files: filePaths });
      fileTree.allFiles = files;
      fileTree.sha = 'mock-sha-workflow-focus';

      return fileTree;
    };

    const WorkflowFocusWrapper: React.FC = () => {
      const [editorState, setEditorState] = useState<EditorPanelState | null>(null);
      const extendedFileTree = buildExtendedFileTree();

      const mockReadFile = async (path: string) => {
        // Return the extended canvas
        if (path.includes('system-overview') && (path.endsWith('.otel.canvas') || path.endsWith('.canvas'))) {
          return JSON.stringify(extendedCanvas);
        }
        // Return request-processing workflow
        if (path.includes('request-processing') && path.endsWith('.workflow.json')) {
          return JSON.stringify(requestProcessingWorkflow);
        }
        // Return observability workflow
        if (path.includes('observability') && path.endsWith('.workflow.json')) {
          return JSON.stringify(observabilityWorkflow);
        }
        return '{}';
      };

      return (
        <MockPanelProvider
          contextOverrides={{
            fileTree: {
              scope: 'repository' as const,
              name: 'fileTree',
              data: extendedFileTree,
              loading: false,
              error: null,
              refresh: async () => {},
            },
            repositoryPath: '/mock/repository',
          }}
          actionsOverrides={{
            readFile: mockReadFile,
            writeFile: async (path: string, content: string) => {
              console.log('[Mock writeFile]', path, content.slice(0, 100) + '...');
            },
          }}
        >
          {(props) => (
            <PanelInner
              props={props}
              editorState={editorState}
              setEditorState={setEditorState}
            />
          )}
        </MockPanelProvider>
      );
    };

    return <WorkflowFocusWrapper />;
  },
};

/**
 * With multiple matches - demonstrates when a trace matches multiple scenarios
 */
export const WithMultipleMatches: Story = {
  render: () => {
    const MultipleMatchWrapper: React.FC = () => {
      const [editorState, setEditorState] = useState<EditorPanelState | null>({
        canvasPath: '.principal-views/authentication-flow/authentication-flow.otel.canvas',
        canvasName: 'Authentication Flow',
        workflowId: 'login-process',
        workflowPath: '.principal-views/authentication-flow/login-process/login-process.workflow.json',
        workflowTemplate: createMockWorkflowTemplate('login-process', 'authentication-flow'),
        // Simulating a trace that matched both scenarios (different coverage)
        traceMatchInfo: [
          {
            scenarioId: 'login-process-happy-path',
            matchType: 'full',
            coveragePercent: 100,
          },
          {
            scenarioId: 'login-process-validation-error',
            matchType: 'partial',
            coveragePercent: 50,
          },
        ],
      });

      const mockReadFile = async (path: string) => {
        if (path.endsWith('.otel.canvas') || path.endsWith('.canvas')) {
          const storyboardName = path.split('/').slice(-2, -1)[0] || 'mock-canvas';
          return JSON.stringify(createMockCanvas(storyboardName));
        }
        if (path.endsWith('.workflow.json')) {
          const workflowName = path.split('/').slice(-2, -1)[0] || 'mock-workflow';
          const storyboardName = path.split('/').slice(-3, -2)[0] || 'mock-storyboard';
          return JSON.stringify(createMockWorkflowTemplate(workflowName, storyboardName));
        }
        return '{}';
      };

      return (
        <MockPanelProvider
          contextOverrides={{
            fileTree: {
              scope: 'repository' as const,
              name: 'fileTree',
              data: mockFileTree,
              loading: false,
              error: null,
              refresh: async () => {},
            },
            repositoryPath: '/mock/repository',
          }}
          actionsOverrides={{
            readFile: mockReadFile,
            writeFile: async (path: string, content: string) => {
              console.log('[Mock writeFile]', path, content.slice(0, 100) + '...');
            },
          }}
        >
          {(props) => (
            <PanelInner
              props={props}
              editorState={editorState}
              setEditorState={setEditorState}
            />
          )}
        </MockPanelProvider>
      );
    };

    return <MultipleMatchWrapper />;
  },
};

/**
 * Events Canvas Editor - demonstrates opening an events canvas file
 * Events canvases document the event vocabulary for each instrumentation scope
 */
export const EventsCanvasEditor: Story = {
  render: () => {
    const EventsCanvasWrapper: React.FC = () => {
      const [editorState, setEditorState] = useState<EditorPanelState | null>({
        canvasPath: '.principal-views/backlog-md.events.canvas',
        canvasName: 'backlog.md Events',
        // No workflowTemplate - pure editor mode for events canvas
      });

      // Mock events canvas with event vocabulary documentation
      const eventsCanvasMock = {
        pv: {
          name: 'backlog.md Events',
          version: '1.0.0',
          description: 'Event vocabulary for the backlog.md instrumentation scope',
          markdown: '.principal-views/backlog-md.events.md',
        },
        nodes: [
          {
            id: 'task-created',
            type: 'text',
            text: 'task.created',
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            pv: {
              nodeType: 'event',
              fill: '#3b82f6',
              eventRef: 'task.created',
              sources: ['src/tasks/create.ts:45'],
            },
          },
          {
            id: 'task-updated',
            type: 'text',
            text: 'task.updated',
            x: 350,
            y: 100,
            width: 200,
            height: 100,
            pv: {
              nodeType: 'event',
              fill: '#f59e0b',
              eventRef: 'task.updated',
              sources: ['src/tasks/update.ts:32'],
            },
          },
          {
            id: 'task-completed',
            type: 'text',
            text: 'task.completed',
            x: 600,
            y: 100,
            width: 200,
            height: 100,
            pv: {
              nodeType: 'event',
              fill: '#10b981',
              eventRef: 'task.completed',
              sources: ['src/tasks/complete.ts:28'],
            },
          },
          {
            id: 'task-deleted',
            type: 'text',
            text: 'task.deleted',
            x: 350,
            y: 250,
            width: 200,
            height: 100,
            pv: {
              nodeType: 'event',
              fill: '#ef4444',
              eventRef: 'task.deleted',
              sources: ['src/tasks/delete.ts:19'],
            },
          },
        ],
        edges: [
          { id: 'e1', fromNode: 'task-created', toNode: 'task-updated', pv: { edgeType: 'data-flow' } },
          { id: 'e2', fromNode: 'task-updated', toNode: 'task-completed', pv: { edgeType: 'data-flow' } },
          { id: 'e3', fromNode: 'task-updated', toNode: 'task-deleted', pv: { edgeType: 'data-flow' } },
        ],
      };

      // Build file tree with events canvas
      const buildEventsFileTree = (): FileTree => {
        const files = [
          {
            name: 'backlog-md.events.canvas',
            relativePath: '.principal-views/backlog-md.events.canvas',
            path: '.principal-views/backlog-md.events.canvas',
            extension: '.canvas',
            size: 2048,
            lastModified: new Date('2024-01-15'),
            isDirectory: false,
          },
          {
            name: 'backlog-md.events.md',
            relativePath: '.principal-views/backlog-md.events.md',
            path: '.principal-views/backlog-md.events.md',
            extension: '.md',
            size: 512,
            lastModified: new Date('2024-01-15'),
            isDirectory: false,
          },
        ];

        const filePaths = files.map(f => f.path);
        const builder = new PathsFileTreeBuilder();
        const fileTree = builder.build({ files: filePaths });
        fileTree.allFiles = files;
        fileTree.sha = 'mock-sha-events-canvas';

        return fileTree;
      };

      const eventsFileTree = buildEventsFileTree();

      const mockReadFile = async (path: string) => {
        // Return events canvas content
        if (path.endsWith('.events.canvas')) {
          return JSON.stringify(eventsCanvasMock);
        }
        // Return markdown documentation
        if (path.endsWith('.events.md')) {
          return `# backlog.md Event Vocabulary

This canvas documents the event vocabulary for the backlog.md instrumentation scope.

## Events

### task.created
Emitted when a new task is created in the backlog.

**Attributes:**
- \`task.id\`: string - Unique identifier for the task
- \`task.title\`: string - Task title
- \`task.priority\`: string - Priority level (high, medium, low)

### task.updated
Emitted when a task is updated.

**Attributes:**
- \`task.id\`: string - Task identifier
- \`task.field\`: string - Field that was updated
- \`task.old_value\`: string - Previous value
- \`task.new_value\`: string - New value

### task.completed
Emitted when a task is marked as complete.

**Attributes:**
- \`task.id\`: string - Task identifier
- \`task.completion_time\`: number - Time to complete in milliseconds

### task.deleted
Emitted when a task is deleted from the backlog.

**Attributes:**
- \`task.id\`: string - Task identifier
- \`task.reason\`: string - Reason for deletion
`;
        }
        return '{}';
      };

      return (
        <MockPanelProvider
          contextOverrides={{
            fileTree: {
              scope: 'repository' as const,
              name: 'fileTree',
              data: eventsFileTree,
              loading: false,
              error: null,
              refresh: async () => {},
            },
            repositoryPath: '/mock/repository',
          }}
          actionsOverrides={{
            readFile: mockReadFile,
            writeFile: async (path: string, content: string) => {
              console.log('[Mock writeFile]', path, content.slice(0, 100) + '...');
            },
          }}
        >
          {(props) => (
            <PanelInner
              props={props}
              editorState={editorState}
              setEditorState={setEditorState}
            />
          )}
        </MockPanelProvider>
      );
    };

    return <EventsCanvasWrapper />;
  },
};

/**
 * Simulates opening CanvasEditorPanel in a tabbed container (like TabbedTerminalPanel).
 * This reproduces the issue where opening a canvas from StoryboardListPanel into a tab
 * causes dimension changes that affect the canvas fit.
 */
export const WithTabbedContainer: Story = {
  render: () => {
    interface TabDefinition {
      id: string;
      label: string;
      type: 'terminal' | 'canvas';
      canvasState?: EditorPanelState;
    }

    const TabbedContainerWrapper: React.FC = () => {
      const [tabs, setTabs] = useState<TabDefinition[]>([
        { id: 'terminal-1', label: 'Terminal 1', type: 'terminal' },
      ]);
      const [activeTabId, setActiveTabId] = useState('terminal-1');
      const [dimensionHistory, setDimensionHistory] = useState<{ w: number; h: number }[]>([]);
      const canvasContainerRef = React.useRef<HTMLDivElement>(null);

      // Track dimensions of the canvas container
      useEffect(() => {
        if (!canvasContainerRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
          const w = Math.round(entry.contentRect.width);
          const h = Math.round(entry.contentRect.height);
          setDimensionHistory(prev => {
            const last = prev[prev.length - 1];
            if (!last || last.w !== w || last.h !== h) {
              console.log('[TabbedContainer] Dimension change:', { w, h });
              return [...prev.slice(-20), { w, h }];
            }
            return prev;
          });
        });
        observer.observe(canvasContainerRef.current);
        return () => observer.disconnect();
      }, [activeTabId]);

      const mockReadFile = async (path: string) => {
        if (path.endsWith('.otel.canvas') || path.endsWith('.canvas')) {
          const storyboardName = path.split('/').slice(-2, -1)[0] || 'mock-canvas';
          return JSON.stringify(createMockCanvas(storyboardName));
        }
        if (path.endsWith('.workflow.json')) {
          const workflowName = path.split('/').slice(-2, -1)[0] || 'mock-workflow';
          const storyboardName = path.split('/').slice(-3, -2)[0] || 'mock-storyboard';
          return JSON.stringify(createMockWorkflowTemplate(workflowName, storyboardName));
        }
        return '{}';
      };

      // Open canvas in new tab (simulates what happens in electron app)
      const openCanvasInTab = (canvasState: EditorPanelState) => {
        const tabId = `canvas-${Date.now()}`;
        const newTab: TabDefinition = {
          id: tabId,
          label: canvasState.canvasName || 'Canvas',
          type: 'canvas',
          canvasState,
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(tabId);
      };

      const closeTab = (tabId: string) => {
        setTabs(prev => prev.filter(t => t.id !== tabId));
        if (activeTabId === tabId) {
          setActiveTabId(tabs[0]?.id || '');
        }
      };

      const { theme } = useTheme();
      const activeTab = tabs.find(t => t.id === activeTabId);

      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Debug info */}
          <div style={{
            padding: '8px 12px',
            background: dimensionHistory.some((d, i, arr) => i > 0 && Math.abs(arr[i-1].w - d.w) > 50) ? '#fff3e0' : '#e8f5e9',
            borderBottom: '1px solid #333',
            fontFamily: 'monospace',
            fontSize: '11px',
            flexShrink: 0,
          }}>
            <div>Canvas dimensions: {dimensionHistory.slice(-5).map(d => `${d.w}x${d.h}`).join(' → ')}</div>
          </div>

          {/* Tab bar */}
          <div style={{
            display: 'flex',
            background: theme.colors.surface,
            borderBottom: `1px solid ${theme.colors.border}`,
            padding: '4px 8px',
            gap: '4px',
            flexShrink: 0,
          }}>
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                style={{
                  padding: '6px 12px',
                  background: activeTabId === tab.id ? theme.colors.background : 'transparent',
                  color: activeTabId === tab.id ? theme.colors.text : theme.colors.textMuted,
                  borderRadius: '4px 4px 0 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                }}
              >
                <span>{tab.type === 'terminal' ? '>' : '◇'}</span>
                <span>{tab.label}</span>
                {tab.type === 'canvas' && (
                  <span
                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                    style={{ opacity: 0.5, cursor: 'pointer' }}
                  >×</span>
                )}
              </div>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <MockPanelProvider
              contextOverrides={{
                fileTree: {
                  scope: 'repository' as const,
                  name: 'fileTree',
                  data: mockFileTree,
                  loading: false,
                  error: null,
                  refresh: async () => {},
                },
                repositoryPath: '/mock/repository',
              }}
              actionsOverrides={{
                readFile: mockReadFile,
                writeFile: async () => {},
              }}
            >
              {(props) => (
                <>
                  {/* Terminal tabs - show mock terminal */}
                  {activeTab?.type === 'terminal' && (
                    <div style={{
                      flex: 1,
                      background: '#1a1a1a',
                      color: '#00ff00',
                      padding: '12px',
                      fontFamily: 'monospace',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        Mock Terminal - Click a workflow in the sidebar to open it in a new tab
                      </div>
                      <div style={{ flex: 1 }}>
                        <AnimatedResizableLayout
                          leftPanel={
                            <StoryboardListPanel
                              {...props}
                              onNodeClick={(node) => {
                                if (node.type === 'workflow') {
                                  openCanvasInTab({
                                    canvasPath: node.canvasPath,
                                    canvasName: node.canvasName,
                                    workflowId: node.workflowId,
                                    workflowPath: node.workflowPath,
                                    workflowTemplate: node.workflow,
                                  });
                                } else if (node.type === 'canvas') {
                                  openCanvasInTab({
                                    canvasPath: node.path,
                                    canvasName: node.name,
                                  });
                                }
                              }}
                            />
                          }
                          rightPanel={
                            <div style={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: theme.colors.textMuted,
                            }}>
                              Select a canvas or workflow to open in a new tab
                            </div>
                          }
                          defaultSize={30}
                          minSize={20}
                          theme={theme}
                        />
                      </div>
                    </div>
                  )}

                  {/* Canvas tabs */}
                  {activeTab?.type === 'canvas' && activeTab.canvasState && (
                    <div
                      ref={canvasContainerRef}
                      style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
                    >
                      <CanvasEditorPanel
                        {...props}
                        canvasPath={activeTab.canvasState.canvasPath}
                        canvasName={activeTab.canvasState.canvasName}
                        workflowTemplate={activeTab.canvasState.workflowTemplate}
                        selectedWorkflowId={activeTab.canvasState.workflowId}
                        workflowPath={activeTab.canvasState.workflowPath}
                      />
                    </div>
                  )}
                </>
              )}
            </MockPanelProvider>
          </div>
        </div>
      );
    };

    return (
      <ThemeProvider>
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
          <TabbedContainerWrapper />
        </div>
      </ThemeProvider>
    );
  },
};
