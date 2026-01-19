import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { HierarchicalCanvasCompositionExplainerPanel } from './HierarchicalCanvasCompositionExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * HierarchicalCanvasCompositionExplainerPanel explains how to decompose complex systems
 * into composable canvases using OTEL parent-child span relationships.
 */
const meta = {
  title: 'Panels/HierarchicalCanvasCompositionExplainerPanel',
  component: HierarchicalCanvasCompositionExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel explaining hierarchical canvas composition patterns including layered architecture, feature modules, subsystems, async workflows, zoom levels, and test scopes.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof HierarchicalCanvasCompositionExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the hierarchical composition explanation
 */
export const Default: Story = {
  args: {},
};

/**
 * Wrapped in a container to show how it looks in a constrained space
 */
export const InContainer: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ width: '800px', height: '600px', margin: '0 auto', overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
};
