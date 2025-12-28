import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas } from '@principal-ai/principal-view-core';
import { Loader, ChevronDown, Activity, Server, Clock } from 'lucide-react';
import { TraceLoader, type TraceFile, type TraceMetadata } from './trace-viewer/TraceLoader';
import { TraceStats } from './trace-viewer/TraceStats';

interface TracePanelState {
  canvas: ExtendedCanvas | null;
  metadata: TraceMetadata | null;
  loading: boolean;
  error: string | null;
  availableTraces: TraceFile[];
  selectedTraceId: string | null;
  showTraceSelector: boolean;
}

/**
 * Trace Viewer Panel
 *
 * Displays OpenTelemetry traces captured from test runs as canvas diagrams.
 * Reads trace files from __traces__/ directories in the repository.
 */
export const TraceViewerPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();

  const [state, setState] = useState<TracePanelState>({
    canvas: null,
    metadata: null,
    loading: true,
    error: null,
    availableTraces: [],
    selectedTraceId: null,
    showTraceSelector: false,
  });

  // Store context and actions in refs to avoid recreation of callbacks
  const contextRef = useRef(context);
  const actionsRef = useRef(actions);
  const eventsRef = useRef(events);
  contextRef.current = context;
  actionsRef.current = actions;
  eventsRef.current = events;

  // Track selected trace ID in ref
  const selectedTraceIdRef = useRef<string | null>(null);
  selectedTraceIdRef.current = state.selectedTraceId;

  const loadTrace = useCallback(async (traceId?: string) => {
    setState(prev => ({ ...prev, loading: prev.canvas === null, error: null }));

    try {
      const ctx = contextRef.current;
      const acts = actionsRef.current;

      // Check if fileTree slice is available
      if (!ctx.hasSlice('fileTree')) {
        throw new Error('File tree data not available');
      }

      if (ctx.isSliceLoading('fileTree')) {
        return;
      }

      const fileTreeSlice = ctx.getSlice('fileTree');
      const fileTreeData = fileTreeSlice?.data as {
        allFiles?: Array<{ path?: string; relativePath?: string; name?: string }>;
      } | null;

      if (!fileTreeData?.allFiles) {
        setState(prev => ({
          ...prev,
          canvas: null,
          metadata: null,
          loading: false,
          error: null,
          availableTraces: [],
          selectedTraceId: null,
        }));
        return;
      }

      const availableTraces = TraceLoader.findTraceFiles(fileTreeData.allFiles);

      if (availableTraces.length === 0) {
        setState(prev => ({
          ...prev,
          canvas: null,
          metadata: null,
          loading: false,
          error: null,
          availableTraces: [],
          selectedTraceId: null,
        }));
        return;
      }

      // Select trace
      let selectedTrace: TraceFile;
      if (traceId) {
        const found = availableTraces.find(t => t.id === traceId);
        if (!found) {
          throw new Error(`Trace with ID '${traceId}' not found`);
        }
        selectedTrace = found;
      } else if (selectedTraceIdRef.current) {
        const found = availableTraces.find(t => t.id === selectedTraceIdRef.current);
        selectedTrace = found || availableTraces[0];
      } else {
        selectedTrace = availableTraces[0];
      }

      const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
      if (!readFile) {
        throw new Error('readFile action not available');
      }

      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      const fullPath = `${repositoryPath}/${selectedTrace.path}`;
      const traceContent = await readFile(fullPath);

      if (!traceContent || typeof traceContent !== 'string') {
        throw new Error('Failed to read trace file');
      }

      const canvas = TraceLoader.parseTraceCanvas(traceContent);
      const metadata = TraceLoader.getTraceMetadata(canvas);

      setState(prev => ({
        ...prev,
        canvas,
        metadata,
        loading: false,
        error: null,
        availableTraces,
        selectedTraceId: selectedTrace.id,
      }));
    } catch (error) {
      console.error('[TraceViewer] Error loading trace:', error);
      setState(prev => ({
        ...prev,
        canvas: null,
        metadata: null,
        loading: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  // Toggle trace selector dropdown
  const toggleTraceSelector = useCallback(() => {
    setState(prev => ({ ...prev, showTraceSelector: !prev.showTraceSelector }));
  }, []);

  // Handle trace selection
  const handleTraceSelect = useCallback(
    (traceId: string) => {
      setState(prev => ({ ...prev, showTraceSelector: false }));
      loadTrace(traceId);
    },
    [loadTrace]
  );

  // Load trace on mount and when fileTree slice finishes loading
  const fileTreeLoading =
    context.hasSlice('fileTree') && context.isSliceLoading('fileTree');
  const fileTreeLoadingRef = useRef(fileTreeLoading);

  useEffect(() => {
    loadTrace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-load when fileTree transitions from loading to loaded
  useEffect(() => {
    const wasLoading = fileTreeLoadingRef.current;
    fileTreeLoadingRef.current = fileTreeLoading;

    if (wasLoading && !fileTreeLoading) {
      loadTrace();
    }
  }, [fileTreeLoading, loadTrace]);

  // Subscribe to data refresh events
  useEffect(() => {
    const unsubscribe = eventsRef.current.on('data:refresh', () => {
      loadTrace();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to trace:load events from other panels (e.g., TelemetryCoveragePanel)
  useEffect(() => {
    const unsubscribe = eventsRef.current.on('trace:load', (event) => {
      const payload = event.payload as {
        traceId?: string;
        tracePath?: string;
        packagePath?: string;
      };

      if (payload.traceId) {
        // Direct trace ID provided
        loadTrace(payload.traceId);
      } else if (payload.tracePath) {
        // Convert trace path to trace ID
        // Path format: packages/core/__traces__/test-run.canvas.json or __traces__/test-run.canvas.json
        const pathMatch = payload.tracePath.match(
          /(?:packages\/([^/]+)\/)?__traces__\/(.+)\.canvas\.json$/
        );
        if (pathMatch) {
          const packageName = pathMatch[1];
          const baseName = pathMatch[2];
          const traceId = packageName ? `${packageName}-${baseName}` : baseName;
          loadTrace(traceId);
        }
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading state
  if (state.loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.body,
        }}
      >
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: theme.space[2] }}>Loading traces...</span>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.body,
          gap: theme.space[3],
          padding: theme.space[4],
        }}
      >
        <div style={{ color: theme.colors.error || '#ef4444' }}>
          Error: {state.error}
        </div>
        <button
          onClick={() => loadTrace()}
          style={{
            padding: `${theme.space[2]}px ${theme.space[3]}px`,
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: theme.radii?.[1] || 4,
            cursor: 'pointer',
            fontFamily: theme.fonts.body,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state - no traces found
  if (!state.canvas) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.body,
          gap: theme.space[3],
          padding: theme.space[4],
          textAlign: 'center',
        }}
      >
        <Activity size={48} style={{ opacity: 0.5 }} />
        <div>
          <h3
            style={{
              margin: 0,
              marginBottom: theme.space[2],
              color: theme.colors.text,
              fontSize: theme.fontSizes[3],
            }}
          >
            No Traces Found
          </h3>
          <p style={{ margin: 0, maxWidth: 400, lineHeight: 1.5 }}>
            No trace canvas files were found in this repository.
          </p>
          <p
            style={{
              margin: 0,
              marginTop: theme.space[2],
              maxWidth: 400,
              lineHeight: 1.5,
              fontSize: theme.fontSizes[1],
            }}
          >
            Traces should be saved to <code>__traces__/*.canvas.json</code> or{' '}
            <code>packages/*/__traces__/*.canvas.json</code>
          </p>
        </div>
      </div>
    );
  }

  // Get the selected trace for display
  const selectedTrace = state.availableTraces.find(
    t => t.id === state.selectedTraceId
  );

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 39,
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${theme.space[3]}px`,
          boxSizing: 'content-box',
        }}
      >
        <Activity
          size={18}
          style={{ color: theme.colors.primary, marginRight: theme.space[2] }}
        />

        <h2
          style={{
            margin: 0,
            fontSize: theme.fontSizes[3],
            fontWeight: (theme.fontWeights?.medium as number) || 500,
            color: theme.colors.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
            flex: 1,
          }}
        >
          {state.metadata?.name || 'Trace Viewer'}
        </h2>

        {/* Package badge if from monorepo */}
        {selectedTrace?.packageName && (
          <span
            style={{
              marginLeft: theme.space[2],
              padding: `2px ${theme.space[2]}px`,
              fontSize: theme.fontSizes[0],
              color: theme.colors.textMuted,
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: theme.radii?.[1] || 4,
              flexShrink: 0,
            }}
          >
            {selectedTrace.packageName}
          </span>
        )}

        {/* Trace selector dropdown */}
        {state.availableTraces.length > 1 && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={toggleTraceSelector}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[1],
                padding: `${theme.space[1]}px ${theme.space[2]}px`,
                fontSize: theme.fontSizes[1],
                fontFamily: theme.fonts.body,
                color: theme.colors.text,
                backgroundColor: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii?.[1] || 4,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span>
                {state.availableTraces.length} trace
                {state.availableTraces.length !== 1 ? 's' : ''}
              </span>
              <ChevronDown
                size={14}
                style={{
                  transform: state.showTraceSelector
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                  transition: 'transform 0.15s',
                }}
              />
            </button>

            {/* Dropdown menu */}
            {state.showTraceSelector && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: theme.space[1],
                  minWidth: 250,
                  maxHeight: 300,
                  overflow: 'auto',
                  backgroundColor: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radii?.[2] || 6,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 100,
                }}
              >
                {state.availableTraces.map(trace => {
                  const isSelected = trace.id === state.selectedTraceId;
                  return (
                    <button
                      key={trace.id}
                      onClick={() => handleTraceSelect(trace.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 2,
                        width: '100%',
                        padding: `${theme.space[2]}px ${theme.space[3]}px`,
                        backgroundColor: isSelected
                          ? `${theme.colors.primary}15`
                          : 'transparent',
                        color: isSelected
                          ? theme.colors.primary
                          : theme.colors.text,
                        border: 'none',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        fontFamily: theme.fonts.body,
                      }}
                    >
                      <span
                        style={{
                          fontSize: theme.fontSizes[1],
                          fontWeight: isSelected ? 500 : 400,
                        }}
                      >
                        {trace.name}
                      </span>
                      {trace.packageName && (
                        <span
                          style={{
                            fontSize: theme.fontSizes[0],
                            color: theme.colors.textMuted,
                          }}
                        >
                          {trace.packageName}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Graph content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <GraphRenderer
          canvas={state.canvas}
          showMinimap={false}
          showControls={true}
          showBackground={true}
          editable={false}
        />
      </div>

      {/* Footer with stats */}
      {state.metadata && <TraceStats metadata={state.metadata} theme={theme} />}
    </div>
  );
};
