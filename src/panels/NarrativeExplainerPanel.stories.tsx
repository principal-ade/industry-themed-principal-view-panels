import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { NarrativeExplainerPanel } from './NarrativeExplainerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';

const meta = {
  title: 'Panels/NarrativeExplainerPanel',
  component: NarrativeExplainerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An interactive educational panel that explains narrative template concepts using progressive disclosure and SVG visualizations.',
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
} satisfies Meta<typeof NarrativeExplainerPanel>;

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
