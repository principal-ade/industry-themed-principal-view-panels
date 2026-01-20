import type { OtelAttributes } from '@principal-ai/principal-view-core/browser';

export interface ExecutionFile {
  /** Unique identifier for this execution (derived from filename) */
  id: string;
  /** Display name for this execution */
  name: string;
  /** Full file path */
  path: string;
  /** Canvas basename (without extension) that this execution is linked to */
  canvasBasename: string;
  /** Package name for monorepos (e.g., 'core' from 'packages/core/__executions__/') */
  packageName?: string;
}

export interface CanvasFile {
  /** Unique identifier for this canvas (derived from filename) */
  id: string;
  /** Display name for this canvas */
  name: string;
  /** Full file path */
  path: string;
  /** Whether this is from a config folder or standalone */
  source: 'folder' | 'standalone';
  /** Canvas basename (without .otel.canvas or .canvas extension) */
  basename: string;
  /** Type of canvas file */
  type: 'otel' | 'regular';
}

export interface ExecutionMetadata {
  /** Execution name */
  name: string;
  /** Canvas name this execution is associated with */
  canvasName?: string;
  /** Export timestamp */
  exportedAt?: string;
  /** Source of execution (e.g., "test:event-validation") */
  source?: string;
  /** Test framework used */
  framework?: string;
  /** Execution status */
  status?: 'success' | 'error' | 'OK';
  /** Number of spans */
  spanCount: number;
  /** Number of events across all spans */
  eventCount: number;
}

export interface ExecutionSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: string;
  attributes?: OtelAttributes;
  events: Array<{
    time: number;
    name: string;
    attributes?: OtelAttributes;
  }>;
}

export interface ExecutionArtifact {
  metadata?: {
    canvasName?: string;
    exportedAt?: string;
    source?: string;
    framework?: string;
    status?: 'success' | 'error';
  };
  spans: ExecutionSpan[];
}

/**
 * Patterns for finding execution artifact files
 */
const EXECUTION_FILE_PATTERNS = [
  // Packages monorepo pattern: packages/core/__executions__/api-tests.spans.json
  /^packages\/([^/]+)\/__executions__\/(.+)\.(?:spans|execution|events|otel)\.json$/,
  // Inside .principal-views: .principal-views/__executions__/graph-converter.spans.json
  /^\.principal-views\/__executions__\/(.+)\.(?:spans|execution|events|otel)\.json$/,
  // Direct __executions__ folder: __executions__/test-run.spans.json
  /^__executions__\/(.+)\.(?:spans|execution|events|otel)\.json$/,
];

/**
 * Extract execution name from filename
 */
function getExecutionNameFromFilename(filename: string): string {
  // Convert kebab-case to Title Case for display
  return filename
    .replace(/\.(?:spans|execution|events|otel)\.json$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract canvas basename from execution filename
 */
function getCanvasBasename(filename: string): string {
  return filename.replace(/\.(?:spans|execution|events|otel)\.json$/, '');
}

/**
 * Utility for loading and parsing execution artifact files from __executions__/ folders
 */
export class ExecutionLoader {
  /**
   * Parse JSON execution artifact content
   */
  static parseExecutionArtifact(content: string): ExecutionArtifact {
    try {
      const parsed = JSON.parse(content);
      return parsed as ExecutionArtifact;
    } catch (error) {
      throw new Error(`Failed to parse execution artifact JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Get spans array from artifact
   */
  static getSpans(artifact: ExecutionArtifact): ExecutionSpan[] {
    return artifact.spans;
  }

  /**
   * Extract metadata from an execution artifact
   */
  static getExecutionMetadata(artifact: ExecutionArtifact): ExecutionMetadata {
    const spans = ExecutionLoader.getSpans(artifact);
    const spanCount = spans.length;

    // Count total events across all spans
    const eventCount = spans.reduce((total, span) => {
      return total + (span.events?.length || 0);
    }, 0);

    // Extract metadata if available
    const metadata = artifact.metadata;

    // Determine status from spans if not in metadata
    let status: 'success' | 'error' | 'OK' = 'success';
    if (metadata?.status) {
      status = metadata.status;
    } else if (spans.length > 0) {
      // Check if any span has error status
      const hasError = spans.some(s =>
        s.status === 'ERROR' || s.status === 'error' || s.status === 'FAILED'
      );
      status = hasError ? 'error' : 'OK';
    }

    return {
      name: metadata?.canvasName || 'Untitled Execution',
      canvasName: metadata?.canvasName,
      exportedAt: metadata?.exportedAt,
      source: metadata?.source,
      framework: metadata?.framework,
      status,
      spanCount,
      eventCount,
    };
  }

  /**
   * Find all execution artifact files in the file tree
   */
  static findExecutionFiles(
    files: Array<{ path?: string; relativePath?: string; name?: string }>
  ): ExecutionFile[] {
    const executionFiles: ExecutionFile[] = [];

    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || filePath.split('/').pop() || '';

      // Check each pattern
      for (const pattern of EXECUTION_FILE_PATTERNS) {
        const match = filePath.match(pattern);
        if (match) {
          let id: string;
          let packageName: string | undefined;
          let baseName: string;

          if (pattern === EXECUTION_FILE_PATTERNS[0]) {
            // Packages pattern: packages/core/__executions__/test-run.spans.json
            packageName = match[1];
            baseName = match[2];
            id = `${packageName}-${baseName}`;
          } else if (pattern === EXECUTION_FILE_PATTERNS[1]) {
            // .principal-views pattern: .principal-views/__executions__/test-run.spans.json
            baseName = match[1];
            id = `pv-${baseName}`;
          } else {
            // Direct pattern: __executions__/test-run.spans.json
            baseName = match[1];
            id = baseName;
          }

          executionFiles.push({
            id,
            name: getExecutionNameFromFilename(fileName),
            path: filePath,
            canvasBasename: getCanvasBasename(fileName),
            packageName,
          });

          break; // Only match one pattern per file
        }
      }
    }

    // Sort by package name (if any) then by name
    return executionFiles.sort((a, b) => {
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
   * Find all .canvas files (both .otel.canvas and regular .canvas) in the file tree
   */
  static findCanvasFiles(
    files: Array<{ path?: string; relativePath?: string; name?: string }>
  ): CanvasFile[] {
    const canvasFiles: CanvasFile[] = [];
    const VGC_FOLDER = '.principal-views';

    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || filePath.split('/').pop() || '';

      // Check for .canvas files in .principal-views/ folder
      if (filePath.startsWith(`${VGC_FOLDER}/`)) {
        let basename: string | null = null;
        let type: 'otel' | 'regular' | null = null;

        // Check for .otel.canvas files
        if (fileName.endsWith('.otel.canvas')) {
          basename = fileName.replace(/\.otel\.canvas$/, '');
          type = 'otel';
        }
        // Check for regular .canvas files (but not .otel.canvas)
        else if (fileName.endsWith('.canvas') && !fileName.endsWith('.otel.canvas')) {
          basename = fileName.replace(/\.canvas$/, '');
          type = 'regular';
        }

        if (basename && type) {
          // Convert kebab-case to Title Case for display
          const displayName = basename
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          canvasFiles.push({
            id: basename,
            name: displayName,
            path: filePath,
            source: 'folder',
            basename,
            type,
          });
        }
      }
    }

    // Sort by name
    return canvasFiles.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Find execution artifact for a given canvas file path
   */
  static findExecutionForCanvas(
    canvasPath: string,
    files: Array<{ path?: string; relativePath?: string; name?: string }>
  ): ExecutionFile | null {
    // Extract canvas basename (only for .otel.canvas files)
    const canvasFilename = canvasPath.split('/').pop() || '';
    const canvasBasename = canvasFilename.replace(/\.otel\.canvas$/, '');

    // Find all execution files
    const executions = ExecutionLoader.findExecutionFiles(files);

    // Find matching execution by basename
    return executions.find(exec => exec.canvasBasename === canvasBasename) || null;
  }

  /**
   * Find canvas file for a given execution artifact path
   * Prioritizes .otel.canvas files over regular .canvas files
   */
  static findCanvasForExecution(
    executionPath: string,
    files: Array<{ path?: string; relativePath?: string; name?: string }>
  ): string | null {
    const executionFilename = executionPath.split('/').pop() || '';
    const canvasBasename = getCanvasBasename(executionFilename);

    // First, look for .otel.canvas files
    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || filePath.split('/').pop() || '';

      if (fileName === `${canvasBasename}.otel.canvas`) {
        return filePath;
      }
    }

    // Fallback to regular .canvas files
    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || filePath.split('/').pop() || '';

      if (fileName === `${canvasBasename}.canvas`) {
        return filePath;
      }
    }

    return null;
  }
}
