import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { BookAnalogyExplainerPanel } from './BookAnalogyExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * BookAnalogyExplainerPanel explains hierarchical canvas composition using the
 * familiar metaphor of reading a book with nested parts, chapters, and sections.
 */
const meta = {
  title: 'Panels/BookAnalogyExplainerPanel',
  component: BookAnalogyExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Educational panel that makes complex concepts like canvas composition, OTEL traces, and hierarchical validation intuitive by mapping them to familiar book reading concepts.',
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
} satisfies Meta<typeof BookAnalogyExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing the book analogy explanation
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
