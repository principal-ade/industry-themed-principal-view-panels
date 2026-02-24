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
 * Generate a multi-scope trace (single service with multiple instrumentation scopes)
 *
 * This simulates a real-world scenario where a service uses:
 * - HTTP instrumentation (API spans)
 * - Database instrumentation (DB spans)
 * - Custom app instrumentation (business logic spans)
 */
export function generateMultiScopeTrace(): OtelResourceSpans {
  const traceId = generateTraceId();
  const baseTime = Date.now() * 1_000_000; // nanoseconds

  // HTTP instrumentation scope - API calls
  const httpRequestSpan = createMockAPISpan({
    method: 'POST',
    route: '/api/orders',
    statusCode: 200,
    durationMs: 800,
  });
  httpRequestSpan.traceId = traceId;
  // Add request/response events
  httpRequestSpan.events = [
    {
      timeUnixNano: (baseTime + 1_000_000).toString(),
      name: 'request.started',
      attributes: [
        createAttribute('http.request.body.size', 1234),
      ],
    },
    {
      timeUnixNano: (baseTime + 790_000_000).toString(),
      name: 'response.sent',
      attributes: [
        createAttribute('http.response.body.size', 567),
      ],
    },
  ];

  // Custom app instrumentation scope - business logic
  const validateOrderSpan = createMockSpan({
    name: 'validateOrder',
    kind: 'SPAN_KIND_INTERNAL',
    attributes: {
      'order.items': 3,
      'order.total': 299.99,
    },
    durationMs: 50,
    traceId,
    parentSpanId: httpRequestSpan.spanId,
  });
  // Add validation events
  validateOrderSpan.events = [
    {
      timeUnixNano: (baseTime + 5_000_000).toString(),
      name: 'validation.step',
      attributes: [
        createAttribute('step', 'check_inventory'),
        createAttribute('result', 'passed'),
      ],
    },
    {
      timeUnixNano: (baseTime + 15_000_000).toString(),
      name: 'validation.step',
      attributes: [
        createAttribute('step', 'check_pricing'),
        createAttribute('result', 'passed'),
      ],
    },
    {
      timeUnixNano: (baseTime + 25_000_000).toString(),
      name: 'validation.step',
      attributes: [
        createAttribute('step', 'check_customer_credit'),
        createAttribute('result', 'passed'),
      ],
    },
  ];

  const processPaymentSpan = createMockSpan({
    name: 'processPayment',
    kind: 'SPAN_KIND_INTERNAL',
    attributes: {
      'payment.method': 'credit_card',
      'payment.provider': 'stripe',
    },
    durationMs: 200,
    traceId,
    parentSpanId: httpRequestSpan.spanId,
  });
  // Add payment processing events
  processPaymentSpan.events = [
    {
      timeUnixNano: (baseTime + 100_000_000).toString(),
      name: 'payment.authorized',
      attributes: [
        createAttribute('authorization_code', 'AUTH_12345'),
        createAttribute('card_last_four', '4242'),
      ],
    },
    {
      timeUnixNano: (baseTime + 180_000_000).toString(),
      name: 'payment.captured',
      attributes: [
        createAttribute('capture_id', 'CAP_67890'),
        createAttribute('amount_cents', 29999),
      ],
    },
  ];

  // Database instrumentation scope - DB queries
  const dbInsertOrderSpan = createMockDBSpan({
    operation: 'INSERT',
    table: 'orders',
    durationMs: 100,
  });
  dbInsertOrderSpan.traceId = traceId;
  dbInsertOrderSpan.parentSpanId = validateOrderSpan.spanId;
  // Add DB event
  dbInsertOrderSpan.events = [
    {
      timeUnixNano: (baseTime + 50_000_000).toString(),
      name: 'db.query',
      attributes: [
        createAttribute('db.statement', 'INSERT INTO orders (id, customer_id, total) VALUES ($1, $2, $3)'),
        createAttribute('db.rows_affected', 1),
      ],
    },
  ];

  const dbInsertPaymentSpan = createMockDBSpan({
    operation: 'INSERT',
    table: 'payments',
    durationMs: 80,
  });
  dbInsertPaymentSpan.traceId = traceId;
  dbInsertPaymentSpan.parentSpanId = processPaymentSpan.spanId;

  const dbUpdateInventorySpan = createMockDBSpan({
    operation: 'UPDATE',
    table: 'inventory',
    durationMs: 60,
  });
  dbUpdateInventorySpan.traceId = traceId;
  dbUpdateInventorySpan.parentSpanId = validateOrderSpan.spanId;
  // Add inventory update event
  dbUpdateInventorySpan.events = [
    {
      timeUnixNano: (baseTime + 45_000_000).toString(),
      name: 'inventory.reserved',
      attributes: [
        createAttribute('sku_count', 3),
        createAttribute('warehouse', 'US-WEST-1'),
      ],
    },
  ];

  return {
    resourceSpans: [
      {
        resource: createMockResource('order-service', {
          'service.version': '2.1.0',
          'deployment.environment': 'production',
        }),
        scopeSpans: [
          {
            scope: {
              name: '@opentelemetry/instrumentation-http',
              version: '0.52.0',
            },
            spans: [httpRequestSpan],
          },
          {
            scope: {
              name: 'pkg:npm/@acme/order-service',
              version: '2.1.0',
            },
            spans: [validateOrderSpan, processPaymentSpan],
          },
          {
            scope: {
              name: '@opentelemetry/instrumentation-pg',
              version: '0.40.0',
            },
            spans: [dbInsertOrderSpan, dbInsertPaymentSpan, dbUpdateInventorySpan],
          },
        ],
      },
    ],
  };
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
  // Group all data by traceId
  interface TraceData {
    spans: OtelSpanData[];
    resources: Map<string, {
      resource: OtelResourceData;
      scopes: Map<string, {
        name: string;
        version?: string;
        spanIds: string[];
      }>;
    }>;
  }

  const traceMap = new Map<string, TraceData>();

  // Collect all spans by trace ID, preserving resource and scope info
  for (const resourceSpan of resourceSpans.resourceSpans) {
    const serviceName = getAttributeValue(resourceSpan.resource.attributes, 'service.name') as string || 'unknown';

    for (const scopeSpan of resourceSpan.scopeSpans) {
      const scopeName = scopeSpan.scope?.name || 'unknown';
      const scopeVersion = scopeSpan.scope?.version;

      for (const span of scopeSpan.spans) {
        if (!traceMap.has(span.traceId)) {
          traceMap.set(span.traceId, {
            spans: [],
            resources: new Map(),
          });
        }

        const traceData = traceMap.get(span.traceId)!;
        traceData.spans.push(span);

        // Ensure resource entry exists
        if (!traceData.resources.has(serviceName)) {
          traceData.resources.set(serviceName, {
            resource: resourceSpan.resource,
            scopes: new Map(),
          });
        }

        const resourceData = traceData.resources.get(serviceName)!;

        // Ensure scope entry exists
        if (!resourceData.scopes.has(scopeName)) {
          resourceData.scopes.set(scopeName, {
            name: scopeName,
            version: scopeVersion,
            spanIds: [],
          });
        }

        resourceData.scopes.get(scopeName)!.spanIds.push(span.spanId);
      }
    }
  }

  // Convert to RegisteredTrace array
  const traces: RegisteredTrace[] = [];
  for (const [traceId, traceData] of traceMap) {
    const { spans, resources } = traceData;
    const rootSpan = spans.find(s => !s.parentSpanId || s.parentSpanId === '');
    const startTime = Math.min(...spans.map(s => parseNanoTime(s.startTimeUnixNano)));
    const endTime = Math.max(...spans.map(s => parseNanoTime(s.endTimeUnixNano)));
    const hasErrors = spans.some(
      s => s.status?.code === 2 || s.events?.some(e => e.name === 'exception')
    );

    // Build resources array with proper scope info
    const registeredResources = Array.from(resources.entries()).map(([serviceName, resourceData]) => {
      const serviceVersion = getAttributeValue(resourceData.resource.attributes, 'service.version') as string | undefined;

      return {
        serviceIdentifier: `http://${serviceName}`,
        serviceName,
        attributes: {
          'service.name': serviceName,
          'service.version': serviceVersion || 'unknown',
        },
        scopes: Array.from(resourceData.scopes.values()).map(scope => ({
          scope: {
            name: scope.name,
            version: scope.version || serviceVersion || 'unknown',
          },
          spanIds: scope.spanIds,
        })),
      };
    });

    // Get first resource for workflow matching info
    const firstResource = resources.values().next().value;
    const resource = firstResource?.resource;

    // Extract workflow matching information from resource attributes
    const storyboardId = resource ? getAttributeValue(resource.attributes, 'pv.storyboard.id') as string | undefined : undefined;
    const storyboardName = resource ? getAttributeValue(resource.attributes, 'pv.storyboard.name') as string | undefined : undefined;
    const workflowId = resource ? getAttributeValue(resource.attributes, 'pv.workflow.id') as string | undefined : undefined;
    const workflowName = resource ? getAttributeValue(resource.attributes, 'pv.workflow.name') as string | undefined : undefined;
    const scenarioId = resource ? getAttributeValue(resource.attributes, 'pv.scenario.id') as string | undefined : undefined;

    const hasMatchInfo = storyboardId && storyboardName && scenarioId;
    const firstScopeName = registeredResources[0]?.scopes[0]?.scope.name || 'unknown';

    traces.push({
      traceId,
      name: rootSpan?.name || 'Unknown Operation',
      startTime,
      endTime,
      duration: endTime - startTime,
      spanCount: spans.length,
      hasErrors,
      resources: registeredResources,
      scenarioMatches: hasMatchInfo ? [{
        storyboardId: storyboardId!,
        storyboardName,
        workflowId: workflowId || storyboardId!,
        workflowName,
        scenarioId: scenarioId!,
        scopeName: firstScopeName,
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
