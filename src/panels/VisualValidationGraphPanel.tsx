import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/visual-validation-react';
import type { GraphRendererHandle, PendingChanges } from '@principal-ai/visual-validation-react';
import type { PathBasedGraphConfiguration, NodeState, EdgeState } from '@principal-ai/visual-validation-core';
import { GraphConverter } from '@principal-ai/visual-validation-core';
import { Loader, ChevronDown, Save, X, Lock, Unlock } from 'lucide-react';
import { ConfigLoader, type ConfigFile } from './visual-validation/ConfigLoader';
import { ErrorStateContent } from './visual-validation/ErrorStateContent';
import { EmptyStateContent } from './visual-validation/EmptyStateContent';

interface GraphPanelState {
  config: PathBasedGraphConfiguration | null;
  nodes: NodeState[];
  edges: EdgeState[];
  loading: boolean;
  error: string | null;
  availableConfigs: ConfigFile[];
  selectedConfigId: string | null;
  // Edit mode state
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

/**
 * Visual Validation Graph Panel
 *
 * Visualizes vvf.config.yaml configuration files as interactive graph diagrams
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
    config: null,
    nodes: [],
    edges: [],
    loading: true,
    error: null,
    availableConfigs: [],
    selectedConfigId: null,
    isEditMode: false,
    hasUnsavedChanges: false,
    isSaving: false
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
          config: null,
          nodes: [],
          edges: [],
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
          config: null,
          nodes: [],
          edges: [],
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
      const config = ConfigLoader.parseYaml(configContent);
      const { nodes, edges } = GraphConverter.configToGraph(config);

      setState(prev => ({
        ...prev,
        config,
        nodes,
        edges,
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
        config: null,
        nodes: [],
        edges: [],
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
    if (!state.config || !graphRef.current) return;

    const pendingChanges = graphRef.current.getPendingChanges();
    if (!pendingChanges.hasChanges) return;

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

      // Apply changes to config
      const updatedConfig = applyChangesToConfig(state.config, pendingChanges);

      // Serialize to YAML
      const yaml = await import('js-yaml');
      const yamlContent = yaml.dump(updatedConfig, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });

      // Write to file
      const fullPath = `${repositoryPath}/${selectedConfig.path}`;
      await writeFile(fullPath, yamlContent);

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
  }, [state.config, state.availableConfigs, loadConfiguration]);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (!state.config) {
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
        padding: `${theme.space[4]} ${theme.space[5]}`,
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
                {state.config.metadata.name}
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
              <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
                v{state.config.metadata.version}
              </span>
              {state.config.metadata.description && (
                <>
                  <span style={{ color: theme.colors.textMuted }}>•</span>
                  <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
                    {state.config.metadata.description}
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[3] }}>
            {/* Node/Edge count */}
            <div style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
              {state.nodes.length} component{state.nodes.length !== 1 ? 's' : ''} • {state.edges.length} connection{state.edges.length !== 1 ? 's' : ''}
            </div>

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
          ref={graphRef}
          configuration={state.config}
          nodes={state.nodes}
          edges={state.edges}
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
 * Apply pending changes from GraphRenderer to the config
 */
function applyChangesToConfig(
  config: PathBasedGraphConfiguration,
  changes: PendingChanges
): PathBasedGraphConfiguration {
  let updatedConfig: PathBasedGraphConfiguration = JSON.parse(JSON.stringify(config));
  let hasPositionChanges = false;

  // Apply position changes
  for (const { nodeId, position } of changes.positionChanges) {
    hasPositionChanges = true;
    if (updatedConfig.nodeTypes[nodeId]) {
      updatedConfig.nodeTypes[nodeId] = {
        ...updatedConfig.nodeTypes[nodeId],
        position: { x: Math.round(position.x), y: Math.round(position.y) }
      };
    }
  }

  // Apply node updates
  for (const { nodeId, updates } of changes.nodeUpdates) {
    if (updatedConfig.nodeTypes[nodeId]) {
      const nodeType = updatedConfig.nodeTypes[nodeId];

      // Handle type rename
      if (updates.type && updates.type !== nodeId) {
        delete updatedConfig.nodeTypes[nodeId];
        updatedConfig.nodeTypes[updates.type] = nodeType;
        // Update allowedConnections references
        updatedConfig.allowedConnections = updatedConfig.allowedConnections.map(conn => ({
          ...conn,
          from: conn.from === nodeId ? updates.type! : conn.from,
          to: conn.to === nodeId ? updates.type! : conn.to
        }));
      }

      // Handle data updates (icon, etc.)
      if (updates.data) {
        const targetId = updates.type || nodeId;
        const icon = updates.data.icon as string | undefined;
        if (icon) {
          updatedConfig.nodeTypes[targetId].icon = icon;
        }
      }
    }
  }

  // Apply node deletions
  for (const nodeId of changes.deletedNodeIds) {
    delete updatedConfig.nodeTypes[nodeId];
    updatedConfig.allowedConnections = updatedConfig.allowedConnections.filter(
      conn => conn.from !== nodeId && conn.to !== nodeId
    );
  }

  // Apply edge creations
  for (const { from, to, type } of changes.createdEdges) {
    const exists = updatedConfig.allowedConnections.some(
      conn => conn.from === from && conn.to === to && conn.via === type
    );
    if (!exists) {
      updatedConfig.allowedConnections.push({ from, to, via: type });
    }
  }

  // Apply edge deletions
  for (const { from, to, type } of changes.deletedEdges) {
    updatedConfig.allowedConnections = updatedConfig.allowedConnections.filter(
      conn => !(conn.from === from && conn.to === to && conn.via === type)
    );
  }

  // Set layout to manual if positions changed
  if (hasPositionChanges) {
    updatedConfig = {
      ...updatedConfig,
      display: {
        ...updatedConfig.display,
        layout: 'manual'
      }
    };
  }

  return updatedConfig;
}
