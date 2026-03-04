import React from 'react';
import { MultiCanvasRenderer, type MultiCanvasLayout } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas } from '@principal-ai/principal-view-core';

export interface MultiCanvasPanelProps {
  /** Layout configuration with canvas placements */
  layout: MultiCanvasLayout;
  /** Whether to show group borders around each canvas (default: true) */
  showGroups?: boolean;
  /** Show minimap for navigation (default: false) */
  showMinimap?: boolean;
  /** Show view controls (default: true) */
  showControls?: boolean;
  /** Show background pattern (default: true) */
  showBackground?: boolean;
  /** Background pattern variant */
  backgroundVariant?: 'dots' | 'lines' | 'cross';
  /** Width of the panel */
  width?: number;
  /** Height of the panel */
  height?: number;
  /** Optional click handler for nodes */
  onNodeClick?: (nodeId: string) => void;
}

/**
 * MultiCanvasPanel displays multiple canvases on a single unified view
 * using the MultiCanvasRenderer from principal-view-react.
 */
export const MultiCanvasPanel: React.FC<MultiCanvasPanelProps> = ({
  layout,
  showGroups = true,
  showMinimap = false,
  showControls = true,
  showBackground = true,
  backgroundVariant = 'dots',
  width,
  height,
  onNodeClick,
}) => {
  return (
    <MultiCanvasRenderer
      layout={layout}
      showGroups={showGroups}
      showMinimap={showMinimap}
      showControls={showControls}
      showBackground={showBackground}
      backgroundVariant={backgroundVariant}
      width={width}
      height={height}
      onNodeClick={onNodeClick}
    />
  );
};

/**
 * Helper function to create a MultiCanvasLayout from an array of canvases
 */
export function createMultiCanvasLayout(
  canvases: Array<{
    id: string;
    canvas: ExtendedCanvas;
    label?: string;
  }>,
  options?: {
    direction?: 'vertical' | 'horizontal';
    gap?: number;
  }
): MultiCanvasLayout {
  const direction = options?.direction ?? 'vertical';
  const gap = options?.gap ?? 100;

  let currentOffset = 0;

  const placements = canvases.map(({ id, canvas, label }) => {
    const placement = {
      canvasId: id,
      canvas,
      position:
        direction === 'vertical' ? { x: 0, y: currentOffset } : { x: currentOffset, y: 0 },
      label,
    };

    // Calculate the bounds of this canvas to determine offset for next canvas
    const nodes = canvas.nodes ?? [];
    const maxY = nodes.length > 0 ? Math.max(...nodes.map((n) => (n.y ?? 0) + (n.height ?? 100))) : 200;
    const maxX = nodes.length > 0 ? Math.max(...nodes.map((n) => (n.x ?? 0) + (n.width ?? 200))) : 400;

    currentOffset += (direction === 'vertical' ? maxY : maxX) + gap;

    return placement;
  });

  return { placements };
}
