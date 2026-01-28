import type { Meta, StoryObj } from '@storybook/react';
import { WhyNowAgentRevolutionExplainerPanel } from './WhyNowAgentRevolutionExplainerPanel';

const meta = {
  title: 'ExplainerPanels/WhyNowAgentRevolutionExplainerPanel',
  component: WhyNowAgentRevolutionExplainerPanel,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof WhyNowAgentRevolutionExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
