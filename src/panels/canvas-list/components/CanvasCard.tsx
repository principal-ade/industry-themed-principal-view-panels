import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { Folder } from 'lucide-react';
import type { CanvasFile } from '../../execution-viewer/ExecutionLoader';

interface CanvasCardProps {
  canvas: CanvasFile;
  onClick: (canvas: CanvasFile) => void;
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

      {/* Source badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Folder size={14} color={theme.colors.textSecondary} />
        <span
          style={{
            fontSize: theme.fontSizes[0],
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}
        >
          {canvas.source === 'folder' ? '.principal-views' : 'standalone'}
        </span>
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
