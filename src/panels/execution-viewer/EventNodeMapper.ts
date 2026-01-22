/**
 * Event Node Mapper
 *
 * Maps execution events to canvas nodes based on OTEL metadata.
 * Uses event schemas defined in canvas nodes to determine which node
 * should be highlighted when an event is played back.
 */

import type { ExtendedCanvas } from '@principal-ai/principal-view-core/browser';
import type { OtelAttributes } from '@principal-ai/principal-view-core/browser';

/**
 * Event from execution artifact
 */
export interface ExecutionEvent {
  name: string;
  time: number;
  attributes?: OtelAttributes;
}

/**
 * Event schema in node's pv metadata
 */
interface PVEventSchema {
  description?: string;
  attributes?: Record<string, unknown>;
}

/**
 * Node's pv metadata with OTEL information
 */
interface NodePv {
  events?: Record<string, PVEventSchema>;
  otel?: {
    resourceMatch?: Record<string, string | number | boolean>;
  };
}

/**
 * Maps an execution event to a canvas node ID.
 *
 * Strategy:
 * 1. Primary: Match event name to node's pv.events keys
 * 2. Fallback: Match event attributes to node's pv.otel.resourceMatch
 * 3. Default: Return null (no highlight)
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

  // Strategy 1: Match by event name in pv.events (Record<string, PVEventSchema>)
  for (const node of canvas.nodes) {
    const pvEvents = (node.pv as NodePv | undefined)?.events;
    if (pvEvents && typeof pvEvents === 'object' && event.name in pvEvents) {
      return node.id;
    }
  }

  // Strategy 2: Match by resourceMatch attributes
  if (event.attributes) {
    for (const node of canvas.nodes) {
      const resourceMatch = (node.pv as NodePv | undefined)?.otel?.resourceMatch;
      if (resourceMatch && typeof resourceMatch === 'object') {
        // Check if all resourceMatch conditions are satisfied by event attributes
        const matches = Object.entries(resourceMatch).every(([key, pattern]) => {
          const value = event.attributes?.[key];
          if (value === undefined) return false;

          // Handle wildcard patterns
          if (typeof pattern === 'string' && pattern === '*') {
            return true;
          }

          // Exact match
          return value === pattern;
        });

        if (matches) {
          return node.id;
        }
      }
    }
  }

  // Strategy 3: No match found
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
    const pvEvents = (node.pv as NodePv | undefined)?.events;
    if (pvEvents && typeof pvEvents === 'object') {
      for (const eventName of Object.keys(pvEvents)) {
        if (!map.has(eventName)) {
          map.set(eventName, node.id);
        }
      }
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

  for (const node of canvas.nodes) {
    const pvEvents = (node.pv as NodePv | undefined)?.events;
    if (pvEvents && typeof pvEvents === 'object') {
      const eventNames = Object.keys(pvEvents);
      if (eventNames.length > 0) {
        lines.push(`Node: ${node.id}`);
        for (const eventName of eventNames) {
          lines.push(`  - ${eventName}`);
        }
      }
    }
  }

  if (lines.length === 2) {
    lines.push('No event schemas found in canvas nodes');
  }

  return lines.join('\n');
}
