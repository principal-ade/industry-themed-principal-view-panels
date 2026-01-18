import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import type {
  EventSession,
  SessionStatus,
  PathBasedEvent,
} from '@principal-ai/principal-view-core';
import {
  Circle,
  Square,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Disc,
} from 'lucide-react';
import type { GraphEvent } from '@principal-ai/principal-view-core/browser';

/**
 * Session summary for display
 */
export interface SessionSummary {
  id: string;
  name: string;
  status: SessionStatus;
  eventCount: number;
  startedAt: number;
  endedAt?: number;
  duration?: number;
  result?: 'pass' | 'fail' | 'skip';
  testFile?: string;
  testName?: string;
}

export interface EventRecorderPanelProps {
  /** List of sessions to display */
  sessions: EventSession[];

  /** Currently active session ID (if recording) */
  activeSessionId?: string;

  /** Whether the recorder is currently recording */
  isRecording?: boolean;

  /** Callback when a session is selected for viewing */
  onSessionSelect?: (sessionId: string) => void;

  /** Callback when a session's events should be played */
  onPlaySession?: (sessionId: string, events: GraphEvent[]) => void;

  /** Callback when a session is deleted */
  onDeleteSession?: (sessionId: string) => void;

  /** Callback when a session is exported */
  onExportSession?: (sessionId: string) => void;

  /** Callback when a session is imported */
  onImportSession?: (json: string) => void;

  /** Callback to start a new recording session */
  onStartRecording?: (name: string) => void;

  /** Callback to stop the current recording */
  onStopRecording?: () => void;

  /** Currently selected session ID */
  selectedSessionId?: string;
}

const getStatusIcon = (status: SessionStatus, size: number = 14) => {
  switch (status) {
    case 'recording':
      return <Disc size={size} />;
    case 'completed':
      return <CheckCircle size={size} />;
    case 'error':
      return <XCircle size={size} />;
    default:
      return <Circle size={size} />;
  }
};

const getResultIcon = (result?: 'pass' | 'fail' | 'skip', size: number = 12) => {
  switch (result) {
    case 'pass':
      return <CheckCircle size={size} />;
    case 'fail':
      return <XCircle size={size} />;
    case 'skip':
      return <AlertCircle size={size} />;
    default:
      return null;
  }
};

const formatDuration = (ms?: number): string => {
  if (!ms) return '--';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
};

const formatTimestamp = (ts: number): string => {
  return new Date(ts).toLocaleTimeString();
};

/**
 * EventRecorderPanel - UI for managing event recording sessions
 *
 * This panel displays a list of recording sessions and allows users to:
 * - View session details and events
 * - Start/stop recording
 * - Play back recorded sessions
 * - Export/import sessions
 * - Delete sessions
 */
export const EventRecorderPanel: React.FC<EventRecorderPanelProps> = ({
  sessions,
  activeSessionId,
  isRecording = false,
  onSessionSelect,
  onPlaySession,
  onDeleteSession,
  onExportSession,
  onImportSession,
  onStartRecording,
  onStopRecording,
  selectedSessionId,
}) => {
  const { theme } = useTheme();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');

  // Convert sessions to summaries
  const sessionSummaries: SessionSummary[] = useMemo(() => {
    return sessions.map((session) => ({
      id: session.id,
      name: session.name,
      status: session.status,
      eventCount: session.events.length,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: session.metadata.duration,
      result: session.metadata.result,
      testFile: session.metadata.testFile,
      testName: session.metadata.testName,
    }));
  }, [sessions]);

  // Get the selected session's full data
  const selectedSession = useMemo(() => {
    if (!selectedSessionId) return null;
    return sessions.find((s) => s.id === selectedSessionId) || null;
  }, [sessions, selectedSessionId]);

  // Toggle session expansion
  const handleToggleExpand = useCallback((sessionId: string) => {
    setExpandedSessionId((prev) => (prev === sessionId ? null : sessionId));
  }, []);

  // Handle session click
  const handleSessionClick = useCallback(
    (sessionId: string) => {
      onSessionSelect?.(sessionId);
    },
    [onSessionSelect]
  );

  // Handle play session
  const handlePlaySession = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        onPlaySession?.(sessionId, session.events);
      }
    },
    [sessions, onPlaySession]
  );

  // Handle start recording
  const handleStartRecording = useCallback(() => {
    const name = newSessionName.trim() || `Recording ${new Date().toLocaleTimeString()}`;
    onStartRecording?.(name);
    setNewSessionName('');
  }, [newSessionName, onStartRecording]);

  // Handle import
  const handleImport = useCallback(() => {
    if (importJson.trim()) {
      onImportSession?.(importJson);
      setImportJson('');
      setShowImportModal(false);
    }
  }, [importJson, onImportSession]);

  // Get status color
  const getStatusColor = (status: SessionStatus): string => {
    switch (status) {
      case 'recording':
        return theme.colors.error || '#ef4444';
      case 'completed':
        return theme.colors.success || '#10b981';
      case 'error':
        return theme.colors.warning || '#f59e0b';
      default:
        return theme.colors.textMuted;
    }
  };

  // Get result color
  const getResultColor = (result?: 'pass' | 'fail' | 'skip'): string => {
    switch (result) {
      case 'pass':
        return theme.colors.success || '#10b981';
      case 'fail':
        return theme.colors.error || '#ef4444';
      case 'skip':
        return theme.colors.warning || '#f59e0b';
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        padding: theme.space[4],
        display: 'flex',
        flexDirection: 'column',
        gap: theme.space[4],
        fontFamily: theme.fonts.body,
        fontSize: theme.fontSizes[1],
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.colors.border}`,
          paddingBottom: theme.space[3],
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: theme.fontSizes[2],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text,
          }}
        >
          Event Recorder
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[2] }}>
          {isRecording && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[1],
                color: theme.colors.error || '#ef4444',
                fontSize: theme.fontSizes[0],
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.error || '#ef4444',
                  animation: 'pulse 1.5s infinite',
                }}
              />
              Recording
            </span>
          )}
          <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes[1] }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Recording Controls */}
      <div
        style={{
          display: 'flex',
          gap: theme.space[2],
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Session name..."
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          disabled={isRecording}
          style={{
            flex: 1,
            padding: `${theme.space[2]} ${theme.space[3]}`,
            backgroundColor: theme.colors.backgroundSecondary,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii[1],
            fontSize: theme.fontSizes[1],
            fontFamily: theme.fonts.body,
            outline: 'none',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isRecording) {
              handleStartRecording();
            }
          }}
        />
        {isRecording ? (
          <button
            onClick={onStopRecording}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.space[1],
              padding: `${theme.space[2]} ${theme.space[3]}`,
              backgroundColor: theme.colors.error || '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: theme.radii[1],
              cursor: 'pointer',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
            }}
          >
            <Square size={14} />
            Stop
          </button>
        ) : (
          <button
            onClick={handleStartRecording}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.space[1],
              padding: `${theme.space[2]} ${theme.space[3]}`,
              backgroundColor: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: theme.radii[1],
              cursor: 'pointer',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
            }}
          >
            <Disc size={14} />
            Record
          </button>
        )}
        <button
          onClick={() => setShowImportModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            backgroundColor: theme.colors.backgroundSecondary,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii[1],
            cursor: 'pointer',
          }}
          title="Import Session"
        >
          <Upload size={16} />
        </button>
      </div>

      {/* Session List */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radii[1],
          border: `1px solid ${theme.colors.border}`,
          minHeight: 0,
        }}
      >
        {sessionSummaries.length === 0 ? (
          <div
            style={{
              color: theme.colors.textMuted,
              textAlign: 'center',
              padding: theme.space[5],
              fontSize: theme.fontSizes[1],
            }}
          >
            No sessions recorded yet.
            <br />
            <span style={{ fontSize: theme.fontSizes[0] }}>
              Start a new recording or import an existing session.
            </span>
          </div>
        ) : (
          <div style={{ padding: theme.space[2] }}>
            {sessionSummaries.map((summary) => (
              <div
                key={summary.id}
                style={{
                  marginBottom: theme.space[2],
                  backgroundColor:
                    selectedSessionId === summary.id
                      ? `${theme.colors.primary}20`
                      : theme.colors.background,
                  borderRadius: theme.radii[1],
                  border: `1px solid ${
                    selectedSessionId === summary.id
                      ? theme.colors.primary
                      : theme.colors.border
                  }`,
                  overflow: 'hidden',
                }}
              >
                {/* Session Header */}
                <div
                  onClick={() => handleSessionClick(summary.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: theme.space[2],
                    cursor: 'pointer',
                    gap: theme.space[2],
                  }}
                >
                  {/* Expand/Collapse */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExpand(summary.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: theme.colors.textMuted,
                      padding: 0,
                    }}
                  >
                    {expandedSessionId === summary.id ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>

                  {/* Status Icon */}
                  <span style={{ color: getStatusColor(summary.status) }}>
                    {getStatusIcon(summary.status)}
                  </span>

                  {/* Session Name */}
                  <span
                    style={{
                      flex: 1,
                      fontWeight: theme.fontWeights.medium,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {summary.name}
                  </span>

                  {/* Result Badge */}
                  {summary.result && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.space[1],
                        color: getResultColor(summary.result),
                        fontSize: theme.fontSizes[0],
                        padding: `${theme.space[1]} ${theme.space[2]}`,
                        backgroundColor: `${getResultColor(summary.result)}20`,
                        borderRadius: theme.radii[0],
                      }}
                    >
                      {getResultIcon(summary.result)}
                      {summary.result}
                    </span>
                  )}

                  {/* Event Count */}
                  <span
                    style={{
                      color: theme.colors.textMuted,
                      fontSize: theme.fontSizes[0],
                    }}
                  >
                    {summary.eventCount} event{summary.eventCount !== 1 ? 's' : ''}
                  </span>

                  {/* Duration */}
                  <span
                    style={{
                      color: theme.colors.textMuted,
                      fontSize: theme.fontSizes[0],
                      fontFamily: theme.fonts.monospace,
                    }}
                  >
                    {formatDuration(summary.duration)}
                  </span>
                </div>

                {/* Expanded Details */}
                {expandedSessionId === summary.id && (
                  <div
                    style={{
                      borderTop: `1px solid ${theme.colors.border}`,
                      padding: theme.space[3],
                      backgroundColor: theme.colors.backgroundSecondary,
                    }}
                  >
                    {/* Session Info */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: `${theme.space[1]} ${theme.space[3]}`,
                        fontSize: theme.fontSizes[0],
                        marginBottom: theme.space[3],
                      }}
                    >
                      <span style={{ color: theme.colors.textMuted }}>ID:</span>
                      <span style={{ fontFamily: theme.fonts.monospace }}>{summary.id}</span>

                      <span style={{ color: theme.colors.textMuted }}>Started:</span>
                      <span>{formatTimestamp(summary.startedAt)}</span>

                      {summary.endedAt && (
                        <>
                          <span style={{ color: theme.colors.textMuted }}>Ended:</span>
                          <span>{formatTimestamp(summary.endedAt)}</span>
                        </>
                      )}

                      {summary.testFile && (
                        <>
                          <span style={{ color: theme.colors.textMuted }}>Test File:</span>
                          <span style={{ fontFamily: theme.fonts.monospace }}>
                            {summary.testFile}
                          </span>
                        </>
                      )}

                      {summary.testName && (
                        <>
                          <span style={{ color: theme.colors.textMuted }}>Test Name:</span>
                          <span>{summary.testName}</span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: 'flex',
                        gap: theme.space[2],
                      }}
                    >
                      {summary.status === 'completed' && summary.eventCount > 0 && (
                        <button
                          onClick={() => handlePlaySession(summary.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: theme.space[1],
                            padding: `${theme.space[1]} ${theme.space[2]}`,
                            backgroundColor: theme.colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: theme.radii[0],
                            cursor: 'pointer',
                            fontSize: theme.fontSizes[0],
                            fontFamily: theme.fonts.body,
                          }}
                        >
                          <Play size={12} />
                          Play
                        </button>
                      )}

                      <button
                        onClick={() => onExportSession?.(summary.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.space[1],
                          padding: `${theme.space[1]} ${theme.space[2]}`,
                          backgroundColor: theme.colors.backgroundSecondary,
                          color: theme.colors.text,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: theme.radii[0],
                          cursor: 'pointer',
                          fontSize: theme.fontSizes[0],
                          fontFamily: theme.fonts.body,
                        }}
                      >
                        <Download size={12} />
                        Export
                      </button>

                      <button
                        onClick={() => onDeleteSession?.(summary.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.space[1],
                          padding: `${theme.space[1]} ${theme.space[2]}`,
                          backgroundColor: theme.colors.backgroundSecondary,
                          color: theme.colors.error || '#ef4444',
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: theme.radii[0],
                          cursor: 'pointer',
                          fontSize: theme.fontSizes[0],
                          fontFamily: theme.fonts.body,
                        }}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowImportModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: theme.radii[2],
              padding: theme.space[4],
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              gap: theme.space[3],
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: theme.fontSizes[2],
                fontWeight: theme.fontWeights.medium,
              }}
            >
              Import Session
            </h4>
            <textarea
              placeholder="Paste session JSON here..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              style={{
                flex: 1,
                minHeight: '200px',
                padding: theme.space[3],
                backgroundColor: theme.colors.backgroundSecondary,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[1],
                fontSize: theme.fontSizes[1],
                fontFamily: theme.fonts.monospace,
                resize: 'vertical',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: theme.space[2],
              }}
            >
              <button
                onClick={() => setShowImportModal(false)}
                style={{
                  padding: `${theme.space[2]} ${theme.space[3]}`,
                  backgroundColor: theme.colors.backgroundSecondary,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radii[1],
                  cursor: 'pointer',
                  fontSize: theme.fontSizes[1],
                  fontFamily: theme.fonts.body,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importJson.trim()}
                style={{
                  padding: `${theme.space[2]} ${theme.space[3]}`,
                  backgroundColor: importJson.trim()
                    ? theme.colors.primary
                    : theme.colors.backgroundSecondary,
                  color: importJson.trim() ? 'white' : theme.colors.textMuted,
                  border: 'none',
                  borderRadius: theme.radii[1],
                  cursor: importJson.trim() ? 'pointer' : 'not-allowed',
                  fontSize: theme.fontSizes[1],
                  fontFamily: theme.fonts.body,
                }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

EventRecorderPanel.displayName = 'EventRecorderPanel';
