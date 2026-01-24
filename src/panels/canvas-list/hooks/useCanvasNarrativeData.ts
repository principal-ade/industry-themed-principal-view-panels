import { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelContextValue, PanelActions } from '@principal-ade/panel-framework-core';
import type { DiscoveredCanvas } from '@principal-ai/principal-view-core/browser';
import type { NarrativeTemplate } from '@principal-ai/principal-view-core/browser';
import { NarrativeLoader, type NarrativeFile } from '../../execution-viewer/NarrativeLoader';
import { useCanvasData } from './useCanvasData';

interface UseCanvasNarrativeDataParams {
  context: PanelContextValue;
  actions: PanelActions;
}

interface UseCanvasNarrativeDataReturn {
  canvases: DiscoveredCanvas[];
  narratives: Array<{ file: NarrativeFile; template: NarrativeTemplate }>;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

// Stable empty array to prevent unnecessary re-renders
const EMPTY_NARRATIVES_ARRAY: Array<{ file: NarrativeFile; template: NarrativeTemplate }> = [];

/**
 * Hook to discover canvases and eagerly load all narrative templates
 * Extends useCanvasData with narrative discovery
 */
export const useCanvasNarrativeData = ({
  context,
  actions,
}: UseCanvasNarrativeDataParams): UseCanvasNarrativeDataReturn => {
  // Reuse canvas discovery logic
  const { canvases, isLoading: canvasesLoading, error: canvasesError, refreshCanvases } = useCanvasData({ context });

  const [narratives, setNarratives] = useState<Array<{ file: NarrativeFile; template: NarrativeTemplate }>>(
    EMPTY_NARRATIVES_ARRAY
  );
  const [narrativesLoading, setNarrativesLoading] = useState(false);
  const [narrativesError, setNarrativesError] = useState<string | null>(null);

  // Extract file tree data
  const fileTreeSlice = context.getSlice('fileTree');
  const fileTreeData = fileTreeSlice?.data as {
    allFiles?: Array<{ path?: string; relativePath?: string; name?: string }>;
    sha?: string;
  } | null;
  const fileTreeSha = fileTreeData?.sha;

  // Get readFile from actions parameter
  const readFile = (actions as { readFile?: (path: string) => Promise<string> }).readFile;

  // Track the last loaded SHA to prevent redundant loads
  const lastLoadedNarrativeSha = useRef<string | undefined>(undefined);

  const loadNarratives = useCallback(async () => {
    // Skip if we've already loaded this exact data
    if (fileTreeSha === lastLoadedNarrativeSha.current) {
      console.log('[useCanvasNarrativeData] Skipping narrative reload - data unchanged');
      return;
    }

    console.log('[useCanvasNarrativeData] Loading narratives');

    setNarrativesLoading(true);
    setNarrativesError(null);

    try {
      const allFiles = fileTreeData?.allFiles || [];

      if (allFiles.length === 0) {
        setNarratives(EMPTY_NARRATIVES_ARRAY);
        lastLoadedNarrativeSha.current = fileTreeSha;
        return;
      }

      // Discover narrative files
      const narrativeFiles = NarrativeLoader.findNarrativeFiles(allFiles);
      console.log('[useCanvasNarrativeData] Found narrative files:', narrativeFiles.length);

      if (narrativeFiles.length === 0) {
        setNarratives(EMPTY_NARRATIVES_ARRAY);
        lastLoadedNarrativeSha.current = fileTreeSha;
        return;
      }

      // Eagerly load all narrative templates in parallel
      const narrativePromises = narrativeFiles.map(async (file) => {
        try {
          if (!readFile) {
            console.warn('[useCanvasNarrativeData] No readFile action available');
            return null;
          }

          const content = await readFile(file.path);
          if (!content || typeof content !== 'string') {
            console.warn(`[useCanvasNarrativeData] Empty or invalid content for ${file.path}`);
            return null;
          }

          const template = NarrativeLoader.parseNarrativeTemplate(content);
          return { file, template };
        } catch (error) {
          console.warn(`[useCanvasNarrativeData] Failed to load narrative ${file.path}:`, error);
          return null;
        }
      });

      const results = await Promise.all(narrativePromises);
      const loadedNarratives = results.filter((r): r is { file: NarrativeFile; template: NarrativeTemplate } => r !== null);

      console.log('[useCanvasNarrativeData] Successfully loaded narratives:', loadedNarratives.length);

      setNarratives(loadedNarratives);
      lastLoadedNarrativeSha.current = fileTreeSha;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load narratives';
      setNarrativesError(errorMessage);
      console.error('[useCanvasNarrativeData] Error loading narratives:', err);
    } finally {
      setNarrativesLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileTreeSha, readFile]);
  // Note: fileTreeData is accessed inside but not in deps to avoid infinite loop
  // The SHA ensures we reload when data actually changes

  const refreshData = useCallback(async () => {
    // Force reload both canvases and narratives
    lastLoadedNarrativeSha.current = undefined;
    await refreshCanvases();
    await loadNarratives();
  }, [refreshCanvases, loadNarratives]);

  // Load narratives when file tree changes
  useEffect(() => {
    loadNarratives();
  }, [loadNarratives]);

  // Combine loading and error states
  const isLoading = canvasesLoading || narrativesLoading;
  const error = canvasesError || narrativesError;

  return {
    canvases,
    narratives,
    isLoading,
    error,
    refreshData,
  };
};
