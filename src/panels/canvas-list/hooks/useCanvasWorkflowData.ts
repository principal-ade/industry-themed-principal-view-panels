import { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelContextValue, PanelActions } from '@principal-ade/panel-framework-core';
import type { DiscoveredCanvas } from '@principal-ai/principal-view-core';
import type { WorkflowTemplate } from '@principal-ai/principal-view-core';
import type { FileTree } from '@principal-ai/repository-abstraction';
import { WorkflowLoader, type WorkflowFile } from '../../execution-viewer/WorkflowLoader';
import { useCanvasData } from './useCanvasData';

interface UseCanvasNarrativeDataParams {
  context: PanelContextValue;
  actions: PanelActions;
}

interface UseCanvasNarrativeDataReturn {
  canvases: DiscoveredCanvas[];
  workflows: Array<{ file: WorkflowFile; template: WorkflowTemplate }>;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

// Stable empty array to prevent unnecessary re-renders
const EMPTY_NARRATIVES_ARRAY: Array<{ file: WorkflowFile; template: WorkflowTemplate }> = [];

/**
 * Hook to discover canvases and eagerly load all narrative templates
 * Extends useCanvasData with narrative discovery
 */
export const useCanvasWorkflowData = ({
  context,
  actions,
}: UseCanvasNarrativeDataParams): UseCanvasNarrativeDataReturn => {
  // Reuse canvas discovery logic
  const { canvases, isLoading: canvasesLoading, error: canvasesError, refreshCanvases } = useCanvasData({ context });

  const [workflows, setNarratives] = useState<Array<{ file: WorkflowFile; template: WorkflowTemplate }>>(
    EMPTY_NARRATIVES_ARRAY
  );
  const [workflowsLoading, setNarrativesLoading] = useState(false);
  const [workflowsError, setNarrativesError] = useState<string | null>(null);

  // Extract file tree data
  const fileTreeSlice = context.getSlice('fileTree');
  const fileTreeData = fileTreeSlice?.data as FileTree | null;
  const fileTreeSha = fileTreeData?.sha;

  // Get readFile from actions parameter
  const readFile = (actions as { readFile?: (path: string) => Promise<string> }).readFile;

  // Track the last loaded SHA to prevent redundant loads
  const lastLoadedNarrativeSha = useRef<string | undefined>(undefined);

  const loadNarratives = useCallback(async () => {
    // Skip if we've already loaded this exact data
    if (fileTreeSha === lastLoadedNarrativeSha.current) {
      console.log('[useCanvasWorkflowData] Skipping narrative reload - data unchanged');
      return;
    }

    console.log('[useCanvasWorkflowData] Loading narratives');

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
      const narrativeFiles = WorkflowLoader.findWorkflowFiles(allFiles);
      console.log('[useCanvasWorkflowData] Found narrative files:', narrativeFiles.length);

      if (narrativeFiles.length === 0) {
        setNarratives(EMPTY_NARRATIVES_ARRAY);
        lastLoadedNarrativeSha.current = fileTreeSha;
        return;
      }

      // Eagerly load all narrative templates in parallel
      const narrativePromises = narrativeFiles.map(async (file) => {
        try {
          if (!readFile) {
            console.warn('[useCanvasWorkflowData] No readFile action available');
            return null;
          }

          const content = await readFile(file.path);
          if (!content || typeof content !== 'string') {
            console.warn(`[useCanvasWorkflowData] Empty or invalid content for ${file.path}`);
            return null;
          }

          const template = WorkflowLoader.parseWorkflowTemplate(content);
          return { file, template };
        } catch (error) {
          console.warn(`[useCanvasWorkflowData] Failed to load narrative ${file.path}:`, error);
          return null;
        }
      });

      const results = await Promise.all(narrativePromises);
      const loadedNarratives = results.filter((r): r is { file: WorkflowFile; template: WorkflowTemplate } => r !== null);

      console.log('[useCanvasWorkflowData] Successfully loaded workflows:', loadedNarratives.length);

      setNarratives(loadedNarratives);
      lastLoadedNarrativeSha.current = fileTreeSha;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load narratives';
      setNarrativesError(errorMessage);
      console.error('[useCanvasWorkflowData] Error loading workflows:', err);
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

  // Load narratives only when SHA actually changes, not when callback changes
  useEffect(() => {
    loadNarratives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileTreeSha]);

  // Combine loading and error states
  const isLoading = canvasesLoading || workflowsLoading;
  const error = canvasesError || workflowsError;

  return {
    canvases,
    workflows,
    isLoading,
    error,
    refreshData,
  };
};
