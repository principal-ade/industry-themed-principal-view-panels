# Programmatic Control API

The StoryboardListPanel supports programmatic control via custom events. This is useful for guided tours, external navigation, and automated testing.

## Event Format

Send events via the panel's event system:

```typescript
events.emit({
  type: 'custom',
  source: 'your-source-name',
  timestamp: Date.now(),
  payload: { action: '...', /* action-specific params */ },
});
```

## Available Actions

### `switchTab`

Switch between Architecture and OTEL Workflows tabs.

```typescript
{ action: 'switchTab', tab: 'otel' | 'regular' }
```

- `'otel'` - Switch to OTEL Workflows tab
- `'regular'` - Switch to Architecture tab

### `toggleNode`

Expand or collapse a tree node.

```typescript
// Toggle current state
{ action: 'toggleNode', nodeId: string }

// Set explicit state
{ action: 'toggleNode', nodeId: string, open: boolean }
```

**Node ID formats:**
- `storyboard:storyboard-name` - Storyboard folder node
- `canvas-folder:canvas-name` - Canvas folder node (Architecture tab)
- `workflows:storyboard-name` - Workflows container node

### `selectNode`

Programmatically select a node and emit click events as if the user clicked it.

```typescript
{ action: 'selectNode', nodeId: string }
```

**Node ID formats:**
- `canvas:storyboard-name` - Select canvas, emits `openCanvas` event with `openMode: 'editor'`
- `workflow:workflow-name` - Select workflow, emits `openCanvas` event with `openMode: 'detail'`
- `overview:canvas-name` - Select overview, emits `file:open` event for markdown

**Workflow matching:**
Workflows can be matched by:
- Full ID: `workflow:storyboard-name/workflow-name`
- Just workflow name: `workflow:workflow-name`

## Example: Tour Integration

```typescript
// Step 1: Switch to OTEL tab
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'switchTab', tab: 'otel' },
});

// Step 2: Expand a storyboard
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'toggleNode', nodeId: 'storyboard:authentication-flow', open: true },
});

// Step 3: Select a workflow (triggers openCanvas event)
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'selectNode', nodeId: 'workflow:login-flow' },
});
```

## Storybook Demo

See the `ProgrammaticTabControl` story for an interactive demo of all programmatic control features.
