/**
 * StoryGraphRenderer
 *
 * A composite graph renderer that can display fragments from multiple canvases
 * in a single view, with support for animated transitions between steps.
 */

import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { GraphRenderer } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas } from '@principal-ai/principal-view-core';
import { useTheme } from '@principal-ade/industry-theme';
import { motion, AnimatePresence } from 'framer-motion';
import {
  buildStepCanvas,
  calculateStepTransition,
  type StepCanvasConfig,
  type ComposedCanvas,
  type BridgeEdge,
  type CompositionConfig,
} from './canvasFragments';

/**
 * A single step's canvas configuration
 */
export interface StoryStep {
  /** Unique step ID */
  id: string;
  /** Nodes to show, grouped by canvas alias */
  nodes: Record<string, string[]>;
  /** Bridge edges for this step */
  bridges?: BridgeEdge[];
  /** Optional highlight node (primary focus) */
  highlightNodeId?: string;
  /** Optional layout override for this step */
  layout?: Partial<CompositionConfig>;
}

export interface StoryGraphRendererProps {
  /** Map of canvas alias to loaded canvas data */
  canvases: Map<string, ExtendedCanvas>;
  /** The steps defining what to show */
  steps: StoryStep[];
  /** Current step index */
  currentStepIndex: number;
  /** Callback when a node is clicked */
  onNodeClick?: (nodeId: string, sourceAlias: string, originalId: string, event: React.MouseEvent) => void;
  /** Whether to animate transitions */
  animateTransitions?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Whether to fit view to nodes on step change */
  fitViewOnStepChange?: boolean;
  /** Show minimap */
  showMinimap?: boolean;
  /** Show controls */
  showControls?: boolean;
}

/**
 * StoryGraphRenderer - Composite canvas renderer for story-driven explanations
 */
export const StoryGraphRenderer: React.FC<StoryGraphRendererProps> = ({
  canvases,
  steps,
  currentStepIndex,
  onNodeClick,
  animateTransitions = true,
  animationDuration = 400,
  fitViewOnStepChange = true,
  showMinimap = false,
  showControls = true,
}) => {
  const { theme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevStepIndexRef = useRef(currentStepIndex);
  const [shouldFitView, setShouldFitView] = useState(false);

  // Get current step
  const currentStep = steps[currentStepIndex];

  // Build the composed canvas for the current step
  const composedCanvas = useMemo(() => {
    if (!currentStep || canvases.size === 0) {
      return null;
    }

    const config: StepCanvasConfig = {
      nodes: currentStep.nodes,
      bridges: currentStep.bridges,
      layout: currentStep.layout,
    };

    return buildStepCanvas(canvases, config);
  }, [currentStep, canvases]);

  // Calculate active node IDs (all nodes in current step)
  const activeNodeIds = useMemo(() => {
    if (!composedCanvas) return null;
    return composedCanvas.canvas.nodes?.map((n) => n.id) || null;
  }, [composedCanvas]);

  // Calculate highlighted node ID
  const highlightedNodeId = useMemo(() => {
    if (!currentStep?.highlightNodeId || !composedCanvas) return null;

    // Find the composed ID for the highlight
    for (const [composedId, source] of composedCanvas.nodeSourceMap) {
      if (source.originalId === currentStep.highlightNodeId) {
        return composedId;
      }
    }

    // Try direct match (might already be in composed format)
    if (composedCanvas.nodeIdMap.has(currentStep.highlightNodeId)) {
      return currentStep.highlightNodeId;
    }

    return null;
  }, [currentStep?.highlightNodeId, composedCanvas]);

  // Handle step transitions
  useEffect(() => {
    if (currentStepIndex !== prevStepIndexRef.current) {
      if (animateTransitions) {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, animationDuration);

        // Trigger fit view after transition
        if (fitViewOnStepChange) {
          setShouldFitView(true);
        }

        prevStepIndexRef.current = currentStepIndex;
        return () => clearTimeout(timer);
      } else {
        if (fitViewOnStepChange) {
          setShouldFitView(true);
        }
        prevStepIndexRef.current = currentStepIndex;
      }
    }
  }, [currentStepIndex, animateTransitions, animationDuration, fitViewOnStepChange]);

  // Clear fit view flag after it's processed
  useEffect(() => {
    if (shouldFitView) {
      const timer = setTimeout(() => {
        setShouldFitView(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldFitView]);

  // Handle node click - translate composed ID back to original
  const handleNodeClick = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      if (!onNodeClick || !composedCanvas) return;

      const source = composedCanvas.nodeSourceMap.get(nodeId);
      if (source) {
        onNodeClick(nodeId, source.alias, source.originalId, event);
      } else {
        // Fallback - try to parse the ID
        const parts = nodeId.split(':');
        if (parts.length === 2) {
          onNodeClick(nodeId, parts[0], parts[1], event);
        }
      }
    },
    [onNodeClick, composedCanvas]
  );

  // Render empty state
  if (!composedCanvas || !composedCanvas.canvas.nodes?.length) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: theme.colors.textMuted,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            No nodes to display for this step
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#0a0a0a',
      }}
    >
      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && animateTransitions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration / 1000 / 2 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 10, 10, 0.5)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Graph renderer */}
      <motion.div
        key={currentStepIndex}
        initial={animateTransitions ? { opacity: 0, scale: 0.98 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: animationDuration / 1000 }}
        style={{ width: '100%', height: '100%' }}
      >
        <GraphRenderer
          canvas={composedCanvas.canvas}
          showMinimap={showMinimap}
          showControls={showControls}
          showBackground={false}
          backgroundVariant="lines"
          showTooltips={true}
          highlightedNodeId={highlightedNodeId}
          activeNodeIds={activeNodeIds}
          fitViewToNodeIds={shouldFitView ? activeNodeIds || undefined : undefined}
          fitViewPadding={0.2}
          onNodeClick={handleNodeClick}
        />
      </motion.div>

      {/* Step indicator badge */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          padding: '4px 10px',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: theme.fonts.monospace,
          color: theme.colors.textMuted,
          zIndex: 5,
        }}
      >
        {composedCanvas.canvas.nodes?.length} nodes from{' '}
        {new Set(Array.from(composedCanvas.nodeSourceMap.values()).map((s) => s.alias)).size} canvas
        {new Set(Array.from(composedCanvas.nodeSourceMap.values()).map((s) => s.alias)).size !== 1
          ? 'es'
          : ''}
      </div>
    </div>
  );
};

/**
 * Helper to convert explanation steps to story steps
 */
export function explanationStepsToStorySteps(
  steps: Array<{
    id: string;
    ref?: string;
    refs?: string[];
    focus?: {
      existing?: string[];
      modified?: string[];
      added?: string[];
    };
  }>,
  defaultCanvasAlias: string = 'main'
): StoryStep[] {
  return steps.map((step) => {
    const nodes: Record<string, string[]> = {};

    // Helper to add node to the correct canvas bucket
    const addNode = (ref: string) => {
      const parts = ref.split(':');
      if (parts.length === 2) {
        const [alias, nodeId] = parts;
        if (!nodes[alias]) nodes[alias] = [];
        if (!nodes[alias].includes(nodeId)) {
          nodes[alias].push(nodeId);
        }
      } else {
        // No alias - use default
        if (!nodes[defaultCanvasAlias]) nodes[defaultCanvasAlias] = [];
        if (!nodes[defaultCanvasAlias].includes(ref)) {
          nodes[defaultCanvasAlias].push(ref);
        }
      }
    };

    // Process ref
    if (step.ref) addNode(step.ref);

    // Process refs array
    if (step.refs) {
      step.refs.forEach(addNode);
    }

    // Process focus arrays
    if (step.focus?.existing) {
      step.focus.existing.forEach(addNode);
    }
    if (step.focus?.modified) {
      step.focus.modified.forEach(addNode);
    }
    if (step.focus?.added) {
      step.focus.added.forEach(addNode);
    }

    // Determine highlight node
    let highlightNodeId: string | undefined;
    if (step.ref) {
      const parts = step.ref.split(':');
      highlightNodeId = parts.length === 2 ? parts[1] : step.ref;
    }

    return {
      id: step.id,
      nodes,
      highlightNodeId,
    };
  });
}
