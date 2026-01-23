import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { CanvasDetailPanel } from './CanvasDetailPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { DataSlice } from '../types';

/**
 * CanvasDetailPanel - OTEL Execution Visualizer
 *
 * Visualizes OpenTelemetry execution artifacts from tests overlaid on canvas architecture diagrams.
 * Demonstrates the complete workflow: Canvas Narrative Templates Test Execution Visual Debugging
 *
 * ## Key Features:
 * - **Event-to-Node Mapping**: Automatically highlights canvas nodes as events play back
 * - **Clickable Narratives**: Click narrative steps to highlight corresponding canvas nodes
 * - **Scenario Matching**: Multiple narrative scenarios (success, error, timeout) matched to execution data
 * - **Test Playback**: Step through execution timeline with automatic node highlighting
 *
 * ## Progressive Onboarding:
 * These stories demonstrate the incremental adoption path:
 * 1. Start with canvas only (architecture documentation)
 * 2. Add narrative templates (human-readable scenarios)
 * 3. Add test execution data (validation & debugging)
 */
const meta = {
  title: 'Panels/CanvasDetailPanel',
  component: CanvasDetailPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete OTEL visualization panel showing canvas architecture, narrative scenarios, and test execution playback. Click narrative steps to highlight nodes!',
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
} satisfies Meta<typeof CanvasDetailPanel>;

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
        sources: ['src/checkout/*.ts', 'src/cart/checkout.ts'],
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
        sources: ['src/payment/*.ts'],
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

const checkoutNarrative = {
  version: '1.0.0',
  canvas: 'checkout-flow.otel.canvas',
  name: 'Checkout Flow',
  description: 'Checkout process execution scenarios',
  mode: 'timeline',
  scenarioSelection: 'first-match',
  showLogsPerSpan: true,
  scenarios: [
    {
      id: 'payment-declined',
      priority: 1,
      description: 'Payment was declined',
      condition: {
        requires: ['payment.failed'],
        assertions: {
          'payment.declined': { $eq: true },
        },
      },
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
      condition: {
        requires: ['inventory.insufficient'],
      },
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
      condition: {
        requires: ['order.timeout'],
      },
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
      condition: {
        requires: ['order.created'],
      },
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
      condition: {
        default: true,
      },
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
  const fileTreeData = { allFiles: files };
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
 * Step 1: Canvas Only
 *
 * Starting point - just architecture documentation.
 * Shows canvas structure with nodes and edges representing the checkout flow.
 */
export const Step1_CanvasOnly: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <CanvasDetailPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Just the canvas - no narratives or execution data yet. Use this to document your architecture before adding telemetry.',
      },
    },
  },
};

/**
 * Step 2: Canvas + Narrative Templates
 *
 * Add narrative scenarios to make telemetry human-readable.
 * Defines success, failure, timeout scenarios but has no execution data yet.
 */
export const Step2_CanvasWithNarratives: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow.narrative.json',
        relativePath: '.principal-views/checkout-flow.narrative.json',
        name: 'checkout-flow.narrative.json',
        content: JSON.stringify(checkoutNarrative),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <CanvasDetailPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Canvas + Narrative templates. Shows scenario structure (success, payment declined, insufficient inventory, timeout) without actual execution data. Click "?" to learn about narratives.',
      },
    },
  },
};

/**
 * Step 3: Successful Checkout Execution
 *
 * Complete flow - canvas + narratives + test execution showing successful checkout.
 * Click narrative steps to highlight corresponding canvas nodes!
 */
export const Step3_SuccessfulCheckout: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow.narrative.json',
        relativePath: '.principal-views/checkout-flow.narrative.json',
        name: 'checkout-flow.narrative.json',
        content: JSON.stringify(checkoutNarrative),
      },
      {
        path: '.principal-views/__executions__/checkout-success.otel.json',
        relativePath: '.principal-views/__executions__/checkout-success.otel.json',
        name: 'checkout-success.otel.json',
        content: JSON.stringify(successfulCheckout),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <CanvasDetailPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '✅ Successful checkout execution. Shows full flow: payment processed, inventory reserved, shipping calculated, order created. Switch to "Narrative" view and click steps to highlight nodes!',
      },
    },
  },
};

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
        path: '.principal-views/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow.narrative.json',
        relativePath: '.principal-views/checkout-flow.narrative.json',
        name: 'checkout-flow.narrative.json',
        content: JSON.stringify(checkoutNarrative),
      },
      {
        path: '.principal-views/__executions__/checkout-payment-declined.otel.json',
        relativePath: '.principal-views/__executions__/checkout-payment-declined.otel.json',
        name: 'checkout-payment-declined.otel.json',
        content: JSON.stringify(paymentDeclinedCheckout),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <CanvasDetailPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '❌ Payment declined scenario. Shows how narrative template detects payment.declined=true and renders appropriate error message. Click "payment.failed" step to highlight payment-processing node.',
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
        path: '.principal-views/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow.narrative.json',
        relativePath: '.principal-views/checkout-flow.narrative.json',
        name: 'checkout-flow.narrative.json',
        content: JSON.stringify(checkoutNarrative),
      },
      {
        path: '.principal-views/__executions__/checkout-insufficient-inventory.otel.json',
        relativePath: '.principal-views/__executions__/checkout-insufficient-inventory.otel.json',
        name: 'checkout-insufficient-inventory.otel.json',
        content: JSON.stringify(insufficientInventoryCheckout),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <CanvasDetailPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
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
        path: '.principal-views/checkout-flow.otel.canvas',
        relativePath: '.principal-views/checkout-flow.otel.canvas',
        name: 'checkout-flow.otel.canvas',
        content: JSON.stringify(checkoutCanvas),
      },
      {
        path: '.principal-views/checkout-flow.narrative.json',
        relativePath: '.principal-views/checkout-flow.narrative.json',
        name: 'checkout-flow.narrative.json',
        content: JSON.stringify(checkoutNarrative),
      },
      {
        path: '.principal-views/__executions__/checkout-timeout.otel.json',
        relativePath: '.principal-views/__executions__/checkout-timeout.otel.json',
        name: 'checkout-timeout.otel.json',
        content: JSON.stringify(timeoutCheckout),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <CanvasDetailPanel
            {...props}
            selectedCanvasId="checkout-flow"
            canvasPath=".principal-views/checkout-flow.otel.canvas"
            canvasName="Checkout Flow"
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
