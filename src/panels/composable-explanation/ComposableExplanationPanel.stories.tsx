import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ComposableExplanationPanel } from './ComposableExplanationPanel';
import { StepCarousel } from './StepCarousel';
import { StoryGraphRenderer } from './StoryGraphRenderer';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../../mocks/panelContext';
import type { ComposableExplanation, ExplanationStep } from './types';
import type { StoryStep } from './StoryGraphRenderer';
import type { ExtendedCanvas } from '@principal-ai/principal-view-core';

/**
 * ComposableExplanationPanel - Agent-Generated Codebase Explanations
 *
 * This panel displays interactive walkthroughs of codebases that combine:
 * - Canvas visualizations (architecture diagrams)
 * - Step-by-step narrative explanations
 * - Node highlighting synchronized with the current step
 *
 * ## Render Modes:
 * - **Story Mode**: Shows only relevant canvas fragments per step (focused, distraction-free)
 * - **Full Mode**: Shows entire canvas with highlighted nodes (traditional view)
 *
 * ## Use Cases:
 * - **Code Reviews**: Walk through PR changes with visual context
 * - **Onboarding**: Guide new team members through architecture
 * - **Exploration**: Answer "How does X work?" with visual aids
 * - **Design Specs**: Propose changes with before/after views
 */
const meta = {
  title: 'Panels/ComposableExplanationPanel',
  component: ComposableExplanationPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive codebase explanation panel with canvas visualization and step-through navigation. Toggle between Story mode (focused fragments) and Full mode (complete canvas).',
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
} satisfies Meta<typeof ComposableExplanationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Mock Data - Architecture Canvas (High-level)
// ============================================================================

const architectureCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'main-process',
      type: 'text',
      text: '# Main Process',
      x: 200,
      y: 50,
      width: 180,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'process',
        fill: '#3b82f6',
      },
    },
    {
      id: 'renderer-process',
      type: 'text',
      text: '# Renderer',
      x: 500,
      y: 50,
      width: 160,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'process',
        fill: '#06b6d4',
      },
    },
    {
      id: 'worker-process',
      type: 'text',
      text: '# Worker',
      x: 200,
      y: 200,
      width: 160,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'process',
        fill: '#8b5cf6',
      },
    },
    {
      id: 'database',
      type: 'text',
      text: '# Database',
      x: 500,
      y: 200,
      width: 160,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'storage',
        fill: '#f59e0b',
      },
    },
  ],
  edges: [
    { id: 'e1', fromNode: 'main-process', toNode: 'renderer-process', label: 'IPC' },
    { id: 'e2', fromNode: 'main-process', toNode: 'worker-process', label: 'spawn' },
    { id: 'e3', fromNode: 'worker-process', toNode: 'database', label: 'query' },
    { id: 'e4', fromNode: 'renderer-process', toNode: 'database', label: 'read' },
  ],
  pv: {
    name: 'Architecture Overview',
  },
};

// ============================================================================
// Mock Data - MCP Bridge Canvas (Detail)
// ============================================================================

const mcpBridgeCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'mcp-client',
      type: 'text',
      text: '# MCP Client',
      x: 100,
      y: 50,
      width: 160,
      height: 70,
      color: '#1e3a5f',
      pv: {
        nodeType: 'component',
        fill: '#3b82f6',
        sources: ['src/mcp/client.ts'],
      },
    },
    {
      id: 'express-server',
      type: 'text',
      text: '# Express Server',
      x: 350,
      y: 50,
      width: 180,
      height: 70,
      color: '#1e3a5f',
      pv: {
        nodeType: 'service',
        fill: '#10b981',
        sources: ['src/main/principal-mcp/PrincipalMCPBridge.ts'],
      },
    },
    {
      id: 'theme-update-route',
      type: 'text',
      text: '# POST /theme',
      x: 350,
      y: 170,
      width: 180,
      height: 70,
      color: '#1e3a5f',
      pv: {
        nodeType: 'route',
        fill: '#f59e0b',
        sources: ['src/main/principal-mcp/PrincipalMCPBridge.ts:245-260'],
      },
    },
    {
      id: 'theme-prefs-update',
      type: 'text',
      text: '# User Prefs Handler',
      x: 350,
      y: 290,
      width: 180,
      height: 70,
      color: '#1e3a5f',
      pv: {
        nodeType: 'handler',
        fill: '#8b5cf6',
        sources: ['src/main/stores/userPreferencesHandler.ts'],
      },
    },
    {
      id: 'theme-renderer-broadcast',
      type: 'text',
      text: '# IPC Broadcast',
      x: 600,
      y: 290,
      width: 160,
      height: 70,
      color: '#1e3a5f',
      pv: {
        nodeType: 'ipc',
        fill: '#ec4899',
        sources: ['src/main/theme/themeHandler.ts'],
      },
    },
  ],
  edges: [
    { id: 'e1', fromNode: 'mcp-client', toNode: 'express-server' },
    { id: 'e2', fromNode: 'express-server', toNode: 'theme-update-route' },
    { id: 'e3', fromNode: 'theme-update-route', toNode: 'theme-prefs-update' },
    { id: 'e4', fromNode: 'theme-prefs-update', toNode: 'theme-renderer-broadcast' },
  ],
  pv: {
    name: 'MCP Bridge',
  },
};

// ============================================================================
// Mock Explanation - Single Canvas (Theme Flow)
// ============================================================================

const themeFlowExplanation: ComposableExplanation = {
  type: 'exploration',
  version: '1.0.0',
  title: 'How Theme Updates Work',
  question: 'How does the app handle theme changes from MCP clients?',
  summary:
    'Theme changes flow through an HTTP bridge to preferences storage, then broadcast to all renderer windows.',

  canvases: {
    'mcp-bridge': '.principal-views/principal-mcp-bridge/principal-mcp-bridge.canvas',
  },

  steps: [
    {
      id: 'step-1',
      title: 'MCP Client Request',
      ref: 'mcp-bridge:mcp-client',
      content:
        'An MCP client (like Claude Desktop) sends a theme update request. This could be triggered by the user asking to change the app theme.',
      focus: {
        existing: ['mcp-client'],
      },
    },
    {
      id: 'step-2',
      title: 'Express Server',
      ref: 'mcp-bridge:express-server',
      content:
        'The request arrives at the Express server running in the Electron main process. This server bridges external MCP clients to internal systems.',
      source: 'src/main/principal-mcp/PrincipalMCPBridge.ts',
      focus: {
        existing: ['mcp-client', 'express-server'],
      },
    },
    {
      id: 'step-3',
      title: 'Theme Route Handler',
      ref: 'mcp-bridge:theme-update-route',
      content:
        'The POST /theme route validates the theme data and prepares it for storage. Invalid themes are rejected with appropriate error messages.',
      source: 'src/main/principal-mcp/PrincipalMCPBridge.ts:245-260',
      focus: {
        existing: ['express-server', 'theme-update-route'],
      },
    },
    {
      id: 'step-4',
      title: 'Preferences Update',
      ref: 'mcp-bridge:theme-prefs-update',
      content:
        'The UserPreferencesHandler persists the new theme settings. This ensures the theme survives app restarts.',
      source: 'src/main/stores/userPreferencesHandler.ts',
      focus: {
        existing: ['theme-update-route', 'theme-prefs-update'],
      },
    },
    {
      id: 'step-5',
      title: 'IPC Broadcast',
      ref: 'mcp-bridge:theme-renderer-broadcast',
      content:
        'After persistence, an IPC message broadcasts the theme change to all renderer processes using webContents.send().',
      source: 'src/main/theme/themeHandler.ts',
      focus: {
        existing: ['theme-prefs-update', 'theme-renderer-broadcast'],
      },
    },
  ],

  related: {
    sources: [
      'src/main/principal-mcp/PrincipalMCPBridge.ts',
      'src/main/theme/themeHandler.ts',
    ],
  },
};

// ============================================================================
// Mock Explanation - Multi-Canvas (Cross-System Flow)
// ============================================================================

const multiCanvasExplanation: ComposableExplanation = {
  type: 'exploration',
  version: '1.0.0',
  title: 'Cross-Process Communication',
  question: 'How do theme changes flow across the system architecture?',
  summary:
    'This explanation shows how a theme change request flows from the architecture level down to the detail level.',

  canvases: {
    arch: '.principal-views/architecture/architecture.canvas',
    detail: '.principal-views/principal-mcp-bridge/principal-mcp-bridge.canvas',
  },

  bridges: [
    {
      id: 'main-to-express',
      from: 'arch:main-process',
      to: 'detail:express-server',
      label: 'contains',
      type: 'sync',
    },
  ],

  steps: [
    {
      id: 'overview',
      title: 'System Overview',
      content:
        'At the architecture level, we have a Main Process that coordinates with Renderer and Worker processes.',
      focus: {
        existing: ['main-process', 'renderer-process'],
      },
    },
    {
      id: 'zoom-main',
      title: 'Zoom: Main Process',
      ref: 'arch:main-process',
      content:
        'The Main Process hosts several services including the MCP Bridge. Let\'s zoom into how it handles theme requests.',
      focus: {
        existing: ['main-process'],
      },
    },
    {
      id: 'detail-server',
      title: 'Inside: Express Server',
      ref: 'detail:express-server',
      content:
        'Zooming in, the Main Process contains an Express server that handles MCP protocol requests.',
      focus: {
        existing: ['express-server', 'mcp-client'],
      },
    },
    {
      id: 'detail-route',
      title: 'Theme Route',
      ref: 'detail:theme-update-route',
      content:
        'The theme update goes through a dedicated route that validates and processes the request.',
      focus: {
        existing: ['express-server', 'theme-update-route', 'theme-prefs-update'],
      },
    },
    {
      id: 'back-to-arch',
      title: 'Back to Architecture',
      ref: 'arch:renderer-process',
      content:
        'After processing, the theme is broadcast to the Renderer process via IPC.',
      focus: {
        existing: ['main-process', 'renderer-process'],
      },
    },
  ],
};

// ============================================================================
// Pre-loaded Canvases Map
// ============================================================================

const singleCanvasMap = new Map<string, ExtendedCanvas>([
  ['mcp-bridge', mcpBridgeCanvas],
]);

const multiCanvasMap = new Map<string, ExtendedCanvas>([
  ['arch', architectureCanvas],
  ['detail', mcpBridgeCanvas],
]);

// ============================================================================
// Stories
// ============================================================================

/**
 * Story mode (default) - Shows only relevant fragments per step
 */
export const StoryMode: Story = {
  args: {},
  render: () => (
    <MockPanelProvider>
      {(props) => (
        <ComposableExplanationPanel
          {...props}
          explanation={themeFlowExplanation}
          canvases={singleCanvasMap}
          renderMode="story"
        />
      )}
    </MockPanelProvider>
  ),
};

/**
 * Full mode - Shows entire canvas with highlighted nodes
 */
export const FullMode: Story = {
  args: {},
  render: () => (
    <MockPanelProvider>
      {(props) => (
        <ComposableExplanationPanel
          {...props}
          explanation={themeFlowExplanation}
          canvases={singleCanvasMap}
          renderMode="full"
        />
      )}
    </MockPanelProvider>
  ),
};

/**
 * Multi-canvas - Shows fragments from different canvases as the story progresses
 */
export const MultiCanvas: Story = {
  args: {},
  render: () => (
    <MockPanelProvider>
      {(props) => (
        <ComposableExplanationPanel
          {...props}
          explanation={multiCanvasExplanation}
          canvases={multiCanvasMap}
          renderMode="story"
        />
      )}
    </MockPanelProvider>
  ),
};

/**
 * Without animations - Instant transitions between steps
 */
export const NoAnimations: Story = {
  args: {},
  render: () => (
    <MockPanelProvider>
      {(props) => (
        <ComposableExplanationPanel
          {...props}
          explanation={themeFlowExplanation}
          canvases={singleCanvasMap}
          renderMode="story"
          animateTransitions={false}
        />
      )}
    </MockPanelProvider>
  ),
};

/**
 * Empty state when no explanation is loaded
 */
export const EmptyState: Story = {
  args: {},
  render: () => (
    <MockPanelProvider>
      {(props) => <ComposableExplanationPanel {...props} explanation={null} />}
    </MockPanelProvider>
  ),
};

/**
 * Starting at a specific step
 */
export const StartAtStep3: Story = {
  args: {},
  render: () => (
    <MockPanelProvider>
      {(props) => (
        <ComposableExplanationPanel
          {...props}
          explanation={themeFlowExplanation}
          canvases={singleCanvasMap}
          initialStepIndex={2}
        />
      )}
    </MockPanelProvider>
  ),
};

/**
 * With taller carousel for more content
 */
export const TallCarousel: Story = {
  args: {},
  render: () => (
    <MockPanelProvider>
      {(props) => (
        <ComposableExplanationPanel
          {...props}
          explanation={themeFlowExplanation}
          canvases={singleCanvasMap}
          carouselHeight={250}
        />
      )}
    </MockPanelProvider>
  ),
};

// ============================================================================
// StoryGraphRenderer Standalone Stories
// ============================================================================

const storyGraphMeta = {
  title: 'Components/StoryGraphRenderer',
  component: StoryGraphRenderer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.FC) => (
      <ThemeProvider>
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof StoryGraphRenderer>;

const mockStorySteps: StoryStep[] = [
  {
    id: 'step1',
    nodes: { 'mcp-bridge': ['mcp-client'] },
    highlightNodeId: 'mcp-client',
  },
  {
    id: 'step2',
    nodes: { 'mcp-bridge': ['mcp-client', 'express-server'] },
    highlightNodeId: 'express-server',
  },
  {
    id: 'step3',
    nodes: { 'mcp-bridge': ['express-server', 'theme-update-route', 'theme-prefs-update'] },
    highlightNodeId: 'theme-update-route',
  },
  {
    id: 'step4',
    nodes: { 'mcp-bridge': ['theme-prefs-update', 'theme-renderer-broadcast'] },
    highlightNodeId: 'theme-renderer-broadcast',
  },
];

/**
 * StoryGraphRenderer standalone - for testing the fragment composition
 */
export const StoryGraphRendererDemo: StoryObj<typeof StoryGraphRenderer> = {
  render: () => {
    const [currentStep, setCurrentStep] = React.useState(0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1 }}>
          <StoryGraphRenderer
            canvases={singleCanvasMap}
            steps={mockStorySteps}
            currentStepIndex={currentStep}
            animateTransitions={true}
            fitViewOnStepChange={true}
          />
        </div>
        <div
          style={{
            padding: '16px',
            background: '#1a1a1a',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          {mockStorySteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              style={{
                padding: '8px 16px',
                background: i === currentStep ? '#3b82f6' : '#2a2a2a',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Step {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  },
};

// ============================================================================
// StepCarousel Standalone Stories
// ============================================================================

const mockCarouselSteps: ExplanationStep[] = [
  {
    id: '1',
    title: 'Introduction',
    content: 'Welcome to this guided tour of the codebase architecture.',
  },
  {
    id: '2',
    title: 'Data Flow',
    content: 'Data flows from the API layer through the service layer to the database.',
    source: 'src/services/dataService.ts',
  },
  {
    id: '3',
    title: 'Error Handling',
    content: 'Errors are caught at the middleware level and transformed into user-friendly responses.',
  },
  {
    id: '4',
    title: 'Conclusion',
    content: 'This architecture provides a clean separation of concerns and makes testing easier.',
  },
];

/**
 * Standalone carousel component
 */
export const CarouselStandalone: StoryObj<typeof StepCarousel> = {
  render: () => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    return (
      <div style={{ width: '600px', margin: '50px auto' }}>
        <StepCarousel
          steps={mockCarouselSteps}
          currentIndex={currentIndex}
          onStepChange={setCurrentIndex}
        />
      </div>
    );
  },
};

/**
 * Carousel with many steps
 */
export const CarouselManySteps: StoryObj<typeof StepCarousel> = {
  render: () => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const manySteps = Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1),
      title: `Step ${i + 1}`,
      content: `This is the content for step ${i + 1}. Each step explains a different part of the system.`,
    }));
    return (
      <div style={{ width: '600px', margin: '50px auto' }}>
        <StepCarousel
          steps={manySteps}
          currentIndex={currentIndex}
          onStepChange={setCurrentIndex}
        />
      </div>
    );
  },
};
