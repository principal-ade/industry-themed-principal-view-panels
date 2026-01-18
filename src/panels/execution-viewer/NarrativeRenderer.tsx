import React, { useMemo } from 'react';
import { renderNarrative } from '@principal-ai/principal-view-core/browser';
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
}) => {
  const { theme } = useTheme();

  // Render the narrative
  const result = useMemo(() => {
    try {
      const rendered = renderNarrative(template, events);

      // Check for unresolved template variables (still in {variable} format)
      // or evaluation errors ({ERROR: ...})
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
  }, [template, events]);

  // Parse narrative text to add syntax highlighting with enhanced structure
  const renderHighlightedText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let stepCounter = 0;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];

      // Skip empty lines but add spacing
      if (!line.trim()) {
        elements.push(<div key={idx} style={{ height: '12px' }} />);
        continue;
      }

      // Status indicators (✅ ❌ ⚠️ 📋) - Introduction/Title
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
        stepCounter = 0; // Reset step counter after title
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
      // Arrow items (→) - Flow steps with card layout
      else if (/^(\s*)→/.test(line)) {
        const indent = line.match(/^(\s*)/)?.[1] || '';
        const isMainStep = indent.length === 0;

        if (isMainStep) {
          stepCounter++;
        }

        const content = line.replace(/^(\s*)→\s*/, '');

        elements.push(
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: isMainStep ? '16px' : '8px',
              marginLeft: isMainStep ? '0' : '40px',
              alignItems: 'flex-start',
            }}
          >
            {/* Step indicator */}
            {isMainStep && (
              <div
                style={{
                  minWidth: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.primary,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {stepCounter}
              </div>
            )}
            {!isMainStep && (
              <div
                style={{
                  minWidth: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.textSecondary,
                  marginTop: '8px',
                  flexShrink: 0,
                }}
              />
            )}

            {/* Step content card */}
            <div
              style={{
                flex: 1,
                padding: isMainStep ? '12px 16px' : '8px 12px',
                backgroundColor: isMainStep ? theme.colors.backgroundSecondary : 'transparent',
                border: isMainStep ? `1px solid ${theme.colors.border}` : 'none',
                borderRadius: '6px',
                fontSize: isMainStep ? '15px' : '14px',
                lineHeight: '1.6',
                fontWeight: isMainStep ? 500 : 400,
              }}
            >
              {highlightVariables(content)}
            </div>
          </div>
        );
      }
      // Bullet items (•)
      else if (/^\s+•/.test(line)) {
        const content = line.replace(/^\s+•\s*/, '');
        elements.push(
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '8px',
              marginLeft: '40px',
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
      // Section headers (UPPERCASE at start)
      else if (/^[A-Z\s]+:/.test(line)) {
        elements.push(
          <div
            key={idx}
            style={{
              fontSize: '14px',
              fontWeight: 700,
              marginTop: '24px',
              marginBottom: '12px',
              color: theme.colors.text,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              opacity: 0.8,
            }}
          >
            {highlightVariables(line)}
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
              color: theme.colors.textSecondary,
              marginTop: '8px',
            }}
          >
            {highlightVariables(line)}
          </div>
        );
      }
    }

    return elements;
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
      {(result as any).hasMissingVars && (
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
        {renderHighlightedText(result.text)}
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
