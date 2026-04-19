import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { GraphRenderer } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas, ComponentLibrary } from '@principal-ai/principal-view-core';
import { ThemeProvider } from '@principal-ade/industry-theme';

/**
 * Test story for verifying OTEL event node color flow.
 *
 * This story tests that:
 * 1. Event nodes WITHOUT explicit color fields use scope colors from library
 * 2. Colors are vibrant (not faded/pastel)
 * 3. The color priority works correctly: scopeColor should be used when nodeData.color is undefined
 *
 * See: docs/color-flow-debug.md for the complete color flow pipeline
 */
const meta = {
  title: 'Test/OTEL Event Color Flow',
  component: GraphRenderer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Test story to verify OTEL event nodes display vibrant scope colors from the library. ' +
          'Event nodes should show bright blue (#3B82F6), green (#10B981), and red (#EF4444) - NOT pastel versions.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', width: '100vw', background: '#1a1a1a', padding: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof GraphRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Test canvas with otel-event nodes.
 * IMPORTANT: These nodes have NO color field - colors should come from library scopes.
 */
const testCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'auth-event',
      type: 'otel-event',
      x: 100,
      y: 100,
      width: 200,
      height: 80,
      label: 'User Login',
      event: {
        name: 'auth.user.login',
      },
      otel: {
        scope: 'auth-service',
        status: 'implemented',
      },
      // NOTE: NO color field! Color should come from library scope
    },
    {
      id: 'session-event',
      type: 'otel-event',
      x: 400,
      y: 100,
      width: 200,
      height: 80,
      label: 'Session Created',
      event: {
        name: 'session.created',
      },
      otel: {
        scope: 'session-service',
        status: 'implemented',
      },
      // NOTE: NO color field!
    },
    {
      id: 'error-event',
      type: 'otel-event',
      x: 250,
      y: 250,
      width: 200,
      height: 80,
      label: 'Auth Failed',
      event: {
        name: 'auth.error.failed',
      },
      otel: {
        scope: 'error-service',
        status: 'implemented',
      },
      // NOTE: NO color field!
    },
  ],
  edges: [
    {
      id: 'e1',
      fromNode: 'auth-event',
      toNode: 'session-event',
      edgeType: 'dataflow',
    },
    {
      id: 'e2',
      fromNode: 'auth-event',
      toNode: 'error-event',
      edgeType: 'dataflow',
    },
  ],
};

/**
 * Test library with vibrant scope colors.
 * These colors should be applied to event nodes and should be BRIGHT, not faded.
 */
const testLibrary: ComponentLibrary = {
  version: '1.0.0',
  name: 'Color Flow Test Library',
  scopes: {
    'auth-service': {
      color: '#3B82F6', // Bright blue
      description: 'Authentication service scope - should be BRIGHT BLUE',
    },
    'session-service': {
      color: '#10B981', // Bright green
      description: 'Session management scope - should be BRIGHT GREEN',
    },
    'error-service': {
      color: '#EF4444', // Bright red
      description: 'Error handling scope - should be BRIGHT RED',
    },
  },
  resourceTypes: {},
  spanKinds: {},
};

/**
 * Basic test: Three event nodes with different scope colors
 *
 * Expected result:
 * - "User Login" node: Bright blue background (#3B82F6)
 * - "Session Created" node: Bright green background (#10B981)
 * - "Auth Failed" node: Bright red background (#EF4444)
 *
 * If you see pastel/faded colors, the color flow is broken!
 */
export const BasicColorFlow: Story = {
  args: {
    canvas: testCanvas,
    library: testLibrary,
  },
};

/**
 * Test without library - should show draft orange color
 *
 * Expected result:
 * - All nodes should be orange/amber (#f59e0b) - the DRAFT_NODE_COLOR
 *
 * This tests the fallback behavior when no library is provided.
 */
export const WithoutLibrary: Story = {
  args: {
    canvas: testCanvas,
    library: undefined,
  },
};

/**
 * Test with empty library (no scopes defined)
 *
 * Expected result:
 * - All nodes should be orange/amber (#f59e0b) - the DRAFT_NODE_COLOR
 *
 * This tests the fallback when library exists but has no scopes.
 */
export const EmptyLibrary: Story = {
  args: {
    canvas: testCanvas,
    library: {
      version: '1.0.0',
      name: 'Empty Library',
      scopes: {},
      resourceTypes: {},
      spanKinds: {},
    },
  },
};

/**
 * Test with mismatched scope names
 *
 * Expected result:
 * - All nodes should be orange/amber (#f59e0b) - the DRAFT_NODE_COLOR
 *
 * This tests behavior when canvas scopes don't match library scopes.
 */
export const MismatchedScopes: Story = {
  args: {
    canvas: testCanvas,
    library: {
      version: '1.0.0',
      name: 'Mismatched Library',
      scopes: {
        'different-service': {
          color: '#9333EA', // Purple (won't be used)
          description: 'Different service',
        },
      },
      resourceTypes: {},
      spanKinds: {},
    },
  },
};

/**
 * Complex canvas with multiple scopes and node types
 *
 * Tests the full color flow with a more realistic scenario.
 */
const complexCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'span-1',
      type: 'otel-span',
      x: 50,
      y: 50,
      width: 180,
      height: 70,
      label: 'HTTP Request',
      span: {
        name: 'http.request',
        kind: 'server',
      },
      otel: {
        scope: 'http-service',
      },
    },
    {
      id: 'event-1',
      type: 'otel-event',
      x: 300,
      y: 50,
      width: 180,
      height: 70,
      label: 'Request Logged',
      event: {
        name: 'log.request',
      },
      otel: {
        scope: 'logging-service',
        status: 'implemented',
      },
    },
    {
      id: 'event-2',
      type: 'otel-event',
      x: 550,
      y: 50,
      width: 180,
      height: 70,
      label: 'Metrics Recorded',
      event: {
        name: 'metrics.recorded',
      },
      otel: {
        scope: 'metrics-service',
        status: 'implemented',
      },
    },
    {
      id: 'span-2',
      type: 'otel-span',
      x: 175,
      y: 200,
      width: 180,
      height: 70,
      label: 'Database Query',
      span: {
        name: 'db.query',
        kind: 'client',
      },
      otel: {
        scope: 'database-service',
      },
    },
    {
      id: 'event-3',
      type: 'otel-event',
      x: 425,
      y: 200,
      width: 180,
      height: 70,
      label: 'Query Traced',
      event: {
        name: 'trace.query',
      },
      otel: {
        scope: 'tracing-service',
        status: 'implemented',
      },
    },
  ],
  edges: [
    { id: 'e1', fromNode: 'span-1', toNode: 'event-1', edgeType: 'dataflow' },
    { id: 'e2', fromNode: 'event-1', toNode: 'event-2', edgeType: 'dataflow' },
    { id: 'e3', fromNode: 'span-1', toNode: 'span-2', edgeType: 'dataflow' },
    { id: 'e4', fromNode: 'span-2', toNode: 'event-3', edgeType: 'dataflow' },
  ],
};

const complexLibrary: ComponentLibrary = {
  version: '1.0.0',
  name: 'Complex Test Library',
  scopes: {
    'http-service': {
      color: '#3B82F6', // Blue
      description: 'HTTP service',
    },
    'logging-service': {
      color: '#8B5CF6', // Purple
      description: 'Logging service',
    },
    'metrics-service': {
      color: '#EC4899', // Pink
      description: 'Metrics service',
    },
    'database-service': {
      color: '#10B981', // Green
      description: 'Database service',
    },
    'tracing-service': {
      color: '#F59E0B', // Amber
      description: 'Tracing service',
    },
  },
  resourceTypes: {},
  spanKinds: {},
};

/**
 * Complex scenario with multiple node types and scopes
 *
 * Expected result:
 * - Each node should display its scope color vibrant and bright
 * - Event nodes should use scopeColor (not any explicit color)
 * - No nodes should appear faded or pastel
 */
export const ComplexScenario: Story = {
  args: {
    canvas: complexCanvas,
    library: complexLibrary,
  },
};
