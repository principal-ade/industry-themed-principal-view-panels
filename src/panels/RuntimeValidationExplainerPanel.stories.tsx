import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { RuntimeValidationExplainerPanel } from './RuntimeValidationExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * RuntimeValidationExplainerPanel explains the problem that runtime validation solves:
 * how to verify that your code actually does what you expect at runtime, not just that tests pass.
 */
const meta = {
  title: 'ExplainerPanels/RuntimeValidationExplainerPanel',
  component: RuntimeValidationExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel explaining the runtime validation problem and how Canvas + OTEL + Validation solves it. Shows the gap between traditional testing and observable, validated execution.',
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
} satisfies Meta<typeof RuntimeValidationExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the runtime validation problem explanation
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
