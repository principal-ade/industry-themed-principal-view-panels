import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TraceExpansion } from './TraceExpansion';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import { createTraceWithMultiWorkflowData } from '../mocks/otelMocks';

const meta = {
  title: 'Components/TraceExpansion',
  component: TraceExpansion,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Displays detailed workflow matching information for a trace, including matched workflows, unmatched events, and coverage metrics. Shows which workflows and scenarios a trace touches, and identifies unexpected telemetry.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: '800px', background: '#0a0a0a', padding: '24px', boxSizing: 'border-box' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof TraceExpansion>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper to use theme
const ExpansionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div style={{ width: '100%' }}>{children}</div>;
};

/**
 * Trace with multiple workflow matches and good coverage
 */
export const MultipleWorkflows: Story = {
  render: () => {
    const { theme } = useTheme();

    const trace = createTraceWithMultiWorkflowData({
      name: 'ProcessPayment',
      workflows: [
        {
          storyboardId: 'ecommerce',
          storyboardName: 'E-commerce Platform',
          workflowId: 'checkout-flow',
          workflowName: 'Checkout Flow',
          scenarioId: 'happy-path',
          scenarioName: 'Standard successful checkout',
          matchedEventCount: 8,
        },
        {
          storyboardId: 'payment',
          storyboardName: 'Payment Processing',
          workflowId: 'payment-gateway',
          workflowName: 'Payment Gateway',
          scenarioId: 'credit-card',
          scenarioName: 'Credit card payment processing',
          matchedEventCount: 5,
        },
        {
          storyboardId: 'analytics',
          storyboardName: 'Analytics & Tracking',
          workflowId: 'conversion-tracking',
          workflowName: 'Conversion Tracking',
          scenarioId: 'purchase-complete',
          scenarioName: 'Purchase completion event',
          matchedEventCount: 3,
        },
      ],
      unmatchedEventNames: ['cache.hit', 'logging.debug', 'metrics.collected'],
      totalEventCount: 19,
    });

    return (
      <ExpansionWrapper>
        <TraceExpansion trace={trace} theme={theme} />
      </ExpansionWrapper>
    );
  },
};

/**
 * Trace with single workflow match and perfect coverage
 */
export const SingleWorkflowPerfectCoverage: Story = {
  render: () => {
    const { theme } = useTheme();

    const trace = createTraceWithMultiWorkflowData({
      name: 'UserLogin',
      workflows: [
        {
          storyboardId: 'auth',
          storyboardName: 'Authentication System',
          workflowId: 'login-flow',
          workflowName: 'User Login',
          scenarioId: 'email-login',
          scenarioName: 'Successful login with email and password',
          matchedEventCount: 6,
        },
      ],
      unmatchedEventNames: [],
      totalEventCount: 6,
    });

    return (
      <ExpansionWrapper>
        <TraceExpansion trace={trace} theme={theme} />
      </ExpansionWrapper>
    );
  },
};

/**
 * Trace with many unmatched events (low coverage)
 */
export const LowCoverage: Story = {
  render: () => {
    const { theme } = useTheme();

    const trace = createTraceWithMultiWorkflowData({
      name: 'BackgroundJob',
      workflows: [
        {
          storyboardId: 'jobs',
          storyboardName: 'Background Jobs',
          workflowId: 'data-sync',
          workflowName: 'Data Synchronization',
          scenarioId: 'incremental-sync',
          scenarioName: 'Incremental data sync',
          matchedEventCount: 3,
        },
      ],
      unmatchedEventNames: [
        'job.started',
        'connection.pool.acquire',
        'connection.pool.release',
        'cache.invalidate',
        'cache.warm',
        'metrics.timer.start',
        'metrics.timer.end',
        'logging.trace',
        'logging.debug',
        'internal.checkpoint',
        'internal.state.save',
        'performance.mark',
      ],
      totalEventCount: 15,
    });

    return (
      <ExpansionWrapper>
        <TraceExpansion trace={trace} theme={theme} />
      </ExpansionWrapper>
    );
  },
};

/**
 * Trace with no workflow matches (0% coverage)
 */
export const NoMatches: Story = {
  render: () => {
    const { theme } = useTheme();

    const trace = createTraceWithMultiWorkflowData({
      name: 'HealthCheck',
      workflows: [],
      unmatchedEventNames: [
        'healthcheck.started',
        'database.ping',
        'redis.ping',
        'service.status',
        'healthcheck.complete',
      ],
      totalEventCount: 5,
    });

    return (
      <ExpansionWrapper>
        <TraceExpansion trace={trace} theme={theme} />
      </ExpansionWrapper>
    );
  },
};

/**
 * Trace with error and partial workflow match
 */
export const ErrorTracePartialMatch: Story = {
  render: () => {
    const { theme } = useTheme();

    const trace = createTraceWithMultiWorkflowData({
      name: 'CheckoutWithError',
      workflows: [
        {
          storyboardId: 'ecommerce',
          storyboardName: 'E-commerce Platform',
          workflowId: 'checkout-flow',
          workflowName: 'Checkout Flow',
          scenarioId: 'payment-declined',
          scenarioName: 'Payment declined by gateway',
          matchedEventCount: 7,
        },
      ],
      unmatchedEventNames: [
        'error.handler.triggered',
        'rollback.transaction',
        'notification.send.failed',
      ],
      totalEventCount: 10,
      hasError: true,
    });

    return (
      <ExpansionWrapper>
        <TraceExpansion trace={trace} theme={theme} />
      </ExpansionWrapper>
    );
  },
};

/**
 * Trace without workflow matching data (not yet enriched)
 */
export const NotEnriched: Story = {
  render: () => {
    const { theme } = useTheme();

    const trace = createTraceWithMultiWorkflowData({
      name: 'UnenrichedTrace',
      workflows: undefined as any,
      unmatchedEventNames: undefined as any,
      totalEventCount: undefined as any,
    });

    // Remove the workflow matching fields to simulate an unenriched trace
    delete (trace as any).matchedWorkflows;
    delete (trace as any).unmatchedEventNames;
    delete (trace as any).totalEventCount;

    return (
      <ExpansionWrapper>
        <TraceExpansion trace={trace} theme={theme} />
      </ExpansionWrapper>
    );
  },
};

/**
 * Complex scenario with many workflows across different storyboards
 */
export const ComplexMultiStoryboard: Story = {
  render: () => {
    const { theme } = useTheme();

    const trace = createTraceWithMultiWorkflowData({
      name: 'ComplexOrderProcessing',
      workflows: [
        {
          storyboardId: 'orders',
          storyboardName: 'Order Management',
          workflowId: 'order-creation',
          workflowName: 'Order Creation',
          scenarioId: 'new-order',
          scenarioName: 'New order received',
          matchedEventCount: 5,
        },
        {
          storyboardId: 'inventory',
          storyboardName: 'Inventory System',
          workflowId: 'stock-check',
          workflowName: 'Stock Availability',
          scenarioId: 'items-available',
          scenarioName: 'All items in stock',
          matchedEventCount: 3,
        },
        {
          storyboardId: 'inventory',
          storyboardName: 'Inventory System',
          workflowId: 'reservation',
          workflowName: 'Inventory Reservation',
          scenarioId: 'reserve-success',
          scenarioName: 'Items successfully reserved',
          matchedEventCount: 4,
        },
        {
          storyboardId: 'payment',
          storyboardName: 'Payment Processing',
          workflowId: 'authorization',
          workflowName: 'Payment Authorization',
          scenarioId: 'auth-success',
          scenarioName: 'Payment authorized',
          matchedEventCount: 6,
        },
        {
          storyboardId: 'fulfillment',
          storyboardName: 'Order Fulfillment',
          workflowId: 'shipping',
          workflowName: 'Shipping Request',
          scenarioId: 'label-generated',
          scenarioName: 'Shipping label generated',
          matchedEventCount: 2,
        },
      ],
      unmatchedEventNames: ['audit.log', 'metrics.timer'],
      totalEventCount: 22,
    });

    return (
      <ExpansionWrapper>
        <TraceExpansion trace={trace} theme={theme} />
      </ExpansionWrapper>
    );
  },
};

/**
 * Trace with scope mismatch - spans not matching due to unregistered scope
 *
 * This demonstrates the common debugging scenario where traces don't match
 * workflows because the instrumentation scope isn't registered in library.yaml.
 * The "No storyboards found for scope" reason is highlighted in red to make
 * this actionable issue immediately visible.
 */
export const ScopeMismatch: Story = {
  render: () => {
    const { theme } = useTheme();

    const now = Date.now();
    const trace: import('../types/otel').RegisteredTrace = {
      traceId: 'trace-scope-mismatch-001',
      name: 'kanban.load',
      startTime: now,
      endTime: now + 150,
      duration: 150,
      spanCount: 3,
      hasErrors: false,
      resources: [{
        serviceIdentifier: 'http://localhost:6006',
        serviceName: 'industry-themed-backlogmd-kanban-panel-storybook',
        attributes: {
          'service.name': 'industry-themed-backlogmd-kanban-panel-storybook',
          'service.version': '1.0.41',
        },
        scopes: [{
          scope: {
            name: '@industry-theme/backlogmd-kanban-panel',
            version: '1.0.41',
          },
          spanIds: ['span-001', 'span-002', 'span-003'],
        }],
      }],
      scenarioMatches: [],
      storyboardMatches: [],
      unmatchedSpans: {
        spans: [
          {
            spanId: 'span-001',
            spanName: 'kanban.load',
            scopeName: '@industry-theme/backlogmd-kanban-panel',
            timestamp: now,
            duration: 150,
            reason: 'No storyboards found for scope',
          },
          {
            spanId: 'span-002',
            parentSpanId: 'span-001',
            spanName: 'kanban.fetch.tasks',
            scopeName: '@industry-theme/backlogmd-kanban-panel',
            timestamp: now + 10,
            duration: 100,
            reason: 'No storyboards found for scope',
          },
          {
            spanId: 'span-003',
            parentSpanId: 'span-001',
            spanName: 'kanban.render',
            scopeName: '@industry-theme/backlogmd-kanban-panel',
            timestamp: now + 120,
            duration: 30,
            reason: 'No storyboards found for scope',
          },
        ],
      },
    };

    return (
      <ExpansionWrapper>
        <TraceExpansion trace={trace} theme={theme} />
      </ExpansionWrapper>
    );
  },
};

/**
 * Same timestamp ordering test
 *
 * Tests that spans with identical timestamps are ordered by their
 * original ingestion order from the OTLP data, not arbitrarily.
 * panel.lifecycle should appear before kanban.load because it comes
 * first in the OTLP spans array.
 */
export const SameTimestampOrdering: Story = {
  render: () => {
    const { theme } = useTheme();

    const timestamp = Date.now();
    const trace: import('../types/otel').RegisteredTrace = {
      traceId: 'trace-same-timestamp-001',
      name: 'panel.lifecycle',
      startTime: timestamp,
      endTime: timestamp + 1,
      duration: 1,
      spanCount: 2,
      hasErrors: false,
      resources: [{
        serviceIdentifier: 'http://localhost:6006',
        serviceName: 'test-storybook',
        attributes: {
          'service.name': 'test-storybook',
          'service.version': '1.0.0',
        },
        scopes: [{
          scope: {
            name: '@test/panel',
            version: '1.0.0',
          },
          spanIds: ['span-lifecycle', 'span-kanban'],
        }],
      }],
      scenarioMatches: [],
      storyboardMatches: [],
      unmatchedSpans: {
        spans: [
          {
            spanId: 'span-lifecycle',
            spanName: 'panel.lifecycle',
            scopeName: '@test/panel',
            timestamp, // Same timestamp
            duration: 0,
            reason: 'No storyboards found for scope',
          },
          {
            spanId: 'span-kanban',
            spanName: 'kanban.load',
            scopeName: '@test/panel',
            timestamp, // Same timestamp
            duration: 1,
            reason: 'No storyboards found for scope',
          },
        ],
      },
      // Include OTLP data with spans in the expected order
      otlpData: {
        resourceSpans: [{
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'test-storybook' } },
            ],
          },
          scopeSpans: [{
            scope: { name: '@test/panel', version: '1.0.0' },
            spans: [
              // panel.lifecycle comes FIRST in ingestion order
              {
                traceId: 'trace-same-timestamp-001',
                spanId: 'span-lifecycle',
                name: 'panel.lifecycle',
                kind: 1,
                startTimeUnixNano: `${timestamp}000000`,
                endTimeUnixNano: `${timestamp}000000`,
                attributes: [],
                events: [],
                status: { code: 1 },
              },
              // kanban.load comes SECOND
              {
                traceId: 'trace-same-timestamp-001',
                spanId: 'span-kanban',
                name: 'kanban.load',
                kind: 1,
                startTimeUnixNano: `${timestamp}000000`,
                endTimeUnixNano: `${timestamp + 1}000000`,
                attributes: [],
                events: [],
                status: { code: 1 },
              },
            ],
          }],
        }],
      },
    };

    return (
      <ExpansionWrapper>
        <div style={{ marginBottom: '16px', color: '#888', fontSize: '12px' }}>
          Expected order: panel.lifecycle → kanban.load (both have same timestamp, ordered by ingestion)
        </div>
        <TraceExpansion trace={trace} theme={theme} />
      </ExpansionWrapper>
    );
  },
};

/**
 * Trace with mixed unmatched reasons
 *
 * Shows different reasons for unmatched spans:
 * - Scope mismatch (red - actionable)
 * - No workflow spanPattern matched (muted - less critical)
 */
export const MixedUnmatchedReasons: Story = {
  render: () => {
    const { theme } = useTheme();

    const now = Date.now();
    const trace: import('../types/otel').RegisteredTrace = {
      traceId: 'trace-mixed-reasons-001',
      name: 'api.request',
      startTime: now,
      endTime: now + 200,
      duration: 200,
      spanCount: 4,
      hasErrors: false,
      resources: [{
        serviceIdentifier: 'http://localhost:3000',
        serviceName: 'test-service',
        attributes: {
          'service.name': 'test-service',
          'service.version': '1.0.0',
        },
        scopes: [{
          scope: {
            name: 'test-instrumentation',
            version: '1.0.0',
          },
          spanIds: ['span-001', 'span-002', 'span-003', 'span-004'],
        }],
      }],
      scenarioMatches: [],
      storyboardMatches: [],
      unmatchedSpans: {
        spans: [
          {
            spanId: 'span-001',
            spanName: 'unregistered.component.render',
            scopeName: '@unregistered/component-library',
            timestamp: now,
            duration: 50,
            reason: 'No storyboards found for scope',
          },
          {
            spanId: 'span-002',
            spanName: 'http.request',
            scopeName: '@opentelemetry/instrumentation-http',
            timestamp: now + 50,
            duration: 100,
            reason: 'No workflow spanPattern matched this span',
          },
          {
            spanId: 'span-003',
            spanName: 'db.query',
            scopeName: '@opentelemetry/instrumentation-pg',
            timestamp: now + 60,
            duration: 80,
            reason: 'No workflow spanPattern matched this span',
          },
          {
            spanId: 'span-004',
            spanName: 'custom.panel.init',
            scopeName: '@my-company/custom-panels',
            timestamp: now + 150,
            duration: 50,
            reason: 'No storyboards found for scope',
          },
        ],
      },
    };

    return (
      <ExpansionWrapper>
        <TraceExpansion trace={trace} theme={theme} />
      </ExpansionWrapper>
    );
  },
};
