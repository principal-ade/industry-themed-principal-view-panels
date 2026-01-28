import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ProductionDebuggingExplainerPanel } from './ProductionDebuggingExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * ProductionDebuggingExplainerPanel explains how hierarchical canvases help
 * rapidly isolate and debug production issues by matching traces to canvas nodes.
 */
const meta = {
  title: 'Panels/ProductionDebuggingExplainerPanel',
  component: ProductionDebuggingExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel demonstrating how canvas hierarchy, OTEL traces, and workflows work together to accelerate production debugging through systematic problem isolation.',
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
} satisfies Meta<typeof ProductionDebuggingExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the production debugging explanation
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
