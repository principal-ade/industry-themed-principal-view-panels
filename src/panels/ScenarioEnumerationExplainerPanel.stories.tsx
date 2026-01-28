import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ScenarioEnumerationExplainerPanel } from './ScenarioEnumerationExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * ScenarioEnumerationExplainerPanel explains how workflow scenarios work with canvas files
 * to enumerate all expected functionality and validate runtime behavior.
 */
const meta = {
  title: 'Panels/ScenarioEnumerationExplainerPanel',
  component: ScenarioEnumerationExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel explaining how scenario enumeration transforms implicit test expectations into explicit, validated specifications of all possible system behaviors.',
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
} satisfies Meta<typeof ScenarioEnumerationExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the scenario enumeration explanation
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
