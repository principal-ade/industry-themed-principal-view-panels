import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EventRecorderPanel } from './EventRecorderPanel';
import { EventControllerPanel } from './EventControllerPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import {
  EventRecorderService,
} from '@principal-ai/principal-view-core';
import type {
  EventSession,
  GraphEvent,
  PathBasedGraphConfiguration,
} from '@principal-ai/principal-view-core';

/**
 * Real Control Tower Core VGC Configuration
 * From: /Users/griever/Developer/messaging-server/control-tower-core/.principal-views/vvf.config.yaml
 */
const controlTowerConfig: PathBasedGraphConfiguration = {
  metadata: {
    name: 'Control Tower Core - Client-Server Demo',
    version: '0.1.19',
    description: 'Alpha testing: Server with two client connections',
  },
  nodeTypes: {
    server: {
      description: 'Central server component',
      shape: 'rectangle',
      icon: 'server',
      color: '#8b5cf6',
      dataSchema: {},
      sources: [
        'src/server/BaseServer.ts',
        'src/server/ServerBuilder.ts',
        'src/server/ExperimentalAPI.ts',
      ],
    },
    'client-a': {
      description: 'Client connection',
      shape: 'circle',
      icon: 'user',
      color: '#3b82f6',
      dataSchema: {},
      sources: [
        'src/client/BaseClient.ts',
        'src/client/ClientBuilder.ts',
      ],
    },
    transport: {
      description: 'Transport layer adapter',
      shape: 'diamond',
      icon: 'radio',
      color: '#06b6d4',
      dataSchema: {},
      sources: [
        'src/adapters/websocket/WebSocketServerTransportAdapter.ts',
        'src/adapters/websocket/WebSocketClientTransportAdapter.ts',
        'src/abstractions/TransportAdapter.ts',
      ],
    },
    'room-manager': {
      description: 'Manages room subscriptions',
      shape: 'hexagon',
      icon: 'users',
      color: '#22c55e',
      dataSchema: {},
      sources: ['src/abstractions/DefaultRoomManager.ts'],
    },
    'lock-manager': {
      description: 'Manages distributed locks',
      shape: 'hexagon',
      icon: 'lock',
      color: '#f59e0b',
      dataSchema: {},
      sources: ['src/abstractions/DefaultLockManager.ts'],
    },
    'presence-manager': {
      description: 'Tracks user presence',
      shape: 'hexagon',
      icon: 'activity',
      color: '#ec4899',
      dataSchema: {},
      sources: ['src/abstractions/DefaultPresenceManager.ts'],
    },
    auth: {
      description: 'Authentication adapter',
      shape: 'rectangle',
      icon: 'shield',
      color: '#ef4444',
      dataSchema: {},
      sources: [
        'src/abstractions/AuthAdapter.ts',
        'src/adapters/mock/MockAuthAdapter.ts',
      ],
    },
  },
  edgeTypes: {
    'websocket-connection': {
      style: 'solid',
      color: '#3b82f6',
    },
    'auth-flow': {
      style: 'dotted',
      color: '#ef4444',
    },
    'room-flow': {
      style: 'solid',
      color: '#22c55e',
    },
    'lock-flow': {
      style: 'dashed',
      color: '#f59e0b',
    },
    'presence-flow': {
      style: 'dotted',
      color: '#ec4899',
    },
    'service-call': {
      style: 'solid',
      color: '#64748b',
    },
  },
  allowedConnections: [
    { from: 'client-a', to: 'transport', via: 'websocket-connection' },
    { from: 'transport', to: 'server', via: 'websocket-connection' },
    { from: 'server', to: 'auth', via: 'auth-flow' },
    { from: 'server', to: 'room-manager', via: 'service-call' },
    { from: 'server', to: 'lock-manager', via: 'service-call' },
    { from: 'server', to: 'presence-manager', via: 'service-call' },
    { from: 'client-a', to: 'room-manager', via: 'room-flow' },
    { from: 'client-a', to: 'lock-manager', via: 'lock-flow' },
    { from: 'client-a', to: 'presence-manager', via: 'presence-flow' },
    { from: 'room-manager', to: 'client-a', via: 'room-flow' },
  ],
  pathBasedConfig: {
    enableActionPatterns: true,
  },
};

/**
 * Simulated log sequence for a client connection flow
 */
const clientConnectionLogs = [
  { file: 'src/client/ClientBuilder.ts', message: 'Building client configuration', line: 45 },
  { file: 'src/client/BaseClient.ts', message: 'Client initialized', line: 23 },
  { file: 'src/adapters/websocket/WebSocketClientTransportAdapter.ts', message: 'Connecting to server...', line: 67 },
  { file: 'src/adapters/websocket/WebSocketServerTransportAdapter.ts', message: 'New connection received', line: 112 },
  { file: 'src/server/BaseServer.ts', message: 'Processing new client connection', line: 89 },
  { file: 'src/adapters/mock/MockAuthAdapter.ts', message: 'Authenticating client token', line: 34 },
  { file: 'src/server/BaseServer.ts', message: 'Client authenticated successfully', line: 102 },
  { file: 'src/abstractions/DefaultPresenceManager.ts', message: 'Client joined presence', line: 56 },
  { file: 'src/abstractions/DefaultRoomManager.ts', message: 'Adding client to default room', line: 78 },
  { file: 'src/client/BaseClient.ts', message: 'Connection established', line: 145 },
];

/**
 * Simulated log sequence for a lock acquisition flow
 */
const lockAcquisitionLogs = [
  { file: 'src/client/BaseClient.ts', message: 'Requesting lock: document-123', line: 201 },
  { file: 'src/adapters/websocket/WebSocketClientTransportAdapter.ts', message: 'Sending lock request', line: 89 },
  { file: 'src/adapters/websocket/WebSocketServerTransportAdapter.ts', message: 'Received lock request', line: 145 },
  { file: 'src/server/BaseServer.ts', message: 'Processing lock request for document-123', line: 178 },
  { file: 'src/abstractions/DefaultLockManager.ts', message: 'Checking lock availability', line: 45 },
  { file: 'src/abstractions/DefaultLockManager.ts', message: 'Lock acquired: document-123', line: 67 },
  { file: 'src/server/BaseServer.ts', message: 'Lock granted to client', line: 185 },
  { file: 'src/adapters/websocket/WebSocketServerTransportAdapter.ts', message: 'Sending lock confirmation', line: 156 },
  { file: 'src/client/BaseClient.ts', message: 'Lock confirmed: document-123', line: 215 },
];

/**
 * Simulated log sequence for room broadcast
 */
const roomBroadcastLogs = [
  { file: 'src/client/BaseClient.ts', message: 'Sending message to room', line: 267 },
  { file: 'src/adapters/websocket/WebSocketClientTransportAdapter.ts', message: 'Transmitting room message', line: 123 },
  { file: 'src/server/BaseServer.ts', message: 'Received room message', line: 234 },
  { file: 'src/abstractions/DefaultRoomManager.ts', message: 'Broadcasting to room members', line: 112 },
  { file: 'src/abstractions/DefaultRoomManager.ts', message: 'Message delivered to 3 clients', line: 118 },
];

// Meta for the integration stories
const meta: Meta = {
  title: 'Integration/ControlTowerCore',
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
 * Live integration test with real Control Tower Core configuration
 */
export const LiveIntegration: StoryObj = {
  render: () => {
    const serviceRef = useRef<EventRecorderService | null>(null);
    const [sessions, setSessions] = useState<EventSession[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
    const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
    const [playbackEvents, setPlaybackEvents] = useState<GraphEvent[]>([]);
    const [liveEvents, setLiveEvents] = useState<Array<{ componentId: string; message: string; timestamp: number }>>([]);
    const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initialize service
    useEffect(() => {
      const service = new EventRecorderService({
        graphConfig: controlTowerConfig,
        recordingMode: 'manual',
      });

      service.onEvent((event) => {
        const evt = event as any;
        setLiveEvents((prev) => [
          ...prev.slice(-9), // Keep last 10
          {
            componentId: evt.componentId || 'unknown',
            message: evt.message || evt.type,
            timestamp: Date.now(),
          },
        ]);
      });

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

    // Run a specific log sequence
    const runLogSequence = useCallback((logs: typeof clientConnectionLogs, delayMs: number = 200) => {
      if (!serviceRef.current) return;

      let index = 0;
      const interval = setInterval(() => {
        if (!serviceRef.current?.recording || index >= logs.length) {
          clearInterval(interval);
          return;
        }

        const logInfo = logs[index];
        serviceRef.current.processLog({
          message: logInfo.message,
          metadata: {
            timestamp: Date.now(),
            level: 'info',
            source: {
              file: logInfo.file,
              line: logInfo.line,
            },
          },
        });
        index++;
      }, delayMs);

      simulationRef.current = interval;
    }, []);

    // Start recording with a specific test scenario
    const handleStartScenario = useCallback(
      (scenarioName: string, logs: typeof clientConnectionLogs) => {
        if (!serviceRef.current) return;

        const session = serviceRef.current.startSession({
          name: scenarioName,
          metadata: {
            testFile: 'test/integration.test.ts',
            testName: scenarioName,
          },
        });

        setActiveSessionId(session.id);
        setIsRecording(true);
        setLiveEvents([]);

        runLogSequence(logs, 300);
      },
      [runLogSequence]
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

    // Get component color from config
    const getComponentColor = (componentId: string): string => {
      const nodeType = controlTowerConfig.nodeTypes[componentId];
      return nodeType?.color || '#666';
    };

    return (
      <ThemeProvider>
        <div
          style={{
            height: '100vh',
            display: 'grid',
            gridTemplateColumns: '350px 1fr 350px',
            gap: '1px',
            backgroundColor: '#1a1a1a',
          }}
        >
          {/* Left Panel: Scenarios & Recorder */}
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0a0a0a',
            }}
          >
            {/* Test Scenarios */}
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid #333',
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  color: '#888',
                  fontFamily: 'system-ui',
                }}
              >
                Test Scenarios
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleStartScenario('Client Connection Flow', clientConnectionLogs)}
                  disabled={isRecording}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: isRecording ? '#333' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isRecording ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontFamily: 'system-ui',
                    textAlign: 'left',
                  }}
                >
                  Client Connection Flow
                  <span style={{ display: 'block', fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                    Client → Transport → Server → Auth
                  </span>
                </button>
                <button
                  onClick={() => handleStartScenario('Lock Acquisition', lockAcquisitionLogs)}
                  disabled={isRecording}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: isRecording ? '#333' : '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isRecording ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontFamily: 'system-ui',
                    textAlign: 'left',
                  }}
                >
                  Lock Acquisition
                  <span style={{ display: 'block', fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                    Client → Server → LockManager
                  </span>
                </button>
                <button
                  onClick={() => handleStartScenario('Room Broadcast', roomBroadcastLogs)}
                  disabled={isRecording}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: isRecording ? '#333' : '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isRecording ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontFamily: 'system-ui',
                    textAlign: 'left',
                  }}
                >
                  Room Broadcast
                  <span style={{ display: 'block', fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                    Client → RoomManager → Clients
                  </span>
                </button>
                {isRecording && (
                  <button
                    onClick={handleStopRecording}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'system-ui',
                    }}
                  >
                    Stop Recording
                  </button>
                )}
              </div>
            </div>

            {/* Sessions */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <EventRecorderPanel
                sessions={sessions}
                activeSessionId={activeSessionId}
                isRecording={isRecording}
                selectedSessionId={selectedSessionId}
                onSessionSelect={setSelectedSessionId}
                onPlaySession={handlePlaySession}
                onDeleteSession={handleDeleteSession}
              />
            </div>
          </div>

          {/* Center: Live Event Feed & Component Visualization */}
          <div
            style={{
              height: '100%',
              backgroundColor: '#0a0a0a',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '14px',
                color: '#666',
                fontFamily: 'system-ui',
              }}
            >
              Component Activity
            </h3>

            {/* Component Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              {Object.entries(controlTowerConfig.nodeTypes).map(([id, config]) => {
                const isActive = liveEvents.some(
                  (e) => e.componentId === id && Date.now() - e.timestamp < 1000
                );
                return (
                  <div
                    key={id}
                    style={{
                      padding: '12px',
                      backgroundColor: isActive ? `${config.color}30` : '#111',
                      border: `2px solid ${isActive ? config.color : '#333'}`,
                      borderRadius: '8px',
                      transition: 'all 0.3s',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: config.color,
                        marginBottom: '4px',
                      }}
                    >
                      {id}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#666',
                        fontFamily: 'monospace',
                      }}
                    >
                      {config.sources?.[0]?.split('/').pop() || 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Event Stream */}
            <div
              style={{
                flex: 1,
                backgroundColor: '#111',
                borderRadius: '8px',
                border: '1px solid #333',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isRecording && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                )}
                <span style={{ fontSize: '12px', color: '#888' }}>
                  {isRecording ? 'Recording Events...' : 'Event Stream'}
                </span>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                {liveEvents.length === 0 ? (
                  <div
                    style={{
                      color: '#444',
                      fontSize: '12px',
                      textAlign: 'center',
                      padding: '40px',
                    }}
                  >
                    Run a test scenario to see events
                  </div>
                ) : (
                  liveEvents.map((event, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px',
                        marginBottom: '4px',
                        backgroundColor: '#0a0a0a',
                        borderRadius: '4px',
                        borderLeft: `3px solid ${getComponentColor(event.componentId)}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: getComponentColor(event.componentId),
                        }}
                      >
                        {event.componentId}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#888',
                          marginTop: '2px',
                        }}
                      >
                        {event.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Playback Controller */}
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <EventControllerPanel
              events={playbackEvents}
              onEventsEmit={(events) => {
                // In real integration, these would go to GraphRenderer
                console.log('Playing events:', events.length);
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
 * Shows the stats and configuration being used
 */
export const ConfigurationView: StoryObj = {
  render: () => {
    return (
      <ThemeProvider>
        <div
          style={{
            padding: '32px',
            backgroundColor: '#0a0a0a',
            minHeight: '100vh',
            color: '#ccc',
            fontFamily: 'system-ui',
          }}
        >
          <h2 style={{ color: '#fff', marginBottom: '24px' }}>
            Control Tower Core - VGC Configuration
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Node Types */}
            <div
              style={{
                backgroundColor: '#111',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #333',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#888' }}>
                Node Types ({Object.keys(controlTowerConfig.nodeTypes).length})
              </h3>
              {Object.entries(controlTowerConfig.nodeTypes).map(([id, config]) => (
                <div
                  key={id}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: '#0a0a0a',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${config.color}`,
                  }}
                >
                  <div style={{ fontWeight: 500, color: config.color }}>{id}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    Sources:
                  </div>
                  {config.sources?.map((src, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#888',
                        marginLeft: '8px',
                      }}
                    >
                      {src}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Edge Types */}
            <div
              style={{
                backgroundColor: '#111',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #333',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#888' }}>
                Edge Types ({Object.keys(controlTowerConfig.edgeTypes).length})
              </h3>
              {Object.entries(controlTowerConfig.edgeTypes).map(([id, config]) => (
                <div
                  key={id}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: '#0a0a0a',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${config.color}`,
                  }}
                >
                  <div style={{ fontWeight: 500, color: config.color }}>{id}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    Style: {config.style}
                  </div>
                </div>
              ))}
            </div>

            {/* Allowed Connections */}
            <div
              style={{
                gridColumn: '1 / -1',
                backgroundColor: '#111',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #333',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#888' }}>
                Allowed Connections ({controlTowerConfig.allowedConnections.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {controlTowerConfig.allowedConnections.map((conn, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#0a0a0a',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ color: controlTowerConfig.nodeTypes[conn.from]?.color }}>
                      {conn.from}
                    </span>
                    <span style={{ color: '#666' }}> → </span>
                    <span style={{ color: controlTowerConfig.nodeTypes[conn.to]?.color }}>
                      {conn.to}
                    </span>
                    <span style={{ color: '#444' }}> via </span>
                    <span style={{ color: controlTowerConfig.edgeTypes[conn.via]?.color }}>
                      {conn.via}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  },
};
