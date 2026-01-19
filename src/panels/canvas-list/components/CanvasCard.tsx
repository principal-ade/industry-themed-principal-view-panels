import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { Package } from 'lucide-react';
import type { DiscoveredCanvas } from '@principal-ai/principal-view-core/browser';

interface CanvasCardProps {
  canvas: DiscoveredCanvas;
  onClick: (canvas: DiscoveredCanvas) => void;
  isSelected?: boolean;
}

/**
 * CanvasCard - Displays a canvas file in a card format
 */
export const CanvasCard: React.FC<CanvasCardProps> = ({
  canvas,
  onClick,
  isSelected = false,
}) => {
  const { theme } = useTheme();

  return (
    <div
      onClick={() => onClick(canvas)}
      style={{
        padding: '16px',
        background: isSelected ? `${theme.colors.primary}15` : theme.colors.backgroundSecondary,
        border: `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
        borderRadius: theme.radii[2],
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxSizing: 'border-box',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = theme.colors.primary;
          e.currentTarget.style.background = `${theme.colors.backgroundSecondary}cc`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = theme.colors.border;
          e.currentTarget.style.background = theme.colors.backgroundSecondary;
        }
      }}
    >
      {/* Header with name */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3
          style={{
            margin: 0,
            fontSize: theme.fontSizes[2],
            color: isSelected ? theme.colors.primary : theme.colors.text,
            fontWeight: 600,
            flex: 1,
          }}
        >
          {canvas.name}
        </h3>
      </div>

      {/* Scope and package badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {canvas.scope === 'package' && canvas.packageName ? (
          <>
            <Package size={14} color={theme.colors.primary} />
            <span
              style={{
                fontSize: theme.fontSizes[0],
                color: theme.colors.primary,
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              {canvas.packageName}
            </span>
          </>
        ) : null}
        {canvas.type === 'otel' && (
          <>
            {canvas.scope === 'package' && canvas.packageName && (
              <span style={{ color: theme.colors.textSecondary }}>•</span>
            )}
            <span
              style={{
                fontSize: theme.fontSizes[0],
                color: theme.colors.success || '#22c55e',
                fontWeight: 600,
              }}
            >
              OTEL
            </span>
          </>
        )}
      </div>

      {/* File path */}
      <div
        style={{
          fontSize: theme.fontSizes[0],
          color: theme.colors.textSecondary,
          fontFamily: 'monospace',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={canvas.path}
      >
        {canvas.path}
      </div>
    </div>
  );
};
