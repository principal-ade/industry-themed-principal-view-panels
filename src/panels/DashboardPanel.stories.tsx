import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { DashboardPanel } from './DashboardPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { DashboardDefinition, DiscoveredCanvas } from '@principal-ai/principal-view-core';

// Sample dashboard definition for stories
const sampleDashboard: DashboardDefinition = {
  $schema: 'https://principal.ai/schemas/dashboard.v1.json',
  id: 'activity-feed-analytics',
  name: 'Activity Feed Analytics',
  description: 'User engagement metrics for the activity feed home page',
  owner: 'web-ade-team',

  externalLinks: {
    grafana: 'https://grafana.internal/d/activity-feed',
    runbook: 'https://wiki.internal/runbooks/activity-feed',
  },

  metrics: [
    {
      id: 'mobile-view-percentage',
      name: 'Mobile View %',
      description: 'Percentage of activity feed loads on mobile devices',
      type: 'gauge',
      unit: '%',
      sources: [
        {
          storyboard: 'activity-feed',
          workflow: 'feed-load',
          nodes: ['init-started'],
          event: 'activity-feed.init.started',
        },
      ],
      query: {
        derivation: 'percentage',
        filter: 'isMobile = true',
        window: '1h',
      },
      display: {
        component: 'MetricCard',
        size: 'medium',
        showTrend: true,
        showSparkline: true,
      },
      _mockData: {
        current: 34.2,
        previous: 31.8,
        trend: 'up',
        series: [
          { date: '2024-03-27T00:00', value: 31.2 },
          { date: '2024-03-27T01:00', value: 32.1 },
          { date: '2024-03-27T02:00', value: 33.0 },
          { date: '2024-03-27T03:00', value: 32.5 },
          { date: '2024-03-27T04:00', value: 33.8 },
          { date: '2024-03-27T05:00', value: 34.2 },
        ],
      },
    },
    {
      id: 'total-page-views',
      name: 'Total Page Views',
      description: 'Total home page views in the last hour',
      type: 'counter',
      unit: 'views',
      sources: [
        {
          storyboard: 'activity-feed',
          workflow: 'feed-load',
          event: 'activity-feed.init.started',
        },
      ],
      query: {
        derivation: 'count',
        window: '1h',
      },
      display: {
        component: 'MetricCard',
        size: 'medium',
        showSparkline: true,
      },
      _mockData: {
        current: 28493,
        previous: 26102,
        trend: 'up',
        series: [
          { date: '2024-03-27T00:00', value: 25102 },
          { date: '2024-03-27T01:00', value: 26234 },
          { date: '2024-03-27T02:00', value: 25890 },
          { date: '2024-03-27T03:00', value: 27102 },
          { date: '2024-03-27T04:00', value: 28100 },
          { date: '2024-03-27T05:00', value: 28493 },
        ],
      },
    },
    {
      id: 'error-rate',
      name: 'Error Rate',
      description: 'Percentage of feed loads that resulted in errors',
      type: 'gauge',
      unit: '%',
      sources: [
        {
          storyboard: 'activity-feed',
          workflow: 'feed-load',
          nodes: ['init-error'],
        },
      ],
      query: {
        derivation: 'error_rate',
        window: '1h',
      },
      thresholds: {
        warning: 2.0,
        critical: 5.0,
      },
      display: {
        component: 'MetricCard',
        size: 'medium',
        showTrend: true,
        showSparkline: true,
      },
      _mockData: {
        current: 0.8,
        previous: 1.2,
        trend: 'down',
        series: [
          { date: '2024-03-27T00:00', value: 1.4 },
          { date: '2024-03-27T01:00', value: 1.2 },
          { date: '2024-03-27T02:00', value: 1.1 },
          { date: '2024-03-27T03:00', value: 0.9 },
          { date: '2024-03-27T04:00', value: 0.85 },
          { date: '2024-03-27T05:00', value: 0.8 },
        ],
      },
    },
    {
      id: 'daily-home-page-views',
      name: 'Daily Page Views',
      description: 'Home page views per day for the last 7 days',
      type: 'counter',
      unit: 'views',
      sources: [
        {
          storyboard: 'activity-feed',
          workflow: 'feed-load',
          event: 'activity-feed.init.started',
        },
      ],
      query: {
        derivation: 'count',
        timeGroup: 'day',
      },
      display: {
        component: 'LineChart',
        size: 'large',
      },
      _mockData: {
        series: [
          { date: '2024-03-21', value: 28493 },
          { date: '2024-03-22', value: 31247 },
          { date: '2024-03-23', value: 29102 },
          { date: '2024-03-24', value: 27856 },
          { date: '2024-03-25', value: 30421 },
          { date: '2024-03-26', value: 32109 },
          { date: '2024-03-27', value: 29876 },
        ],
      },
    },
    {
      id: 'views-by-viewport',
      name: 'Views by Viewport',
      description: 'Daily page views split by mobile vs desktop',
      type: 'counter',
      unit: 'views',
      sources: [
        {
          storyboard: 'activity-feed',
          workflow: 'feed-load',
          event: 'activity-feed.init.started',
        },
      ],
      query: {
        derivation: 'count',
        groupBy: ['isMobile'],
        timeGroup: 'day',
      },
      display: {
        component: 'StackedBarChart',
        size: 'large',
      },
      _mockData: {
        series: [
          { date: '2024-03-21', mobile: 9847, desktop: 18646 },
          { date: '2024-03-22', mobile: 11023, desktop: 20224 },
          { date: '2024-03-23', mobile: 10156, desktop: 18946 },
          { date: '2024-03-24', mobile: 9234, desktop: 18622 },
          { date: '2024-03-25', mobile: 10567, desktop: 19854 },
          { date: '2024-03-26', mobile: 11234, desktop: 20875 },
          { date: '2024-03-27', mobile: 10423, desktop: 19453 },
        ],
      },
    },
    {
      id: 'mobile-interaction-rate',
      name: 'Mobile Interactions/Session',
      description: 'Average number of interactions per mobile session',
      type: 'gauge',
      unit: 'interactions',
      sources: [
        {
          storyboard: 'activity-feed',
          workflow: 'mobile-interaction',
          nodes: ['card-swipe', 'commit-browse'],
        },
      ],
      query: {
        derivation: 'avg',
        window: '1h',
      },
      display: {
        component: 'MetricCard',
        size: 'medium',
      },
      _mockData: {
        current: 4.7,
        previous: 4.2,
        trend: 'up',
      },
    },
    {
      id: 'desktop-search-usage',
      name: 'Search Usage Rate',
      description: 'Percentage of desktop sessions that use search',
      type: 'gauge',
      unit: '%',
      sources: [
        {
          storyboard: 'activity-feed',
          workflow: 'desktop-interaction',
          nodes: ['search-and-select'],
        },
      ],
      query: {
        derivation: 'percentage',
        window: '1h',
      },
      display: {
        component: 'MetricCard',
        size: 'medium',
      },
      _mockData: {
        current: 23.4,
        previous: 21.8,
        trend: 'up',
      },
    },
  ],

  layout: {
    columns: 12,
    gap: 16,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
    },
    rows: [
      {
        title: 'Overview',
        panels: [
          { id: 'mobile-view-percentage', span: 4, spanMobile: 12 },
          { id: 'total-page-views', span: 4, spanMobile: 12 },
          { id: 'error-rate', span: 4, spanMobile: 12 },
        ],
      },
      {
        title: 'Traffic Trends',
        panels: [
          { id: 'daily-home-page-views', span: 6, spanMobile: 12, minHeight: 280 },
          { id: 'views-by-viewport', span: 6, spanMobile: 12, minHeight: 280 },
        ],
      },
      {
        title: 'Engagement',
        panels: [
          { id: 'mobile-interaction-rate', span: 6, spanMobile: 12 },
          { id: 'desktop-search-usage', span: 6, spanMobile: 12 },
        ],
      },
    ],
  },
};

// Minimal dashboard for testing
const minimalDashboard: DashboardDefinition = {
  id: 'minimal-dashboard',
  name: 'Minimal Dashboard',
  description: 'A simple dashboard with just one metric',
  metrics: [
    {
      id: 'requests',
      name: 'Requests',
      type: 'counter',
      unit: 'req/s',
      sources: [{ storyboard: 'api', workflow: 'request' }],
      query: { derivation: 'rate', window: '5m' },
      display: { component: 'MetricCard', size: 'large' },
      _mockData: { current: 1234, previous: 1100, trend: 'up' },
    },
  ],
  layout: {
    columns: 12,
    rows: [{ panels: [{ id: 'requests', span: 12 }] }],
  },
};

// Mock discovered canvas for file-loading stories
const mockDiscoveredDashboard: DiscoveredCanvas = {
  id: 'checkout-health',
  name: 'Checkout Health',
  path: '.principal-views/dashboards/checkout-health.dashboard.json',
  basename: 'checkout-health',
  type: 'dashboard',
  scope: 'root',
};

const meta = {
  title: 'Panels/DashboardPanel',
  component: DashboardPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Panel for displaying observability dashboards from \`.dashboard.json\` files.

## Features
- Renders metric cards, charts, and time series data
- Time range selector with refresh intervals
- External links to Grafana, Datadog, runbooks
- Responsive grid layout

## Usage
\`\`\`tsx
// With pre-loaded dashboard definition
<DashboardPanel dashboardDefinition={dashboard} />

// With discovered canvas (loads from file)
<DashboardPanel selectedDashboard={discoveredCanvas} />
\`\`\`

## Events Emitted
- \`dashboard:source-click\` - When a metric source link is clicked
- \`dashboard:metric-click\` - When a metric panel is clicked
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof DashboardPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state - no dashboard selected
 */
export const Empty: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <DashboardPanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Full dashboard with multiple metrics, charts, and rows
 */
export const ActivityFeedAnalytics: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <DashboardPanel {...props} dashboardDefinition={sampleDashboard} />}
    </MockPanelProvider>
  ),
};

/**
 * Minimal dashboard with a single metric
 */
export const MinimalDashboard: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <DashboardPanel {...props} dashboardDefinition={minimalDashboard} />}
    </MockPanelProvider>
  ),
};

/**
 * Loading from file via selectedDashboard prop.
 * This simulates selecting a dashboard from the StoryboardListPanel.
 */
export const LoadFromFile: Story = {
  render: () => (
    <MockPanelProvider
      actions={{
        readFile: async (path: string) => {
          console.log('[Mock] readFile:', path);
          // Simulate loading delay
          await new Promise((resolve) => setTimeout(resolve, 500));
          return JSON.stringify(sampleDashboard);
        },
      }}
    >
      {(props) => <DashboardPanel {...props} selectedDashboard={mockDiscoveredDashboard} />}
    </MockPanelProvider>
  ),
};

/**
 * Error state when file loading fails
 */
export const LoadError: Story = {
  render: () => (
    <MockPanelProvider
      actions={{
        readFile: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          throw new Error('File not found: .principal-views/dashboards/missing.dashboard.json');
        },
      }}
    >
      {(props) => (
        <DashboardPanel
          {...props}
          selectedDashboard={{
            ...mockDiscoveredDashboard,
            id: 'missing',
            name: 'Missing Dashboard',
            path: '.principal-views/dashboards/missing.dashboard.json',
          }}
        />
      )}
    </MockPanelProvider>
  ),
};

/**
 * With event callbacks to see source/metric clicks
 */
export const WithEventHandlers: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => (
        <DashboardPanel
          {...props}
          dashboardDefinition={sampleDashboard}
          onSourceClick={(source) => {
            console.log('[Story] Source clicked:', source);
            alert(`Navigate to: ${source.storyboard}/${source.workflow}`);
          }}
          onMetricClick={(metricId) => {
            console.log('[Story] Metric clicked:', metricId);
            alert(`Metric clicked: ${metricId}`);
          }}
        />
      )}
    </MockPanelProvider>
  ),
};
