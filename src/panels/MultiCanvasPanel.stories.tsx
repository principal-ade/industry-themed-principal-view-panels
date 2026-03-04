import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { MultiCanvasPanel, createMultiCanvasLayout } from './MultiCanvasPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import type { MultiCanvasLayout } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas } from '@principal-ai/principal-view-core';

// Import the canvas data
import checkoutFlowCanvas from '../demo/data/canvases/checkout-flow.otel.canvas.json';

// Workflow scenarios panel canvas (inline since it's not in a standard JSON location)
const workflowScenariosCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'panel-loading',
      type: 'text',
      text: '# Panel Loading\n\nEmitted when the panel begins loading',
      x: 0,
      y: 0,
      width: 280,
      height: 120,
      color: '#6366f1',
    },
    {
      id: 'panel-loaded',
      type: 'text',
      text: '# Panel Loaded\n\nCanvas and workflow loaded',
      x: 320,
      y: 0,
      width: 280,
      height: 120,
      color: '#10b981',
    },
    {
      id: 'panel-error',
      type: 'text',
      text: '# Panel Error\n\nLoading failed',
      x: 640,
      y: 0,
      width: 280,
      height: 120,
      color: '#ef4444',
    },
    {
      id: 'scenario-selected',
      type: 'text',
      text: '# Scenario Selected\n\nUser selects a scenario',
      x: 0,
      y: 160,
      width: 280,
      height: 120,
      color: '#8b5cf6',
    },
    {
      id: 'trace-selected',
      type: 'text',
      text: '# Trace Selected\n\nUser selects a trace',
      x: 320,
      y: 160,
      width: 280,
      height: 120,
      color: '#f59e0b',
    },
    {
      id: 'trace-loaded',
      type: 'text',
      text: '# Trace Loaded\n\nTrace data rendered',
      x: 640,
      y: 160,
      width: 280,
      height: 120,
      color: '#10b981',
    },
    {
      id: 'node-clicked',
      type: 'text',
      text: '# Node Clicked\n\nUser clicks canvas node',
      x: 0,
      y: 320,
      width: 280,
      height: 120,
      color: '#ec4899',
    },
    {
      id: 'playback-started',
      type: 'text',
      text: '# Playback Started\n\nTrace playback begins',
      x: 320,
      y: 320,
      width: 280,
      height: 120,
      color: '#84cc16',
    },
    {
      id: 'playback-stopped',
      type: 'text',
      text: '# Playback Stopped\n\nPlayback ends',
      x: 640,
      y: 320,
      width: 280,
      height: 120,
      color: '#64748b',
    },
  ],
  edges: [
    {
      id: 'edge-loading-loaded',
      fromNode: 'panel-loading',
      toNode: 'panel-loaded',
    },
    {
      id: 'edge-loading-error',
      fromNode: 'panel-loading',
      toNode: 'panel-error',
    },
    {
      id: 'edge-loaded-scenario',
      fromNode: 'panel-loaded',
      toNode: 'scenario-selected',
    },
    {
      id: 'edge-scenario-trace',
      fromNode: 'scenario-selected',
      toNode: 'trace-selected',
    },
    {
      id: 'edge-trace-loaded',
      fromNode: 'trace-selected',
      toNode: 'trace-loaded',
    },
    {
      id: 'edge-trace-playback',
      fromNode: 'trace-loaded',
      toNode: 'playback-started',
    },
    {
      id: 'edge-playback-stop',
      fromNode: 'playback-started',
      toNode: 'playback-stopped',
    },
    {
      id: 'edge-loaded-node-click',
      fromNode: 'panel-loaded',
      toNode: 'node-clicked',
    },
  ],
  pv: {
    name: 'Workflow Scenarios Panel',
    version: '1.0.0',
    description: 'OTEL event schema for the WorkflowScenariosPanel component',
  },
};

/**
 * MultiCanvasPanel displays multiple canvases on a single unified view.
 * Uses the MultiCanvasRenderer from @principal-ai/principal-view-react.
 */
const meta = {
  title: 'Panels/MultiCanvasPanel',
  component: MultiCanvasPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Displays multiple canvases on one unified view using MultiCanvasRenderer. Supports grouping, controls, and minimap navigation.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', width: '100vw', background: '#1a1a2e' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof MultiCanvasPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Create the multi-canvas layout using the helper
const otelCanvasesLayout = createMultiCanvasLayout(
  [
    {
      id: 'checkout-flow',
      canvas: checkoutFlowCanvas as ExtendedCanvas,
      label: 'Checkout Flow',
    },
    {
      id: 'workflow-scenarios',
      canvas: workflowScenariosCanvas,
      label: 'Workflow Scenarios Panel',
    },
  ],
  { direction: 'vertical', gap: 150 }
);

/**
 * Default view showing both OTEL canvases with group borders
 */
export const Default: Story = {
  args: {
    layout: otelCanvasesLayout,
    showGroups: true,
    showControls: true,
    showBackground: true,
  },
};

/**
 * Without group borders - canvases merge visually
 */
export const NoGroups: Story = {
  args: {
    layout: otelCanvasesLayout,
    showGroups: false,
    showControls: true,
    showBackground: true,
  },
};

/**
 * With minimap for easier navigation of large canvas areas
 */
export const WithMinimap: Story = {
  args: {
    layout: otelCanvasesLayout,
    showGroups: true,
    showControls: true,
    showBackground: true,
    showMinimap: true,
  },
};

/**
 * Horizontal layout - canvases side by side
 */
const horizontalLayout = createMultiCanvasLayout(
  [
    {
      id: 'checkout-flow',
      canvas: checkoutFlowCanvas as ExtendedCanvas,
      label: 'Checkout Flow',
    },
    {
      id: 'workflow-scenarios',
      canvas: workflowScenariosCanvas,
      label: 'Workflow Scenarios Panel',
    },
  ],
  { direction: 'horizontal', gap: 200 }
);

export const HorizontalLayout: Story = {
  args: {
    layout: horizontalLayout,
    showGroups: true,
    showControls: true,
    showBackground: true,
  },
};

/**
 * Lines background variant
 */
export const LinesBackground: Story = {
  args: {
    layout: otelCanvasesLayout,
    showGroups: true,
    showControls: true,
    showBackground: true,
    backgroundVariant: 'lines',
  },
};
