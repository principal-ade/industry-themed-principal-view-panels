import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/principal-view-react';
import type { GraphRendererHandle, PendingChanges } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas, ComponentLibrary } from '@principal-ai/principal-view-core';
import { Loader, Save, X, Pencil, LayoutGrid, PanelLeft, FileJson, HelpCircle, Copy, Check, Info } from 'lucide-react';
import { ConfigLoader, type ConfigFile } from './principal-view/ConfigLoader';
import { applySugiyamaLayout } from './principal-view/forceLayout';
import { ErrorStateContent } from './principal-view/ErrorStateContent';
import { EmptyStateContent } from './principal-view/EmptyStateContent';

interface LayoutConfig {
  direction: 'TB' | 'BT' | 'LR' | 'RL';
  nodeSpacingX: number;
  nodeSpacingY: number;
  autoUpdateEdgeSides: boolean;
}

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  direction: 'TB',
  nodeSpacingX: 100,
  nodeSpacingY: 100,
  autoUpdateEdgeSides: false,
};

interface ConfigDescription {
  name: string;
  description: string | null;
}

interface GraphPanelState {
  canvas: ExtendedCanvas | null;
  library: ComponentLibrary | null;
  loading: boolean;
  error: string | null;
  availableConfigs: ConfigFile[];
  configDescriptions: Record<string, ConfigDescription>;
  selectedConfigId: string | null;
  // Canvas selector overlay
  showCanvasSelector: boolean;
  // Help overlay
  showHelp: boolean;
  // Legend overlay
  showLegend: boolean;
  // Edit mode state
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  // Incremented when layout changes to force GraphRenderer remount
  layoutVersion: number;
  // Layout configuration
  layoutConfig: LayoutConfig;
}

/**
 * Principal View Graph Panel
 *
 * Visualizes .canvas configuration files as interactive graph diagrams
 * with full editing support for nodes, edges, and positions.
 */
export const PrincipalViewGraphPanel: React.FC<PanelComponentProps> = ({
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
    configDescriptions: {},
    selectedConfigId: null,
    showCanvasSelector: false,
    showHelp: false,
    showLegend: false,
    isEditMode: false,
    hasUnsavedChanges: false,
    isSaving: false,
    layoutVersion: 0,
    layoutConfig: DEFAULT_LAYOUT_CONFIG,
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

  // Track if we should skip the next file change (after save)
  const skipNextFileChangeRef = useRef(false);

  // Track "copied" feedback for copy path button
  const [pathCopied, setPathCopied] = useState(false);

  const loadConfiguration = useCallback(async (configId?: string) => {
    // Only show loading spinner on initial load, not when switching configs
    setState(prev => ({ ...prev, loading: prev.canvas === null, error: null }));

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
      const configContent = await readFile(fullPath);

      if (!configContent || typeof configContent !== 'string') {
        throw new Error('Failed to read config file');
      }

      const canvas = ConfigLoader.parseCanvas(configContent);

      // Load library.yaml if it exists
      let library: ComponentLibrary | null = null;
      const libraryPath = ConfigLoader.findLibraryPath(fileTreeData.allFiles);
      if (libraryPath) {
        try {
          const libraryFullPath = `${repositoryPath}/${libraryPath}`;
          const libraryContent = await readFile(libraryFullPath);
          if (libraryContent && typeof libraryContent === 'string') {
            library = ConfigLoader.parseLibrary(libraryContent);
          }
        } catch (libraryError) {
          // Library loading is optional, don't fail the whole operation
          console.warn('[PrincipalView] Failed to load library.yaml:', libraryError);
        }
      }

      // Load descriptions for all configs (in background, don't block)
      const configDescriptions: Record<string, ConfigDescription> = {};
      // Add the current canvas description
      configDescriptions[selectedConfig.id] = {
        name: canvas.pv?.name || selectedConfig.name,
        description: canvas.pv?.description || null,
      };

      // Load other configs in parallel (don't await, let it happen in background)
      const loadOtherDescriptions = async () => {
        for (const config of availableConfigs) {
          if (config.id === selectedConfig.id) continue;
          try {
            const configFullPath = `${repositoryPath}/${config.path}`;
            const configContentStr = await readFile(configFullPath);
            if (configContentStr && typeof configContentStr === 'string') {
              const configCanvas = ConfigLoader.parseCanvas(configContentStr);
              setState(prev => ({
                ...prev,
                configDescriptions: {
                  ...prev.configDescriptions,
                  [config.id]: {
                    name: configCanvas.pv?.name || config.name,
                    description: configCanvas.pv?.description || null,
                  },
                },
              }));
            }
          } catch {
            // Ignore errors for individual configs
          }
        }
      };
      loadOtherDescriptions();

      setState(prev => ({
        ...prev,
        canvas,
        library,
        loading: false,
        error: null,
        availableConfigs,
        configDescriptions,
        selectedConfigId: selectedConfig.id,
        hasUnsavedChanges: false
      }));

      // Reset the GraphRenderer's edit state when we reload
      graphRef.current?.resetEditState();
    } catch (error) {
      console.error('[PrincipalView] Error during config load:', error);
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

  // Handle source click - emit custom event for other panels to consume
  const handleSourceClick = useCallback((nodeId: string, source: string) => {
    eventsRef.current.emit({
      type: 'custom',
      source: 'principal-view-graph',
      timestamp: Date.now(),
      payload: {
        action: 'sourceClick',
        nodeId,
        source,
      },
    });
  }, []);

  // Toggle canvas selector overlay
  const toggleCanvasSelector = useCallback(() => {
    setState(prev => ({ ...prev, showCanvasSelector: !prev.showCanvasSelector }));
  }, []);

  // Toggle help overlay
  const toggleHelp = useCallback(() => {
    setState(prev => ({ ...prev, showHelp: !prev.showHelp }));
  }, []);

  // Toggle legend overlay
  const toggleLegend = useCallback(() => {
    setState(prev => ({ ...prev, showLegend: !prev.showLegend }));
  }, []);

  // Copy current config path to clipboard
  const copyConfigPath = useCallback(() => {
    const currentConfig = state.availableConfigs.find(c => c.id === state.selectedConfigId);
    if (currentConfig?.path) {
      navigator.clipboard.writeText(currentConfig.path).then(() => {
        setPathCopied(true);
        setTimeout(() => setPathCopied(false), 2000);
      });
    }
  }, [state.availableConfigs, state.selectedConfigId]);

  // Handle canvas selection from overlay
  const handleCanvasSelect = useCallback((configId: string) => {
    loadConfiguration(configId);
  }, [loadConfiguration]);

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

      // Skip the next file change event since we caused it
      skipNextFileChangeRef.current = true;

      // Update local state with the saved canvas (no reload needed)
      // Also increment layoutVersion to force GraphRenderer remount with fresh canvas
      setState(prev => ({
        ...prev,
        canvas: updatedCanvas,
        isSaving: false,
        hasUnsavedChanges: false,
        layoutVersion: prev.layoutVersion + 1
      }));
    } catch (error) {
      console.error('[PrincipalView] Error saving changes:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: `Failed to save: ${(error as Error).message}`
      }));
    }
  }, [state.canvas, state.availableConfigs]);

  // Update layout config
  const updateLayoutConfig = useCallback((updates: Partial<LayoutConfig>) => {
    setState(prev => ({
      ...prev,
      layoutConfig: { ...prev.layoutConfig, ...updates },
    }));
  }, []);

  // Apply auto-layout using Sugiyama (hierarchical) algorithm
  // Falls back to force-directed layout if graph has cycles
  const applyAutoLayout = useCallback(() => {
    if (!state.canvas) return;

    const layoutedCanvas = applySugiyamaLayout(state.canvas, {
      direction: state.layoutConfig.direction,
      nodeSpacingX: state.layoutConfig.nodeSpacingX,
      nodeSpacingY: state.layoutConfig.nodeSpacingY,
    });

    setState(prev => ({
      ...prev,
      canvas: layoutedCanvas,
      isEditMode: true,
      hasUnsavedChanges: true,
      layoutVersion: prev.layoutVersion + 1,
    }));
  }, [state.canvas, state.layoutConfig]);

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
  // Only reload if the change affects the currently selected config or library
  useEffect(() => {
    const prevData = fileTreeDataRef.current;
    fileTreeDataRef.current = fileTreeData;

    // Skip if this is the initial render or if we're still loading
    if (prevData === null || fileTreeLoading) {
      return;
    }

    // Skip if we just saved (we caused this file change)
    if (skipNextFileChangeRef.current) {
      skipNextFileChangeRef.current = false;
      return;
    }

    // Check if the data reference actually changed
    if (prevData !== fileTreeData && fileTreeData !== null) {
      // Find the currently selected config path
      const selectedConfig = state.availableConfigs.find(c => c.id === selectedConfigIdRef.current);
      if (!selectedConfig) {
        // No config selected, check if new configs appeared
        const newConfigs = ConfigLoader.findConfigs(fileTreeData.allFiles || []);
        if (newConfigs.length > 0) {
          console.log('[PrincipalViewGraph] New configs available, reloading...');
          loadConfiguration();
        }
        return;
      }

      // Check if the selected config file changed
      const prevFiles = prevData.allFiles || [];
      const newFiles = fileTreeData.allFiles || [];

      // Find the selected config in both old and new file lists
      const prevConfigFile = prevFiles.find(f => (f.path || f.relativePath) === selectedConfig.path);
      const newConfigFile = newFiles.find(f => (f.path || f.relativePath) === selectedConfig.path);

      // Check if library.yaml changed
      const libraryPath = ConfigLoader.findLibraryPath(newFiles);
      const prevLibraryFile = libraryPath ? prevFiles.find(f => (f.path || f.relativePath) === libraryPath) : null;
      const newLibraryFile = libraryPath ? newFiles.find(f => (f.path || f.relativePath) === libraryPath) : null;

      // Only reload if current config or library file changed/appeared/disappeared
      const configChanged = prevConfigFile !== newConfigFile;
      const libraryChanged = prevLibraryFile !== newLibraryFile;

      if (configChanged || libraryChanged) {
        console.log('[PrincipalViewGraph] Current config or library changed, reloading...', {
          configChanged,
          libraryChanged,
          configPath: selectedConfig.path
        });
        loadConfiguration();
      }
    }
  }, [fileTreeData, fileTreeLoading, loadConfiguration, state.availableConfigs]);

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
        height: 39,
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'content-box'
      }}>
        {/* Canvas Selector Toggle - flush left, full height */}
        {state.availableConfigs.length > 1 && (
          <button
            onClick={toggleCanvasSelector}
            disabled={state.hasUnsavedChanges}
            title={state.hasUnsavedChanges ? 'Save or discard changes before switching' : 'Switch canvas'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 39,
              padding: 0,
              backgroundColor: state.showCanvasSelector ? theme.colors.primary : 'transparent',
              color: state.showCanvasSelector ? 'white' : theme.colors.textMuted,
              border: 'none',
              borderRight: `1px solid ${theme.colors.border}`,
              cursor: state.hasUnsavedChanges ? 'not-allowed' : 'pointer',
              opacity: state.hasUnsavedChanges ? 0.5 : 1,
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <PanelLeft size={18} />
          </button>
        )}

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', gap: theme.space[3] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[2] }}>
            <h2 style={{
            margin: 0,
            fontSize: theme.fontSizes[3],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text
          }}>
            {state.canvas.pv?.name || 'Untitled'}
          </h2>

          {/* Copy path button */}
          <button
            onClick={copyConfigPath}
            title={pathCopied ? 'Copied!' : 'Copy path to clipboard'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: theme.space[1],
              backgroundColor: 'transparent',
              color: pathCopied ? (theme.colors.success || '#22c55e') : theme.colors.textMuted,
              border: 'none',
              borderRadius: theme.radii[0],
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {pathCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>

          {/* Unsaved changes indicator */}
          {state.isEditMode && state.hasUnsavedChanges && (
            <span style={{
              fontSize: theme.fontSizes[1],
              color: theme.colors.warning || '#f59e0b',
              fontStyle: 'italic'
            }}>
              Unsaved changes
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[2] }}>
          {/* Save/Discard buttons when there are unsaved changes */}
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

          </div>
        </div>

        {/* Legend Button - flush right, full height */}
        <button
          onClick={toggleLegend}
          title="Edge Legend"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 39,
            padding: 0,
            backgroundColor: state.showLegend ? theme.colors.primary : 'transparent',
            color: state.showLegend ? 'white' : theme.colors.textMuted,
            border: 'none',
            borderLeft: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <Info size={18} />
        </button>

        {/* Help Button - flush right, full height */}
        <button
          onClick={toggleHelp}
          title="Help & Getting Started"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 39,
            padding: 0,
            backgroundColor: state.showHelp ? theme.colors.primary : 'transparent',
            color: state.showHelp ? 'white' : theme.colors.textMuted,
            border: 'none',
            borderLeft: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <HelpCircle size={18} />
        </button>

        {/* Edit Mode Toggle - flush right, full height */}
        <button
          onClick={toggleEditMode}
          disabled={state.isSaving}
          title={state.isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 39,
            padding: 0,
            backgroundColor: state.isEditMode ? theme.colors.primary : 'transparent',
            color: state.isEditMode ? 'white' : theme.colors.textMuted,
            border: 'none',
            borderLeft: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <Pencil size={18} />
        </button>
      </div>

      {/* Main content area with overlays and graph */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Canvas Selector Overlay */}
        {state.showCanvasSelector && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 280,
            height: '100%',
            backgroundColor: theme.colors.background,
            borderRight: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
          }}>
            {/* Overlay Header */}
            <div style={{
              height: 39,
              padding: '0 16px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              boxSizing: 'content-box'
            }}>
              <span style={{
                fontSize: theme.fontSizes[2],
                fontWeight: theme.fontWeights.medium,
                color: theme.colors.text
              }}>
                Canvas Files
              </span>
              <button
                onClick={toggleCanvasSelector}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  padding: 0,
                  backgroundColor: 'transparent',
                  color: theme.colors.textMuted,
                  border: 'none',
                  borderRadius: theme.radii[1],
                  cursor: 'pointer',
                  transition: 'color 0.15s'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Canvas List */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: theme.space[2],
            }}>
              {state.availableConfigs.map(config => {
                const isSelected = config.id === state.selectedConfigId;
                const description = state.configDescriptions[config.id];
                const displayName = description?.name || config.name;
                const displayDescription = description?.description;

                return (
                  <button
                    key={config.id}
                    onClick={() => handleCanvasSelect(config.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: theme.space[1],
                      width: '100%',
                      padding: `${theme.space[2]}px ${theme.space[3]}px`,
                      marginBottom: theme.space[1],
                      backgroundColor: isSelected ? `${theme.colors.primary}15` : 'transparent',
                      color: theme.colors.text,
                      border: isSelected ? `1px solid ${theme.colors.primary}40` : `1px solid transparent`,
                      borderRadius: theme.radii[2],
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.space[2],
                      width: '100%',
                    }}>
                      <FileJson
                        size={16}
                        style={{
                          color: isSelected ? theme.colors.primary : theme.colors.textMuted,
                          flexShrink: 0
                        }}
                      />
                      <span style={{
                        fontSize: theme.fontSizes[1],
                        fontWeight: isSelected ? theme.fontWeights.medium : theme.fontWeights.body,
                        color: isSelected ? theme.colors.primary : theme.colors.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {displayName}
                      </span>
                    </div>
                    {displayDescription && (
                      <span style={{
                        fontSize: theme.fontSizes[0],
                        color: theme.colors.textMuted,
                        paddingLeft: theme.space[4] + theme.space[2],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}>
                        {displayDescription}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
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
            autoUpdateEdgeSides={state.layoutConfig.autoUpdateEdgeSides}
            onPendingChangesChange={handlePendingChangesChange}
            onSourceClick={handleSourceClick}
          />
        </div>

        {/* Edit Tools Overlay - Right side */}
        {state.isEditMode && (
          <div style={{
            width: 220,
            height: '100%',
            backgroundColor: theme.colors.background,
            borderLeft: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {/* Overlay Header */}
            <div style={{
              height: 39,
              padding: '0 16px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              boxSizing: 'content-box'
            }}>
              <span style={{
                fontSize: theme.fontSizes[2],
                fontWeight: theme.fontWeights.medium,
                color: theme.colors.text
              }}>
                Edit Tools
              </span>
            </div>

            {/* Tools Content */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: theme.space[3],
              display: 'flex',
              flexDirection: 'column',
              gap: theme.space[4],
            }}>
              {/* Auto Layout Section */}
              <div>
                <div style={{
                  fontSize: theme.fontSizes[1],
                  fontWeight: theme.fontWeights.medium,
                  color: theme.colors.text,
                  marginBottom: theme.space[2],
                }}>
                  Auto Layout
                </div>

                {/* Direction */}
                <div style={{ marginBottom: theme.space[3] }}>
                  <label style={{
                    display: 'block',
                    fontSize: theme.fontSizes[0],
                    color: theme.colors.textMuted,
                    marginBottom: theme.space[1],
                  }}>
                    Direction
                  </label>
                  <div style={{ display: 'flex', gap: theme.space[1] }}>
                    {(['TB', 'BT', 'LR', 'RL'] as const).map((dir) => (
                      <button
                        key={dir}
                        onClick={() => updateLayoutConfig({ direction: dir })}
                        title={{
                          TB: 'Top to Bottom',
                          BT: 'Bottom to Top',
                          LR: 'Left to Right',
                          RL: 'Right to Left'
                        }[dir]}
                        style={{
                          flex: 1,
                          padding: `${theme.space[1]}px`,
                          fontSize: theme.fontSizes[0],
                          fontFamily: theme.fonts.monospace,
                          color: state.layoutConfig.direction === dir ? 'white' : theme.colors.text,
                          backgroundColor: state.layoutConfig.direction === dir ? theme.colors.primary : theme.colors.backgroundSecondary,
                          border: `1px solid ${state.layoutConfig.direction === dir ? theme.colors.primary : theme.colors.border}`,
                          borderRadius: theme.radii[1],
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horizontal Spacing */}
                <div style={{ marginBottom: theme.space[3] }}>
                  <label style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: theme.fontSizes[0],
                    color: theme.colors.textMuted,
                    marginBottom: theme.space[1],
                  }}>
                    <span>H-Spacing</span>
                    <span style={{ fontFamily: theme.fonts.monospace }}>{state.layoutConfig.nodeSpacingX}</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="400"
                    step="10"
                    value={state.layoutConfig.nodeSpacingX}
                    onChange={(e) => updateLayoutConfig({ nodeSpacingX: Number(e.target.value) })}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Vertical Spacing */}
                <div style={{ marginBottom: theme.space[3] }}>
                  <label style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: theme.fontSizes[0],
                    color: theme.colors.textMuted,
                    marginBottom: theme.space[1],
                  }}>
                    <span>V-Spacing</span>
                    <span style={{ fontFamily: theme.fonts.monospace }}>{state.layoutConfig.nodeSpacingY}</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="10"
                    value={state.layoutConfig.nodeSpacingY}
                    onChange={(e) => updateLayoutConfig({ nodeSpacingY: Number(e.target.value) })}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Apply Button */}
                <button
                  onClick={applyAutoLayout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: theme.space[1],
                    width: '100%',
                    padding: `${theme.space[2]}px`,
                    fontSize: theme.fontSizes[1],
                    fontFamily: theme.fonts.body,
                    color: 'white',
                    backgroundColor: theme.colors.primary,
                    border: 'none',
                    borderRadius: theme.radii[1],
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <LayoutGrid size={14} />
                  <span>Apply Layout</span>
                </button>
              </div>

              {/* Edge Settings Section */}
              <div>
                <div style={{
                  fontSize: theme.fontSizes[1],
                  fontWeight: theme.fontWeights.medium,
                  color: theme.colors.text,
                  marginBottom: theme.space[2],
                }}>
                  Edge Settings
                </div>

                {/* Auto Update Edge Sides Toggle */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.space[2],
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={state.layoutConfig.autoUpdateEdgeSides}
                    onChange={(e) => updateLayoutConfig({ autoUpdateEdgeSides: e.target.checked })}
                    style={{
                      width: 16,
                      height: 16,
                      cursor: 'pointer',
                      accentColor: theme.colors.primary,
                    }}
                  />
                  <span style={{
                    fontSize: theme.fontSizes[1],
                    color: theme.colors.text,
                  }}>
                    Auto-update edge sides
                  </span>
                </label>
                <span style={{
                  display: 'block',
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.textMuted,
                  marginTop: theme.space[1],
                  lineHeight: 1.4,
                }}>
                  Automatically adjust edge connection points when nodes are moved
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Help Overlay */}
        {state.showHelp && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}>
            <div style={{
              position: 'relative',
              width: '90%',
              maxWidth: 500,
              maxHeight: '80%',
              backgroundColor: theme.colors.background,
              borderRadius: theme.radii[3],
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Close button */}
              <button
                onClick={toggleHelp}
                style={{
                  position: 'absolute',
                  top: theme.space[2],
                  right: theme.space[2],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  padding: 0,
                  backgroundColor: theme.colors.backgroundSecondary,
                  color: theme.colors.textMuted,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radii[2],
                  cursor: 'pointer',
                  zIndex: 1,
                  transition: 'all 0.15s',
                }}
              >
                <X size={16} />
              </button>
              <EmptyStateContent theme={theme} />
            </div>
          </div>
        )}

        {/* Legend Bar */}
        {state.showLegend && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            backgroundColor: theme.colors.background,
            borderBottom: `1px solid ${theme.colors.border}`,
            padding: `0 ${theme.space[3]}`,
            display: 'flex',
            alignItems: 'center',
            gap: theme.space[4],
            overflowX: 'auto',
            zIndex: 50,
            boxSizing: 'border-box',
          }}>
            <span style={{
              fontSize: theme.fontSizes[1],
              fontWeight: theme.fontWeights.medium,
              color: theme.colors.textMuted,
              flexShrink: 0,
            }}>
              Edges:
            </span>

            {state.canvas?.pv?.edgeTypes && Object.keys(state.canvas.pv.edgeTypes).length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[4], flexWrap: 'wrap' }}>
                {Object.entries(state.canvas.pv.edgeTypes).map(([typeName, edgeType]) => (
                  <div
                    key={typeName}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.space[2],
                    }}
                  >
                    {/* Edge visual representation */}
                    <svg width="40" height="12" style={{ flexShrink: 0 }}>
                      <defs>
                        <marker
                          id={`legend-arrow-${typeName}`}
                          markerWidth="8"
                          markerHeight="6"
                          refX="7"
                          refY="3"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 8 3, 0 6"
                            fill={edgeType.color || '#64748b'}
                          />
                        </marker>
                      </defs>
                      <line
                        x1="2"
                        y1="6"
                        x2="32"
                        y2="6"
                        stroke={edgeType.color || '#64748b'}
                        strokeWidth={Math.min(edgeType.width || 2, 3)}
                        strokeDasharray={
                          edgeType.style === 'dashed' ? '4,2' :
                          edgeType.style === 'dotted' ? '2,2' : undefined
                        }
                        markerEnd={edgeType.directed ? `url(#legend-arrow-${typeName})` : undefined}
                      />
                    </svg>

                    {/* Edge type name */}
                    <span style={{
                      fontSize: theme.fontSizes[1],
                      color: theme.colors.text,
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap',
                    }}>
                      {typeName.replace(/-/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{
                fontSize: theme.fontSizes[1],
                color: theme.colors.textMuted,
                fontStyle: 'italic',
              }}>
                No edge types defined
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Convert React Flow handle ID back to canvas side format.
 * Source handles have '-out' suffix (e.g., 'right-out' -> 'right')
 * Target handles are already in side format (e.g., 'left' -> 'left')
 */
function handleToCanvasSide(handle?: string): 'top' | 'right' | 'bottom' | 'left' | undefined {
  if (!handle) return undefined;
  const side = handle.replace(/-out$/, '');
  if (side === 'top' || side === 'right' || side === 'bottom' || side === 'left') {
    return side;
  }
  return undefined;
}

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

  // Apply dimension changes
  for (const { nodeId, dimensions } of changes.dimensionChanges) {
    const node = updatedCanvas.nodes?.find(n => n.id === nodeId);
    if (node) {
      node.width = dimensions.width;
      node.height = dimensions.height;
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
        if (updates.data.icon && node.pv) {
          node.pv.icon = updates.data.icon as string;
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

  // Apply edge deletions FIRST (before creations, so reconnected edges work correctly)
  // Match by from/to/type since id is not available in pending changes
  for (const { from, to, type } of changes.deletedEdges) {
    if (updatedCanvas.edges) {
      updatedCanvas.edges = updatedCanvas.edges.filter(
        e => !(e.fromNode === from && e.toNode === to && e.pv?.edgeType === type)
      );
    }
  }

  // Apply edge creations AFTER deletions
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
      // Convert React Flow handle IDs back to canvas side format
      fromSide: handleToCanvasSide(sourceHandle),
      toSide: handleToCanvasSide(targetHandle),
      pv: { edgeType: type },
    });
  }

  return updatedCanvas;
}
