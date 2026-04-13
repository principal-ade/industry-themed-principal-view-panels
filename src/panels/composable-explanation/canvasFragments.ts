/**
 * Canvas Fragment Utilities
 *
 * Functions for extracting, composing, and laying out canvas fragments
 * from multiple source canvases into a single composite view.
 */

import type {
  ExtendedCanvas,
  ExtendedCanvasNode,
  ExtendedCanvasEdge,
} from '@principal-ai/principal-view-core';
import { isStandardCanvasNode } from '@principal-ai/principal-view-core';

/**
 * A fragment extracted from a canvas
 */
export interface CanvasFragment {
  /** Source canvas alias */
  sourceAlias: string;
  /** Extracted nodes */
  nodes: ExtendedCanvasNode[];
  /** Extracted edges (only those connecting extracted nodes) */
  edges: ExtendedCanvasEdge[];
  /** Bounding box of the fragment */
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}

/**
 * A bridge edge connecting nodes from different canvases
 */
export interface BridgeEdge {
  id: string;
  fromCanvas: string;
  fromNode: string;
  toCanvas: string;
  toNode: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Configuration for composing fragments
 */
export interface CompositionConfig {
  /** How to arrange multiple fragments */
  layout: 'horizontal' | 'vertical' | 'preserve' | 'auto';
  /** Gap between fragments when laid out */
  fragmentGap: number;
  /** Padding around the entire composition */
  padding: number;
  /** Whether to center the composition */
  center: boolean;
}

/**
 * Result of composing multiple fragments
 */
export interface ComposedCanvas {
  /** The composed canvas data */
  canvas: ExtendedCanvas;
  /** Map of original node IDs to composed node IDs */
  nodeIdMap: Map<string, string>;
  /** Source fragment info for each node */
  nodeSourceMap: Map<string, { alias: string; originalId: string }>;
}

/**
 * Default composition config
 */
export const DEFAULT_COMPOSITION_CONFIG: CompositionConfig = {
  layout: 'auto',
  fragmentGap: 100,
  padding: 50,
  center: true,
};

/**
 * Extract a fragment from a canvas containing only specified nodes
 * and edges connecting those nodes.
 */
export function extractFragment(
  canvas: ExtendedCanvas,
  nodeIds: string[],
  sourceAlias: string
): CanvasFragment {
  const nodeIdSet = new Set(nodeIds);

  // Extract matching nodes
  const nodes = (canvas.nodes || []).filter((node) => nodeIdSet.has(node.id));

  // Extract edges where both endpoints are in the fragment
  const edges = (canvas.edges || []).filter(
    (edge) => nodeIdSet.has(edge.fromNode) && nodeIdSet.has(edge.toNode)
  );

  // Calculate bounding box
  const bounds = calculateBounds(nodes);

  return {
    sourceAlias,
    nodes,
    edges,
    bounds,
  };
}

/**
 * Calculate the bounding box of a set of nodes
 */
export function calculateBounds(nodes: ExtendedCanvasNode[]): CanvasFragment['bounds'] {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const x = node.x || 0;
    const y = node.y || 0;
    const width = node.width || 100;
    const height = node.height || 50;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Compose multiple canvas fragments into a single canvas
 */
export function composeFragments(
  fragments: CanvasFragment[],
  bridgeEdges: BridgeEdge[] = [],
  config: Partial<CompositionConfig> = {}
): ComposedCanvas {
  const cfg = { ...DEFAULT_COMPOSITION_CONFIG, ...config };

  const composedNodes: ExtendedCanvasNode[] = [];
  const composedEdges: ExtendedCanvasEdge[] = [];
  const nodeIdMap = new Map<string, string>();
  const nodeSourceMap = new Map<string, { alias: string; originalId: string }>();

  // Determine layout
  const layout = cfg.layout === 'auto' ? determineAutoLayout(fragments) : cfg.layout;

  // Track position offset for each fragment
  let offsetX = cfg.padding;
  let offsetY = cfg.padding;

  for (const fragment of fragments) {
    // Calculate offset to apply to this fragment
    const fragmentOffsetX = layout === 'preserve' ? 0 : offsetX - fragment.bounds.minX;
    const fragmentOffsetY = layout === 'preserve' ? 0 : offsetY - fragment.bounds.minY;

    // Process nodes
    for (const node of fragment.nodes) {
      // Create unique ID for composed canvas
      const composedId = `${fragment.sourceAlias}:${node.id}`;

      // Clone and offset the node
      const composedNode: ExtendedCanvasNode = {
        ...node,
        id: composedId,
        x: (node.x || 0) + fragmentOffsetX,
        y: (node.y || 0) + fragmentOffsetY,
        // Preserve existing pv extension (only for standard canvas nodes)
        ...(isStandardCanvasNode(node) && node.pv ? { pv: node.pv } : {}),
      };

      composedNodes.push(composedNode);
      nodeIdMap.set(`${fragment.sourceAlias}:${node.id}`, composedId);
      nodeSourceMap.set(composedId, {
        alias: fragment.sourceAlias,
        originalId: node.id,
      });
    }

    // Process edges
    for (const edge of fragment.edges) {
      const composedEdge: ExtendedCanvasEdge = {
        ...edge,
        id: `${fragment.sourceAlias}:${edge.id}`,
        fromNode: `${fragment.sourceAlias}:${edge.fromNode}`,
        toNode: `${fragment.sourceAlias}:${edge.toNode}`,
      };

      composedEdges.push(composedEdge);
    }

    // Update offset for next fragment
    if (layout === 'horizontal') {
      offsetX += fragment.bounds.width + cfg.fragmentGap;
    } else if (layout === 'vertical') {
      offsetY += fragment.bounds.height + cfg.fragmentGap;
    }
  }

  // Add bridge edges
  for (const bridge of bridgeEdges) {
    const fromId = `${bridge.fromCanvas}:${bridge.fromNode}`;
    const toId = `${bridge.toCanvas}:${bridge.toNode}`;

    // Only add if both nodes exist in the composition
    if (nodeIdMap.has(fromId) && nodeIdMap.has(toId)) {
      const bridgeEdge: ExtendedCanvasEdge = {
        id: `bridge:${bridge.id}`,
        fromNode: fromId,
        toNode: toId,
        label: bridge.label,
      };

      composedEdges.push(bridgeEdge);
    }
  }

  // Create composed canvas
  const canvas: ExtendedCanvas = {
    nodes: composedNodes,
    edges: composedEdges,
  };

  return {
    canvas,
    nodeIdMap,
    nodeSourceMap,
  };
}

/**
 * Determine the best auto layout based on fragment dimensions
 */
function determineAutoLayout(fragments: CanvasFragment[]): 'horizontal' | 'vertical' {
  if (fragments.length <= 1) return 'horizontal';

  // Calculate total dimensions for each layout option
  const totalWidth = fragments.reduce((sum, f) => sum + f.bounds.width, 0);
  const totalHeight = fragments.reduce((sum, f) => sum + f.bounds.height, 0);

  // Prefer horizontal if fragments are taller than wide
  const avgAspectRatio = totalWidth / totalHeight;
  return avgAspectRatio < 1 ? 'horizontal' : 'vertical';
}

/**
 * Create a step-specific composed view from an explanation step
 */
export interface StepCanvasConfig {
  /** Node IDs to include, grouped by canvas alias */
  nodes: Record<string, string[]>;
  /** Bridge edges between canvases */
  bridges?: BridgeEdge[];
  /** Layout configuration */
  layout?: Partial<CompositionConfig>;
}

/**
 * Build a composed canvas for a specific step
 */
export function buildStepCanvas(
  canvases: Map<string, ExtendedCanvas>,
  config: StepCanvasConfig
): ComposedCanvas | null {
  const fragments: CanvasFragment[] = [];

  // Extract fragments from each canvas
  for (const [alias, nodeIds] of Object.entries(config.nodes)) {
    const canvas = canvases.get(alias);
    if (!canvas) {
      console.warn(`[buildStepCanvas] Canvas not found: ${alias}`);
      continue;
    }

    if (nodeIds.length === 0) continue;

    const fragment = extractFragment(canvas, nodeIds, alias);
    if (fragment.nodes.length > 0) {
      fragments.push(fragment);
    }
  }

  if (fragments.length === 0) {
    return null;
  }

  return composeFragments(fragments, config.bridges || [], config.layout);
}

/**
 * Calculate which nodes changed between two steps
 * Useful for animating transitions
 */
export interface StepTransition {
  /** Nodes that are new in the next step */
  entering: string[];
  /** Nodes that are removed in the next step */
  exiting: string[];
  /** Nodes that remain (may change position) */
  staying: string[];
}

export function calculateStepTransition(
  currentNodes: Set<string>,
  nextNodes: Set<string>
): StepTransition {
  const entering: string[] = [];
  const exiting: string[] = [];
  const staying: string[] = [];

  // Find entering and staying
  for (const nodeId of nextNodes) {
    if (currentNodes.has(nodeId)) {
      staying.push(nodeId);
    } else {
      entering.push(nodeId);
    }
  }

  // Find exiting
  for (const nodeId of currentNodes) {
    if (!nextNodes.has(nodeId)) {
      exiting.push(nodeId);
    }
  }

  return { entering, exiting, staying };
}
