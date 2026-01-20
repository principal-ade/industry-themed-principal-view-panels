import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect } from 'react';
import { CanvasDetailPanel } from './CanvasDetailPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { DataSlice } from '../types';

/**
 * CanvasDetailPanel Component
 *
 * Visualizes execution artifacts (test runs) overlaid on canvas diagrams.
 * Canvas files are selected from the CanvasListPanel via events.
 *
 * Features:
 * - Narrative template visualization with scenario mapping
 * - Execution artifact playback with timeline controls
 * - Side-by-side canvas and event visualization
 * - Metadata display (spans, events, framework, status)
 */
const meta = {
  title: 'Panels/CanvasDetailPanel',
  component: CanvasDetailPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visualizes execution artifacts captured from test runs and overlays them on canvas diagrams. Select a canvas from the CanvasListPanel to begin.',
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
// Mock Data
// ============================================================================

// Mock canvas for order processing
const mockOrderProcessingCanvas = {
  nodes: [
    {
      id: 'order-received',
      type: 'text',
      text: '# Order Received\n\nCustomer places order',
      x: 0,
      y: 0,
      width: 250,
      height: 120,
      pv: {
        nodeType: 'event',
        name: 'Order Received',
        description: 'Customer places order',
        shape: 'rectangle',
        fill: '#3b82f6',
      },
    },
    {
      id: 'payment-processed',
      type: 'text',
      text: '# Payment Processed\n\nPayment validated and charged',
      x: -200,
      y: 200,
      width: 250,
      height: 100,
      pv: {
        nodeType: 'event',
        name: 'Payment Processed',
        shape: 'rectangle',
        fill: '#10b981',
      },
    },
    {
      id: 'inventory-reserved',
      type: 'text',
      text: '# Inventory Reserved\n\nItems reserved for order',
      x: 100,
      y: 200,
      width: 250,
      height: 100,
      pv: {
        nodeType: 'event',
        name: 'Inventory Reserved',
        shape: 'rectangle',
        fill: '#f59e0b',
      },
    },
    {
      id: 'order-completed',
      type: 'text',
      text: '# Order Completed\n\nOrder ready for fulfillment',
      x: 0,
      y: 380,
      width: 250,
      height: 100,
      pv: {
        nodeType: 'event',
        name: 'Order Completed',
        shape: 'rectangle',
        fill: '#8b5cf6',
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'order-received',
      target: 'payment-processed',
    },
    {
      id: 'edge-2',
      source: 'order-received',
      target: 'inventory-reserved',
    },
    {
      id: 'edge-3',
      source: 'payment-processed',
      target: 'order-completed',
    },
    {
      id: 'edge-4',
      source: 'inventory-reserved',
      target: 'order-completed',
    },
  ],
};

// Mock narrative template for order processing
const progressiveMockNarrative = {
  name: 'Order Processing Scenarios',
  description: 'Different order processing flows based on status',
  scenarios: [
    {
      id: 'success',
      name: 'Successful Order',
      condition: {
        type: 'attribute',
        key: 'status',
        value: 'OK',
      },
      template: {
        introduction: '✓ Order processed successfully',
        flow: [
          'Order received from {customer.name}',
          'Payment of ${order.total} processed',
          'Inventory reserved for {items.count} items',
          'Order {order.id} completed',
        ],
      },
    },
    {
      id: 'error',
      name: 'Failed Order',
      condition: {
        type: 'attribute',
        key: 'status',
        value: 'ERROR',
      },
      template: {
        introduction: '✗ Order processing failed',
        flow: [
          'Order received',
          'Error occurred: {error.message}',
        ],
      },
    },
  ],
};

// Mock execution artifact for order processing narrative
const progressiveMockExecution = {
  metadata: {
    canvasName: 'Order Processing Flow',
    exportedAt: new Date().toISOString(),
    source: 'test:order-processing',
    framework: 'bun',
    status: 'success' as const,
  },
  spans: [
    {
      id: 'span-order-1',
      name: 'process order',
      startTime: Date.now(),
      endTime: Date.now() + 2000,
      duration: 2000,
      status: 'OK',
      attributes: {
        'span.kind': 'test.case',
        'test.name': 'process order',
        'order.id': 'ORD-12345',
        'customer.name': 'John Doe',
        'order.total': 149.99,
      },
      events: [
        {
          time: Date.now(),
          name: 'order.received',
          attributes: {
            'order.id': 'ORD-12345',
            'customer.name': 'John Doe',
          },
        },
        {
          time: Date.now() + 500,
          name: 'payment.processed',
          attributes: {
            'order.total': 149.99,
            'payment.method': 'credit_card',
          },
        },
        {
          time: Date.now() + 1200,
          name: 'inventory.reserved',
          attributes: {
            'items.count': 3,
          },
        },
        {
          time: Date.now() + 1800,
          name: 'order.completed',
          attributes: {
            'order.id': 'ORD-12345',
            'customer.name': 'John Doe',
            'order.total': 149.99,
          },
        },
      ],
    },
  ],
};

// Helper to create mock provider setup
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

// Simple event emitter interface matching PanelEventEmitter
interface EventEmitter {
  emit: (event: { type: string; source: string; timestamp: number; payload: unknown }) => void;
}

// Helper component to emit canvas selection event on mount
const CanvasSelector: React.FC<{
  events: EventEmitter;
  canvasId: string;
  canvasPath: string;
  canvasName: string;
  children: React.ReactNode;
}> = ({ events, canvasId, canvasPath, canvasName, children }) => {
  useEffect(() => {
    // Simulate canvas selection from CanvasListPanel
    // Delay to ensure CanvasDetailPanel's event listener is set up
    const timer = setTimeout(() => {
      events.emit({
        type: 'custom',
        source: 'canvas-list-panel',
        timestamp: Date.now(),
        payload: {
          action: 'selectCanvas',
          canvasId,
          canvas: {
            id: canvasId,
            name: canvasName,
            path: canvasPath,
            source: 'folder' as const,
            basename: canvasId,
          },
        },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [events, canvasId, canvasPath, canvasName]);

  return <>{children}</>;
};

// ============================================================================
// Stories
// ============================================================================

/**
 * Step 2: Canvas + Narrative Template
 * Adds narrative template but no execution data yet.
 * Shows scenario mapping without actual execution runs.
 */
export const ProgressiveStep2CanvasAndNarrative: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/order-processing.otel.canvas',
        relativePath: '.principal-views/order-processing.otel.canvas',
        name: 'order-processing.otel.canvas',
        content: JSON.stringify(mockOrderProcessingCanvas),
      },
      {
        path: '.principal-views/__narratives__/order-processing.narrative.json',
        relativePath: '.principal-views/__narratives__/order-processing.narrative.json',
        name: 'order-processing.narrative.json',
        content: JSON.stringify(progressiveMockNarrative),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <CanvasSelector
            events={props.events}
            canvasId="order-processing"
            canvasPath=".principal-views/order-processing.otel.canvas"
            canvasName="Order Processing"
          >
            <CanvasDetailPanel {...props} />
          </CanvasSelector>
        )}
      </MockPanelProvider>
    );
  },
};

/**
 * Step 3: Canvas + Narrative + Execution Data
 * Complete setup with canvas, narrative template, and actual execution spans.
 * Shows full narrative rendering with execution data mapped to scenarios.
 */
export const ProgressiveStep3FullSetup: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/order-processing.otel.canvas',
        relativePath: '.principal-views/order-processing.otel.canvas',
        name: 'order-processing.otel.canvas',
        content: JSON.stringify(mockOrderProcessingCanvas),
      },
      {
        path: '.principal-views/__narratives__/order-processing.narrative.json',
        relativePath: '.principal-views/__narratives__/order-processing.narrative.json',
        name: 'order-processing.narrative.json',
        content: JSON.stringify(progressiveMockNarrative),
      },
      {
        path: '.principal-views/__executions__/order-processing.spans.json',
        relativePath: '.principal-views/__executions__/order-processing.spans.json',
        name: 'order-processing.spans.json',
        content: JSON.stringify(progressiveMockExecution),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <CanvasSelector
            events={props.events}
            canvasId="order-processing"
            canvasPath=".principal-views/order-processing.otel.canvas"
            canvasName="Order Processing"
          >
            <CanvasDetailPanel {...props} />
          </CanvasSelector>
        )}
      </MockPanelProvider>
    );
  },
};
