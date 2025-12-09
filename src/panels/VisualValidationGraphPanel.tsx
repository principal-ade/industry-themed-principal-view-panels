import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/visual-validation-react';
import type { GraphRendererHandle, PendingChanges } from '@principal-ai/visual-validation-react';
import type { ExtendedCanvas, ComponentLibrary } from '@principal-ai/visual-validation-core';
import { Loader, ChevronDown, Save, X, Lock, Unlock, LayoutGrid } from 'lucide-react';
import { ConfigLoader, type ConfigFile } from './visual-validation/ConfigLoader';
import { applySugiyamaLayout } from './visual-validation/forceLayout';
import { ErrorStateContent } from './visual-validation/ErrorStateContent';
import { EmptyStateContent } from './visual-validation/EmptyStateContent';

interface GraphPanelState {
  canvas: ExtendedCanvas | null;
  library: ComponentLibrary | null;
  loading: boolean;
  error: string | null;
  availableConfigs: ConfigFile[];
  selectedConfigId: string | null;
  // Edit mode state
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  // Incremented when layout changes to force GraphRenderer remount
  layoutVersion: number;
}

/**
 * Visual Validation Graph Panel
 *
 * Visualizes .canvas configuration files as interactive graph diagrams
 * with full editing support for nodes, edges, and positions.
 */
export const VisualValidationGraphPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events
}) => {
  const { theme } = useTheme();

  // Ref to GraphRenderer for getting pending changes
  const graphRef = useRef<GraphRendererHandle>(null);

  const [state, setState] = useState<GraphPanelState>({
    canvas: null,
    library: null,
    loading: true,
    error: null,
    availableConfigs: [],
    selectedConfigId: null,
    isEditMode: false,
    hasUnsavedChanges: false,
    isSaving: false,
    layoutVersion: 0
  });

  // Store context and actions in refs to avoid recreation of callbacks
  const contextRef = useRef(context);
  const actionsRef = useRef(actions);
  const eventsRef = useRef(events);
  contextRef.current = context;
  actionsRef.current = actions;
  eventsRef.current = events;

  // Track selected config ID in ref
  const selectedConfigIdRef = useRef<string | null>(null);
  selectedConfigIdRef.current = state.selectedConfigId;

  const loadConfiguration = useCallback(async (configId?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const ctx = contextRef.current;
      const acts = actionsRef.current;

      // Check if fileTree slice is available
      if (!ctx.hasSlice('fileTree')) {
        throw new Error('File tree data not available');
      }

      if (ctx.isSliceLoading('fileTree')) {
        return;
      }

      const fileTreeSlice = ctx.getSlice('fileTree');
      const fileTreeData = fileTreeSlice?.data as { allFiles?: Array<{ path?: string; relativePath?: string; name?: string }> } | null;

      if (!fileTreeData?.allFiles) {
        setState(prev => ({
          ...prev,
          canvas: null,
          library: null,
          loading: false,
          error: null,
          availableConfigs: [],
          selectedConfigId: null
        }));
        return;
      }

      const availableConfigs = ConfigLoader.findConfigs(fileTreeData.allFiles);

      if (availableConfigs.length === 0) {
        setState(prev => ({
          ...prev,
          canvas: null,
          library: null,
          loading: false,
          error: null,
          availableConfigs: [],
          selectedConfigId: null
        }));
        return;
      }

      let selectedConfig: ConfigFile;
      if (configId) {
        const found = availableConfigs.find(c => c.id === configId);
        if (!found) {
          throw new Error(`Config with ID '${configId}' not found`);
        }
        selectedConfig = found;
      } else if (selectedConfigIdRef.current) {
        const found = availableConfigs.find(c => c.id === selectedConfigIdRef.current);
        selectedConfig = found || availableConfigs[0];
      } else {
        selectedConfig = availableConfigs[0];
      }

      const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
      if (!readFile) {
        throw new Error('readFile action not available');
      }

      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      const fullPath = `${repositoryPath}/${selectedConfig.path}`;
      const fileResult = await readFile(fullPath);

      if (!fileResult || typeof fileResult !== 'object' || !('content' in fileResult)) {
        throw new Error('Failed to read config file');
      }

      const configContent = (fileResult as { content: string }).content;
      const canvas = ConfigLoader.parseCanvas(configContent);

      // Load library.yaml if it exists
      let library: ComponentLibrary | null = null;
      const libraryPath = ConfigLoader.findLibraryPath(fileTreeData.allFiles);
      if (libraryPath) {
        try {
          const libraryFullPath = `${repositoryPath}/${libraryPath}`;
          const libraryResult = await readFile(libraryFullPath);
          if (libraryResult && typeof libraryResult === 'object' && 'content' in libraryResult) {
            library = ConfigLoader.parseLibrary((libraryResult as { content: string }).content);
          }
        } catch (libraryError) {
          // Library loading is optional, don't fail the whole operation
          console.warn('[VisualValidation] Failed to load library.yaml:', libraryError);
        }
      }

      setState(prev => ({
        ...prev,
        canvas,
        library,
        loading: false,
        error: null,
        availableConfigs,
        selectedConfigId: selectedConfig.id,
        hasUnsavedChanges: false
      }));

      // Reset the GraphRenderer's edit state when we reload
      graphRef.current?.resetEditState();
    } catch (error) {
      console.error('[VisualValidation] Error during config load:', error);
      setState(prev => ({
        ...prev,
        canvas: null,
        library: null,
        loading: false,
        error: (error as Error).message
      }));
    }
  }, []);

  // Handle pending changes notification from GraphRenderer
  const handlePendingChangesChange = useCallback((hasChanges: boolean) => {
    setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
  }, []);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setState(prev => {
      if (prev.isEditMode && prev.hasUnsavedChanges) {
        // Exiting edit mode with unsaved changes - reload to discard
        loadConfiguration(selectedConfigIdRef.current || undefined);
        return { ...prev, isEditMode: false, hasUnsavedChanges: false };
      }
      return { ...prev, isEditMode: !prev.isEditMode };
    });
  }, [loadConfiguration]);

  // Discard changes and reload
  const discardChanges = useCallback(() => {
    loadConfiguration(selectedConfigIdRef.current || undefined);
    setState(prev => ({ ...prev, hasUnsavedChanges: false }));
  }, [loadConfiguration]);

  // Save all pending changes
  const saveAllChanges = useCallback(async () => {
    if (!state.canvas) return;

    // Get pending changes from GraphRenderer if available
    const pendingChanges = graphRef.current?.getPendingChanges();

    // If no pending changes from GraphRenderer but hasUnsavedChanges is true,
    // this means the canvas was updated directly (e.g., via auto-layout).
    // In that case, save state.canvas directly.
    const hasGraphChanges = pendingChanges?.hasChanges ?? false;
    if (!hasGraphChanges && !state.hasUnsavedChanges) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const ctx = contextRef.current;
      const acts = actionsRef.current;

      const writeFile = (acts as { writeFile?: (path: string, content: string) => Promise<void> }).writeFile;
      if (!writeFile) {
        throw new Error('writeFile action not available');
      }

      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      const selectedConfig = state.availableConfigs.find(c => c.id === selectedConfigIdRef.current);
      if (!selectedConfig) {
        throw new Error('Selected config not found');
      }

      // Apply changes to canvas if there are pending changes from GraphRenderer,
      // otherwise use state.canvas directly (already contains auto-layout changes)
      const updatedCanvas = hasGraphChanges && pendingChanges
        ? applyChangesToCanvas(state.canvas, pendingChanges)
        : state.canvas;

      // Serialize to JSON
      const jsonContent = JSON.stringify(updatedCanvas, null, 2);

      // Write to file
      const fullPath = `${repositoryPath}/${selectedConfig.path}`;
      await writeFile(fullPath, jsonContent);

      // Reload to verify and reset state
      await loadConfiguration(selectedConfigIdRef.current || undefined);

      setState(prev => ({ ...prev, isSaving: false, hasUnsavedChanges: false }));
    } catch (error) {
      console.error('[VisualValidation] Error saving changes:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: `Failed to save: ${(error as Error).message}`
      }));
    }
  }, [state.canvas, state.availableConfigs, loadConfiguration]);

  // Apply auto-layout using Sugiyama (hierarchical) algorithm
  // Falls back to force-directed layout if graph has cycles
  const applyAutoLayout = useCallback(() => {
    if (!state.canvas) return;

    const layoutedCanvas = applySugiyamaLayout(state.canvas, {
      direction: 'TB',
      nodeSpacingX: 200,
      nodeSpacingY: 150,
    });

    setState(prev => ({
      ...prev,
      canvas: layoutedCanvas,
      isEditMode: true,
      hasUnsavedChanges: true,
      layoutVersion: prev.layoutVersion + 1,
    }));
  }, [state.canvas]);

  // Load configuration on mount and when fileTree slice finishes loading
  const fileTreeLoading = context.hasSlice('fileTree') && context.isSliceLoading('fileTree');
  const fileTreeLoadingRef = useRef(fileTreeLoading);

  // Track fileTree data for change detection
  const fileTreeSlice = context.hasSlice('fileTree') ? context.getSlice('fileTree') : null;
  const fileTreeData = fileTreeSlice?.data as { allFiles?: Array<{ path?: string; relativePath?: string; name?: string }> } | null;
  const fileTreeDataRef = useRef(fileTreeData);

  useEffect(() => {
    // Initial load
    loadConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-load when fileTree transitions from loading to loaded
  useEffect(() => {
    const wasLoading = fileTreeLoadingRef.current;
    fileTreeLoadingRef.current = fileTreeLoading;

    if (wasLoading && !fileTreeLoading) {
      // fileTree just finished loading, reload config
      loadConfiguration();
    }
  }, [fileTreeLoading, loadConfiguration]);

  // Reload when fileTree data changes (e.g., files added/modified/deleted on disk)
  useEffect(() => {
    const prevData = fileTreeDataRef.current;
    fileTreeDataRef.current = fileTreeData;

    // Skip if this is the initial render or if we're still loading
    if (prevData === null || fileTreeLoading) {
      return;
    }

    // Check if the data reference actually changed
    if (prevData !== fileTreeData && fileTreeData !== null) {
      console.log('[VisualValidationGraph] File tree data changed, reloading...');
      loadConfiguration();
    }
  }, [fileTreeData, fileTreeLoading, loadConfiguration]);

  // Subscribe to data refresh events
  useEffect(() => {
    const unsubscribe = eventsRef.current.on('data:refresh', () => {
      loadConfiguration();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to config selection events from browser panel
  useEffect(() => {
    const unsubscribe = eventsRef.current.on('custom', (event) => {
      const payload = event.payload as { action?: string; configId?: string } | undefined;
      if (payload?.action === 'selectConfig' && payload?.configId) {
        loadConfiguration(payload.configId);
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.body
      }}>
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: theme.space[2] }}>Loading configuration...</span>
      </div>
    );
  }

  if (state.error) {
    return <ErrorStateContent theme={theme} error={state.error} onRetry={() => loadConfiguration()} />;
  }

  if (!state.canvas) {
    return <EmptyStateContent theme={theme} />;
  }

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: theme.fonts.body
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[3] }}>
              <h2 style={{
                margin: 0,
                fontSize: theme.fontSizes[3],
                fontWeight: theme.fontWeights.medium,
                color: theme.colors.text
              }}>
                {state.canvas.vv?.name || 'Untitled'}
              </h2>

              {/* Config Selector */}
              {state.availableConfigs.length > 1 && (
                <div style={{ position: 'relative' }}>
                  <select
                    value={state.selectedConfigId || ''}
                    onChange={(e) => loadConfiguration(e.target.value)}
                    disabled={state.hasUnsavedChanges}
                    style={{
                      appearance: 'none',
                      padding: `${theme.space[1]} ${theme.space[4]} ${theme.space[1]} ${theme.space[2]}`,
                      fontSize: theme.fontSizes[1],
                      fontFamily: theme.fonts.body,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.backgroundSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii[1],
                      cursor: state.hasUnsavedChanges ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      opacity: state.hasUnsavedChanges ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                    title={state.hasUnsavedChanges ? 'Save or discard changes before switching configs' : undefined}
                  >
                    {state.availableConfigs.map(config => (
                      <option key={config.id} value={config.id}>{config.name}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    style={{
                      position: 'absolute',
                      right: theme.space[1],
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: theme.colors.textMuted
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.space[2],
              marginTop: theme.space[1]
            }}>
              {state.canvas.vv?.version && (
                <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
                  v{state.canvas.vv.version}
                </span>
              )}
              {state.canvas.vv?.description && (
                <>
                  <span style={{ color: theme.colors.textMuted }}>•</span>
                  <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
                    {state.canvas.vv.description}
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[3] }}>
            {/* Auto Layout Button */}
            <button
              onClick={applyAutoLayout}
              disabled={state.isSaving}
              title="Auto-arrange nodes using force-directed layout"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[1],
                padding: `${theme.space[1]} ${theme.space[2]}`,
                fontSize: theme.fontSizes[1],
                fontFamily: theme.fonts.body,
                color: theme.colors.text,
                backgroundColor: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[1],
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <LayoutGrid size={14} />
              <span>Auto Layout</span>
            </button>

            {/* Edit Mode Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[2] }}>
              {/* Save/Discard buttons */}
              {state.isEditMode && state.hasUnsavedChanges && (
                <>
                  <button
                    onClick={saveAllChanges}
                    disabled={state.isSaving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.space[1],
                      padding: `${theme.space[1]} ${theme.space[2]}`,
                      fontSize: theme.fontSizes[1],
                      fontFamily: theme.fonts.body,
                      color: 'white',
                      backgroundColor: theme.colors.primary,
                      border: 'none',
                      borderRadius: theme.radii[1],
                      cursor: state.isSaving ? 'wait' : 'pointer',
                      opacity: state.isSaving ? 0.7 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {state.isSaving ? (
                      <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={discardChanges}
                    disabled={state.isSaving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.space[1],
                      padding: `${theme.space[1]} ${theme.space[2]}`,
                      fontSize: theme.fontSizes[1],
                      fontFamily: theme.fonts.body,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.backgroundSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii[1],
                      cursor: state.isSaving ? 'wait' : 'pointer',
                      opacity: state.isSaving ? 0.7 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    <X size={14} />
                    <span>Discard</span>
                  </button>
                </>
              )}

              {/* Unsaved indicator */}
              {state.isEditMode && state.hasUnsavedChanges && (
                <span style={{
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.warning || '#f59e0b',
                  fontStyle: 'italic'
                }}>
                  Unsaved changes
                </span>
              )}

              {/* Edit Mode Toggle */}
              <button
                onClick={toggleEditMode}
                disabled={state.isSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.space[1],
                  padding: `${theme.space[1]} ${theme.space[2]}`,
                  fontSize: theme.fontSizes[1],
                  fontFamily: theme.fonts.body,
                  color: state.isEditMode ? 'white' : theme.colors.text,
                  backgroundColor: state.isEditMode ? theme.colors.primary : theme.colors.backgroundSecondary,
                  border: `1px solid ${state.isEditMode ? theme.colors.primary : theme.colors.border}`,
                  borderRadius: theme.radii[1],
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {state.isEditMode ? <Unlock size={14} /> : <Lock size={14} />}
                <span>{state.isEditMode ? 'Editing' : 'Edit'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit mode hint banner */}
      {state.isEditMode && (
        <div style={{
          padding: `${theme.space[2]} ${theme.space[5]}`,
          backgroundColor: theme.colors.primary + '10',
          borderBottom: `1px solid ${theme.colors.primary}30`,
          fontSize: theme.fontSizes[1],
          color: theme.colors.primary,
          display: 'flex',
          alignItems: 'center',
          gap: theme.space[2]
        }}>
          <span style={{ fontWeight: theme.fontWeights.medium }}>Edit Mode:</span>
          <span>Drag nodes to reposition • Click nodes/edges to edit or delete • Drag from node handles to create connections</span>
        </div>
      )}

      {/* Graph */}
      <div style={{ flex: 1, position: 'relative' }}>
        <GraphRenderer
          key={`graph-${state.layoutVersion}`}
          ref={graphRef}
          canvas={state.canvas}
          library={state.library ?? undefined}
          showMinimap={false}
          showControls={true}
          showBackground={true}
          editable={state.isEditMode}
          onPendingChangesChange={handlePendingChangesChange}
        />
      </div>
    </div>
  );
};

/**
 * Apply pending changes from GraphRenderer to the canvas
 */
function applyChangesToCanvas(
  canvas: ExtendedCanvas,
  changes: PendingChanges
): ExtendedCanvas {
  const updatedCanvas: ExtendedCanvas = JSON.parse(JSON.stringify(canvas));

  // Apply position changes
  for (const { nodeId, position } of changes.positionChanges) {
    const node = updatedCanvas.nodes?.find(n => n.id === nodeId);
    if (node) {
      node.x = Math.round(position.x);
      node.y = Math.round(position.y);
    }
  }

  // Apply node updates
  for (const { nodeId, updates } of changes.nodeUpdates) {
    const node = updatedCanvas.nodes?.find(n => n.id === nodeId);
    if (node) {
      // Handle type/id rename
      if (updates.type && updates.type !== nodeId) {
        node.id = updates.type;
        // Update edge references
        if (updatedCanvas.edges) {
          for (const edge of updatedCanvas.edges) {
            if (edge.fromNode === nodeId) edge.fromNode = updates.type;
            if (edge.toNode === nodeId) edge.toNode = updates.type;
          }
        }
      }

      // Handle data updates
      if (updates.data) {
        if (updates.data.icon && node.vv) {
          node.vv.icon = updates.data.icon as string;
        }
        if (updates.data.label !== undefined && 'text' in node) {
          (node as { text?: string }).text = updates.data.label as string;
        }
      }
    }
  }

  // Apply node deletions
  for (const nodeId of changes.deletedNodeIds) {
    if (updatedCanvas.nodes) {
      updatedCanvas.nodes = updatedCanvas.nodes.filter(n => n.id !== nodeId);
    }
    if (updatedCanvas.edges) {
      updatedCanvas.edges = updatedCanvas.edges.filter(
        e => e.fromNode !== nodeId && e.toNode !== nodeId
      );
    }
  }

  // Apply edge creations
  for (const { from, to, type, sourceHandle, targetHandle } of changes.createdEdges) {
    if (!updatedCanvas.edges) {
      updatedCanvas.edges = [];
    }
    // Generate a unique ID for the new edge
    const edgeId = `edge-${from}-${to}-${Date.now()}`;
    updatedCanvas.edges.push({
      id: edgeId,
      fromNode: from,
      toNode: to,
      fromSide: sourceHandle as 'top' | 'right' | 'bottom' | 'left' | undefined,
      toSide: targetHandle as 'top' | 'right' | 'bottom' | 'left' | undefined,
      vv: { edgeType: type },
    });
  }

  // Apply edge deletions (match by from/to/type since id is not available)
  for (const { from, to, type } of changes.deletedEdges) {
    if (updatedCanvas.edges) {
      updatedCanvas.edges = updatedCanvas.edges.filter(
        e => !(e.fromNode === from && e.toNode === to && e.vv?.edgeType === type)
      );
    }
  }

  return updatedCanvas;
}
