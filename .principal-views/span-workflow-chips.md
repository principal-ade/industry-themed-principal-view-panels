# Span Workflow Chips

## Status: IN PROGRESS - Data Flow Issue (Chips Not Displaying)

## Overview

Display workflow chips on `otel-span-convention` nodes in spans.canvas files to show which workflows are associated with each span pattern.

## Goal

When viewing a spans.canvas, users should be able to see at a glance which workflows reference each span pattern, helping them understand how spans are used across different workflows.

## UI Design

### Phase 1: Display Chips (Current Focus)

Show small chips along the bottom of span nodes:

```
        ╱──────────╲
       ╱   Label    ╲
       ╲ validate.*  ╱
        ╲──────────╱
    [checkout] [cart-update]
```

**Chip styling:**
- Small, pill-shaped badges
- Subtle background color (e.g., gray or workflow-specific color)
- Truncate long workflow names with ellipsis
- Max visible chips before "+N more" overflow

**Matching logic:**
- Span node has `otel.spanPattern` (may include globs like `validate.*`)
- Workflow has `spanPattern` field
- Match workflows where `workflow.spanPattern` matches the span's pattern
- Handle glob patterns (e.g., `canvas.*.load` matches `canvas.user.load`)

### Phase 2: Selection & Highlighting (Future)

When clicking a workflow chip:
1. Highlight all span nodes that participate in that workflow
2. Dim non-participating nodes to 10% opacity
3. Show selected state on all matching chips across the canvas
4. Filter edges to only show connections between active nodes

## Data Flow

```
spans.canvas nodes
    │
    ├─ node.otel.spanPattern (e.g., "validate.*")
    │
    ▼
workflow.json files
    │
    ├─ workflow.spanPattern (e.g., "validate.input")
    │
    ▼
Match: workflow.spanPattern matches or is child of span pattern
    │
    ▼
Render chips on span node
```

---

## Architecture Refactor

Before adding workflow chips, refactor `CustomNode.tsx` (1112 lines) into OTEL-concept-specific components.

### Current Problem

`CustomNode.tsx` is a monolith with three nearly-identical render branches for hexagon/diamond/rectangle shapes. The differentiation should be by **OTEL concept**, not shape.

### Target Structure

```
packages/react/src/nodes/
├── CustomNode.tsx                    → thin orchestrator (~50 lines)
├── otel/
│   ├── OtelSpanConventionNode.tsx    → hexagon + workflow chips
│   ├── OtelEventNode.tsx             → rectangle + event attributes
│   ├── OtelScopeNode.tsx             → circle
│   ├── OtelResourceNode.tsx          → diamond + resourceMatch display
│   ├── OtelBoundaryNode.tsx          → rounded rect + direction badge
│   └── shared/
│       ├── NodeContent.tsx           → icon, name, identifier, state, violations
│       ├── NodeBadges.tsx            → status, sources, references badges
│       └── useNodeBehavior.ts        → resize, hide, hover handlers
└── GenericTextNode.tsx               → fallback for text/file/link/group
```

### OTEL Type → Shape Mapping

| OTEL Type | Shape | Unique Features |
|-----------|-------|-----------------|
| `otel-span-convention` | hexagon | spanPattern, **workflow chips** |
| `otel-event` | rectangle | event name, attributes schema |
| `otel-scope` | circle | scope name |
| `otel-resource` | diamond | resourceMatch key:value pairs |
| `otel-boundary` | rounded rect | direction (inbound/outbound) |

### CustomNode Orchestrator

```typescript
export const CustomNode = (props: NodeProps<Node<CustomNodeData>>) => {
  const nodeType = props.data.data?.nodeType || props.data.typeDefinition?.type;

  switch (nodeType) {
    case 'otel-span-convention':
      return <OtelSpanConventionNode {...props} />;
    case 'otel-event':
      return <OtelEventNode {...props} />;
    case 'otel-scope':
      return <OtelScopeNode {...props} />;
    case 'otel-resource':
      return <OtelResourceNode {...props} />;
    case 'otel-boundary':
      return <OtelBoundaryNode {...props} />;
    default:
      return <GenericTextNode {...props} />;
  }
};
```

---

## Implementation Steps

### Step 1: Extract shared components

**`shared/NodeContent.tsx`** - Renders icon, name, identifier, state badge, violations
**`shared/NodeBadges.tsx`** - Renders status/sources/references badges with shape-aware positioning
**`shared/useNodeBehavior.ts`** - Hook for resize, hide, hover, tooltip logic

### Step 2: Create OtelSpanConventionNode

- Hexagon shape rendering
- Uses shared NodeContent and NodeBadges
- Adds `workflowChips` rendering below identifier

### Step 3: Create other OTEL node components

Mirror the pattern for event, scope, resource, boundary nodes.

### Step 4: Refactor CustomNode

Thin orchestrator that delegates to specific components.

### Step 5: Add workflow chip data flow

In the panels repo, compute span→workflow associations and pass to GraphRenderer.

---

## Workflow Chip Types

```typescript
export interface WorkflowChip {
  id: string;        // workflow ID for selection
  label: string;     // display name (truncated if needed)
  color?: string;    // optional color
}
```

## Open Questions

- [ ] How to handle many workflows matching a single span? ("+N more" overflow?)
- [ ] Should chips show workflow name or workflow file name?
- [ ] Color coding for chips? (by workflow, by status, or neutral?)

---

## Current Implementation Status

### Published Versions
- `@principal-ai/principal-view-core@0.26.2`
- `@principal-ai/principal-view-react@0.14.5`

### What Was Built

1. **OTEL Node Components** (in principal-view-core-library):
   - `packages/react/src/nodes/otel/OtelSpanConventionNode.tsx` - Hexagon with chips
   - `packages/react/src/nodes/otel/OtelEventNode.tsx`
   - `packages/react/src/nodes/otel/OtelScopeNode.tsx`
   - `packages/react/src/nodes/otel/OtelResourceNode.tsx`
   - `packages/react/src/nodes/otel/OtelBoundaryNode.tsx`
   - `packages/react/src/nodes/otel/shared/types.ts` - WorkflowChip interface
   - `packages/react/src/nodes/otel/shared/NodeContent.tsx` - Renders chips
   - `packages/react/src/nodes/otel/shared/NodeBadges.tsx`
   - `packages/react/src/nodes/otel/shared/useNodeBehavior.ts`

2. **CustomNode Delegation** - Modified to route to OTEL components based on `nodeType`

3. **CanvasConverter Updates** - Added `workflowChips` passthrough in both methods

4. **Story** - `SpanWorkflowChips` in `src/panels/CanvasEditorPanel.stories.tsx`

### Current Issue: Chips Not Displaying

The story renders hexagons but no workflow chips are visible.

#### Data Flow Analysis

```
Canvas JSON (story injects workflowChips at node top-level)
    ↓
CanvasEditorPanel reads JSON, passes to GraphRenderer
    ↓
CanvasConverter.canvasToGraph() → NodeState
    │
    │  workflowChips should be in: nodeState.data.workflowChips
    ↓
graphConverter.convertToXYFlowNodes() → XYFlow Node
    │
    │  Maps to: node.data.data = nodeState.data (line 47)
    ↓
CustomNode → checks data.data?.nodeType
    ↓
OtelSpanConventionNode → reads nodeData.workflowChips
    │
    │  nodeData = nodeProps.data.data (line 86)
    │  workflowChips = nodeData?.workflowChips (line 147)
    ↓
NodeContent → renders WorkflowChips component
```

#### Likely Issues

1. **Type detection not matching** - `CustomNode` checks `data.data?.nodeType` but maybe the value isn't `'otel-span-convention'`

2. **Data not reaching component** - Need to add console.log to verify data flow

3. **Story structure** - Story injects chips at canvas node top-level, needs to match what CanvasConverter expects

#### Debugging Steps

1. In `OtelSpanConventionNode.tsx`, add:
   ```typescript
   console.log('OtelSpanConventionNode data:', { nodeData, workflowChips });
   ```

2. In `CustomNode.tsx`, add:
   ```typescript
   console.log('CustomNode nodeType:', nodeType, 'data:', data);
   ```

3. Verify the story's canvas nodes have `type: 'otel-span-convention'` (not just `pv.nodeType`)

#### Files to Check

| File | Location | Purpose |
|------|----------|---------|
| OtelSpanConventionNode.tsx | core-library/packages/react/src/nodes/otel/ | Component rendering chips |
| NodeContent.tsx | core-library/packages/react/src/nodes/otel/shared/ | WorkflowChips sub-component |
| CustomNode.tsx | core-library/packages/react/src/nodes/ | Delegation switch |
| CanvasConverter.ts | core-library/packages/core/src/utils/ | Data passthrough |
| graphConverter.ts | core-library/packages/react/src/utils/ | NodeState → XYFlow |
| CanvasEditorPanel.stories.tsx | panels/src/panels/ | Test story |

### Next Steps

1. Add console.log debugging to trace data flow
2. Run storybook and check browser console
3. Fix wherever data is being lost
4. Publish updated packages
