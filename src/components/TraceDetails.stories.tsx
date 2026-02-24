import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TraceDetails, type ScopeInfo } from './TraceDetails';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import {
  generateCheckoutTrace,
  generateAuthErrorTrace,
  generateComplexTrace,
  generateMultiScopeTrace,
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
const SimpleTraceComponent = () => {
  const { theme } = useTheme();
  const trace = generateCheckoutTrace();
  const spans = trace.resourceSpans.flatMap(rs =>
    rs.scopeSpans.flatMap(ss => ss.spans)
  );

  return <TraceDetails spans={spans} theme={theme} />;
};

export const SimpleTrace: Story = {
  render: () => <SimpleTraceComponent />,
};

/**
 * Error trace with exception
 */
const ErrorTraceComponent = () => {
  const { theme } = useTheme();
  const trace = generateAuthErrorTrace();
  const spans = trace.resourceSpans.flatMap(rs =>
    rs.scopeSpans.flatMap(ss => ss.spans)
  );

  return <TraceDetails spans={spans} theme={theme} />;
};

export const ErrorTrace: Story = {
  render: () => <ErrorTraceComponent />,
};

/**
 * Complex multi-service trace
 */
const ComplexTraceComponent = () => {
  const { theme } = useTheme();
  const trace = generateComplexTrace();
  const spans = trace.resourceSpans.flatMap(rs =>
    rs.scopeSpans.flatMap(ss => ss.spans)
  );

  return <TraceDetails spans={spans} theme={theme} />;
};

export const ComplexTrace: Story = {
  render: () => <ComplexTraceComponent />,
};

/**
 * Empty state
 */
const EmptyComponent = () => {
  const { theme } = useTheme();
  return <TraceDetails spans={[]} theme={theme} />;
};

export const Empty: Story = {
  render: () => <EmptyComponent />,
};

/**
 * Multi-scope trace grouped by instrumentation scope
 *
 * Shows spans organized by their instrumentation scope:
 * - @opentelemetry/instrumentation-http (API spans)
 * - pkg:npm/@acme/order-service (business logic)
 * - @opentelemetry/instrumentation-pg (database spans)
 */
const MultiScopeTraceComponent = () => {
  const { theme } = useTheme();
  const trace = generateMultiScopeTrace();

  // Extract spans and build scope info
  const allSpans = trace.resourceSpans.flatMap(rs =>
    rs.scopeSpans.flatMap(ss => ss.spans)
  );

  const scopes: ScopeInfo[] = trace.resourceSpans.flatMap(rs =>
    rs.scopeSpans.map(ss => ({
      name: ss.scope?.name || 'unknown',
      version: ss.scope?.version,
      spanIds: ss.spans.map(s => s.spanId),
    }))
  );

  return <TraceDetails spans={allSpans} scopes={scopes} theme={theme} />;
};

export const MultiScopeTrace: Story = {
  render: () => <MultiScopeTraceComponent />,
};
