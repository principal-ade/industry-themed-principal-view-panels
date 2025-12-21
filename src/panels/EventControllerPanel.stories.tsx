import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useCallback } from 'react';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas, GraphEvent } from '@principal-ai/principal-view-core';
import { EventControllerPanel } from './EventControllerPanel';

/**
 * EventControllerPanel controls event playback and emits events to GraphRenderer.
 * This demonstrates the panel-to-panel communication pattern where the EventController
 * stores events and plays them back, while GraphRenderer consumes them for animations.
 */
const meta = {
  title: 'Panels/EventControllerPanel',
  component: EventControllerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Controls event playback and emits events to GraphRenderer. Provides play, pause, stop, step, and seek controls with variable speed playback.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', width: '100vw', background: '#1a1a2e' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof EventControllerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample canvas for the graph
const sampleCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'client-1',
      type: 'text',
      x: 100,
      y: 150,
      width: 120,
      height: 80,
      text: 'Client A',
      color: '#3b82f6',
      pv: {
        nodeType: 'client',
        shape: 'circle',
        icon: 'Monitor',
        states: {
          disconnected: { label: 'Disconnected', color: '#6b7280' },
          connecting: { label: 'Connecting', color: '#f59e0b' },
          connected: { label: 'Connected', color: '#10b981' },
        },
      },
    },
    {
      id: 'server-1',
      type: 'text',
      x: 350,
      y: 150,
      width: 140,
      height: 80,
      text: 'Server',
      color: '#8b5cf6',
      pv: {
        nodeType: 'server',
        shape: 'rectangle',
        icon: 'Server',
        states: {
          idle: { label: 'Idle', color: '#6b7280' },
          processing: { label: 'Processing', color: '#3b82f6' },
          completed: { label: 'Completed', color: '#10b981' },
          error: { label: 'Error', color: '#ef4444' },
        },
      },
    },
    {
      id: 'database-1',
      type: 'text',
      x: 600,
      y: 150,
      width: 120,
      height: 100,
      text: 'Database',
      color: '#10b981',
      pv: {
        nodeType: 'database',
        shape: 'hexagon',
        icon: 'Database',
      },
    },
  ],
  edges: [
    {
      id: 'edge-client-server',
      fromNode: 'client-1',
      toNode: 'server-1',
      pv: { edgeType: 'websocket' },
    },
    {
      id: 'edge-server-db',
      fromNode: 'server-1',
      toNode: 'database-1',
      pv: { edgeType: 'query' },
    },
  ],
  pv: {
    name: 'Event Playback Demo',
    version: '1.0.0',
    edgeTypes: {
      websocket: {
        style: 'solid',
        color: '#60a5fa',
        directed: true,
        animation: { type: 'flow', duration: 1000 },
      },
      query: {
        style: 'dashed',
        color: '#34d399',
        directed: true,
      },
    },
  },
};

// Create a sequence of events that simulate a request flow
const createEventSequence = (): GraphEvent[] => {
  const baseTime = Date.now();

  return [
    // Client connects
    {
      id: 'evt-1',
      type: 'state_changed',
      timestamp: baseTime,
      category: 'state',
      operation: 'update',
      payload: {
        nodeId: 'client-1',
        newState: 'connecting',
      },
    },
    // Connection animation
    {
      id: 'evt-2',
      type: 'edge_animated',
      timestamp: baseTime + 500,
      category: 'edge',
      operation: 'animate',
      payload: {
        operation: 'animate',
        edgeId: 'edge-client-server',
        edgeType: 'websocket',
        from: 'client-1',
        to: 'server-1',
        animation: {
          duration: 1000,
          direction: 'forward' as const,
        },
      },
    },
    // Client connected
    {
      id: 'evt-3',
      type: 'state_changed',
      timestamp: baseTime + 1500,
      category: 'state',
      operation: 'update',
      payload: {
        nodeId: 'client-1',
        newState: 'connected',
      },
    },
    // Server processing
    {
      id: 'evt-4',
      type: 'state_changed',
      timestamp: baseTime + 2000,
      category: 'state',
      operation: 'update',
      payload: {
        nodeId: 'server-1',
        newState: 'processing',
      },
    },
    // Server queries database
    {
      id: 'evt-5',
      type: 'edge_animated',
      timestamp: baseTime + 2500,
      category: 'edge',
      operation: 'animate',
      payload: {
        operation: 'animate',
        edgeId: 'edge-server-db',
        edgeType: 'query',
        from: 'server-1',
        to: 'database-1',
        animation: {
          duration: 1200,
          direction: 'forward' as const,
        },
      },
    },
    // Server completed
    {
      id: 'evt-6',
      type: 'state_changed',
      timestamp: baseTime + 4000,
      category: 'state',
      operation: 'update',
      payload: {
        nodeId: 'server-1',
        newState: 'completed',
      },
    },
    // Response back to client
    {
      id: 'evt-7',
      type: 'edge_animated',
      timestamp: baseTime + 4500,
      category: 'edge',
      operation: 'animate',
      payload: {
        operation: 'animate',
        edgeId: 'edge-client-server',
        edgeType: 'websocket',
        from: 'server-1',
        to: 'client-1',
        animation: {
          duration: 1000,
          direction: 'backward' as const,
        },
      },
    },
  ];
};

/**
 * Combined Panel Demo - Shows EventControllerPanel and GraphRenderer working together
 * This is the main story demonstrating panel-to-panel communication
 */
export const CombinedPanelDemo: Story = {
  args: {
    events: [],
    onEventsEmit: () => {},
  },
  render: () => {
    const [events, setEvents] = useState<GraphEvent[]>([]);
    const eventSequence = React.useMemo(() => createEventSequence(), []);

    const handleEventsEmit = useCallback((emittedEvents: GraphEvent[]) => {
      setEvents(emittedEvents);
    }, []);

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Graph Panel - Takes most of the space */}
        <div style={{ flex: 1, position: 'relative' }}>
          <GraphRenderer
            canvas={sampleCanvas}
            events={events}
            showMinimap={false}
            showControls={true}
            showBackground={true}
            onEventProcessed={(event) => {
              console.log('Event processed by GraphRenderer:', event.type);
            }}
          />
        </div>

        {/* Event Controller Panel - Fixed width sidebar */}
        <div style={{ width: '350px', borderLeft: '1px solid #2a2a4a' }}>
          <EventControllerPanel
            events={eventSequence}
            onEventsEmit={handleEventsEmit}
          />
        </div>
      </div>
    );
  },
};

/**
 * Standalone Event Controller - Shows the panel in isolation
 */
export const StandaloneController: Story = {
  args: {
    events: createEventSequence(),
    onEventsEmit: (events) => console.log('Events emitted:', events.length),
  },
  render: (args) => (
    <div style={{ width: '350px', height: '600px', margin: '20px auto' }}>
      <EventControllerPanel {...args} />
    </div>
  ),
};

/**
 * Empty State - Shows controller with no events
 */
export const EmptyState: Story = {
  args: {
    events: [],
    onEventsEmit: () => {},
  },
  render: (args) => (
    <div style={{ width: '350px', height: '400px', margin: '20px auto' }}>
      <EventControllerPanel {...args} />
    </div>
  ),
};

/**
 * Many Events - Shows controller with a large number of events
 */
export const ManyEvents: Story = {
  args: {
    events: Array.from({ length: 50 }, (_, i) => ({
      id: `evt-${i}`,
      type: i % 2 === 0 ? 'state_changed' : 'edge_animated',
      timestamp: Date.now() + i * 200,
      category: i % 2 === 0 ? 'state' : 'edge',
      operation: 'update',
      payload: {
        nodeId: `node-${i % 3}`,
        newState: ['idle', 'processing', 'completed'][i % 3],
      },
    })) as GraphEvent[],
    onEventsEmit: (events) => console.log('Events emitted:', events.length),
  },
  render: (args) => (
    <div style={{ width: '350px', height: '600px', margin: '20px auto' }}>
      <EventControllerPanel {...args} />
    </div>
  ),
};

/**
 * Full Integration Demo - Complete demo with all features
 */
export const FullIntegrationDemo: Story = {
  args: {
    events: [],
    onEventsEmit: () => {},
  },
  render: () => {
    const [events, setEvents] = useState<GraphEvent[]>([]);
    const [processedCount, setProcessedCount] = useState(0);
    const eventSequence = React.useMemo(() => createEventSequence(), []);

    const handleEventsEmit = useCallback((emittedEvents: GraphEvent[]) => {
      setEvents(emittedEvents);
    }, []);

    const handleEventProcessed = useCallback(() => {
      setProcessedCount((prev) => prev + 1);
    }, []);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Stats bar */}
        <div
          style={{
            padding: '12px 20px',
            background: '#2a2a4a',
            borderBottom: '1px solid #3a3a5a',
            display: 'flex',
            gap: '24px',
            fontSize: '14px',
          }}
        >
          <span style={{ color: '#a0a0c0' }}>
            Total Events: <strong style={{ color: '#fff' }}>{eventSequence.length}</strong>
          </span>
          <span style={{ color: '#a0a0c0' }}>
            Processed: <strong style={{ color: '#10b981' }}>{processedCount}</strong>
          </span>
          <span style={{ color: '#a0a0c0' }}>
            Current Queue: <strong style={{ color: '#60a5fa' }}>{events.length}</strong>
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Graph Panel */}
          <div style={{ flex: 1, position: 'relative' }}>
            <GraphRenderer
              canvas={sampleCanvas}
              events={events}
              showMinimap={false}
              showControls={true}
              showBackground={true}
              onEventProcessed={handleEventProcessed}
            />
          </div>

          {/* Event Controller Panel */}
          <div style={{ width: '350px', borderLeft: '1px solid #2a2a4a' }}>
            <EventControllerPanel
              events={eventSequence}
              onEventsEmit={handleEventsEmit}
            />
          </div>
        </div>
      </div>
    );
  },
};
