import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { Theme } from '@principal-ade/industry-theme';

interface ErrorStateContentProps {
  theme: Theme;
  error: string;
  onRetry: () => void;
}

/**
 * Error state component for Visual Validation Graph Panel
 * Displays when configuration loading fails
 */
export const ErrorStateContent: React.FC<ErrorStateContentProps> = ({ theme, error, onRetry }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: theme.space[4],
      backgroundColor: theme.colors.background,
      color: theme.colors.error,
      fontFamily: theme.fonts.body,
      textAlign: 'center'
    }}>
      <AlertCircle size={48} />
      <h3 style={{ marginTop: theme.space[3], marginBottom: theme.space[2] }}>
        Configuration Error
      </h3>
      <p style={{ color: theme.colors.textMuted, marginTop: theme.space[2], maxWidth: '400px' }}>
        {error}
      </p>
      <button
        onClick={onRetry}
        style={{
          marginTop: theme.space[4],
          padding: `${theme.space[2]} ${theme.space[4]}`,
          backgroundColor: theme.colors.primary,
          color: theme.colors.background,
          border: 'none',
          borderRadius: theme.radii[1],
          cursor: 'pointer',
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes[2]
        }}
      >
        Retry
      </button>
    </div>
  );
};
