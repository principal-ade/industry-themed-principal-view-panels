import type { Meta, StoryObj } from '@storybook/react';
import { SystemStoriesSolutionExplainerPanel } from './SystemStoriesSolutionExplainerPanel';

const meta = {
  title: 'Pitch Deck/System Stories Solution',
  component: SystemStoriesSolutionExplainerPanel,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SystemStoriesSolutionExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
