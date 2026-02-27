import React, { useMemo } from 'react';
import { JSONTree } from 'react-json-tree';
import type { Theme } from '@principal-ade/industry-theme';

export interface JsonViewerProps {
  /** The JSON data to display */
  data: object | unknown[];
  /** Theme from industry-theme */
  theme: Theme;
  /** Initial expand depth (default: 2) */
  initialExpandDepth?: number;
  /** Whether to hide the root node */
  hideRoot?: boolean;
  /** Custom className for additional styling */
  className?: string;
}

/**
 * JsonViewer - Themed JSON tree viewer component
 *
 * Wraps react-json-tree with industry-theme integration.
 * Supports light/dark themes and customizable expand depth.
 */
export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  theme,
  initialExpandDepth = 2,
  hideRoot = false,
  className,
}) => {
  // Determine if we're in dark mode based on background color luminance
  const isDarkMode = useMemo(() => {
    const bg = theme.colors.background;
    if (bg.startsWith('#')) {
      const hex = bg.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
    return true;
  }, [theme.colors.background]);

  // Create base16 theme from industry-theme colors
  const jsonTreeTheme = useMemo(() => {
    return {
      scheme: 'industry',
      author: 'principal-ai',
      base00: theme.colors.background, // Background
      base01: theme.colors.backgroundSecondary, // Lighter background
      base02: theme.colors.border, // Selection background
      base03: theme.colors.textMuted, // Comments, invisibles
      base04: theme.colors.textSecondary, // Dark foreground
      base05: theme.colors.text, // Default foreground
      base06: theme.colors.text, // Light foreground
      base07: theme.colors.text, // Light background
      base08: theme.colors.error, // Variables, red
      base09: theme.colors.warning, // Numbers, orange
      base0A: theme.colors.warning, // Classes, yellow
      base0B: theme.colors.success, // Strings, green
      base0C: theme.colors.info || '#56b6c2', // Support, cyan
      base0D: theme.colors.primary, // Functions, blue
      base0E: theme.colors.primary, // Keywords, purple
      base0F: theme.colors.error, // Deprecated, brown
    };
  }, [theme]);

  // Determine if a node should be expanded based on depth
  const shouldExpandNodeInitially = useMemo(() => {
    return (_keyPath: readonly (string | number)[], _data: unknown, level: number) => {
      return level < initialExpandDepth;
    };
  }, [initialExpandDepth]);

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      fontFamily: theme.fonts.monospace,
      fontSize: theme.fontSizes[2],
      lineHeight: 1.6,
      padding: theme.space[3],
      background: theme.colors.background,
      color: theme.colors.text,
      overflow: 'auto',
      height: '100%',
      width: '100%',
      boxSizing: 'border-box',
    }),
    [theme]
  );

  return (
    <div style={containerStyle} className={className}>
      <JSONTree
        data={data}
        theme={jsonTreeTheme}
        invertTheme={!isDarkMode}
        hideRoot={hideRoot}
        shouldExpandNodeInitially={shouldExpandNodeInitially}
      />
    </div>
  );
};
