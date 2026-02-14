import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { WorkflowScenariosPanel } from './WorkflowScenariosPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { DataSlice } from '../types';
import type { WorkflowTemplate } from '@principal-ai/principal-view-core';
import type { TraceInfo } from '../types/otel';

/**
 * WorkflowScenariosPanel - OTEL Execution Visualizer
 *
 * Visualizes OpenTelemetry execution artifacts from tests overlaid on canvas architecture diagrams.
 * Demonstrates the complete workflow: Canvas Narrative Templates Test Execution Visual Debugging
 *
 * ## Key Features:
 * - **Event-to-Node Mapping**: Automatically highlights canvas nodes as events play back
 * - **Clickable Narratives**: Click workflow steps to highlight corresponding canvas nodes
 * - **Scenario Matching**: Multiple workflow scenarios (success, error, timeout) matched to execution data
 * - **Test Playback**: Step through execution timeline with automatic node highlighting
 *
 * ## Progressive Onboarding:
 * These stories demonstrate the incremental adoption path:
 * 1. Start with canvas only (architecture documentation)
 * 2. Add workflow templates (human-readable scenarios)
 * 3. Add test execution data (validation & debugging)
 */
const meta = {
  title: 'Panels/WorkflowScenariosPanel',
  component: WorkflowScenariosPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete OTEL visualization panel showing canvas architecture, workflow scenarios, and test execution playback. Click workflow steps to highlight nodes!',
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
} satisfies Meta<typeof WorkflowScenariosPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Mock Data - E-Commerce Checkout Flow
// ============================================================================

/**
 * Canvas with proper OTEL event schemas
 * Each node defines events it can emit with typed attributes
 */
/**
 * Canvas with ONE node per event type for proper highlighting
 * Each event maps to exactly one canvas node
 */
const checkoutCanvas = {
  nodes: [
    // Row 1: Checkout initiation
    {
      id: 'checkout-initiated',
      type: 'text',
      text: '# Checkout Initiated',
      x: 200,
      y: 0,
      width: 200,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#3b82f6',
        otel: {
          kind: 'event',
        },
        sources: ['src/checkout/index.ts'],
        event: {
          name: 'checkout.initiated',
          description: 'Session begins',
          attributes: {
            'session.id': { type: 'string', required: true },
            'cart.itemCount': { type: 'number', required: true },
            'cart.total': { type: 'number', required: true },
          },
        },
      },
    },

    // Row 2: Parallel processing
    {
      id: 'payment-initiated',
      type: 'text',
      text: '# Payment Initiated',
      x: 0,
      y: 120,
      width: 180,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#10b981',
        otel: {
          kind: 'event',
        },
        sources: ['src/payment/processor.ts', 'src/payment/gateway.ts'],
        event: {
          name: 'payment.initiated',
          description: 'Payment processing begins',
          attributes: {
            'payment.method': { type: 'string', required: true },
            'payment.amount': { type: 'number', required: true },
          },
        },
      },
    },
    {
      id: 'inventory-checking',
      type: 'text',
      text: '# Inventory Checking',
      x: 210,
      y: 120,
      width: 180,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#f59e0b',
        otel: {
          kind: 'event',
        },
        sources: ['src/inventory/stock-checker.ts'],
        event: {
          name: 'inventory.checking',
          description: 'Checking stock',
          attributes: {
            'inventory.skuCount': { type: 'number', required: true },
          },
        },
      },
    },
    {
      id: 'shipping-calculating',
      type: 'text',
      text: '# Shipping Calculating',
      x: 420,
      y: 120,
      width: 180,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#8b5cf6',
        otel: {
          kind: 'event',
        },
        sources: ['src/shipping/calculator.ts', 'src/shipping/rate-provider.ts'],
        event: {
          name: 'shipping.calculating',
          description: 'Calculating shipping',
          attributes: {
            'shipping.destination': { type: 'string', required: true },
            'shipping.weight': { type: 'number', required: true },
          },
        },
      },
    },

    // Row 3: Results (success/failure)
    {
      id: 'payment-completed',
      type: 'text',
      text: '# Payment Completed',
      x: 0,
      y: 240,
      width: 180,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#10b981',
        otel: {
          kind: 'event',
        },
        sources: ['src/payment/processor.ts'],
        event: {
          name: 'payment.completed',
          description: 'Payment successful',
          attributes: {
            'payment.transactionId': { type: 'string', required: true },
            'payment.processingTime': { type: 'number', required: false },
          },
        },
      },
    },
    {
      id: 'payment-failed',
      type: 'text',
      text: '# Payment Failed',
      x: 0,
      y: 340,
      width: 180,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#ef4444',
        otel: {
          kind: 'event',
        },
        sources: ['src/payment/processor.ts', 'src/payment/error-handler.ts'],
        event: {
          name: 'payment.failed',
          description: 'Payment failed',
          attributes: {
            'error.code': { type: 'string', required: true },
            'error.message': { type: 'string', required: true },
            'payment.declined': { type: 'boolean', required: false },
          },
        },
      },
    },
    {
      id: 'inventory-reserved',
      type: 'text',
      text: '# Inventory Reserved',
      x: 210,
      y: 240,
      width: 180,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#f59e0b',
        otel: {
          kind: 'event',
        },
        sources: ['src/inventory/reservation.ts', 'src/inventory/warehouse.ts'],
        event: {
          name: 'inventory.reserved',
          description: 'Stock reserved',
          attributes: {
            'inventory.reservationId': { type: 'string', required: true },
            'inventory.itemsReserved': { type: 'number', required: true },
          },
        },
      },
    },
    {
      id: 'inventory-insufficient',
      type: 'text',
      text: '# Inventory Insufficient',
      x: 210,
      y: 340,
      width: 180,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#ef4444',
        otel: {
          kind: 'event',
        },
        sources: ['src/inventory/stock-checker.ts'],
        event: {
          name: 'inventory.insufficient',
          description: 'Out of stock',
          attributes: {
            'inventory.shortfall': { type: 'number', required: true },
            'inventory.availableCount': { type: 'number', required: true },
          },
        },
      },
    },
    {
      id: 'shipping-calculated',
      type: 'text',
      text: '# Shipping Calculated',
      x: 420,
      y: 240,
      width: 180,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#8b5cf6',
        otel: {
          kind: 'event',
        },
        sources: ['src/shipping/calculator.ts', 'src/shipping/delivery-estimator.ts'],
        event: {
          name: 'shipping.calculated',
          description: 'Shipping determined',
          attributes: {
            'shipping.method': { type: 'string', required: true },
            'shipping.cost': { type: 'number', required: true },
            'shipping.estimatedDays': { type: 'number', required: false },
          },
        },
      },
    },

    // Row 4: Finalization
    {
      id: 'order-created',
      type: 'text',
      text: '# Order Created',
      x: 200,
      y: 460,
      width: 200,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#ec4899',
        otel: {
          kind: 'event',
        },
        sources: ['src/order/order-service.ts'],
        event: {
          name: 'order.created',
          description: 'Order finalized',
          attributes: {
            'order.id': { type: 'string', required: true },
            'order.total': { type: 'number', required: true },
            'customer.email': { type: 'string', required: true },
          },
        },
      },
    },
    {
      id: 'order-timeout',
      type: 'text',
      text: '# Order Timeout',
      x: 200,
      y: 560,
      width: 200,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#ef4444',
        otel: {
          kind: 'event',
        },
        event: {
          name: 'order.timeout',
          description: 'Processing timed out',
          attributes: {
            'timeout.duration': { type: 'number', required: true },
            'timeout.phase': { type: 'string', required: false },
          },
        },
      },
    },
  ],
  edges: [
    // Checkout initiated parallel processing
    { id: 'edge-1', fromNode: 'checkout-initiated', toNode: 'payment-initiated', fromSide: 'bottom', toSide: 'top' },
    { id: 'edge-2', fromNode: 'checkout-initiated', toNode: 'inventory-checking', fromSide: 'bottom', toSide: 'top' },
    { id: 'edge-3', fromNode: 'checkout-initiated', toNode: 'shipping-calculating', fromSide: 'bottom', toSide: 'top' },

    // Payment paths
    { id: 'edge-4', fromNode: 'payment-initiated', toNode: 'payment-completed', fromSide: 'bottom', toSide: 'top', label: 'success' },
    { id: 'edge-5', fromNode: 'payment-initiated', toNode: 'payment-failed', fromSide: 'bottom', toSide: 'top', label: 'error' },

    // Inventory paths
    { id: 'edge-6', fromNode: 'inventory-checking', toNode: 'inventory-reserved', fromSide: 'bottom', toSide: 'top', label: 'available' },
    { id: 'edge-7', fromNode: 'inventory-checking', toNode: 'inventory-insufficient', fromSide: 'bottom', toSide: 'top', label: 'out of stock' },

    // Shipping result
    { id: 'edge-8', fromNode: 'shipping-calculating', toNode: 'shipping-calculated', fromSide: 'bottom', toSide: 'top' },

    // Converge to order
    { id: 'edge-9', fromNode: 'payment-completed', toNode: 'order-created', fromSide: 'bottom', toSide: 'top' },
    { id: 'edge-10', fromNode: 'inventory-reserved', toNode: 'order-created', fromSide: 'bottom', toSide: 'top' },
    { id: 'edge-11', fromNode: 'shipping-calculated', toNode: 'order-created', fromSide: 'bottom', toSide: 'top' },

    // Timeout path
    { id: 'edge-12', fromNode: 'order-created', toNode: 'order-timeout', fromSide: 'bottom', toSide: 'top', label: 'timeout', pv: { style: 'dashed' } },
  ],
  pv: {
    version: '1.0.0',
    name: 'E-Commerce Checkout Flow',
    description: 'Event-by-event checkout flow',
  },
};

const checkoutWorkflow: WorkflowTemplate = {
  version: '1.0.0',
  canvas: 'checkout-flow.otel.canvas',
  name: 'Checkout Flow',
  description: 'Checkout process execution scenarios',
  mode: 'timeline' as const,
  scenarioSelection: 'first-match' as const,
  showLogsPerSpan: true,
  scenarios: [
    {
      id: 'payment-declined',
      priority: 1,
      description: 'Payment was declined',
      template: {
        introduction: 'Checkout Failed - Payment Declined',
        events: {
          'checkout.initiated': 'Checkout started for {{cart.itemCount}} items (${{cart.total}})',
          'payment.initiated': 'Processing {{payment.method}} payment for ${{payment.amount}}',
          'payment.failed':
            'Payment declined: {{error.message}}\n    • Error Code: {{error.code}}\n    • Customer needs to try different payment method',
        },
        summary:
          'Payment was declined.\nCart items remain reserved for 15 minutes.',
      },
    },
    {
      id: 'insufficient-inventory',
      priority: 2,
      description: 'Not enough inventory available',
      template: {
        introduction: 'Checkout Failed - Insufficient Inventory',
        events: {
          'checkout.initiated': 'Checkout started for {{cart.itemCount}} items (${{cart.total}})',
          'inventory.checking': 'Checking stock for {{inventory.skuCount}} SKUs',
          'inventory.insufficient':
            'Insufficient stock\n    • Need {{inventory.shortfall}} more items\n    • Currently {{inventory.availableCount}} available',
        },
        summary:
          'Some items are out of stock.\nCustomer should reduce quantity or remove items.',
      },
    },
    {
      id: 'checkout-timeout',
      priority: 3,
      description: 'Checkout process timed out',
      template: {
        introduction: 'Checkout Timeout',
        events: {
          'checkout.initiated': 'Checkout started for {{cart.itemCount}} items (${{cart.total}})',
          'payment.initiated': 'Processing payment for ${{payment.amount}}',
          'inventory.checking': 'Checking inventory',
          'shipping.calculating': 'Calculating shipping to {{shipping.destination}}',
          'order.timeout':
            'Process timed out after {{timeout.duration}}ms\n    • Phase: {{#if timeout.phase}}{{timeout.phase}}{{else}}unknown{{/if}}',
        },
        summary:
          'Checkout timed out.\nCustomer should retry. Session remains active.',
      },
    },
    {
      id: 'checkout-success',
      priority: 4,
      description: 'Successful checkout',
      template: {
        introduction: 'Checkout Complete',
        events: {
          'checkout.initiated': 'Checkout started for {{cart.itemCount}} items (${{cart.total}})',
          'payment.initiated': 'Processing {{payment.method}} payment',
          'payment.completed':
            'Payment successful\n    • Transaction: {{payment.transactionId}}\n    • Processing time: {{payment.processingTime}}ms',
          'inventory.checking': 'Checking stock for {{inventory.skuCount}} SKUs',
          'inventory.reserved':
            'Reserved {{inventory.itemsReserved}} items\n    • Reservation: {{inventory.reservationId}}',
          'shipping.calculating': 'Calculating shipping to {{shipping.destination}}',
          'shipping.calculated':
            'Shipping: {{shipping.method}}\n    • Cost: ${{shipping.cost}}\n    • Est. delivery: {{shipping.estimatedDays}} days',
          'order.created':
            'Order created: {{order.id}}\n    • Total: ${{order.total}}\n    • Confirmation sent to {{customer.email}}',
        },
        summary:
          'Order {{order.id}} successfully created!\nConfirmation email sent to {{customer.email}}.',
      },
    },
    {
      id: 'default',
      priority: 99,
      description: 'Default scenario',
      template: {
        introduction: 'Checkout Process',
        events: {
          'checkout.initiated': 'Checkout initiated',
          'payment.initiated': 'Payment processing started',
          'payment.completed': 'Payment completed',
          'payment.failed': 'Payment failed',
          'inventory.checking': 'Inventory check started',
          'inventory.reserved': 'Inventory reserved',
          'inventory.insufficient': 'Insufficient inventory',
          'shipping.calculating': 'Shipping calculation started',
          'shipping.calculated': 'Shipping calculated',
          'order.created': 'Order created',
          'order.timeout': 'Process timed out',
        },
        summary: 'Checkout process recorded.',
      },
    },
  ],
};

/**
 * Successful checkout execution
 */
const successfulCheckout = {
  metadata: {
    canvasName: 'E-Commerce Checkout Flow',
    exportedAt: new Date().toISOString(),
    source: 'test:checkout-success',
    framework: 'bun',
    status: 'success' as const,
  },
  spans: [
    {
      id: 'span-checkout-success',
      name: 'complete checkout process',
      startTime: 1704067200000,
      endTime: 1704067203500,
      duration: 3500,
      status: 'OK' as const,
      attributes: {
        'span.kind': 'test.case',
        'test.name': 'successful checkout flow',
        'test.framework': 'bun',
        'test.file': 'checkout.test.ts',
      },
      events: [
        {
          time: 1704067200000,
          name: 'checkout.initiated',
          attributes: {
            'session.id': 'session_1704067200_abc',
            'cart.itemCount': 3,
            'cart.total': 149.99,
          },
        },
        {
          time: 1704067200500,
          name: 'payment.initiated',
          attributes: {
            'payment.method': 'card',
            'payment.amount': 149.99,
          },
        },
        {
          time: 1704067200600,
          name: 'inventory.checking',
          attributes: {
            'inventory.skuCount': 3,
          },
        },
        {
          time: 1704067200700,
          name: 'shipping.calculating',
          attributes: {
            'shipping.destination': '94102',
            'shipping.weight': 5.2,
          },
        },
        {
          time: 1704067201800,
          name: 'payment.completed',
          attributes: {
            'payment.transactionId': 'txn_1704067201_xyz',
            'payment.processingTime': 1300,
          },
        },
        {
          time: 1704067202100,
          name: 'inventory.reserved',
          attributes: {
            'inventory.reservationId': 'rsv_1704067202_def',
            'inventory.itemsReserved': 3,
          },
        },
        {
          time: 1704067202400,
          name: 'shipping.calculated',
          attributes: {
            'shipping.method': 'USPS Priority',
            'shipping.cost': 8.99,
            'shipping.estimatedDays': 3,
          },
        },
        {
          time: 1704067203500,
          name: 'order.created',
          attributes: {
            'order.id': 'ORD-20240101-001',
            'order.total': 158.98,
            'customer.email': 'customer@example.com',
          },
        },
      ],
    },
  ],
};

/**
 * Payment declined execution
 */
const paymentDeclinedCheckout = {
  metadata: {
    canvasName: 'E-Commerce Checkout Flow',
    exportedAt: new Date().toISOString(),
    source: 'test:checkout-payment-declined',
    framework: 'bun',
    status: 'failure' as const,
  },
  spans: [
    {
      id: 'span-payment-declined',
      name: 'checkout with declined payment',
      startTime: 1704067300000,
      endTime: 1704067301500,
      duration: 1500,
      status: 'ERROR' as const,
      attributes: {
        'span.kind': 'test.case',
        'test.name': 'checkout with declined payment',
        'test.framework': 'bun',
        'test.file': 'checkout.test.ts',
      },
      events: [
        {
          time: 1704067300000,
          name: 'checkout.initiated',
          attributes: {
            'session.id': 'session_1704067300_xyz',
            'cart.itemCount': 2,
            'cart.total': 89.99,
          },
        },
        {
          time: 1704067300500,
          name: 'payment.initiated',
          attributes: {
            'payment.method': 'card',
            'payment.amount': 89.99,
          },
        },
        {
          time: 1704067301500,
          name: 'payment.failed',
          attributes: {
            'error.code': 'card_declined',
            'error.message': 'Your card was declined. Please try a different payment method.',
            'payment.declined': true,
          },
        },
      ],
    },
  ],
};

/**
 * Insufficient inventory execution
 */
const insufficientInventoryCheckout = {
  metadata: {
    canvasName: 'E-Commerce Checkout Flow',
    exportedAt: new Date().toISOString(),
    source: 'test:checkout-insufficient-inventory',
    framework: 'bun',
    status: 'failure' as const,
  },
  spans: [
    {
      id: 'span-insufficient-inventory',
      name: 'checkout with insufficient inventory',
      startTime: 1704067400000,
      endTime: 1704067401200,
      duration: 1200,
      status: 'ERROR' as const,
      attributes: {
        'span.kind': 'test.case',
        'test.name': 'checkout with insufficient inventory',
        'test.framework': 'bun',
        'test.file': 'checkout.test.ts',
      },
      events: [
        {
          time: 1704067400000,
          name: 'checkout.initiated',
          attributes: {
            'session.id': 'session_1704067400_inv',
            'cart.itemCount': 5,
            'cart.total': 249.95,
          },
        },
        {
          time: 1704067400600,
          name: 'inventory.checking',
          attributes: {
            'inventory.skuCount': 5,
          },
        },
        {
          time: 1704067401200,
          name: 'inventory.insufficient',
          attributes: {
            'inventory.shortfall': 2,
            'inventory.availableCount': 3,
          },
        },
      ],
    },
  ],
};

/**
 * Timeout execution
 */
const timeoutCheckout = {
  metadata: {
    canvasName: 'E-Commerce Checkout Flow',
    exportedAt: new Date().toISOString(),
    source: 'test:checkout-timeout',
    framework: 'bun',
    status: 'timeout' as const,
  },
  spans: [
    {
      id: 'span-timeout',
      name: 'checkout timeout scenario',
      startTime: 1704067500000,
      endTime: 1704067532000,
      duration: 32000,
      status: 'ERROR' as const,
      attributes: {
        'span.kind': 'test.case',
        'test.name': 'checkout timeout',
        'test.framework': 'bun',
        'test.file': 'checkout.test.ts',
      },
      events: [
        {
          time: 1704067500000,
          name: 'checkout.initiated',
          attributes: {
            'session.id': 'session_1704067500_timeout',
            'cart.itemCount': 1,
            'cart.total': 29.99,
          },
        },
        {
          time: 1704067500500,
          name: 'payment.initiated',
          attributes: {
            'payment.method': 'card',
            'payment.amount': 29.99,
          },
        },
        {
          time: 1704067500600,
          name: 'inventory.checking',
          attributes: {
            'inventory.skuCount': 1,
          },
        },
        {
          time: 1704067500700,
          name: 'shipping.calculating',
          attributes: {
            'shipping.destination': '10001',
            'shipping.weight': 1.5,
          },
        },
        {
          time: 1704067532000,
          name: 'order.timeout',
          attributes: {
            'timeout.duration': 30000,
            'timeout.phase': 'payment-gateway',
          },
        },
      ],
    },
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

const createMockProvider = (files: Array<{ path: string; relativePath: string; name: string; content: string }>) => {
  // Extract unique directories from file paths
  const dirSet = new Set<string>();
  files.forEach(file => {
    const parts = file.path.split('/');
    for (let i = 1; i < parts.length; i++) {
      const dir = parts.slice(0, i).join('/');
      if (dir) dirSet.add(dir);
    }
  });

  const allDirectories = Array.from(dirSet).map(path => ({
    path,
    relativePath: path,
    name: path.split('/').pop() || '',
  }));

  const fileTreeData = {
    allFiles: files,
    allDirectories,
    sha: 'mock-sha-' + Date.now(),
  };
  const mockSlices = new Map<string, DataSlice>();
  mockSlices.set('fileTree', {
    scope: 'repository',
    name: 'fileTree',
    data: fileTreeData,
    loading: false,
    error: null,
    refresh: async () => {},
  });

  return {
    contextOverrides: {
      slices: mockSlices,
      getSlice: <T,>(name: string) => mockSlices.get(name) as DataSlice<T> | undefined,
      repositoryPath: '/mock/repository',
    },
    actionsOverrides: {
      readFile: async (path: string) => {
        const file = files.find((f) => path.endsWith(f.relativePath));
        if (!file) throw new Error(`File not found: ${path}`);
        return file.content;
      },
    },
  };
};

// ============================================================================
// Stories - Progressive Adoption Journey
// ============================================================================

/**
 * Payment Declined Scenario
 *
 * Shows checkout failure when payment is declined.
 * Demonstrates error telemetry and failure scenario matching.
 */
export const Scenario_PaymentDeclined: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow/payment-declined-scenario/payment-declined-scenario.workflow.json',
        relativePath: '.principal-views/checkout-flow/payment-declined-scenario/payment-declined-scenario.workflow.json',
        name: 'payment-declined-scenario.workflow.json',
        content: JSON.stringify(checkoutWorkflow),
      },
      {
        path: '.principal-views/checkout-flow/payment-declined-scenario/payment-declined.otel.json',
        relativePath: '.principal-views/checkout-flow/payment-declined-scenario/payment-declined.otel.json',
        name: 'payment-declined.otel.json',
        content: JSON.stringify(paymentDeclinedCheckout),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <WorkflowScenariosPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
            selectedWorkflowId="checkout-flow/payment-declined-scenario"
            workflowPath=".principal-views/checkout-flow/payment-declined-scenario/payment-declined-scenario.workflow.json"
            workflowTemplate={checkoutWorkflow}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '❌ Payment declined scenario. Shows how workflow template detects payment.declined=true and renders appropriate error message. Click "payment.failed" step to highlight payment-processing node.',
      },
    },
  },
};

/**
 * Insufficient Inventory Scenario
 *
 * Shows checkout failure when items are out of stock.
 */
export const Scenario_InsufficientInventory: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow/insufficient-inventory-scenario/insufficient-inventory-scenario.workflow.json',
        relativePath: '.principal-views/checkout-flow/insufficient-inventory-scenario/insufficient-inventory-scenario.workflow.json',
        name: 'insufficient-inventory-scenario.workflow.json',
        content: JSON.stringify(checkoutWorkflow),
      },
      {
        path: '.principal-views/checkout-flow/insufficient-inventory-scenario/insufficient-inventory.otel.json',
        relativePath: '.principal-views/checkout-flow/insufficient-inventory-scenario/insufficient-inventory.otel.json',
        name: 'insufficient-inventory.otel.json',
        content: JSON.stringify(insufficientInventoryCheckout),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <WorkflowScenariosPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
            selectedWorkflowId="checkout-flow/insufficient-inventory-scenario"
            workflowPath=".principal-views/checkout-flow/insufficient-inventory-scenario/insufficient-inventory-scenario.workflow.json"
            workflowTemplate={checkoutWorkflow}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '⚠️ Insufficient inventory scenario. Customer tried to buy 5 items but only 3 are available. Shows how inventory checks prevent overselling.',
      },
    },
  },
};

/**
 * Timeout Scenario
 *
 * Shows checkout failure when processing takes too long.
 */
export const Scenario_Timeout: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow/timeout-scenario/timeout-scenario.workflow.json',
        relativePath: '.principal-views/checkout-flow/timeout-scenario/timeout-scenario.workflow.json',
        name: 'timeout-scenario.workflow.json',
        content: JSON.stringify(checkoutWorkflow),
      },
      {
        path: '.principal-views/checkout-flow/timeout-scenario/checkout-timeout.otel.json',
        relativePath: '.principal-views/checkout-flow/timeout-scenario/checkout-timeout.otel.json',
        name: 'checkout-timeout.otel.json',
        content: JSON.stringify(timeoutCheckout),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <WorkflowScenariosPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
            selectedWorkflowId="checkout-flow/timeout-scenario"
            workflowPath=".principal-views/checkout-flow/timeout-scenario/timeout-scenario.workflow.json"
            workflowTemplate={checkoutWorkflow}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '⏱️ Timeout scenario. Payment gateway took >30s to respond. Shows timeout.phase to help debug which service is slow. Click the timeout step to highlight order-finalization node.',
      },
    },
  },
};

/**
 * Partial Narrative Coverage
 *
 * Demonstrates active node filtering: only nodes involved in the narrative are shown as active.
 * This canvas has 11 event nodes, but the narrative only covers 3 events (payment flow).
 * Default view should show only those 3 nodes as active, not all 11.
 */
export const PartialNarrativeCoverage: Story = {
  args: {} as never,
  render: () => {
    // Create a minimal narrative that only covers payment events
    const partialWorkflow: WorkflowTemplate = {
      version: '1.0.0',
      canvas: 'checkout-flow.otel.canvas',
      name: 'Partial Coverage Demo',
      description: 'Narrative that only covers a subset of canvas events',
      mode: 'timeline' as const,
      scenarioSelection: 'first-match' as const,
      scenarios: [
        {
          id: 'payment-scenario',
          priority: 1,
          description: 'Payment processing flow',
          template: {
            introduction: 'Payment Failed Scenario',
            events: {
              'checkout.initiated': 'Checkout started',
              'payment.initiated': 'Payment processing',
              'payment.failed': 'Payment declined',
            },
            summary: 'This scenario only covers payment-related events (3 of 11 canvas nodes).',
          },
        },
        {
          id: 'inventory-scenario',
          priority: 2,
          description: 'Inventory checking flow',
          template: {
            introduction: 'Inventory Shortage Scenario',
            events: {
              'checkout.initiated': 'Checkout started',
              'inventory.checking': 'Checking stock availability',
              'inventory.insufficient': 'Not enough items in stock',
            },
            summary: 'This scenario only covers inventory-related events (3 of 11 canvas nodes).',
          },
        },
        {
          id: 'shipping-scenario',
          priority: 3,
          description: 'Shipping calculation flow',
          template: {
            introduction: 'Shipping Calculation Scenario',
            events: {
              'checkout.initiated': 'Checkout started',
              'shipping.calculating': 'Calculating shipping options',
              'shipping.calculated': 'Shipping cost determined',
            },
            summary: 'This scenario only covers shipping-related events (3 of 11 canvas nodes).',
          },
        },
      ],
    };

    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/payment-flow.workflow.json',
        relativePath: '.principal-views/payment-flow.workflow.json',
        name: 'payment-flow.workflow.json',
        content: JSON.stringify(partialWorkflow),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <WorkflowScenariosPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
            selectedWorkflowId="payment-flow-narrative"
            workflowPath=".principal-views/checkout-flow/payment-workflow.json"
            workflowTemplate={partialWorkflow}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '🎯 Partial narrative coverage test. Canvas has 11 event nodes, but narrative only covers 7 unique events across 3 scenarios:\n' +
          '• Payment scenario: checkout.initiated, payment.initiated, payment.failed\n' +
          '• Inventory scenario: checkout.initiated, inventory.checking, inventory.insufficient\n' +
          '• Shipping scenario: checkout.initiated, shipping.calculating, shipping.calculated\n\n' +
          'Default view should show ONLY those 7 nodes as active. Hover over each scenario to highlight just its 3 nodes. Click a scenario to see its template without needing execution data.',
      },
    },
  },
};

/**
 * Co-Located Executions (Recommended Pattern)
 *
 * Demonstrates the RECOMMENDED storyboard structure with executions co-located in workflow directories.
 * This ensures each workflow only shows its own execution artifacts, not executions from other workflows.
 *
 * Structure:
 * .principal-views/
 *   └── checkout-flow/
 *       ├── checkout-flow.otel.canvas          (storyboard canvas)
 *       ├── complete-checkout/                 (workflow 1)
 *       │   ├── complete-checkout.workflow.json
 *       │   ├── success.otel.json              (co-located execution)
 *       │   └── payment-declined.otel.json     (co-located execution)
 *       └── quick-checkout/                    (workflow 2)
 *           ├── quick-checkout.workflow.json
 *           └── express-success.otel.json      (co-located execution)
 */
export const CoLocatedExecutions: Story = {
  args: {} as never,
  render: () => {
    // Define a complete workflow with all scenarios
    const completeCheckoutWorkflow: WorkflowTemplate = {
      version: '1.0.0',
      canvas: 'checkout-flow.otel.canvas',
      name: 'Complete Checkout',
      description: 'Full checkout process with all steps',
      mode: 'timeline' as const,
      scenarioSelection: 'first-match' as const,
      showLogsPerSpan: true,
      scenarios: [
        {
          id: 'payment-declined',
          priority: 1,
          description: 'Payment was declined',
          template: {
            introduction: 'Payment Declined',
            events: {
              'checkout.initiated': 'Started checkout',
              'payment.initiated': 'Processing payment',
              'payment.failed': 'Payment declined - {{error.message}}',
            },
            summary: 'Payment was declined.',
          },
        },
        {
          id: 'insufficient-inventory',
          priority: 2,
          description: 'Not enough inventory available',
          template: {
            introduction: 'Insufficient Inventory',
            events: {
              'checkout.initiated': 'Started checkout',
              'inventory.checking': 'Checking stock',
              'inventory.insufficient': 'Out of stock - need {{inventory.shortfall}} more items',
            },
            summary: 'Some items are out of stock.',
          },
        },
        {
          id: 'checkout-timeout',
          priority: 3,
          description: 'Checkout process timed out',
          template: {
            introduction: 'Checkout Timeout',
            events: {
              'checkout.initiated': 'Started checkout',
              'payment.initiated': 'Processing payment',
              'inventory.checking': 'Checking inventory',
              'shipping.calculating': 'Calculating shipping',
              'order.timeout': 'Timed out after {{timeout.duration}}ms',
            },
            summary: 'Checkout timed out.',
          },
        },
        {
          id: 'checkout-success',
          priority: 4,
          description: 'Successful checkout',
          template: {
            introduction: 'Checkout Complete',
            events: {
              'checkout.initiated': 'Started checkout',
              'payment.initiated': 'Processing payment',
              'payment.completed': 'Payment successful',
              'inventory.reserved': 'Inventory reserved',
              'shipping.calculated': 'Shipping calculated',
              'order.created': 'Order {{order.id}} created',
            },
            summary: 'Order successfully created!',
          },
        },
      ],
    };

    // Quick checkout workflow (different workflow in same storyboard)
    const quickCheckoutWorkflow: WorkflowTemplate = {
      version: '1.0.0',
      canvas: 'checkout-flow.otel.canvas',
      name: 'Quick Checkout',
      description: 'Express checkout for returning customers',
      mode: 'timeline' as const,
      scenarioSelection: 'first-match' as const,
      scenarios: [
        {
          id: 'express-success',
          priority: 1,
          description: 'Quick checkout success',
          template: {
            introduction: 'Express Checkout Complete',
            events: {
              'checkout.initiated': 'Express checkout started',
              'payment.completed': 'Saved payment method used',
              'order.created': 'Order {{order.id}} created',
            },
            summary: 'Express order created!',
          },
        },
      ],
    };

    const mock = createMockProvider([
      // Storyboard canvas
      {
        path: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      // Workflow 1: Complete Checkout
      {
        path: '.principal-views/checkout-flow/complete-checkout/complete-checkout.workflow.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/complete-checkout.workflow.json',
        name: 'complete-checkout.workflow.json',
        content: JSON.stringify(completeCheckoutWorkflow),
      },
      // Workflow 1 Executions (co-located) - Each with unique attributes
      {
        path: '.principal-views/checkout-flow/complete-checkout/success-1.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/success-1.otel.json',
        name: 'success-1.otel.json',
        content: JSON.stringify(successfulCheckout),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/success-2.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/success-2.otel.json',
        name: 'success-2.otel.json',
        content: JSON.stringify({
          ...successfulCheckout,
          metadata: { ...successfulCheckout.metadata, source: 'test:checkout-success-2' },
          spans: [{
            ...successfulCheckout.spans[0],
            name: 'complete checkout process - large order',
            events: successfulCheckout.spans[0].events.map((event, idx) => {
              if (event.name === 'checkout.initiated') {
                return { ...event, attributes: { ...event.attributes, 'cart.itemCount': 8, 'cart.total': 499.99 } };
              }
              if (event.name === 'order.created') {
                return { ...event, attributes: { 'order.id': 'ORD-20240101-002', 'order.total': 519.98, 'customer.email': 'buyer@example.com' } };
              }
              return event;
            }),
          }],
        }),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/success-3.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/success-3.otel.json',
        name: 'success-3.otel.json',
        content: JSON.stringify({
          ...successfulCheckout,
          metadata: { ...successfulCheckout.metadata, source: 'test:checkout-success-3' },
          spans: [{
            ...successfulCheckout.spans[0],
            name: 'complete checkout process - express shipping',
            events: successfulCheckout.spans[0].events.map((event, idx) => {
              if (event.name === 'checkout.initiated') {
                return { ...event, attributes: { ...event.attributes, 'cart.itemCount': 1, 'cart.total': 79.99 } };
              }
              if (event.name === 'shipping.calculated') {
                return { ...event, attributes: { 'shipping.method': 'FedEx Overnight', 'shipping.cost': 24.99, 'shipping.estimatedDays': 1 } };
              }
              if (event.name === 'order.created') {
                return { ...event, attributes: { 'order.id': 'ORD-20240101-003', 'order.total': 104.98, 'customer.email': 'rush@example.com' } };
              }
              return event;
            }),
          }],
        }),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/success-4.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/success-4.otel.json',
        name: 'success-4.otel.json',
        content: JSON.stringify({
          ...successfulCheckout,
          metadata: { ...successfulCheckout.metadata, source: 'test:checkout-success-4' },
          spans: [{
            ...successfulCheckout.spans[0],
            name: 'complete checkout process - international',
            events: successfulCheckout.spans[0].events.map((event, idx) => {
              if (event.name === 'checkout.initiated') {
                return { ...event, attributes: { ...event.attributes, 'cart.itemCount': 5, 'cart.total': 299.95 } };
              }
              if (event.name === 'shipping.calculating') {
                return { ...event, attributes: { 'shipping.destination': 'M5V 3A8', 'shipping.weight': 12.5 } };
              }
              if (event.name === 'shipping.calculated') {
                return { ...event, attributes: { 'shipping.method': 'International Standard', 'shipping.cost': 45.00, 'shipping.estimatedDays': 7 } };
              }
              if (event.name === 'order.created') {
                return { ...event, attributes: { 'order.id': 'ORD-20240101-004', 'order.total': 344.95, 'customer.email': 'canada@example.com' } };
              }
              return event;
            }),
          }],
        }),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/payment-declined-1.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/payment-declined-1.otel.json',
        name: 'payment-declined-1.otel.json',
        content: JSON.stringify(paymentDeclinedCheckout),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/payment-declined-2.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/payment-declined-2.otel.json',
        name: 'payment-declined-2.otel.json',
        content: JSON.stringify({
          ...paymentDeclinedCheckout,
          metadata: { ...paymentDeclinedCheckout.metadata, source: 'test:payment-declined-insufficient-funds' },
          spans: [{
            ...paymentDeclinedCheckout.spans[0],
            name: 'checkout with insufficient funds',
            events: paymentDeclinedCheckout.spans[0].events.map((event) => {
              if (event.name === 'checkout.initiated') {
                return { ...event, attributes: { ...event.attributes, 'cart.itemCount': 1, 'cart.total': 1299.99 } };
              }
              if (event.name === 'payment.initiated') {
                return { ...event, attributes: { 'payment.method': 'debit', 'payment.amount': 1299.99 } };
              }
              if (event.name === 'payment.failed') {
                return { ...event, attributes: { 'error.code': 'insufficient_funds', 'error.message': 'Insufficient funds in account.', 'payment.declined': true } };
              }
              return event;
            }),
          }],
        }),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/payment-declined-3.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/payment-declined-3.otel.json',
        name: 'payment-declined-3.otel.json',
        content: JSON.stringify({
          ...paymentDeclinedCheckout,
          metadata: { ...paymentDeclinedCheckout.metadata, source: 'test:payment-declined-expired-card' },
          spans: [{
            ...paymentDeclinedCheckout.spans[0],
            name: 'checkout with expired card',
            events: paymentDeclinedCheckout.spans[0].events.map((event) => {
              if (event.name === 'checkout.initiated') {
                return { ...event, attributes: { ...event.attributes, 'cart.itemCount': 4, 'cart.total': 189.96 } };
              }
              if (event.name === 'payment.initiated') {
                return { ...event, attributes: { 'payment.method': 'card', 'payment.amount': 189.96 } };
              }
              if (event.name === 'payment.failed') {
                return { ...event, attributes: { 'error.code': 'card_expired', 'error.message': 'Your card has expired. Please use a different payment method.', 'payment.declined': true } };
              }
              return event;
            }),
          }],
        }),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/insufficient-inventory-1.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/insufficient-inventory-1.otel.json',
        name: 'insufficient-inventory-1.otel.json',
        content: JSON.stringify(insufficientInventoryCheckout),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/insufficient-inventory-2.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/insufficient-inventory-2.otel.json',
        name: 'insufficient-inventory-2.otel.json',
        content: JSON.stringify({
          ...insufficientInventoryCheckout,
          metadata: { ...insufficientInventoryCheckout.metadata, source: 'test:insufficient-inventory-popular-item' },
          spans: [{
            ...insufficientInventoryCheckout.spans[0],
            name: 'checkout with popular item sold out',
            events: insufficientInventoryCheckout.spans[0].events.map((event) => {
              if (event.name === 'checkout.initiated') {
                return { ...event, attributes: { ...event.attributes, 'cart.itemCount': 10, 'cart.total': 599.90 } };
              }
              if (event.name === 'inventory.checking') {
                return { ...event, attributes: { 'inventory.skuCount': 10 } };
              }
              if (event.name === 'inventory.insufficient') {
                return { ...event, attributes: { 'inventory.shortfall': 7, 'inventory.availableCount': 3 } };
              }
              return event;
            }),
          }],
        }),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/checkout-timeout-1.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/checkout-timeout-1.otel.json',
        name: 'checkout-timeout-1.otel.json',
        content: JSON.stringify(timeoutCheckout),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/checkout-timeout-2.otel.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/checkout-timeout-2.otel.json',
        name: 'checkout-timeout-2.otel.json',
        content: JSON.stringify({
          ...timeoutCheckout,
          metadata: { ...timeoutCheckout.metadata, source: 'test:checkout-timeout-shipping-api' },
          spans: [{
            ...timeoutCheckout.spans[0],
            name: 'checkout timeout from shipping API',
            events: timeoutCheckout.spans[0].events.map((event) => {
              if (event.name === 'checkout.initiated') {
                return { ...event, attributes: { ...event.attributes, 'cart.itemCount': 2, 'cart.total': 119.98 } };
              }
              if (event.name === 'shipping.calculating') {
                return { ...event, attributes: { 'shipping.destination': '90210', 'shipping.weight': 8.3 } };
              }
              if (event.name === 'order.timeout') {
                return { ...event, attributes: { 'timeout.duration': 30000, 'timeout.phase': 'shipping-rate-api' } };
              }
              return event;
            }),
          }],
        }),
      },
      // Workflow 2: Quick Checkout
      {
        path: '.principal-views/checkout-flow/quick-checkout/quick-checkout.workflow.json',
        relativePath: '.principal-views/checkout-flow/quick-checkout/quick-checkout.workflow.json',
        name: 'quick-checkout.workflow.json',
        content: JSON.stringify(quickCheckoutWorkflow),
      },
      // Workflow 2 Execution (co-located) - modified for quick checkout
      {
        path: '.principal-views/checkout-flow/quick-checkout/express-success.otel.json',
        relativePath: '.principal-views/checkout-flow/quick-checkout/express-success.otel.json',
        name: 'express-success.otel.json',
        content: JSON.stringify({
          ...successfulCheckout,
          metadata: {
            ...successfulCheckout.metadata,
            source: 'test:quick-checkout',
          },
          spans: [
            {
              ...successfulCheckout.spans[0],
              name: 'express checkout',
              // Only 3 events for quick checkout
              events: [
                successfulCheckout.spans[0].events[0], // checkout.initiated
                successfulCheckout.spans[0].events[4], // payment.completed
                successfulCheckout.spans[0].events[7], // order.created
              ],
            },
          ],
        }),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <WorkflowScenariosPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
            selectedWorkflowId="checkout-flow/complete-checkout"
            workflowPath=".principal-views/checkout-flow/complete-checkout/complete-checkout.workflow.json"
            workflowTemplate={completeCheckoutWorkflow}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '🎯 RECOMMENDED PATTERN: Co-located executions in workflow directories.\n\n' +
          'This storyboard has TWO workflows:\n' +
          '  1. Complete Checkout (11 executions covering 4 scenarios)\n' +
          '     • 4x checkout-success\n' +
          '     • 3x payment-declined\n' +
          '     • 2x insufficient-inventory\n' +
          '     • 2x checkout-timeout\n' +
          '  2. Quick Checkout (1 execution: express-success)\n\n' +
          'Each workflow ONLY shows its own co-located executions. This prevents:\n' +
          '  • Execution from Quick Checkout appearing in Complete Checkout workflow\n' +
          '  • Incorrect scenario mappings when events don\'t match the workflow template\n\n' +
          'Click the "Traces (11)" button to see the trace search view with scenario filtering and search!\n' +
          'The directory structure creates isolated contexts for each workflow.',
      },
    },
  },
};

/**
 * Canvas with Documentation
 *
 * Demonstrates the Docs button that appears when a canvas has associated markdown documentation.
 * Click the "Docs" button in the header to open the documentation file.
 */
export const CanvasWithDocumentation: Story = {
  args: {} as never,
  render: () => {
    // Canvas with markdown documentation field
    const canvasWithDocs = {
      ...checkoutCanvas,
      pv: {
        ...checkoutCanvas.pv,
        version: '1.0.0',
        name: 'Checkout Flow',
        description: 'E-commerce checkout process with comprehensive documentation',
        markdown: '.principal-views/checkout-flow.md',
      },
    };

    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(canvasWithDocs),
      },
      {
        path: '.principal-views/checkout-flow.md',
        relativePath: '.principal-views/checkout-flow.md',
        name: 'checkout-flow.md',
        content: '# Checkout Flow Documentation\n\nThis is the documentation for the checkout flow canvas.',
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <WorkflowScenariosPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
            selectedWorkflowId="checkout-flow-narrative"
            workflowPath=".principal-views/checkout-flow/checkout-workflow.json"
            workflowTemplate={checkoutWorkflow}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Canvas with associated markdown documentation. Notice the "Docs" button in the header next to the "Edit" button. ' +
          'Clicking it will emit a file:open event to open the markdown file specified in canvas.pv.markdown. ' +
          'This pattern allows you to provide detailed documentation alongside your canvas diagrams.',
      },
    },
  },
};

/**
 * Story: Incomplete Template Data Warning
 *
 * Demonstrates what happens when the workflow template expects variables
 * that aren't present in the execution data. The system will show a warning
 * banner about incomplete template data.
 */
export const IncompleteTemplateData: Story = {
  args: {} as never,
  render: () => {
    // Workflow template that expects variables NOT present in execution data
    const templateWithMissingVars: WorkflowTemplate = {
      version: '1.0.0',
      canvas: 'checkout-flow.otel.canvas',
      name: 'Template with Missing Variables',
      description: 'This template expects variables that the execution data does not provide',
      mode: 'timeline' as const,
      scenarioSelection: 'first-match' as const,
      scenarios: [
        {
          id: 'payment-declined-missing-vars',
          priority: 1,
          description: 'Payment was declined',
          template: {
            introduction: 'Payment Declined',
            events: {
              'checkout.initiated':
                'Checkout started for {{cart.itemCount}} items totaling ${{cart.total}}',
              'payment.initiated':
                'Processing {{payment.method}} payment for ${{payment.amount}}',
              'payment.failed':
                'Payment declined\n' +
                '    • Error Code: {{error.code}}\n' +
                '    • Reason: {{error.message}}\n' +
                '    • Customer Name: {{customer.name}}\n' + // This variable doesn't exist!
                '    • Customer Email: {{customer.email}}\n' + // This variable doesn't exist!
                '    • Retry Attempt: {{payment.retryCount}}\n' + // This variable doesn't exist!
                '    • Card Type: {{payment.cardType}}', // This variable doesn't exist!
            },
            summary:
              'Payment was declined for {{customer.name}}. ' + // This variable doesn't exist!
              'Card ending in {{payment.lastFourDigits}} was rejected.', // This variable doesn't exist!
          },
        },
      ],
    };

    // Use the existing payment declined execution data (which has limited attributes)
    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow/template-mismatch/template-mismatch.workflow.json',
        relativePath: '.principal-views/checkout-flow/template-mismatch/template-mismatch.workflow.json',
        name: 'template-mismatch.workflow.json',
        content: JSON.stringify(templateWithMissingVars),
      },
      {
        path: '.principal-views/checkout-flow/template-mismatch/incomplete-template-data.otel.json',
        relativePath: '.principal-views/checkout-flow/template-mismatch/incomplete-template-data.otel.json',
        name: 'incomplete-template-data.otel.json',
        content: JSON.stringify(paymentDeclinedCheckout),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <WorkflowScenariosPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
            selectedWorkflowId="checkout-flow/template-mismatch"
            workflowPath=".principal-views/checkout-flow/template-mismatch/template-mismatch.workflow.json"
            workflowTemplate={templateWithMissingVars}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '⚠️ **Incomplete Template Data Warning** - This story demonstrates what happens when the workflow template expects variables (like `{{customer.name}}`, `{{payment.cardType}}`) that are NOT present in the execution data.\n\n' +
          '**What You\'ll See:**\n' +
          '- A yellow warning banner at the top of the narrative view\n' +
          '- Unresolved template variables displayed as `{{variableName}}`\n' +
          '- A suggestion to click "Raw Events" to see available data\n\n' +
          '**Common Causes:**\n' +
          '1. Template expects attributes that weren\'t captured in the test\n' +
          '2. Attribute names have changed between template and instrumentation\n' +
          '3. Conditional attributes that may not always be present\n\n' +
          '**How to Fix:**\n' +
          '1. Click "Raw Events" in the view mode selector\n' +
          '2. Right-click on events to see available attributes\n' +
          '3. Update template to use correct variable names\n' +
          '4. Or update instrumentation to capture missing data',
      },
    },
  },
};

/**
 * Story: Incomplete Template Data - Missing Event
 *
 * This demonstrates what happens when the workflow template defines an event
 * that is NOT present in the execution data. The narrative should show the
 * event is missing or skip it gracefully.
 */
export const IncompleteTemplateData_MissingEvent: Story = {
  args: {} as never,
  render: () => {
    // Template expects payment.initiated but execution data skips directly to payment.failed
    const templateExpectingMissingEvent: WorkflowTemplate = {
      version: '1.0.0',
      canvas: 'checkout-flow.otel.canvas',
      name: 'Template Expecting Missing Event',
      description: 'This template expects an event that the execution data does not contain',
      mode: 'timeline' as const,
      scenarioSelection: 'first-match' as const,
      scenarios: [
        {
          id: 'payment-declined-missing-event',
          priority: 1,
          description: 'Payment was declined (with missing intermediate event)',
          template: {
            introduction: 'Payment Declined Flow',
            events: {
              'checkout.initiated': 'Customer started checkout with {{cart.itemCount}} items (${{cart.total}})',
              'user.authenticated': 'User verified their identity', // This event won't exist in the execution!
              'payment.initiated': 'Started processing payment via {{payment.method}}', // This event won't exist!
              'payment.failed': 'Payment was declined: {{error.message}}',
            },
            summary: 'Payment failed due to card decline. Two intermediate events were not captured.',
          },
        },
      ],
    };

    // Execution data that SKIPS the user.authenticated and payment.initiated events
    const executionMissingEvents = {
      metadata: {
        canvasName: 'E-Commerce Checkout Flow',
        exportedAt: new Date().toISOString(),
        source: 'test:checkout-missing-events',
        framework: 'bun',
        status: 'failure' as const,
      },
      spans: [
        {
          id: 'span-missing-events',
          name: 'checkout with missing intermediate events',
          startTime: 1704067300000,
          endTime: 1704067301500,
          duration: 1500,
          status: 'ERROR' as const,
          attributes: {
            'span.kind': 'test.case',
            'test.name': 'checkout with missing intermediate events',
            'test.framework': 'bun',
            'test.file': 'checkout.test.ts',
          },
          events: [
            {
              time: 1704067300000,
              name: 'checkout.initiated',
              attributes: {
                'session.id': 'session_missing_events',
                'cart.itemCount': 3,
                'cart.total': 149.99,
              },
            },
            // NOTE: user.authenticated event is MISSING
            // NOTE: payment.initiated event is MISSING
            {
              time: 1704067301500,
              name: 'payment.failed',
              attributes: {
                'error.code': 'card_declined',
                'error.message': 'Insufficient funds',
                'payment.declined': true,
              },
            },
          ],
        },
      ],
    };

    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow/missing-event/missing-event.workflow.json',
        relativePath: '.principal-views/checkout-flow/missing-event/missing-event.workflow.json',
        name: 'missing-event.workflow.json',
        content: JSON.stringify(templateExpectingMissingEvent),
      },
      {
        path: '.principal-views/checkout-flow/missing-event/execution-missing-events.otel.json',
        relativePath: '.principal-views/checkout-flow/missing-event/execution-missing-events.otel.json',
        name: 'execution-missing-events.otel.json',
        content: JSON.stringify(executionMissingEvents),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <WorkflowScenariosPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
            selectedWorkflowId="checkout-flow/missing-event"
            workflowPath=".principal-views/checkout-flow/missing-event/missing-event.workflow.json"
            workflowTemplate={templateExpectingMissingEvent}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '⚠️ **Missing Event in Template** - This story demonstrates what happens when the workflow template defines events (like `user.authenticated`, `payment.initiated`) that do NOT exist in the execution data.\n\n' +
          '**Difference from IncompleteTemplateData:**\n' +
          '- `IncompleteTemplateData`: Template variables (attributes) are missing\n' +
          '- `IncompleteTemplateData_MissingEvent`: Entire events are missing from the execution\n\n' +
          '**What You\'ll See:**\n' +
          '- Events defined in the template but missing from execution should be handled gracefully\n' +
          '- The narrative may show gaps or skip missing events\n' +
          '- This helps identify instrumentation gaps where events aren\'t being captured\n\n' +
          '**Common Causes:**\n' +
          '1. Instrumentation was not added for certain events\n' +
          '2. Events are conditionally emitted and weren\'t triggered\n' +
          '3. Test execution followed a different code path\n' +
          '4. Event names have changed between template and instrumentation',
      },
    },
  },
};

/**
 * Live OTEL Traces
 *
 * Demonstrates the Live Trace Search View with real-time OTEL traces from the telemetry slice.
 * Shows how live traces from running services can be searched and filtered.
 */
export const LiveOtelTraces: Story = {
  args: {} as never,
  render: () => {
    // Create live TraceInfo objects (simulating telemetry slice data)
    const liveTraces: TraceInfo[] = [
      // Success trace 1
      {
        traceId: 'a1b2c3d4e5f6g7h8',
        spans: [
          {
            traceId: 'a1b2c3d4e5f6g7h8',
            spanId: 'span001',
            name: 'checkout.complete',
            startTimeUnixNano: '1704067200000000000',
            endTimeUnixNano: '1704067203500000000',
            parentSpanId: '',
            kind: 1,
            status: { code: 1 },
            attributes: [
              { key: 'span.kind', value: { stringValue: 'internal' } },
            ],
            events: [
              {
                name: 'checkout.initiated',
                timeUnixNano: '1704067200000000000',
                attributes: [
                  { key: 'cart.itemCount', value: { intValue: '3' } },
                  { key: 'cart.total', value: { stringValue: '149.99' } },
                ],
              },
              {
                name: 'payment.completed',
                timeUnixNano: '1704067201800000000',
                attributes: [
                  { key: 'payment.transactionId', value: { stringValue: 'txn_live_001' } },
                ],
              },
              {
                name: 'order.created',
                timeUnixNano: '1704067203500000000',
                attributes: [
                  { key: 'order.id', value: { stringValue: 'ORD-LIVE-001' } },
                ],
              },
            ],
          },
        ],
        rootSpan: undefined,
        serviceName: 'checkout-service',
        serviceVersion: '2.3.1',
        repositoryUrl: 'https://github.com/example/checkout',
        commitSha: 'abc123',
        startTime: 1704067200000,
        endTime: 1704067203500,
        duration: 3500,
        spanCount: 1,
        hasErrors: false,
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'checkout-service' } },
            { key: 'service.version', value: { stringValue: '2.3.1' } },
            { key: 'pv.scenario.id', value: { stringValue: 'checkout-success' } },
            { key: 'pv.scenario.name', value: { stringValue: 'Checkout Success' } },
          ],
        },
        matchedWorkflow: {
          storyboardId: 'checkout-flow',
          storyboardName: 'Checkout Flow',
          workflowId: 'complete-checkout',
          workflowName: 'Complete Checkout',
          scenarioId: 'checkout-success',
          scenarioName: 'Checkout Success',
        },
      },
      // Payment declined trace
      {
        traceId: 'b2c3d4e5f6g7h8i9',
        spans: [
          {
            traceId: 'b2c3d4e5f6g7h8i9',
            spanId: 'span002',
            name: 'checkout.payment-declined',
            startTimeUnixNano: '1704067300000000000',
            endTimeUnixNano: '1704067301500000000',
            parentSpanId: '',
            kind: 1,
            status: { code: 2 },
            attributes: [],
            events: [
              {
                name: 'checkout.initiated',
                timeUnixNano: '1704067300000000000',
                attributes: [
                  { key: 'cart.itemCount', value: { intValue: '2' } },
                  { key: 'cart.total', value: { stringValue: '89.99' } },
                ],
              },
              {
                name: 'payment.failed',
                timeUnixNano: '1704067301500000000',
                attributes: [
                  { key: 'error.code', value: { stringValue: 'card_declined' } },
                  { key: 'error.message', value: { stringValue: 'Insufficient funds' } },
                ],
              },
            ],
          },
        ],
        rootSpan: undefined,
        serviceName: 'payment-service',
        serviceVersion: '1.8.2',
        repositoryUrl: undefined,
        commitSha: undefined,
        startTime: 1704067300000,
        endTime: 1704067301500,
        duration: 1500,
        spanCount: 1,
        hasErrors: true,
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'payment-service' } },
            { key: 'service.version', value: { stringValue: '1.8.2' } },
            { key: 'pv.scenario.id', value: { stringValue: 'payment-declined' } },
          ],
        },
        matchedWorkflow: {
          storyboardId: 'checkout-flow',
          storyboardName: 'Checkout Flow',
          scenarioId: 'payment-declined',
        },
      },
      // Inventory check trace
      {
        traceId: 'c3d4e5f6g7h8i9j0',
        spans: [
          {
            traceId: 'c3d4e5f6g7h8i9j0',
            spanId: 'span003',
            name: 'inventory.check',
            startTimeUnixNano: '1704067400000000000',
            endTimeUnixNano: '1704067400800000000',
            parentSpanId: '',
            kind: 1,
            status: { code: 1 },
            attributes: [],
            events: [
              {
                name: 'inventory.checking',
                timeUnixNano: '1704067400000000000',
                attributes: [
                  { key: 'inventory.skuCount', value: { intValue: '5' } },
                ],
              },
              {
                name: 'inventory.reserved',
                timeUnixNano: '1704067400800000000',
                attributes: [
                  { key: 'inventory.itemsReserved', value: { intValue: '5' } },
                ],
              },
            ],
          },
        ],
        rootSpan: undefined,
        serviceName: 'inventory-service',
        serviceVersion: '3.1.0',
        repositoryUrl: undefined,
        commitSha: undefined,
        startTime: 1704067400000,
        endTime: 1704067400800,
        duration: 800,
        spanCount: 1,
        hasErrors: false,
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'inventory-service' } },
            { key: 'service.version', value: { stringValue: '3.1.0' } },
          ],
        },
      },
      // Another success with different service
      {
        traceId: 'd4e5f6g7h8i9j0k1',
        spans: [
          {
            traceId: 'd4e5f6g7h8i9j0k1',
            spanId: 'span004',
            name: 'checkout.express',
            startTimeUnixNano: '1704067500000000000',
            endTimeUnixNano: '1704067501200000000',
            parentSpanId: '',
            kind: 1,
            status: { code: 1 },
            attributes: [],
            events: [
              {
                name: 'checkout.initiated',
                timeUnixNano: '1704067500000000000',
                attributes: [
                  { key: 'cart.itemCount', value: { intValue: '1' } },
                  { key: 'cart.total', value: { stringValue: '49.99' } },
                ],
              },
              {
                name: 'order.created',
                timeUnixNano: '1704067501200000000',
                attributes: [
                  { key: 'order.id', value: { stringValue: 'ORD-LIVE-002' } },
                ],
              },
            ],
          },
        ],
        rootSpan: undefined,
        serviceName: 'express-checkout-service',
        serviceVersion: '1.0.0-beta',
        repositoryUrl: undefined,
        commitSha: undefined,
        startTime: 1704067500000,
        endTime: 1704067501200,
        duration: 1200,
        spanCount: 1,
        hasErrors: false,
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'express-checkout-service' } },
            { key: 'service.version', value: { stringValue: '1.0.0-beta' } },
            { key: 'pv.scenario.id', value: { stringValue: 'checkout-success' } },
          ],
        },
        matchedWorkflow: {
          storyboardId: 'checkout-flow',
          storyboardName: 'Checkout Flow',
          scenarioId: 'checkout-success',
        },
      },
      // Timeout trace
      {
        traceId: 'e5f6g7h8i9j0k1l2',
        spans: [
          {
            traceId: 'e5f6g7h8i9j0k1l2',
            spanId: 'span005',
            name: 'checkout.timeout',
            startTimeUnixNano: '1704067600000000000',
            endTimeUnixNano: '1704067632000000000',
            parentSpanId: '',
            kind: 1,
            status: { code: 2 },
            attributes: [],
            events: [
              {
                name: 'checkout.initiated',
                timeUnixNano: '1704067600000000000',
                attributes: [
                  { key: 'cart.itemCount', value: { intValue: '4' } },
                ],
              },
              {
                name: 'order.timeout',
                timeUnixNano: '1704067632000000000',
                attributes: [
                  { key: 'timeout.duration', value: { intValue: '30000' } },
                  { key: 'timeout.phase', value: { stringValue: 'payment-gateway' } },
                ],
              },
            ],
          },
        ],
        rootSpan: undefined,
        serviceName: 'checkout-service',
        serviceVersion: '2.3.0',
        repositoryUrl: undefined,
        commitSha: undefined,
        startTime: 1704067600000,
        endTime: 1704067632000,
        duration: 32000,
        spanCount: 1,
        hasErrors: true,
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'checkout-service' } },
            { key: 'service.version', value: { stringValue: '2.3.0' } },
            { key: 'pv.scenario.id', value: { stringValue: 'checkout-timeout' } },
          ],
        },
        matchedWorkflow: {
          storyboardId: 'checkout-flow',
          storyboardName: 'Checkout Flow',
          scenarioId: 'checkout-timeout',
        },
      },
    ];

    // Set up each trace's rootSpan
    liveTraces.forEach(trace => {
      if (trace.spans.length > 0) {
        trace.rootSpan = trace.spans[0];
      }
    });

    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow/complete-checkout/complete-checkout.workflow.json',
        relativePath: '.principal-views/checkout-flow/complete-checkout/complete-checkout.workflow.json',
        name: 'complete-checkout.workflow.json',
        content: JSON.stringify(checkoutWorkflow),
      },
    ]);

    // Add telemetry slice with live traces
    const telemetrySlice: DataSlice<TraceInfo[]> = {
      scope: 'repository',
      name: 'telemetry',
      data: liveTraces,
      loading: false,
      error: null,
      refresh: async () => {},
    };

    mock.contextOverrides.slices.set('telemetry', telemetrySlice);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <WorkflowScenariosPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
            selectedWorkflowId="checkout-flow/complete-checkout"
            workflowPath=".principal-views/checkout-flow/complete-checkout/complete-checkout.workflow.json"
            workflowTemplate={checkoutWorkflow}
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '🔴 **Live OTEL Traces** - Demonstrates the Live Trace Search View with real-time telemetry data.\n\n' +
          'This story shows 5 live OTEL traces from the telemetry slice:\n' +
          '  • 2x checkout-success (checkout-service v2.3.1, express-checkout-service v1.0.0-beta)\n' +
          '  • 1x payment-declined (payment-service v1.8.2)\n' +
          '  • 1x checkout-timeout (checkout-service v2.3.0)\n' +
          '  • 1x unmatched inventory check (inventory-service v3.1.0)\n\n' +
          'Click the "Live Traces (5)" button (with Radar icon) in the header to:\n' +
          '  • Search traces by service name, operation, trace ID, scenario\n' +
          '  • Filter by scenario when a scenario is selected\n' +
          '  • See service versions, durations, and error states\n' +
          '  • Click a trace to load it into the execution viewer\n\n' +
          'The Live Trace Search View works with TraceInfo data from the telemetry slice,\n' +
          'while the Test Trace Search View works with file-based test artifacts.',
      },
    },
  },
};
