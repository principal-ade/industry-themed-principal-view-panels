import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/principal-view-react';
import type { GraphRendererHandle, PendingChanges } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas, ComponentLibrary } from '@principal-ai/principal-view-core';
import { Loader, Save, X, Pencil, Copy, Check, Info, MessageSquareOff, Grid3X3, RefreshCw, Crosshair } from 'lucide-react';
import { ConfigLoader } from './principal-view/ConfigLoader';
import { ErrorStateContent } from './principal-view/ErrorStateContent';
import { EmptyStateContent } from './principal-view/EmptyStateContent';
import type { FileTree, FileInfo } from '@principal-ai/repository-abstraction';

interface GraphPanelState {
  canvas: ExtendedCanvas | null;
  library: ComponentLibrary | null;
  loading: boolean;
  error: string | null;
  // Legend overlay
  showLegend: boolean;
  // Tooltips on hover
  showTooltips: boolean;
  // Grid lines background
  showGridLines: boolean;
  // Edit mode state
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

/**
 * Props for CanvasEditorPanel
 */
export interface CanvasEditorPanelProps extends PanelComponentProps {
  /**
   * Canvas path to load (relative to repository root).
   */
  canvasPath?: string;

  /**
   * Canvas display name.
   */
  canvasName?: string;

  /**
   * Optional canvas file info with metadata (size, lastModified, etc.).
   * Used for detecting file changes and auto-reloading.
   */
  canvasFileInfo?: FileInfo | null;
}

/**
 * Principal View Graph Panel
 *
 * Visualizes .canvas configuration files as interactive graph diagrams
 * with full editing support for nodes, edges, and positions.
 */
export const CanvasEditorPanel: React.FC<CanvasEditorPanelProps> = ({
  context,
  actions,
  events,
  canvasPath,
  canvasName,
  canvasFileInfo,
}) => {
  const { theme } = useTheme();

  // Ref to GraphRenderer for getting pending changes
  const graphRef = useRef<GraphRendererHandle>(null);

  // Ref to container for measuring dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [state, setState] = useState<GraphPanelState>({
    canvas: null,
    library: null,
    loading: true,
    error: null,
    showLegend: false,
    showTooltips: true,
    showGridLines: false,
    isEditMode: false,
    hasUnsavedChanges: false,
    isSaving: false,
  });

  // Store context and actions in refs to avoid recreation of callbacks
  const contextRef = useRef(context);
  const actionsRef = useRef(actions);
  const eventsRef = useRef(events);
  contextRef.current = context;
  actionsRef.current = actions;
  eventsRef.current = events;

  // Track if we should skip the next file change (after save)
  const skipNextFileChangeRef = useRef(false);

  // Track canvas file timestamp for auto-reload on changes
  const canvasFileTimestampRef = useRef<number | null>(null);

  // Track "copied" feedback for copy path button
  const [pathCopied, setPathCopied] = useState(false);

  // Callback ref for measuring container dimensions
  const containerRef = useCallback((container: HTMLDivElement | null) => {
    // Clean up previous observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (!container) {
      return;
    }

    const updateDimensions = () => {
      const { width, height } = container.getBoundingClientRect();
      setDimensions(prev => {
        const newWidth = Math.round(width);
        const newHeight = Math.round(height);
        if (prev.width === newWidth && prev.height === newHeight) {
          return prev;
        }
        return { width: newWidth, height: newHeight };
      });
    };

    // Initial measurement
    updateDimensions();

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateDimensions);
    });
    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;
  }, []);


  const loadConfiguration = useCallback(async () => {
    // Early return if required props are missing
    if (!canvasPath) {
      setState(prev => ({ ...prev, canvas: null, library: null, loading: false, error: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const ctx = contextRef.current;
      const acts = actionsRef.current;

      const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
      if (!readFile) {
        throw new Error('readFile action not available');
      }

      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      // Read canvas file directly using canvasPath prop
      const fullPath = `${repositoryPath}/${canvasPath}`;
      const configContent = await readFile(fullPath);

      if (!configContent || typeof configContent !== 'string') {
        throw new Error('Failed to read canvas file');
      }

      const canvas = ConfigLoader.parseCanvas(configContent);

      // Load library.yaml if it exists
      let library: ComponentLibrary | null = null;

      // Check if fileTree slice is available for library loading
      if (ctx.hasSlice('fileTree') && !ctx.isSliceLoading('fileTree')) {
        const fileTreeSlice = ctx.getSlice('fileTree');
        const fileTreeData = fileTreeSlice?.data as { allFiles?: Array<{ path?: string; relativePath?: string; name?: string }> } | null;

        if (fileTreeData?.allFiles) {
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
        }
      }

      setState(prev => ({
        ...prev,
        canvas,
        library,
        loading: false,
        error: null,
        hasUnsavedChanges: false
      }));
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

  // Toggle legend overlay
  const toggleLegend = useCallback(() => {
    setState(prev => ({ ...prev, showLegend: !prev.showLegend }));
  }, []);

  // Toggle tooltips
  const toggleTooltips = useCallback(() => {
    setState(prev => ({ ...prev, showTooltips: !prev.showTooltips }));
  }, []);

  // Toggle grid lines
  const toggleGridLines = useCallback(() => {
    setState(prev => ({ ...prev, showGridLines: !prev.showGridLines }));
  }, []);

  // Recenter node coordinates so the bounding box center is at (0,0)
  // This allows saving coordinates that don't require fitView adjustment on load
  const recenterCoordinates = useCallback(() => {
    if (!state.canvas?.nodes || state.canvas.nodes.length === 0) return;

    // Calculate bounding box of all nodes
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const node of state.canvas.nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x + node.width);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y + node.height);
    }

    // Calculate center of bounding box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Skip if already centered (within 1px tolerance)
    if (Math.abs(centerX) < 1 && Math.abs(centerY) < 1) return;

    // Deep clone the canvas and shift all node coordinates
    const updatedCanvas: ExtendedCanvas = JSON.parse(JSON.stringify(state.canvas));
    if (updatedCanvas.nodes) {
      for (const node of updatedCanvas.nodes) {
        node.x = Math.round(node.x - centerX);
        node.y = Math.round(node.y - centerY);
      }
    }

    setState(prev => ({
      ...prev,
      canvas: updatedCanvas,
      hasUnsavedChanges: true,
    }));
  }, [state.canvas]);

  // Copy current config path to clipboard
  const copyConfigPath = useCallback(() => {
    if (!canvasPath) return;
    navigator.clipboard.writeText(canvasPath).then(() => {
      setPathCopied(true);
      setTimeout(() => setPathCopied(false), 2000);
    });
  }, [canvasPath]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setState(prev => {
      if (prev.isEditMode && prev.hasUnsavedChanges) {
        // Exiting edit mode with unsaved changes - reload to discard
        loadConfiguration();
        return { ...prev, isEditMode: false, hasUnsavedChanges: false };
      }
      return { ...prev, isEditMode: !prev.isEditMode };
    });
  }, [loadConfiguration]);

  // Discard changes and reload
  const discardChanges = useCallback(() => {
    loadConfiguration();
    setState(prev => ({ ...prev, hasUnsavedChanges: false }));
  }, [loadConfiguration]);

  // Save all pending changes
  const saveAllChanges = useCallback(async () => {
    if (!state.canvas || !canvasPath) return;

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

      // Apply changes to canvas if there are pending changes from GraphRenderer,
      // otherwise use state.canvas directly (already contains auto-layout changes)
      const updatedCanvas = hasGraphChanges && pendingChanges
        ? applyChangesToCanvas(state.canvas, pendingChanges)
        : state.canvas;

      // Serialize to JSON
      const jsonContent = JSON.stringify(updatedCanvas, null, 2);

      // Write to file using canvasPath prop
      const fullPath = `${repositoryPath}/${canvasPath}`;
      await writeFile(fullPath, jsonContent);

      // Skip the next file change event since we caused it
      skipNextFileChangeRef.current = true;

      // Update local state with the saved canvas (no reload needed)
      setState(prev => ({
        ...prev,
        canvas: updatedCanvas,
        isSaving: false,
        hasUnsavedChanges: false,
      }));
    } catch (error) {
      console.error('[PrincipalView] Error saving changes:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: `Failed to save: ${(error as Error).message}`
      }));
    }
  }, [state.canvas, state.hasUnsavedChanges, canvasPath]);

  // Load configuration when canvasPath prop changes
  useEffect(() => {
    loadConfiguration();
  }, [canvasPath, loadConfiguration]);

  // Update timestamp ref when FileInfo prop changes
  useEffect(() => {
    if (canvasFileInfo?.lastModified) {
      canvasFileTimestampRef.current = canvasFileInfo.lastModified.getTime();
    }
  }, [canvasFileInfo]);

  // Auto-reload on file changes via workspace:changed events
  useEffect(() => {
    if (!events || !canvasPath) return;

    const handleWorkspaceChange = () => {
      console.log('[CanvasEditorPanel] workspace:changed event received', { canvasPath });

      // Skip if we just saved (we caused this file change)
      if (skipNextFileChangeRef.current) {
        console.log('[CanvasEditorPanel] Skipping - we caused this change');
        skipNextFileChangeRef.current = false;
        return;
      }

      // Get current file tree to check timestamps
      const ctx = contextRef.current;
      if (!ctx.hasSlice('fileTree')) {
        console.log('[CanvasEditorPanel] No fileTree slice available');
        return;
      }

      const fileTreeSlice = ctx.getSlice('fileTree');
      const fileTreeData = fileTreeSlice?.data as FileTree | null;
      if (!fileTreeData?.allFiles) {
        console.log('[CanvasEditorPanel] No allFiles in fileTreeData');
        return;
      }

      console.log('[CanvasEditorPanel] FileTree has', fileTreeData.allFiles.length, 'files, SHA:', fileTreeData.sha);

      // Check canvas file timestamp
      const canvasFile = fileTreeData.allFiles.find(f =>
        f.path === canvasPath || f.relativePath === canvasPath
      );

      console.log('[CanvasEditorPanel] Looking for canvas file:', canvasPath, 'Found:', !!canvasFile);

      if (canvasFile?.lastModified) {
        const currentTimestamp = canvasFile.lastModified.getTime();
        console.log('[CanvasEditorPanel] Timestamp comparison:', {
          stored: canvasFileTimestampRef.current,
          current: currentTimestamp,
          changed: canvasFileTimestampRef.current !== currentTimestamp
        });

        if (canvasFileTimestampRef.current && currentTimestamp !== canvasFileTimestampRef.current) {
          console.log('[CanvasEditorPanel] Canvas file modified, reloading...', {
            path: canvasPath,
            lastLoaded: new Date(canvasFileTimestampRef.current),
            current: new Date(currentTimestamp),
          });

          loadConfiguration();
          canvasFileTimestampRef.current = currentTimestamp;
        }
      } else {
        console.log('[CanvasEditorPanel] Canvas file has no lastModified timestamp');
      }
    };

    events.on('workspace:changed', handleWorkspaceChange);
    return () => {
      events.off('workspace:changed', handleWorkspaceChange);
    };
  }, [events, canvasPath, loadConfiguration]);

  // Subscribe to data refresh events
  useEffect(() => {
    const unsubscribe = eventsRef.current.on('data:refresh', () => {
      loadConfiguration();
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
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', gap: theme.space[3], minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[2], minWidth: 0, flex: 1 }}>
            <h2 style={{
            margin: 0,
            fontSize: theme.fontSizes[3],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}>
            {canvasName || 'Untitled'}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[2], flexShrink: 0 }}>
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

        {/* Refresh Button - flush right, full height */}
        <button
          onClick={() => loadConfiguration()}
          disabled={state.hasUnsavedChanges}
          title={state.hasUnsavedChanges ? 'Save or discard changes before refreshing' : 'Refresh'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 39,
            padding: 0,
            backgroundColor: 'transparent',
            color: theme.colors.textMuted,
            border: 'none',
            borderLeft: `1px solid ${theme.colors.border}`,
            cursor: state.hasUnsavedChanges ? 'not-allowed' : 'pointer',
            opacity: state.hasUnsavedChanges ? 0.5 : 1,
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <RefreshCw size={18} />
        </button>

        {/* Tooltips Toggle Button - flush right, full height */}
        <button
          onClick={toggleTooltips}
          title={state.showTooltips ? 'Disable hover tooltips' : 'Enable hover tooltips'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 39,
            padding: 0,
            backgroundColor: !state.showTooltips ? theme.colors.primary : 'transparent',
            color: !state.showTooltips ? 'white' : theme.colors.textMuted,
            border: 'none',
            borderLeft: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <MessageSquareOff size={18} />
        </button>

        {/* Grid Lines Toggle Button */}
        <button
          onClick={toggleGridLines}
          title={state.showGridLines ? 'Hide Grid Lines' : 'Show Grid Lines'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 39,
            padding: 0,
            backgroundColor: state.showGridLines ? theme.colors.primary : 'transparent',
            color: state.showGridLines ? 'white' : theme.colors.textMuted,
            border: 'none',
            borderLeft: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <Grid3X3 size={18} />
        </button>

        {/* Recenter Coordinates Button - only visible in edit mode */}
        {state.isEditMode && (
          <button
            onClick={recenterCoordinates}
            title="Recenter coordinates (shift all nodes so center is at origin)"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 39,
              padding: 0,
              backgroundColor: 'transparent',
              color: theme.colors.textMuted,
              border: 'none',
              borderLeft: `1px solid ${theme.colors.border}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <Crosshair size={18} />
          </button>
        )}

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
        {/* Graph */}
        <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
          <GraphRenderer
            ref={graphRef}
            canvas={state.canvas}
            width={dimensions.width}
            height={dimensions.height}
            editable={state.isEditMode}
            onPendingChangesChange={(hasChanges) => {
              setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
            }}
            showNodeDetailPanel={true}
          />
        </div>

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
