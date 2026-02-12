import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme, type Theme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas, ExtendedCanvasNode, PVNodeExtension, WorkflowTemplate, WorkflowScenario, OtelAttributes } from '@principal-ai/principal-view-core';
import { renderWorkflow, type ExecutionData, type DiscoveredTestTrace, type DiscoveredWorkflow } from '@principal-ai/principal-view-core';
import type { FileTree, FileInfo } from '@principal-ai/repository-abstraction';
import { AnimatedResizableLayout } from '@principal-ade/panels';
import { ScenarioDetailsPanel } from './execution-viewer/ScenarioDetailsPanel';
import { convertToOtelEvents, type TestSpan } from './execution-viewer/workflow-converter';
import { Activity, X, Pencil, FileText, CheckCircle2, List, Radar } from 'lucide-react';
import { ExecutionStats } from './execution-viewer/ExecutionStats';
import { TraceSearchView } from './execution-viewer/TraceSearchView';
import { LiveTraceSearchView } from './execution-viewer/LiveTraceSearchView';
import type { TraceInfo } from '../types/otel';
import type { OtelSpanData, OtelKeyValue } from '@principal-ai/principal-view-core';
import { mapEventToNodeId, buildEventToNodeMap } from './execution-viewer/EventNodeMapper';
import { WorkflowExplainerPanel } from './WorkflowExplainerPanel';
import { WorkflowTemplatePanel } from './execution-viewer/WorkflowTemplatePanel';
import { useCanvasData } from './canvas-list/hooks/useCanvasData';
import { parseExecutionArtifact, getSpans, getExecutionMetadata, type ExecutionMetadata } from './execution-viewer/executionUtils';

// View mode type (should be exported from react package in future versions)
export type ViewMode = 'raw' | 'narrative' | 'summary';

/**
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC<{ theme: Theme }> = ({ theme }) => {
  const pulseAnimation = {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: theme.colors.background,
          color: theme.colors.text,
        }}
      >
        {/* Header Skeleton */}
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
          {/* Canvas title placeholder */}
          <div
            style={{
              width: '150px',
              height: '20px',
              background: '#2a2a2a',
              borderRadius: '4px',
              ...pulseAnimation,
            }}
          />
          {/* Selector placeholders */}
          <div
            style={{
              width: '180px',
              height: '32px',
              background: '#2a2a2a',
              borderRadius: '4px',
              ...pulseAnimation,
            }}
          />
          <div
            style={{
              width: '180px',
              height: '32px',
              background: '#2a2a2a',
              borderRadius: '4px',
              ...pulseAnimation,
            }}
          />
          {/* Spacer */}
          <div style={{ flex: 1 }} />
          {/* Button placeholders */}
          <div
            style={{
              width: '40px',
              height: '32px',
              background: '#2a2a2a',
              borderRadius: '4px',
              ...pulseAnimation,
            }}
          />
          <div
            style={{
              width: '80px',
              height: '32px',
              background: '#2a2a2a',
              borderRadius: '4px',
              ...pulseAnimation,
            }}
          />
        </div>

        {/* Main Content Skeleton */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left sidebar skeleton (40%) */}
          <div
            style={{
              flex: '0 0 40%',
              borderRight: '1px solid #333',
              background: '#0a0a0a',
              padding: '16px',
            }}
          >
            {/* Timeline header placeholder */}
            <div
              style={{
                width: '120px',
                height: '24px',
                background: '#2a2a2a',
                borderRadius: '4px',
                marginBottom: '16px',
                ...pulseAnimation,
              }}
            />
            {/* Event item placeholders */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  marginBottom: '12px',
                  padding: '12px',
                  background: '#1a1a1a',
                  borderRadius: '4px',
                  border: '1px solid #2a2a2a',
                }}
              >
                <div
                  style={{
                    width: '80%',
                    height: '16px',
                    background: '#2a2a2a',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    ...pulseAnimation,
                  }}
                />
                <div
                  style={{
                    width: '60%',
                    height: '14px',
                    background: '#2a2a2a',
                    borderRadius: '4px',
                    ...pulseAnimation,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Canvas area skeleton (60%) */}
          <div
            style={{
              flex: '0 0 60%',
              background: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Graph placeholder */}
            <div
              style={{
                width: '80%',
                height: '80%',
                background: '#1a1a1a',
                borderRadius: '8px',
                border: '1px solid #2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...pulseAnimation,
              }}
            >
              <div
                style={{
                  width: '60%',
                  height: '60%',
                  border: '2px solid #2a2a2a',
                  borderRadius: '50%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Props for WorkflowScenariosPanel
 */
export interface WorkflowScenariosPanelProps extends PanelComponentProps {
  /**
   * Canvas ID to display (optional - can be controlled via props or events).
   */
  selectedCanvasId?: string | null;

  /**
   * Path to the .canvas file (optional).
   */
  canvasPath?: string | null;

  /**
   * Canvas name for display (optional).
   */
  canvasName?: string | null;

  /**
   * Canvas file info with metadata (optional).
   * Used for detecting file changes and auto-reloading.
   */
  canvasFileInfo?: FileInfo | null;

  /**
   * Workflow ID to display (optional - but recommended for proper workflow display).
   */
  selectedWorkflowId?: string | null;

  /**
   * Path to the workflow file (optional).
   */
  workflowPath?: string | null;

  /**
   * Workflow template with scenarios and steps (optional - but panel requires this to display workflows).
   */
  workflowTemplate?: WorkflowTemplate | null;

  /**
   * Workflow file info with metadata (optional).
   * Used for detecting workflow file changes and auto-reloading.
   */
  workflowFileInfo?: FileInfo | null;
}

interface WorkflowScenariosPanelState {
  canvas: ExtendedCanvas | null;
  execution: ExecutionData | null;
  metadata: ExecutionMetadata | null;
  loading: boolean;
  error: string | null;
  selectedCanvasId: string | null;
  canvasName: string | null;
  availableExecutions: DiscoveredTestTrace[];
  selectedExecutionId: string | null;
  showHelpModal: boolean;
  selectedWorkflowId: string | null;
  isPlaying: boolean;
  currentSpanIndex: number;
  currentEventIndex: number;
  highlightedNodeId: string | null;
  workflowTemplate: WorkflowTemplate | null;
  availableNarratives: DiscoveredWorkflow[];
  viewMode: ViewMode;
  executionScenarioMap: Record<string, string>; // Maps execution ID to scenario ID
  hoveredExecutionId: string | null;
  hoveredExecution: ExecutionData | null;
  hoveredScenarioEventNames: string[] | null;
  selectedScenarioId: string | null;
  selectedScenario: WorkflowScenario | null;
  showTraceSearch: boolean;
  showLiveTraceSearch: boolean;
}

/**
 * Workflow Scenarios Panel
 *
 * Displays a specific workflow's scenarios overlaid on a canvas diagram, with execution artifacts and playback controls.
 * Requires both a canvas and workflow to be specified via props.
 */
export const WorkflowScenariosPanel: React.FC<WorkflowScenariosPanelProps> = ({
  context,
  actions,
  events,
  selectedCanvasId: selectedCanvasIdProp,
  canvasPath: canvasPathProp,
  canvasName: canvasNameProp,
  canvasFileInfo: canvasFileInfoProp,
  selectedWorkflowId: selectedWorkflowIdProp,
  workflowPath: workflowPathProp,
  workflowTemplate: workflowTemplateProp,
  workflowFileInfo: workflowFileInfoProp,
}) => {
  const { theme } = useTheme();

  // Use core discovery system for test traces and workflows (storyboards contain both)
  const { storyboards, testTraces } = useCanvasData({ context, actions });

  // Get live OTEL traces from telemetry slice
  const telemetrySlice = context.getSlice<TraceInfo[]>('telemetry');
  const allLiveTraces = telemetrySlice?.data || [];

  // Filter live traces to only show traces matching the current workflow
  const liveTraces = useMemo(() => {
    if (!selectedWorkflowIdProp) return allLiveTraces;

    return allLiveTraces.filter(trace =>
      trace.matchedWorkflow?.workflowId === selectedWorkflowIdProp
    );
  }, [allLiveTraces, selectedWorkflowIdProp]);

  const [state, setState] = useState<WorkflowScenariosPanelState>({
    canvas: null,
    execution: null,
    metadata: null,
    loading: false,
    error: null,
    selectedCanvasId: null,
    canvasName: null,
    availableExecutions: [],
    selectedExecutionId: null,
    showHelpModal: false,
    selectedWorkflowId: null,
    isPlaying: false,
    currentSpanIndex: 0,
    currentEventIndex: 0,
    highlightedNodeId: null,
    workflowTemplate: null,
    availableNarratives: [],
    viewMode: 'narrative',
    executionScenarioMap: {},
    hoveredExecutionId: null,
    hoveredExecution: null,
    hoveredScenarioEventNames: null,
    selectedScenarioId: null,
    selectedScenario: null,
    showTraceSearch: false,
    showLiveTraceSearch: false,
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

  // Track file timestamps for auto-reload on changes
  const canvasFileTimestampRef = useRef<number | null>(null);
  const narrativeFileTimestampRef = useRef<number | null>(null);

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
      const fileTreeData = fileTreeSlice?.data as FileTree | null;

      if (!fileTreeData?.allFiles) {
        // Keep loading state true while waiting for file tree data
        return;
      }

      // Note: We don't get test traces/workflows here because they're loaded by useCanvasData
      // and will be empty on first render. Instead, we'll populate them via state updates
      // once discovery completes. For now, just set empty arrays and let the effect below
      // update them when discovery finishes.
      const executionFiles: typeof testTraces = [];
      const availableNarratives: typeof storyboards[0]['workflows'] = [];

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

      // Evaluate executions against workflow template to build scenario mapping
      // Use existing workflow template from state if available
      const executionScenarioMap: Record<string, string> = {};
      const currentWorkflowTemplate = state.workflowTemplate;
      if (currentWorkflowTemplate && executionFiles.length > 0) {
        for (const execFile of executionFiles) {
          try {
            const fullExecPath = `${repositoryPath}/${execFile.path}`;
            const execContent = await readFile(fullExecPath);
            if (execContent && typeof execContent === 'string') {
              const execution = parseExecutionArtifact(execContent);
              const spans = getSpans(execution);
              if (spans.length > 0) {
                // For single-span executions, use the first span
                const events = convertToOtelEvents(spans[0] as TestSpan, []);
                const result = renderWorkflow(currentWorkflowTemplate, events);
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
        availableNarratives,
        // Don't overwrite workflowTemplate and selectedWorkflowId - preserve from state/props
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

  // Update available test traces and workflows when discovery completes
  useEffect(() => {
    if (testTraces.length > 0 || storyboards.length > 0) {
      const availableNarratives = storyboards.flatMap(sb => sb.workflows);

      setState(prev => {
        // Find the current workflow to get its co-located test traces
        const currentWorkflow = availableNarratives.find(
          w => w.id === prev.selectedWorkflowId
        );

        // Use ONLY test traces that are co-located with this workflow (directory-based association)
        const workflowExecutions = currentWorkflow?.testTraces || [];

        // Re-evaluate execution scenario mapping with discovered test traces
        const executionScenarioMap: Record<string, string> = {};
        if (prev.workflowTemplate && workflowExecutions.length > 0) {
          const readFile = (actionsRef.current as { readFile?: (path: string) => Promise<string> }).readFile;
          const repositoryPath = (contextRef.current as { repositoryPath?: string }).repositoryPath;

          if (readFile && repositoryPath) {
            // Async evaluation - we'll update the map as executions load
            for (const execFile of workflowExecutions) {
              readFile(`${repositoryPath}/${execFile.path}`)
                .then(content => {
                  const execution = parseExecutionArtifact(content);
                  const spans = getSpans(execution);
                  if (spans.length > 0 && prev.workflowTemplate) {
                    const events = convertToOtelEvents(spans[0] as TestSpan, []);
                    const result = renderWorkflow(prev.workflowTemplate, events);
                    setState(s => ({
                      ...s,
                      executionScenarioMap: {
                        ...s.executionScenarioMap,
                        [execFile.id]: result.scenarioId,
                      },
                    }));
                  }
                })
                .catch(err => {
                  console.warn(`[WorkflowScenariosPanel] Failed to evaluate execution ${execFile.id}:`, err);
                });
            }
          }
        }

        return {
          ...prev,
          availableExecutions: workflowExecutions,
          availableNarratives,
          executionScenarioMap,
        };
      });
    }
  }, [testTraces, storyboards]);

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

  // Sync narrative props to state
  useEffect(() => {
    if (workflowTemplateProp && selectedWorkflowIdProp) {
      setState(prev => ({
        ...prev,
        selectedWorkflowId: selectedWorkflowIdProp,
        workflowTemplate: workflowTemplateProp,
        viewMode: 'narrative',
      }));
    } else if (selectedWorkflowIdProp === null && workflowTemplateProp === null) {
      // Clear narrative if explicitly set to null
      setState(prev => ({
        ...prev,
        selectedWorkflowId: null,
        workflowTemplate: null,
      }));
    }
  }, [selectedWorkflowIdProp, workflowTemplateProp]);

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
        workflowId?: string;
        workflowTemplate?: WorkflowTemplate;
      };
    }

    const handleEvent = (event: CustomEvent) => {
      if (event.type === 'custom') {
        const payload = event.payload;
        if (payload?.action === 'selectCanvas' && payload?.canvasId && payload?.canvas) {
          loadCanvas(payload.canvasId, payload.canvas.path);

          // Handle narrative if provided in event
          if (payload.workflowId && payload.workflowTemplate) {
            console.log('[CanvasDetailPanel] Setting narrative from event:', payload.workflowId);
            setState(prev => ({
              ...prev,
              selectedWorkflowId: payload.workflowId || null,
              workflowTemplate: payload.workflowTemplate || null,
              viewMode: 'narrative',
            }));
          }
        }
      }
    };

    events.on('custom', handleEvent);
    return () => {
      events.off('custom', handleEvent);
    };
  }, [events, loadCanvas, selectedCanvasIdProp, canvasPathProp]);

  // Update timestamp refs when FileInfo props change
  useEffect(() => {
    if (canvasFileInfoProp?.lastModified) {
      canvasFileTimestampRef.current = canvasFileInfoProp.lastModified.getTime();
    }
  }, [canvasFileInfoProp]);

  useEffect(() => {
    if (workflowFileInfoProp?.lastModified) {
      narrativeFileTimestampRef.current = workflowFileInfoProp.lastModified.getTime();
    }
  }, [workflowFileInfoProp]);

  // Auto-reload on file changes via workspace:changed events
  useEffect(() => {
    if (!events || !canvasPathProp) return;

    const handleWorkspaceChange = (_event: unknown) => {
      // Get current file tree to check timestamps
      const ctx = contextRef.current;
      if (!ctx.hasSlice('fileTree')) return;

      const fileTreeSlice = ctx.getSlice('fileTree');
      const fileTreeData = fileTreeSlice?.data as FileTree | null;
      if (!fileTreeData?.allFiles) return;

      // Check canvas file timestamp
      if (canvasPathProp) {
        const canvasFile = fileTreeData.allFiles.find(f =>
          f.path === canvasPathProp || f.relativePath === canvasPathProp
        );

        if (canvasFile?.lastModified) {
          const currentTimestamp = canvasFile.lastModified.getTime();
          if (canvasFileTimestampRef.current && currentTimestamp !== canvasFileTimestampRef.current) {
            console.log('[CanvasDetailPanel] Canvas file modified, reloading...', {
              path: canvasPathProp,
              lastLoaded: new Date(canvasFileTimestampRef.current),
              current: new Date(currentTimestamp),
            });

            // Reload the canvas
            if (selectedCanvasIdProp) {
              loadCanvas(selectedCanvasIdProp, canvasPathProp);
            }
            canvasFileTimestampRef.current = currentTimestamp;
          }
        }
      }

      // Check workflow file timestamp
      if (workflowPathProp) {
        const narrativeFile = fileTreeData.allFiles.find(f =>
          f.path === workflowPathProp || f.relativePath === workflowPathProp
        );

        if (narrativeFile?.lastModified) {
          const currentTimestamp = narrativeFile.lastModified.getTime();
          if (narrativeFileTimestampRef.current && currentTimestamp !== narrativeFileTimestampRef.current) {
            console.log('[CanvasDetailPanel] Narrative file modified, reloading...', {
              path: workflowPathProp,
              lastLoaded: new Date(narrativeFileTimestampRef.current),
              current: new Date(currentTimestamp),
            });

            // TODO: Reload workflow template
            narrativeFileTimestampRef.current = currentTimestamp;
          }
        }
      }
    };

    events.on('workspace:changed', handleWorkspaceChange);
    return () => {
      events.off('workspace:changed', handleWorkspaceChange);
    };
  }, [events, canvasPathProp, workflowPathProp, selectedCanvasIdProp, loadCanvas]);

  // Playback control
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
        const executionArtifact = parseExecutionArtifact(executionContent);
        const metadata = getExecutionMetadata(executionArtifact);
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

  // Handle live trace selection (TraceInfo from telemetry slice)
  const handleLiveTraceSelect = useCallback((traceId: string) => {
    try {
      const trace = liveTraces.find(t => t.traceId === traceId);
      if (!trace) {
        console.error('[WorkflowScenariosPanel] Live trace not found:', traceId);
        return;
      }

      // Convert TraceInfo to ExecutionData format
      const executionData: ExecutionData = {
        metadata: {
          canvasName: state.canvas?.pv?.name || 'Unknown Canvas',
          exportedAt: new Date().toISOString(),
          source: `live:${trace.serviceName || 'unknown'}`,
          framework: 'otel',
          status: trace.hasErrors ? ('failure' as const) : ('success' as const),
        },
        spans: trace.spans.map((span: OtelSpanData) => ({
          id: span.spanId,
          name: span.name,
          startTime: Math.floor(Number(span.startTimeUnixNano) / 1_000_000), // Convert nanos to milliseconds
          endTime: Math.floor(Number(span.endTimeUnixNano) / 1_000_000),
          duration: Math.floor((Number(span.endTimeUnixNano) - Number(span.startTimeUnixNano)) / 1_000_000),
          status: span.status?.code === 2 ? ('ERROR' as const) : ('OK' as const),
          attributes: span.attributes?.reduce((acc: Record<string, string | number | boolean>, attr: OtelKeyValue) => {
            const value = attr.value.stringValue || attr.value.intValue || attr.value.boolValue;
            if (value !== undefined) {
              acc[attr.key] = value;
            }
            return acc;
          }, {} as Record<string, string | number | boolean>) || {},
          events: span.events?.map((event) => ({
            time: Math.floor(Number(event.timeUnixNano) / 1_000_000), // Convert nanos to milliseconds
            name: event.name,
            attributes: event.attributes?.reduce((acc: Record<string, string | number | boolean>, attr: OtelKeyValue) => {
              const value = attr.value.stringValue || attr.value.intValue || attr.value.boolValue;
              if (value !== undefined) {
                acc[attr.key] = value;
              }
              return acc;
            }, {} as Record<string, string | number | boolean>) || {},
          })) || [],
        })),
      };

      const metadata = getExecutionMetadata(executionData);
      setState(prev => ({
        ...prev,
        selectedExecutionId: traceId,
        execution: executionData,
        metadata,
        isPlaying: false,
        currentSpanIndex: 0,
        currentEventIndex: 0,
        highlightedNodeId: null,
        viewMode: 'narrative',
      }));
    } catch (error) {
      console.error('[WorkflowScenariosPanel] Failed to load live trace:', error);
    }
  }, [liveTraces, state.canvas]);

  const handleSpanIndexChange = useCallback((newSpanIndex: number) => {
    setState(prev => {
      const spans = prev.execution ? getSpans(prev.execution) : [];
      const newSpan = spans[newSpanIndex];
      const newEvent = newSpan?.events?.[0]; // Start at first event of new span
      const highlightedNodeId = newEvent ? mapEventToNodeId({ ...newEvent, attributes: newEvent.attributes as OtelAttributes }, prev.canvas) : null;

      return {
        ...prev,
        currentSpanIndex: newSpanIndex,
        currentEventIndex: 0,
        highlightedNodeId,
      };
    });
  }, []);

  // Handle narrative event click - highlight corresponding canvas node
  const handleNarrativeEventClick = useCallback((event: import('@principal-ai/principal-view-core').OtelEvent, eventIndex: number) => {
    setState(prev => {
      const nodeId = mapEventToNodeId({ name: event.name, time: Number(event.timestamp), attributes: event.attributes }, prev.canvas);
      return {
        ...prev,
        highlightedNodeId: nodeId,
        currentEventIndex: eventIndex,
      };
    });
  }, []);

  // Handle source click from scenario details panel (simplified signature)
  const handleScenarioSourceClick = useCallback((source: string) => {
    console.log('[WorkflowScenariosPanel] Source clicked - opening file:', source);

    // Emit file:open event
    if (eventsRef.current) {
      eventsRef.current.emit({
        type: 'file:open',
        source: 'workflow-scenarios-panel',
        timestamp: Date.now(),
        payload: { path: source },
      });
    }
  }, []);

  // Handle node click on canvas - find corresponding event and highlight narrative
  const handleNodeClick = useCallback((nodeId: string, event: React.MouseEvent) => {
    // Handle shift+click to open source files (legacy - now handled by onSourceClick)
    if (event.shiftKey) {
      setState(prev => {
        if (!prev.canvas) return prev;

        // Find the node in the canvas
        const node = prev.canvas.nodes?.find(n => n.id === nodeId);
        if (!node) return prev;

        // Extract sources from node.pv
        const nodePv = node.pv as PVNodeExtension | undefined;
        const sources = nodePv?.sources as string[] | undefined;

        if (sources && sources.length > 0) {
          // Take first source and clean up any glob patterns
          const sourcePath = sources[0];
          // Remove glob patterns (* characters) to get the base path
          const cleanPath = sourcePath.replace(/\*/g, '');

          console.log('[CanvasDetailPanel] Shift+click - opening source:', cleanPath);

          // Emit file:open event (same as git changes panel)
          // Pass relative path, not absolute - the context will resolve it
          if (eventsRef.current) {
            eventsRef.current.emit({
              type: 'file:open',
              source: 'canvas-detail-panel',
              timestamp: Date.now(),
              payload: { path: cleanPath },
            });
          }
        }

        return prev;
      });
      return;
    }

    // Regular click - highlight corresponding narrative
    setState(prev => {
      if (!prev.canvas) return prev;

      // Handle preview mode (no execution, but has selected scenario)
      if (!prev.execution && prev.selectedScenario) {
        // Get event names from scenario template in order
        const eventNames = Object.keys(prev.selectedScenario.template.events || {});

        // Find node in canvas
        const node = prev.canvas.nodes?.find(n => n.id === nodeId);
        if (!node) return prev;

        // Get event name from node
        const nodePv = node.pv as PVNodeExtension | undefined;
        const nodeEventName = nodePv?.event?.name;

        if (nodeEventName) {
          // Find index of this event in the template
          const eventIndex = eventNames.indexOf(nodeEventName);

          if (eventIndex >= 0) {
            return {
              ...prev,
              highlightedNodeId: nodeId,
              currentEventIndex: eventIndex,
            };
          }
        }

        return prev;
      }

      // Handle execution mode (has execution data)
      if (!prev.execution) return prev;

      const spans = getSpans(prev.execution);
      const allEvents: Array<{ name: string; time: number; attributes?: OtelAttributes }> = [];

      // Collect all events from all spans
      for (const span of spans) {
        if (span?.events) {
          for (const event of span.events) {
            allEvents.push({
              name: event.name,
              time: event.time,
              attributes: event.attributes as OtelAttributes,
            });
          }
        }
      }

      // Find the first event that maps to this node
      const eventIndex = allEvents.findIndex(event => {
        const mappedNodeId = mapEventToNodeId(event, prev.canvas);
        return mappedNodeId === nodeId;
      });

      if (eventIndex >= 0) {
        return {
          ...prev,
          highlightedNodeId: nodeId,
          currentEventIndex: eventIndex,
        };
      }

      return prev;
    });
  }, []);

  // Handle scenario hover - highlight nodes that have events matching the scenario
  const handleScenarioHover = useCallback((eventNames: string[] | null) => {
    setState(prev => ({
      ...prev,
      hoveredScenarioEventNames: eventNames,
    }));
  }, []);

  // Handle scenario click - show ScenarioDetailsPanel for the selected scenario
  const handleScenarioClick = useCallback((scenarioId: string, scenario: WorkflowScenario) => {
    setState(prev => ({
      ...prev,
      selectedScenarioId: scenarioId,
      selectedScenario: scenario,
      viewMode: 'narrative', // Default to workflow view when showing a scenario
    }));
  }, []);

  // Helper to extract event name from node (handles both event.name and eventRef)
  const getNodeEventName = (node: ExtendedCanvasNode): string | null => {
    const nodePv: PVNodeExtension | undefined = node.pv;
    // eventRef is the event name directly (string)
    // event.name is the event name within an event schema object
    return nodePv?.eventRef || nodePv?.event?.name || null;
  };

  // Calculate active node IDs from current execution events (or hovered execution/scenario for preview)
  const activeNodeIds = useMemo(() => {
    if (!state.canvas) return null;

    // Priority 1: Hovered execution preview
    if (state.hoveredExecution) {
      const spans = getSpans(state.hoveredExecution);
      const allEvents: Array<{ name: string; time: number; attributes?: OtelAttributes }> = [];

      for (const span of spans) {
        if (span?.events) {
          for (const event of span.events) {
            allEvents.push({
              name: event.name,
              time: event.time,
              attributes: event.attributes as OtelAttributes,
            });
          }
        }
      }

      const activeIds = new Set<string>();
      for (const event of allEvents) {
        const nodeId = mapEventToNodeId(event, state.canvas);
        if (nodeId) {
          activeIds.add(nodeId);
        }
      }

      return activeIds.size > 0 ? Array.from(activeIds) : null;
    }

    // Priority 2: Hovered scenario preview (find nodes with matching events)
    if (state.hoveredScenarioEventNames && state.hoveredScenarioEventNames.length > 0) {
      const activeIds = new Set<string>();

      // Check each node to see if it has any of the scenario's events
      for (const node of state.canvas.nodes || []) {
        const nodeEventName = getNodeEventName(node);

        // If this node's event matches any of the scenario's events, mark it as active
        if (nodeEventName && state.hoveredScenarioEventNames.includes(nodeEventName)) {
          activeIds.add(node.id);
        }
      }

      return activeIds.size > 0 ? Array.from(activeIds) : null;
    }

    // Priority 3: Currently selected execution
    if (state.execution) {
      const spans = getSpans(state.execution);
      const allEvents: Array<{ name: string; time: number; attributes?: OtelAttributes }> = [];

      for (const span of spans) {
        if (span?.events) {
          for (const event of span.events) {
            allEvents.push({
              name: event.name,
              time: event.time,
              attributes: event.attributes as OtelAttributes,
            });
          }
        }
      }

      const activeIds = new Set<string>();
      for (const event of allEvents) {
        const nodeId = mapEventToNodeId(event, state.canvas);
        if (nodeId) {
          activeIds.add(nodeId);
        }
      }

      return activeIds.size > 0 ? Array.from(activeIds) : null;
    }

    // Priority 4: Workflow template (default when loaded)
    if (state.workflowTemplate) {
      const eventNames = new Set<string>();

      // Collect all event names from all scenarios
      for (const scenario of state.workflowTemplate.scenarios || []) {
        // Get events from template.events
        if (scenario.template.events) {
          Object.keys(scenario.template.events).forEach(e => eventNames.add(e));
        }
        // Get events from condition.requires
        if (scenario.condition.requires) {
          scenario.condition.requires.forEach(e => eventNames.add(e));
        }
      }

      // Find nodes that match these events
      const activeIds = new Set<string>();
      for (const node of state.canvas.nodes || []) {
        const nodeEventName = getNodeEventName(node);

        if (nodeEventName && eventNames.has(nodeEventName)) {
          activeIds.add(node.id);
        }
      }

      return activeIds.size > 0 ? Array.from(activeIds) : null;
    }

    return null;
  }, [state.execution, state.canvas, state.hoveredExecution, state.hoveredScenarioEventNames, state.workflowTemplate]);

  // Calculate if all scenarios have test traces
  const isFullyCovered = useMemo(() => {
    if (!state.workflowTemplate || !state.workflowTemplate.scenarios) return false;

    const totalScenarios = state.workflowTemplate.scenarios.length;
    if (totalScenarios === 0) return false;

    const scenariosWithTests = state.workflowTemplate.scenarios.filter((scenario, index) => {
      const scenarioId = scenario.id || String(index);
      const matchingExecutions = state.availableExecutions.filter(
        exec => state.executionScenarioMap[exec.id] === scenarioId
      );
      return matchingExecutions.length > 0;
    }).length;

    return scenariosWithTests === totalScenarios;
  }, [state.workflowTemplate, state.availableExecutions, state.executionScenarioMap]);

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
        const spans = prev.execution ? getSpans(prev.execution) : [];
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
          ? mapEventToNodeId({ ...newEvent, attributes: newEvent.attributes as OtelAttributes }, prev.canvas)
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

  // Render loading state first - highest priority
  if (state.loading) {
    return <LoadingSkeleton theme={theme} />;
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

  // Render empty state when no canvas is loaded
  if (!state.canvas) {
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
          padding: '5.5px 16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: theme.colors.background,
          gap: '12px',
          height: '40px',
          boxSizing: 'border-box',
        }}
      >
        {/* Canvas Title - Show the currently loaded canvas and narrative */}
        {state.canvasName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: theme.fontSizes[2], fontWeight: theme.fontWeights.medium, color: theme.colors.text, fontFamily: theme.fonts.body }}>
              {state.canvasName}
              {state.workflowTemplate && (
                <>
                  <span style={{ opacity: 0.7 }}>
                    {' / '}
                    {state.workflowTemplate.name || state.selectedWorkflowId}
                  </span>
                  {isFullyCovered && (
                    <CheckCircle2 size={16} style={{ color: '#10b981', marginLeft: '8px', verticalAlign: 'middle', display: 'inline' }} />
                  )}
                </>
              )}
            </span>
          </div>
        )}


        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Trace List Button - Show when workflow has test traces */}
        {state.workflowTemplate && state.availableExecutions.length > 0 && (
          <button
            onClick={() => setState(prev => ({ ...prev, showTraceSearch: true }))}
            style={{
              padding: '0 12px',
              height: '28px',
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '4px',
              color: theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: theme.fontSizes[2],
              fontFamily: theme.fonts.body,
            }}
            title={`View all test traces (${state.availableExecutions.length})`}
          >
            <List size={14} />
            <span>Test Traces ({state.availableExecutions.length})</span>
          </button>
        )}

        {/* Live Trace List Button - Show when live traces are available */}
        {state.workflowTemplate && liveTraces.length > 0 && (
          <button
            onClick={() => setState(prev => ({ ...prev, showLiveTraceSearch: true }))}
            style={{
              padding: '0 12px',
              height: '28px',
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '4px',
              color: theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: theme.fontSizes[2],
              fontFamily: theme.fonts.body,
            }}
            title={`View live OTEL traces (${liveTraces.length})`}
          >
            <Radar size={14} />
            <span>Live Traces ({liveTraces.length})</span>
          </button>
        )}

        {/* Open in Editor Button */}
        <button
          onClick={handleOpenInEditor}
          disabled={!canvasPathProp}
          style={{
            padding: '0 12px',
            height: '28px',
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '4px',
            color: theme.colors.text,
            cursor: canvasPathProp ? 'pointer' : 'not-allowed',
            opacity: canvasPathProp ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: theme.fontSizes[2],
            fontFamily: theme.fonts.body,
          }}
          title={canvasPathProp ? 'Open in Canvas Editor' : 'Canvas path not available'}
        >
          <Pencil size={14} />
          <span>Edit</span>
        </button>

        {/* Documentation Button - Show when canvas has markdown documentation */}
        {state.canvas?.pv?.markdown && (
          <button
            onClick={() => {
              const markdownPath = state.canvas?.pv?.markdown;
              if (markdownPath && eventsRef.current) {
                console.log('[CanvasDetailPanel] Opening documentation:', markdownPath);
                eventsRef.current.emit({
                  type: 'file:open',
                  source: 'canvas-detail-panel',
                  timestamp: Date.now(),
                  payload: { path: markdownPath },
                });
              }
            }}
            style={{
              padding: '0 12px',
              height: '28px',
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '4px',
              color: theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: theme.fontSizes[2],
              fontFamily: theme.fonts.body,
            }}
            title="View documentation"
          >
            <FileText size={14} />
            <span>Docs</span>
          </button>
        )}

        {/* Playback controls removed - all events now display by default */}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {state.workflowTemplate && state.canvas ? (
          <AnimatedResizableLayout
            theme={theme}
            leftPanel={
              <div style={{ height: '100%', overflow: 'hidden', background: '#0a0a0a' }}>
                {state.execution ? (
                  <ScenarioDetailsPanel
                    spans={getSpans(state.execution) as TestSpan[]}
                    currentSpanIndex={state.currentSpanIndex}
                    currentEventIndex={state.currentEventIndex}
                    onSpanIndexChange={handleSpanIndexChange}
                    workflowTemplate={state.workflowTemplate ?? undefined}
                    viewMode={state.viewMode}
                    onViewModeChange={handleViewModeChange}
                    onNarrativeEventClick={handleNarrativeEventClick}
                    showNavigation={getSpans(state.execution).length > 1}
                    showTestName={false}
                    canvas={state.canvas}
                    availableExecutions={state.availableExecutions}
                    selectedExecutionId={state.selectedExecutionId}
                    onExecutionSelect={handleExecutionSelect}
                    onSourceClick={handleScenarioSourceClick}
                    selectedScenario={state.selectedScenario ?? undefined}
                    onDeselectExecution={() => {
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
                    onExecutionHover={(executionId) => {
                      if (executionId) {
                        // Load the execution for preview (hover)
                        const execution = state.availableExecutions.find(e => e.id === executionId);
                        if (execution) {
                          (async () => {
                            try {
                              const ctx = contextRef.current;
                              const acts = actionsRef.current;
                              const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
                              const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;

                              if (readFile && repositoryPath) {
                                const fullExecutionPath = `${repositoryPath}/${execution.path}`;
                                const executionContent = await readFile(fullExecutionPath);
                                if (executionContent && typeof executionContent === 'string') {
                                  const executionArtifact = parseExecutionArtifact(executionContent);
                                  setState(prev => ({
                                    ...prev,
                                    hoveredExecutionId: execution.id,
                                    hoveredExecution: executionArtifact,
                                  }));
                                }
                              }
                            } catch (error) {
                              console.error('[ExecutionViewer] Failed to load execution for preview:', error);
                            }
                          })();
                        }
                      } else {
                        setState(prev => ({
                          ...prev,
                          hoveredExecutionId: null,
                          hoveredExecution: null,
                        }));
                      }
                    }}
                    showBackButton={!!(state.workflowTemplate && state.availableExecutions.length > 0)}
                    onBackClick={() => {
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
                    scenarioName={
                      state.selectedExecutionId && state.executionScenarioMap[state.selectedExecutionId]
                        ? state.executionScenarioMap[state.selectedExecutionId]
                            .split('-')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                        : undefined
                    }
                  />
                ) : state.selectedScenario ? (
                  <ScenarioDetailsPanel
                    spans={[]} // Empty spans when showing scenario without execution
                    currentSpanIndex={0}
                    currentEventIndex={state.currentEventIndex}
                    workflowTemplate={state.workflowTemplate ?? undefined}
                    viewMode={state.viewMode}
                    onViewModeChange={handleViewModeChange}
                    onNarrativeEventClick={handleNarrativeEventClick}
                    showNavigation={false}
                    showTestName={false}
                    canvas={state.canvas}
                    availableExecutions={state.availableExecutions.filter(
                      exec => state.executionScenarioMap[exec.id] === state.selectedScenarioId
                    )}
                    selectedExecutionId={state.selectedExecutionId}
                    onExecutionSelect={handleExecutionSelect}
                    onSourceClick={handleScenarioSourceClick}
                    onDeselectExecution={() => {
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
                    onExecutionHover={(executionId) => {
                      if (executionId) {
                        const execution = state.availableExecutions.find(e => e.id === executionId);
                        if (execution) {
                          (async () => {
                            try {
                              const ctx = contextRef.current;
                              const acts = actionsRef.current;
                              const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
                              const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;

                              if (readFile && repositoryPath) {
                                const fullExecutionPath = `${repositoryPath}/${execution.path}`;
                                const executionContent = await readFile(fullExecutionPath);
                                if (executionContent && typeof executionContent === 'string') {
                                  const executionArtifact = parseExecutionArtifact(executionContent);
                                  setState(prev => ({
                                    ...prev,
                                    hoveredExecutionId: execution.id,
                                    hoveredExecution: executionArtifact,
                                  }));
                                }
                              }
                            } catch (error) {
                              console.error('[ExecutionViewer] Failed to load execution for preview:', error);
                            }
                          })();
                        }
                      } else {
                        setState(prev => ({
                          ...prev,
                          hoveredExecutionId: null,
                          hoveredExecution: null,
                        }));
                      }
                    }}
                    showBackButton={true}
                    onBackClick={() => {
                      setState(prev => ({
                        ...prev,
                        selectedScenarioId: null,
                        selectedScenario: null,
                        selectedExecutionId: null,
                        execution: null,
                        metadata: null,
                      }));
                    }}
                    scenarioName={
                      state.selectedScenarioId
                        ? state.selectedScenarioId
                            .split('-')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                        : undefined
                    }
                    selectedScenario={state.selectedScenario ?? undefined}
                  />
                ) : state.workflowTemplate ? (
                  <WorkflowTemplatePanel
                    workflowTemplate={state.workflowTemplate}
                    canvas={state.canvas}
                    availableExecutions={state.availableExecutions}
                    executionScenarioMap={state.executionScenarioMap}
                    onExecutionSelect={handleExecutionSelect}
                    onScenarioHover={handleScenarioHover}
                    onScenarioClick={handleScenarioClick}
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
                        <div style={{ color: '#888', fontSize: '10px', marginTop: '4px' }}># Only .otel.json files are supported</div>
                      </div>
                      <p style={{ margin: 0, color: '#666', fontSize: '11px', fontStyle: 'italic' }}>
                        Tip: Use exportExecutionArtifact() in your tests
                      </p>
                    </div>
                  </div>
                )}
              </div>
            }
            rightPanel={
              <div style={{ height: '100%', position: 'relative', background: '#0a0a0a' }}>
                <GraphRenderer
                  canvas={state.canvas}
                  showMinimap={false}
                  showControls={true}
                  showBackground={false}
                  backgroundVariant="lines"
                  showTooltips={true}
                  highlightedNodeId={state.highlightedNodeId}
                  activeNodeIds={activeNodeIds}
                  onNodeClick={handleNodeClick}
                  showNodeDetailPanel={true}
                />
                {/* Test Trace Search Overlay - positioned over canvas */}
                {state.showTraceSearch && (
                  <TraceSearchView
                    traces={state.availableExecutions}
                    selectedScenarioId={state.selectedScenarioId}
                    executionScenarioMap={state.executionScenarioMap}
                    selectedTraceId={state.selectedExecutionId}
                    onTraceSelect={handleExecutionSelect}
                    onClose={() => setState(prev => ({ ...prev, showTraceSearch: false }))}
                    theme={theme}
                  />
                )}
                {/* Live Trace Search Overlay - positioned over canvas */}
                {state.showLiveTraceSearch && (
                  <LiveTraceSearchView
                    traces={liveTraces}
                    selectedScenarioId={state.selectedScenarioId}
                    selectedTraceId={state.selectedExecutionId}
                    onTraceSelect={handleLiveTraceSelect}
                    onClose={() => setState(prev => ({ ...prev, showLiveTraceSearch: false }))}
                    theme={theme}
                  />
                )}
              </div>
            }
            collapsibleSide="left"
            defaultSize={40}
            minSize={20}
            showCollapseButton={false}
            animationDuration={250}
          />
        ) : (
          <div
            style={{
              height: '100%',
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
            <WorkflowExplainerPanel />
          </div>
        </div>
      )}
    </div>
  );
};
