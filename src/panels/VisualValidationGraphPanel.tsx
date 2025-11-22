import React, { useState, useEffect, useCallback } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/visual-validation-react';
import type { PathBasedGraphConfiguration, NodeState, EdgeState } from '@principal-ai/visual-validation-core';
import { FileText, AlertCircle, Loader, ExternalLink, BookOpen } from 'lucide-react';
import { ConfigLoader } from './visual-validation/ConfigLoader';
import { GraphConverter } from './visual-validation/GraphConverter';

interface GraphPanelState {
  config: PathBasedGraphConfiguration | null;
  nodes: NodeState[];
  edges: EdgeState[];
  loading: boolean;
  error: string | null;
}

const EmptyStateContent: React.FC<{ theme: any }> = ({ theme }) => {

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      overflowY: 'auto',
      padding: theme.space[4],
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      textAlign: 'center',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        paddingTop: theme.space[4],
        paddingBottom: theme.space[4],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <FileText size={48} color={theme.colors.primary} style={{ marginBottom: theme.space[3] }} />

        <h2 style={{
          margin: 0,
          marginBottom: theme.space[3],
          fontSize: theme.fontSizes[4],
          fontWeight: theme.fontWeights.bold,
          color: theme.colors.text
        }}>
          Visual Validation Graph Panel
        </h2>

        <p style={{
          margin: 0,
          marginBottom: theme.space[2],
          fontSize: theme.fontSizes[2],
          color: theme.colors.textSecondary,
          lineHeight: 1.6
        }}>
          This panel visualizes your project's component architecture and validation flows
          using a declarative YAML configuration file.
        </p>

        <div style={{
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radii[2],
          padding: theme.space[3],
          marginTop: theme.space[4],
          marginBottom: theme.space[3],
          width: '100%',
          maxWidth: '600px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{
            margin: 0,
            marginBottom: theme.space[2],
            fontSize: theme.fontSizes[2],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text,
            textAlign: 'left'
          }}>
            What you'll see:
          </h3>

          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            textAlign: 'left',
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes[1]
          }}>
            <li style={{ marginBottom: theme.space[1], display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: theme.colors.success, marginRight: theme.space[2], flexShrink: 0 }}>✓</span>
              <span>Interactive graph of your components and their relationships</span>
            </li>
            <li style={{ marginBottom: theme.space[1], display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: theme.colors.success, marginRight: theme.space[2], flexShrink: 0 }}>✓</span>
              <span>Path-based validation rules and dependencies</span>
            </li>
            <li style={{ marginBottom: theme.space[1], display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: theme.colors.success, marginRight: theme.space[2], flexShrink: 0 }}>✓</span>
              <span>Visual feedback on component structure and integration points</span>
            </li>
            <li style={{ marginBottom: theme.space[1], display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: theme.colors.success, marginRight: theme.space[2], flexShrink: 0 }}>✓</span>
              <span>Customizable layouts and themes</span>
            </li>
          </ul>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.space[3],
          marginTop: theme.space[4]
        }}>
          <h3 style={{
            margin: 0,
            fontSize: theme.fontSizes[2],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text
          }}>
            Get Started
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.space[2]
          }}>
            <a
              href="https://github.com/principal-ai/visual-validation-core-library/blob/main/docs/CONFIGURATION_REFERENCE.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[2],
                padding: theme.space[3],
                backgroundColor: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[2],
                textDecoration: 'none',
                color: theme.colors.text,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary;
                e.currentTarget.style.backgroundColor = theme.colors.background;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border;
                e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary;
              }}
            >
              <BookOpen size={20} color={theme.colors.primary} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: theme.fontSizes[2],
                  fontWeight: theme.fontWeights.medium,
                  marginBottom: theme.space[1]
                }}>
                  Configuration Reference
                </div>
                <div style={{
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.textSecondary
                }}>
                  Learn how to create vvf.config.yaml with path-based validation
                </div>
              </div>
              <ExternalLink size={16} color={theme.colors.textMuted} style={{ flexShrink: 0 }} />
            </a>

            <a
              href="https://www.npmjs.com/package/@principal-ai/visual-validation-core"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[2],
                padding: theme.space[3],
                backgroundColor: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[2],
                textDecoration: 'none',
                color: theme.colors.text,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary;
                e.currentTarget.style.backgroundColor = theme.colors.background;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border;
                e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary;
              }}
            >
              <FileText size={20} color={theme.colors.primary} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: theme.fontSizes[2],
                  fontWeight: theme.fontWeights.medium,
                  marginBottom: theme.space[1]
                }}>
                  NPM Package Documentation
                </div>
                <div style={{
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.textSecondary
                }}>
                  View @principal-ai/visual-validation-core on npm
                </div>
              </div>
              <ExternalLink size={16} color={theme.colors.textMuted} style={{ flexShrink: 0 }} />
            </a>
          </div>

          <p style={{
            margin: 0,
            fontSize: theme.fontSizes[1],
            color: theme.colors.textMuted,
            lineHeight: 1.5,
            textAlign: 'center'
          }}>
            Once you add a <code style={{
              backgroundColor: theme.colors.backgroundSecondary,
              padding: `2px ${theme.space[1]}`,
              borderRadius: theme.radii[0],
              fontFamily: theme.fonts.monospace,
              fontSize: theme.fontSizes[0]
            }}>vvf.config.yaml</code> file to your project root,
            the panel will automatically visualize your configuration.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Visual Validation Graph Panel
 *
 * Visualizes vvf.config.yaml configuration files as interactive graph diagrams
 */
export const VisualValidationGraphPanel: React.FC<PanelComponentProps> = ({
  context,
  events
}) => {
  const { theme } = useTheme();
  const [state, setState] = useState<GraphPanelState>({
    config: null,
    nodes: [],
    edges: [],
    loading: true,
    error: null
  });

  const loadConfiguration = useCallback(async () => {
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
      const fileTreeData = fileTreeSlice?.data;

      // For now, we'll expect fileTree to be an array of files
      // This may need adjustment based on actual FileTree structure
      const files = Array.isArray(fileTreeData) ? fileTreeData : (fileTreeData as { files?: unknown[] })?.files || [];

      // Look for vvf.config.yaml
      const configContent = ConfigLoader.findConfigContent(files);

      if (!configContent) {
        // No config found - show empty state (not an error)
        setState({
          config: null,
          nodes: [],
          edges: [],
          loading: false,
          error: null
        });
        return;
      }

      // Parse YAML config
      const config = ConfigLoader.parseYaml(configContent);

      // Convert config to nodes/edges
      const { nodes, edges } = GraphConverter.configToGraph(config);

      setState({
        config,
        nodes,
        edges,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        config: null,
        nodes: [],
        edges: [],
        loading: false,
        error: (error as Error).message
      });
    }
  }, [context]);

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
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: theme.space[4],
        color: theme.colors.error,
        fontFamily: theme.fonts.body,
        textAlign: 'center'
      }}>
        <AlertCircle size={48} />
        <h3 style={{ marginTop: theme.space[3], marginBottom: theme.space[2] }}>
          Configuration Error
        </h3>
        <p style={{ color: theme.colors.textMuted, marginTop: theme.space[2], maxWidth: '400px' }}>
          {state.error}
        </p>
        <button
          onClick={loadConfiguration}
          style={{
            marginTop: theme.space[4],
            padding: `${theme.space[2]} ${theme.space[4]}`,
            backgroundColor: theme.colors.primary,
            color: theme.colors.background,
            border: 'none',
            borderRadius: theme.radii[1],
            cursor: 'pointer',
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes[2]
          }}
        >
          Retry
        </button>
      </div>
    );
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
          <div>
            <h2 style={{
              margin: 0,
              fontSize: theme.fontSizes[3],
              fontWeight: theme.fontWeights.medium,
              color: theme.colors.text
            }}>
              {state.config.metadata.name}
            </h2>
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
