import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TestVsProductionExplainerPanel } from './TestVsProductionExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * TestVsProductionExplainerPanel clarifies the difference between test execution validation
 * and production telemetry monitoring - how the same infrastructure serves different purposes.
 */
const meta = {
  title: 'ExplainerPanels/TestVsProductionExplainerPanel',
  component: TestVsProductionExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel explaining how test execution validation (deterministic, known inputs) differs from production telemetry monitoring (observational, unknown inputs), and how they work together using the same canvas.',
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
} satisfies Meta<typeof TestVsProductionExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the test vs production explanation
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
