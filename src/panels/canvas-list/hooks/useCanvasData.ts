import { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelContextValue } from '@principal-ade/panel-framework-core';
import { ExecutionLoader, type CanvasFile } from '../../execution-viewer/ExecutionLoader';

interface UseCanvasDataParams {
  context: PanelContextValue;
}

interface UseCanvasDataReturn {
  canvases: CanvasFile[];
  isLoading: boolean;
  error: string | null;
  refreshCanvases: () => Promise<void>;
}

// Stable empty array to prevent unnecessary re-renders
const EMPTY_CANVAS_ARRAY: CanvasFile[] = [];

/**
 * Hook to discover and load .otel.canvas files from the file tree
 */
export const useCanvasData = ({
  context,
}: UseCanvasDataParams): UseCanvasDataReturn => {
  const [canvases, setCanvases] = useState<CanvasFile[]>(EMPTY_CANVAS_ARRAY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract stable references from context to avoid unnecessary re-renders
  const fileTreeSlice = context.getSlice('fileTree');
  const fileTreeData = fileTreeSlice?.data as {
    allFiles?: Array<{ path?: string; relativePath?: string; name?: string }>;
    sha?: string;
  } | null;
  const fileTreeSha = fileTreeData?.sha;

  // Track the last loaded SHA to prevent redundant loads
  const lastLoadedSha = useRef<string | undefined>(undefined);

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
      if (!fileTreeData?.allFiles) {
        setCanvases(EMPTY_CANVAS_ARRAY);
        lastLoadedSha.current = fileTreeSha;
        return;
      }

      // Find all .otel.canvas files using ExecutionLoader
      const foundCanvases = ExecutionLoader.findCanvasFiles(fileTreeData.allFiles);

      console.log('[useCanvasData] Found canvases:', foundCanvases.length);

      setCanvases(foundCanvases);

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
    // Force reload by clearing the tracking ref
    lastLoadedSha.current = undefined;
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
