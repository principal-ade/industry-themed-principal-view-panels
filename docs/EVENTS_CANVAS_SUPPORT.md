# Events Canvas Support - Implementation Guide

## Summary

Core v0.26.30 adds new validation for **events canvas files** that document the event vocabulary for each instrumentation scope. These files need to be discoverable and displayable in the StoryboardListPanel.

## New File Type: Events Canvas

### Naming Convention
Events canvas files follow the pattern: `{scope-name}.events.canvas`

Scope names use **dashes instead of dots**:
- Scope: `backlog.md` → File: `backlog-md.events.canvas`
- Scope: `backlog.md.cli` → File: `backlog-md-cli.events.canvas`
- Scope: `backlog.md.mcp` → File: `backlog-md-mcp.events.canvas`

### Location
Events canvas files live in `.principal-views/` directory alongside other architecture files:
```
.principal-views/
├── architecture.scopes.canvas
├── architecture.spans.canvas
├── backlog-md.events.canvas          # NEW
├── backlog-md-cli.events.canvas      # NEW
├── backlog-md-mcp.events.canvas      # NEW
└── ...
```

## New Validation Chain

Core v0.26.30 implements a complete validation chain:

1. **Library.yaml → Scopes Canvas**: Owned scopes must be documented in `architecture.scopes.canvas`
2. **Scopes Canvas → Events Canvas**: Each documented scope must have a `{scope-name}.events.canvas` file
3. **OTEL Canvas → Scopes Canvas**: Scopes used in workflow canvases must be documented in scopes canvas

### Validation Behavior

The CLI now warns when events canvas files are missing:

```
Library Files:
✓ .principal-views/library.yaml
  ⚠ Scope "backlog.md" is missing an events canvas
  ⚠ Scope "backlog.md.cli" is missing an events canvas
```

## What Events Canvas Files Document

Events canvas files document the **event vocabulary** emitted by each scope:

- **Event namespaces**: Logical groupings of related events (e.g., "validation", "file", "search")
- **Events**: Specific events within each namespace with their attributes
- **Adjacency**: Which event namespaces connect in workflow sequences

## Required Changes to StoryboardListPanel

### 1. Discovery

Update canvas discovery to recognize `*.events.canvas` files:

```typescript
// Should discover files matching: /\.events\.canvas$/
// These are events vocabulary files, not storyboard canvases
```

### 2. Display

Add events canvas files to the file list, grouped appropriately:

**Option A - Separate Section:**
```
Architecture Files
├── architecture.scopes.canvas
├── architecture.spans.canvas
└── Events Canvases
    ├── backlog-md.events.canvas
    ├── backlog-md-cli.events.canvas
    └── backlog-md-mcp.events.canvas
```

**Option B - Grouped with Architecture:**
```
Architecture Files
├── architecture.scopes.canvas
├── architecture.spans.canvas
├── backlog-md.events.canvas
├── backlog-md-cli.events.canvas
└── backlog-md-mcp.events.canvas
```

### 3. Icon/Badge

Consider adding a distinctive icon or badge to differentiate events canvas files:
- Icon: 📢 or 📡 (event/signal related)
- Color: Different from regular canvases
- Label: "Events Vocabulary" or "Events"

### 4. Filtering

If the panel has filtering, ensure events canvas files are:
- Included in relevant filters
- Filterable separately if needed

## Example Events Canvas Structure

```json
{
  "name": "Backlog.md CLI Events",
  "markdown": ".principal-views/cli.events.md",
  "description": "Event vocabulary for the CLI scope",
  "nodes": [
    {
      "type": "text",
      "id": "validation-namespace",
      "text": "# validation\nEvents related to input validation"
    },
    {
      "type": "text",
      "id": "validation-start",
      "text": "**validation.start**\nEmitted when validation begins"
    }
  ],
  "edges": [...]
}
```

## Testing

After implementation, test with:

1. **CLI validation**: `npx @principal-ai/principal-view-cli validate`
2. **Panel discovery**: Verify events canvas files appear in the list
3. **Panel rendering**: Verify events canvases render correctly when selected

## Questions?

- Events canvas structure: Same as regular canvases (JSON Canvas format)
- Validation: Handled by core v0.26.30 `ScopeEventsValidator`
- Discovery: Use `CanvasDiscovery` from core (already recognizes the pattern)
