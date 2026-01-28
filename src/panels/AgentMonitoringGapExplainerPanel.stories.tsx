import type { Meta, StoryObj } from '@storybook/react';
import { AgentMonitoringGapExplainerPanel } from './AgentMonitoringGapExplainerPanel';

const meta = {
  title: 'ExplainerPanels/AgentMonitoringGapExplainerPanel',
  component: AgentMonitoringGapExplainerPanel,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AgentMonitoringGapExplainerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
