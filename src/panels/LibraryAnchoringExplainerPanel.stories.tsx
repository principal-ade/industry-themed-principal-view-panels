import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { LibraryAnchoringExplainerPanel } from './LibraryAnchoringExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * LibraryAnchoringExplainerPanel teaches developers how library.yaml files work
 * with canvas files to anchor architectural components to actual source code.
 */
const meta = {
  title: 'ExplainerPanels/LibraryAnchoringExplainerPanel',
  component: LibraryAnchoringExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel explaining the three-layer anchoring system: Canvas → Library → Runtime OTEL events. Uses progressive disclosure with SVG diagrams.',
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
} satisfies Meta<typeof LibraryAnchoringExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the library anchoring guide
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
