import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { DashboardRenderer } from '@principal-ai/principal-view-react';
import type {
  DashboardDefinition,
  MetricSource,
  TimeRange,
  RefreshInterval,
  DiscoveredCanvas,
  DataProvider,
  MetricData,
} from '@principal-ai/principal-view-core';
import { Loader2 } from 'lucide-react';

/**
 * A data provider that returns empty/zero values for all metrics.
 * Used when no real data provider is configured, allowing the dashboard
 * to render its layout with placeholder values instead of blocking.
 */
class EmptyDataProvider implements DataProvider {
  getAll(): Record<string, MetricData> {
    return {};
  }

  get(_metricId: string): MetricData {
    // Return a minimal empty metric data structure
    return {
      current: 0,
      series: [],
    };
  }
}

export interface DashboardPanelProps extends PanelComponentProps {
  /**
   * The discovered dashboard to display.
   * Must be a DiscoveredCanvas with type 'dashboard'.
   * The panel will load the dashboard definition from the file path.
   */
  selectedDashboard?: DiscoveredCanvas | null;

  /**
   * Data provider for fetching metric values.
   * If not provided, metrics will display with zero/empty values.
   * For testing with sample data, pass MockDataProvider from @principal-ai/principal-view-react.
   */
  dataProvider?: DataProvider;

  /**
   * Callback when a metric source link is clicked.
   * Use this to navigate to the referenced workflow/canvas.
   */
  onSourceClick?: (source: MetricSource) => void;

  /**
   * Callback when a metric panel is clicked.
   */
  onMetricClick?: (metricId: string) => void;
}

/**
 * DashboardPanel - Panel for displaying observability dashboards
 *
 * This panel renders a dashboard from a .dashboard.json file, showing:
 * - Metric cards with current values and trends
 * - Charts (line, bar, histogram)
 * - Time range selector
 * - Links to external tools (Grafana, Datadog, runbooks)
 *
 * Usage:
 * - Pass `selectedDashboard` (DiscoveredCanvas) to load from file
 * - Or pass `dashboardDefinition` directly if already loaded
 */
export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  context: _context,
  actions,
  events,
  selectedDashboard,
  dataProvider,
  onSourceClick,
  onMetricClick,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  // State for loaded dashboard
  const [dashboard, setDashboard] = useState<DashboardDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time range state
  const [timeRange, setTimeRange] = useState<TimeRange>({ preset: 'last_1h' });
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>('off');

  usePanelFocusListener('dashboard', events, () => panelRef.current?.focus());

  // Load dashboard from file when selectedDashboard changes
  useEffect(() => {
    if (!selectedDashboard) {
      setDashboard(null);
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const readFile = (actions as { readFile?: (path: string) => Promise<string> }).readFile;
        if (!readFile) {
          throw new Error('readFile action not available');
        }

        const content = await readFile(selectedDashboard.path);
        const parsed = JSON.parse(content) as DashboardDefinition;
        setDashboard(parsed);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [selectedDashboard, actions]);

  // Handle source clicks - emit event or call callback
  const handleSourceClick = useCallback(
    (source: MetricSource) => {
      if (onSourceClick) {
        onSourceClick(source);
      } else if (events?.emit) {
        // Emit navigation event for the host to handle
        events.emit({
          type: 'dashboard:source-click',
          source: 'dashboard-panel',
          timestamp: Date.now(),
          payload: {
            source,
            storyboard: source.storyboard,
            workflow: source.workflow,
            nodes: source.nodes,
          },
        });
      }
    },
    [onSourceClick, events]
  );

  // Handle metric clicks
  const handleMetricClick = useCallback(
    (metricId: string) => {
      if (onMetricClick) {
        onMetricClick(metricId);
      } else if (events?.emit) {
        events.emit({
          type: 'dashboard:metric-click',
          source: 'dashboard-panel',
          timestamp: Date.now(),
          payload: { metricId },
        });
      }
    },
    [onMetricClick, events]
  );

  // Use provided dataProvider or fall back to EmptyDataProvider
  // NOTE: This must be before early returns to satisfy React's rules of hooks
  const effectiveDataProvider = useMemo(
    () => dataProvider ?? new EmptyDataProvider(),
    [dataProvider]
  );

  // Render loading state
  if (loading) {
    return (
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
          color: theme.colors.textSecondary,
          outline: 'none',
        }}
      >
        <Loader2
          size={24}
          style={{
            animation: 'spin 1s linear infinite',
            marginRight: theme.space[2],
          }}
        />
        Loading dashboard...
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
          color: theme.colors.error,
          padding: theme.space[4],
          outline: 'none',
        }}
      >
        <div style={{ fontSize: theme.fontSizes[3], marginBottom: theme.space[2] }}>
          Failed to load dashboard
        </div>
        <div style={{ fontSize: theme.fontSizes[1], color: theme.colors.textSecondary }}>
          {error}
        </div>
      </div>
    );
  }

  // Render empty state
  if (!dashboard) {
    return (
      <div
        ref={panelRef}
        tabIndex={-1}
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
          color: theme.colors.textSecondary,
          fontSize: theme.fontSizes[3],
          outline: 'none',
        }}
      >
        Select a dashboard to view
      </div>
    );
  }

  // Render dashboard
  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
        outline: 'none',
      }}
    >
      <DashboardRenderer
        dashboard={dashboard}
        dataProvider={effectiveDataProvider}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
        onMetricClick={handleMetricClick}
        onSourceClick={handleSourceClick}
      />
    </div>
  );
};
