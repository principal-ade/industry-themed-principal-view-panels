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
