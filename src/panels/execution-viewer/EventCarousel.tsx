import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { ChevronLeft, ChevronRight, X, FileCode, Maximize2, Minimize2, Layers, List } from 'lucide-react';
import type { WorkflowScenario, OtelEvent, TemplateSegment, Canvas, ExtendedCanvas } from '@principal-ai/principal-view-core';
import { renderEventTemplate } from '@principal-ai/principal-view-core';
import { SequenceDiagramRenderer, type SequenceEvent, type SequenceEdge } from '@principal-ai/principal-view-react';
import { SourceFileList } from './SourceFileList';
import { TemplateText } from './TemplateText';

// Type for accessing OTEL event node properties
type NodeWithOtelProps = {
  type?: string;
  label?: string;
  event?: { name?: string };
  otel?: { scope?: string };
};

/**
 * Convert workflow scenario events to sequence diagram format.
 * Events are grouped into lanes based on their instrumentation scope (from canvas node metadata).
 * Scopes define the swimlanes, and events within each scope are rendered sequentially.
 */
function convertWorkflowToSequence(
  scenario: WorkflowScenario,
  canvas?: Canvas | ExtendedCanvas | null
): {
  events: SequenceEvent[];
  edges: SequenceEdge[];
} {
  const templateEvents = scenario.template.events ?? {};
  const eventNames = Object.keys(templateEvents);

  // Build maps of event names to their scopes and labels from canvas nodes
  const eventToScopeMap = new Map<string, string>();
  const eventToLabelMap = new Map<string, string>();
  if (canvas?.nodes) {
    for (const node of canvas.nodes) {
      // Cast to access OTEL node properties (they may be undefined on standard canvas nodes)
      const otelNode = node as NodeWithOtelProps;

      if (otelNode.type === 'otel-event' && otelNode.otel?.scope && otelNode.event?.name) {
        eventToScopeMap.set(otelNode.event.name, otelNode.otel.scope);
      }
      if (otelNode.type === 'otel-event' && otelNode.event?.name && otelNode.label) {
        eventToLabelMap.set(otelNode.event.name, otelNode.label);
      }
    }
  }

  // Convert event names to SequenceEvents with scope-based namespacing
  const events: SequenceEvent[] = eventNames.map((name, index) => {
    const scope = eventToScopeMap.get(name) || 'unknown';

    return {
      id: `event-${index}`,
      // Use scope as namespace prefix so lanes are created per scope
      name: `${scope}.${name}`,
      // Use canvas node label if available, otherwise fall back to last segment of event name
      label: eventToLabelMap.get(name) || name.split('.').pop() || name,
    };
  });

  // Create sequential edges connecting events in order
  const edges: SequenceEdge[] = [];
  for (let i = 0; i < events.length - 1; i++) {
    edges.push({
      id: `edge-${i}`,
      fromEvent: events[i].id,
      toEvent: events[i + 1].id,
    });
  }

  return { events, edges };
}

export interface EventCarouselProps {
  /** The selected scenario to display events from */
  scenario: WorkflowScenario;
  /** Current event index (0-based) */
  currentEventIndex: number;
  /** Callback when event index changes */
  onEventIndexChange: (index: number) => void;
  /** Callback when event is clicked/selected (for highlighting) */
  onEventClick?: (event: OtelEvent, eventIndex: number) => void;
  /** Callback to dismiss/close the carousel */
  onDismiss?: () => void;
  /** Callback to open source file */
  onSourceClick?: (source: string) => void;
  /** Sources for the current event */
  sources?: string[];
  /** Function to get sources for any event name (for expanded list view) */
  getSourcesForEvent?: (eventName: string) => string[];
  /** Whether the carousel is expanded to full height */
  isExpanded?: boolean;
  /** Callback to toggle expanded state */
  onExpandToggle?: () => void;
  /** Events from a loaded trace (used to fill in template variables) */
  traceEvents?: OtelEvent[];
  /** Canvas containing node metadata for scope extraction */
  canvas?: Canvas | ExtendedCanvas | null;
}

/**
 * A carousel-style event viewer that shows one event at a time.
 * Designed to sit below the canvas as a full-width panel.
 */
export const EventCarousel: React.FC<EventCarouselProps> = ({
  scenario,
  currentEventIndex,
  onEventIndexChange,
  onEventClick,
  onDismiss,
  onSourceClick,
  sources = [],
  getSourcesForEvent,
  isExpanded = false,
  onExpandToggle,
  traceEvents = [],
  canvas,
}) => {
  const { theme } = useTheme();
  const [showSources, setShowSources] = useState(false);
  const [viewMode, setViewMode] = useState<'events' | 'sequence'>('events');

  // Get event entries from scenario template
  const eventEntries = Object.entries(scenario.template.events || {});

  // Build a map of event name -> trace event for template filling
  const traceEventMap = useMemo(() => {
    const map = new Map<string, OtelEvent>();
    traceEvents.forEach(event => {
      // Store first matching event for each name
      if (!map.has(event.name)) {
        map.set(event.name, event);
      }
    });
    return map;
  }, [traceEvents]);

  // Helper to get template segments for an event
  const getEventSegments = useCallback((eventName: string, templateText: string): TemplateSegment[] => {
    const traceEvent = traceEventMap.get(eventName);
    const parsed = renderEventTemplate(templateText, traceEvent);
    return parsed.segments;
  }, [traceEventMap]);
  const totalEvents = eventEntries.length;

  const handlePrev = useCallback(() => {
    if (currentEventIndex > 0) {
      const newIndex = currentEventIndex - 1;
      onEventIndexChange(newIndex);

      // Trigger event click for focusing (without highlighting)
      if (onEventClick && eventEntries[newIndex]) {
        const [eventName] = eventEntries[newIndex];
        const syntheticEvent: OtelEvent = {
          name: eventName,
          timestamp: 0,
          type: 'span',
          spanId: 'preview',
          traceId: 'preview',
          attributes: {},
        };
        onEventClick(syntheticEvent, newIndex);
      }
    }
  }, [currentEventIndex, onEventIndexChange, onEventClick, eventEntries]);

  const handleNext = useCallback(() => {
    if (currentEventIndex < totalEvents - 1) {
      const newIndex = currentEventIndex + 1;
      onEventIndexChange(newIndex);

      // Trigger event click for focusing (without highlighting)
      if (onEventClick && eventEntries[newIndex]) {
        const [eventName] = eventEntries[newIndex];
        const syntheticEvent: OtelEvent = {
          name: eventName,
          timestamp: 0,
          type: 'span',
          spanId: 'preview',
          traceId: 'preview',
          attributes: {},
        };
        onEventClick(syntheticEvent, newIndex);
      }
    }
  }, [currentEventIndex, totalEvents, onEventIndexChange, onEventClick, eventEntries]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Reset view mode to events when scenario changes
  useEffect(() => {
    setViewMode('events');
  }, [scenario.id]);

  // Only show "no events" if there are truly no events defined
  if (eventEntries.length === 0) {
    return (
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: theme.colors.backgroundSecondary,
          borderTop: `1px solid ${theme.colors.border}`,
          textAlign: 'center',
          color: theme.colors.textMuted,
        }}
      >
        No events in this scenario
      </div>
    );
  }

  // For collapsed view, use first event if currentEventIndex is -1
  const effectiveIndex = currentEventIndex < 0 ? 0 : currentEventIndex;
  const effectiveEntry = eventEntries[effectiveIndex];
  const [_eventName, eventTemplate] = effectiveEntry || ['', ''];

  // Format scenario ID as title (e.g., "user-login" -> "User Login")
  const scenarioTitle = scenario.id
    ? scenario.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Scenario';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.backgroundSecondary,
        borderTop: `1px solid ${theme.colors.border}`,
        flexShrink: 0,
        height: isExpanded ? undefined : '200px',
        flex: isExpanded ? '1 1 auto' : '0 0 200px',
        maxHeight: '50%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
          }}
        >
          <span
            style={{
              fontSize: theme.fontSizes[1],
              fontWeight: 600,
              fontFamily: theme.fonts.heading,
              color: theme.colors.text,
            }}
          >
            {scenarioTitle}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Source toggle button */}
            {sources.length > 0 && (
              <button
                onClick={() => setShowSources(!showSources)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: showSources ? theme.colors.accent : theme.colors.text,
                  cursor: 'pointer',
                  opacity: showSources ? 1 : 0.6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = showSources ? '1' : '0.6')}
                title={showSources ? 'Hide sources' : 'Show sources'}
              >
                <FileCode size={16} />
              </button>
            )}
            {/* View mode toggle button (Events vs Sequence) */}
            <button
              onClick={() => setViewMode(prev => prev === 'events' ? 'sequence' : 'events')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: viewMode === 'sequence' ? theme.colors.accent : theme.colors.text,
                cursor: 'pointer',
                opacity: viewMode === 'sequence' ? 1 : 0.6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = viewMode === 'sequence' ? '1' : '0.6')}
              title={viewMode === 'sequence' ? 'Show event list' : 'Show sequence diagram'}
            >
              {viewMode === 'sequence' ? <List size={16} /> : <Layers size={16} />}
            </button>
            {/* Expand/Collapse button */}
            {onExpandToggle && (
              <button
                onClick={onExpandToggle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: theme.colors.text,
                  cursor: 'pointer',
                  opacity: 0.6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
            {/* Dismiss button */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: theme.colors.text,
                  cursor: 'pointer',
                  opacity: 0.6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                title="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        {/* Progress bar - only show in collapsed state */}
        {!isExpanded && (
          <div
            style={{
              display: 'flex',
              height: '3px',
              background: theme.colors.border,
            }}
          >
            {eventEntries.map((_, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  background: idx <= effectiveIndex ? theme.colors.primary : 'transparent',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'sequence' ? (
        /* Sequence Diagram View */
        <div style={{ flex: 1, minHeight: 0, background: theme.colors.backgroundSecondary }}>
          {(() => {
            const { events, edges } = convertWorkflowToSequence(scenario, canvas);
            return events.length > 0 ? (
              <SequenceDiagramRenderer
                events={events}
                edges={edges}
                height="100%"
                layoutOptions={{
                  laneWidth: 220,
                  laneGap: 60,
                  eventSpacing: 100,
                  namespaceStrategy: 'first',
                }}
                showControls
              />
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.colors.textMuted,
                  fontFamily: theme.fonts.body,
                }}
              >
                No events to display
              </div>
            );
          })()}
        </div>
      ) : (
        /* Existing Events View (list or carousel) */
        <>
          {isExpanded ? (
            /* Expanded: List view - matches ScenarioDetailsPanel style */
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                fontFamily: theme.fonts.body,
              }}
            >
              {eventEntries.map(([evtName, evtTemplate], idx) => {
                const isActive = idx === currentEventIndex;
                const traceEvent = traceEventMap.get(evtName);
                const segments = getEventSegments(evtName, String(evtTemplate));
                return (
                  <div
                    key={evtName}
                    onClick={() => {
                      onEventIndexChange(idx);
                      // Trigger event click for focusing (without highlighting)
                      if (onEventClick) {
                        const syntheticEvent: OtelEvent = {
                          name: evtName,
                          timestamp: traceEvent?.timestamp ?? 0,
                          type: 'span',
                          spanId: traceEvent?.spanId ?? 'preview',
                          traceId: traceEvent?.traceId ?? 'preview',
                          attributes: traceEvent?.attributes ?? {},
                        };
                        onEventClick(syntheticEvent, idx);
                      }
                    }}
                    style={{
                      padding: '8px 20px 12px 20px',
                      backgroundColor: isActive ? theme.colors.muted : theme.colors.backgroundSecondary,
                      borderBottom: `1px solid ${theme.colors.border}`,
                      fontSize: theme.fontSizes[1],
                      lineHeight: '1.7',
                      fontWeight: 500,
                      color: theme.colors.text,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <div style={{ marginTop: '4px' }}>
                      <TemplateText segments={segments} />
                    </div>
                    {/* Show source paths for this event */}
                    {showSources && getSourcesForEvent && (
                      <SourceFileList sources={getSourcesForEvent(evtName)} onSourceClick={onSourceClick} />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Collapsed: Carousel view */
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '16px 16px',
                gap: '8px',
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                disabled={currentEventIndex === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  padding: 0,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: currentEventIndex === 0 ? theme.colors.textMuted : theme.colors.text,
                  cursor: currentEventIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentEventIndex === 0 ? 0.3 : 0.7,
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { if (currentEventIndex > 0) e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { if (currentEventIndex > 0) e.currentTarget.style.opacity = '0.7'; }}
                title="Previous event (←)"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Event Content */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: 0,
                  overflow: 'auto',
                  maxHeight: '100%',
                }}
              >
                {/* Event template text (filled in if trace events available) */}
                <div
                  style={{
                    fontSize: theme.fontSizes[2],
                    fontWeight: 500,
                    color: theme.colors.text,
                    lineHeight: 1.5,
                    fontFamily: theme.fonts.body,
                  }}
                >
                  <TemplateText segments={getEventSegments(effectiveEntry[0], String(eventTemplate))} />
                </div>

                {/* Source files */}
                {showSources && sources.length > 0 && (
                  <SourceFileList sources={sources} onSourceClick={onSourceClick} />
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={currentEventIndex >= totalEvents - 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  padding: 0,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: currentEventIndex >= totalEvents - 1 ? theme.colors.textMuted : theme.colors.text,
                  cursor: currentEventIndex >= totalEvents - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentEventIndex >= totalEvents - 1 ? 0.3 : 0.7,
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { if (currentEventIndex < totalEvents - 1) e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { if (currentEventIndex < totalEvents - 1) e.currentTarget.style.opacity = '0.7'; }}
                title="Next event (→)"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
