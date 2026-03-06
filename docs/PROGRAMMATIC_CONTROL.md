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

---

# CanvasEditorPanel Programmatic Control

The CanvasEditorPanel supports programmatic control for scenario selection within workflows. This enables guided tours and external navigation to control which scenario is displayed.

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

### `selectScenario`

Programmatically select a scenario from the workflow template. The panel will highlight the relevant nodes and show the scenario details.

```typescript
// Select scenario and show expanded list view (default)
{ action: 'selectScenario', scenarioId: string }

// Select scenario and show carousel view
{ action: 'selectScenario', scenarioId: string, mode: 'carousel' }

// Select scenario and show list view (explicit)
{ action: 'selectScenario', scenarioId: string, mode: 'list' }
```

**Parameters:**
- `scenarioId` - The ID of the scenario to select (matches `scenario.id` in the workflow template)
- `mode` (optional) - Display mode for the scenario:
  - `'list'` (default) - Shows expanded event list with full details
  - `'carousel'` - Shows compact carousel view for step-by-step navigation

**Prerequisites:**
- The panel must have a `workflowTemplate` prop with scenarios
- The specified `scenarioId` must exist in `workflowTemplate.scenarios`

### `selectEvent`

Programmatically select an event within the currently selected scenario. The canvas will focus on the corresponding node.

```typescript
// Select event by index (0-based)
{ action: 'selectEvent', eventIndex: number }

// Select event by name
{ action: 'selectEvent', eventName: string }
```

**Parameters:**
- `eventIndex` - The index of the event to select (0-based, in order of `scenario.template.events`)
- `eventName` - The name of the event to select (must match a key in `scenario.template.events`)

**Note:** Provide either `eventIndex` or `eventName`, not both.

**Prerequisites:**
- A scenario must already be selected (via `selectScenario` or user interaction)
- The event must exist in the selected scenario's template

## Example: Tour Integration

```typescript
// Step 1: First, use StoryboardListPanel to select a workflow
// This opens the CanvasEditorPanel with the workflow loaded
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'selectNode', nodeId: 'workflow:authentication/login-flow' },
});

// Step 2: Once CanvasEditorPanel is open, select a specific scenario (list view)
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'selectScenario', scenarioId: 'happy-path' },
});

// Step 3: Select a specific event within the scenario by name
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'selectEvent', eventName: 'user.authenticated' },
});

// Alternative: Select event by index (0-based)
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'selectEvent', eventIndex: 2 },
});

// Step 4: Switch to carousel mode for step-by-step navigation
events.emit({
  type: 'custom',
  source: 'tour',
  timestamp: Date.now(),
  payload: { action: 'selectScenario', scenarioId: 'happy-path', mode: 'carousel' },
});
```

## Storybook Demo

See the `ProgrammaticScenarioControl` story in CanvasEditorPanel for an interactive demo of scenario and event selection features.
