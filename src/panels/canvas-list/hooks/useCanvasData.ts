import { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelContextValue } from '@principal-ade/panel-framework-core';
import { CanvasDiscovery, type DiscoveredCanvas } from '@principal-ai/principal-view-core';
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
  const fileTreeData = fileTreeSlice?.data as FileTree | null;
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
      if (!fileTreeData) {
        setCanvases(EMPTY_CANVAS_ARRAY);
        lastLoadedSha.current = fileTreeSha;
        return;
      }

      // Use new CanvasDiscovery system with FileTree (includes full FileInfo[] with lastModified)
      const result = await discovery.current.discover(fileTreeData, {
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

  // Only run when SHA actually changes, not when loadCanvases callback changes
  useEffect(() => {
    loadCanvases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileTreeSha]);

  return {
    canvases,
    isLoading,
    error,
    refreshCanvases,
  };
};
