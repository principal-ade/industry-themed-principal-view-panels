import type {
  OtelResourceSpansData,
  OtelResourceData,
  OtelSpanData,
  OtelKeyValue,
  RegisteredTrace,
} from '@principal-ai/principal-view-core';
import { getAttributeValue, parseNanoTime } from '@principal-ai/principal-view-core';

// Type aliases for mock code
type OtelResourceSpans = { resourceSpans: OtelResourceSpansData[] };
type OtelResourceSpan = OtelResourceSpansData;
type OtelResource = OtelResourceData;
type OtelSpan = OtelSpanData;
type OtelAttribute = OtelKeyValue;
type OtelSpanKind =
  | 'SPAN_KIND_UNSPECIFIED'
  | 'SPAN_KIND_INTERNAL'
  | 'SPAN_KIND_SERVER'
  | 'SPAN_KIND_CLIENT'
  | 'SPAN_KIND_PRODUCER'
  | 'SPAN_KIND_CONSUMER';

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
    kind: kind as unknown as number, // Core uses numeric kind
    startTimeUnixNano: startTime,
    endTimeUnixNano: endTime,
    attributes: spanAttributes,
    events: [],
    status: hasError
      ? { code: 2, message: 'Operation failed' } // 2 = ERROR
      : { code: 1 }, // 1 = OK
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
export function generateCheckoutTrace(includeWorkflowMatch: boolean = false): OtelResourceSpans {
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

  const resourceSpans = createMockResourceSpans('checkout-service', [apiSpan, dbSpan]);

  // Add workflow matching metadata to the resource attributes if requested
  if (includeWorkflowMatch) {
    resourceSpans.resourceSpans[0].resource.attributes.push(
      createAttribute('pv.storyboard.id', 'payment-processing'),
      createAttribute('pv.storyboard.name', 'Payment Processing'),
      createAttribute('pv.workflow.id', 'successful-payment'),
      createAttribute('pv.workflow.name', 'Successful Payment')
    );
  }

  return resourceSpans;
}

/**
 * Generate a realistic authentication trace (with error)
 */
export function generateAuthErrorTrace(includeWorkflowMatch: boolean = false): OtelResourceSpans {
  const traceId = generateTraceId();

  const apiSpan = createMockAPISpan({
    method: 'POST',
    route: '/api/login',
    statusCode: 401,
    durationMs: 120,
  });
  apiSpan.traceId = traceId;

  const resourceSpans = createMockResourceSpans('auth-service', [apiSpan]);

  // Add workflow matching metadata to the resource attributes if requested
  if (includeWorkflowMatch) {
    resourceSpans.resourceSpans[0].resource.attributes.push(
      createAttribute('pv.storyboard.id', 'authentication-flow'),
      createAttribute('pv.storyboard.name', 'Authentication Flow'),
      createAttribute('pv.workflow.id', 'error-handling'),
      createAttribute('pv.workflow.name', 'Error Handling')
    );
  }

  return resourceSpans;
}

/**
 * Generate a complex multi-service trace
 */
export function generateComplexTrace(includeWorkflowMatch: boolean = false): OtelResourceSpans {
  const traceId = generateTraceId();

  // API Gateway span
  const gatewaySpan = createMockAPISpan({
    method: 'GET',
    route: '/api/users/profile',
    statusCode: 200,
    durationMs: 500,
  });
  gatewaySpan.traceId = traceId;

  // Auth service span
  const authSpan = createMockSpan({
    name: 'validateToken',
    kind: 'SPAN_KIND_INTERNAL',
    attributes: { 'auth.type': 'jwt' },
    durationMs: 50,
    traceId,
    parentSpanId: gatewaySpan.spanId,
  });

  // User service span
  const userServiceSpan = createMockAPISpan({
    method: 'GET',
    route: '/internal/users',
    statusCode: 200,
    durationMs: 300,
  });
  userServiceSpan.traceId = traceId;
  userServiceSpan.parentSpanId = gatewaySpan.spanId;

  // Database span
  const dbSpan = createMockDBSpan({
    operation: 'SELECT',
    table: 'users',
    durationMs: 200,
  });
  dbSpan.traceId = traceId;
  dbSpan.parentSpanId = userServiceSpan.spanId;

  const resourceSpans = {
    resourceSpans: [
      {
        resource: createMockResource('api-gateway'),
        scopeSpans: [
          {
            scope: { name: '@opentelemetry/instrumentation-http', version: '0.52.0' },
            spans: [gatewaySpan, authSpan],
          },
        ],
      },
      {
        resource: createMockResource('user-service'),
        scopeSpans: [
          {
            scope: { name: '@opentelemetry/instrumentation-http', version: '0.52.0' },
            spans: [userServiceSpan, dbSpan],
          },
        ],
      },
    ],
  };

  // Add workflow matching metadata if requested
  if (includeWorkflowMatch) {
    resourceSpans.resourceSpans[0].resource.attributes.push(
      createAttribute('pv.storyboard.id', 'user-management'),
      createAttribute('pv.storyboard.name', 'User Management'),
      createAttribute('pv.workflow.id', 'view-profile'),
      createAttribute('pv.workflow.name', 'View Profile')
    );
  }

  return resourceSpans;
}

/**
 * Generate multiple random traces for testing
 */
export function generateRandomTraces(count: number): OtelResourceSpans {
  const allSpans: Array<{ resource: OtelResource; spans: OtelSpan[] }> = [];
  const services = ['api-gateway', 'auth-service', 'user-service', 'checkout-service', 'payment-service'];
  const routes = ['/api/users', '/api/checkout', '/api/products', '/api/orders', '/api/login'];
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];

  for (let i = 0; i < count; i++) {
    const traceId = generateTraceId();
    const service = services[Math.floor(Math.random() * services.length)];
    const route = routes[Math.floor(Math.random() * routes.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const hasError = Math.random() > 0.8; // 20% chance of error
    const statusCode = hasError ? [400, 401, 404, 500][Math.floor(Math.random() * 4)] : 200;
    const durationMs = Math.floor(Math.random() * 500) + 50; // 50-550ms

    const span = createMockAPISpan({
      method,
      route,
      statusCode,
      durationMs,
    });
    span.traceId = traceId;

    allSpans.push({
      resource: createMockResource(service),
      spans: [span],
    });
  }

  // Group by service
  const resourceSpansMap = new Map<string, OtelResourceSpan>();

  for (const { resource, spans } of allSpans) {
    const serviceName = resource.attributes.find(a => a.key === 'service.name')?.value.stringValue || 'unknown';

    if (!resourceSpansMap.has(serviceName)) {
      resourceSpansMap.set(serviceName, {
        resource,
        scopeSpans: [
          {
            scope: { name: '@opentelemetry/instrumentation-http', version: '0.52.0' },
            spans: [],
          },
        ],
      });
    }

    resourceSpansMap.get(serviceName)!.scopeSpans[0].spans.push(...spans);
  }

  return {
    resourceSpans: Array.from(resourceSpansMap.values()),
  };
}

/**
 * Create a trace with multi-workflow matching data
 *
 * @deprecated RegisteredTrace uses different structure for matching info
 * This creates a trace pre-populated with matching information for testing the TraceExpansion component
 */
export function createTraceWithMultiWorkflowData(params: {
  name: string;
  workflows?: Array<{
    storyboardId: string;
    storyboardName: string;
    workflowId: string;
    workflowName: string;
    scenarioId: string;
    scenarioName: string;
    matchedEventCount: number;
  }>;
  unmatchedEventNames?: string[];
  totalEventCount?: number;
  hasError?: boolean;
}): RegisteredTrace {
  const {
    name,
    workflows = [],
    hasError = false,
  } = params;

  const traceId = generateTraceId();
  const now = Date.now();

  // Use first workflow as primary match info
  const primaryMatch = workflows[0];

  return {
    traceId,
    name,
    startTime: now,
    endTime: now + 234,
    duration: 234,
    spanCount: 1,
    hasErrors: hasError,
    resources: [{
      serviceIdentifier: 'http://localhost:3000',
      serviceName: 'test-service',
      attributes: {
        'service.name': 'test-service',
        'service.version': '1.0.0',
      },
      scopes: [{
        scope: {
          name: 'test-instrumentation',
          version: '1.0.0',
        },
        spanIds: [traceId],
      }],
    }],
    scenarioMatches: primaryMatch ? [{
      storyboardId: primaryMatch.storyboardId,
      storyboardName: primaryMatch.storyboardName,
      workflowId: primaryMatch.workflowId,
      workflowName: primaryMatch.workflowName,
      scenarioId: primaryMatch.scenarioId,
      scopeName: 'test-instrumentation',
      matchedSpans: [{
        spanId: traceId,
        spanName: name,
        nodeId: 'node-1',
        timestamp: now,
        duration: 234,
        events: [],
        matchConfidence: 'exact',
      }],
      coveragePercent: 100,
      matchType: 'full',
    }] : [],
    storyboardMatches: [],
    unmatchedSpans: { spans: [] },
  };
}

/**
 * Convert OtelResourceSpans to RegisteredTrace[] for stories
 *
 * This is a simple conversion helper for Storybook stories.
 * In production, use the full TraceRegistryMatcher service.
 */
export function convertToRegisteredTraces(
  resourceSpans: OtelResourceSpans
): RegisteredTrace[] {
  const traceMap = new Map<string, { spans: OtelSpanData[]; resource: OtelResourceData; scopeName?: string; scopeVersion?: string }>();

  // Collect all spans by trace ID
  for (const resourceSpan of resourceSpans.resourceSpans) {
    for (const scopeSpan of resourceSpan.scopeSpans) {
      for (const span of scopeSpan.spans) {
        if (!traceMap.has(span.traceId)) {
          traceMap.set(span.traceId, {
            spans: [],
            resource: resourceSpan.resource,
            scopeName: scopeSpan.scope?.name,
            scopeVersion: scopeSpan.scope?.version,
          });
        }
        traceMap.get(span.traceId)!.spans.push(span);
      }
    }
  }

  // Convert to RegisteredTrace array
  const traces: RegisteredTrace[] = [];
  for (const [traceId, { spans, resource, scopeName, scopeVersion }] of traceMap) {
    const rootSpan = spans.find(s => !s.parentSpanId || s.parentSpanId === '');
    const startTime = Math.min(...spans.map(s => parseNanoTime(s.startTimeUnixNano)));
    const endTime = Math.max(...spans.map(s => parseNanoTime(s.endTimeUnixNano)));
    const hasErrors = spans.some(
      s => s.status?.code === 2 || s.events?.some(e => e.name === 'exception')
    );

    const serviceName = getAttributeValue(resource.attributes, 'service.name') as string || 'unknown';
    const serviceVersion = getAttributeValue(resource.attributes, 'service.version') as string | undefined;

    // Extract workflow matching information from resource attributes
    const storyboardId = getAttributeValue(resource.attributes, 'pv.storyboard.id') as string | undefined;
    const storyboardName = getAttributeValue(resource.attributes, 'pv.storyboard.name') as string | undefined;
    const workflowId = getAttributeValue(resource.attributes, 'pv.workflow.id') as string | undefined;
    const workflowName = getAttributeValue(resource.attributes, 'pv.workflow.name') as string | undefined;
    const scenarioId = getAttributeValue(resource.attributes, 'pv.scenario.id') as string | undefined;

    const hasMatchInfo = storyboardId && storyboardName && scenarioId;

    traces.push({
      traceId,
      name: rootSpan?.name || 'Unknown Operation',
      startTime,
      endTime,
      duration: endTime - startTime,
      spanCount: spans.length,
      hasErrors,
      resources: [{
        serviceIdentifier: `http://${serviceName}`,
        serviceName,
        attributes: {
          'service.name': serviceName,
          'service.version': serviceVersion || 'unknown',
        },
        scopes: [{
          scope: {
            name: scopeName || 'unknown',
            version: scopeVersion || serviceVersion || 'unknown',
          },
          spanIds: spans.map(s => s.spanId),
        }],
      }],
      scenarioMatches: hasMatchInfo ? [{
        storyboardId: storyboardId!,
        storyboardName,
        workflowId: workflowId || storyboardId!, // Fallback to storyboardId if no workflow
        workflowName,
        scenarioId: scenarioId!,
        scopeName: scopeName || 'unknown',
        matchedSpans: spans.map(span => ({
          spanId: span.spanId,
          spanName: span.name,
          nodeId: workflowId || 'node-1',
          timestamp: parseNanoTime(span.startTimeUnixNano),
          duration: parseNanoTime(span.endTimeUnixNano) - parseNanoTime(span.startTimeUnixNano),
          events: span.events?.map(e => e.name) || [],
          matchConfidence: 'exact' as const,
        })),
        coveragePercent: 100,
        matchType: 'full' as const,
      }] : [],
      storyboardMatches: [],
      unmatchedSpans: { spans: [] },
      otlpData: {
        resourceSpans: resourceSpans.resourceSpans,
      },
    });
  }

  return traces;
}
