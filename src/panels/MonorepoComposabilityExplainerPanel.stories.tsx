import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { MonorepoComposabilityExplainerPanel } from './MonorepoComposabilityExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * MonorepoComposabilityExplainerPanel explains how canvases and traces compose
 * across package boundaries in a monorepo for end-to-end validation.
 */
const meta = {
  title: 'ExplainerPanels/MonorepoComposabilityExplainerPanel',
  component: MonorepoComposabilityExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel explaining how OTEL traces and canvas files compose across monorepo packages, enabling both service-level and end-to-end validation from the same test executions.',
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
} satisfies Meta<typeof MonorepoComposabilityExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the monorepo composability explanation
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
