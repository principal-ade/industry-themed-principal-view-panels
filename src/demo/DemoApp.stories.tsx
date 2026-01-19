import type { Meta, StoryObj } from '@storybook/react-vite';
import { DemoApp } from './DemoApp';

/**
 * Demo UI showcasing runtime validation with a library/book aesthetic
 *
 * This demo provides an interactive view of:
 * - Canvas files (.otel.canvas) from a file tree
 * - OTEL trace visualization overlaid on canvases
 * - Trace timeline, node details, events, and coverage analysis
 *
 * Features:
 * - Card Catalog: File tree navigation for canvases and traces
 * - Reading Room: Main canvas view with trace overlay
 * - Book Details: Bottom panel with tabs for detailed information
 * - Library/Book aesthetic: Leather-bound, aged paper, gold accents
 *
 * Mock Data:
 * - Checkout Flow canvas with 4 nodes
 * - Failed trace showing inventory timeout
 * - Successful trace showing full flow
 * - Coverage data across components
 *
 * Note: MSW (Mock Service Worker) is initialized globally in .storybook/preview.ts
 */
const meta = {
  title: 'Demo/PrincipalViewLibrary',
  component: DemoApp,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full demo UI showcasing runtime validation capabilities with a distinctive library/book aesthetic. Includes mocked OTEL traces, canvas files, and coverage analysis.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DemoApp>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default demo view with MSW mocked APIs
 *
 * MSW provides realistic API responses for canvases, traces, and coverage data.
 *
 * Instructions:
 * 1. Select "Checkout Flow" canvas from the Card Catalog
 * 2. Select a trace from Reading Sessions to see overlay
 * 3. Click nodes to see details
 * 4. Explore different tabs in Book Details panel
 */
export const Default: Story = {};

/**
 * Production Debugging Workflow
 *
 * Demonstrates how to use the demo to debug a production issue:
 * 1. Failed trace shows inventory check timeout
 * 2. Timeline tab shows which span failed
 * 3. Node details show expected vs actual behavior
 * 4. Events tab shows what happened before failure
 */
export const ProductionDebuggingWorkflow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the production debugging workflow where a checkout fails due to inventory timeout. The trace clearly shows the failure point and helps narrow down the issue.',
      },
    },
  },
};

/**
 * Telemetry Coverage Analysis
 *
 * Demonstrates how to analyze telemetry coverage:
 * 1. Navigate to Coverage tab
 * 2. See overall coverage percentage
 * 3. View breakdown by component type
 * 4. Identify missing files that lack instrumentation
 */
export const TelemetryCoverageAnalysis: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows the telemetry coverage analysis feature, highlighting which files have observability and which components need more instrumentation.',
      },
    },
  },
};
