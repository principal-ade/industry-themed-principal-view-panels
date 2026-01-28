import { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelContextValue, PanelActions } from '@principal-ade/panel-framework-core';
import {
  CanvasDiscovery,
  type DiscoveredCanvas,
  type DiscoveredStoryboard,
  type DiscoveredExecution
} from '@principal-ai/principal-view-core';
import type { FileTree } from '@principal-ai/repository-abstraction';

interface UseCanvasDataParams {
  context: PanelContextValue;
  actions: PanelActions;
}

interface UseCanvasDataReturn {
  canvases: DiscoveredCanvas[];
  storyboards: DiscoveredStoryboard[];
  executions: DiscoveredExecution[];
  isLoading: boolean;
  error: string | null;
  refreshCanvases: () => Promise<void>;
}

// Stable empty arrays to prevent unnecessary re-renders
const EMPTY_CANVAS_ARRAY: DiscoveredCanvas[] = [];
const EMPTY_STORYBOARDS_ARRAY: DiscoveredStoryboard[] = [];
const EMPTY_EXECUTIONS_ARRAY: DiscoveredExecution[] = [];

/**
 * Hook to discover and load canvas files from the file tree
 * Uses the new package-aware CanvasDiscovery system
 */
export const useCanvasData = ({
  context,
  actions,
}: UseCanvasDataParams): UseCanvasDataReturn => {
  const [canvases, setCanvases] = useState<DiscoveredCanvas[]>(EMPTY_CANVAS_ARRAY);
  const [storyboards, setStoryboards] = useState<DiscoveredStoryboard[]>(EMPTY_STORYBOARDS_ARRAY);
  const [executions, setExecutions] = useState<DiscoveredExecution[]>(EMPTY_EXECUTIONS_ARRAY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract stable references from context to avoid unnecessary re-renders
  const fileTreeSlice = context.getSlice('fileTree');
  const fileTreeData = fileTreeSlice?.data as FileTree | null;
  const fileTreeSha = fileTreeData?.sha;

  // Get readFile from actions parameter
  const readFile = (actions as { readFile?: (path: string) => Promise<string> }).readFile;

  // Track the last loaded SHA to prevent redundant loads
  const lastLoadedSha = useRef<string | undefined>(undefined);

  // Create discovery instance once
  const discovery = useRef(new CanvasDiscovery());

  const loadCanvases = useCallback(async () => {
    // Skip if we've already loaded this exact data
    if (fileTreeSha === lastLoadedSha.current) {
      console.log('[useCanvasData] Skipping reload - data unchanged (SHA:', fileTreeSha, ')');
      return;
    }

    console.log('[useCanvasData] Loading canvases - SHA changed:', fileTreeSha !== lastLoadedSha.current);

    setIsLoading(true);
    setError(null);

    try {
      if (!fileTreeData) {
        setCanvases(EMPTY_CANVAS_ARRAY);
        lastLoadedSha.current = fileTreeSha;
        return;
      }

      // Use new CanvasDiscovery system with FileTree (includes full FileInfo[] with lastModified)
      console.log('[useCanvasData] Calling discovery with fileTree:', {
        sha: fileTreeData.sha,
        totalFiles: fileTreeData.allFiles.length,
        totalDirs: fileTreeData.allDirectories.length,
        sampleFiles: fileTreeData.allFiles.slice(0, 5).map(f => f.path),
      });

      const result = await discovery.current.discover(fileTreeData, {
        // Include content to extract markdown paths from pv.markdown field
        includeContent: true,
        fileReader: async (path: string) => {
          if (!readFile) {
            throw new Error('readFile action not available');
          }
          return await readFile(path);
        },
      });

      console.log('[useCanvasData] Discovery result:', {
        canvases: result.canvases.length,
        storyboards: result.storyboards.length,
        executions: result.executions.length,
        errors: result.errors.length,
      });

      if (result.canvases.length > 0) {
        console.log('[useCanvasData] Canvases:', result.canvases.map(c => {
          const canvasDir = c.path.split('/').slice(0, -1).join('/');
          return {
            id: c.id,
            name: c.name,
            path: c.path,
            basename: c.basename,
            canvasDir: canvasDir,  // This is what discovery compares
            expectedStoryboardPath: canvasDir,
            expectedStoryboardName: canvasDir.split('/').pop(),
          };
        }));
      }

      if (result.storyboards.length > 0) {
        console.log('[useCanvasData] Storyboards:', result.storyboards.map(s => ({
          id: s.id,
          name: s.name,
          path: s.path,
          workflows: s.workflows.length,
        })));
      } else {
        console.warn('[useCanvasData] No storyboards found! Checking file structure...');
        // Log files that should be part of storyboards
        const pvFiles = fileTreeData.allFiles.filter(f => f.path.includes('.principal-views'));
        console.log('[useCanvasData] Files in .principal-views:', pvFiles.map(f => ({
          path: f.path,
          relativePath: f.relativePath,
          parts: f.path.split('/').length,
        })));

        // Manually simulate the storyboard detection logic to debug
        console.log('[useCanvasData] Simulating storyboard detection:');
        const storyboardDirs = new Map();
        for (const file of fileTreeData.allFiles) {
          const path = file.relativePath || file.path || '';
          const parts = path.split('/');
          const pvIndex = parts.indexOf('.principal-views');

          if (pvIndex !== -1 && parts.length >= pvIndex + 3) {
            const storyboardName = parts[pvIndex + 1];
            const storyboardPath = parts.slice(0, pvIndex + 2).join('/');
            console.log(`  File: ${path} -> storyboard: ${storyboardName} at ${storyboardPath}`);

            if (!storyboardDirs.has(storyboardPath)) {
              storyboardDirs.set(storyboardPath, new Set());
            }
            storyboardDirs.get(storyboardPath).add(storyboardName);
          }
        }

        console.log('[useCanvasData] Detected storyboard directories:', Array.from(storyboardDirs.entries()).map(([path, names]) => ({
          path,
          storyboardNames: Array.from(names),
        })));

        // Check which canvases match
        for (const [storyboardParentPath, storyboardNames] of storyboardDirs) {
          for (const storyboardName of storyboardNames) {
            const storyboardPath = `${storyboardParentPath}/${storyboardName}`;
            const matchingCanvas = result.canvases.find(c => {
              const canvasDir = c.path.split('/').slice(0, -1).join('/');
              return canvasDir === storyboardPath && c.basename === storyboardName;
            });
            console.log(`  Checking storyboard "${storyboardName}" at "${storyboardPath}": ${matchingCanvas ? 'FOUND canvas' : 'NO canvas found'}`);
            if (matchingCanvas) {
              console.log(`    Canvas: ${matchingCanvas.path}, basename: ${matchingCanvas.basename}`);
            }
          }
        }
      }

      if (result.errors.length > 0) {
        console.warn('[useCanvasData] Discovery errors:', result.errors);
      }

      // Sort alphabetically by name
      const sortedCanvases = [...result.canvases].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setCanvases(sortedCanvases);
      setStoryboards(result.storyboards);
      setExecutions(result.executions);

      // Update tracking ref
      lastLoadedSha.current = fileTreeSha;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load canvases';
      setError(errorMessage);
      console.error('Error loading canvases:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fileTreeData, fileTreeSha, readFile]);

  const refreshCanvases = useCallback(async () => {
    // Force reload by clearing the tracking ref and cache
    lastLoadedSha.current = undefined;
    discovery.current.clearCache();
    await loadCanvases();
  }, [loadCanvases]);

  // Only run when SHA actually changes, not when loadCanvases callback changes
  useEffect(() => {
    loadCanvases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileTreeSha]);

  return {
    canvases,
    storyboards,
    executions,
    isLoading,
    error,
    refreshCanvases,
  };
};
