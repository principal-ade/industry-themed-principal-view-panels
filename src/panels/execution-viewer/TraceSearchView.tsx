import React, { useState, useMemo } from 'react';
import { Search, X, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Theme } from '@principal-ade/industry-theme';

interface TraceSearchViewProps {
  traces: Array<{ id: string; name: string; path: string }>;
  selectedScenarioId?: string | null;
  executionScenarioMap?: Record<string, string>;
  selectedTraceId?: string | null;
  onTraceSelect: (traceId: string) => void;
  onClose: () => void;
  theme: Theme;
}

/**
 * TraceSearchView - Overlay component for searching and filtering test traces
 *
 * Features:
 * - Automatically filters by selected scenario (if provided)
 * - Generic text search across all trace attributes
 * - Clean list display with test file names
 * - Visual indicators for scenario matches
 */
export const TraceSearchView: React.FC<TraceSearchViewProps> = ({
  traces,
  selectedScenarioId,
  executionScenarioMap = {},
  selectedTraceId,
  onTraceSelect,
  onClose,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter traces by selected scenario first
  const scenarioFilteredTraces = useMemo(() => {
    if (!selectedScenarioId) return traces;

    return traces.filter(trace =>
      executionScenarioMap[trace.id] === selectedScenarioId
    );
  }, [traces, selectedScenarioId, executionScenarioMap]);

  // Then apply text search across all attributes
  const filteredTraces = useMemo(() => {
    if (!searchQuery.trim()) {
      return scenarioFilteredTraces;
    }

    const query = searchQuery.toLowerCase().trim();

    return scenarioFilteredTraces.filter(trace => {
      // Build a searchable text string from all trace attributes
      const searchableText = [
        trace.id,
        trace.name,
        trace.path,
        // Scenario ID (if matched)
        executionScenarioMap[trace.id] || '',
      ].join(' ').toLowerCase();

      return searchableText.includes(query);
    });
  }, [scenarioFilteredTraces, searchQuery, executionScenarioMap]);

  // Extract test file name from path for display
  const getTestFileName = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1] || path;
  };

  // Format scenario ID to display name
  const formatScenarioName = (scenarioId: string): string => {
    return scenarioId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        zIndex: 100,
        background: theme.colors.background,
        borderLeft: `1px solid ${theme.colors.border}`,
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: theme.colors.backgroundSecondary,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <h2 style={{
          margin: 0,
          fontSize: theme.fontSizes[3],
          fontWeight: 600,
          flex: 1,
        }}>
          Test Traces
          {selectedScenarioId && (
            <span style={{
              marginLeft: '8px',
              fontSize: theme.fontSizes[1],
              fontWeight: 400,
              color: theme.colors.textSecondary,
            }}>
              • {formatScenarioName(selectedScenarioId)}
            </span>
          )}
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: '8px',
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '4px',
            color: theme.colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '16px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color={theme.colors.textSecondary}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search traces by name, path, or scenario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 40px 10px 40px',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              background: theme.colors.background,
              color: theme.colors.text,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.textSecondary,
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Trace List */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '8px',
        }}
      >
        {filteredTraces.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: theme.colors.textSecondary,
              textAlign: 'center',
              padding: '20px',
            }}
          >
            {searchQuery ? (
              <>
                <AlertCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: theme.fontSizes[2] }}>
                  No traces match your search
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: theme.fontSizes[1], opacity: 0.7 }}>
                  Try different keywords
                </p>
              </>
            ) : selectedScenarioId ? (
              <>
                <AlertCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: theme.fontSizes[2] }}>
                  No test traces for this scenario
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: theme.fontSizes[1], opacity: 0.7 }}>
                  Run tests to generate trace data
                </p>
              </>
            ) : (
              <>
                <FileCode size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: theme.fontSizes[2] }}>
                  No test traces found
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: theme.fontSizes[1], opacity: 0.7 }}>
                  Run tests to generate execution artifacts
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredTraces.map((trace) => {
              const scenarioId = executionScenarioMap[trace.id];
              const isSelected = trace.id === selectedTraceId;

              return (
                <div
                  key={trace.id}
                  onClick={() => {
                    onTraceSelect(trace.id);
                  }}
                  style={{
                    padding: '12px',
                    background: isSelected
                      ? `${theme.colors.primary}15`
                      : theme.colors.backgroundSecondary,
                    border: `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = theme.colors.background;
                      e.currentTarget.style.borderColor = theme.colors.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = theme.colors.backgroundSecondary;
                      e.currentTarget.style.borderColor = theme.colors.border;
                    }
                  }}
                >
                  {/* Test file name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={16} style={{ flexShrink: 0, color: theme.colors.textSecondary }} />
                    <span
                      style={{
                        fontSize: theme.fontSizes[2],
                        fontWeight: 500,
                        color: theme.colors.text,
                        fontFamily: theme.fonts.monospace,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getTestFileName(trace.path)}
                    </span>
                    {scenarioId && (
                      <CheckCircle2
                        size={14}
                        style={{ flexShrink: 0, color: '#10b981' }}
                      />
                    )}
                  </div>

                  {/* File path */}
                  <div
                    style={{
                      fontSize: theme.fontSizes[0],
                      color: theme.colors.textMuted,
                      fontFamily: theme.fonts.monospace,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {trace.path}
                  </div>

                  {/* Scenario badge */}
                  {scenarioId && !selectedScenarioId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          fontSize: theme.fontSizes[0],
                          background: `${theme.colors.primary}15`,
                          color: theme.colors.primary,
                          border: `1px solid ${theme.colors.primary}40`,
                          borderRadius: '4px',
                          fontWeight: 500,
                        }}
                      >
                        {formatScenarioName(scenarioId)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer - Results count */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${theme.colors.border}`,
          background: theme.colors.backgroundSecondary,
          fontSize: theme.fontSizes[1],
          color: theme.colors.textSecondary,
        }}
      >
        {filteredTraces.length === 0 ? (
          'No traces found'
        ) : (
          <>
            {filteredTraces.length} {filteredTraces.length === 1 ? 'trace' : 'traces'}
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedScenarioId && scenarioFilteredTraces.length !== traces.length &&
              ` (${scenarioFilteredTraces.length} in scenario)`
            }
          </>
        )}
      </div>
    </div>
  );
};
