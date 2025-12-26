import React from 'react';
import type { TraceMetadata } from './TraceLoader';

interface TraceStatsProps {
  metadata: TraceMetadata;
  theme: {
    colors: Record<string, string>;
    fonts: Record<string, string>;
    fontSizes: (string | number)[];
    space: number[];
  };
}

/**
 * Displays trace statistics in a compact footer bar
 */
export const TraceStats: React.FC<TraceStatsProps> = ({ metadata, theme }) => {
  // Format export timestamp
  const formattedTime = metadata.exportedAt
    ? formatExportTime(metadata.exportedAt)
    : null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.space[4],
        padding: `${theme.space[2]}px ${theme.space[3]}px`,
        fontSize: theme.fontSizes[1],
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.body,
        borderTop: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background,
        flexShrink: 0,
      }}
    >
      <StatItem
        label="Spans"
        value={metadata.spanCount.toString()}
        theme={theme}
      />

      {metadata.serviceCount > 0 && (
        <StatItem
          label={metadata.serviceCount === 1 ? 'Service' : 'Services'}
          value={metadata.serviceCount.toString()}
          theme={theme}
        />
      )}

      {formattedTime && (
        <StatItem label="Exported" value={formattedTime} theme={theme} />
      )}
    </div>
  );
};

interface StatItemProps {
  label: string;
  value: string;
  theme: {
    colors: Record<string, string>;
    fontSizes: (string | number)[];
    space: number[];
    fontWeights?: Record<string, string | number>;
  };
}

const StatItem: React.FC<StatItemProps> = ({ label, value, theme }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[1] }}>
    <span
      style={{
        fontWeight: (theme.fontWeights?.medium as number) || 500,
        color: theme.colors.text,
      }}
    >
      {value}
    </span>
    <span>{label}</span>
  </div>
);

/**
 * Format ISO timestamp to a readable format
 */
function formatExportTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // If less than 24 hours ago, show relative time
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

      if (hours > 0) {
        return `${hours}h ${minutes}m ago`;
      }
      if (minutes > 0) {
        return `${minutes}m ago`;
      }
      return 'just now';
    }

    // Otherwise show date and time
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
