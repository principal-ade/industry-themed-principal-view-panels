import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { ChevronLeft, ChevronRight, X, FileCode, Maximize2, Minimize2 } from 'lucide-react';
import type { WorkflowScenario, OtelEvent, TemplateSegment } from '@principal-ai/principal-view-core';
import { renderEventTemplate } from '@principal-ai/principal-view-core';
import { SourceFileList } from './SourceFileList';
import { TemplateText } from './TemplateText';

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
}) => {
  const { theme } = useTheme();
  const [showSources, setShowSources] = useState(false);

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
  const currentEntry = eventEntries[currentEventIndex];

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
        height: isExpanded ? '50%' : '200px',
        minHeight: isExpanded ? '200px' : '200px',
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
    </div>
  );
};
