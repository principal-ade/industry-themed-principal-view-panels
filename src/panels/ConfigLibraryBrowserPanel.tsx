import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import {
  ConfigurationLoader,
  LibraryLoader,
  type ComponentLibrary,
  type LibraryNodeComponent,
  type LibraryEdgeComponent,
} from '@principal-ai/visual-validation-core';
import {
  FileJson,
  Library,
  Box,
  ArrowRight,
  RefreshCw,
  Circle,
  Square,
  Hexagon,
  Diamond,
  Search,
  Copy,
  Check,
  Network,
  ExternalLink,
  HelpCircle,
  X,
} from 'lucide-react';
import { PanelFileSystemAdapter, type FileTreeEntry } from '../adapters/PanelFileSystemAdapter';

type TabId = 'canvas' | 'library';

interface BrowserPanelState {
  loading: boolean;
  error: string | null;
  configs: ConfigItem[];
  library: ComponentLibrary | null;
  libraryPath: string | null;
  activeTab: TabId;
  selectedConfigId: string | null;
  libraryFilter: string;
}

interface ConfigItem {
  id: string;
  name: string;
  path: string;
  displayName: string;
}

/**
 * Event payload for config selection
 */
export interface ConfigSelectedEventPayload {
  configId: string;
  configPath: string;
  configName: string;
}

/**
 * Config Library Browser Panel
 *
 * Lists available .canvas configurations and component library items.
 * Clicking a config emits an event that the graph panel can listen to.
 */
export const ConfigLibraryBrowserPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();

  const [state, setState] = useState<BrowserPanelState>({
    loading: true,
    error: null,
    configs: [],
    library: null,
    libraryPath: null,
    activeTab: 'canvas',
    selectedConfigId: null,
    libraryFilter: '',
  });

  // Copy command state for empty state
  const [copied, setCopied] = useState(false);
  // Show setup info overlay (for when user wants to see empty state instructions again)
  const [showSetupInfo, setShowSetupInfo] = useState(false);
  const initCommand = 'npx @principal-ai/visual-validation-cli init';

  // Refs for stable callbacks
  const contextRef = useRef(context);
  const actionsRef = useRef(actions);
  const eventsRef = useRef(events);
  contextRef.current = context;
  actionsRef.current = actions;
  eventsRef.current = events;

  // Load configs and library
  const loadData = useCallback(async () => {
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
      const fileTreeData = fileTreeSlice?.data as {
        allFiles?: FileTreeEntry[];
      } | null;

      if (!fileTreeData?.allFiles) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
          configs: [],
          library: null,
        }));
        return;
      }

      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      const readFile = (acts as { readFile?: (path: string) => Promise<{ content: string }> }).readFile;
      if (!readFile) {
        throw new Error('readFile action not available');
      }

      // Create the adapter
      const adapter = new PanelFileSystemAdapter({
        fileTreeFiles: fileTreeData.allFiles,
        basePath: repositoryPath,
      });

      // Find .canvas files in .vgc/ folder
      const vgcFiles = fileTreeData.allFiles.filter(f => {
        const path = f.relativePath || f.path || '';
        return path.startsWith('.vgc/');
      });

      // Load all file contents into the adapter cache
      for (const file of vgcFiles) {
        const relativePath = file.relativePath || file.path || '';
        const fullPath = `${repositoryPath}/${relativePath}`;
        try {
          const result = await readFile(fullPath);
          if (result?.content) {
            adapter.setFileContent(relativePath, result.content);
            adapter.setFileContent(fullPath, result.content);
          }
        } catch {
          // File might not be readable, skip it
          console.warn(`[ConfigLibraryBrowser] Could not read file: ${relativePath}`);
        }
      }

      // Use ConfigurationLoader to find YAML configs
      const configLoader = new ConfigurationLoader(adapter);
      const configNames = configLoader.listConfigurations(repositoryPath);

      // Also find .canvas files manually (ConfigurationLoader is for YAML)
      const canvasConfigs: ConfigItem[] = [];
      for (const file of vgcFiles) {
        const path = file.relativePath || file.path || '';
        const name = file.name || '';
        if (name.endsWith('.canvas')) {
          const configName = name.replace(/\.canvas$/, '');
          const displayName = configName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          canvasConfigs.push({
            id: configName,
            name: configName,
            path: path,
            displayName,
          });
        }
      }

      // Add YAML configs (excluding library.yaml which is not a canvas config)
      for (const name of configNames) {
        if (name === 'library') continue;
        if (!canvasConfigs.find(c => c.id === name)) {
          const displayName = name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          canvasConfigs.push({
            id: name,
            name,
            path: `.vgc/${name}.yaml`,
            displayName,
          });
        }
      }

      // Load library
      const libraryLoader = new LibraryLoader(adapter);
      const libraryResult = libraryLoader.load(repositoryPath);

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        configs: canvasConfigs,
        library: libraryResult.success ? libraryResult.library || null : null,
        libraryPath: libraryResult.path,
      }));
    } catch (error) {
      console.error('[ConfigLibraryBrowser] Error loading data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  // Load on mount and when fileTree finishes loading
  const fileTreeLoading = context.hasSlice('fileTree') && context.isSliceLoading('fileTree');
  const fileTreeLoadingRef = useRef(fileTreeLoading);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const wasLoading = fileTreeLoadingRef.current;
    fileTreeLoadingRef.current = fileTreeLoading;

    if (wasLoading && !fileTreeLoading) {
      loadData();
    }
  }, [fileTreeLoading, loadData]);

  // Subscribe to data refresh events
  useEffect(() => {
    const unsubscribe = eventsRef.current.on('data:refresh', () => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  // Handle tab change
  const handleTabChange = useCallback((tab: TabId) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  // Handle library filter change
  const handleFilterChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, libraryFilter: value }));
  }, []);

  // Handle copy command for empty state
  const handleCopyCommand = useCallback(() => {
    navigator.clipboard.writeText(initCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [initCommand]);

  // Handle config selection
  const handleConfigSelect = useCallback((config: ConfigItem) => {
    setState(prev => ({ ...prev, selectedConfigId: config.id }));

    // Emit event for graph panel to listen to
    eventsRef.current.emit({
      type: 'custom',
      source: 'config-library-browser',
      timestamp: Date.now(),
      payload: {
        action: 'selectConfig',
        configId: config.id,
        configPath: config.path,
        configName: config.displayName,
      } as ConfigSelectedEventPayload & { action: string },
    });

    // Also use notifyPanels action if available
    const acts = actionsRef.current as { notifyPanels?: (event: unknown) => void };
    if (acts.notifyPanels) {
      acts.notifyPanels({
        type: 'vv:config:selected',
        configId: config.id,
        configPath: config.path,
        configName: config.displayName,
      });
    }
  }, []);

  // Get shape icon
  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case 'circle':
        return Circle;
      case 'rectangle':
        return Square;
      case 'hexagon':
        return Hexagon;
      case 'diamond':
        return Diamond;
      default:
        return Box;
    }
  };

  // Memoized node components list (filtered)
  const nodeComponents = useMemo(() => {
    if (!state.library?.nodeComponents) return [];
    const entries = Object.entries(state.library.nodeComponents);
    if (!state.libraryFilter) return entries;

    const filter = state.libraryFilter.toLowerCase();
    return entries.filter(([key, node]) =>
      key.toLowerCase().includes(filter) ||
      node.description?.toLowerCase().includes(filter) ||
      node.tags?.some(tag => tag.toLowerCase().includes(filter))
    );
  }, [state.library, state.libraryFilter]);

  // Memoized edge components list (filtered)
  const edgeComponents = useMemo(() => {
    if (!state.library?.edgeComponents) return [];
    const entries = Object.entries(state.library.edgeComponents);
    if (!state.libraryFilter) return entries;

    const filter = state.libraryFilter.toLowerCase();
    return entries.filter(([key, edge]) =>
      key.toLowerCase().includes(filter) ||
      edge.description?.toLowerCase().includes(filter) ||
      edge.tags?.some(tag => tag.toLowerCase().includes(filter))
    );
  }, [state.library, state.libraryFilter]);

  if (state.loading) {
    return (
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        fontFamily: theme.fonts.body,
        overflow: 'hidden',
      }}>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>

        {/* Header skeleton */}
        <div style={{
          padding: `${theme.space[3]}px ${theme.space[3]}px`,
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            width: '80px',
            height: '20px',
            borderRadius: theme.radii[1],
            background: `linear-gradient(90deg, ${theme.colors.backgroundSecondary} 25%, ${theme.colors.border} 50%, ${theme.colors.backgroundSecondary} 75%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }} />
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: theme.radii[1],
            background: `linear-gradient(90deg, ${theme.colors.backgroundSecondary} 25%, ${theme.colors.border} 50%, ${theme.colors.backgroundSecondary} 75%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }} />
        </div>

        {/* Tabs skeleton */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundSecondary,
        }}>
          <div style={{
            flex: 1,
            padding: `${theme.space[2]}px ${theme.space[3]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.space[2],
          }}>
            <div style={{
              width: '60px',
              height: '16px',
              borderRadius: theme.radii[1],
              background: `linear-gradient(90deg, ${theme.colors.background} 25%, ${theme.colors.border} 50%, ${theme.colors.background} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
          </div>
          <div style={{
            flex: 1,
            padding: `${theme.space[2]}px ${theme.space[3]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.space[2],
          }}>
            <div style={{
              width: '60px',
              height: '16px',
              borderRadius: theme.radii[1],
              background: `linear-gradient(90deg, ${theme.colors.background} 25%, ${theme.colors.border} 50%, ${theme.colors.background} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
          </div>
        </div>

        {/* Content skeleton */}
        <div style={{ padding: `${theme.space[3]}px ${theme.space[3]}px` }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[2],
                padding: `${theme.space[2]}px ${theme.space[3]}px`,
                marginBottom: theme.space[2],
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: theme.radii[2],
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: theme.radii[1],
                background: `linear-gradient(90deg, ${theme.colors.background} 25%, ${theme.colors.border} 50%, ${theme.colors.background} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
              <div style={{
                flex: 1,
                height: '16px',
                borderRadius: theme.radii[1],
                background: `linear-gradient(90deg, ${theme.colors.background} 25%, ${theme.colors.border} 50%, ${theme.colors.background} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
            </div>
          ))}
        </div>
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
        backgroundColor: theme.colors.background,
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.body,
        textAlign: 'center',
      }}>
        <span style={{ color: theme.colors.error || '#ef4444', marginBottom: theme.space[2] }}>
          {state.error}
        </span>
        <button
          onClick={() => loadData()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.space[1],
            padding: `${theme.space[1]} ${theme.space[2]}`,
            backgroundColor: theme.colors.backgroundSecondary,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii[1],
            cursor: 'pointer',
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes[1],
          }}
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  const hasContent = state.configs.length > 0 || state.library;

  if (!hasContent) {
    const npmPackageUrl = 'https://www.npmjs.com/package/@principal-ai/visual-validation-cli';

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: theme.space[4],
        backgroundColor: theme.colors.background,
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.body,
        textAlign: 'center',
      }}>
        <Network size={56} style={{ marginBottom: theme.space[3], opacity: 0.3 }} />
        <span style={{ fontSize: theme.fontSizes[3], fontWeight: theme.fontWeights.medium, marginBottom: theme.space[2], color: theme.colors.text }}>
          No configurations found
        </span>
        <span style={{ fontSize: theme.fontSizes[2], marginBottom: theme.space[3], maxWidth: '80%', lineHeight: 1.5 }}>
          Initialize Visual Validation to create architecture diagrams that connect to your codebase.
        </span>

        {/* Copy command section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.space[2],
          width: '90%',
          maxWidth: '400px',
        }}>
          <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
            Run this command to get started:
          </span>
          <button
            onClick={handleCopyCommand}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.space[2],
              padding: `${theme.space[2]}px ${theme.space[3]}px`,
              backgroundColor: theme.colors.backgroundSecondary,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[2],
              cursor: 'pointer',
              fontFamily: theme.fonts.monospace,
              fontSize: theme.fontSizes[1],
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <code style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {initCommand}
            </code>
            {copied ? (
              <Check size={16} style={{ color: theme.colors.success || '#22c55e', flexShrink: 0 }} />
            ) : (
              <Copy size={16} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
            )}
          </button>
          <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
            This creates a .vgc/ folder with a starter canvas file.
          </span>

          {/* Learn more link */}
          <a
            href={npmPackageUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.space[1],
              marginTop: theme.space[2],
              fontSize: theme.fontSizes[1],
              color: theme.colors.primary,
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
          >
            Learn more on npm
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  }

  // Tab button style helper
  const getTabStyle = (tabId: TabId, isActive: boolean) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    padding: `${theme.space[2]}px ${theme.space[3]}px`,
    backgroundColor: isActive ? theme.colors.background : 'transparent',
    color: isActive ? theme.colors.text : theme.colors.textMuted,
    border: 'none',
    borderBottom: isActive ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
    cursor: 'pointer',
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes[1],
    fontWeight: isActive ? theme.fontWeights.medium : theme.fontWeights.body,
    transition: 'all 0.15s',
  });

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: theme.fonts.body,
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        padding: `${theme.space[3]}px ${theme.space[3]}px`,
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: theme.fontSizes[3],
          fontWeight: theme.fontWeights.medium,
          color: theme.colors.text,
        }}>
          Browser
        </h2>
        <div style={{ display: 'flex', gap: theme.space[1] }}>
          <button
            onClick={() => setShowSetupInfo(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              backgroundColor: 'transparent',
              color: theme.colors.textMuted,
              border: 'none',
              borderRadius: theme.radii[1],
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            title="Setup instructions"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={() => loadData()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              backgroundColor: 'transparent',
              color: theme.colors.textMuted,
              border: 'none',
              borderRadius: theme.radii[1],
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.backgroundSecondary,
        flexShrink: 0,
      }}>
        <button
          onClick={() => handleTabChange('canvas')}
          style={getTabStyle('canvas', state.activeTab === 'canvas')}
        >
          <FileJson size={16} />
          <span>Canvas</span>
          {state.configs.length > 0 && (
            <span style={{
              fontSize: theme.fontSizes[0],
              color: state.activeTab === 'canvas' ? theme.colors.primary : theme.colors.textMuted,
              backgroundColor: state.activeTab === 'canvas' ? `${theme.colors.primary}20` : theme.colors.background,
              padding: `0 ${theme.space[1]}`,
              borderRadius: theme.radii[1],
            }}>
              {state.configs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabChange('library')}
          style={getTabStyle('library', state.activeTab === 'library')}
          disabled={!state.library}
        >
          <Library size={16} />
          <span>Library</span>
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
      }}>
        {/* Canvas Tab Content */}
        {state.activeTab === 'canvas' && (
          <div style={{ padding: `${theme.space[3]}px ${theme.space[3]}px` }}>
            {state.configs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: theme.space[4],
                color: theme.colors.textMuted,
              }}>
                No canvas files found
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.space[2] }}>
                {state.configs.map(config => (
                  <button
                    key={config.id}
                    onClick={() => handleConfigSelect(config)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.space[2],
                      width: '100%',
                      padding: `${theme.space[2]}px ${theme.space[3]}px`,
                      backgroundColor: state.selectedConfigId === config.id
                        ? `${theme.colors.primary}15`
                        : theme.colors.backgroundSecondary,
                      color: theme.colors.text,
                      border: state.selectedConfigId === config.id
                        ? `1px solid ${theme.colors.primary}40`
                        : `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii[2],
                      cursor: 'pointer',
                      fontFamily: theme.fonts.body,
                      fontSize: theme.fontSizes[1],
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <FileJson size={16} style={{ color: theme.colors.primary, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{config.displayName}</span>
                    <ArrowRight size={14} style={{ color: theme.colors.textMuted, opacity: 0.5 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Library Tab Content */}
        {state.activeTab === 'library' && state.library && (
          <div style={{ padding: `${theme.space[3]}px ${theme.space[3]}px` }}>
            {/* Filter Bar */}
            <div style={{
              position: 'relative',
              marginBottom: theme.space[3],
            }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: theme.space[2],
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.colors.textMuted,
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Filter components..."
                value={state.libraryFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: `${theme.space[2]}px ${theme.space[3]}px`,
                  paddingLeft: `${theme.space[4]}px`,
                  backgroundColor: theme.colors.backgroundSecondary,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radii[2],
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes[1],
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Node Components */}
            {nodeComponents.length > 0 && (
              <div style={{ marginBottom: theme.space[3] }}>
                <div style={{
                  marginBottom: theme.space[2],
                }}>
                  <span style={{
                    fontSize: theme.fontSizes[1],
                    fontWeight: theme.fontWeights.medium,
                    color: theme.colors.text,
                  }}>
                    Node Components
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.space[2],
                }}>
                  {nodeComponents.map(([key, node]: [string, LibraryNodeComponent]) => {
                    const ShapeIcon = getShapeIcon(node.shape);
                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.space[2],
                          padding: `${theme.space[2]}px ${theme.space[3]}px`,
                          backgroundColor: theme.colors.backgroundSecondary,
                          borderRadius: theme.radii[2],
                          border: `1px solid ${theme.colors.border}`,
                        }}
                      >
                        <ShapeIcon
                          size={16}
                          style={{ color: node.color || theme.colors.textMuted, flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: theme.fontSizes[1],
                            color: theme.colors.text,
                          }}>
                            {key}
                          </div>
                          {node.description && (
                            <div style={{
                              fontSize: theme.fontSizes[0],
                              color: theme.colors.textMuted,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {node.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Edge Components */}
            {edgeComponents.length > 0 && (
              <div>
                <div style={{
                  marginBottom: theme.space[2],
                }}>
                  <span style={{
                    fontSize: theme.fontSizes[1],
                    fontWeight: theme.fontWeights.medium,
                    color: theme.colors.text,
                  }}>
                    Edge Components
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.space[2],
                }}>
                  {edgeComponents.map(([key, edge]: [string, LibraryEdgeComponent]) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.space[2],
                        padding: `${theme.space[2]}px ${theme.space[3]}px`,
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderRadius: theme.radii[2],
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '2px',
                        backgroundColor: edge.color || theme.colors.textMuted,
                        flexShrink: 0,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.space[1],
                          fontSize: theme.fontSizes[1],
                          color: theme.colors.text,
                        }}>
                          {key}
                          {edge.directed && (
                            <ArrowRight size={12} style={{ color: theme.colors.textMuted }} />
                          )}
                        </div>
                        {edge.description && (
                          <div style={{
                            fontSize: theme.fontSizes[0],
                            color: theme.colors.textMuted,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {edge.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Library tab but no library */}
        {state.activeTab === 'library' && !state.library && (
          <div style={{
            textAlign: 'center',
            padding: theme.space[4],
            color: theme.colors.textMuted,
          }}>
            <Library size={32} style={{ marginBottom: theme.space[2], opacity: 0.5 }} />
            <div>No component library found</div>
            <div style={{ fontSize: theme.fontSizes[0], marginTop: theme.space[1] }}>
              Add library.yaml to the .vgc/ folder
            </div>
          </div>
        )}
      </div>

      {/* Setup Info Overlay */}
      {showSetupInfo && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.background,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}>
          {/* Overlay Header */}
          <div style={{
            padding: `${theme.space[3]}px ${theme.space[3]}px`,
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <h2 style={{
              margin: 0,
              fontSize: theme.fontSizes[3],
              fontWeight: theme.fontWeights.medium,
              color: theme.colors.text,
            }}>
              Setup
            </h2>
            <button
              onClick={() => setShowSetupInfo(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                backgroundColor: 'transparent',
                color: theme.colors.textMuted,
                border: 'none',
                borderRadius: theme.radii[1],
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Overlay Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.space[4],
            color: theme.colors.textMuted,
            textAlign: 'center',
            overflow: 'auto',
          }}>
            <Network size={56} style={{ marginBottom: theme.space[3], opacity: 0.3 }} />
            <span style={{ fontSize: theme.fontSizes[3], fontWeight: theme.fontWeights.medium, marginBottom: theme.space[2], color: theme.colors.text }}>
              Visual Validation Setup
            </span>
            <span style={{ fontSize: theme.fontSizes[2], marginBottom: theme.space[3], maxWidth: '80%', lineHeight: 1.5 }}>
              Initialize Visual Validation to create architecture diagrams that connect to your codebase.
            </span>

            {/* Copy command section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.space[2],
              width: '90%',
              maxWidth: '400px',
            }}>
              <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
                Run this command to get started:
              </span>
              <button
                onClick={handleCopyCommand}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: theme.space[2],
                  padding: `${theme.space[2]}px ${theme.space[3]}px`,
                  backgroundColor: theme.colors.backgroundSecondary,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radii[2],
                  cursor: 'pointer',
                  fontFamily: theme.fonts.monospace,
                  fontSize: theme.fontSizes[1],
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <code style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {initCommand}
                </code>
                {copied ? (
                  <Check size={16} style={{ color: theme.colors.success || '#22c55e', flexShrink: 0 }} />
                ) : (
                  <Copy size={16} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
                )}
              </button>
              <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
                This creates a .vgc/ folder with a starter canvas file.
              </span>

              {/* Learn more link */}
              <a
                href="https://www.npmjs.com/package/@principal-ai/visual-validation-cli"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: theme.space[1],
                  marginTop: theme.space[2],
                  fontSize: theme.fontSizes[1],
                  color: theme.colors.primary,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
              >
                Learn more on npm
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ConfigLibraryBrowserPanel.displayName = 'ConfigLibraryBrowserPanel';
