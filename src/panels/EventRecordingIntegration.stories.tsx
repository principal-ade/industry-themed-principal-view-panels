import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EventRecorderPanel } from './EventRecorderPanel';
import { EventControllerPanel } from './EventControllerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import {
  SessionManager,
  EventRecorderService,
  PathBasedEventProcessor,
} from '@principal-ai/principal-view-core';
import type {
  EventSession,
  GraphEvent,
  PathBasedGraphConfiguration,
  PathBasedEvent,
} from '@principal-ai/principal-view-core';

/**
 * Sample graph configuration for testing
 */
const sampleGraphConfig: PathBasedGraphConfiguration = {
  metadata: {
    name: 'Lock Manager System',
    version: '1.0.0',
  },
  nodeTypes: {
    'lock-manager': {
      description: 'Manages repository locks',
      shape: 'rectangle',
      icon: 'lock',
      color: '#3b82f6',
      dataSchema: {},
      sources: ['lib/lock-manager.ts', 'lib/branch-aware-lock-manager.ts'],
      actions: [
        {
          pattern: 'Lock acquired for (?<lockId>\\S+)',
          event: 'lock_acquired',
          state: 'acquired',
          metadata: { lockId: '$lockId' },
        },
        {
          pattern: 'Lock released',
          event: 'lock_released',
          state: 'idle',
        },
      ],
    },
    'github-api': {
      description: 'GitHub API client',
      shape: 'hexagon',
      icon: 'github',
      color: '#22c55e',
      dataSchema: {},
      sources: ['lib/github-api-client.ts', 'services/github/*.ts'],
    },
    'request-handler': {
      description: 'Handles incoming requests',
      shape: 'rectangle',
      icon: 'server',
      color: '#f59e0b',
      dataSchema: {},
      sources: ['app/**/*.ts'],
    },
  },
  edgeTypes: {},
  allowedConnections: [],
  pathBasedConfig: {
    enableActionPatterns: true,
  },
};

// Meta for the integration stories
const meta: Meta = {
  title: 'Integration/EventRecordingFlow',
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0a0a0a' }],
    },
  },
};

export default meta;

/**
 * Full recording flow integration story
 *
 * Demonstrates:
 * 1. Recording sessions with the EventRecorderService
 * 2. Viewing sessions in the EventRecorderPanel
 * 3. Playing back events in the EventControllerPanel
 */
export const FullRecordingFlow: StoryObj = {
  render: () => {
    // Service and state
    const serviceRef = useRef<EventRecorderService | null>(null);
    const [sessions, setSessions] = useState<EventSession[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
    const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
    const [playbackEvents, setPlaybackEvents] = useState<GraphEvent[]>([]);
    const [receivedEvents, setReceivedEvents] = useState<GraphEvent[]>([]);
    const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initialize service
    useEffect(() => {
      const service = new EventRecorderService({
        graphConfig: sampleGraphConfig,
        recordingMode: 'manual',
      });

      // Subscribe to events
      service.onEvent((event) => {
        const graphEvent = event as unknown as GraphEvent;
        setReceivedEvents((prev) => [...prev, graphEvent]);
      });

      // Subscribe to session changes
      service.getSessionManager().onSessionChange((updatedSessions) => {
        setSessions([...updatedSessions]);
      });

      serviceRef.current = service;

      return () => {
        if (simulationRef.current) {
          clearInterval(simulationRef.current);
        }
        service.dispose();
      };
    }, []);

    // Simulate log generation
    const simulateLogs = useCallback(() => {
      if (!serviceRef.current) return;

      const logMessages = [
        { file: 'lib/lock-manager.ts', message: 'Lock acquired for branch-123' },
        { file: 'lib/lock-manager.ts', message: 'Processing lock request' },
        { file: 'lib/github-api-client.ts', message: 'Fetching PR status' },
        { file: 'services/github/client.ts', message: 'API call completed' },
        { file: 'app/handlers/webhook.ts', message: 'Webhook received' },
        { file: 'lib/lock-manager.ts', message: 'Lock released' },
        { file: 'app/main.ts', message: 'Request completed' },
      ];

      let index = 0;

      const interval = setInterval(() => {
        if (!serviceRef.current?.recording) {
          clearInterval(interval);
          simulationRef.current = null;
          return;
        }

        const logInfo = logMessages[index % logMessages.length];
        const log = {
          message: logInfo.message,
          metadata: {
            timestamp: Date.now(),
            level: 'info' as const,
            source: {
              file: logInfo.file,
              line: Math.floor(Math.random() * 100) + 1,
            },
          },
        };

        serviceRef.current.processLog(log);
        index++;
      }, 300);

      simulationRef.current = interval;
    }, []);

    // Start recording
    const handleStartRecording = useCallback(
      (name: string) => {
        if (!serviceRef.current) return;

        const session = serviceRef.current.startSession({
          name,
          metadata: {
            testFile: 'test/integration.test.ts',
            testName: name,
          },
        });

        setActiveSessionId(session.id);
        setIsRecording(true);
        setReceivedEvents([]);

        // Start simulating logs
        simulateLogs();
      },
      [simulateLogs]
    );

    // Stop recording
    const handleStopRecording = useCallback(() => {
      if (!serviceRef.current) return;

      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }

      serviceRef.current.endActiveSession({ result: 'pass' });
      setIsRecording(false);
      setActiveSessionId(undefined);
    }, []);

    // Play session
    const handlePlaySession = useCallback((sessionId: string, events: GraphEvent[]) => {
      setPlaybackEvents(events);
      setSelectedSessionId(sessionId);
    }, []);

    // Delete session
    const handleDeleteSession = useCallback(
      (sessionId: string) => {
        if (!serviceRef.current) return;
        serviceRef.current.getSessionManager().deleteSession(sessionId);
        if (selectedSessionId === sessionId) {
          setSelectedSessionId(undefined);
          setPlaybackEvents([]);
        }
      },
      [selectedSessionId]
    );

    // Export session
    const handleExportSession = useCallback((sessionId: string) => {
      if (!serviceRef.current) return;
      const json = serviceRef.current.getSessionManager().exportSession(sessionId);
      console.log('Exported session:', json);

      // Copy to clipboard
      navigator.clipboard.writeText(json).then(() => {
        alert('Session JSON copied to clipboard!');
      });
    }, []);

    // Import session
    const handleImportSession = useCallback((json: string) => {
      if (!serviceRef.current) return;
      try {
        serviceRef.current.getSessionManager().importSession(json);
      } catch (error) {
        alert(`Import failed: ${error}`);
      }
    }, []);

    // Handle events emitted from playback
    const handleEventsEmit = useCallback((events: GraphEvent[]) => {
      // In a real app, these would be sent to the GraphRenderer
      console.log('Events emitted to graph:', events.length);
    }, []);

    return (
      <ThemeProvider>
        <div
          style={{
            height: '100vh',
            display: 'grid',
            gridTemplateColumns: '400px 1fr 400px',
            gap: '1px',
            backgroundColor: '#1a1a1a',
          }}
        >
          {/* Left Panel: Event Recorder */}
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <EventRecorderPanel
              sessions={sessions}
              activeSessionId={activeSessionId}
              isRecording={isRecording}
              selectedSessionId={selectedSessionId}
              onSessionSelect={setSelectedSessionId}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onPlaySession={handlePlaySession}
              onDeleteSession={handleDeleteSession}
              onExportSession={handleExportSession}
              onImportSession={handleImportSession}
            />
          </div>

          {/* Center: Graph Area (placeholder) */}
          <div
            style={{
              height: '100%',
              backgroundColor: '#0a0a0a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontFamily: 'system-ui',
            }}
          >
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
              Graph Visualization Area
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#444',
                textAlign: 'center',
                maxWidth: '300px',
              }}
            >
              In a real implementation, this would show the GraphRenderer
              receiving events from the EventControllerPanel.
            </div>

            {/* Live event feed when recording */}
            {isRecording && receivedEvents.length > 0 && (
              <div
                style={{
                  marginTop: '40px',
                  padding: '20px',
                  backgroundColor: '#111',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  maxWidth: '400px',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                  Live Event Feed ({receivedEvents.length} events)
                </div>
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {receivedEvents.slice(-5).map((event, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '11px',
                        color: '#888',
                        padding: '4px 0',
                        borderBottom: '1px solid #222',
                        fontFamily: 'monospace',
                      }}
                    >
                      {event.type}: {(event as any).componentId || (event as any).message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Event Controller (for playback) */}
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <EventControllerPanel
              events={playbackEvents}
              onEventsEmit={handleEventsEmit}
              onPlaybackStateChange={(state) => {
                console.log('Playback state:', state);
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </ThemeProvider>
    );
  },
};

/**
 * Side-by-side panels showing the workflow
 */
export const RecorderAndControllerPanels: StoryObj = {
  render: () => {
    const [sessions, setSessions] = useState<EventSession[]>([
      {
        id: 'session-demo-1',
        name: 'Lock Manager Test',
        status: 'completed',
        startedAt: Date.now() - 10000,
        endedAt: Date.now() - 5000,
        events: [
          {
            id: 'evt-1',
            type: 'component-activity',
            timestamp: Date.now() - 9000,
            category: 'state',
            operation: 'update',
            payload: { nodeId: 'lock-manager', newState: 'acquired' },
          },
          {
            id: 'evt-2',
            type: 'component-activity',
            timestamp: Date.now() - 8000,
            category: 'state',
            operation: 'update',
            payload: { nodeId: 'github-api', newState: 'active' },
          },
          {
            id: 'evt-3',
            type: 'component-activity',
            timestamp: Date.now() - 7000,
            category: 'state',
            operation: 'update',
            payload: { nodeId: 'lock-manager', newState: 'idle' },
          },
        ],
        metadata: {
          result: 'pass',
          duration: 5000,
          testFile: 'test/lock-manager.test.ts',
          testName: 'should acquire and release lock',
        },
      },
    ]);
    const [playbackEvents, setPlaybackEvents] = useState<GraphEvent[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();

    const handlePlaySession = useCallback((sessionId: string, events: GraphEvent[]) => {
      setPlaybackEvents(events);
      setSelectedSessionId(sessionId);
    }, []);

    return (
      <ThemeProvider>
        <div
          style={{
            height: '600px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            backgroundColor: '#1a1a1a',
          }}
        >
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <EventRecorderPanel
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              onSessionSelect={setSelectedSessionId}
              onPlaySession={handlePlaySession}
            />
          </div>
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <EventControllerPanel
              events={playbackEvents}
              onEventsEmit={(events) => console.log('Emitted:', events)}
            />
          </div>
        </div>
      </ThemeProvider>
    );
  },
};

/**
 * Demonstrates WebSocket message flow simulation
 */
export const WebSocketMessageFlow: StoryObj = {
  render: () => {
    const serviceRef = useRef<EventRecorderService | null>(null);
    const [sessions, setSessions] = useState<EventSession[]>([]);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
      const service = new EventRecorderService({
        graphConfig: sampleGraphConfig,
        recordingMode: 'manual',
      });

      service.getSessionManager().onSessionChange((updatedSessions) => {
        setSessions([...updatedSessions]);
      });

      serviceRef.current = service;

      // Simulate WebSocket message sequence
      const simulateWebSocketMessages = async () => {
        // Connect
        service.registerConnection('conn-1');
        setMessages((prev) => [...prev, 'Connected: conn-1']);

        await new Promise((r) => setTimeout(r, 500));

        // Session start
        const startResponse = service.processMessage(
          {
            type: 'session_start',
            timestamp: Date.now(),
            requestId: 'req-1',
            payload: { name: 'WebSocket Demo Session' },
          },
          'conn-1'
        );
        setMessages((prev) => [
          ...prev,
          `→ session_start`,
          `← ${(startResponse as any)?.type}: sessionId=${(startResponse as any)?.payload?.sessionId}`,
        ]);

        await new Promise((r) => setTimeout(r, 500));

        // Send some logs
        const logs = [
          'Lock acquired for demo-branch',
          'Processing request',
          'GitHub API call',
          'Lock released',
        ];

        for (const message of logs) {
          service.processMessage(
            {
              type: 'log',
              timestamp: Date.now(),
              payload: {
                message,
                metadata: {
                  timestamp: Date.now(),
                  level: 'info' as const,
                  source: { file: 'lib/lock-manager.ts', line: 42 },
                },
              },
            },
            'conn-1'
          );
          setMessages((prev) => [...prev, `→ log: "${message}"`]);
          await new Promise((r) => setTimeout(r, 300));
        }

        // Session end
        const sessionId = service.getActiveSession()?.id;
        if (sessionId) {
          const endResponse = service.processMessage(
            {
              type: 'session_end',
              timestamp: Date.now(),
              requestId: 'req-2',
              payload: { sessionId, result: 'pass' },
            },
            'conn-1'
          );
          setMessages((prev) => [
            ...prev,
            `→ session_end`,
            `← ${(endResponse as any)?.type}: sessionId=${sessionId}`,
          ]);
        }

        await new Promise((r) => setTimeout(r, 300));

        // Disconnect
        service.unregisterConnection('conn-1');
        setMessages((prev) => [...prev, 'Disconnected: conn-1']);
      };

      simulateWebSocketMessages();

      return () => service.dispose();
    }, []);

    return (
      <ThemeProvider>
        <div
          style={{
            height: '600px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            backgroundColor: '#1a1a1a',
          }}
        >
          {/* WebSocket Log */}
          <div
            style={{
              height: '100%',
              backgroundColor: '#0a0a0a',
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: '12px',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                color: '#888',
                marginBottom: '16px',
                fontFamily: 'system-ui',
                fontSize: '14px',
              }}
            >
              WebSocket Message Log
            </div>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  padding: '4px 0',
                  color: msg.startsWith('→')
                    ? '#3b82f6'
                    : msg.startsWith('←')
                    ? '#22c55e'
                    : '#666',
                }}
              >
                {msg}
              </div>
            ))}
          </div>

          {/* Sessions Panel */}
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <EventRecorderPanel sessions={sessions} />
          </div>
        </div>
      </ThemeProvider>
    );
  },
};
