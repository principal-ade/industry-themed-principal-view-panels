import React, { useState, useMemo, useRef } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { AlertCircle, Search, X, RefreshCw, Activity } from 'lucide-react';
import { useCanvasData } from './canvas-list/hooks/useCanvasData';
import { CanvasCard } from './canvas-list/components/CanvasCard';
import type { DiscoveredCanvas } from '@principal-ai/principal-view-core/browser';

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
  events,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('all');

  // Load canvas data
  const { canvases, isLoading, error, refreshCanvases } = useCanvasData({ context });

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
    // Emit canvas:selected event for other panels
    if (events) {
      events.emit({
        type: 'custom' as any,
        source: 'canvas-list-panel',
        timestamp: Date.now(),
        payload: { action: 'selectCanvas', canvasId: canvas.id, canvas },
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Emit refresh event so parent can handle filesystem rescans, etc.
    if (events) {
      events.emit({
        type: 'custom' as any,
        source: 'canvas-list-panel',
        timestamp: Date.now(),
        payload: { action: 'refreshCanvases' },
      });
    }

    try {
      await refreshCanvases();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      style={{
        padding: 'clamp(12px, 3vw, 20px)',
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
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            flexShrink: 0,
            padding: '12px',
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '16px',
              padding: '4px',
            }}
          >
            {filteredCanvases.map((canvas) => (
              <CanvasCard
                key={canvas.id}
                canvas={canvas}
                onClick={handleCanvasClick}
                isSelected={selectedCanvasId === canvas.id}
              />
            ))}
          </div>
        )}
      </div>

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
