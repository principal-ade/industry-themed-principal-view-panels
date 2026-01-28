import type { WorkflowTemplate } from '@principal-ai/principal-view-core';

export interface WorkflowFile {
  /** Unique identifier for this narrative (derived from filename) */
  id: string;
  /** Display name for this narrative */
  name: string;
  /** Full file path */
  path: string;
  /** Package name for monorepos (e.g., 'core' from 'packages/core/__workflows__/') */
  packageName?: string;
  /** Referenced canvas file path from the narrative */
  canvasPath?: string;
}

export interface WorkflowMetadata {
  /** Narrative name from template */
  name: string;
  /** Description of the narrative */
  description?: string;
  /** Referenced canvas file */
  canvasPath?: string;
  /** Number of scenarios */
  scenarioCount: number;
  /** Scenario names */
  scenarioNames: string[];
  /** Default mode (flow or event) */
  defaultMode?: string;
}

/**
 * Patterns for finding narrative template files
 */
const NARRATIVE_FILE_PATTERNS = [
  // Packages monorepo pattern: packages/core/__workflows__/test-flow.workflow.json
  /^packages\/([^/]+)\/__workflows__\/(.+)\.narrative\.json$/,
  // Inside .principal-views: .principal-views/__workflows__/test-flow.workflow.json
  /^\.principal-views\/__workflows__\/(.+)\.narrative\.json$/,
  // Direct __workflows__ folder: __workflows__/test-flow.workflow.json
  /^__workflows__\/(.+)\.narrative\.json$/,
  // Alternative: .principal-views/*.workflow.json (root level)
  /^\.principal-views\/([^/]+)\.narrative\.json$/,
];

/**
 * Extract narrative name from filename
 */
function getNarrativeNameFromFilename(filename: string): string {
  // Convert kebab-case to Title Case for display
  return filename
    .replace(/\.narrative\.json$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Utility for loading and parsing narrative template files from __workflows__/ folders
 */
export class WorkflowLoader {
  /**
   * Parse JSON narrative template content
   */
  static parseWorkflowTemplate(content: string): WorkflowTemplate {
    try {
      return JSON.parse(content) as WorkflowTemplate;
    } catch (error) {
      throw new Error(`Failed to parse narrative template JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Extract metadata from a narrative template
   */
  static getWorkflowMetadata(narrative: WorkflowTemplate): WorkflowMetadata {
    const scenarios = narrative.scenarios || [];

    // Count scenarios
    const scenarioCount = scenarios.length;

    // Extract scenario descriptions (scenarios use 'id' and 'description', not 'name')
    const scenarioNames = scenarios
      .map(s => s.description || s.id || 'Untitled Scenario')
      .filter((name): name is string => typeof name === 'string');

    return {
      name: narrative.name || 'Untitled Narrative',
      description: narrative.description,
      canvasPath: narrative.canvas,
      scenarioCount,
      scenarioNames,
      defaultMode: narrative.mode,
    };
  }

  /**
   * Find all narrative template files in the file tree
   */
  static findWorkflowFiles(
    files: Array<{ path?: string; relativePath?: string; name?: string }>
  ): WorkflowFile[] {
    const narrativeFiles: WorkflowFile[] = [];

    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || filePath.split('/').pop() || '';

      // Check each pattern
      for (const pattern of NARRATIVE_FILE_PATTERNS) {
        const match = filePath.match(pattern);
        if (match) {
          let id: string;
          let packageName: string | undefined;
          let baseName: string;

          if (pattern === NARRATIVE_FILE_PATTERNS[0]) {
            // Packages pattern: packages/core/__workflows__/test-flow.workflow.json
            packageName = match[1];
            baseName = match[2];
            id = `${packageName}-${baseName}`;
          } else if (pattern === NARRATIVE_FILE_PATTERNS[1]) {
            // .principal-views/__workflows__ pattern
            baseName = match[1];
            id = `pv-narratives-${baseName}`;
          } else if (pattern === NARRATIVE_FILE_PATTERNS[2]) {
            // Direct __workflows__ pattern
            baseName = match[1];
            id = baseName;
          } else {
            // .principal-views/*.workflow.json (root level)
            baseName = match[1];
            id = `pv-${baseName}`;
          }

          narrativeFiles.push({
            id,
            name: getNarrativeNameFromFilename(fileName),
            path: filePath,
            packageName,
          });

          break; // Only match one pattern per file
        }
      }
    }

    // Sort by package name (if any) then by name
    return narrativeFiles.sort((a, b) => {
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

  /**
   * Match narrative files to canvas files based on the canvas reference in the narrative
   *
   * @param narrativeFiles - List of narrative files discovered
   * @param narrativeContents - Map of narrative file paths to their parsed content
   * @returns Map of canvas file paths to their associated narrative files
   */
  static matchNarrativesToCanvas(
    narrativeFiles: WorkflowFile[],
    narrativeContents: Map<string, WorkflowTemplate>
  ): Map<string, WorkflowFile[]> {
    const canvasToNarratives = new Map<string, WorkflowFile[]>();

    for (const narrativeFile of narrativeFiles) {
      const narrative = narrativeContents.get(narrativeFile.path);
      if (!narrative || !narrative.canvas) {
        continue;
      }

      // Resolve the canvas path relative to the narrative file location
      const canvasPath = this.resolveCanvasPath(narrativeFile.path, narrative.canvas);

      // Update narrative file with resolved canvas path
      narrativeFile.canvasPath = canvasPath;

      // Add to the map
      const existing = canvasToNarratives.get(canvasPath) || [];
      existing.push(narrativeFile);
      canvasToNarratives.set(canvasPath, existing);
    }

    return canvasToNarratives;
  }

  /**
   * Resolve canvas path relative to narrative file location
   *
   * @param workflowPath - Path to the narrative file
   * @param canvasReference - Canvas reference from the narrative (e.g., "./test.otel.canvas")
   * @returns Resolved canvas path
   */
  private static resolveCanvasPath(workflowPath: string, canvasReference: string): string {
    // Get the directory containing the narrative file
    const narrativeDir = workflowPath.split('/').slice(0, -1).join('/');

    // Handle relative paths
    if (canvasReference.startsWith('./')) {
      const cleanRef = canvasReference.slice(2);
      return narrativeDir ? `${narrativeDir}/${cleanRef}` : cleanRef;
    }

    // Handle parent directory references
    if (canvasReference.startsWith('../')) {
      const parts = narrativeDir.split('/');
      const refParts = canvasReference.split('/');

      let upCount = 0;
      for (const part of refParts) {
        if (part === '..') {
          upCount++;
        } else {
          break;
        }
      }

      const remainingRef = refParts.slice(upCount).join('/');
      const resolvedDir = parts.slice(0, -upCount).join('/');
      return resolvedDir ? `${resolvedDir}/${remainingRef}` : remainingRef;
    }

    // Absolute or direct reference
    return canvasReference;
  }
}
