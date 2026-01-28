import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TelemetryCoverageExplainerPanel } from './TelemetryCoverageExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * TelemetryCoverageExplainerPanel explains how to measure telemetry coverage
 * using library.yaml sources and OTEL code.filepath attributes.
 */
const meta = {
  title: 'ExplainerPanels/TelemetryCoverageExplainerPanel',
  component: TelemetryCoverageExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel explaining how to measure which files have telemetry by comparing expected files (from library.yaml sources) against actual files (from OTEL traces), identifying observability blind spots.',
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
} satisfies Meta<typeof TelemetryCoverageExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the telemetry coverage explanation
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
