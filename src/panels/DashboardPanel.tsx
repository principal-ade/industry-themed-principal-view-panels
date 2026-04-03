import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import {
  DashboardRenderer,
  SequenceDiagramRenderer,
  type SequenceEvent,
  type SequenceEdge,
} from '@principal-ai/principal-view-react';
import type {
  DashboardDefinition,
  MetricSource,
  TimeRange,
  RefreshInterval,
  DiscoveredCanvas,
  DiscoveredStoryboard,
  DiscoveredWorkflow,
  WorkflowTemplate,
  WorkflowScenario,
  DataProvider,
  MetricData,
} from '@principal-ai/principal-view-core';
import { Loader2, X, ExternalLink } from 'lucide-react';
import { useCanvasWorkflowData } from './canvas-list/hooks/useCanvasWorkflowData';

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

/**
 * State for the selected sequence diagram to display in the modal
 */
interface SelectedSequence {
  storyboard: DiscoveredStoryboard;
  workflowMeta: { id: string; name: string; path: string };
  workflow: WorkflowTemplate;
  scenario: WorkflowScenario;
  source: MetricSource;
}

/**
 * Convert workflow scenario events to sequence diagram format.
 * Event keys become SequenceEvents and sequential edges connect them.
 */
function convertWorkflowToSequence(scenario: WorkflowScenario): {
  events: SequenceEvent[];
  edges: SequenceEdge[];
} {
  const templateEvents = scenario.template.events ?? {};
  const eventNames = Object.keys(templateEvents);

  // Convert event names to SequenceEvents
  const events: SequenceEvent[] = eventNames.map((name, index) => ({
    id: `event-${index}`,
    name,
    label: name.split('.').pop() ?? name,
  }));

  // Create sequential edges connecting events in order
  const edges: SequenceEdge[] = [];
  for (let i = 0; i < events.length - 1; i++) {
    edges.push({
      id: `edge-${i}`,
      fromEvent: events[i].id,
      toEvent: events[i + 1].id,
    });
  }

  return { events, edges };
}

/**
 * Modal component for displaying the sequence diagram
 */
interface SequenceDiagramModalProps {
  sequence: SelectedSequence;
  onClose: () => void;
  onOpenCanvas: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}

function SequenceDiagramModal({
  sequence,
  onClose,
  onOpenCanvas,
  theme,
}: SequenceDiagramModalProps) {
  const { events, edges } = useMemo(
    () => convertWorkflowToSequence(sequence.scenario),
    [sequence.scenario]
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: theme.colors.background,
          borderRadius: theme.radii[2],
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          width: '90%',
          maxWidth: 1200,
          height: '80%',
          maxHeight: 800,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${theme.space[3]} ${theme.space[4]}`,
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: theme.fontSizes[4],
                fontWeight: 600,
                color: theme.colors.text,
              }}
            >
              {sequence.workflow.name}
            </h2>
            <p
              style={{
                margin: `${theme.space[1]} 0 0`,
                fontSize: theme.fontSizes[1],
                color: theme.colors.textSecondary,
              }}
            >
              {sequence.scenario.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: theme.space[2] }}>
            <button
              onClick={onOpenCanvas}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.space[1],
                padding: `${theme.space[2]} ${theme.space[3]}`,
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
                border: 'none',
                borderRadius: theme.radii[1],
                fontSize: theme.fontSizes[1],
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <ExternalLink size={14} />
              Open in Canvas
            </button>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                backgroundColor: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[1],
                cursor: 'pointer',
                color: theme.colors.textSecondary,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sequence Diagram */}
        <div style={{ flex: 1, minHeight: 0 }}>
          {events.length > 0 ? (
            <SequenceDiagramRenderer
              events={events}
              edges={edges}
              height="100%"
              layoutOptions={{
                laneWidth: 220,
                laneGap: 60,
                eventSpacing: 100,
                namespaceStrategy: 'all-but-last',
              }}
              showControls
            />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.textSecondary,
              }}
            >
              No events defined for this scenario
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Workflow with its loaded template, used for navigation from source links.
 */
export interface LoadedWorkflow {
  file: DiscoveredWorkflow;
  template: WorkflowTemplate;
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
   * Discovered storyboards for navigating from source links to workflows.
   * When provided, clicking a source link will emit an 'openCanvas' event
   * with the matching storyboard and workflow.
   */
  storyboards?: DiscoveredStoryboard[];

  /**
   * Loaded workflows with their templates, for navigating from source links.
   * Used to include the full workflow template in the 'openCanvas' event.
   */
  workflows?: LoadedWorkflow[];

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
  context,
  actions,
  events,
  selectedDashboard,
  dataProvider,
  storyboards: storyboardsProp,
  workflows: workflowsProp,
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

  // State for sequence diagram modal
  const [selectedSequence, setSelectedSequence] = useState<SelectedSequence | null>(null);

  usePanelFocusListener('dashboard', events, () => panelRef.current?.focus());

  // Load storyboards and workflows from discovery system if not provided via props
  // Cast context to the shape expected by the hook - fileTree is available in typed contexts
  type FileTreeContext = { fileTree: import('@principal-ade/panel-framework-core').DataSlice<import('@principal-ai/repository-abstraction').FileTree | null> };
  const typedContext = context as unknown as FileTreeContext | undefined;
  const fileTreeSlice = typedContext?.fileTree;

  const { storyboards: discoveredStoryboards, workflows: discoveredWorkflows } = useCanvasWorkflowData({
    context: fileTreeSlice ? { fileTree: fileTreeSlice } : {
      fileTree: {
        data: null,
        loading: false,
        error: null,
        scope: 'repository' as const,
        name: 'fileTree',
        refresh: async () => {},
      },
    },
    actions,
  });

  // Use props if provided, otherwise use discovered data
  const storyboards = storyboardsProp ?? discoveredStoryboards;
  const workflows = workflowsProp ?? discoveredWorkflows;

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

  // Handle source clicks - show sequence diagram modal or call callback
  const handleSourceClick = useCallback(
    (source: MetricSource) => {
      if (onSourceClick) {
        onSourceClick(source);
        return;
      }

      // Try to find the matching storyboard and workflow
      const matchingStoryboard = storyboards?.find(
        (sb) => sb.basename === source.storyboard || sb.name === source.storyboard
      );

      if (matchingStoryboard) {
        // Find the matching workflow within the storyboard
        const matchingWorkflowMeta = matchingStoryboard.workflows.find(
          (wf) => wf.name === source.workflow || wf.id.endsWith(`/${source.workflow}`)
        );

        if (matchingWorkflowMeta) {
          // Look up the full workflow template
          const fullWorkflow = workflows?.find(
            (wf) => wf.file.path === matchingWorkflowMeta.path
          );

          if (fullWorkflow?.template) {
            // Find matching scenario - use source.event or source.nodes to match, or default to first
            const scenario = fullWorkflow.template.scenarios.find(
              (s) => s.id === source.event || s.template.events?.[source.event ?? '']
            ) ?? fullWorkflow.template.scenarios[0];

            if (scenario) {
              // Show sequence diagram modal instead of emitting event
              setSelectedSequence({
                storyboard: matchingStoryboard,
                workflowMeta: matchingWorkflowMeta,
                workflow: fullWorkflow.template,
                scenario,
                source,
              });
              return;
            }
          }

          // Workflow found but no scenario - emit openCanvas event
          if (events?.emit) {
            events.emit({
              type: 'custom',
              source: 'dashboard-panel',
              timestamp: Date.now(),
              payload: {
                action: 'openCanvas',
                canvasId: matchingStoryboard.canvas.id,
                canvas: matchingStoryboard.canvas,
                workflowId: matchingWorkflowMeta.id,
                workflow: fullWorkflow?.template,
                openMode: 'detail',
                sourceNodes: source.nodes,
                sourceEvent: source.event,
              },
            });
          }
          return;
        }

        // Workflow not found, but storyboard exists - open canvas without workflow
        if (events?.emit) {
          events.emit({
            type: 'custom',
            source: 'dashboard-panel',
            timestamp: Date.now(),
            payload: {
              action: 'openCanvas',
              canvasId: matchingStoryboard.canvas.id,
              canvas: matchingStoryboard.canvas,
              openMode: 'editor',
            },
          });
        }
        return;
      }

      // Fallback: emit the original event for host to handle
      if (events?.emit) {
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
    [onSourceClick, events, storyboards, workflows]
  );

  // Handle opening canvas from sequence diagram modal
  const handleOpenCanvas = useCallback(() => {
    if (!selectedSequence || !events?.emit) return;

    const { storyboard, workflowMeta, workflow, source } = selectedSequence;

    events.emit({
      type: 'custom',
      source: 'dashboard-panel',
      timestamp: Date.now(),
      payload: {
        action: 'openCanvas',
        canvasId: storyboard.canvas.id,
        canvas: storyboard.canvas,
        workflowId: workflowMeta.id,
        workflow,
        openMode: 'detail',
        sourceNodes: source.nodes,
        sourceEvent: source.event,
      },
    });

    setSelectedSequence(null);
  }, [selectedSequence, events]);

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

      {/* Sequence Diagram Modal */}
      {selectedSequence && (
        <SequenceDiagramModal
          sequence={selectedSequence}
          onClose={() => setSelectedSequence(null)}
          onOpenCanvas={handleOpenCanvas}
          theme={theme}
        />
      )}
    </div>
  );
};
