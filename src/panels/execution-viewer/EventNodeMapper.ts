/**
 * Event Node Mapper
 *
 * Maps execution events to canvas nodes based on OTEL metadata.
 * Uses event schemas defined in canvas nodes to determine which node
 * should be highlighted when an event is played back.
 */

import type { ExtendedCanvas, OtelAttributes } from '@principal-ai/principal-view-core';
import { getNodeEventName } from '@principal-ai/principal-view-core';

/**
 * Event from execution artifact
 */
export interface ExecutionEvent {
  name: string;
  time: number;
  /** Kept for API compatibility - not currently used for matching */
  attributes?: OtelAttributes;
}

/**
 * Maps an execution event to a canvas node ID.
 *
 * Matches by event name using the canonical getNodeEventName() from core,
 * which supports all event reference formats (pv.event.name, pv.eventRef,
 * top-level event.name, top-level eventRef).
 *
 * @param event - The execution event to map
 * @param canvas - The canvas containing nodes with OTEL metadata
 * @returns Node ID to highlight, or null if no match
 */
export function mapEventToNodeId(
  event: ExecutionEvent,
  canvas: ExtendedCanvas | null
): string | null {
  if (!canvas || !canvas.nodes || canvas.nodes.length === 0) {
    return null;
  }

  for (const node of canvas.nodes) {
    const nodeEventName = getNodeEventName(node);
    if (nodeEventName === event.name) {
      return node.id;
    }
  }

  return null;
}

/**
 * Pre-builds a mapping of event names to node IDs for faster lookups.
 * Useful when processing many events sequentially.
 *
 * @param canvas - The canvas to build the mapping from
 * @returns Map of event name to node ID
 */
export function buildEventToNodeMap(
  canvas: ExtendedCanvas | null
): Map<string, string> {
  const map = new Map<string, string>();

  if (!canvas || !canvas.nodes) {
    return map;
  }

  for (const node of canvas.nodes) {
    const nodeEventName = getNodeEventName(node);
    if (nodeEventName && !map.has(nodeEventName)) {
      map.set(nodeEventName, node.id);
    }
  }

  return map;
}

/**
 * Debug helper to show which events map to which nodes.
 *
 * @param canvas - The canvas to analyze
 * @returns Human-readable mapping information
 */
export function debugEventMapping(canvas: ExtendedCanvas | null): string {
  if (!canvas || !canvas.nodes) {
    return 'No canvas or nodes available';
  }

  const lines: string[] = [];
  lines.push('Event → Node Mapping:');
  lines.push('');

  let eventCount = 0;
  for (const node of canvas.nodes) {
    const nodeEventName = getNodeEventName(node);
    if (nodeEventName) {
      lines.push(`Node: ${node.id}`);
      lines.push(`  - ${nodeEventName}`);
      eventCount++;
    }
  }

  if (eventCount === 0) {
    lines.push('No event schemas found in canvas nodes');
  }

  return lines.join('\n');
}
