import React, { useState, useMemo, useRef, useCallback } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { AlertCircle, Search, X, RefreshCw, HelpCircle, Copy, Check } from 'lucide-react';
import { useCanvasWorkflowData } from './canvas-list/hooks/useCanvasWorkflowData';
import { EmptyStateContent } from './principal-view/EmptyStateContent';
import { StoryboardWorkflowsTreeCore, type StoryboardWorkflowNodeData } from '@principal-ade/dynamic-file-tree';
import type { FileTree, FileInfo } from '@principal-ai/repository-abstraction';

/**
 * StoryboardListPanel - A panel for displaying storyboards from the discovery system
 *
 * This panel shows:
 * - Hierarchical storyboard structures with canvases and workflows
 * - Search functionality to filter storyboards
 * - Storyboard metadata (name, source, path, workflows)
 * - Click to select and emit events for detail views
 *
 * Uses the new storyboard discovery system from @principal-ai/principal-view-core@0.15.1+
 * Storyboards are provided directly by the discovery system, no transformation needed.
 */
export const StoryboardListPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  usePanelFocusListener('storyboard-list', events, () => panelRef.current?.focus());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cliCommandCopied, setCliCommandCopied] = useState(false);

  // Load storyboard data from discovery system
  // Storyboards come directly from the discovery system (no transformation needed)
  const { storyboards, isLoading, error } = useCanvasWorkflowData({ context, actions });

  // Get fileTree to access FileInfo metadata
  const fileTreeSlice = context.getSlice('fileTree');
  const fileTreeData = fileTreeSlice?.data as FileTree | null;
  const fileTreeSha = fileTreeData?.sha;

  // Helper to find FileInfo for a canvas path
  const getCanvasFileInfo = useCallback((canvasPath: string): FileInfo | undefined => {
    return fileTreeData?.allFiles.find(f =>
      f.path === canvasPath || f.relativePath === canvasPath
    );
  }, [fileTreeData]);

  // Filter storyboards by search query
  const filteredStoryboards = useMemo(() => {
    let filtered = storyboards;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((storyboard) => {
        // Search in name
        if (storyboard.name.toLowerCase().includes(query)) return true;
        // Search in path
        if (storyboard.path.toLowerCase().includes(query)) return true;
        // Search in basename
        if (storyboard.basename.toLowerCase().includes(query)) return true;
        // Search in package name
        if (storyboard.packageName && storyboard.packageName.toLowerCase().includes(query)) return true;
        // Search in canvas name
        if (storyboard.canvas.name.toLowerCase().includes(query)) return true;
        // Search in workflows
        if (storyboard.workflows.some(wf => wf.name.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    return filtered;
  }, [storyboards, searchQuery]);

  const handleTreeNodeClick = useCallback((node: StoryboardWorkflowNodeData) => {
    if (node.type === 'canvas' && node.canvas) {
      // Storyboard (canvas) click - open canvas editor
      setSelectedNodeId(`canvas:${node.canvas.id}`);
      if (events) {
        const canvasFileInfo = getCanvasFileInfo(node.canvas.path);
        events.emit({
          type: 'custom',
          source: 'storyboard-list-panel',
          timestamp: Date.now(),
          payload: {
            action: 'openCanvas',
            canvasId: node.canvas.id,
            canvas: node.canvas,
            canvasFileInfo,
            openMode: 'editor', // Indicates canvas editor should be opened
          },
        });
      }
    } else if (node.type === 'workflow' && node.workflow && node.storyboard) {
      // Workflow click - select workflow and open canvas detail with workflow
      setSelectedNodeId(`workflow:${node.workflow.id}`);
      if (events) {
        const canvasFileInfo = getCanvasFileInfo(node.storyboard.canvas.path);
        const workflowFileInfo = getCanvasFileInfo(node.workflow.path);
        events.emit({
          type: 'custom',
          source: 'storyboard-list-panel',
          timestamp: Date.now(),
          payload: {
            action: 'openCanvas',
            canvasId: node.storyboard.canvas.id,
            canvas: node.storyboard.canvas,
            canvasFileInfo,
            workflowId: node.workflow.id,
            workflow: node.workflow,
            workflowFileInfo,
            openMode: 'detail', // Indicates canvas detail should be opened
          },
        });
      }
    }
  }, [events, getCanvasFileInfo]);

  const handleRefresh = () => {
    setIsRefreshing(true);

    // Emit refresh event so parent can handle filesystem rescans, etc.
    // The parent will update the file tree SHA, which will trigger automatic reload via useEffect
    if (events) {
      events.emit({
        type: 'canvas:refresh',
        source: 'storyboard-list-panel',
        timestamp: Date.now(),
        payload: {},
      });
    }

    // Stop the spinner after a short delay to give visual feedback
    // The actual reload happens when parent updates the file tree SHA
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  const handleCopyCliCommand = useCallback(() => {
    const cliCommand = storyboards.length > 0
      ? 'npx @principal-ai/principal-view-cli --help'
      : 'npx @principal-ai/principal-view-cli init';
    navigator.clipboard.writeText(cliCommand).then(() => {
      setCliCommandCopied(true);
      setTimeout(() => setCliCommandCopied(false), 2000);
    });
  }, [storyboards.length]);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      style={{
        position: 'relative',
        paddingTop: 'clamp(8px, 2vw, 12px)',
        paddingBottom: 'clamp(12px, 3vw, 20px)',
        fontFamily: theme.fonts.body,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        overflow: 'hidden',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        outline: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingLeft: 'clamp(16px, 4vw, 24px)',
          paddingRight: 'clamp(8px, 2vw, 16px)',
          flexWrap: 'wrap',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: theme.fontSizes[4],
            color: theme.colors.text,
          }}
        >
          Storyboards
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: storyboards.length >= 10 ? '1 1 200px' : '0 0 auto', maxWidth: storyboards.length >= 10 ? '400px' : 'none' }}>
          {/* Search input - only show if there are 10 or more storyboards */}
          {storyboards.length >= 10 && (
            <div
              style={{
                position: 'relative',
                flex: 1,
                minWidth: '150px',
              }}
            >
              <Search
                size={16}
                color={theme.colors.textSecondary}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search storyboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 32px 8px 32px',
                  fontSize: theme.fontSizes[1],
                  fontFamily: theme.fonts.body,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radii[2],
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.text,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.textSecondary,
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            style={{
              background: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[1],
              padding: '8px',
              cursor: isRefreshing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Refresh storyboards"
          >
            <RefreshCw
              size={16}
              color={theme.colors.textSecondary}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>

          {/* Help button */}
          <button
            onClick={toggleHelp}
            style={{
              background: showHelp ? theme.colors.primary : theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[1],
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Help & Getting Started"
          >
            <HelpCircle
              size={16}
              color={showHelp ? 'white' : theme.colors.textSecondary}
            />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            flexShrink: 0,
            padding: '12px',
            marginLeft: 'clamp(12px, 3vw, 20px)',
            marginRight: 'clamp(12px, 3vw, 20px)',
            background: `${theme.colors.error}20`,
            border: `1px solid ${theme.colors.error}`,
            borderRadius: theme.radii[2],
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: theme.colors.error,
            fontSize: theme.fontSizes[1],
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {isLoading ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes[2],
            }}
          >
            Loading storyboards...
          </div>
        ) : filteredStoryboards.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textSecondary,
              padding: '24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: theme.fontSizes[2] }}>
                {searchQuery ? 'No storyboards match your search' : 'No storyboards found'}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: theme.fontSizes[1] }}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add .otel.canvas files to .principal-views/ to get started'}
              </p>
            </div>
          </div>
        ) : (
          <StoryboardWorkflowsTreeCore
            storyboards={filteredStoryboards}
            theme={theme}
            onClick={handleTreeNodeClick}
            selectedNodeId={selectedNodeId ?? undefined}
            defaultOpen={false}
            horizontalNodePadding="clamp(16px, 4vw, 24px)"
            verticalPadding="10px"
          />
        )}
      </div>

      {/* Help Overlay */}
      {showHelp && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
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
            {storyboards.length === 0 ? (
              <EmptyStateContent theme={theme} />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                padding: theme.space[4],
                gap: theme.space[3],
                overflowY: 'auto',
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: theme.fontSizes[3],
                  fontWeight: theme.fontWeights.medium,
                  color: theme.colors.text,
                }}>
                  Storyboards Panel
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: theme.fontSizes[2],
                  color: theme.colors.textMuted,
                  lineHeight: 1.5,
                }}>
                  This panel displays all .otel.canvas files found in your project's .principal-views/ directory.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.space[2],
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: theme.fontSizes[2],
                    fontWeight: theme.fontWeights.medium,
                    color: theme.colors.text,
                  }}>
                    Features:
                  </h4>
                  <ul style={{
                    margin: 0,
                    paddingLeft: theme.space[4],
                    fontSize: theme.fontSizes[1],
                    color: theme.colors.textMuted,
                    lineHeight: 1.6,
                  }}>
                    <li>Browse and search through available storyboards</li>
                    <li>Filter by package if you have a monorepo structure</li>
                    <li>Click a storyboard to view the canvas in the editor</li>
                    <li>Click a workflow to view executions for that workflow</li>
                    <li>Use the refresh button to rescan for new files</li>
                  </ul>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.space[2],
                  marginTop: theme.space[2],
                  paddingTop: theme.space[3],
                  borderTop: `1px solid ${theme.colors.border}`,
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: theme.fontSizes[2],
                    fontWeight: theme.fontWeights.medium,
                    color: theme.colors.text,
                  }}>
                    CLI Tool:
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: theme.fontSizes[1],
                    color: theme.colors.textMuted,
                    lineHeight: 1.5,
                  }}>
                    View available commands for managing storyboards:
                  </p>
                  <button
                    onClick={handleCopyCliCommand}
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
                      npx @principal-ai/principal-view-cli --help
                    </code>
                    {cliCommandCopied ? (
                      <Check size={16} style={{ color: theme.colors.success || '#22c55e', flexShrink: 0 }} />
                    ) : (
                      <Copy size={16} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
