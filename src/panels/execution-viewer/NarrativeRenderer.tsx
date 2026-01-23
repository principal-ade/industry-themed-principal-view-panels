import React, { useMemo } from 'react';
import { renderNarrative, parseTemplate, selectScenario, computeAggregates } from '@principal-ai/principal-view-core/browser';
import type { NarrativeTemplate, OtelEvent } from '@principal-ai/principal-view-core/browser';
import { useTheme } from '@principal-ade/industry-theme';

export interface NarrativeRendererProps {
  /** Narrative template to use for rendering */
  template: NarrativeTemplate;

  /** OTEL events to render */
  events: OtelEvent[];

  /** Optional CSS class name */
  className?: string;

  /** Optional custom style */
  style?: React.CSSProperties;

  /** Show metadata panel */
  showMetadata?: boolean;

  /** Callback when a narrative step is clicked - receives the event that triggered it */
  onEventClick?: (event: OtelEvent, eventIndex: number) => void;

  /** Current active event index (to highlight the corresponding narrative step) */
  activeEventIndex?: number;
}

/**
 * Renders OTEL events as a human-readable narrative using a template
 */
export const NarrativeRenderer: React.FC<NarrativeRendererProps> = ({
  template,
  events,
  className,
  style,
  showMetadata = false,
  onEventClick,
  activeEventIndex,
}) => {
  const { theme } = useTheme();
  const activeEventRef = React.useRef<HTMLDivElement>(null);

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
      const rendered = renderNarrative(template, events);
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
  }, [template, events]) as ReturnType<typeof renderNarrative> & { hasMissingVars: boolean };

  // Get the matched scenario and aggregates for rendering individual events
  const { scenario, aggregates } = useMemo(() => {
    const agg = computeAggregates(events);
    const matchResult = selectScenario(template, events, agg);
    return { scenario: matchResult.scenario, aggregates: agg };
  }, [template, events]);

  // Render narrative by rendering each event template individually
  const renderNarrativeContent = () => {
    const elements: React.ReactNode[] = [];
    let stepCounter = 0;

    // Build full context with aggregates
    const fullContext = {
      ...aggregates,
      events,
      totalEvents: events.length,
    };

    // Render introduction
    if (scenario.template.introduction) {
      const introduction = parseTemplate(scenario.template.introduction, fullContext);
      elements.push(
        <div key="introduction">
          {renderFormattedText(introduction)}
        </div>
      );
    }

    // Render each event as a clickable block
    const sortedEvents = [...events].sort((a, b) => {
      const aTime = typeof a.timestamp === 'number' ? a.timestamp : Date.parse(a.timestamp);
      const bTime = typeof b.timestamp === 'number' ? b.timestamp : Date.parse(b.timestamp);
      return aTime - bTime;
    });

    sortedEvents.forEach((event, eventIndex) => {
      const eventTemplate = scenario.template.events?.[event.name];
      if (!eventTemplate) return;

      stepCounter++;

      // Parse template with full context (aggregates + event attributes)
      const eventContext = { ...fullContext, ...event.attributes };
      const renderedText = parseTemplate(eventTemplate, eventContext);

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
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
            alignItems: 'center',
            cursor: onEventClick ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
          }}
        >
          {/* Step number badge */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: activeEventIndex === eventIndex ? '#fff' : theme.colors.primary,
              color: activeEventIndex === eventIndex ? theme.colors.primary : '#fff',
              border: activeEventIndex === eventIndex ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: activeEventIndex === eventIndex ? `0 0 0 3px ${theme.colors.primary}33` : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {stepCounter}
          </div>

          {/* Event content card */}
          <div
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: activeEventIndex === eventIndex ? theme.colors.surface : theme.colors.backgroundSecondary,
              border: activeEventIndex === eventIndex ? `2px solid ${theme.colors.primary}` : `2px solid ${theme.colors.border}`,
              borderRadius: '6px',
              fontSize: '15px',
              lineHeight: '1.6',
              fontWeight: 500,
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
              boxShadow: activeEventIndex === eventIndex ? `0 0 0 3px ${theme.colors.primary}33` : 'none',
            }}
          >
            {renderFormattedText(renderedText)}
          </div>
        </div>
      );
    });

    // Render summary
    if (scenario.template.summary) {
      const summary = parseTemplate(scenario.template.summary, fullContext);
      elements.push(
        <div key="summary" style={{ marginTop: '24px' }}>
          {renderFormattedText(summary)}
        </div>
      );
    }

    return elements;
  };

  // Render formatted text (handles emojis, separators, bullets)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];

      // Skip empty lines but add spacing
      if (!line.trim()) {
        elements.push(<div key={idx} style={{ height: '12px' }} />);
        continue;
      }

      // Status indicators (✅ ❌ ⚠️ 📋) - Headers/Titles
      if (/^[✅❌⚠️📋]/.test(line)) {
        elements.push(
          <div
            key={idx}
            style={{
              fontSize: '18px',
              fontWeight: 700,
              marginTop: idx > 0 ? '24px' : '0',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: `2px solid ${theme.colors.border}`,
              lineHeight: '1.4',
            }}
          >
            {highlightVariables(line)}
          </div>
        );
      }
      // Separators (━━━━)
      else if (/^━+/.test(line)) {
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
            <span style={{ color: theme.colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
              {highlightVariables(content)}
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
              fontSize: '14px',
              lineHeight: '1.7',
              color: theme.colors.text,
              marginTop: '4px',
            }}
          >
            {highlightVariables(line)}
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
      {/* Warning Banner for Missing Variables */}
      {result.hasMissingVars && (
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#854d0e',
            borderBottom: `1px solid #ca8a04`,
            color: '#fef3c7',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Incomplete Template Data</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              Some template variables could not be resolved. The execution data may be missing expected attributes.
              <br />
              <strong>Click "Raw Events" above to see the actual data available.</strong>
            </div>
          </div>
        </div>
      )}

      {/* Narrative Text */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px 28px',
          fontFamily: theme.fonts.body,
          fontSize: '14px',
          lineHeight: '1.7',
          color: theme.colors.text,
          backgroundColor: theme.colors.background,
        }}
      >
        {renderNarrativeContent()}
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
    </div>
  );
};
