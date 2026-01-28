import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { WorkflowExplainerPanel } from './WorkflowExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

const meta = {
  title: 'ExplainerPanels/WorkflowExplainerPanel',
  component: WorkflowExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An interactive educational panel that explains workflow template concepts using progressive disclosure and SVG visualizations.',
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
} satisfies Meta<typeof WorkflowExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomClassName: Story = {
  args: {
    className: 'custom-wrapper',
  },
};
