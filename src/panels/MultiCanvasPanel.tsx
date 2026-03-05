import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MultiCanvasRenderer, type MultiCanvasLayout } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas } from '@principal-ai/principal-view-core';
import { ConfigLoader } from './principal-view/ConfigLoader';
import type { MultiCanvasPanelPropsTyped } from '../types';

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

/**
 * Base props for display options (shared between both modes)
 */
interface MultiCanvasPanelDisplayProps {
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
  /** Optional click handler for nodes */
  onNodeClick?: (nodeId: string) => void;
}

/**
 * Props for static layout mode (used in stories)
 */
interface StaticLayoutProps extends MultiCanvasPanelDisplayProps {
  /** Pre-built layout with canvas data */
  layout: MultiCanvasLayout;
  canvasInfos?: never;
  context?: never;
  actions?: never;
  direction?: never;
  gap?: never;
  columns?: never;
}

/**
 * Props for dynamic loading mode (used in production)
 */
interface DynamicLoadingProps extends MultiCanvasPanelPropsTyped, MultiCanvasPanelDisplayProps {
  /** Canvas infos with paths to load */
  canvasInfos: CanvasInfo[];
  /** Layout direction */
  direction?: 'vertical' | 'horizontal' | 'grid';
  /** Gap between canvases */
  gap?: number;
  /** Number of columns for grid layout */
  columns?: number;
  layout?: never;
}

export type MultiCanvasPanelProps = StaticLayoutProps | DynamicLoadingProps;

interface LoadedCanvas {
  id: string;
  canvas: ExtendedCanvas;
  label?: string;
}

/**
 * Helper to check if props are for static layout mode
 */
function isStaticLayoutProps(props: MultiCanvasPanelProps): props is StaticLayoutProps {
  return 'layout' in props && props.layout !== undefined;
}

/**
 * MultiCanvasPanel loads and displays multiple canvases on a single unified view
 * using the MultiCanvasRenderer from principal-view-react.
 *
 * Supports two modes:
 * 1. Static layout mode: Pass a pre-built `layout` prop (used in stories)
 * 2. Dynamic loading mode: Pass `canvasInfos`, `context`, and `actions` to load from files
 */
export const MultiCanvasPanel: React.FC<MultiCanvasPanelProps> = (props) => {
  const {
    showGroups = true,
    showMinimap = true,
    showControls = true,
    showBackground = true,
    backgroundVariant = 'dots',
    onNodeClick,
  } = props;

  // Static layout mode - render directly
  if (isStaticLayoutProps(props)) {
    return (
      <MultiCanvasRenderer
        layout={props.layout}
        showGroups={showGroups}
        showMinimap={showMinimap}
        showControls={showControls}
        showBackground={showBackground}
        backgroundVariant={backgroundVariant}
        onNodeClick={onNodeClick}
      />
    );
  }

  // Dynamic loading mode
  return (
    <DynamicMultiCanvasPanel
      {...props}
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
 * Internal component for dynamic loading mode
 */
const DynamicMultiCanvasPanel: React.FC<DynamicLoadingProps> = ({
  context,
  actions,
  canvasInfos,
  showGroups,
  showMinimap,
  showControls,
  showBackground,
  backgroundVariant,
  direction = 'grid',
  gap = 150,
  columns = 2,
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

    const readFile = acts?.readFile;
    if (!readFile) {
      setError('readFile action not available');
      setLoading(false);
      return;
    }

    const repositoryPath = (ctx as { repositoryPath?: string } | undefined)?.repositoryPath;
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
        Loading {canvasInfos?.length ?? 0} canvases...
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
  const layout = createMultiCanvasLayout(loadedCanvases, { direction, gap, columns });

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
    direction?: 'vertical' | 'horizontal' | 'grid';
    gap?: number;
    columns?: number;
  }
): MultiCanvasLayout {
  const direction = options?.direction ?? 'grid';
  const gap = options?.gap ?? 100;
  const columns = options?.columns ?? 2;

  if (direction === 'grid') {
    // Calculate max dimensions for each canvas to create uniform grid cells
    const canvasDimensions = canvases.map(({ canvas }) => {
      const nodes = canvas.nodes ?? [];
      const maxX = nodes.length > 0 ? Math.max(...nodes.map((n) => (n.x ?? 0) + (n.width ?? 200))) : 400;
      const maxY = nodes.length > 0 ? Math.max(...nodes.map((n) => (n.y ?? 0) + (n.height ?? 100))) : 200;
      return { width: maxX, height: maxY };
    });

    // Find max width and height for uniform cell sizing
    const cellWidth = Math.max(...canvasDimensions.map((d) => d.width)) + gap;
    const cellHeight = Math.max(...canvasDimensions.map((d) => d.height)) + gap;

    const placements = canvases.map(({ id, canvas, label }, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      return {
        canvasId: id,
        canvas,
        position: { x: col * cellWidth, y: row * cellHeight },
        label,
      };
    });

    return { placements };
  }

  // Linear layout (vertical or horizontal)
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
