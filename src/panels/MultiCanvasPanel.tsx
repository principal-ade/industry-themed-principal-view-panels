import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MultiCanvasRenderer, type MultiCanvasLayout } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas } from '@principal-ai/principal-view-core';
import { ConfigLoader } from './principal-view/ConfigLoader';

/**
 * Canvas info with path for loading
 */
export interface CanvasInfo {
  /** Unique identifier */
  id: string;
  /** Path to load the canvas from (relative to repository root) */
  path: string;
  /** Display label */
  label?: string;
}

export interface MultiCanvasPanelProps {
  /** Context from panel framework */
  context: {
    repositoryPath?: string;
    [key: string]: unknown;
  };
  /** Actions from panel framework */
  actions: {
    readFile?: (path: string) => Promise<string>;
    [key: string]: unknown;
  };
  /** Canvas infos with paths to load */
  canvasInfos: CanvasInfo[];
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
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  /** Gap between canvases */
  gap?: number;
  /** Optional click handler for nodes */
  onNodeClick?: (nodeId: string) => void;
}

interface LoadedCanvas {
  id: string;
  canvas: ExtendedCanvas;
  label?: string;
}

/**
 * MultiCanvasPanel loads and displays multiple canvases on a single unified view
 * using the MultiCanvasRenderer from principal-view-react.
 */
export const MultiCanvasPanel: React.FC<MultiCanvasPanelProps> = ({
  context,
  actions,
  canvasInfos,
  showGroups = true,
  showMinimap = true,
  showControls = true,
  showBackground = true,
  backgroundVariant = 'dots',
  direction = 'vertical',
  gap = 150,
  onNodeClick,
}) => {
  const [loadedCanvases, setLoadedCanvases] = useState<LoadedCanvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid stale closures
  const contextRef = useRef(context);
  const actionsRef = useRef(actions);

  useEffect(() => {
    contextRef.current = context;
    actionsRef.current = actions;
  });

  const loadCanvases = useCallback(async () => {
    const ctx = contextRef.current;
    const acts = actionsRef.current;

    const readFile = acts.readFile;
    if (!readFile) {
      setError('readFile action not available');
      setLoading(false);
      return;
    }

    const repositoryPath = ctx.repositoryPath as string | undefined;
    if (!repositoryPath) {
      setError('Repository path not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loaded: LoadedCanvas[] = [];

      for (const info of canvasInfos) {
        try {
          const fullPath = `${repositoryPath}/${info.path}`;
          const content = await readFile(fullPath);

          if (content && typeof content === 'string') {
            const canvas = ConfigLoader.parseCanvas(content);
            if (canvas) {
              loaded.push({
                id: info.id,
                canvas,
                label: info.label,
              });
            }
          }
        } catch (err) {
          console.warn(`[MultiCanvasPanel] Failed to load canvas ${info.path}:`, err);
          // Continue loading other canvases
        }
      }

      setLoadedCanvases(loaded);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load canvases');
      setLoading(false);
    }
  }, [canvasInfos]);

  useEffect(() => {
    loadCanvases();
  }, [loadCanvases]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#888',
        fontSize: '14px',
      }}>
        Loading {canvasInfos.length} canvases...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#ef4444',
        fontSize: '14px',
      }}>
        Error: {error}
      </div>
    );
  }

  if (loadedCanvases.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#888',
        fontSize: '14px',
      }}>
        No canvases loaded
      </div>
    );
  }

  // Build the layout from loaded canvases
  const layout = createMultiCanvasLayout(loadedCanvases, { direction, gap });

  return (
    <MultiCanvasRenderer
      layout={layout}
      showGroups={showGroups}
      showMinimap={showMinimap}
      showControls={showControls}
      showBackground={showBackground}
      backgroundVariant={backgroundVariant}
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
