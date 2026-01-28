import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { CanvasTypesExplainerPanel } from './CanvasTypesExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * CanvasTypesExplainerPanel explains the difference between .canvas (static documentation)
 * and .otel.canvas (runtime validated) files and when to use each type.
 */
const meta = {
  title: 'ExplainerPanels/CanvasTypesExplainerPanel',
  component: CanvasTypesExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel explaining the difference between static .canvas files (documentation, design, planning) and .otel.canvas files (runtime validated with OTEL traces).',
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
} satisfies Meta<typeof CanvasTypesExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the canvas types explanation
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
