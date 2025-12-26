import type { ExtendedCanvas } from '@principal-ai/principal-view-core';

export interface TraceFile {
  /** Unique identifier for this trace (derived from filename) */
  id: string;
  /** Display name for this trace */
  name: string;
  /** Full file path */
  path: string;
  /** Package name for monorepos (e.g., 'core' from 'packages/core/__traces__/') */
  packageName?: string;
}

export interface TraceMetadata {
  /** Trace name from canvas pv.name */
  name: string;
  /** Export timestamp from canvas pv.description */
  exportedAt?: string;
  /** Number of span nodes */
  spanCount: number;
  /** Number of service groups */
  serviceCount: number;
  /** List of service names */
  serviceNames: string[];
}

/**
 * Patterns for finding trace canvas files
 */
const TRACE_FILE_PATTERNS = [
  // Packages monorepo pattern: packages/core/__traces__/test-run.canvas.json
  /^packages\/([^/]+)\/__traces__\/(.+)\.canvas\.json$/,
  // Inside .principal-views: .principal-views/__traces__/test-run.canvas.json
  /^\.principal-views\/__traces__\/(.+)\.canvas\.json$/,
  // Direct __traces__ folder: __traces__/test-run.canvas.json
  /^__traces__\/(.+)\.canvas\.json$/,
];

/**
 * Extract trace name from filename
 */
function getTraceNameFromFilename(filename: string): string {
  // Convert kebab-case to Title Case for display
  return filename
    .replace(/\.canvas\.json$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Utility for loading and parsing trace canvas files from __traces__/ folders
 */
export class TraceLoader {
  /**
   * Parse JSON canvas content
   */
  static parseTraceCanvas(content: string): ExtendedCanvas {
    try {
      return JSON.parse(content) as ExtendedCanvas;
    } catch (error) {
      throw new Error(`Failed to parse trace canvas JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Extract metadata from a trace canvas
   */
  static getTraceMetadata(canvas: ExtendedCanvas): TraceMetadata {
    const nodes = canvas.nodes || [];

    // Count span nodes (nodeType === 'span')
    const spanCount = nodes.filter(n => n.pv?.nodeType === 'span').length;

    // Count and list service groups (nodeType === 'service' or type === 'group')
    const serviceNodes = nodes.filter(
      n => n.pv?.nodeType === 'service' || n.type === 'group'
    );
    const serviceCount = serviceNodes.length;
    const serviceNames = serviceNodes
      .map(n => {
        // Use pv.name if available, otherwise check for label on group nodes
        if (n.pv?.name) return n.pv.name;
        if (n.type === 'group' && 'label' in n) return n.label;
        return n.id;
      })
      .filter((name): name is string => typeof name === 'string');

    // Extract export timestamp from description (format: "Exported at 2025-12-26T01:11:11.110Z")
    let exportedAt: string | undefined;
    const description = canvas.pv?.description;
    if (description) {
      const match = description.match(/Exported at (.+)$/);
      if (match) {
        exportedAt = match[1];
      }
    }

    return {
      name: canvas.pv?.name || 'Untitled Trace',
      exportedAt,
      spanCount,
      serviceCount,
      serviceNames,
    };
  }

  /**
   * Find all trace canvas files in the file tree
   */
  static findTraceFiles(
    files: Array<{ path?: string; relativePath?: string; name?: string }>
  ): TraceFile[] {
    const traceFiles: TraceFile[] = [];

    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || filePath.split('/').pop() || '';

      // Check each pattern
      for (const pattern of TRACE_FILE_PATTERNS) {
        const match = filePath.match(pattern);
        if (match) {
          let id: string;
          let packageName: string | undefined;
          let baseName: string;

          if (pattern === TRACE_FILE_PATTERNS[0]) {
            // Packages pattern: packages/core/__traces__/test-run.canvas.json
            packageName = match[1];
            baseName = match[2];
            id = `${packageName}-${baseName}`;
          } else if (pattern === TRACE_FILE_PATTERNS[1]) {
            // .principal-views pattern: .principal-views/__traces__/test-run.canvas.json
            baseName = match[1];
            id = `pv-${baseName}`;
          } else {
            // Direct pattern: __traces__/test-run.canvas.json
            baseName = match[1];
            id = baseName;
          }

          traceFiles.push({
            id,
            name: getTraceNameFromFilename(fileName),
            path: filePath,
            packageName,
          });

          break; // Only match one pattern per file
        }
      }
    }

    // Sort by package name (if any) then by name
    return traceFiles.sort((a, b) => {
      if (a.packageName && b.packageName) {
        const pkgCompare = a.packageName.localeCompare(b.packageName);
        if (pkgCompare !== 0) return pkgCompare;
      } else if (a.packageName) {
        return -1;
      } else if (b.packageName) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }
}
