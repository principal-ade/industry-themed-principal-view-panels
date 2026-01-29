import React from 'react';
import type { ExecutionMetadata } from './executionUtils';

interface ExecutionStatsProps {
  metadata: ExecutionMetadata;
}

/**
 * Footer component displaying execution artifact metadata and statistics
 */
export const ExecutionStats: React.FC<ExecutionStatsProps> = ({ metadata }) => {
  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'Unknown';
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'success':
      case 'OK':
        return '#10b981'; // green
      case 'error':
      case 'ERROR':
      case 'FAILED':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusIcon = (status?: string): string => {
    switch (status) {
      case 'success':
      case 'OK':
        return '✓';
      case 'error':
      case 'ERROR':
      case 'FAILED':
        return '✗';
      default:
        return '○';
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: '1px solid #333',
        background: '#1a1a1a',
        display: 'flex',
        gap: '24px',
        fontSize: '12px',
        color: '#999',
        fontFamily: 'monospace',
      }}
    >
      {/* Status */}
      {metadata.status && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              color: getStatusColor(metadata.status),
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {getStatusIcon(metadata.status)}
          </span>
          <span style={{ color: '#ccc' }}>Status:</span>
          <span style={{ color: getStatusColor(metadata.status) }}>
            {metadata.status.toUpperCase()}
          </span>
        </div>
      )}

      {/* Span Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: '#ccc' }}>Spans:</span>
        <span style={{ color: '#3b82f6' }}>{metadata.spanCount}</span>
      </div>

      {/* Event Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: '#ccc' }}>Events:</span>
        <span style={{ color: '#8b5cf6' }}>{metadata.eventCount}</span>
      </div>

      {/* Framework */}
      {metadata.framework && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#ccc' }}>Framework:</span>
          <span style={{ color: '#f59e0b' }}>{metadata.framework}</span>
        </div>
      )}

      {/* Source */}
      {metadata.source && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#ccc' }}>Source:</span>
          <span style={{ color: '#10b981' }}>{metadata.source}</span>
        </div>
      )}

      {/* Export Time */}
      {metadata.exportedAt && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: 'auto',
          }}
        >
          <span style={{ color: '#ccc' }}>Exported:</span>
          <span style={{ color: '#6b7280' }}>{formatDate(metadata.exportedAt)}</span>
        </div>
      )}
    </div>
  );
};
