import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TraceDetailsPanel } from './TraceDetailsPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import { generateCheckoutTrace, generateComplexTrace } from '../mocks/otelMocks';
import { groupSpansByTrace } from '../types/otel';

const meta = {
  title: 'Panels/TraceDetailsPanel',
  component: TraceDetailsPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Panel for displaying detailed trace information. Uses prop-controlled mode - pass selectedTrace prop to control what is displayed.',
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
} satisfies Meta<typeof TraceDetailsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state - no trace selected
 */
export const Empty: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <TraceDetailsPanel {...props} selectedTrace={null} />}
    </MockPanelProvider>
  ),
};

/**
 * With a simple trace selected
 */
export const WithSimpleTrace: Story = {
  render: () => {
    const checkoutTrace = generateCheckoutTrace(true);
    const traces = groupSpansByTrace(checkoutTrace);
    const selectedTrace = traces[0];

    return (
      <MockPanelProvider>
        {(props) => <TraceDetailsPanel {...props} selectedTrace={selectedTrace} />}
      </MockPanelProvider>
    );
  },
};

/**
 * With a complex multi-service trace
 */
export const WithComplexTrace: Story = {
  render: () => {
    const complexTrace = generateComplexTrace(true);
    const traces = groupSpansByTrace(complexTrace);
    const selectedTrace = traces[0];

    return (
      <MockPanelProvider>
        {(props) => <TraceDetailsPanel {...props} selectedTrace={selectedTrace} />}
      </MockPanelProvider>
    );
  },
};
