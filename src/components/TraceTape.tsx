import React, { useState, useMemo, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
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
  /** Maximum number of items visible before scrolling kicks in (default: unlimited) */
  maxVisibleItems?: number;
  /** Show mini-map overview when there are more items than maxVisibleItems */
  showMinimap?: boolean;
  /** Height of the mini-map overview bar in pixels */
  minimapHeight?: number;
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
  maxVisibleItems,
  showMinimap = true,
  minimapHeight = 20,
}: TraceTapeProps) {
  const tapeRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const [scrubberPercent, setScrubberPercent] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingMinimap, setIsDraggingMinimap] = useState(false);
  const [viewportStart, setViewportStart] = useState(0); // 0-100 percent
  const [isPinned, setIsPinned] = useState(false); // When true, view doesn't shift with new traces
  const [pinnedSpanIndex, setPinnedSpanIndex] = useState<number | null>(null); // Index from END of array to pin to
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

  // Convert span index to display percentage (fixed spacing based on maxVisibleItems)
  const spanIndexToPercent = useCallback((index: number, total: number): number => {
    // Use fixed slot count based on maxVisibleItems, or total if no max set
    const slotCount = maxVisibleItems || total;
    if (slotCount <= 1) return 50;

    // Add padding on edges (5% on each side)
    const usableRange = 90;
    const startOffset = 5;

    // Fixed slot width - doesn't change as items are added
    const slotWidth = usableRange / (slotCount - 1);
    return startOffset + (index * slotWidth);
  }, [maxVisibleItems]);

  // Convert span index to percentage for minimap (dynamic spacing - always fills the width)
  const spanIndexToPercentMinimap = useCallback((index: number, total: number): number => {
    if (total <= 1) return 50;
    const usableRange = 90;
    const startOffset = 5;
    return startOffset + (index / (total - 1)) * usableRange;
  }, []);

  // Convert display percentage to nearest span index
  const percentToSpanIndex = useCallback((percent: number, total: number): number => {
    if (total <= 1) return 0;
    const slotCount = maxVisibleItems || total;
    const usableRange = 90;
    const startOffset = 5;
    const slotWidth = usableRange / (slotCount - 1);
    const normalizedPercent = Math.max(0, Math.min(100, percent));
    const index = Math.round((normalizedPercent - startOffset) / slotWidth);
    return Math.max(0, Math.min(total - 1, index));
  }, [maxVisibleItems]);

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

  // Calculate if scrolling is needed and the inner tape width percentage
  const { needsScroll, innerWidthPercent, viewportWidthPercent } = useMemo(() => {
    if (!maxVisibleItems || spanBars.length <= maxVisibleItems) {
      return { needsScroll: false, innerWidthPercent: 100, viewportWidthPercent: 100 };
    }
    // Calculate how wide the inner tape needs to be to maintain the same spacing
    // as if only maxVisibleItems were visible
    const widthPercent = (spanBars.length / maxVisibleItems) * 100;
    // Viewport width is the inverse - what percentage of total is visible
    const viewportWidth = (maxVisibleItems / spanBars.length) * 100;
    return { needsScroll: true, innerWidthPercent: widthPercent, viewportWidthPercent: viewportWidth };
  }, [spanBars.length, maxVisibleItems]);

  // Sync viewport position with scroll (only when not pinned or during user interaction)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !needsScroll) return;

    const handleScroll = () => {
      const scrollMax = container.scrollWidth - container.clientWidth;
      const scrollPercent = scrollMax > 0 ? (container.scrollLeft / scrollMax) * 100 : 0;
      const maxViewportStart = 100 - viewportWidthPercent;

      // Only update viewport from scroll if not pinned (user is manually scrolling)
      if (!isPinned) {
        setViewportStart(Math.min(scrollPercent * maxViewportStart / 100, maxViewportStart));
      }

      // Auto-unpin if user scrolls to the newest (right edge)
      if (isPinned && scrollMax > 0 && container.scrollLeft >= scrollMax - 5) {
        setIsPinned(false);
        setPinnedSpanIndex(null);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [needsScroll, viewportWidthPercent, isPinned]);

  // Maintain pinned position when new spans arrive - scroll to keep pinned span in view
  // Using useLayoutEffect to scroll synchronously before browser paints (prevents flicker)
  useLayoutEffect(() => {
    if (!isPinned || pinnedSpanIndex === null || !scrollContainerRef.current || !needsScroll) {
      return;
    }

    // Calculate where the pinned span is now (index from end stays constant)
    const currentSpanIndex = spanBars.length - 1 - pinnedSpanIndex;
    if (currentSpanIndex < 0) return; // Pinned span no longer exists

    // Calculate the percentage position of the pinned span
    const pinnedPercent = spanIndexToPercent(currentSpanIndex, spanBars.length);

    // Calculate viewport start to center on this span
    const maxViewportStart = 100 - viewportWidthPercent;
    const newStart = Math.max(0, Math.min(maxViewportStart, pinnedPercent - viewportWidthPercent / 2));

    setViewportStart(newStart);

    // Sync scroll container synchronously
    const container = scrollContainerRef.current;
    const scrollMax = container.scrollWidth - container.clientWidth;
    if (scrollMax > 0) {
      container.scrollLeft = (newStart / maxViewportStart) * scrollMax;
    }
  }, [spanBars.length, isPinned, pinnedSpanIndex, needsScroll, viewportWidthPercent, spanIndexToPercent]);

  // Handle minimap click/drag to move viewport
  const handleMinimapPointerDown = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!interactive || !needsScroll || !minimapRef.current) return;

    event.preventDefault();
    setIsDraggingMinimap(true);

    // Clear the scrubber when navigating via minimap
    setScrubberPercent(null);
    onSpanHighlight(null, null);

    // Pin the view when user interacts with minimap
    setIsPinned(true);

    const rect = minimapRef.current.getBoundingClientRect();
    const clientX = 'touches' in event
      ? event.touches[0]?.clientX ?? 0
      : event.clientX;

    const clickPercent = ((clientX - rect.left) / rect.width) * 100;
    // Center the viewport on click position
    const maxViewportStart = 100 - viewportWidthPercent;
    const newStart = Math.max(0, Math.min(maxViewportStart, clickPercent - viewportWidthPercent / 2));

    setViewportStart(newStart);

    // Calculate which span index (from END) we're pinning to
    // This way when new spans arrive at the beginning, our pinned position stays stable
    const centerPercent = newStart + viewportWidthPercent / 2;
    const spanIndex = percentToSpanIndex(centerPercent, spanBars.length);
    const indexFromEnd = spanBars.length - 1 - spanIndex;
    setPinnedSpanIndex(indexFromEnd);

    // Sync scroll container
    if (scrollContainerRef.current) {
      const scrollMax = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const newScrollLeft = (newStart / maxViewportStart) * scrollMax;
      scrollContainerRef.current.scrollLeft = newScrollLeft;
    }
  }, [interactive, needsScroll, viewportWidthPercent, onSpanHighlight, spanBars.length, percentToSpanIndex]);

  const handleMinimapPointerMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDraggingMinimap || !minimapRef.current) return;

    event.preventDefault();

    const rect = minimapRef.current.getBoundingClientRect();
    const clientX = 'touches' in event
      ? event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX ?? 0
      : event.clientX;

    const clickPercent = ((clientX - rect.left) / rect.width) * 100;
    const maxViewportStart = 100 - viewportWidthPercent;
    const newStart = Math.max(0, Math.min(maxViewportStart, clickPercent - viewportWidthPercent / 2));

    setViewportStart(newStart);

    // Update pinned span index
    const centerPercent = newStart + viewportWidthPercent / 2;
    const spanIndex = percentToSpanIndex(centerPercent, spanBars.length);
    const indexFromEnd = spanBars.length - 1 - spanIndex;
    setPinnedSpanIndex(indexFromEnd);

    // Sync scroll container
    if (scrollContainerRef.current) {
      const scrollMax = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const newScrollLeft = (newStart / maxViewportStart) * scrollMax;
      scrollContainerRef.current.scrollLeft = newScrollLeft;
    }
  }, [isDraggingMinimap, viewportWidthPercent, spanBars.length, percentToSpanIndex]);

  const handleMinimapPointerUp = useCallback(() => {
    setIsDraggingMinimap(false);
  }, []);

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
    const container = scrollContainerRef.current || tapeRef.current;
    if (!container) return 0;

    const rect = container.getBoundingClientRect();
    const clientX =
      'touches' in event
        ? event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX ?? 0
        : event.clientX;

    // Account for scroll position when scrolling is enabled
    const scrollLeft = needsScroll && scrollContainerRef.current ? scrollContainerRef.current.scrollLeft : 0;
    const x = clientX - rect.left + scrollLeft;

    // Calculate percent relative to the full inner width
    const totalWidth = needsScroll ? (rect.width * innerWidthPercent) / 100 : rect.width;
    const percent = (x / totalWidth) * 100;

    // Clamp to 0-100
    return Math.max(0, Math.min(100, percent));
  }, [needsScroll, innerWidthPercent]);

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

      // Auto-scroll to keep the focused span visible when scrolling is enabled
      if (needsScroll && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const containerWidth = container.clientWidth;
        const innerWidth = (containerWidth * innerWidthPercent) / 100;
        const targetX = (snappedPercent / 100) * innerWidth;

        // Scroll to center the target span in view
        const scrollTarget = targetX - containerWidth / 2;
        container.scrollTo({
          left: Math.max(0, scrollTarget),
          behavior: 'smooth',
        });
      }
    }
  }, [focusTraceId, spanBars, spanIndexToPercent, needsScroll, innerWidthPercent]);

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

  // Attach/detach global listeners for minimap drag tracking
  useEffect(() => {
    if (isDraggingMinimap) {
      window.addEventListener('mousemove', handleMinimapPointerMove);
      window.addEventListener('mouseup', handleMinimapPointerUp);
      window.addEventListener('touchmove', handleMinimapPointerMove, { passive: false });
      window.addEventListener('touchend', handleMinimapPointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMinimapPointerMove);
      window.removeEventListener('mouseup', handleMinimapPointerUp);
      window.removeEventListener('touchmove', handleMinimapPointerMove);
      window.removeEventListener('touchend', handleMinimapPointerUp);
    };
  }, [isDraggingMinimap, handleMinimapPointerMove, handleMinimapPointerUp]);

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

  // Extract trace-level bars for minimap (one per trace, using root spans)
  // Uses dynamic spacing so minimap always shows full overview
  const traceBarsMinimap = useMemo(() => {
    const traceBars: Array<{
      id: string;
      traceId: string;
      percent: number;
      isHighlighted: boolean;
      isSelected: boolean;
    }> = [];

    // Group spans by trace and find first span index for each
    const traceFirstIndex = new Map<string, number>();
    spanBars.forEach((bar, index) => {
      if (!traceFirstIndex.has(bar.traceId)) {
        traceFirstIndex.set(bar.traceId, index);
      }
    });

    traceFirstIndex.forEach((index, traceId) => {
      // Use dynamic spacing for minimap (spreads across full width)
      const percent = spanIndexToPercentMinimap(index, spanBars.length);
      traceBars.push({
        id: traceId,
        traceId,
        percent,
        isHighlighted: spanBars[index]?.spanId === highlightedSpanId,
        isSelected: traceId === selectedTraceId,
      });
    });

    return traceBars;
  }, [spanBars, spanIndexToPercentMinimap, highlightedSpanId, selectedTraceId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* Mini-map overview - only show when scrolling is needed */}
      {showMinimap && needsScroll && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Spacer for time label alignment */}
          <div style={{ minWidth: '60px' }} />

          {/* Minimap bar */}
          <div
            ref={minimapRef}
            onMouseDown={handleMinimapPointerDown}
            onTouchStart={handleMinimapPointerDown}
            style={{
              position: 'relative',
              flex: 1,
              height: `${minimapHeight}px`,
              background: `${resolvedColors.background}80`,
              borderRadius: theme.radii[1],
              cursor: 'pointer',
              userSelect: 'none',
              touchAction: 'none',
              border: `1px solid ${isPinned ? theme.colors.warning : theme.colors.border}`,
            }}
          >
            {/* Trace markers in minimap */}
            {traceBarsMinimap.map((bar) => (
              <div
                key={bar.id}
                style={{
                  position: 'absolute',
                  left: `${bar.percent}%`,
                  transform: 'translateX(-50%)',
                  top: '3px',
                  bottom: '3px',
                  width: bar.isSelected ? '3px' : '2px',
                  background: bar.isSelected
                    ? theme.colors.accent || '#14b8a6'
                    : bar.isHighlighted
                    ? resolvedColors.highlighted
                    : `${resolvedColors.line}80`,
                  borderRadius: '1px',
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Viewport indicator */}
            <div
              style={{
                position: 'absolute',
                left: `${viewportStart}%`,
                width: `${viewportWidthPercent}%`,
                top: 0,
                bottom: 0,
                background: isPinned ? `${theme.colors.warning}30` : `${theme.colors.primary}20`,
                border: `1px solid ${isPinned ? theme.colors.warning : theme.colors.primary}60`,
                borderRadius: theme.radii[1],
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Pinned indicator / Resume button */}
          <div style={{ minWidth: '60px', display: 'flex', justifyContent: 'flex-start' }}>
            {isPinned && (
              <button
                onClick={() => {
                  setIsPinned(false);
                  setPinnedSpanIndex(null);
                  // Scroll to newest (right edge)
                  if (scrollContainerRef.current) {
                    const scrollMax = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
                    scrollContainerRef.current.scrollLeft = scrollMax;
                    setViewportStart(100 - viewportWidthPercent);
                  } else {
                    setViewportStart(100 - viewportWidthPercent);
                  }
                }}
                style={{
                  padding: '2px 8px',
                  fontSize: theme.fontSizes[0],
                  fontFamily: theme.fonts.body,
                  color: theme.colors.warning,
                  background: `${theme.colors.warning}15`,
                  border: `1px solid ${theme.colors.warning}50`,
                  borderRadius: theme.radii[1],
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                title="Resume live view"
              >
                Resume
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main tape row */}
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

        {/* Tape container - scrollable when items exceed maxVisibleItems */}
      <div
        ref={scrollContainerRef}
        style={{
          position: 'relative',
          flex: 1,
          height: `${height}px`,
          background: resolvedColors.background,
          borderRadius: theme.radii[2],
          overflowX: needsScroll ? 'auto' : 'visible',
          overflowY: 'visible',
        }}
      >
        {/* Inner tape that can be wider than container */}
        <div
          ref={tapeRef}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          style={{
            position: 'relative',
            width: needsScroll ? `${innerWidthPercent}%` : '100%',
            height: '100%',
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
                  transition: 'width 0.15s, background 0.15s, opacity 0.15s, box-shadow 0.15s',
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
    </div>
  );
}

export default TraceTape;
