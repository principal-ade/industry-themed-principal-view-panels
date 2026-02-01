import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TraceDetails } from './TraceDetails';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import {
  generateCheckoutTrace,
  generateAuthErrorTrace,
  generateComplexTrace,
} from '../mocks/otelMocks';

const meta = {
  title: 'Components/TraceDetails',
  component: TraceDetails,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Displays the detailed contents of a trace, showing all spans in a tree structure with their attributes and events.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', padding: '24px', boxSizing: 'border-box', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '100%', minWidth: 0 }}>
            <Story />
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof TraceDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simple trace with API -> DB
 */
export const SimpleTrace: Story = {
  render: () => {
    const { theme } = useTheme();
    const trace = generateCheckoutTrace();
    const spans = trace.resourceSpans.flatMap(rs =>
      rs.scopeSpans.flatMap(ss => ss.spans)
    );

    return <TraceDetails spans={spans} theme={theme} />;
  },
};

/**
 * Error trace with exception
 */
export const ErrorTrace: Story = {
  render: () => {
    const { theme } = useTheme();
    const trace = generateAuthErrorTrace();
    const spans = trace.resourceSpans.flatMap(rs =>
      rs.scopeSpans.flatMap(ss => ss.spans)
    );

    return <TraceDetails spans={spans} theme={theme} />;
  },
};

/**
 * Complex multi-service trace
 */
export const ComplexTrace: Story = {
  render: () => {
    const { theme } = useTheme();
    const trace = generateComplexTrace();
    const spans = trace.resourceSpans.flatMap(rs =>
      rs.scopeSpans.flatMap(ss => ss.spans)
    );

    return <TraceDetails spans={spans} theme={theme} />;
  },
};

/**
 * Empty state
 */
export const Empty: Story = {
  render: () => {
    const { theme } = useTheme();
    return <TraceDetails spans={[]} theme={theme} />;
  },
};
