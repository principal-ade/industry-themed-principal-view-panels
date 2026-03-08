import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { Theme } from '@principal-ade/industry-theme';
import type { OtelSpanData } from '@principal-ai/principal-view-core';
import type { RegisteredTrace } from '../types/otel';
import { getSpansFromTrace } from '../types/otel';

/**
 * Color configuration for the tape
 */
interface TraceTapeColors {
  line?: string;
  scrubber?: string;
  highlighted?: string;
  background?: string;
}

/**
 * Props for the TraceTape component
 */
export interface TraceTapeProps {
  /** Array of traces to display on the tape */
  traces: RegisteredTrace[];
  /** Theme for styling */
  theme: Theme;
  /** Currently highlighted span ID (controlled from parent) */
  highlightedSpanId?: string;
  /** Currently selected trace ID - its spans will glow */
  selectedTraceId?: string;
  /** Trace ID to focus/jump to (changes trigger scrubber movement) */
  focusTraceId?: string | null;
  /** Callback when user scrubs to a new span */
  onSpanHighlight: (spanId: string | null, span: OtelSpanData | null) => void;
  /** Height of the tape in pixels */
  height?: number;
  /** Whether the tape is interactive */
  interactive?: boolean;
  /** Color scheme configuration (overrides theme-based colors) */
  colors?: TraceTapeColors;
}

/**
 * Parse nanosecond timestamp string to milliseconds
 */
function parseNanoTime(nanoStr: string): number {
  const nanos = BigInt(nanoStr);
  return Number(nanos / BigInt(1_000_000));
}

/**
 * TraceTape - A horizontal timeline scrubber for navigating trace spans
 *
 * Displays all trace spans and events as vertical lines on a horizontal tape.
 * Dragging the scrubber highlights the nearest span to the left of the cursor.
 */
export function TraceTape({
  traces,
  theme,
  highlightedSpanId,
  selectedTraceId,
  focusTraceId,
  onSpanHighlight,
  height = 48,
  interactive = true,
  colors = {},
}: TraceTapeProps) {
  const tapeRef = useRef<HTMLDivElement>(null);
  const [scrubberPercent, setScrubberPercent] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const prevFocusTraceIdRef = useRef<string | null | undefined>(undefined);

  // Merge default colors with theme-based colors
  const resolvedColors = {
    line: theme.colors.primary,
    scrubber: theme.colors.accent || '#22d3ee',
    highlighted: theme.colors.text,
    background: theme.colors.backgroundSecondary,
    ...colors,
  };

  // Compute time range from all traces
  const timeRange = useMemo(() => {
    if (traces.length === 0) return { min: 0, max: 0 };

    const allStartTimes = traces.map((t) => t.startTime);
    const allEndTimes = traces.map((t) => t.endTime);

    return {
      min: Math.min(...allStartTimes),
      max: Math.max(...allEndTimes),
    };
  }, [traces]);

  // Convert span index to display percentage (equal spacing)
  const spanIndexToPercent = useCallback((index: number, total: number): number => {
    if (total <= 1) return 50;
    // Add padding on edges (5% on each side)
    const usableRange = 90;
    const startOffset = 5;
    return startOffset + (index / (total - 1)) * usableRange;
  }, []);

  // Convert display percentage to nearest span index
  const percentToSpanIndex = useCallback((percent: number, total: number): number => {
    if (total <= 1) return 0;
    const usableRange = 90;
    const startOffset = 5;
    const normalizedPercent = Math.max(0, Math.min(100, percent));
    const index = Math.round(((normalizedPercent - startOffset) / usableRange) * (total - 1));
    return Math.max(0, Math.min(total - 1, index));
  }, []);

  // Build span lookup map
  const spanMap = useMemo(() => {
    const map = new Map<string, OtelSpanData>();
    traces.forEach((trace) => {
      const spans = getSpansFromTrace(trace);
      spans.forEach((span) => map.set(span.spanId, span));
    });
    return map;
  }, [traces]);

  // Extract span bars sorted by start time, marking root spans (traces) and trace ownership
  // Handles both traces with full OTLP data and traces with only metadata
  const spanBars = useMemo(() => {
    const bars: Array<{
      id: string;
      spanId: string;
      spanName: string;
      startMs: number;
      endMs: number;
      isRoot: boolean;
      traceId: string;
    }> = [];

    traces.forEach((trace) => {
      const spans = getSpansFromTrace(trace);

      if (spans.length > 0) {
        // Has OTLP data - use actual span information
        // Find the earliest span to mark as root
        let earliestSpanId = spans[0].spanId;
        let earliestTime = parseNanoTime(spans[0].startTimeUnixNano);

        spans.forEach((span) => {
          const startMs = parseNanoTime(span.startTimeUnixNano);
          const endMs = parseNanoTime(span.endTimeUnixNano);

          if (startMs < earliestTime) {
            earliestTime = startMs;
            earliestSpanId = span.spanId;
          }

          bars.push({
            id: span.spanId,
            spanId: span.spanId,
            spanName: span.name,
            startMs,
            endMs,
            isRoot: false, // Will be set below
            traceId: trace.traceId,
          });
        });

        // Mark the earliest span as root
        const rootBar = bars.find((b) => b.spanId === earliestSpanId);
        if (rootBar) rootBar.isRoot = true;
      } else {
        // No OTLP data - create a synthetic bar from trace metadata
        // This handles simplified mock traces that only have trace-level timing
        bars.push({
          id: `trace-${trace.traceId}`,
          spanId: `trace-${trace.traceId}`,
          spanName: trace.name,
          startMs: trace.startTime,
          endMs: trace.endTime,
          isRoot: true,
          traceId: trace.traceId,
        });
      }
    });

    // Sort by start time to maintain order
    bars.sort((a, b) => a.startMs - b.startMs);

    return bars;
  }, [traces]);

  // Find span by index (spans are sorted by start time)
  // Returns the actual OtelSpanData if available, or null for synthetic bars
  const findSpanByIndex = useCallback(
    (index: number): OtelSpanData | null => {
      if (index < 0 || index >= spanBars.length) return null;
      const bar = spanBars[index];
      // For synthetic bars (no OTLP data), return null but the spanId can still be used
      return spanMap.get(bar.spanId) || null;
    },
    [spanBars, spanMap]
  );

  // Get span bar info by index (works for both real and synthetic bars)
  const getSpanBarByIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= spanBars.length) return null;
      return spanBars[index];
    },
    [spanBars]
  );

  // Get relative X percentage from mouse/touch event
  const getRelativePercent = useCallback((event: MouseEvent | TouchEvent): number => {
    if (!tapeRef.current) return 0;

    const rect = tapeRef.current.getBoundingClientRect();
    const clientX =
      'touches' in event
        ? event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX ?? 0
        : event.clientX;

    const x = clientX - rect.left;
    const percent = (x / rect.width) * 100;

    // Clamp to 0-100
    return Math.max(0, Math.min(100, percent));
  }, []);

  // Handle pointer down - start dragging
  const handlePointerDown = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!interactive) return;

      event.preventDefault();
      setIsDragging(true);

      const percent = getRelativePercent(event.nativeEvent);
      const spanIndex = percentToSpanIndex(percent, spanBars.length);
      const snappedPercent = spanIndexToPercent(spanIndex, spanBars.length);
      setScrubberPercent(snappedPercent);

      const span = findSpanByIndex(spanIndex);
      const bar = getSpanBarByIndex(spanIndex);
      // Use actual span if available, otherwise use synthetic bar's spanId
      onSpanHighlight(span?.spanId || bar?.spanId || null, span);
    },
    [
      interactive,
      percentToSpanIndex,
      spanIndexToPercent,
      spanBars.length,
      findSpanByIndex,
      getSpanBarByIndex,
      onSpanHighlight,
      getRelativePercent,
    ]
  );

  // Handle pointer move - update scrubber position
  const handlePointerMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDragging || !tapeRef.current) return;

      event.preventDefault();

      const percent = getRelativePercent(event);
      const spanIndex = percentToSpanIndex(percent, spanBars.length);
      const snappedPercent = spanIndexToPercent(spanIndex, spanBars.length);
      setScrubberPercent(snappedPercent);

      const span = findSpanByIndex(spanIndex);
      const bar = getSpanBarByIndex(spanIndex);
      // Use actual span if available, otherwise use synthetic bar's spanId
      onSpanHighlight(span?.spanId || bar?.spanId || null, span);
    },
    [
      isDragging,
      percentToSpanIndex,
      spanIndexToPercent,
      spanBars.length,
      findSpanByIndex,
      getSpanBarByIndex,
      onSpanHighlight,
      getRelativePercent,
    ]
  );

  // Handle pointer up - stop dragging
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // When focusTraceId changes (from clicking list), move scrubber to first span of that trace
  useEffect(() => {
    // Only act when focusTraceId actually changes to a new value
    if (focusTraceId === prevFocusTraceIdRef.current) return;
    prevFocusTraceIdRef.current = focusTraceId;

    if (!focusTraceId) return;

    // Find the first span (by index in sorted order) that belongs to this trace
    const spanIndex = spanBars.findIndex((bar) => bar.traceId === focusTraceId);
    if (spanIndex !== -1) {
      const snappedPercent = spanIndexToPercent(spanIndex, spanBars.length);
      setScrubberPercent(snappedPercent);
    }
  }, [focusTraceId, spanBars, spanIndexToPercent]);

  // Attach/detach global listeners for drag tracking
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Format duration for end time label
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor(ms % 1000);

    if (minutes > 0) {
      return `${minutes}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    }
    return `${seconds}.${String(milliseconds).padStart(3, '0')}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Start time label */}
      <div
        style={{
          fontSize: theme.fontSizes[1],
          fontFamily: theme.fonts.monospace,
          color: theme.colors.textSecondary,
          whiteSpace: 'nowrap',
          minWidth: '60px',
        }}
      >
        {traces.length > 0 ? '0.000' : '--.---'}
      </div>

      {/* Tape */}
      <div
        ref={tapeRef}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={{
          position: 'relative',
          flex: 1,
          height: `${height}px`,
          background: resolvedColors.background,
          borderRadius: theme.radii[2],
          overflow: 'visible',
          cursor: interactive ? 'pointer' : 'default',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Empty state */}
        {traces.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textMuted,
              fontSize: theme.fontSizes[2],
              fontFamily: theme.fonts.body,
            }}
          >
            No traces
          </div>
        )}

        {/* Span markers (equally spaced) - root spans full height, child spans half height */}
        {spanBars.map((bar, index) => {
          const percent = spanIndexToPercent(index, spanBars.length);
          const isHighlighted = bar.spanId === highlightedSpanId;
          const isInSelectedTrace = bar.traceId === selectedTraceId;

          // Root spans (traces) get full height, child spans get half height - all anchored to bottom
          const topOffset = bar.isRoot ? '4px' : '50%';
          const bottomOffset = '4px';

          // Different colors: traces are accent, spans are primary
          const traceColor = theme.colors.accent || '#14b8a6';
          const spanColor = resolvedColors.line;

          // Selected trace spans: brighter colors, wider, with glow
          const selectedTraceColor = theme.colors.accent || '#5eead4';
          const selectedSpanColor = `${theme.colors.primary}cc`;

          const getWidth = () => {
            if (isHighlighted) return '6px';
            if (isInSelectedTrace) return bar.isRoot ? '6px' : '4px';
            return bar.isRoot ? '4px' : '2px';
          };

          const getBackground = () => {
            if (isHighlighted) return resolvedColors.highlighted;
            if (isInSelectedTrace) return bar.isRoot ? selectedTraceColor : selectedSpanColor;
            return bar.isRoot ? traceColor : spanColor;
          };

          return (
            <div
              key={bar.id}
              style={{
                position: 'absolute',
                left: `${percent}%`,
                transform: 'translateX(-50%)',
                top: topOffset,
                bottom: bottomOffset,
                width: getWidth(),
                background: getBackground(),
                opacity: isHighlighted ? 1 : isInSelectedTrace ? 1 : bar.isRoot ? 0.9 : 0.5,
                borderRadius: '2px',
                transition: 'all 0.15s',
                pointerEvents: 'none',
                boxShadow: isInSelectedTrace ? `0 0 8px 2px ${getBackground()}` : 'none',
              }}
              title={`${bar.isRoot ? 'Trace: ' : ''}${bar.spanName} (${(bar.endMs - bar.startMs).toFixed(1)}ms)`}
            />
          );
        })}

        {/* Scrubber line */}
        {scrubberPercent !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${scrubberPercent}%`,
              top: 0,
              bottom: 0,
              width: '2px',
              marginLeft: '-1px',
              background: resolvedColors.scrubber,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {/* Label above scrubber */}
            <div
              style={{
                position: 'absolute',
                top: '-24px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: theme.fontSizes[0],
                fontFamily: theme.fonts.monospace,
                color: resolvedColors.scrubber,
                whiteSpace: 'nowrap',
                background: theme.colors.background,
                padding: '2px 6px',
                borderRadius: '3px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              {spanBars[percentToSpanIndex(scrubberPercent, spanBars.length)]?.isRoot
                ? 'trace'
                : 'span'}
            </div>
          </div>
        )}
      </div>

      {/* End time label */}
      <div
        style={{
          fontSize: theme.fontSizes[1],
          fontFamily: theme.fonts.monospace,
          color: theme.colors.textSecondary,
          whiteSpace: 'nowrap',
          minWidth: '60px',
          textAlign: 'right',
        }}
      >
        {traces.length > 0 ? formatDuration(timeRange.max - timeRange.min) : '--.---'}
      </div>
    </div>
  );
}

export default TraceTape;
