/**
 * TemplateText Component
 *
 * Renders ParsedTemplate segments with:
 * - Markdown support for text segments
 * - Styled variable segments (accent for resolved, muted for unresolved)
 */

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme, type Theme } from '@principal-ade/industry-theme';
import type { TemplateSegment } from '@principal-ai/principal-view-core';

export interface TemplateTextProps {
  /** Segments from ParsedTemplate */
  segments: TemplateSegment[];
  /** Optional className for the container */
  className?: string;
}

/**
 * Check if text contains markdown syntax that needs rendering.
 * Only use ReactMarkdown for text that actually has markdown.
 */
function hasMarkdownSyntax(text: string): boolean {
  // Check for common inline markdown patterns
  return /(\*\*|__|\*|_|`|\[.*\]\(.*\)|~~)/.test(text);
}

/**
 * Create minimal theme-aware components for markdown rendering.
 * This is a simplified version focused on inline content.
 */
function createMarkdownComponents(theme: Theme) {
  return {
    // Paragraphs - render as span to avoid block-level issues in inline context
    p: ({ children }: { children?: React.ReactNode }) => (
      <span style={{ fontFamily: theme.fonts.body }}>{children}</span>
    ),
    // Strong/bold
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong style={{ fontWeight: 600, color: theme.colors.text }}>{children}</strong>
    ),
    // Emphasis/italic
    em: ({ children }: { children?: React.ReactNode }) => (
      <em style={{ fontStyle: 'italic' }}>{children}</em>
    ),
    // Inline code
    code: ({ children }: { children?: React.ReactNode }) => (
      <code
        style={{
          fontFamily: theme.fonts.monospace,
          backgroundColor: theme.colors.muted,
          padding: '2px 4px',
          borderRadius: '3px',
          fontSize: '0.9em',
        }}
      >
        {children}
      </code>
    ),
    // Links
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        style={{
          color: theme.colors.primary,
          textDecoration: 'underline',
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };
}

/**
 * Render a text segment - uses markdown only if it contains markdown syntax,
 * otherwise renders as plain text to preserve whitespace.
 */
const TextSegment: React.FC<{ text: string; theme: Theme }> = ({ text, theme }) => {
  const components = useMemo(() => createMarkdownComponents(theme), [theme]);

  // Only use ReactMarkdown if text actually contains markdown
  if (hasMarkdownSyntax(text)) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    );
  }

  // Plain text - render directly with pre-wrap to preserve newlines
  return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;
};

/**
 * Render a variable segment with appropriate styling
 */
const VariableSpan: React.FC<{
  value: string;
  resolved: boolean;
  theme: Theme;
}> = ({ value, resolved, theme }) => (
  <span
    style={{
      color: resolved ? theme.colors.accent : theme.colors.textMuted,
      fontWeight: resolved ? 600 : 400,
      fontStyle: resolved ? 'normal' : 'italic',
    }}
  >
    {value}
  </span>
);

/**
 * TemplateText renders ParsedTemplate segments with markdown support
 * for text and styled highlighting for variables.
 */
export const TemplateText: React.FC<TemplateTextProps> = ({ segments, className }) => {
  const { theme } = useTheme();

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <TextSegment key={index} text={segment.value} theme={theme} />;
        }
        // Variable segment
        return (
          <VariableSpan
            key={index}
            value={segment.value}
            resolved={segment.resolved ?? false}
            theme={theme}
          />
        );
      })}
    </span>
  );
};

export default TemplateText;
