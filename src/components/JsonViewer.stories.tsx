import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import { JsonViewer } from './JsonViewer';

const meta: Meta<typeof JsonViewer> = {
  title: 'Components/JsonViewer',
  component: JsonViewer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '600px', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof JsonViewer>;

// Sample trace data for demonstration
const sampleTraceData = {
  traceId: 'abc123def456',
  name: 'HTTP GET /api/users',
  spanCount: 5,
  resources: [
    {
      resource: {
        attributes: [
          { key: 'service.name', value: { stringValue: 'user-service' } },
          { key: 'service.version', value: { stringValue: '1.2.3' } },
          { key: 'deployment.environment', value: { stringValue: 'production' } },
        ],
      },
      scopes: [
        {
          scope: {
            name: '@opentelemetry/instrumentation-http',
            version: '0.51.0',
          },
          spanIds: ['span-1', 'span-2'],
        },
      ],
    },
  ],
  spans: [
    {
      spanId: 'span-1',
      traceId: 'abc123def456',
      name: 'HTTP GET /api/users',
      parentSpanId: '',
      startTimeUnixNano: '1706745600000000000',
      endTimeUnixNano: '1706745600150000000',
      status: { code: 1 },
      attributes: [
        { key: 'http.method', value: { stringValue: 'GET' } },
        { key: 'http.url', value: { stringValue: 'https://api.example.com/users' } },
        { key: 'http.status_code', value: { intValue: 200 } },
      ],
      events: [
        {
          name: 'request.start',
          timeUnixNano: '1706745600000000000',
          attributes: [],
        },
      ],
    },
    {
      spanId: 'span-2',
      traceId: 'abc123def456',
      name: 'database.query',
      parentSpanId: 'span-1',
      startTimeUnixNano: '1706745600050000000',
      endTimeUnixNano: '1706745600100000000',
      status: { code: 1 },
      attributes: [
        { key: 'db.system', value: { stringValue: 'postgresql' } },
        { key: 'db.statement', value: { stringValue: 'SELECT * FROM users WHERE active = true' } },
        { key: 'db.operation', value: { stringValue: 'SELECT' } },
      ],
    },
  ],
};

// Wrapper component to access theme
const ThemedJsonViewer = (props: Omit<React.ComponentProps<typeof JsonViewer>, 'theme'>) => {
  const { theme } = useTheme();
  return <JsonViewer {...props} theme={theme} />;
};

export const Default: Story = {
  render: () => <ThemedJsonViewer data={sampleTraceData} />,
};

export const ExpandedDeep: Story = {
  render: () => <ThemedJsonViewer data={sampleTraceData} initialExpandDepth={5} />,
};

export const CollapsedByDefault: Story = {
  render: () => <ThemedJsonViewer data={sampleTraceData} initialExpandDepth={1} />,
};

export const SimpleObject: Story = {
  render: () => (
    <ThemedJsonViewer
      data={{
        name: 'John Doe',
        age: 30,
        active: true,
        email: null,
        roles: ['admin', 'user'],
        metadata: {
          created: '2024-01-01',
          updated: '2024-02-01',
        },
      }}
    />
  ),
};

export const LargeArray: Story = {
  render: () => (
    <ThemedJsonViewer
      data={{
        items: Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `Item ${i + 1}`,
          value: Math.random() * 100,
          active: i % 2 === 0,
        })),
      }}
      initialExpandDepth={2}
    />
  ),
};

export const ComplexNestedData: Story = {
  render: () => (
    <ThemedJsonViewer
      data={{
        resourceSpans: [
          {
            resource: {
              attributes: [
                { key: 'service.name', value: { stringValue: 'frontend' } },
                { key: 'service.namespace', value: { stringValue: 'production' } },
              ],
            },
            scopeSpans: [
              {
                scope: { name: 'tracer', version: '1.0.0' },
                spans: [
                  {
                    traceId: 'abc',
                    spanId: '123',
                    name: 'render',
                    kind: 1,
                    startTimeUnixNano: '1000000000',
                    endTimeUnixNano: '2000000000',
                    attributes: [
                      { key: 'component', value: { stringValue: 'App' } },
                    ],
                    events: [],
                    links: [],
                    status: { code: 1 },
                  },
                ],
              },
            ],
          },
        ],
      }}
      initialExpandDepth={4}
    />
  ),
};
