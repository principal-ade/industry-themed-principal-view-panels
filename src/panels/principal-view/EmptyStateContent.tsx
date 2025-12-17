import React, { useState, useCallback } from 'react';
import { Network, Copy, Check, ExternalLink } from 'lucide-react';
import type { Theme } from '@principal-ade/industry-theme';

interface EmptyStateContentProps {
  theme: Theme;
}

/**
 * Empty state component for Principal View Graph Panel
 * Displays when no .principal-views/ folder with configuration files is found in the project
 */
export const EmptyStateContent: React.FC<EmptyStateContentProps> = ({ theme }) => {
  const [copied, setCopied] = useState(false);

  const cliCommand = 'npx @principal-ai/principal-view-cli init';
  const npmPackageUrl = 'https://www.npmjs.com/package/@principal-ai/principal-view-cli';

  const handleCopyCommand = useCallback(() => {
    navigator.clipboard.writeText(cliCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [cliCommand]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: theme.space[4],
      backgroundColor: theme.colors.background,
      color: theme.colors.textMuted,
      fontFamily: theme.fonts.body,
      textAlign: 'center',
    }}>
      <Network size={56} style={{ marginBottom: theme.space[3], opacity: 0.3 }} />
      <span style={{
        fontSize: theme.fontSizes[3],
        fontWeight: theme.fontWeights.medium,
        marginBottom: theme.space[2],
        color: theme.colors.text
      }}>
        No configurations found
      </span>
      <span style={{
        fontSize: theme.fontSizes[2],
        marginBottom: theme.space[3],
        maxWidth: '80%',
        lineHeight: 1.5
      }}>
        Initialize Principal View to create architecture diagrams that connect to your codebase.
      </span>

      {/* Copy command section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.space[2],
        width: '90%',
        maxWidth: '400px',
      }}>
        <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
          Run this command to get started:
        </span>
        <button
          onClick={handleCopyCommand}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.space[2],
            padding: `${theme.space[2]}px ${theme.space[3]}px`,
            backgroundColor: theme.colors.backgroundSecondary,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii[2],
            cursor: 'pointer',
            fontFamily: theme.fonts.monospace,
            fontSize: theme.fontSizes[1],
            textAlign: 'left',
            transition: 'all 0.15s',
          }}
        >
          <code style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cliCommand}
          </code>
          {copied ? (
            <Check size={16} style={{ color: theme.colors.success || '#22c55e', flexShrink: 0 }} />
          ) : (
            <Copy size={16} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
          )}
        </button>
        <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
          This creates a .principal-views/ folder with a starter canvas file.
        </span>

        {/* Learn more link */}
        <a
          href={npmPackageUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.space[1],
            marginTop: theme.space[2],
            fontSize: theme.fontSizes[1],
            color: theme.colors.primary,
            textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
        >
          Learn more on npm
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
