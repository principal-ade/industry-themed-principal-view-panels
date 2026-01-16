import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas, GraphEvent, NarrativeTemplate } from '@principal-ai/principal-view-core/browser';
import { renderNarrative } from '@principal-ai/principal-view-core/browser';
import { TestEventPanel } from './execution-viewer/TestEventPanel';
import { convertToOtelEvents } from './execution-viewer/narrative-converter';
import {
  ExecutionLoader,
  type ExecutionFile,
  type CanvasFile,
  type ExecutionMetadata,
  type ExecutionArtifact,
  type ExecutionSpan,
} from './execution-viewer/ExecutionLoader';
import { Loader, ChevronDown, Activity, Play, Pause, RotateCcw, Grid3x3, HelpCircle, X, FileText, Database, ArrowLeft } from 'lucide-react';
import { ExecutionStats } from './execution-viewer/ExecutionStats';
import { mapEventToNodeId, buildEventToNodeMap } from './execution-viewer/EventNodeMapper';
import { NarrativeLoader, type NarrativeFile } from './execution-viewer/NarrativeLoader';
import { NarrativeExplainerPanel } from './NarrativeExplainerPanel';
import { NarrativeTemplatePanel } from './execution-viewer/NarrativeTemplatePanel';

// View mode type (should be exported from react package in future versions)
export type ViewMode = 'raw' | 'narrative';

interface ExecutionPanelState {
  canvas: ExtendedCanvas | null;
  execution: ExecutionArtifact | null;
  metadata: ExecutionMetadata | null;
  loading: boolean;
  error: string | null;
  availableCanvases: CanvasFile[];
  selectedCanvasId: string | null;
  availableExecutions: ExecutionFile[];
  selectedExecutionId: string | null;
  showCanvasSelector: boolean;
  showNarrativeSelector: boolean;
  showExecutionSelector: boolean;
  showHelpModal: boolean;
  selectedNarrativeId: string | null;
  isPlaying: boolean;
  currentSpanIndex: number;
  currentEventIndex: number;
  highlightedNodeId: string | null;
  showGrid: boolean;
  narrativeTemplate: NarrativeTemplate | null;
  availableNarratives: NarrativeFile[];
  viewMode: ViewMode;
  executionScenarioMap: Record<string, string>; // Maps execution ID to scenario ID
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
    availableCanvases: [],
    selectedCanvasId: null,
    availableExecutions: [],
    selectedExecutionId: null,
    showCanvasSelector: false,
    showNarrativeSelector: false,
    showExecutionSelector: false,
    showHelpModal: false,
    selectedNarrativeId: null,
    isPlaying: false,
    currentSpanIndex: 0,
    currentEventIndex: 0,
    highlightedNodeId: null,
    showGrid: true,
    narrativeTemplate: null,
    availableNarratives: [],
    viewMode: 'raw',
    executionScenarioMap: {},
  });

  // Store context and actions in refs
  const contextRef = useRef(context);
  const actionsRef = useRef(actions);
  const eventsRef = useRef(events);
  contextRef.current = context;
  actionsRef.current = actions;
  eventsRef.current = events;

  // Track selected canvas ID in ref
  const selectedCanvasIdRef = useRef<string | null>(null);
  selectedCanvasIdRef.current = state.selectedCanvasId;

  // Playback timer ref
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Event-to-node mapping cache
  const eventNodeMapRef = useRef<Map<string, string>>(new Map());

  const loadCanvas = useCallback(async (canvasId?: string) => {
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
          availableCanvases: [],
          selectedCanvasId: null,
          availableExecutions: [],
          selectedExecutionId: null,
        }));
        return;
      }

      // Find all available canvas, execution, and narrative files
      const availableCanvases = await ExecutionLoader.findCanvasFiles(fileTreeData.allFiles);
      const executionFiles = await ExecutionLoader.findExecutionFiles(fileTreeData.allFiles);
      const availableNarratives = NarrativeLoader.findNarrativeFiles(fileTreeData.allFiles);

      if (availableCanvases.length === 0) {
        setState(prev => ({
          ...prev,
          canvas: null,
          execution: null,
          metadata: null,
          loading: false,
          error: null,
          availableCanvases: [],
          selectedCanvasId: null,
          availableExecutions: [],
          selectedExecutionId: null,
          narrativeTemplate: null,
          availableNarratives: [],
        }));
        return;
      }

      // Select canvas
      let selectedCanvas: CanvasFile;
      if (canvasId) {
        const found = availableCanvases.find((c: CanvasFile) => c.id === canvasId);
        if (!found) {
          throw new Error(`Canvas with ID '${canvasId}' not found`);
        }
        selectedCanvas = found;
      } else if (selectedCanvasIdRef.current) {
        const found = availableCanvases.find((c: CanvasFile) => c.id === selectedCanvasIdRef.current);
        selectedCanvas = found || availableCanvases[0];
      } else {
        selectedCanvas = availableCanvases[0];
      }

      const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
      if (!readFile) {
        throw new Error('readFile action not available');
      }

      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      // Load canvas file
      const fullCanvasPath = `${repositoryPath}/${selectedCanvas.path}`;
      const canvasContent = await readFile(fullCanvasPath);

      if (!canvasContent || typeof canvasContent !== 'string') {
        throw new Error('Failed to read canvas file');
      }

      const canvas = JSON.parse(canvasContent) as ExtendedCanvas;

      // Build event-to-node mapping for this canvas
      eventNodeMapRef.current = buildEventToNodeMap(canvas);

      // Try to find matching narrative template for this canvas
      let narrativeTemplate: NarrativeTemplate | null = null;
      let selectedNarrativeId: string | null = null;

      // First, try to find a narrative that matches the canvas
      const matchingNarrative = availableNarratives.find(
        n => n.canvasPath === selectedCanvas.path ||
             n.path.replace(/\.narrative\.json$/, '.otel.canvas') === selectedCanvas.path
      );

      // If no match, just select the first available narrative
      const narrativeToLoad = matchingNarrative || (availableNarratives.length > 0 ? availableNarratives[0] : null);

      if (narrativeToLoad) {
        try {
          const fullNarrativePath = `${repositoryPath}/${narrativeToLoad.path}`;
          const narrativeContent = await readFile(fullNarrativePath);
          if (narrativeContent && typeof narrativeContent === 'string') {
            narrativeTemplate = NarrativeLoader.parseNarrativeTemplate(narrativeContent);
            selectedNarrativeId = narrativeToLoad.id;
          }
        } catch (error) {
          console.warn('[ExecutionViewer] Failed to load narrative template:', error);
        }
      }

      // Evaluate executions against narrative template to build scenario mapping
      const executionScenarioMap: Record<string, string> = {};
      if (narrativeTemplate && executionFiles.length > 0) {
        for (const execFile of executionFiles) {
          try {
            const fullExecPath = `${repositoryPath}/${execFile.path}`;
            const execContent = await readFile(fullExecPath);
            if (execContent && typeof execContent === 'string') {
              const execution = JSON.parse(execContent) as ExecutionArtifact;
              const spans = ExecutionLoader.getSpans(execution);
              if (spans.length > 0) {
                // For single-span executions, use the first span
                const events = convertToOtelEvents(spans[0] as any, []);
                const result = renderNarrative(narrativeTemplate, events);
                executionScenarioMap[execFile.id] = result.scenarioId;
              }
            }
          } catch (error) {
            console.warn(`[ExecutionViewer] Failed to evaluate execution ${execFile.id}:`, error);
          }
        }
      }

      setState(prev => ({
        ...prev,
        canvas,
        execution: null,
        metadata: null,
        loading: false,
        error: null,
        availableCanvases,
        selectedCanvasId: selectedCanvas.id,
        availableExecutions: executionFiles,
        selectedExecutionId: null,
        currentSpanIndex: 0,
        currentEventIndex: 0,
        highlightedNodeId: null,
        narrativeTemplate,
        availableNarratives,
        selectedNarrativeId,
        viewMode: narrativeTemplate ? 'narrative' : 'raw',
        executionScenarioMap,
      }));
    } catch (error) {
      console.error('[ExecutionViewer] Error loading canvas:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  // Initial load and fileTree changes
  useEffect(() => {
    loadCanvas();
  }, [loadCanvas]);

  // Listen for custom events to switch canvases
  useEffect(() => {
    if (!events) return;

    const handleEvent = (event: any) => {
      if (event.type === 'custom' && event.action === 'selectCanvas') {
        const canvasId = event.payload?.canvasId;
        if (canvasId) {
          loadCanvas(canvasId);
        }
      }
    };

    events.on('custom', handleEvent);
    return () => {
      events.off('custom', handleEvent);
    };
  }, [events, loadCanvas]);

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

  const handleToggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const handleExecutionSelect = useCallback(async (executionId: string) => {
    try {
      const ctx = contextRef.current;
      const acts = actionsRef.current;
      const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;

      if (!readFile || !repositoryPath) {
        console.error('[ExecutionViewer] Cannot load execution: missing readFile or repositoryPath');
        return;
      }

      const execution = state.availableExecutions.find(e => e.id === executionId);
      if (!execution) {
        console.error('[ExecutionViewer] Execution not found:', executionId);
        return;
      }

      const fullExecutionPath = `${repositoryPath}/${execution.path}`;
      const executionContent = await readFile(fullExecutionPath);
      if (executionContent && typeof executionContent === 'string') {
        const executionArtifact = ExecutionLoader.parseExecutionArtifact(executionContent);
        const metadata = ExecutionLoader.getExecutionMetadata(executionArtifact);
        setState(prev => ({
          ...prev,
          selectedExecutionId: executionId,
          execution: executionArtifact,
          metadata,
          isPlaying: false,
          currentSpanIndex: 0,
          currentEventIndex: 0,
          highlightedNodeId: null,
          viewMode: 'narrative',
        }));
      }
    } catch (error) {
      console.error('[ExecutionViewer] Failed to load execution:', error);
    }
  }, [state.availableExecutions]);

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

  // Render empty state only if no canvas files found
  if (!state.loading && state.availableCanvases.length === 0) {
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
            No Canvas Files Found
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

  const selectedCanvas = state.availableCanvases.find(
    c => c.id === state.selectedCanvasId
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
        {/* Execution Selector - Only show if executions are available */}
        {state.availableCanvases.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setState(prev => ({ ...prev, showCanvasSelector: !prev.showCanvasSelector }))}
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
              <span>{selectedCanvas?.name || 'Select Canvas'}</span>
              <ChevronDown size={16} />
            </button>

            {/* Execution Selector Dropdown */}
            {state.showCanvasSelector && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 999,
                  }}
                  onClick={() => setState(prev => ({ ...prev, showCanvasSelector: false }))}
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
                  {state.availableCanvases.map((canvas) => (
                    <button
                      key={canvas.id}
                      onClick={() => {
                        loadCanvas(canvas.id);
                        setState(prev => ({ ...prev, showCanvasSelector: false }));
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: canvas.id === state.selectedCanvasId ? '#3b82f6' : 'transparent',
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
                      <span style={{ flex: 1 }}>{canvas.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Narrative Selector - Only show if narratives are available */}
        {state.availableNarratives.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setState(prev => ({ ...prev, showNarrativeSelector: !prev.showNarrativeSelector }))}
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
              <FileText size={16} />
              <span>
                {state.selectedNarrativeId
                  ? state.availableNarratives.find(n => n.id === state.selectedNarrativeId)?.name || 'Select Narrative'
                  : 'Select Narrative'}
              </span>
              <ChevronDown size={16} />
            </button>

            {/* Narrative Selector Dropdown */}
            {state.showNarrativeSelector && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 999,
                  }}
                  onClick={() => setState(prev => ({ ...prev, showNarrativeSelector: false }))}
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
                  {state.availableNarratives.map((narrative) => (
                    <button
                      key={narrative.id}
                      onClick={async () => {
                        // Load the selected narrative template
                        try {
                          const ctx = contextRef.current;
                          const acts = actionsRef.current;
                          const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
                          const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;

                          if (readFile && repositoryPath) {
                            const fullNarrativePath = `${repositoryPath}/${narrative.path}`;
                            const narrativeContent = await readFile(fullNarrativePath);
                            if (narrativeContent && typeof narrativeContent === 'string') {
                              const narrativeTemplate = NarrativeLoader.parseNarrativeTemplate(narrativeContent);
                              setState(prev => ({
                                ...prev,
                                selectedNarrativeId: narrative.id,
                                narrativeTemplate,
                                showNarrativeSelector: false,
                                viewMode: 'narrative',
                              }));
                            }
                          }
                        } catch (error) {
                          console.error('[ExecutionViewer] Failed to load narrative:', error);
                          setState(prev => ({ ...prev, showNarrativeSelector: false }));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: narrative.id === state.selectedNarrativeId ? '#3b82f6' : 'transparent',
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
                      <FileText size={14} />
                      <span style={{ flex: 1 }}>{narrative.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Execution Selector - Only show if executions are available */}
        {state.availableExecutions.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setState(prev => ({ ...prev, showExecutionSelector: !prev.showExecutionSelector }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: state.selectedExecutionId ? '#10b981' : '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              <Database size={16} />
              <span>
                {state.selectedExecutionId
                  ? state.availableExecutions.find(e => e.id === state.selectedExecutionId)?.name || 'Select Execution'
                  : `Execution (${state.availableExecutions.length})`}
              </span>
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
                  {/* Option to deselect */}
                  <button
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        selectedExecutionId: null,
                        execution: null,
                        metadata: null,
                        showExecutionSelector: false,
                        isPlaying: false,
                        currentSpanIndex: 0,
                        currentEventIndex: 0,
                        highlightedNodeId: null,
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: !state.selectedExecutionId ? '#3b82f6' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #3a3a3a',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontStyle: 'italic',
                    }}
                  >
                    None (show scenario mapping)
                  </button>
                  {state.availableExecutions.map((execution) => (
                    <button
                      key={execution.id}
                      onClick={async () => {
                        // Load the selected execution
                        try {
                          const ctx = contextRef.current;
                          const acts = actionsRef.current;
                          const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
                          const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;

                          if (readFile && repositoryPath) {
                            const fullExecutionPath = `${repositoryPath}/${execution.path}`;
                            const executionContent = await readFile(fullExecutionPath);
                            if (executionContent && typeof executionContent === 'string') {
                              const executionArtifact = ExecutionLoader.parseExecutionArtifact(executionContent);
                              const metadata = ExecutionLoader.getExecutionMetadata(executionArtifact);
                              setState(prev => ({
                                ...prev,
                                selectedExecutionId: execution.id,
                                execution: executionArtifact,
                                metadata,
                                showExecutionSelector: false,
                                isPlaying: false,
                                currentSpanIndex: 0,
                                currentEventIndex: 0,
                                highlightedNodeId: null,
                              }));
                            }
                          }
                        } catch (error) {
                          console.error('[ExecutionViewer] Failed to load execution:', error);
                          setState(prev => ({ ...prev, showExecutionSelector: false }));
                        }
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
                      <Database size={14} />
                      <span style={{ flex: 1 }}>{execution.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Back Button - Show when execution is selected and narratives are available */}
        {state.execution && state.narrativeTemplate && state.availableExecutions.length > 0 && (
          <button
            onClick={() => {
              setState(prev => ({
                ...prev,
                selectedExecutionId: null,
                execution: null,
                metadata: null,
                isPlaying: false,
                currentSpanIndex: 0,
                currentEventIndex: 0,
                highlightedNodeId: null,
              }));
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
            title="Back to scenario mapping"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Grid Toggle */}
        <button
          onClick={handleToggleGrid}
          style={{
            padding: '6px 10px',
            background: state.showGrid ? '#3b82f6' : '#2a2a2a',
            border: '1px solid #3a3a3a',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title={state.showGrid ? 'Hide Grid' : 'Show Grid'}
        >
          <Grid3x3 size={14} />
        </button>

        {/* Playback Controls - Only show if execution is available */}
        {state.execution && (
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
        )}

        {/* Help Button - Show when canvas-only (no execution/narratives) */}
        {state.canvas && !state.execution && state.availableNarratives.length === 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => setState(prev => ({ ...prev, showHelpModal: true }))}
              style={{
                padding: '6px 12px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                fontSize: '13px',
              }}
              title="Learn about narratives and OTEL testing"
            >
              <HelpCircle size={16} />
              Learn About Narratives
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Event Timeline or Narrative Template or Missing Execution Info - Only show if we have execution OR narratives */}
        {(state.execution || state.availableNarratives.length > 0) && (
          <div style={{ flex: '0 0 40%', borderRight: '1px solid #333', overflow: 'hidden' }}>
            {state.execution ? (
              <TestEventPanel
                spans={ExecutionLoader.getSpans(state.execution) as any}
                currentSpanIndex={state.currentSpanIndex}
                currentEventIndex={state.currentEventIndex}
                onSpanIndexChange={handleSpanIndexChange}
                narrativeTemplate={state.narrativeTemplate ?? undefined}
                viewMode={state.viewMode}
                onViewModeChange={handleViewModeChange}
                showNavigation={ExecutionLoader.getSpans(state.execution).length > 1}
                showTestName={false}
              />
            ) : state.narrativeTemplate ? (
              <NarrativeTemplatePanel
                narrativeTemplate={state.narrativeTemplate}
                availableExecutions={state.availableExecutions}
                executionScenarioMap={state.executionScenarioMap}
                onExecutionSelect={handleExecutionSelect}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  background: '#0a0a0a',
                  padding: '20px',
                }}
              >
                <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                  <Activity size={48} style={{ margin: '0 auto 20px', opacity: 0.3, color: '#666' }} />
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 600, color: '#fff' }}>
                    No Execution Artifacts Found
                  </h3>
                  <p style={{ margin: '0 0 16px 0', color: '#999', lineHeight: 1.5, fontSize: '13px' }}>
                    The canvas is displayed, but execution data is missing. Run tests to generate execution artifacts.
                  </p>
                  <div
                    style={{
                      background: '#1e1e1e',
                      padding: '10px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      textAlign: 'left',
                      color: '#d4d4d4',
                      marginBottom: '12px',
                    }}
                  >
                    <div># Save execution artifacts to:</div>
                    <div style={{ marginTop: '4px' }}>__executions__/*.spans.json</div>
                    <div>packages/*/__executions__/*.spans.json</div>
                  </div>
                  <p style={{ margin: 0, color: '#666', fontSize: '11px', fontStyle: 'italic' }}>
                    Tip: Use exportExecutionArtifact() in your tests
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Canvas View - Full width when canvas-only, 60% when execution/narratives exist */}
        {state.canvas ? (
          <div
            style={{
              flex: state.execution || state.availableNarratives.length > 0 ? '0 0 60%' : '1 1 100%',
              position: 'relative',
            }}
          >
            <GraphRenderer
              canvas={state.canvas}
              showMinimap={false}
              showControls={true}
              showBackground={state.showGrid}
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
              <p>Canvas not loaded</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                {selectedCanvas?.path || 'No canvas selected'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {state.metadata && <ExecutionStats metadata={state.metadata} />}

      {/* Help Modal */}
      {state.showHelpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setState(prev => ({ ...prev, showHelpModal: false }))}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '1200px',
              maxHeight: '90vh',
              width: '100%',
              backgroundColor: theme.colors.background,
              borderRadius: '8px',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setState(prev => ({ ...prev, showHelpModal: false }))}
              style={{
                position: 'sticky',
                top: '16px',
                right: '16px',
                float: 'right',
                zIndex: 10,
                padding: '8px',
                background: '#2a2a2a',
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
              <X size={20} />
            </button>
            <NarrativeExplainerPanel />
          </div>
        </div>
      )}
    </div>
  );
};
