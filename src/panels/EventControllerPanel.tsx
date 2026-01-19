import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import type { GraphEvent } from '@principal-ai/principal-view-core/browser';
import { Play, Pause, Square, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

export type PlaybackStatus = 'stopped' | 'playing' | 'paused';

export interface PlaybackState {
  status: PlaybackStatus;
  currentIndex: number;
  totalEvents: number;
  speed: number;
}

export interface EventControllerPanelProps {
  /** Array of events to play through */
  events: GraphEvent[];

  /** Callback when events should be emitted to the graph */
  onEventsEmit: (events: GraphEvent[]) => void;

  /** Callback when playback state changes */
  onPlaybackStateChange?: (state: PlaybackState) => void;

  /** Default playback speed multiplier (default: 1) */
  defaultSpeed?: number;

  /** Whether to auto-play on mount (default: false) */
  autoPlay?: boolean;

  /** Whether to loop playback (default: false) */
  loop?: boolean;
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];

/**
 * EventControllerPanel - Controls event playback and emits events to GraphRenderer
 *
 * This panel acts as the intermediary between stored events and the graph visualization.
 * It provides playback controls (play, pause, stop, step, seek) and emits events
 * that the GraphRenderer can consume for animations.
 */
export const EventControllerPanel: React.FC<EventControllerPanelProps> = ({
  events,
  onEventsEmit,
  onPlaybackStateChange,
  defaultSpeed = 1,
  autoPlay = false,
  loop = false,
}) => {
  const { theme } = useTheme();

  // Playback state
  const [status, setStatus] = useState<PlaybackStatus>('stopped');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [speed, setSpeed] = useState(defaultSpeed);

  // Refs for interval management
  const playbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notify parent of playback state changes
  useEffect(() => {
    onPlaybackStateChange?.({
      status,
      currentIndex,
      totalEvents: events.length,
      speed,
    });
  }, [status, currentIndex, events.length, speed, onPlaybackStateChange]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  // Auto-play on mount if enabled
  useEffect(() => {
    if (autoPlay && events.length > 0) {
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate delay between events based on timestamps
  const getDelayToNextEvent = useCallback((fromIndex: number): number => {
    if (fromIndex < 0) return 500 / speed; // Initial delay
    if (fromIndex >= events.length - 1) return 0;

    const currentEvent = events[fromIndex];
    const nextEvent = events[fromIndex + 1];

    // Calculate time difference between events
    const timeDiff = nextEvent.timestamp - currentEvent.timestamp;

    // Apply speed multiplier, with min/max bounds
    const adjustedDelay = Math.max(100, Math.min(5000, timeDiff)) / speed;

    return adjustedDelay;
  }, [events, speed]);

  // Emit event at index
  const emitEventAtIndex = useCallback((index: number) => {
    if (index < 0 || index >= events.length) return;

    const newEmittedEvents = events.slice(0, index + 1);
    onEventsEmit(newEmittedEvents);
    setCurrentIndex(index);
  }, [events, onEventsEmit]);

  // Schedule next event
  const scheduleNextEvent = useCallback((fromIndex: number) => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
    }

    const nextIndex = fromIndex + 1;
    if (nextIndex >= events.length) {
      if (loop) {
        // Reset and start over
        onEventsEmit([]);
        setCurrentIndex(-1);
        playbackTimeoutRef.current = setTimeout(() => {
          emitEventAtIndex(0);
          scheduleNextEvent(0);
        }, 500 / speed);
      } else {
        setStatus('stopped');
      }
      return;
    }

    const delay = getDelayToNextEvent(fromIndex);
    playbackTimeoutRef.current = setTimeout(() => {
      emitEventAtIndex(nextIndex);
      scheduleNextEvent(nextIndex);
    }, delay);
  }, [events.length, loop, speed, getDelayToNextEvent, emitEventAtIndex, onEventsEmit]);

  // Play through events
  const handlePlay = useCallback(() => {
    if (events.length === 0) return;

    setStatus('playing');

    // If at end, restart
    if (currentIndex >= events.length - 1) {
      onEventsEmit([]);
      setCurrentIndex(-1);
      playbackTimeoutRef.current = setTimeout(() => {
        emitEventAtIndex(0);
        scheduleNextEvent(0);
      }, 300);
    } else if (currentIndex < 0) {
      // Start from beginning
      emitEventAtIndex(0);
      scheduleNextEvent(0);
    } else {
      // Continue from current position
      scheduleNextEvent(currentIndex);
    }
  }, [events, currentIndex, emitEventAtIndex, scheduleNextEvent, onEventsEmit]);

  // Pause playback
  const handlePause = useCallback(() => {
    setStatus('paused');
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
  }, []);

  // Stop and reset
  const handleStop = useCallback(() => {
    setStatus('stopped');
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    setCurrentIndex(-1);
    onEventsEmit([]);
  }, [onEventsEmit]);

  // Step to next event
  const stepNext = useCallback(() => {
    if (status === 'playing') {
      handlePause();
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex < events.length) {
      emitEventAtIndex(nextIndex);
    } else if (loop) {
      onEventsEmit([]);
      setCurrentIndex(-1);
      setTimeout(() => emitEventAtIndex(0), 100);
    }
  }, [status, currentIndex, events.length, loop, handlePause, emitEventAtIndex, onEventsEmit]);

  // Step to previous event
  const stepPrevious = useCallback(() => {
    if (status === 'playing') {
      handlePause();
    }
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const newEmittedEvents = events.slice(0, newIndex + 1);
      onEventsEmit(newEmittedEvents);
      setCurrentIndex(newIndex);
    } else if (currentIndex === 0) {
      onEventsEmit([]);
      setCurrentIndex(-1);
    }
  }, [status, currentIndex, events, handlePause, onEventsEmit]);

  // Seek to specific index
  const handleSeek = useCallback((index: number) => {
    const wasPlaying = status === 'playing';
    if (wasPlaying) {
      handlePause();
    }

    if (index < 0) {
      onEventsEmit([]);
      setCurrentIndex(-1);
    } else {
      const eventsToEmit = events.slice(0, index + 1);
      onEventsEmit(eventsToEmit);
      setCurrentIndex(index);
    }

    if (wasPlaying) {
      setTimeout(() => {
        setStatus('playing');
        scheduleNextEvent(index);
      }, 100);
    }
  }, [events, status, handlePause, scheduleNextEvent, onEventsEmit]);

  // Get event type display
  const getEventTypeDisplay = (event: GraphEvent): string => {
    return `${event.category}:${event.operation}`;
  };

  // Get event target display
  const getEventTargetDisplay = (event: GraphEvent): string => {
    const payload = event.payload as unknown as Record<string, unknown>;
    if (payload.nodeId) return `node: ${payload.nodeId}`;
    if (payload.edgeId) return `edge: ${payload.edgeId}`;
    return event.type;
  };

  // Get status indicator color
  const getStatusColor = (): string => {
    switch (status) {
      case 'playing': return theme.colors.success || '#10b981';
      case 'paused': return theme.colors.warning || '#f59e0b';
      default: return theme.colors.textMuted;
    }
  };

  return (
    <div style={{
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
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.colors.border}`,
        paddingBottom: theme.space[3],
      }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.fontSizes[2],
          fontWeight: theme.fontWeights.medium,
          color: theme.colors.text
        }}>
          Event Controller
        </h3>
        <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes[1] }}>
          {events.length} events
        </span>
      </div>

      {/* Playback Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.space[2],
        padding: `${theme.space[2]} 0`,
      }}>
        {/* Step Back */}
        <button
          onClick={stepPrevious}
          disabled={currentIndex < 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            backgroundColor: currentIndex < 0 ? theme.colors.backgroundSecondary : theme.colors.backgroundSecondary,
            color: currentIndex < 0 ? theme.colors.textMuted : theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii[1],
            cursor: currentIndex < 0 ? 'not-allowed' : 'pointer',
            opacity: currentIndex < 0 ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
          title="Step Back"
        >
          <SkipBack size={16} />
        </button>

        {/* Stop */}
        <button
          onClick={handleStop}
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
            transition: 'all 0.2s',
          }}
          title="Stop"
        >
          <Square size={16} />
        </button>

        {/* Play/Pause */}
        <button
          onClick={status === 'playing' ? handlePause : handlePlay}
          disabled={events.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            backgroundColor: events.length === 0
              ? theme.colors.backgroundSecondary
              : status === 'playing'
                ? theme.colors.warning || '#f59e0b'
                : theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: theme.radii[2],
            cursor: events.length === 0 ? 'not-allowed' : 'pointer',
            opacity: events.length === 0 ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
          title={status === 'playing' ? 'Pause' : 'Play'}
        >
          {status === 'playing' ? <Pause size={20} /> : <Play size={20} />}
        </button>

        {/* Step Forward */}
        <button
          onClick={stepNext}
          disabled={currentIndex >= events.length - 1 && !loop}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            backgroundColor: theme.colors.backgroundSecondary,
            color: (currentIndex >= events.length - 1 && !loop) ? theme.colors.textMuted : theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii[1],
            cursor: (currentIndex >= events.length - 1 && !loop) ? 'not-allowed' : 'pointer',
            opacity: (currentIndex >= events.length - 1 && !loop) ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
          title="Step Forward"
        >
          <SkipForward size={16} />
        </button>

        {/* Reset */}
        <button
          onClick={handleStop}
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
            transition: 'all 0.2s',
          }}
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ padding: `0 ${theme.space[1]}` }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: theme.space[1],
          fontSize: theme.fontSizes[0],
          color: theme.colors.textMuted,
        }}>
          <span>{currentIndex + 1} / {events.length}</span>
          <span>{speed}x</span>
        </div>
        <input
          type="range"
          min={-1}
          max={events.length - 1}
          value={currentIndex}
          onChange={(e) => handleSeek(parseInt(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            cursor: 'pointer',
            accentColor: theme.colors.primary,
          }}
        />
      </div>

      {/* Speed Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: theme.space[1],
      }}>
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={{
              padding: `${theme.space[1]} ${theme.space[2]}`,
              backgroundColor: speed === s ? theme.colors.primary : theme.colors.backgroundSecondary,
              color: speed === s ? 'white' : theme.colors.textMuted,
              border: `1px solid ${speed === s ? theme.colors.primary : theme.colors.border}`,
              borderRadius: theme.radii[1],
              cursor: 'pointer',
              fontSize: theme.fontSizes[0],
              fontFamily: theme.fonts.body,
              transition: 'all 0.2s',
            }}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Status Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.space[2],
        padding: theme.space[2],
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.radii[1],
        border: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
        }} />
        <span style={{
          textTransform: 'capitalize',
          fontSize: theme.fontSizes[1],
          color: theme.colors.text,
        }}>
          {status}
        </span>
        {status === 'playing' && (
          <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes[0] }}>
            @ {speed}x speed
          </span>
        )}
      </div>

      {/* Event List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.radii[1],
        border: `1px solid ${theme.colors.border}`,
        minHeight: 0, // Allow shrinking in flex container
      }}>
        <div style={{ padding: theme.space[2] }}>
          {events.length === 0 ? (
            <div style={{
              color: theme.colors.textMuted,
              textAlign: 'center',
              padding: theme.space[5],
              fontSize: theme.fontSizes[1],
            }}>
              No events loaded
            </div>
          ) : (
            events.map((event, index) => (
              <div
                key={event.id}
                onClick={() => handleSeek(index)}
                style={{
                  padding: theme.space[2],
                  marginBottom: theme.space[1],
                  backgroundColor: index === currentIndex
                    ? theme.colors.primary
                    : index <= currentIndex
                      ? `${theme.colors.primary}20`
                      : theme.colors.background,
                  borderRadius: theme.radii[1],
                  cursor: 'pointer',
                  borderLeft: index === currentIndex
                    ? `3px solid ${theme.colors.primary}`
                    : '3px solid transparent',
                  transition: 'background-color 0.15s',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontFamily: theme.fonts.monospace,
                    fontSize: theme.fontSizes[0],
                    color: index === currentIndex
                      ? 'white'
                      : index <= currentIndex
                        ? theme.colors.primary
                        : theme.colors.textMuted,
                  }}>
                    {getEventTypeDisplay(event)}
                  </span>
                  <span style={{
                    fontSize: theme.fontSizes[0],
                    color: index === currentIndex ? 'rgba(255,255,255,0.7)' : theme.colors.textMuted,
                  }}>
                    #{index + 1}
                  </span>
                </div>
                <div style={{
                  fontSize: theme.fontSizes[0],
                  color: index === currentIndex
                    ? 'rgba(255,255,255,0.8)'
                    : index <= currentIndex
                      ? theme.colors.textSecondary
                      : theme.colors.textMuted,
                  marginTop: theme.space[1],
                }}>
                  {getEventTargetDisplay(event)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

EventControllerPanel.displayName = 'EventControllerPanel';
