# OpenTelemetry Event Structure for UI Development

## Overview


This document specifies the structure of OpenTelemetry (OTEL) trace events that will be received by panels for real-time visualization. Use this specification to develop UI components before the actual data pipeline is implemented.

**Target Panels:**
- StoryboardListPanel
- CanvasEditorPanel
- ExecutionViewerPanel
- Any panel that needs to visualize live telemetry

---

## Table of Contents

1. [OTLP/JSON Format](#otlpjson-format)
2. [Panel Event Payloads](#panel-event-payloads)
3. [Type Definitions](#type-definitions)
4. [Example Real-World Data](#example-real-world-data)
5. [Mock Data Generators](#mock-data-generators)
6. [Integration Patterns](#integration-patterns)

---

## OTLP/JSON Format

OTEL data arrives in the **OTLP/JSON** format as defined by the OpenTelemetry Protocol specification. The top-level structure is `ResourceSpans`, which groups spans by resource (service/process).

### Hierarchy

```
ResourceSpans
└── ResourceSpan[]
    ├── Resource (service.name, deployment.environment, etc.)
    └── ScopeSpan[]
        ├── Scope (instrumentation library)
        └── Span[]
            ├── Trace/Span IDs
            ├── Name
            ├── Kind
            ├── Timestamps
            ├── Attributes[]
            ├── Events[]
            └── Status
```

### Complete Structure

```typescript
interface OtelResourceSpans {
  resourceSpans: OtelResourceSpan[];
}

interface OtelResourceSpan {
  resource: OtelResource;
  scopeSpans: OtelScopeSpan[];
}

interface OtelResource {
  attributes: OtelAttribute[];
}

interface OtelScopeSpan {
  scope: {
    name: string;           // e.g., "@opentelemetry/instrumentation-user-interaction"
    version?: string;       // e.g., "0.55.0"
  };
  spans: OtelSpan[];
}

interface OtelSpan {
  traceId: string;                // Base64-encoded trace ID
  spanId: string;                 // Base64-encoded span ID
  parentSpanId?: string;          // Base64-encoded parent span ID (empty for root)
  name: string;                   // Span name (e.g., "click", "validateUser", "GET /api/users")
  kind?: OtelSpanKind;            // Span kind (see below)
  startTimeUnixNano: string;      // Start time as nanoseconds since epoch (string for precision)
  endTimeUnixNano: string;        // End time as nanoseconds since epoch
  attributes?: OtelAttribute[];   // Span attributes (key-value pairs)
  events?: OtelSpanEvent[];       // Span events (exceptions, logs, etc.)
  status?: {
    code?: string;                // Status code (OK, ERROR, UNSET)
    message?: string;             // Error message if status is ERROR
  };
}

interface OtelAttribute {
  key: string;
  value: {
    stringValue?: string;
    intValue?: number;
    doubleValue?: number;
    boolValue?: boolean;
    arrayValue?: { values: OtelAttributeValue[] };
    kvlistValue?: { values: OtelAttribute[] };
  };
}

type OtelAttributeValue = OtelAttribute['value'];

interface OtelSpanEvent {
  timeUnixNano: string;           // Event timestamp (nanoseconds)
  name: string;                   // Event name (e.g., "exception", "log")
  attributes?: OtelAttribute[];   // Event attributes
}

type OtelSpanKind =
  | 'SPAN_KIND_UNSPECIFIED'
  | 'SPAN_KIND_INTERNAL'          // Internal operation
  | 'SPAN_KIND_SERVER'            // Server receiving request
  | 'SPAN_KIND_CLIENT'            // Client making request
  | 'SPAN_KIND_PRODUCER'          // Message producer
  | 'SPAN_KIND_CONSUMER';         // Message consumer
```

---

## Panel Event Payloads

Panels will receive OTEL data through the panel event system. Here are the expected event formats:

### Event Type 1: `telemetry:span`

Individual span arrives in real-time.

```typescript
interface TelemetrySpanEvent extends PanelEvent {
  type: 'telemetry:span';
  source: 'telemetry-provider';
  timestamp: number;              // Event emission time (milliseconds)
  payload: {
    span: OtelSpan;               // The span data
    resource: OtelResource;       // Associated resource
    scope: {                      // Instrumentation scope
      name: string;
      version?: string;
    };
  };
}
```

**Usage:**
```typescript
events.on('telemetry:span', (event: TelemetrySpanEvent) => {
  const { span, resource, scope } = event.payload;
  console.log(`Received span: ${span.name} from ${getServiceName(resource)}`);
});
```

### Event Type 2: `telemetry:batch`

Batch of spans arrives (more efficient for high-volume scenarios).

```typescript
interface TelemetryBatchEvent extends PanelEvent {
  type: 'telemetry:batch';
  source: 'telemetry-provider';
  timestamp: number;
  payload: {
    resourceSpans: OtelResourceSpans;  // Full OTLP structure
    spanCount: number;                 // Total spans in batch
  };
}
```

**Usage:**
```typescript
events.on('telemetry:batch', (event: TelemetryBatchEvent) => {
  const { resourceSpans, spanCount } = event.payload;
  console.log(`Received batch with ${spanCount} spans`);

  // Process all spans
  processResourceSpans(resourceSpans);
});
```

### Event Type 3: `telemetry:matched`

Pre-matched span (span already matched to canvas nodes by SpanMatcher).

```typescript
interface TelemetryMatchedEvent extends PanelEvent {
  type: 'telemetry:matched';
  source: 'telemetry-provider' | 'span-matcher';
  timestamp: number;
  payload: {
    span: OtelSpan;
    resource: OtelResource;
    matchedNodeIds: string[];     // Canvas node IDs that matched
    canvasId: string;             // Which canvas this match is for
    duration: number;             // Span duration in milliseconds
  };
}
```

**Usage:**
```typescript
events.on('telemetry:matched', (event: TelemetryMatchedEvent) => {
  const { matchedNodeIds, span, duration } = event.payload;

  // Highlight matched nodes
  matchedNodeIds.forEach(nodeId => {
    highlightNode(nodeId, { duration, intensity: 1.0 });
  });
});
```

---

## Type Definitions

Add these types to your project for type-safe OTEL handling:

### File: `src/types/otel.ts`

```typescript
/**
 * OpenTelemetry OTLP/JSON type definitions
 *
 * Based on: https://opentelemetry.io/docs/specs/otlp/
 */

export interface OtelResourceSpans {
  resourceSpans: OtelResourceSpan[];
}

export interface OtelResourceSpan {
  resource: OtelResource;
  scopeSpans: OtelScopeSpan[];
}

export interface OtelResource {
  attributes: OtelAttribute[];
}

export interface OtelScopeSpan {
  scope: {
    name: string;
    version?: string;
  };
  spans: OtelSpan[];
}

export interface OtelSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind?: OtelSpanKind;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes?: OtelAttribute[];
  events?: OtelSpanEvent[];
  status?: {
    code?: 'STATUS_CODE_UNSET' | 'STATUS_CODE_OK' | 'STATUS_CODE_ERROR';
    message?: string;
  };
}

export interface OtelAttribute {
  key: string;
  value: {
    stringValue?: string;
    intValue?: number;
    doubleValue?: number;
    boolValue?: boolean;
    arrayValue?: { values: OtelAttributeValue[] };
    kvlistValue?: { values: OtelAttribute[] };
  };
}

export type OtelAttributeValue = OtelAttribute['value'];

export interface OtelSpanEvent {
  timeUnixNano: string;
  name: string;
  attributes?: OtelAttribute[];
}

export type OtelSpanKind =
  | 'SPAN_KIND_UNSPECIFIED'
  | 'SPAN_KIND_INTERNAL'
  | 'SPAN_KIND_SERVER'
  | 'SPAN_KIND_CLIENT'
  | 'SPAN_KIND_PRODUCER'
  | 'SPAN_KIND_CONSUMER';

/**
 * Helper functions
 */

export function getAttributeStringValue(attr: OtelAttribute): string | undefined {
  return attr.value.stringValue;
}

export function getAttributeValue(
  attributes: OtelAttribute[] | undefined,
  key: string
): string | number | boolean | undefined {
  const attr = attributes?.find(a => a.key === key);
  if (!attr) return undefined;

  return (
    attr.value.stringValue ??
    attr.value.intValue ??
    attr.value.doubleValue ??
    attr.value.boolValue
  );
}

export function flattenResourceAttributes(resource: OtelResource): Record<string, string> {
  const result: Record<string, string> = {};

  for (const attr of resource.attributes) {
    const value = getAttributeStringValue(attr);
    if (value !== undefined) {
      result[attr.key] = value;
    }
  }

  return result;
}

export function parseNanoTime(nanos: string): number {
  return parseInt(nanos, 10) / 1_000_000;
}

export function getSpanDuration(span: OtelSpan): number {
  const start = parseInt(span.startTimeUnixNano, 10);
  const end = parseInt(span.endTimeUnixNano, 10);
  return (end - start) / 1_000_000; // milliseconds
}

export function getServiceName(resource: OtelResource): string | undefined {
  const attr = resource.attributes.find(a => a.key === 'service.name');
  return attr?.value.stringValue;
}
```

---

## Example Real-World Data

### Example 1: User Click Event

This is the actual data structure from the example you showed me:

```json
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          {
            "key": "service.name",
            "value": { "stringValue": "principal-ade" }
          },
          {
            "key": "service.version",
            "value": { "stringValue": "unknown" }
          },
          {
            "key": "process.type",
            "value": { "stringValue": "renderer" }
          },
          {
            "key": "window.type",
            "value": { "stringValue": "dev-workspace" }
          }
        ]
      },
      "scopeSpans": [
        {
          "scope": {
            "name": "@opentelemetry/instrumentation-user-interaction",
            "version": "0.55.0"
          },
          "spans": [
            {
              "traceId": "wWh9ZEa7J5YmYmYHXu5QKw==",
              "spanId": "Lq4Lz5cNX7U=",
              "parentSpanId": "",
              "name": "click",
              "kind": "SPAN_KIND_INTERNAL",
              "startTimeUnixNano": "1769959368207000000",
              "endTimeUnixNano": "1769959368207000000",
              "attributes": [
                {
                  "key": "event_type",
                  "value": { "stringValue": "click" }
                },
                {
                  "key": "target_element",
                  "value": { "stringValue": "CANVAS" }
                },
                {
                  "key": "target_xpath",
                  "value": { "stringValue": "//html/body/div/div/div[2]/div/div[2]/div/div/div/div[3]/div/div/div/div[2]/div/div/div/div/div[2]/canvas" }
                },
                {
                  "key": "http.url",
                  "value": { "stringValue": "file:///Applications/Principal%20ADE.app/..." }
                }
              ],
              "status": {}
            }
          ]
        }
      ]
    }
  ]
}
```

### Example 2: API Request Span

```json
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          { "key": "service.name", "value": { "stringValue": "checkout-service" } },
          { "key": "deployment.environment", "value": { "stringValue": "production" } }
        ]
      },
      "scopeSpans": [
        {
          "scope": {
            "name": "@opentelemetry/instrumentation-http",
            "version": "0.52.0"
          },
          "spans": [
            {
              "traceId": "5B8EFFF798038103D269B633813FC60C",
              "spanId": "EEE19B7EC3C1B174",
              "parentSpanId": "EEE19B7EC3C1B173",
              "name": "POST /api/checkout",
              "kind": "SPAN_KIND_SERVER",
              "startTimeUnixNano": "1735891200000000000",
              "endTimeUnixNano": "1735891200450000000",
              "attributes": [
                { "key": "http.method", "value": { "stringValue": "POST" } },
                { "key": "http.route", "value": { "stringValue": "/api/checkout" } },
                { "key": "http.status_code", "value": { "intValue": 200 } },
                { "key": "user.id", "value": { "stringValue": "user-12345" } }
              ],
              "status": { "code": "STATUS_CODE_OK" }
            }
          ]
        }
      ]
    }
  ]
}
```

### Example 3: Database Query Span

```json
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          { "key": "service.name", "value": { "stringValue": "checkout-service" } }
        ]
      },
      "scopeSpans": [
        {
          "scope": {
            "name": "@opentelemetry/instrumentation-pg",
            "version": "0.43.0"
          },
          "spans": [
            {
              "traceId": "5B8EFFF798038103D269B633813FC60C",
              "spanId": "AAA19B7EC3C1B999",
              "parentSpanId": "EEE19B7EC3C1B174",
              "name": "SELECT checkout_db.orders",
              "kind": "SPAN_KIND_CLIENT",
              "startTimeUnixNano": "1735891200100000000",
              "endTimeUnixNano": "1735891200350000000",
              "attributes": [
                { "key": "db.system", "value": { "stringValue": "postgresql" } },
                { "key": "db.name", "value": { "stringValue": "checkout" } },
                { "key": "db.statement", "value": { "stringValue": "SELECT * FROM orders WHERE user_id = $1" } },
                { "key": "db.operation", "value": { "stringValue": "SELECT" } }
              ],
              "status": { "code": "STATUS_CODE_OK" }
            }
          ]
        }
      ]
    }
  ]
}
```

### Example 4: Error Span with Exception Event

```json
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          { "key": "service.name", "value": { "stringValue": "auth-service" } }
        ]
      },
      "scopeSpans": [
        {
          "scope": {
            "name": "@opentelemetry/instrumentation-express",
            "version": "0.41.0"
          },
          "spans": [
            {
              "traceId": "ABC123DEF456",
              "spanId": "XYZ789",
              "parentSpanId": "",
              "name": "POST /auth/login",
              "kind": "SPAN_KIND_SERVER",
              "startTimeUnixNano": "1735891300000000000",
              "endTimeUnixNano": "1735891300050000000",
              "attributes": [
                { "key": "http.method", "value": { "stringValue": "POST" } },
                { "key": "http.route", "value": { "stringValue": "/auth/login" } },
                { "key": "http.status_code", "value": { "intValue": 401 } }
              ],
              "events": [
                {
                  "timeUnixNano": "1735891300025000000",
                  "name": "exception",
                  "attributes": [
                    { "key": "exception.type", "value": { "stringValue": "AuthenticationError" } },
                    { "key": "exception.message", "value": { "stringValue": "Invalid credentials" } },
                    { "key": "exception.stacktrace", "value": { "stringValue": "AuthenticationError: Invalid credentials\n    at validateUser (auth.ts:42)\n    at login (controller.ts:15)" } }
                  ]
                }
              ],
              "status": {
                "code": "STATUS_CODE_ERROR",
                "message": "Authentication failed"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Mock Data Generators

Use these functions in Storybook or during development to generate realistic OTEL data.

### File: `src/mocks/otelMocks.ts`

```typescript
import type {
  OtelResourceSpans,
  OtelResourceSpan,
  OtelResource,
  OtelSpan,
  OtelAttribute,
  OtelSpanKind,
} from '../types/otel';

/**
 * Create an OTEL attribute
 */
export function createAttribute(
  key: string,
  value: string | number | boolean
): OtelAttribute {
  if (typeof value === 'string') {
    return { key, value: { stringValue: value } };
  } else if (typeof value === 'number') {
    return { key, value: { intValue: value } };
  } else {
    return { key, value: { boolValue: value } };
  }
}

/**
 * Create a mock resource
 */
export function createMockResource(
  serviceName: string,
  additionalAttrs: Record<string, string> = {}
): OtelResource {
  const attributes: OtelAttribute[] = [
    createAttribute('service.name', serviceName),
  ];

  for (const [key, value] of Object.entries(additionalAttrs)) {
    attributes.push(createAttribute(key, value));
  }

  return { attributes };
}

/**
 * Generate a random trace ID (Base64)
 */
export function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Generate a random span ID (Base64)
 */
export function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Get current time in nanoseconds (as string)
 */
export function getCurrentNanoTime(): string {
  return (Date.now() * 1_000_000).toString();
}

/**
 * Create a mock span
 */
export function createMockSpan(params: {
  name: string;
  kind?: OtelSpanKind;
  attributes?: Record<string, string | number | boolean>;
  durationMs?: number;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  hasError?: boolean;
}): OtelSpan {
  const {
    name,
    kind = 'SPAN_KIND_INTERNAL',
    attributes = {},
    durationMs = 100,
    traceId = generateTraceId(),
    spanId = generateSpanId(),
    parentSpanId,
    hasError = false,
  } = params;

  const startTime = getCurrentNanoTime();
  const endTime = (parseInt(startTime, 10) + durationMs * 1_000_000).toString();

  const spanAttributes: OtelAttribute[] = Object.entries(attributes).map(
    ([key, value]) => createAttribute(key, value)
  );

  const span: OtelSpan = {
    traceId,
    spanId,
    parentSpanId,
    name,
    kind,
    startTimeUnixNano: startTime,
    endTimeUnixNano: endTime,
    attributes: spanAttributes,
    status: hasError
      ? { code: 'STATUS_CODE_ERROR', message: 'Operation failed' }
      : { code: 'STATUS_CODE_OK' },
  };

  if (hasError) {
    span.events = [
      {
        timeUnixNano: (parseInt(startTime, 10) + 50 * 1_000_000).toString(),
        name: 'exception',
        attributes: [
          createAttribute('exception.type', 'Error'),
          createAttribute('exception.message', 'Something went wrong'),
        ],
      },
    ];
  }

  return span;
}

/**
 * Create a mock ResourceSpans structure
 */
export function createMockResourceSpans(
  serviceName: string,
  spans: OtelSpan[]
): OtelResourceSpans {
  return {
    resourceSpans: [
      {
        resource: createMockResource(serviceName),
        scopeSpans: [
          {
            scope: {
              name: '@opentelemetry/instrumentation-http',
              version: '0.52.0',
            },
            spans,
          },
        ],
      },
    ],
  };
}

/**
 * Create a mock user interaction span (click)
 */
export function createMockClickSpan(targetElement: string = 'BUTTON'): OtelSpan {
  return createMockSpan({
    name: 'click',
    kind: 'SPAN_KIND_INTERNAL',
    attributes: {
      event_type: 'click',
      target_element: targetElement,
      target_xpath: `//html/body/div/button[contains(text(), '${targetElement}')]`,
    },
    durationMs: 1,
  });
}

/**
 * Create a mock API request span
 */
export function createMockAPISpan(params: {
  method: string;
  route: string;
  statusCode?: number;
  durationMs?: number;
}): OtelSpan {
  const { method, route, statusCode = 200, durationMs = 150 } = params;

  return createMockSpan({
    name: `${method} ${route}`,
    kind: 'SPAN_KIND_SERVER',
    attributes: {
      'http.method': method,
      'http.route': route,
      'http.status_code': statusCode,
    },
    durationMs,
    hasError: statusCode >= 400,
  });
}

/**
 * Create a mock database query span
 */
export function createMockDBSpan(params: {
  operation: string;
  table: string;
  durationMs?: number;
}): OtelSpan {
  const { operation, table, durationMs = 50 } = params;

  return createMockSpan({
    name: `${operation} ${table}`,
    kind: 'SPAN_KIND_CLIENT',
    attributes: {
      'db.system': 'postgresql',
      'db.name': 'app_db',
      'db.operation': operation,
      'db.sql.table': table,
    },
    durationMs,
  });
}

/**
 * Generate a realistic trace (API -> DB)
 */
export function generateCheckoutTrace(): OtelResourceSpans {
  const traceId = generateTraceId();

  const apiSpan = createMockAPISpan({
    method: 'POST',
    route: '/api/checkout',
    statusCode: 200,
    durationMs: 450,
  });
  apiSpan.traceId = traceId;

  const dbSpan = createMockDBSpan({
    operation: 'INSERT',
    table: 'orders',
    durationMs: 250,
  });
  dbSpan.traceId = traceId;
  dbSpan.parentSpanId = apiSpan.spanId;

  return createMockResourceSpans('checkout-service', [apiSpan, dbSpan]);
}
```

### Storybook Usage

```typescript
// StoryboardListPanel.stories.tsx
import { createMockResourceSpans, createMockAPISpan } from '../mocks/otelMocks';

export const WithLiveTelemetry: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    // Simulate incoming telemetry every 2 seconds
    setInterval(() => {
      const span = createMockAPISpan({
        method: 'GET',
        route: '/api/users',
        statusCode: 200,
      });

      const resourceSpans = createMockResourceSpans('auth-service', [span]);

      // Emit telemetry event
      window.dispatchEvent(
        new CustomEvent('panel:event', {
          detail: {
            type: 'telemetry:batch',
            source: 'telemetry-provider',
            timestamp: Date.now(),
            payload: { resourceSpans, spanCount: 1 },
          },
        })
      );
    }, 2000);
  },
};
```

---

## Integration Patterns

### Pattern 1: Event Listener Hook

Create a reusable hook for subscribing to telemetry events:

```typescript
// src/hooks/useTelemetryEvents.ts
import { useEffect, useState } from 'react';
import type { PanelEventEmitter, PanelEvent } from '@principal-ade/panel-framework-core';
import type { OtelSpan, OtelResource } from '../types/otel';

export interface TelemetrySpanData {
  span: OtelSpan;
  resource: OtelResource;
  timestamp: number;
}

export function useTelemetryEvents(events: PanelEventEmitter | undefined) {
  const [latestSpan, setLatestSpan] = useState<TelemetrySpanData | null>(null);
  const [spanHistory, setSpanHistory] = useState<TelemetrySpanData[]>([]);

  useEffect(() => {
    if (!events) return;

    const unsubscribe = events.on('telemetry:span', (event: PanelEvent) => {
      const { span, resource } = event.payload;
      const spanData: TelemetrySpanData = {
        span,
        resource,
        timestamp: event.timestamp,
      };

      setLatestSpan(spanData);
      setSpanHistory(prev => [...prev.slice(-99), spanData]); // Keep last 100
    });

    return unsubscribe;
  }, [events]);

  return { latestSpan, spanHistory };
}
```

### Pattern 2: Span Filtering

Filter spans by service or attributes:

```typescript
// src/utils/spanFilters.ts
import type { OtelSpan, OtelResource } from '../types/otel';
import { getServiceName, getAttributeValue } from '../types/otel';

export function filterSpansByService(
  spans: Array<{ span: OtelSpan; resource: OtelResource }>,
  serviceName: string
): Array<{ span: OtelSpan; resource: OtelResource }> {
  return spans.filter(({ resource }) =>
    getServiceName(resource) === serviceName
  );
}

export function filterSpansByName(
  spans: OtelSpan[],
  pattern: string | RegExp
): OtelSpan[] {
  if (typeof pattern === 'string') {
    return spans.filter(span => span.name === pattern);
  }
  return spans.filter(span => pattern.test(span.name));
}

export function filterSpansByAttribute(
  spans: OtelSpan[],
  attributeKey: string,
  attributeValue: string | number | boolean
): OtelSpan[] {
  return spans.filter(span => {
    const value = getAttributeValue(span.attributes, attributeKey);
    return value === attributeValue;
  });
}
```

### Pattern 3: Real-Time Highlights

Highlight canvas nodes when matching spans arrive:

```typescript
// In your panel component
import { useTelemetryEvents } from '../hooks/useTelemetryEvents';
import { getServiceName } from '../types/otel';

export const StoryboardListPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { latestSpan } = useTelemetryEvents(events);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!latestSpan) return;

    const { span, resource } = latestSpan;
    const serviceName = getServiceName(resource);

    // Find storyboard nodes matching this service
    const matchingNodes = storyboards
      .flatMap(sb => sb.canvas.nodes)
      .filter(node => {
        const nodeService = node.pv?.otel?.resourceMatch?.['service.name'];
        return nodeService === serviceName;
      })
      .map(node => node.id);

    if (matchingNodes.length > 0) {
      setHighlightedNodes(new Set(matchingNodes));

      // Auto-fade after 3 seconds
      setTimeout(() => {
        setHighlightedNodes(prev => {
          const next = new Set(prev);
          matchingNodes.forEach(id => next.delete(id));
          return next;
        });
      }, 3000);
    }
  }, [latestSpan, storyboards]);

  return (
    <div>
      {storyboards.map(storyboard => (
        <StoryboardItem
          key={storyboard.id}
          storyboard={storyboard}
          isHighlighted={highlightedNodes.has(storyboard.canvas.id)}
        />
      ))}
    </div>
  );
};
```

---

## Quick Reference

### Common Attribute Keys

| Key | Description | Example Value |
|-----|-------------|---------------|
| `service.name` | Service identifier | `"checkout-service"` |
| `service.version` | Service version | `"1.2.3"` |
| `deployment.environment` | Environment | `"production"`, `"staging"` |
| `http.method` | HTTP method | `"GET"`, `"POST"` |
| `http.route` | HTTP route | `"/api/users"` |
| `http.status_code` | HTTP status | `200`, `404`, `500` |
| `db.system` | Database type | `"postgresql"`, `"mongodb"` |
| `db.name` | Database name | `"app_db"` |
| `db.operation` | DB operation | `"SELECT"`, `"INSERT"` |
| `exception.type` | Exception class | `"AuthenticationError"` |
| `exception.message` | Error message | `"Invalid credentials"` |

### Span Kinds

| Kind | Use Case | Example |
|------|----------|---------|
| `SPAN_KIND_INTERNAL` | Internal operations | Business logic, calculations |
| `SPAN_KIND_SERVER` | Receiving requests | API endpoint handlers |
| `SPAN_KIND_CLIENT` | Making requests | HTTP client, DB queries |
| `SPAN_KIND_PRODUCER` | Publishing messages | Kafka producer, RabbitMQ |
| `SPAN_KIND_CONSUMER` | Consuming messages | Kafka consumer, Queue worker |

### Timestamp Conversion

```typescript
// Nanoseconds (OTEL) → Milliseconds (JavaScript Date)
const ms = parseInt(span.startTimeUnixNano, 10) / 1_000_000;
const date = new Date(ms);

// Milliseconds → Nanoseconds
const nanos = (Date.now() * 1_000_000).toString();
```

---

## Next Steps

1. **Add type definitions**: Copy `src/types/otel.ts` to your project
2. **Create mock data**: Copy `src/mocks/otelMocks.ts` to your project
3. **Build UI components**: Use mock data in Storybook
4. **Add event listeners**: Prepare hooks for real telemetry
5. **Test with real data**: Once pipeline is implemented

---

## Related Documentation

- [OTEL Span Matching Specification](../../principal-view-core-library/.principal-views/OTEL-SPAN-MATCHING.md)
- [OpenTelemetry Specification](https://opentelemetry.io/docs/specs/otlp/)
- [Canvas Types Reference](../../principal-view-core-library/packages/core/src/types/canvas.ts)

---

## Questions & Feedback

If you have questions about the event structure or need additional examples, please document them here and we'll address them when implementing the data pipeline.
