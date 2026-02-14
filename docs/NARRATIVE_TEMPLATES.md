# Narrative Templates

## Overview

Narrative templates transform OpenTelemetry (OTEL) event streams into human-readable execution narratives. They reference `.otel.canvas` files and define how to render execution events into natural language descriptions.

## Purpose

- **Human-Readable Execution Stories**: Convert raw OTEL spans, events, and logs into coherent narratives
- **Automatic Scenario Detection**: Match different execution outcomes (success, error, validation failure, etc.)
- **Testing & Documentation**: Provide clear, readable test outputs and execution documentation

## File Structure

Narrative templates are JSON files with the `.narrative.json` extension.

### Basic Structure

```json
{
  "version": "1.0.0",
  "canvas": "./path/to/canvas.otel.canvas",
  "name": "User Authentication Flow",
  "description": "Describes the user authentication process",
  "mode": "flow",
  "scenarios": [
    {
      "id": "success",
      "priority": 1,
      "description": "Successful authentication",
      "template": {
        "events": {
          "auth.success": {}
        },
        "introduction": "User {user.email} logged in successfully",
        "flow": [
          "User provided credentials",
          "Credentials validated against database",
          "Session token generated: {session.token}",
          "User redirected to dashboard"
        ]
      }
    }
  ]
}
```

## File Discovery

The panel library automatically discovers narrative templates from these locations:

```
packages/*/__narratives__/*.narrative.json
.principal-views/__narratives__/*.narrative.json
__narratives__/*.narrative.json
.principal-views/*.narrative.json
```

## Schema Reference

### Root Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | Schema version (e.g., "1.0.0") |
| `canvas` | string | Yes | Relative path to `.otel.canvas` file |
| `name` | string | Yes | Human-readable template name |
| `description` | string | No | Description of what this narrative covers |
| `mode` | string | No | Display mode: "flow", "span-tree", "timeline", or "summary-only" (default: "flow") |
| `scenarios` | array | Yes | List of scenario definitions |

### Scenario Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique scenario identifier (kebab-case) |
| `priority` | number | Yes | Selection priority (lower = higher priority) |
| `description` | string | Yes | What this scenario represents |
| `template` | object | Yes | How to render this scenario |

### Scenario Matching

Scenarios are matched based on which events are present in the execution. Each scenario's `template.events` object defines the events that must occur for that scenario to match.

The scenario with the **lowest priority number** whose events are all present in the execution will be selected.

**Example:**

```json
{
  "id": "success",
  "priority": 1,
  "description": "Successful authentication",
  "template": {
    "events": {
      "auth.success": {}
    },
    "introduction": "User logged in successfully"
  }
}
```

This scenario will match if the execution contains an event named `auth.success`.

**Multiple Events:**

```json
{
  "id": "order-completed",
  "priority": 1,
  "description": "Order successfully processed",
  "template": {
    "events": {
      "order.created": {},
      "payment.processed": {},
      "inventory.reserved": {},
      "shipping.scheduled": {}
    },
    "introduction": "Order completed successfully"
  }
}
```

This scenario will match only if **all four events** are present in the execution.

### Template Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `events` | object | Yes | Map of event names to event configurations - defines which events must be present for this scenario to match |
| `introduction` | string | No | Opening text (appears at the top, use for title/header) |
| `flow` | array | No | Step-by-step narrative flow (array of strings or flow directives) |
| `summary` | string | No | Closing text (appears at the bottom, use for conclusion) |
| `details` | object | No | Additional details to display |
| `assertions` | array | No | Validation assertions |

**Note**: The rendering order is: `introduction` → mode-specific content → `flow` → `summary`

**Event Matching**: A scenario matches when **all** events listed in `template.events` are present in the execution. The scenario with the lowest `priority` number whose events all match will be selected.

### Template Variables

Use `{variable}` syntax to inject values from OTEL events:

- `{event.name}` - Event name
- `{span.name}` - Span name
- `{attributes.key}` - Attribute value
- `{resource.key}` - Resource attribute
- `{timestamp}` - Event timestamp
- `{duration}` - Span duration (for spans)

## Creating Mock Narratives

### Example 1: Simple Success/Error Flow

```json
{
  "version": "1.0.0",
  "canvas": "./graph-converter-test.otel.canvas",
  "name": "Graph Converter Test",
  "description": "Narrative for graph converter test execution",
  "mode": "flow",
  "scenarios": [
    {
      "id": "success",
      "priority": 1,
      "description": "Test passed successfully",
      "template": {
        "events": {
          "test.passed": {}
        },
        "introduction": "✓ Graph converter test passed in {duration}ms",
        "flow": [
          "Loaded test configuration",
          "Converted graph to canvas format",
          "Validated output structure",
          "All assertions passed"
        ]
      }
    },
    {
      "id": "failure",
      "priority": 2,
      "description": "Test failed",
      "template": {
        "events": {
          "test.failed": {}
        },
        "introduction": "✗ Graph converter test failed: {error.message}",
        "flow": [
          "Loaded test configuration",
          "Attempted graph conversion",
          "Error occurred: {error.message}",
          "Stack trace: {error.stack}"
        ],
        "details": {
          "Error Type": "{error.type}",
          "Failed At": "{error.location}"
        }
      }
    }
  ]
}
```

### Example 2: Multi-Step Process

```json
{
  "version": "1.0.0",
  "canvas": "./order-processing.otel.canvas",
  "name": "E-Commerce Order Processing",
  "description": "Order fulfillment workflow",
  "mode": "flow",
  "scenarios": [
    {
      "id": "order-completed",
      "priority": 1,
      "description": "Order successfully processed",
      "template": {
        "events": {
          "order.created": {},
          "payment.processed": {},
          "inventory.reserved": {},
          "shipping.scheduled": {}
        },
        "introduction": "Order #{order.id} completed for {customer.name}",
        "flow": [
          "Order placed: {order.items.count} items, total ${order.total}",
          "Payment processed via {payment.method}: ${payment.amount}",
          "Inventory reserved from warehouse {warehouse.location}",
          "Shipping scheduled via {shipping.carrier} (tracking: {shipping.tracking_number})",
          "Estimated delivery: {shipping.estimated_delivery}"
        ],
        "details": {
          "Order ID": "{order.id}",
          "Customer": "{customer.name} ({customer.email})",
          "Total Amount": "${order.total}",
          "Processing Time": "{duration}ms"
        }
      }
    },
    {
      "id": "payment-declined",
      "priority": 2,
      "description": "Payment was declined",
      "template": {
        "events": {
          "payment.declined": {}
        },
        "introduction": "Order #{order.id} failed - payment declined",
        "flow": [
          "Order placed: {order.items.count} items, total ${order.total}",
          "Payment attempted via {payment.method}",
          "Payment declined: {payment.decline_reason}",
          "Order cancelled, customer notified"
        ],
        "details": {
          "Decline Reason": "{payment.decline_reason}",
          "Decline Code": "{payment.decline_code}"
        }
      }
    },
    {
      "id": "out-of-stock",
      "priority": 3,
      "description": "Items out of stock",
      "template": {
        "events": {
          "inventory.insufficient": {}
        },
        "introduction": "Order #{order.id} failed - items out of stock",
        "flow": [
          "Order placed: {order.items.count} items",
          "Payment processed: ${payment.amount}",
          "Inventory check failed: {inventory.missing_items.count} items unavailable",
          "Payment refunded: ${refund.amount}",
          "Customer notified of backorder"
        ],
        "details": {
          "Missing Items": "{inventory.missing_items}",
          "Refund Status": "{refund.status}"
        }
      }
    }
  ]
}
```

### Example 3: Timeline Mode for Debugging

```json
{
  "version": "1.0.0",
  "canvas": "./api-trace.otel.canvas",
  "name": "API Request Trace",
  "description": "Detailed timeline of API request processing",
  "mode": "timeline",
  "scenarios": [
    {
      "id": "default",
      "priority": 1,
      "description": "Default timeline view",
      "template": {
        "events": {
          "http.request": {}
        },
        "introduction": "{http.method} {http.url} → {http.status_code} ({duration}ms)",
        "flow": [
          "[{timestamp}] Request received: {http.method} {http.url}",
          "[{timestamp}] Authentication verified for user {auth.user_id}",
          "[{timestamp}] Database query executed in {db.duration}ms",
          "[{timestamp}] Response sent: {http.status_code} ({response.size} bytes)"
        ]
      }
    }
  ]
}
```

## Using in Tests

### Storybook Example

```typescript
import type { NarrativeTemplate } from '@principal-ai/principal-view-core/browser';
import narrativeTemplate from './test-flow.narrative.json';

export const WithNarrative = {
  render: () => (
    <TestEventPanel
      spans={mockSpans}
      currentSpanIndex={0}
      currentEventIndex={0}
      narrativeTemplate={narrativeTemplate as NarrativeTemplate}
      viewMode="narrative"
      onViewModeChange={(mode) => console.log('View mode:', mode)}
    />
  ),
};
```

### Panel Integration

The CanvasDetailPanel automatically:
1. Discovers narrative templates from file tree
2. Matches narratives to canvas files via the `canvas` reference
3. Loads and parses the template
4. Passes it to TestEventPanel
5. Defaults to 'narrative' view mode if template is available

## Mock Data Structure

When creating mock execution data to test narratives, structure it as:

```typescript
interface MockSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, string | number | boolean>;
  events: Array<{
    time: number;
    name: string;
    attributes: Record<string, string | number | boolean>;
  }>;
  status: 'OK' | 'ERROR';
  errorMessage?: string;
}
```

### Example Mock Data

```typescript
const mockSuccessExecution: MockSpan[] = [
  {
    id: 'span-1',
    name: 'ProcessOrder',
    startTime: Date.now(),
    endTime: Date.now() + 1500,
    duration: 1500,
    status: 'OK',
    attributes: {
      'order.id': 'ORD-12345',
      'customer.name': 'John Doe',
      'customer.email': 'john@example.com',
      'order.total': 99.99,
      'order.items.count': 3,
    },
    events: [
      {
        time: Date.now(),
        name: 'order.created',
        attributes: {
          'order.id': 'ORD-12345',
        },
      },
      {
        time: Date.now() + 500,
        name: 'payment.processed',
        attributes: {
          'payment.method': 'credit_card',
          'payment.amount': 99.99,
        },
      },
      {
        time: Date.now() + 1000,
        name: 'inventory.reserved',
        attributes: {
          'warehouse.location': 'US-WEST-1',
        },
      },
      {
        time: Date.now() + 1400,
        name: 'shipping.scheduled',
        attributes: {
          'shipping.carrier': 'UPS',
          'shipping.tracking_number': '1Z999AA10123456784',
          'shipping.estimated_delivery': '2025-01-20',
        },
      },
    ],
  },
];
```

## Best Practices

### 1. Scenario Priority
- Lower numbers = higher priority
- Most specific scenarios should have lower priority numbers
- Always include a default/fallback scenario with high priority number

### 2. Template Variables
- Use descriptive variable names: `{order.id}` not `{oid}`
- Provide fallback values in code, not in template
- Keep variable names consistent with OTEL semantic conventions

### 3. File Organization
```
.principal-views/
  ├── __narratives__/
  │   ├── auth-flow.narrative.json
  │   ├── payment-flow.narrative.json
  │   └── order-processing.narrative.json
  ├── auth-flow.otel.canvas
  ├── payment-flow.otel.canvas
  └── order-processing.otel.canvas
```

### 4. Naming Conventions
- Files: `kebab-case.narrative.json`
- Scenario IDs: `kebab-case`
- Event names: `namespace.action` (e.g., `auth.success`, `payment.declined`)
- Attribute keys: Use OTEL semantic conventions where applicable

### 5. Testing
- Create at least one narrative for each canvas file
- Cover happy path and common error scenarios
- Test with realistic mock data
- Validate template variable references exist in mock data

## Validation

The CLI can validate narrative templates:

```bash
npx privu lint
```

This checks for:
- Valid JSON schema
- Canvas file reference exists
- Template syntax is valid
- Event/attribute references (when canvas includes event schemas)
- Event definitions in template match available events

## Related Documentation

- [Narrative Template Design](../../principal-view-core-library/docs/NARRATIVE_TEMPLATES_DESIGN.md) - Full design specification
- [Narrative Validation](../../principal-view-core-library/docs/NARRATIVE_VALIDATION.md) - Validation rules
- [OTEL Canvas Files](./CANVAS_FILES.md) - Canvas file structure
