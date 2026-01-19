import { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelContextValue } from '@principal-ade/panel-framework-core';
import { CanvasDiscovery, type DiscoveredCanvas } from '@principal-ai/principal-view-core/browser';
import type { FileTree } from '@principal-ai/repository-abstraction';

interface UseCanvasDataParams {
  context: PanelContextValue;
}

interface UseCanvasDataReturn {
  canvases: DiscoveredCanvas[];
  isLoading: boolean;
  error: string | null;
  refreshCanvases: () => Promise<void>;
}

// Stable empty array to prevent unnecessary re-renders
const EMPTY_CANVAS_ARRAY: DiscoveredCanvas[] = [];

/**
 * Hook to discover and load canvas files from the file tree
 * Uses the new package-aware CanvasDiscovery system
 */
export const useCanvasData = ({
  context,
}: UseCanvasDataParams): UseCanvasDataReturn => {
  const [canvases, setCanvases] = useState<DiscoveredCanvas[]>(EMPTY_CANVAS_ARRAY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract stable references from context to avoid unnecessary re-renders
  const fileTreeSlice = context.getSlice('fileTree');
  const fileTreeData = fileTreeSlice?.data as {
    fileTree?: FileTree;
    allFiles?: Array<{ path?: string; relativePath?: string; name?: string }>;
    sha?: string;
  } | null;
  const fileTreeSha = fileTreeData?.sha;

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
      // Check if we have a proper FileTree
      let fileTree: FileTree | null = null;

      if (fileTreeData?.fileTree) {
        // New format with FileTree object
        fileTree = fileTreeData.fileTree;
      } else if (fileTreeData?.allFiles) {
        // Legacy format - convert to FileTree
        fileTree = convertToFileTree(fileTreeData.allFiles, fileTreeSha || 'unknown');
      }

      if (!fileTree) {
        setCanvases(EMPTY_CANVAS_ARRAY);
        lastLoadedSha.current = fileTreeSha;
        return;
      }

      // Use new CanvasDiscovery system
      const result = await discovery.current.discover(fileTree, {
        // Don't include content - just metadata for listing
        includeContent: false,
      });

      console.log('[useCanvasData] Found canvases:', result.canvases.length);
      if (result.errors.length > 0) {
        console.warn('[useCanvasData] Errors:', result.errors);
      }

      // Sort alphabetically by name
      const sortedCanvases = [...result.canvases].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setCanvases(sortedCanvases);

      // Update tracking ref
      lastLoadedSha.current = fileTreeSha;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load canvases';
      setError(errorMessage);
      console.error('Error loading canvases:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fileTreeData, fileTreeSha]);

  const refreshCanvases = useCallback(async () => {
    // Force reload by clearing the tracking ref and cache
    lastLoadedSha.current = undefined;
    discovery.current.clearCache();
    await loadCanvases();
  }, [loadCanvases]);

  useEffect(() => {
    loadCanvases();
  }, [loadCanvases]);

  return {
    canvases,
    isLoading,
    error,
    refreshCanvases,
  };
};

/**
 * Convert legacy allFiles array to FileTree structure
 * This maintains backward compatibility with older panel contexts
 */
function convertToFileTree(
  allFiles: Array<{ path?: string; relativePath?: string; name?: string }>,
  sha: string
): FileTree {
  const fileInfos = allFiles.map(file => ({
    path: file.path || file.relativePath || '',
    relativePath: file.relativePath || file.path || '',
    name: file.name || (file.relativePath || file.path || '').split('/').pop() || '',
    extension: (file.name || '').split('.').pop() || '',
    size: 0,
    lastModified: new Date(),
    isDirectory: false,
  }));

  return {
    sha,
    root: {
      path: '/',
      name: '',
      relativePath: '',
      children: [],
      fileCount: fileInfos.length,
      totalSize: 0,
      depth: 0,
    },
    allFiles: fileInfos,
    allDirectories: [],
    stats: {
      totalFiles: fileInfos.length,
      totalDirectories: 0,
      totalSize: 0,
      maxDepth: 0,
    },
    metadata: {
      id: 'panel-context',
      timestamp: new Date(),
      sourceType: 'panel',
      sourceInfo: {},
    },
  };
}
