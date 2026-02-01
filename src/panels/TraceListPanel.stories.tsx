import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TraceListPanel } from './TraceListPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';

const meta = {
  title: 'Panels/TraceListPanel',
  component: TraceListPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Panel for displaying OpenTelemetry traces. Shows trace metadata and emits events when traces are selected.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof TraceListPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default trace list panel with mock data
 */
export const Default: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <TraceListPanel {...props} />}
    </MockPanelProvider>
  ),
};
