import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useCallback } from 'react';
import { EventRecorderPanel } from './EventRecorderPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import type { EventSession, GraphEvent } from '@principal-ai/principal-view-core';

const meta: Meta<typeof EventRecorderPanel> = {
  title: 'Panels/EventRecorderPanel',
  component: EventRecorderPanel,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '600px', width: '400px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0a0a0a' }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof EventRecorderPanel>;

// Helper to create mock events
const createMockEvent = (
  id: string,
  type: string,
  componentId: string,
  timestamp: number
): GraphEvent => ({
  id,
  type,
  timestamp,
  category: 'state',
  operation: 'update',
  payload: { nodeId: componentId, newState: 'active' },
});

// Helper to create mock sessions
const createMockSession = (
  id: string,
  name: string,
  status: 'recording' | 'completed' | 'error',
  options: {
    eventCount?: number;
    result?: 'pass' | 'fail' | 'skip';
    testFile?: string;
    testName?: string;
    error?: string;
    duration?: number;
  } = {}
): EventSession => {
  const startedAt = Date.now() - (options.duration || 5000);
  const events: GraphEvent[] = [];

  for (let i = 0; i < (options.eventCount || 0); i++) {
    events.push(
      createMockEvent(
        `evt-${id}-${i}`,
        i % 2 === 0 ? 'component-activity' : 'component-action',
        `component-${i % 3}`,
        startedAt + i * 100
      )
    );
  }

  return {
    id,
    name,
    status,
    startedAt,
    endedAt: status !== 'recording' ? Date.now() : undefined,
    events,
    metadata: {
      testFile: options.testFile,
      testName: options.testName,
      result: options.result,
      error: options.error,
      duration: options.duration,
    },
  };
};

// Empty state
export const Empty: Story = {
  args: {
    sessions: [],
    isRecording: false,
  },
};

// With multiple sessions
export const WithSessions: Story = {
  args: {
    sessions: [
      createMockSession('session-1', 'Test: Lock acquisition', 'completed', {
        eventCount: 15,
        result: 'pass',
        testFile: 'test/lock-manager.test.ts',
        testName: 'should acquire lock successfully',
        duration: 1234,
      }),
      createMockSession('session-2', 'Test: Concurrent requests', 'completed', {
        eventCount: 42,
        result: 'fail',
        testFile: 'test/github-api.test.ts',
        testName: 'should handle concurrent requests',
        duration: 5678,
        error: 'Expected 3 requests, got 2',
      }),
      createMockSession('session-3', 'Test: Skip test', 'completed', {
        eventCount: 0,
        result: 'skip',
        testFile: 'test/skip.test.ts',
        testName: 'should be skipped',
        duration: 10,
      }),
      createMockSession('session-4', 'Test: Error handling', 'error', {
        eventCount: 8,
        testFile: 'test/error.test.ts',
        testName: 'should handle errors',
        duration: 2000,
        error: 'Connection timeout',
      }),
    ],
    isRecording: false,
    selectedSessionId: 'session-1',
  },
};

// Currently recording
export const Recording: Story = {
  args: {
    sessions: [
      createMockSession('session-active', 'Recording test run...', 'recording', {
        eventCount: 7,
      }),
      createMockSession('session-1', 'Previous test', 'completed', {
        eventCount: 20,
        result: 'pass',
        duration: 3000,
      }),
    ],
    activeSessionId: 'session-active',
    isRecording: true,
  },
};

// Interactive demo
export const Interactive: Story = {
  render: () => {
    const [sessions, setSessions] = useState<EventSession[]>([
      createMockSession('session-1', 'Initial test session', 'completed', {
        eventCount: 10,
        result: 'pass',
        testFile: 'test/demo.test.ts',
        testName: 'demo test',
        duration: 2000,
      }),
    ]);
    const [isRecording, setIsRecording] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
    const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
    const [recordingInterval, setRecordingInterval] = useState<ReturnType<typeof setInterval> | null>(null);

    const handleStartRecording = useCallback((name: string) => {
      const newSession: EventSession = {
        id: `session-${Date.now()}`,
        name,
        status: 'recording',
        startedAt: Date.now(),
        events: [],
        metadata: {},
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setIsRecording(true);

      // Simulate events being recorded
      const interval = setInterval(() => {
        setSessions((prev) => {
          const updated = [...prev];
          const activeIndex = updated.findIndex((s) => s.id === newSession.id);
          if (activeIndex >= 0 && updated[activeIndex].status === 'recording') {
            const eventCount = updated[activeIndex].events.length;
            updated[activeIndex] = {
              ...updated[activeIndex],
              events: [
                ...updated[activeIndex].events,
                createMockEvent(
                  `evt-${Date.now()}`,
                  eventCount % 2 === 0 ? 'component-activity' : 'component-action',
                  `component-${eventCount % 3}`,
                  Date.now()
                ),
              ],
            };
          }
          return updated;
        });
      }, 500);

      setRecordingInterval(interval);
    }, []);

    const handleStopRecording = useCallback(() => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                status: 'completed' as const,
                endedAt: Date.now(),
                metadata: {
                  ...s.metadata,
                  duration: Date.now() - s.startedAt,
                  result: 'pass' as const,
                },
              }
            : s
        )
      );

      setActiveSessionId(undefined);
      setIsRecording(false);
    }, [activeSessionId, recordingInterval]);

    const handleDeleteSession = useCallback((sessionId: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(undefined);
      }
    }, [selectedSessionId]);

    const handleExportSession = useCallback((sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        const json = JSON.stringify(session, null, 2);
        console.log('Exported session:', json);
        alert(`Session exported! Check console for JSON.`);
      }
    }, [sessions]);

    const handleImportSession = useCallback((json: string) => {
      try {
        const session = JSON.parse(json) as EventSession;
        // Generate new ID to avoid conflicts
        session.id = `imported-${Date.now()}`;
        session.name = `[Imported] ${session.name}`;
        setSessions((prev) => [session, ...prev]);
      } catch {
        alert('Invalid JSON format');
      }
    }, []);

    const handlePlaySession = useCallback((sessionId: string, events: GraphEvent[]) => {
      console.log(`Playing session ${sessionId} with ${events.length} events`);
      alert(`Would play ${events.length} events from session "${sessionId}"`);
    }, []);

    return (
      <EventRecorderPanel
        sessions={sessions}
        activeSessionId={activeSessionId}
        isRecording={isRecording}
        selectedSessionId={selectedSessionId}
        onSessionSelect={setSelectedSessionId}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onDeleteSession={handleDeleteSession}
        onExportSession={handleExportSession}
        onImportSession={handleImportSession}
        onPlaySession={handlePlaySession}
      />
    );
  },
};

// Wide layout
export const WideLayout: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '400px', width: '600px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    sessions: [
      createMockSession('session-1', 'Test: Full integration', 'completed', {
        eventCount: 100,
        result: 'pass',
        testFile: 'test/integration/full-flow.test.ts',
        testName: 'complete user flow',
        duration: 15000,
      }),
      createMockSession('session-2', 'Test: API validation', 'completed', {
        eventCount: 25,
        result: 'pass',
        testFile: 'test/api/validation.test.ts',
        testName: 'validates API responses',
        duration: 3000,
      }),
    ],
    isRecording: false,
  },
};

// Many sessions
export const ManySessions: Story = {
  args: {
    sessions: Array.from({ length: 20 }, (_, i) =>
      createMockSession(
        `session-${i}`,
        `Test session ${i + 1}`,
        i === 0 ? 'recording' : 'completed',
        {
          eventCount: Math.floor(Math.random() * 50) + 5,
          result: i === 0 ? undefined : (['pass', 'pass', 'pass', 'fail', 'skip'] as const)[Math.floor(Math.random() * 5)],
          testFile: `test/suite-${Math.floor(i / 5)}/test-${i}.test.ts`,
          testName: `test case ${i + 1}`,
          duration: i === 0 ? undefined : Math.floor(Math.random() * 10000) + 500,
        }
      )
    ),
    activeSessionId: 'session-0',
    isRecording: true,
  },
};
