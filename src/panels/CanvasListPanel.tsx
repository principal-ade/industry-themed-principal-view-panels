import React, { useState, useMemo, useRef, useCallback } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { AlertCircle, Search, X, RefreshCw, Activity, HelpCircle, Copy, Check } from 'lucide-react';
import { useCanvasNarrativeData } from './canvas-list/hooks/useCanvasNarrativeData';
import { CanvasCard } from './canvas-list/components/CanvasCard';
import type { DiscoveredCanvas } from '@principal-ai/principal-view-core';
import { EmptyStateContent } from './principal-view/EmptyStateContent';
import { CanvasNarrativeTreeCore, type CanvasNarrativeNodeData } from '@principal-ade/dynamic-file-tree';
import type { FileTree, FileInfo } from '@principal-ai/repository-abstraction';

/**
 * CanvasListPanel - A panel for displaying .otel.canvas files
 *
 * This panel shows:
 * - List/grid of available canvas files from the file tree
 * - Search functionality to filter canvases
 * - Canvas metadata (name, source, path)
 * - Click to select and emit events for detail views
 */
export const CanvasListPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  usePanelFocusListener('canvas-list', events, () => panelRef.current?.focus());
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('all');
  const [showHelp, setShowHelp] = useState(false);
  const [cliCommandCopied, setCliCommandCopied] = useState(false);

  // Load canvas and narrative data
  const { canvases, narratives, isLoading, error, refreshData } = useCanvasNarrativeData({ context, actions });

  // Get fileTree to access FileInfo metadata
  const fileTreeSlice = context.getSlice('fileTree');
  const fileTreeData = fileTreeSlice?.data as FileTree | null;

  // Helper to find FileInfo for a canvas path
  const getCanvasFileInfo = useCallback((canvasPath: string): FileInfo | undefined => {
    return fileTreeData?.allFiles.find(f =>
      f.path === canvasPath || f.relativePath === canvasPath
    );
  }, [fileTreeData]);

  // Get unique packages for filter
  const availablePackages = useMemo(() => {
    const packages = new Set<string>();
    canvases.forEach((canvas) => {
      if (canvas.packageName) {
        packages.add(canvas.packageName);
      }
    });
    return Array.from(packages).sort();
  }, [canvases]);

  // Check if we have root-level canvases
  const hasRootCanvases = useMemo(() => {
    return canvases.some(c => c.scope === 'root');
  }, [canvases]);

  // Only show filter if there are multiple groups (packages + root)
  const shouldShowPackageFilter = useMemo(() => {
    const totalGroups = availablePackages.length + (hasRootCanvases ? 1 : 0);
    return totalGroups > 1;
  }, [availablePackages.length, hasRootCanvases]);

  // Filter canvases by package and search query
  const filteredCanvases = useMemo(() => {
    let filtered = canvases;

    // Filter by package
    if (selectedPackage !== 'all') {
      if (selectedPackage === 'root') {
        filtered = filtered.filter((canvas) => canvas.scope === 'root');
      } else {
        filtered = filtered.filter((canvas) => canvas.packageName === selectedPackage);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((canvas) => {
        // Search in name
        if (canvas.name.toLowerCase().includes(query)) return true;
        // Search in path
        if (canvas.path.toLowerCase().includes(query)) return true;
        // Search in basename
        if (canvas.basename.toLowerCase().includes(query)) return true;
        // Search in package name
        if (canvas.packageName && canvas.packageName.toLowerCase().includes(query)) return true;
        return false;
      });
    }

    return filtered;
  }, [canvases, selectedPackage, searchQuery]);

  const handleCanvasClick = (canvas: DiscoveredCanvas) => {
    setSelectedCanvasId(canvas.id);
    // Emit canvas:selected event for other panels with FileInfo
    if (events) {
      const canvasFileInfo = getCanvasFileInfo(canvas.path);
      events.emit({
        type: 'custom',
        source: 'canvas-list-panel',
        timestamp: Date.now(),
        payload: {
          action: 'selectCanvas',
          canvasId: canvas.id,
          canvas,
          canvasFileInfo, // Include FileInfo with lastModified, size, etc.
        },
      });
    }
  };

  const handleTreeNodeClick = useCallback((node: CanvasNarrativeNodeData) => {
    if (node.type === 'canvas' && node.canvas) {
      // Canvas click - include FileInfo
      setSelectedCanvasId(node.canvas.id);
      if (events) {
        const canvasFileInfo = getCanvasFileInfo(node.canvas.path);
        events.emit({
          type: 'custom',
          source: 'canvas-list-panel',
          timestamp: Date.now(),
          payload: {
            action: 'selectCanvas',
            canvasId: node.canvas.id,
            canvas: node.canvas,
            canvasFileInfo,
          },
        });
      }
    } else if (node.type === 'narrative' && node.narrative && node.canvas) {
      // Narrative click - include FileInfo for both canvas and narrative files
      setSelectedCanvasId(node.canvas.id);
      if (events) {
        const canvasFileInfo = getCanvasFileInfo(node.canvas.path);
        const narrativeFileInfo = getCanvasFileInfo(node.narrative.path);
        events.emit({
          type: 'custom',
          source: 'canvas-list-panel',
          timestamp: Date.now(),
          payload: {
            action: 'selectCanvas',
            canvasId: node.canvas.id,
            canvas: node.canvas,
            canvasFileInfo,
            narrativeId: node.narrative.id,
            narrative: node.narrative,
            narrativeTemplate: node.narrativeTemplate,
            narrativeFileInfo,
          },
        });
      }
    }
  }, [events, getCanvasFileInfo]);

  const handleOpenCanvas = useCallback((canvas: DiscoveredCanvas) => {
    // Open canvas for editing
    if (actions?.openFile) {
      actions.openFile(canvas.path);
    }
    // Also emit event for other panels to respond
    if (events) {
      const canvasFileInfo = getCanvasFileInfo(canvas.path);
      events.emit({
        type: 'custom',
        source: 'canvas-list-panel',
        timestamp: Date.now(),
        payload: {
          action: 'openCanvas',
          canvasId: canvas.id,
          canvas,
          canvasFileInfo,
        },
      });
    }
  }, [actions, events, getCanvasFileInfo]);

  const handleRefresh = () => {
    setIsRefreshing(true);

    // Emit refresh event so parent can handle filesystem rescans, etc.
    // The parent will update the file tree SHA, which will trigger automatic reload via useEffect
    if (events) {
      events.emit({
        type: 'canvas:refresh' as any,
        source: 'canvas-list-panel',
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
    const cliCommand = canvases.length > 0
      ? 'npx @principal-ai/principal-view-cli --help'
      : 'npx @principal-ai/principal-view-cli init';
    navigator.clipboard.writeText(cliCommand).then(() => {
      setCliCommandCopied(true);
      setTimeout(() => setCliCommandCopied(false), 2000);
    });
  }, [canvases.length]);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      style={{
        position: 'relative',
        paddingTop: 'clamp(12px, 3vw, 20px)',
        paddingBottom: 'clamp(12px, 3vw, 20px)',
        fontFamily: theme.fonts.body,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
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
          paddingLeft: 'clamp(12px, 3vw, 20px)',
          paddingRight: 'clamp(12px, 3vw, 20px)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: theme.fontSizes[4],
              color: theme.colors.text,
            }}
          >
            Canvas Files
          </h2>

          {!isLoading && shouldShowPackageFilter && (
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              style={{
                fontSize: theme.fontSizes[1],
                color: theme.colors.text,
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[1],
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: theme.fonts.body,
                outline: 'none',
              }}
            >
              <option value="all">All Packages ({canvases.length})</option>
              {hasRootCanvases && (
                <option value="root">Root ({canvases.filter(c => c.scope === 'root').length})</option>
              )}
              {availablePackages.map((pkg) => (
                <option key={pkg} value={pkg}>
                  {pkg} ({canvases.filter(c => c.packageName === pkg).length})
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', maxWidth: '400px' }}>
          {/* Search input */}
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
              placeholder="Search canvases..."
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
            title="Refresh canvases"
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
            Loading canvases...
          </div>
        ) : filteredCanvases.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              color: theme.colors.textSecondary,
              padding: '24px',
            }}
          >
            <Activity size={48} color={theme.colors.border} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: theme.fontSizes[2] }}>
                {searchQuery ? 'No canvases match your search' : 'No canvas files found'}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: theme.fontSizes[1] }}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add .otel.canvas files to .principal-views/ to get started'}
              </p>
            </div>
          </div>
        ) : (
          <CanvasNarrativeTreeCore
            canvases={filteredCanvases}
            narratives={narratives}
            theme={theme}
            onClick={handleTreeNodeClick}
            onOpenCanvas={handleOpenCanvas}
            selectedNodeId={selectedCanvasId ? `canvas:${selectedCanvasId}` : undefined}
            defaultOpen={false}
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
            {canvases.length === 0 ? (
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
                  Canvas List Panel
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
                    <li>Browse and search through available canvas files</li>
                    <li>Filter by package if you have a monorepo structure</li>
                    <li>Click a canvas to view it in the editor panel</li>
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
                    View available commands for managing canvas files:
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
