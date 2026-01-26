# Event Schema Display

## Overview

The `GraphRenderer` component supports displaying detailed event information in the NodeInfoPanel. Nodes can define events in two ways:

1. **Inline Events** (Recommended) - Embed full event schema directly in the canvas
2. **Event References** (Future) - Use `eventRef` with a `resolveEventRef` callback when a centralized event registry is available

## Basic Usage (Inline Events)

Simply add event objects to your canvas nodes:

```typescript
<GraphRenderer
  canvas={canvas}
  showNodeDetailPanel={true}
/>
```

With a canvas node like:

```json
{
  "id": "auth-node",
  "type": "text",
  "text": "Authentication",
  "pv": {
    "nodeType": "process",
    "event": {
      "name": "user.authenticated",
      "description": "User successfully authenticated into the system",
      "attributes": {
        "userId": {
          "type": "string",
          "required": true,
          "description": "Unique user identifier"
        },
        "sessionId": {
          "type": "string",
          "required": true,
          "description": "Session token"
        }
      }
    }
  }
}
```

**Result**: Shows event name, description, and formatted attributes in the NodeInfoPanel when the node is clicked.

## Event Schema Format

Event schemas use the `PVEventSchema` type:

```typescript
interface PVEventSchema {
  /** Event name (e.g., 'conversion.started', 'user.login') */
  name: string;

  /** Description of what this event represents */
  description: string;

  /** Expected attributes/fields for this event */
  attributes: Record<string, PVEventFieldSchema>;
}

interface PVEventFieldSchema {
  /** Field data type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';

  /** Whether this field is required */
  required?: boolean;

  /** Description of what this field represents */
  description?: string;
}
```

## Example: Checkout Flow with Inline Events

See `src/demo/data/canvases/checkout-flow.otel.canvas.json` for a complete example:

```json
{
  "id": "user-validation",
  "nodeType": "rest-api",
  "label": "User Validation",
  "position": { "x": 100, "y": 100 },
  "pv": {
    "event": {
      "name": "user.authenticated",
      "description": "User successfully authenticated into the system",
      "attributes": {
        "userId": {
          "type": "string",
          "required": true,
          "description": "Unique user identifier"
        },
        "sessionId": {
          "type": "string",
          "required": true,
          "description": "Session token"
        },
        "timestamp": {
          "type": "string",
          "required": true,
          "description": "Authentication timestamp"
        },
        "method": {
          "type": "string",
          "description": "Auth method (password/oauth/sso)"
        }
      }
    }
  }
}
```

This canvas includes inline events for:
- `user.authenticated` - User authentication
- `inventory.checked` - Inventory verification
- `payment.initiated` - Payment processing
- `order.created` - Order creation

## Future: Event Registry with References

Once a centralized event registry is available (e.g., from `library.yml` parsing), you can use event references instead of inline events.

### Event Reference Format

```json
{
  "id": "auth-node",
  "type": "text",
  "text": "Authentication",
  "pv": {
    "nodeType": "process",
    "eventRef": "user.authenticated"
  }
}
```

### Using resolveEventRef Callback

```typescript
import type { PVEventSchema } from '@principal-ai/principal-view-core';

const resolveEventRef = (eventRef: string): PVEventSchema | undefined => {
  const eventRegistry: Record<string, PVEventSchema> = {
    'user.authenticated': {
      name: 'user.authenticated',
      description: 'User successfully authenticated into the system',
      attributes: {
        userId: { type: 'string', required: true, description: 'Unique user identifier' },
        sessionId: { type: 'string', required: true, description: 'Session token' },
      },
    },
  };
  return eventRegistry[eventRef];
};

<GraphRenderer
  canvas={canvas}
  resolveEventRef={resolveEventRef}
  showNodeDetailPanel={true}
/>
```

### Benefits of Event Registry

1. **Centralized Documentation**: Define event schemas once, reference everywhere
2. **Smaller Canvas Files**: Just reference event names instead of full schemas
3. **Consistency**: Same event definition across multiple canvases
4. **Easier Maintenance**: Update event schemas in one place

### Dynamic Event Loading

For larger applications, load event schemas from a file or API:

```typescript
import eventSchemas from './event-schemas.json';

const resolveEventRef = (eventRef: string) => eventSchemas[eventRef];
```

Or fetch from an API:

```typescript
const [eventRegistry, setEventRegistry] = useState<Record<string, PVEventSchema>>({});

useEffect(() => {
  fetch('/api/event-schemas')
    .then(res => res.json())
    .then(setEventRegistry);
}, []);

const resolveEventRef = (eventRef: string) => eventRegistry[eventRef];
```

## Display in NodeInfoPanel

When an event is resolved, the NodeInfoPanel displays:

1. **Event Name** - Highlighted in monospace font
2. **Description** - Human-readable explanation
3. **Attributes** - Formatted JSON showing:
   - Field names
   - Data types
   - Required/optional flags
   - Field descriptions

This provides complete documentation about what data each node expects or produces.
