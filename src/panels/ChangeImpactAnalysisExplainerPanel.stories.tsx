import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ChangeImpactAnalysisExplainerPanel } from './ChangeImpactAnalysisExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * ChangeImpactAnalysisExplainerPanel explains how to use OTEL traces to understand
 * downstream effects and upstream requirements when making changes.
 */
const meta = {
  title: 'Panels/ChangeImpactAnalysisExplainerPanel',
  component: ChangeImpactAnalysisExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel explaining how runtime dependency analysis using OTEL traces reveals actual dependencies, critical paths, and blast radius for changes—transforming impact analysis from guesswork to data-driven decisions.',
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
} satisfies Meta<typeof ChangeImpactAnalysisExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the change impact analysis explanation
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
