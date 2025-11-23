import React, { useState, useEffect, useCallback } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/visual-validation-react';
import type { PathBasedGraphConfiguration, NodeState, EdgeState } from '@principal-ai/visual-validation-core';
import { GraphConverter } from '@principal-ai/visual-validation-core';
import { Loader, ChevronDown } from 'lucide-react';
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
}

/**
 * Visual Validation Graph Panel
 *
 * Visualizes vvf.config.yaml configuration files as interactive graph diagrams
 */
export const VisualValidationGraphPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events
}) => {
  const { theme } = useTheme();
  const [state, setState] = useState<GraphPanelState>({
    config: null,
    nodes: [],
    edges: [],
    loading: true,
    error: null,
    availableConfigs: [],
    selectedConfigId: null
  });

  const loadConfiguration = useCallback(async (configId?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check if fileTree slice is available
      if (!context.hasSlice('fileTree')) {
        throw new Error('File tree data not available');
      }

      if (context.isSliceLoading('fileTree')) {
        // Still loading, keep in loading state
        return;
      }

      const fileTreeSlice = context.getSlice('fileTree');
      const fileTreeData = fileTreeSlice?.data as { allFiles?: Array<{ path?: string; relativePath?: string; name?: string }> } | null;

      if (!fileTreeData?.allFiles) {
        // No file tree data - show empty state
        setState({
          config: null,
          nodes: [],
          edges: [],
          loading: false,
          error: null,
          availableConfigs: [],
          selectedConfigId: null
        });
        return;
      }

      // Find all available configs
      const availableConfigs = ConfigLoader.findConfigs(fileTreeData.allFiles);

      if (availableConfigs.length === 0) {
        // No config found - show empty state (not an error)
        setState({
          config: null,
          nodes: [],
          edges: [],
          loading: false,
          error: null,
          availableConfigs: [],
          selectedConfigId: null
        });
        return;
      }

      // Determine which config to load
      let selectedConfig: ConfigFile;
      if (configId) {
        // Load specific config by ID
        const found = availableConfigs.find(c => c.id === configId);
        if (!found) {
          throw new Error(`Config with ID '${configId}' not found`);
        }
        selectedConfig = found;
      } else if (state.selectedConfigId) {
        // Try to keep the currently selected config
        const found = availableConfigs.find(c => c.id === state.selectedConfigId);
        selectedConfig = found || availableConfigs[0];
      } else {
        // Load the first config by default
        selectedConfig = availableConfigs[0];
      }

      // Read file contents using the readFile action
      const readFile = (actions as { readFile?: (path: string) => Promise<string> }).readFile;
      if (!readFile) {
        console.error('[VisualValidation] readFile action not available');
        throw new Error('readFile action not available');
      }

      // Get repository path from context
      const repositoryPath = (context as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      // Construct full file path
      const fullPath = `${repositoryPath}/${selectedConfig.path}`;
      const fileResult = await readFile(fullPath);

      if (!fileResult || typeof fileResult !== 'object' || !('content' in fileResult)) {
        throw new Error('Failed to read config file');
      }

      const configContent = (fileResult as { content: string }).content;

      // Parse YAML config
      const config = ConfigLoader.parseYaml(configContent);

      // Convert config to nodes/edges
      const { nodes, edges } = GraphConverter.configToGraph(config);

      setState({
        config,
        nodes,
        edges,
        loading: false,
        error: null,
        availableConfigs,
        selectedConfigId: selectedConfig.id
      });
    } catch (error) {
      console.error('[VisualValidation] Error during config load:', error);
      setState(prev => ({
        config: null,
        nodes: [],
        edges: [],
        loading: false,
        error: (error as Error).message,
        availableConfigs: prev.availableConfigs,
        selectedConfigId: prev.selectedConfigId
      }));
    }
  }, [context, actions, state.selectedConfigId]);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  // Subscribe to data refresh events
  useEffect(() => {
    const unsubscribe = events.on('data:refresh', () => {
      loadConfiguration();
    });

    return unsubscribe;
  }, [events, loadConfiguration]);

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
        <span style={{ marginLeft: theme.space[2] }}>
          Loading configuration...
        </span>
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

              {/* Config Selector - only show if multiple configs available */}
              {state.availableConfigs.length > 1 && (
                <div style={{ position: 'relative' }}>
                  <select
                    value={state.selectedConfigId || ''}
                    onChange={(e) => loadConfiguration(e.target.value)}
                    style={{
                      appearance: 'none',
                      padding: `${theme.space[1]} ${theme.space[4]} ${theme.space[1]} ${theme.space[2]}`,
                      fontSize: theme.fontSizes[1],
                      fontFamily: theme.fonts.body,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.backgroundSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii[1],
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.primary;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = theme.colors.border;
                    }}
                  >
                    {state.availableConfigs.map(config => (
                      <option key={config.id} value={config.id}>
                        {config.name}
                      </option>
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
              {state.availableConfigs.length > 1 && (
                <>
                  <span style={{ color: theme.colors.textMuted }}>•</span>
                  <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
                    {state.availableConfigs.length} configurations available
                  </span>
                </>
              )}
            </div>
          </div>
          <div style={{
            fontSize: theme.fontSizes[1],
            color: theme.colors.textMuted
          }}>
            {state.nodes.length} component{state.nodes.length !== 1 ? 's' : ''} • {state.edges.length} connection{state.edges.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Graph */}
      <div style={{ flex: 1, position: 'relative' }}>
        <GraphRenderer
          configuration={state.config}
          nodes={state.nodes}
          edges={state.edges}
          showMinimap={true}
          showControls={true}
          showBackground={true}
        />
      </div>
    </div>
  );
};
