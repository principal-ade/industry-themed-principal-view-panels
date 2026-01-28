import { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelContextValue, PanelActions } from '@principal-ade/panel-framework-core';
import type {
  DiscoveredCanvas,
  DiscoveredStoryboard,
  DiscoveredExecution,
  WorkflowTemplate
} from '@principal-ai/principal-view-core';
import type { FileTree } from '@principal-ai/repository-abstraction';
import { WorkflowLoader, type WorkflowFile } from '../../execution-viewer/WorkflowLoader';
import { useCanvasData } from './useCanvasData';

interface UseCanvasNarrativeDataParams {
  context: PanelContextValue;
  actions: PanelActions;
}

interface UseCanvasNarrativeDataReturn {
  canvases: DiscoveredCanvas[];
  storyboards: DiscoveredStoryboard[];
  executions: DiscoveredExecution[];
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
  // Reuse canvas discovery logic - now includes storyboards and executions
  const {
    canvases,
    storyboards,
    executions,
    isLoading: canvasesLoading,
    error: canvasesError,
    refreshCanvases
  } = useCanvasData({ context, actions });

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
      return;
    }

    setNarrativesLoading(true);
    setNarrativesError(null);

    try {
      // Use workflows from discovered storyboards instead of rediscovering with regex patterns
      // The core library already found all workflows, we just need to load their content
      const allWorkflows = storyboards.flatMap(storyboard =>
        storyboard.workflows.map(workflow => ({
          path: workflow.path,
          id: workflow.id,
          name: workflow.name,
        }))
      );

      if (allWorkflows.length === 0) {
        setNarratives(EMPTY_NARRATIVES_ARRAY);
        lastLoadedNarrativeSha.current = fileTreeSha;
        return;
      }

      // Eagerly load all workflow templates in parallel
      const workflowPromises = allWorkflows.map(async (workflow) => {
        try {
          if (!readFile) {
            return null;
          }

          const content = await readFile(workflow.path);
          if (!content || typeof content !== 'string') {
            return null;
          }

          const template = WorkflowLoader.parseWorkflowTemplate(content);
          return {
            file: {
              id: workflow.id,
              name: workflow.name,
              path: workflow.path,
            },
            template
          };
        } catch (error) {
          console.warn(`[useCanvasWorkflowData] Failed to load workflow ${workflow.path}:`, error);
          return null;
        }
      });

      const results = await Promise.all(workflowPromises);
      const loadedNarratives = results.filter((r): r is { file: WorkflowFile; template: WorkflowTemplate } => r !== null);

      setNarratives(loadedNarratives);
      lastLoadedNarrativeSha.current = fileTreeSha;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load narratives';
      setNarrativesError(errorMessage);
      console.error('[useCanvasWorkflowData] Error loading workflows:', err);
    } finally {
      setNarrativesLoading(false);
    }
  }, [fileTreeSha, readFile, storyboards]);
  // Note: fileTreeData is accessed inside but not in deps to avoid infinite loop
  // The SHA ensures we reload when data actually changes

  const refreshData = useCallback(async () => {
    // Force reload both canvases and narratives
    lastLoadedNarrativeSha.current = undefined;
    await refreshCanvases();
    await loadNarratives();
  }, [refreshCanvases, loadNarratives]);

  // Load narratives when SHA changes or storyboards are updated
  useEffect(() => {
    // Only load if we have storyboards (wait for useCanvasData to finish)
    if (storyboards.length > 0) {
      loadNarratives();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileTreeSha, storyboards]);

  // Combine loading and error states
  const isLoading = canvasesLoading || workflowsLoading;
  const error = canvasesError || workflowsError;

  return {
    canvases,
    storyboards,
    executions,
    workflows,
    isLoading,
    error,
    refreshData,
  };
};
