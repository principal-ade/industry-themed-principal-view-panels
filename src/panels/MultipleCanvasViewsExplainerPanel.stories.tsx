import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { MultipleCanvasViewsExplainerPanel } from './MultipleCanvasViewsExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * MultipleCanvasViewsExplainerPanel explains how the same trace can be validated
 * by multiple different canvases, each providing a different perspective.
 */
const meta = {
  title: 'ExplainerPanels/MultipleCanvasViewsExplainerPanel',
  component: MultipleCanvasViewsExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel explaining how multiple canvases can act as different "views" on the same trace data, enabling team autonomy, targeted alerts, and comprehensive validation coverage.',
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
} satisfies Meta<typeof MultipleCanvasViewsExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the multiple canvas views explanation
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
