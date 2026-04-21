import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTheme, type Theme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas } from '@principal-ai/principal-view-core';
import { BookOpen, AlertCircle, Layers, Grid } from 'lucide-react';
import { StepCarousel } from './StepCarousel';
import { StoryGraphRenderer, explanationStepsToStorySteps } from './StoryGraphRenderer';
import type {
  ComposableExplanation,
  ExplanationStep,
  LoadedCanvas,
  ExplanationViewerState,
} from './types';
import type { PanelComponentProps, PanelActions, DataSlice } from '../../types';
import type { FileTree } from '@principal-ai/repository-abstraction';

/**
 * Render mode for the canvas
 */
export type CanvasRenderMode = 'full' | 'story';

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
        }}
      >
        {/* Header skeleton */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            style={{
              width: '200px',
              height: '20px',
              background: theme.colors.backgroundSecondary,
              borderRadius: '4px',
              ...pulseAnimation,
            }}
          />
        </div>

        {/* Canvas skeleton */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
          }}
        >
          <div
            style={{
              width: '60%',
              height: '60%',
              background: theme.colors.backgroundSecondary,
              borderRadius: '8px',
              ...pulseAnimation,
            }}
          />
        </div>

        {/* Carousel skeleton */}
        <div
          style={{
            height: '180px',
            borderTop: `1px solid ${theme.colors.border}`,
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: theme.colors.backgroundSecondary,
              borderRadius: '4px',
              ...pulseAnimation,
            }}
          />
        </div>
      </div>
    </>
  );
};

/**
 * Typed context for ComposableExplanationPanel
 */
export interface ComposableExplanationPanelContext {
  fileTree: DataSlice<FileTree | null>;
}

/**
 * Typed actions for ComposableExplanationPanel
 */
export interface ComposableExplanationPanelActions extends PanelActions {
  readFile: (path: string) => Promise<string>;
}

/**
 * Props for ComposableExplanationPanel
 */
export interface ComposableExplanationPanelProps
  extends PanelComponentProps<
    ComposableExplanationPanelActions,
    ComposableExplanationPanelContext
  > {
  /** The explanation document to display */
  explanation?: ComposableExplanation | null;

  /** Pre-loaded canvases by alias (for Storybook or when canvases are already available) */
  canvases?: Map<string, ExtendedCanvas>;

  /** Legacy: Pre-loaded single canvas */
  canvas?: ExtendedCanvas | null;

  /** Initial step index */
  initialStepIndex?: number;

  /** Callback when step changes */
  onStepChange?: (stepIndex: number, step: ExplanationStep) => void;

  /** Callback when a node is clicked */
  onNodeClick?: (nodeId: string, event: React.MouseEvent) => void;

  /** Height of the step carousel */
  carouselHeight?: number;

  /** Render mode: 'full' shows entire canvas with highlights, 'story' shows only relevant fragments */
  renderMode?: CanvasRenderMode;

  /** Whether to animate transitions in story mode */
  animateTransitions?: boolean;
}

/**
 * Parse element reference to extract canvas alias and element ID
 */
function parseElementRef(ref: string): { alias: string; elementId: string } | null {
  const parts = ref.split(':');
  if (parts.length !== 2) return null;
  return { alias: parts[0], elementId: parts[1] };
}

/**
 * ComposableExplanationPanel
 *
 * A panel for displaying agent-generated codebase explanations
 * with a canvas viewer on top and step-through navigation below.
 *
 * Supports two render modes:
 * - 'full': Shows the entire canvas with highlighted nodes (traditional)
 * - 'story': Shows only the relevant canvas fragments for each step (focused)
 */
export const ComposableExplanationPanel: React.FC<ComposableExplanationPanelProps> = ({
  context,
  actions,
  events: _events,
  explanation,
  canvases: preloadedCanvases,
  canvas: preloadedCanvas,
  initialStepIndex = 0,
  onStepChange,
  onNodeClick,
  carouselHeight = 180,
  renderMode = 'story',
  animateTransitions = true,
}) => {
  const { theme } = useTheme();

  const [state, setState] = useState<ExplanationViewerState>({
    currentStepIndex: initialStepIndex,
    loadedCanvases: new Map(),
    highlightedNodeIds: [],
    activeNodeIds: [],
    loading: false,
    error: null,
  });

  const [currentRenderMode, setCurrentRenderMode] = useState<CanvasRenderMode>(renderMode);

  // Store refs for context and actions
  const contextRef = useRef(context);
  const actionsRef = useRef(actions);
  contextRef.current = context;
  actionsRef.current = actions;

  // Build canvases map from preloaded sources
  const canvasesMap = useMemo(() => {
    if (preloadedCanvases && preloadedCanvases.size > 0) {
      return preloadedCanvases;
    }

    // If we have a single preloaded canvas, use it with default alias
    if (preloadedCanvas) {
      const map = new Map<string, ExtendedCanvas>();
      // Determine alias from explanation or use 'main'
      const alias = explanation?.canvases
        ? Object.keys(explanation.canvases)[0] || 'main'
        : 'main';
      map.set(alias, preloadedCanvas);
      return map;
    }

    // Use loaded canvases from state
    const map = new Map<string, ExtendedCanvas>();
    for (const [alias, loaded] of state.loadedCanvases) {
      map.set(alias, loaded.canvas);
    }
    return map;
  }, [preloadedCanvases, preloadedCanvas, state.loadedCanvases, explanation?.canvases]);

  // Load canvases from the explanation document
  const loadCanvases = useCallback(async () => {
    if (!explanation?.canvases) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const repositoryPath = (contextRef.current as { repositoryPath?: string })
        .repositoryPath;
      const readFile = actionsRef.current.readFile;

      if (!repositoryPath || !readFile) {
        throw new Error('Repository path or readFile action not available');
      }

      const loadedCanvases = new Map<string, LoadedCanvas>();

      for (const [alias, canvasPath] of Object.entries(explanation.canvases)) {
        try {
          const fullPath = `${repositoryPath}/${canvasPath}`;
          const content = await readFile(fullPath);
          const canvas = JSON.parse(content) as ExtendedCanvas;

          loadedCanvases.set(alias, {
            alias,
            path: canvasPath,
            canvas,
          });
        } catch (err) {
          console.warn(`[ComposableExplanationPanel] Failed to load canvas ${alias}:`, err);
        }
      }

      setState((prev) => ({
        ...prev,
        loadedCanvases,
        loading: false,
      }));
    } catch (err) {
      console.error('[ComposableExplanationPanel] Error loading canvases:', err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (err as Error).message,
      }));
    }
  }, [explanation?.canvases]);

  // Load canvases when explanation changes (only if not preloaded)
  useEffect(() => {
    if (explanation && !preloadedCanvases && !preloadedCanvas) {
      loadCanvases();
    }
  }, [explanation, preloadedCanvases, preloadedCanvas, loadCanvases]);

  // Convert explanation steps to story steps for StoryGraphRenderer
  const storySteps = useMemo(() => {
    if (!explanation?.steps) return [];

    // Determine default canvas alias
    const defaultAlias = explanation.canvases
      ? Object.keys(explanation.canvases)[0] || 'main'
      : 'main';

    return explanationStepsToStorySteps(explanation.steps, defaultAlias);
  }, [explanation?.steps, explanation?.canvases]);

  // Get the active canvas for current step (used in full mode)
  const activeCanvas = useMemo(() => {
    if (canvasesMap.size === 0) return null;

    if (!explanation?.steps) {
      return canvasesMap.values().next().value || null;
    }

    const currentStep = explanation.steps[state.currentStepIndex];
    if (!currentStep) return null;

    // Try to get canvas from step's ref
    const ref = currentStep.ref || currentStep.refs?.[0];
    if (ref) {
      const parsed = parseElementRef(ref);
      if (parsed) {
        const canvas = canvasesMap.get(parsed.alias);
        if (canvas) return canvas;
      }
    }

    // Fall back to first canvas
    return canvasesMap.values().next().value || null;
  }, [canvasesMap, explanation?.steps, state.currentStepIndex]);

  // Calculate active node IDs based on current step (used in full mode)
  const activeNodeIds = useMemo(() => {
    if (!explanation?.steps) return null;

    const currentStep = explanation.steps[state.currentStepIndex];
    if (!currentStep) return null;

    const nodeIds = new Set<string>();

    // Add nodes from focus
    currentStep.focus?.existing?.forEach((id) => nodeIds.add(id));
    currentStep.focus?.modified?.forEach((id) => nodeIds.add(id));
    currentStep.focus?.added?.forEach((id) => nodeIds.add(id));

    // Add nodes from refs
    if (currentStep.ref) {
      const parsed = parseElementRef(currentStep.ref);
      if (parsed) nodeIds.add(parsed.elementId);
    }
    if (currentStep.refs) {
      currentStep.refs.forEach((ref) => {
        const parsed = parseElementRef(ref);
        if (parsed) nodeIds.add(parsed.elementId);
      });
    }

    return nodeIds.size > 0 ? Array.from(nodeIds) : null;
  }, [explanation?.steps, state.currentStepIndex]);

  // Calculate highlighted node ID (used in full mode)
  const highlightedNodeId = useMemo(() => {
    if (!explanation?.steps) return null;

    const currentStep = explanation.steps[state.currentStepIndex];
    if (!currentStep) return null;

    if (currentStep.ref) {
      const parsed = parseElementRef(currentStep.ref);
      return parsed?.elementId || null;
    }
    if (currentStep.refs?.[0]) {
      const parsed = parseElementRef(currentStep.refs[0]);
      return parsed?.elementId || null;
    }

    return null;
  }, [explanation?.steps, state.currentStepIndex]);

  // Handle step change
  const handleStepChange = useCallback(
    (newIndex: number) => {
      setState((prev) => ({
        ...prev,
        currentStepIndex: newIndex,
      }));

      if (onStepChange && explanation?.steps[newIndex]) {
        onStepChange(newIndex, explanation.steps[newIndex]);
      }
    },
    [onStepChange, explanation?.steps]
  );

  // Handle node click in full mode
  const handleNodeClickFull = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      if (onNodeClick) {
        onNodeClick(nodeId, event);
      }

      // Find step that references this node and navigate to it
      if (explanation?.steps) {
        const stepIndex = explanation.steps.findIndex((step) => {
          if (step.ref) {
            const parsed = parseElementRef(step.ref);
            if (parsed?.elementId === nodeId) return true;
          }
          if (step.refs) {
            return step.refs.some((ref) => {
              const parsed = parseElementRef(ref);
              return parsed?.elementId === nodeId;
            });
          }
          if (step.focus?.existing?.includes(nodeId)) return true;
          if (step.focus?.modified?.includes(nodeId)) return true;
          if (step.focus?.added?.includes(nodeId)) return true;
          return false;
        });

        if (stepIndex >= 0 && stepIndex !== state.currentStepIndex) {
          handleStepChange(stepIndex);
        }
      }
    },
    [onNodeClick, explanation?.steps, state.currentStepIndex, handleStepChange]
  );

  // Handle node click in story mode
  const handleNodeClickStory = useCallback(
    (nodeId: string, sourceAlias: string, originalId: string, event: React.MouseEvent) => {
      if (onNodeClick) {
        onNodeClick(originalId, event);
      }

      // Find step that references this node
      if (explanation?.steps) {
        const stepIndex = explanation.steps.findIndex((step) => {
          const refToCheck = `${sourceAlias}:${originalId}`;
          if (step.ref === refToCheck) return true;
          if (step.refs?.includes(refToCheck)) return true;
          if (step.focus?.existing?.includes(originalId)) return true;
          if (step.focus?.modified?.includes(originalId)) return true;
          if (step.focus?.added?.includes(originalId)) return true;
          return false;
        });

        if (stepIndex >= 0 && stepIndex !== state.currentStepIndex) {
          handleStepChange(stepIndex);
        }
      }
    },
    [onNodeClick, explanation?.steps, state.currentStepIndex, handleStepChange]
  );

  // Toggle render mode
  const toggleRenderMode = useCallback(() => {
    setCurrentRenderMode((prev) => (prev === 'full' ? 'story' : 'full'));
  }, []);

  // Render loading state
  if (state.loading) {
    return <LoadingSkeleton theme={theme} />;
  }

  // Render error state
  if (state.error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: theme.colors.background,
          color: theme.colors.error,
          padding: '20px',
        }}
      >
        <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h2 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Error Loading Explanation</h2>
        <p style={{ margin: 0, fontSize: '14px', color: theme.colors.textMuted }}>
          {state.error}
        </p>
      </div>
    );
  }

  // Render empty state
  if (!explanation) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: theme.colors.background,
          color: theme.colors.text,
          padding: '20px',
        }}
      >
        <BookOpen size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 600 }}>
          No Explanation Loaded
        </h2>
        <p
          style={{
            margin: 0,
            color: theme.colors.textSecondary,
            lineHeight: 1.5,
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          Load a composable explanation document to view an interactive walkthrough of the
          codebase with canvas visualizations.
        </p>
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
          padding: '8px 16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: theme.colors.background,
          minHeight: '40px',
        }}
      >
        <span
          style={{
            fontSize: theme.fontSizes[2],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text,
          }}
        >
          {explanation.title}
        </span>
        {explanation.type && (
          <span
            style={{
              marginLeft: '12px',
              padding: '2px 8px',
              fontSize: theme.fontSizes[0],
              borderRadius: '4px',
              background: theme.colors.backgroundSecondary,
              color: theme.colors.textSecondary,
              textTransform: 'capitalize',
            }}
          >
            {explanation.type.replace('-', ' ')}
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Render mode toggle */}
        <button
          onClick={toggleRenderMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: theme.colors.backgroundSecondary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '4px',
            color: theme.colors.text,
            fontSize: theme.fontSizes[0],
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title={currentRenderMode === 'story' ? 'Switch to full canvas view' : 'Switch to story view'}
        >
          {currentRenderMode === 'story' ? (
            <>
              <Layers size={14} />
              <span>Story</span>
            </>
          ) : (
            <>
              <Grid size={14} />
              <span>Full</span>
            </>
          )}
        </button>
      </div>

      {/* Canvas Viewer */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          background: '#0a0a0a',
        }}
      >
        {currentRenderMode === 'story' ? (
          // Story mode - shows only relevant fragments
          <StoryGraphRenderer
            canvases={canvasesMap}
            steps={storySteps}
            currentStepIndex={state.currentStepIndex}
            onNodeClick={handleNodeClickStory}
            animateTransitions={animateTransitions}
            fitViewOnStepChange={true}
            showMinimap={false}
            showControls={true}
          />
        ) : (
          // Full mode - shows entire canvas with highlights
          activeCanvas ? (
            <GraphRenderer
              canvas={activeCanvas}
              library={{
                version: '1.0.0',
                name: 'Default Library',
              }}
              showMinimap={false}
              showControls={true}
              showBackground={false}
              backgroundVariant="lines"
              showTooltips={true}
              highlightedNodeId={highlightedNodeId}
              activeNodeIds={activeNodeIds}
              onNodeClick={handleNodeClickFull}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: theme.colors.textMuted,
              }}
            >
              No canvas available for current step
            </div>
          )
        )}
      </div>

      {/* Step Carousel */}
      <StepCarousel
        steps={explanation.steps}
        currentIndex={state.currentStepIndex}
        onStepChange={handleStepChange}
        height={carouselHeight}
      />
    </div>
  );
};
