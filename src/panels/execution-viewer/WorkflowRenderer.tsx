import React, { useMemo } from 'react';
import { renderWorkflow, parseTemplate, computeAggregates, getRequiredEvents, ParsedTemplate, getEventTemplateString } from '@principal-ai/principal-view-core';
import type { WorkflowTemplate, OtelEvent, ExtendedCanvas, TemplateSegment, TemplateContext } from '@principal-ai/principal-view-core';
import { useTheme } from '@principal-ade/industry-theme';
import yaml from 'js-yaml';
import { SourceFileList } from './SourceFileList';

export interface WorkflowRendererProps {
  /** Workflow template to use for rendering */
  template: WorkflowTemplate;

  /** OTEL events to render */
  events: OtelEvent[];

  /** Scenario ID to use for rendering (from server-side matching) - REQUIRED */
  scenarioId: string;

  /** Optional CSS class name */
  className?: string;

  /** Optional custom style */
  style?: React.CSSProperties;

  /** Show metadata panel */
  showMetadata?: boolean;

  /** Callback when a workflow step is clicked - receives the event that triggered it */
  onEventClick?: (event: OtelEvent, eventIndex: number) => void;

  /** Current active event index (to highlight the corresponding workflow step) */
  activeEventIndex?: number;

  /** Show only summary (introduction, summary, conditions) without event details */
  showOnlySummary?: boolean;

  /** Canvas for looking up source paths */
  canvas?: ExtendedCanvas | null;

  /** Callback when a source path is clicked */
  onSourceClick?: (source: string) => void;

  /** Show source file paths (default: true) */
  showSources?: boolean;
}

/**
 * Renders OTEL events as a human-readable narrative using a template
 */
export const WorkflowRenderer: React.FC<WorkflowRendererProps> = ({
  template,
  events,
  scenarioId,
  className,
  style,
  showMetadata = false,
  onEventClick,
  activeEventIndex,
  showOnlySummary = false,
  canvas,
  onSourceClick,
  showSources = true,
}) => {
  const { theme } = useTheme();

  // Helper to get source paths for an event name
  const getEventSources = (eventName: string): string[] => {
    if (!canvas?.nodes) return [];

    const sources = new Set<string>();

    canvas.nodes.forEach(node => {
      const nodeEventName = node.pv?.event?.name ||
        ('metadata' in node ? (node.metadata as Record<string, unknown>)?.['pv.event'] : undefined);

      if (nodeEventName === eventName) {
        const nodeSources = node.pv?.sources ||
          ('metadata' in node ? (node.metadata as Record<string, unknown>)?.['pv.sources'] : undefined);

        if (Array.isArray(nodeSources)) {
          nodeSources.forEach(src => {
            if (typeof src === 'string') {
              sources.add(src);
            }
          });
        }
      }
    });

    return Array.from(sources).sort();
  };
  const activeEventRef = React.useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = React.useState<{
    visible: boolean;
    x: number;
    y: number;
    event: OtelEvent | null;
  }>({ visible: false, x: 0, y: 0, event: null });

  // Scroll to active event when it changes
  React.useEffect(() => {
    if (activeEventRef.current && activeEventIndex !== undefined) {
      activeEventRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeEventIndex]);

  // Get the scenario and metadata
  const result = useMemo(() => {
    try {
      const rendered = renderWorkflow(template, events);
      const hasMissingVars = /\{[^}]*\}/.test(rendered.text) || rendered.text.includes('{ERROR:');

      return {
        ...rendered,
        hasMissingVars,
      };
    } catch (error) {
      return {
        text: `Error rendering narrative: ${error instanceof Error ? error.message : 'Unknown error'}`,
        scenarioId: 'error',
        metadata: {
          eventCount: events.length,
          spanCount: 0,
          logCount: 0,
        },
        hasMissingVars: false,
      };
    }
  }, [template, events]) as ReturnType<typeof renderWorkflow> & { hasMissingVars: boolean };

  // Get the scenario (from server-side match) and aggregates for rendering
  const { scenario, aggregates } = useMemo(() => {
    const agg = computeAggregates(events);

    // Look up scenario by ID (provided by server-side matching)
    const matchedScenario = template.scenarios.find(s => s.id === scenarioId);

    if (!matchedScenario) {
      throw new Error(`Scenario with ID "${scenarioId}" not found in template`);
    }

    return { scenario: matchedScenario, aggregates: agg };
  }, [template, events, scenarioId]);

  // Render narrative by rendering each event template individually
  const renderWorkflowContent = () => {
    const elements: React.ReactNode[] = [];

    // Build full context with aggregates
    // Casting to TemplateContext - matches pattern used in core library's template-renderer.ts
    const fullContext = {
      ...aggregates,
      events,
      totalEvents: events.length,
    } as unknown as TemplateContext;

    // Render introduction (only in summary mode)
    if (showOnlySummary && scenario.template.introduction) {
      const introduction = parseTemplate(scenario.template.introduction, fullContext);
      elements.push(
        <div key="introduction" style={{ padding: '6px 20px 12px 20px', borderBottom: `1px solid ${theme.colors.border}` }}>
          {renderFormattedText(introduction)}
        </div>
      );
    }

    // Render required events if showOnlySummary is true
    if (showOnlySummary) {
      const requiredEvents = getRequiredEvents(scenario);

      if (requiredEvents.length > 0) {
        elements.push(
          <div key="required-events" style={{ padding: '8px 20px 12px 20px', borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.backgroundSecondary }}>
            <div style={{ fontSize: theme.fontSizes[0], fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Required Events
            </div>
            <div style={{ fontSize: theme.fontSizes[1], color: theme.colors.text, fontFamily: theme.fonts.monospace }}>
              {requiredEvents.join(', ')}
            </div>
          </div>
        );
      }
    }

    // Render each event as a clickable block (skip if showOnlySummary)
    if (!showOnlySummary) {
      const sortedEvents = [...events].sort((a, b) => {
        const aTime = typeof a.timestamp === 'number' ? a.timestamp : Date.parse(a.timestamp);
        const bTime = typeof b.timestamp === 'number' ? b.timestamp : Date.parse(b.timestamp);
        return aTime - bTime;
      });

      // Create a map of execution events by name for quick lookup
      const executionEventsByName = new Map<string, { event: OtelEvent; index: number }[]>();
      sortedEvents.forEach((event, index) => {
        const existing = executionEventsByName.get(event.name) || [];
        existing.push({ event, index });
        executionEventsByName.set(event.name, existing);
      });

      // Track which execution events we've rendered
      const renderedEventIndices = new Set<number>();

      // Get template events in order (if defined)
      const templateEventNames = scenario.template.events ? Object.keys(scenario.template.events) : [];

      // First, render template events in order (showing missing ones)
      templateEventNames.forEach((templateEventName) => {
        const eventTemplate = scenario.template.events?.[templateEventName];
        if (!eventTemplate) return;

        const matchingEvents = executionEventsByName.get(templateEventName) || [];

        if (matchingEvents.length === 0) {
          // Event is in template but NOT in execution - show template text
          // Variables won't resolve, showing {{variableName}} as the indicator it's missing
          const templateString = getEventTemplateString(eventTemplate);
          const renderedText = parseTemplate(templateString, fullContext);

          // Create a synthetic event for click handling
          const syntheticEventIndex = sortedEvents.length + templateEventNames.indexOf(templateEventName);
          const syntheticEvent: OtelEvent = {
            name: templateEventName,
            timestamp: 0,
            attributes: {},
          };

          elements.push(
            <div
              key={`missing-event-${templateEventName}`}
              onClick={() => {
                if (onEventClick) {
                  onEventClick(syntheticEvent, syntheticEventIndex);
                }
              }}
              style={{
                cursor: onEventClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  padding: '8px 20px 12px 20px',
                  backgroundColor: activeEventIndex === syntheticEventIndex ? theme.colors.muted : theme.colors.backgroundSecondary,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  fontSize: theme.fontSizes[1],
                  lineHeight: '1.7',
                  fontWeight: 500,
                  transition: 'background-color 0.2s ease',
                  color: theme.colors.text,
                }}
              >
                {renderFormattedText(renderedText)}
                {showSources && <SourceFileList sources={getEventSources(templateEventName)} onSourceClick={onSourceClick} />}
              </div>
            </div>
          );
        } else {
          // Render all matching execution events
          matchingEvents.forEach(({ event, index: eventIndex }) => {
            renderedEventIndices.add(eventIndex);

            // Build context with event attributes as nested objects for Handlebars
            const eventContext: Record<string, unknown> = { ...fullContext };

            // Convert flat dot-notation keys to nested objects
            if (event.attributes) {
              for (const [key, value] of Object.entries(event.attributes)) {
                if (key.includes('.')) {
                  // Nested key: convert "skill.name" -> { skill: { name: value } }
                  const parts = key.split('.');
                  let current: Record<string, unknown> = eventContext;
                  for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
                      current[parts[i]] = {};
                    }
                    current = current[parts[i]] as Record<string, unknown>;
                  }
                  current[parts[parts.length - 1]] = value;
                } else {
                  // Simple key
                  eventContext[key] = value;
                }
              }
            }

            const templateString = getEventTemplateString(eventTemplate);
            const renderedText = parseTemplate(templateString, eventContext as unknown as TemplateContext);

            // Make the entire event block clickable
            elements.push(
              <div
                key={`event-${eventIndex}`}
                ref={activeEventIndex === eventIndex ? activeEventRef : null}
                onClick={() => {
                  if (onEventClick) {
                    onEventClick(event, eventIndex);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    event,
                  });
                }}
                style={{
                  cursor: onEventClick ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Event content card */}
                <div
                  style={{
                    padding: '8px 20px 12px 20px',
                    backgroundColor: activeEventIndex === eventIndex ? theme.colors.muted : theme.colors.backgroundSecondary,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    fontSize: theme.fontSizes[1],
                    lineHeight: '1.7',
                    fontWeight: 500,
                    transition: 'background-color 0.2s ease',
                    color: theme.colors.text,
                  }}
                >
                  {renderFormattedText(renderedText)}
                  {/* Show source paths for this event */}
                  {showSources && <SourceFileList sources={getEventSources(event.name)} onSourceClick={onSourceClick} />}
                </div>
              </div>
            );
          });
        }
      });

      // Then, render any execution events that weren't in the template (at the end)
      sortedEvents.forEach((event, eventIndex) => {
        if (renderedEventIndices.has(eventIndex)) return;

        // This event is in execution but has no template - skip it (same behavior as before)
        // We could optionally show these as "extra events" if desired
      });
    }

    // Render summary (only in summary mode)
    if (showOnlySummary && scenario.template.summary) {
      const summary = parseTemplate(scenario.template.summary, fullContext);
      elements.push(
        <div key="summary" style={{ padding: '8px 20px 12px 20px', borderBottom: `1px solid ${theme.colors.border}` }}>
          {renderFormattedText(summary)}
        </div>
      );
    }

    return elements;
  };

  // Render segments from ParsedTemplate with proper variable styling
  const renderSegments = (segments: TemplateSegment[], lineText: string) => {
    // Filter segments that appear in this line
    const lineSegments = segments.filter(seg => lineText.includes(seg.value));

    if (lineSegments.length === 0) {
      return lineText;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    lineSegments.forEach((segment, i) => {
      const segmentIndex = lineText.indexOf(segment.value, lastIndex);

      if (segmentIndex === -1) return;

      // Add text before this segment
      if (segmentIndex > lastIndex) {
        parts.push(lineText.substring(lastIndex, segmentIndex));
      }

      // Add the segment with styling
      if (segment.type === 'variable') {
        parts.push(
          <span
            key={i}
            style={{
              color: segment.resolved ? theme.colors.primary : theme.colors.textTertiary,
              fontWeight: segment.resolved ? 600 : 400,
              fontStyle: segment.resolved ? 'normal' : 'italic',
              fontFamily: theme.fonts.monospace,
              opacity: segment.resolved ? 1 : 0.7,
            }}
          >
            {segment.resolved ? segment.value : `(${segment.variableName})`}
          </span>
        );
      } else {
        parts.push(segment.value);
      }

      lastIndex = segmentIndex + segment.value.length;
    });

    // Add remaining text
    if (lastIndex < lineText.length) {
      parts.push(lineText.substring(lastIndex));
    }

    return <>{parts}</>;
  };

  // Render formatted text (handles emojis, separators, bullets, and ParsedTemplate)
  const renderFormattedText = (input: string | ParsedTemplate) => {
    // Convert ParsedTemplate to string if needed, or handle structured data
    const text = input instanceof ParsedTemplate ? input.toString() : input;
    const parsed = input instanceof ParsedTemplate ? input : null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];

      // Skip empty lines but add spacing
      if (!line.trim()) {
        elements.push(<div key={idx} style={{ height: '12px' }} />);
        continue;
      }

      // Separators (━━━━)
      if (/^━+/.test(line)) {
        elements.push(
          <div
            key={idx}
            style={{
              height: '1px',
              backgroundColor: theme.colors.border,
              margin: '20px 0',
              opacity: 0.3,
            }}
          />
        );
      }
      // Bullet items (•)
      else if (/^\s*•/.test(line)) {
        const content = line.replace(/^\s*•\s*/, '');
        elements.push(
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '8px',
              marginLeft: '8px',
              marginTop: '6px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ color: theme.colors.textSecondary, marginTop: '2px' }}>•</span>
            <span style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes[1], lineHeight: '1.6' }}>
              {parsed ? renderSegments(parsed.segments, content) : highlightVariables(content)}
            </span>
          </div>
        );
      }
      // Regular text
      else {
        elements.push(
          <div
            key={idx}
            style={{
              fontSize: theme.fontSizes[1],
              lineHeight: '1.7',
              color: theme.colors.text,
              marginTop: '4px',
            }}
          >
            {parsed ? renderSegments(parsed.segments, line) : highlightVariables(line)}
          </div>
        );
      }
    }

    return <>{elements}</>;
  };

  // Highlight dynamic variable values in the text
  const highlightVariables = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Patterns for common variable types
    const patterns = [
      // Currency ($123.45)
      { regex: /\$\d+(?:\.\d{2})?/g, color: '#10b981' },
      // IDs and codes (ORD-12345, ABC123, etc.)
      { regex: /\b[A-Z]{2,}[-_]?\d+\b/g, color: '#f59e0b' },
      // Plain numbers (not part of IDs)
      { regex: /\b\d+(?:\.\d+)?\b/g, color: '#60a5fa' },
      // Email-like or capitalized names (John Doe, john@example.com)
      { regex: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, color: '#a78bfa' },
      { regex: /\b[\w.-]+@[\w.-]+\.\w+\b/g, color: '#ec4899' },
    ];

    // Create a combined regex and sort matches by position
    const allMatches: Array<{ start: number; end: number; text: string; color: string }> = [];

    patterns.forEach(({ regex, color }) => {
      let match;
      const re = new RegExp(regex.source, regex.flags);
      while ((match = re.exec(text)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          color,
        });
      }
    });

    // Sort by start position and remove overlaps
    allMatches.sort((a, b) => a.start - b.start);
    const nonOverlapping = [];
    let lastEnd = 0;
    for (const match of allMatches) {
      if (match.start >= lastEnd) {
        nonOverlapping.push(match);
        lastEnd = match.end;
      }
    }

    // Build the highlighted content
    nonOverlapping.forEach((match, i) => {
      // Add text before the match
      if (match.start > lastIndex) {
        parts.push(text.substring(lastIndex, match.start));
      }

      // Add highlighted match
      parts.push(
        <span
          key={i}
          style={{
            color: match.color,
            fontWeight: 600,
            fontFamily: theme.fonts.monospace,
          }}
        >
          {match.text}
        </span>
      );

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, event: null });
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible]);

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Narrative Text */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 0,
          fontFamily: theme.fonts.body,
          fontSize: '14px',
          lineHeight: '1.7',
          color: theme.colors.text,
          backgroundColor: theme.colors.background,
        }}
      >
        {renderWorkflowContent()}
      </div>

      {/* Metadata Panel (optional) */}
      {showMetadata && (
        <div
          style={{
            borderTop: `1px solid ${theme.colors.border}`,
            padding: '12px 20px',
            backgroundColor: theme.colors.surface,
            fontSize: '12px',
            color: theme.colors.textMuted,
            fontFamily: theme.fonts.monospace,
          }}
        >
          <div style={{ marginBottom: '4px' }}>
            <strong style={{ color: theme.colors.text }}>Template:</strong> {template.name}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong style={{ color: theme.colors.text }}>Scenario:</strong> {result.scenarioId}
          </div>
          <div>
            <strong style={{ color: theme.colors.text }}>Events:</strong> {result.metadata.eventCount} total
            ({result.metadata.spanCount} spans, {result.metadata.logCount} logs)
          </div>
          {result.metadata.timeRange && (
            <div style={{ marginTop: '4px' }}>
              <strong style={{ color: theme.colors.text }}>Duration:</strong>{' '}
              {Number(result.metadata.timeRange.end) - Number(result.metadata.timeRange.start)}ms
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.event && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 10000,
            maxWidth: '600px',
            maxHeight: '400px',
            overflow: 'auto',
            padding: '12px',
            fontFamily: theme.fonts.monospace,
            fontSize: theme.fontSizes[2],
            color: theme.colors.text,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontWeight: 600, marginBottom: '8px', color: theme.colors.primary }}>
            Event Data: {contextMenu.event.name}
          </div>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: theme.fontSizes[1],
              lineHeight: '1.5',
            }}
          >
            {yaml.dump({
              name: contextMenu.event.name,
              timestamp: contextMenu.event.timestamp,
              attributes: contextMenu.event.attributes || {},
            }, { indent: 2, lineWidth: -1 })}
          </pre>
        </div>
      )}
    </div>
  );
};
