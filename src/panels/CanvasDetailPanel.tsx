import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas, NarrativeTemplate } from '@principal-ai/principal-view-core/browser';
import { renderNarrative } from '@principal-ai/principal-view-core/browser';
import { TestEventPanel } from './execution-viewer/TestEventPanel';
import { convertToOtelEvents, type TestSpan } from './execution-viewer/narrative-converter';
import {
  ExecutionLoader,
  type ExecutionFile,
  type ExecutionMetadata,
  type ExecutionArtifact,
} from './execution-viewer/ExecutionLoader';
import { Loader, ChevronDown, Activity, Grid3x3, HelpCircle, X, ArrowLeft, Pencil } from 'lucide-react';
import { ExecutionStats } from './execution-viewer/ExecutionStats';
import { mapEventToNodeId, buildEventToNodeMap } from './execution-viewer/EventNodeMapper';
import { NarrativeLoader, type NarrativeFile } from './execution-viewer/NarrativeLoader';
import { NarrativeExplainerPanel } from './NarrativeExplainerPanel';
import { NarrativeTemplatePanel } from './execution-viewer/NarrativeTemplatePanel';

// View mode type (should be exported from react package in future versions)
export type ViewMode = 'raw' | 'narrative';

/**
 * Props for CanvasDetailPanel
 */
export interface CanvasDetailPanelProps extends PanelComponentProps {
  /**
   * Optional canvas ID to display.
   * If provided, this takes precedence over events.
   * This allows the host to control panel state via props instead of events.
   */
  selectedCanvasId?: string | null;

  /**
   * Optional canvas path to load.
   * If provided along with selectedCanvasId, the panel will load this canvas immediately.
   */
  canvasPath?: string | null;

  /**
   * Optional canvas name for display.
   */
  canvasName?: string | null;
}

interface CanvasDetailPanelState {
  canvas: ExtendedCanvas | null;
  execution: ExecutionArtifact | null;
  metadata: ExecutionMetadata | null;
  loading: boolean;
  error: string | null;
  selectedCanvasId: string | null;
  canvasName: string | null;
  availableExecutions: ExecutionFile[];
  selectedExecutionId: string | null;
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
 * Canvas Detail Panel
 *
 * Displays canvas details with execution artifacts, narrative templates, and playback controls.
 * Can be controlled via props (selectedCanvasId) or events.
 */
export const CanvasDetailPanel: React.FC<CanvasDetailPanelProps> = ({
  context,
  actions,
  events,
  selectedCanvasId: selectedCanvasIdProp,
  canvasPath: canvasPathProp,
  canvasName: canvasNameProp,
}) => {
  const { theme } = useTheme();

  const [state, setState] = useState<CanvasDetailPanelState>({
    canvas: null,
    execution: null,
    metadata: null,
    loading: false,
    error: null,
    selectedCanvasId: null,
    canvasName: null,
    availableExecutions: [],
    selectedExecutionId: null,
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

  // Playback timer ref
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Event-to-node mapping cache
  const eventNodeMapRef = useRef<Map<string, string>>(new Map());

  const loadCanvas = useCallback(async (canvasId: string, canvasPath: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

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
          selectedCanvasId: null,
          canvasName: null,
          availableExecutions: [],
          selectedExecutionId: null,
        }));
        return;
      }

      // Find execution and narrative files
      const executionFiles = await ExecutionLoader.findExecutionFiles(fileTreeData.allFiles);
      const availableNarratives = NarrativeLoader.findNarrativeFiles(fileTreeData.allFiles);

      const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
      if (!readFile) {
        throw new Error('readFile action not available');
      }

      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      // Load canvas file
      const fullCanvasPath = `${repositoryPath}/${canvasPath}`;
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
        n => n.canvasPath === canvasPath ||
             n.path.replace(/\.narrative\.json$/, '.otel.canvas') === canvasPath
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
                const events = convertToOtelEvents(spans[0] as TestSpan, []);
                const result = renderNarrative(narrativeTemplate, events);
                executionScenarioMap[execFile.id] = result.scenarioId;
              }
            }
          } catch (error) {
            console.warn(`[ExecutionViewer] Failed to evaluate execution ${execFile.id}:`, error);
          }
        }
      }

      // Extract canvas name from ID (convert kebab-case to Title Case)
      const canvasName = canvasId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      setState(prev => ({
        ...prev,
        canvas,
        execution: null,
        metadata: null,
        loading: false,
        error: null,
        selectedCanvasId: canvasId,
        canvasName,
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

  // Prop-controlled mode: Load canvas when props change
  useEffect(() => {
    if (selectedCanvasIdProp && canvasPathProp) {
      // eslint-disable-next-line no-console
      console.log('[CanvasDetailPanel] Loading canvas from props:', selectedCanvasIdProp, canvasPathProp);
      loadCanvas(selectedCanvasIdProp, canvasPathProp);

      // Update canvas name if provided
      if (canvasNameProp) {
        setState(prev => ({ ...prev, canvasName: canvasNameProp }));
      }
    }
  }, [selectedCanvasIdProp, canvasPathProp, canvasNameProp, loadCanvas]);

  // Listen for custom events to switch canvases (event-driven mode)
  useEffect(() => {
    // If controlled by props, don't listen to events
    if (selectedCanvasIdProp && canvasPathProp) {
      return;
    }

    if (!events) return;

    interface CustomEvent {
      type: string;
      payload?: {
        action?: string;
        canvasId?: string;
        canvas?: {
          path: string;
        };
      };
    }

    const handleEvent = (event: CustomEvent) => {
      if (event.type === 'custom') {
        const payload = event.payload;
        if (payload?.action === 'selectCanvas' && payload?.canvasId && payload?.canvas) {
          loadCanvas(payload.canvasId, payload.canvas.path);
        }
      }
    };

    events.on('custom', handleEvent);
    return () => {
      events.off('custom', handleEvent);
    };
  }, [events, loadCanvas, selectedCanvasIdProp, canvasPathProp]);

  // Playback control
  const handleToggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const handleOpenInEditor = useCallback(() => {
    if (!state.canvas || !state.selectedCanvasId || !canvasPathProp) {
      console.warn('[CanvasDetailPanel] Cannot open in editor: missing canvas path prop');
      return;
    }

    // Emit the same event that CanvasListPanel uses to open in editor
    if (eventsRef.current) {
      eventsRef.current.emit({
        type: 'custom',
        source: 'canvas-detail-panel',
        timestamp: Date.now(),
        payload: {
          action: 'selectCanvas',
          canvasId: state.selectedCanvasId,
          canvas: {
            id: state.selectedCanvasId,
            path: canvasPathProp,
            name: state.canvasName || state.selectedCanvasId,
          },
        },
      });
    }
  }, [state.canvas, state.selectedCanvasId, state.canvasName, canvasPathProp]);

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

  // Render empty state when no canvas is loaded
  if (!state.loading && !state.canvas) {
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
            No Canvas Selected
          </h2>
          <p style={{ margin: '0 0 20px 0', color: theme.colors.textSecondary, lineHeight: 1.5 }}>
            Select a canvas from the Canvas List panel to view execution artifacts and narratives.
          </p>
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
        {/* Canvas Title - Show the currently loaded canvas */}
        {state.canvasName && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
              {state.canvasName}
            </span>
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
                      }}
                    >
                      {narrative.name}
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
                      }}
                    >
                      {execution.name}
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

        {/* Open in Editor Button */}
        <button
          onClick={handleOpenInEditor}
          disabled={!canvasPathProp}
          style={{
            padding: '6px 12px',
            background: '#2a2a2a',
            border: '1px solid #3a3a3a',
            borderRadius: '4px',
            color: '#fff',
            cursor: canvasPathProp ? 'pointer' : 'not-allowed',
            opacity: canvasPathProp ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
          }}
          title={canvasPathProp ? 'Open in Canvas Editor' : 'Canvas path not available'}
        >
          <Pencil size={14} />
          <span>Edit</span>
        </button>

        {/* Playback controls removed - all events now display by default */}

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
                spans={ExecutionLoader.getSpans(state.execution) as TestSpan[]}
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
                    <div style={{ marginTop: '4px' }}>__executions__/*.otel.json</div>
                    <div>packages/*/__executions__/*.otel.json</div>
                    <div style={{ color: '#888', fontSize: '10px', marginTop: '4px' }}># Also supports: *.spans.json, *.execution.json, *.events.json</div>
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
                {state.canvasName || 'No canvas selected'}
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
