import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { FileCode } from 'lucide-react';

interface SourceFileListProps {
  sources: string[];
  onSourceClick?: (source: string) => void;
}

/**
 * Displays a list of source file paths with clickable links
 */
export const SourceFileList: React.FC<SourceFileListProps> = ({ sources, onSourceClick }) => {
  const { theme } = useTheme();

  if (sources.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: '6px',
        fontSize: theme.fontSizes[1],
        color: theme.colors.textTertiary || theme.colors.textSecondary,
        fontFamily: 'monospace',
        opacity: 0.8,
      }}
    >
      {sources.map(source => (
        <div
          key={source}
          onClick={(e) => {
            e.stopPropagation();
            if (onSourceClick) {
              const cleanPath = source.replace(/\*/g, '');
              onSourceClick(cleanPath);
            }
          }}
          style={{
            marginTop: '2px',
            padding: '4px 0',
            cursor: onSourceClick ? 'pointer' : 'default',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (onSourceClick) {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.backgroundColor = theme.colors.backgroundTertiary || '#2a2a2a';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.8';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <FileCode size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          {source}
        </div>
      ))}
    </div>
  );
};
