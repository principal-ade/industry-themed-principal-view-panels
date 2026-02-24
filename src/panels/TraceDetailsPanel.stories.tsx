import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TraceDetailsPanel } from './TraceDetailsPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import { generateCheckoutTrace, generateComplexTrace, generateMultiScopeTrace, convertToRegisteredTraces } from '../mocks/otelMocks';

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
    const traces = convertToRegisteredTraces(checkoutTrace);
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
    const traces = convertToRegisteredTraces(complexTrace);
    const selectedTrace = traces[0];

    return (
      <MockPanelProvider>
        {(props) => <TraceDetailsPanel {...props} selectedTrace={selectedTrace} />}
      </MockPanelProvider>
    );
  },
};

/**
 * With a multi-scope trace (single service with multiple instrumentation scopes)
 *
 * This demonstrates how spans are grouped by their instrumentation scope:
 * - HTTP instrumentation (API calls)
 * - Custom app instrumentation (business logic)
 * - Database instrumentation (DB queries)
 */
export const WithMultiScopeTrace: Story = {
  render: () => {
    const multiScopeTrace = generateMultiScopeTrace();
    const traces = convertToRegisteredTraces(multiScopeTrace);
    const selectedTrace = traces[0];

    return (
      <MockPanelProvider>
        {(props) => <TraceDetailsPanel {...props} selectedTrace={selectedTrace} />}
      </MockPanelProvider>
    );
  },
};
