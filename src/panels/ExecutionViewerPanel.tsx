import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer, TestEventPanel } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas, GraphEvent } from '@principal-ai/principal-view-core';
import { Loader, ChevronDown, Activity, Play, Pause, RotateCcw } from 'lucide-react';
import {
  ExecutionLoader,
  type ExecutionFile,
  type ExecutionMetadata,
  type ExecutionArtifact,
  type ExecutionSpan,
} from './execution-viewer/ExecutionLoader';
import { ExecutionStats } from './execution-viewer/ExecutionStats';
import { mapEventToNodeId, buildEventToNodeMap } from './execution-viewer/EventNodeMapper';

interface ExecutionPanelState {
  canvas: ExtendedCanvas | null;
  execution: ExecutionArtifact | null;
  metadata: ExecutionMetadata | null;
  loading: boolean;
  error: string | null;
  availableExecutions: ExecutionFile[];
  selectedExecutionId: string | null;
  showExecutionSelector: boolean;
  isPlaying: boolean;
  currentSpanIndex: number;
  currentEventIndex: number;
  highlightedNodeId: string | null;
}

/**
 * Execution Viewer Panel
 *
 * Displays execution artifacts (test runs, traces) overlaid on their corresponding canvas diagrams.
 * Reads execution files from __executions__/ directories and automatically links them to canvas files.
 */
export const ExecutionViewerPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();

  const [state, setState] = useState<ExecutionPanelState>({
    canvas: null,
    execution: null,
    metadata: null,
    loading: true,
    error: null,
    availableExecutions: [],
    selectedExecutionId: null,
    showExecutionSelector: false,
    isPlaying: false,
    currentSpanIndex: 0,
    currentEventIndex: 0,
    highlightedNodeId: null,
  });

  // Store context and actions in refs
  const contextRef = useRef(context);
  const actionsRef = useRef(actions);
  const eventsRef = useRef(events);
  contextRef.current = context;
  actionsRef.current = actions;
  eventsRef.current = events;

  // Track selected execution ID in ref
  const selectedExecutionIdRef = useRef<string | null>(null);
  selectedExecutionIdRef.current = state.selectedExecutionId;

  // Playback timer ref
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Event-to-node mapping cache
  const eventNodeMapRef = useRef<Map<string, string>>(new Map());

  const loadExecution = useCallback(async (executionId?: string) => {
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
          execution: null,
          metadata: null,
          loading: false,
          error: null,
          availableExecutions: [],
          selectedExecutionId: null,
        }));
        return;
      }

      const availableExecutions = ExecutionLoader.findExecutionFiles(fileTreeData.allFiles);

      if (availableExecutions.length === 0) {
        setState(prev => ({
          ...prev,
          canvas: null,
          execution: null,
          metadata: null,
          loading: false,
          error: null,
          availableExecutions: [],
          selectedExecutionId: null,
        }));
        return;
      }

      // Select execution
      let selectedExecution: ExecutionFile;
      if (executionId) {
        const found = availableExecutions.find(e => e.id === executionId);
        if (!found) {
          throw new Error(`Execution with ID '${executionId}' not found`);
        }
        selectedExecution = found;
      } else if (selectedExecutionIdRef.current) {
        const found = availableExecutions.find(e => e.id === selectedExecutionIdRef.current);
        selectedExecution = found || availableExecutions[0];
      } else {
        selectedExecution = availableExecutions[0];
      }

      const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
      if (!readFile) {
        throw new Error('readFile action not available');
      }

      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      // Load execution artifact
      const fullExecutionPath = `${repositoryPath}/${selectedExecution.path}`;
      const executionContent = await readFile(fullExecutionPath);

      if (!executionContent || typeof executionContent !== 'string') {
        throw new Error('Failed to read execution file');
      }

      const execution = ExecutionLoader.parseExecutionArtifact(executionContent);
      const metadata = ExecutionLoader.getExecutionMetadata(execution);

      // Load matching canvas
      const canvasPath = ExecutionLoader.findCanvasForExecution(
        selectedExecution.path,
        fileTreeData.allFiles
      );

      let canvas: ExtendedCanvas | null = null;
      if (canvasPath) {
        try {
          const fullCanvasPath = `${repositoryPath}/${canvasPath}`;
          const canvasContent = await readFile(fullCanvasPath);
          if (canvasContent && typeof canvasContent === 'string') {
            canvas = JSON.parse(canvasContent) as ExtendedCanvas;
          }
        } catch (error) {
          console.warn('[ExecutionViewer] Failed to load canvas:', error);
        }
      }

      // Build event-to-node mapping for this canvas
      if (canvas) {
        eventNodeMapRef.current = buildEventToNodeMap(canvas);
      } else {
        eventNodeMapRef.current = new Map();
      }

      setState(prev => ({
        ...prev,
        canvas,
        execution,
        metadata,
        loading: false,
        error: null,
        availableExecutions,
        selectedExecutionId: selectedExecution.id,
        currentSpanIndex: 0,
        currentEventIndex: 0,
        highlightedNodeId: null,
      }));
    } catch (error) {
      console.error('[ExecutionViewer] Error loading execution:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  // Initial load and fileTree changes
  useEffect(() => {
    loadExecution();
  }, [loadExecution]);

  // Listen for custom events to switch executions
  useEffect(() => {
    if (!events) return;

    const handleEvent = (event: any) => {
      if (event.type === 'custom' && event.action === 'selectExecution') {
        const executionId = event.payload?.executionId;
        if (executionId) {
          loadExecution(executionId);
        }
      }
    };

    events.on('custom', handleEvent);
    return () => {
      events.off('custom', handleEvent);
    };
  }, [events, loadExecution]);

  // Playback control
  const handlePlayPause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const handleReset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentSpanIndex: 0,
      currentEventIndex: 0,
      highlightedNodeId: null,
    }));
  }, []);

  const handleSpanIndexChange = useCallback((newSpanIndex: number) => {
    setState(prev => {
      const spans = prev.execution ? ExecutionLoader.getSpans(prev.execution) : [];
      const newSpan = spans[newSpanIndex];
      const newEvent = newSpan?.events?.[0]; // Start at first event of new span
      const highlightedNodeId = newEvent ? mapEventToNodeId(newEvent, prev.canvas) : null;

      return {
        ...prev,
        currentSpanIndex: newSpanIndex,
        currentEventIndex: 0,
        highlightedNodeId,
      };
    });
  }, []);

  // Playback effect
  useEffect(() => {
    if (!state.isPlaying || !state.execution) {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      return;
    }

    const spans = ExecutionLoader.getSpans(state.execution);
    const totalEvents = spans.reduce((sum, span) => sum + (span.events?.length || 0), 0);

    playbackTimerRef.current = setInterval(() => {
      setState(prev => {
        const spans = prev.execution ? ExecutionLoader.getSpans(prev.execution) : [];
        if (spans.length === 0) return { ...prev, isPlaying: false };

        const currentSpan = spans[prev.currentSpanIndex];
        const spanEventCount = currentSpan?.events?.length || 0;

        let newSpanIndex = prev.currentSpanIndex;
        let newEventIndex = prev.currentEventIndex;

        // Move to next event
        if (prev.currentEventIndex < spanEventCount - 1) {
          newEventIndex = prev.currentEventIndex + 1;
        }
        // Move to next span
        else if (prev.currentSpanIndex < spans.length - 1) {
          newSpanIndex = prev.currentSpanIndex + 1;
          newEventIndex = 0;
        }
        // Reached end, stop playback
        else {
          return { ...prev, isPlaying: false };
        }

        // Get the new current event and map to node
        const newSpan = spans[newSpanIndex];
        const newEvent = newSpan?.events?.[newEventIndex];
        const highlightedNodeId = newEvent
          ? mapEventToNodeId(newEvent, prev.canvas)
          : null;

        return {
          ...prev,
          currentSpanIndex: newSpanIndex,
          currentEventIndex: newEventIndex,
          highlightedNodeId,
        };
      });
    }, 800); // 800ms per event

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [state.isPlaying, state.execution]);

  // Render empty state
  if (!state.loading && state.availableExecutions.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: theme.colors.background,
          color: theme.colors.text,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '600px', padding: '20px' }}>
          <Activity size={48} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 600 }}>
            No Execution Artifacts Found
          </h2>
          <p style={{ margin: '0 0 20px 0', color: theme.colors.textSecondary, lineHeight: 1.5 }}>
            Execution artifacts should be saved to <code>__executions__/*.spans.json</code> or{' '}
            <code>packages/*/__executions__/*.spans.json</code>
          </p>
          <div
            style={{
              background: '#1e1e1e',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              textAlign: 'left',
              color: '#d4d4d4',
            }}
          >
            <div># Export execution data from tests</div>
            <div>exportExecutionArtifact(canvas, spans, {'{'}</div>
            <div>&nbsp;&nbsp;outputPath: '__executions__/my-test.spans.json'</div>
            <div>{'}'});</div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: theme.colors.background,
          color: theme.colors.error,
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Error Loading Execution</h2>
          <p style={{ margin: 0, fontSize: '14px' }}>{state.error}</p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (state.loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: theme.colors.background,
          color: theme.colors.text,
        }}
      >
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  const selectedExecution = state.availableExecutions.find(
    e => e.id === state.selectedExecutionId
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: '#1a1a1a',
          gap: '12px',
        }}
      >
        {/* Execution Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setState(prev => ({ ...prev, showExecutionSelector: !prev.showExecutionSelector }))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: '#2a2a2a',
              border: '1px solid #3a3a3a',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            <Activity size={16} />
            <span>{selectedExecution?.name || 'Select Execution'}</span>
            {selectedExecution?.packageName && (
              <span
                style={{
                  padding: '2px 6px',
                  background: '#3b82f6',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {selectedExecution.packageName}
              </span>
            )}
            <ChevronDown size={16} />
          </button>

          {/* Execution Selector Dropdown */}
          {state.showExecutionSelector && (
            <>
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 999,
                }}
                onClick={() => setState(prev => ({ ...prev, showExecutionSelector: false }))}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  minWidth: '300px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  background: '#2a2a2a',
                  border: '1px solid #3a3a3a',
                  borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 1000,
                }}
              >
                {state.availableExecutions.map((execution) => (
                  <button
                    key={execution.id}
                    onClick={() => {
                      loadExecution(execution.id);
                      setState(prev => ({ ...prev, showExecutionSelector: false }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: execution.id === state.selectedExecutionId ? '#3b82f6' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #3a3a3a',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Activity size={14} />
                    <span style={{ flex: 1 }}>{execution.name}</span>
                    {execution.packageName && (
                      <span
                        style={{
                          padding: '2px 6px',
                          background: execution.id === state.selectedExecutionId ? '#2563eb' : '#3b82f6',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        {execution.packageName}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>
            {state.metadata?.name || 'Execution Viewer'}
          </div>
          {selectedExecution && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
              {selectedExecution.path}
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '6px 10px',
              background: '#2a2a2a',
              border: '1px solid #3a3a3a',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={handlePlayPause}
            style={{
              padding: '6px 10px',
              background: state.isPlaying ? '#ef4444' : '#10b981',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            {state.isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {state.isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Canvas View */}
        {state.canvas ? (
          <div style={{ flex: '0 0 60%', position: 'relative' }}>
            <GraphRenderer
              canvas={state.canvas}
              showMinimap={true}
              showControls={true}
              showBackground={true}
              backgroundVariant="lines"
              showTooltips={true}
              highlightedNodeId={state.highlightedNodeId}
            />
          </div>
        ) : (
          <div
            style={{
              flex: '0 0 60%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0a0a0a',
              color: '#666',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p>No matching canvas found</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                Expected: {selectedExecution?.canvasBasename}.otel.canvas
              </p>
            </div>
          </div>
        )}

        {/* Event Timeline */}
        <div style={{ flex: '0 0 40%', borderLeft: '1px solid #333', overflow: 'hidden' }}>
          <TestEventPanel
            spans={state.execution ? ExecutionLoader.getSpans(state.execution) as any : []}
            currentSpanIndex={state.currentSpanIndex}
            currentEventIndex={state.currentEventIndex}
            onSpanIndexChange={handleSpanIndexChange}
          />
        </div>
      </div>

      {/* Footer Stats */}
      {state.metadata && <ExecutionStats metadata={state.metadata} />}
    </div>
  );
};
