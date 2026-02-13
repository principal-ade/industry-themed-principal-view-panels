# Type-Safe Workflow Content Access

## Overview

This document explains the type safety system for accessing workflow content (scenarios) in `StoryboardWorkflowNodeData`. This system prevents runtime errors when accessing workflow templates by enforcing type checks at both compile-time (TypeScript) and runtime (type guards).

## The Problem

Workflows in the system can exist in two forms:

1. **Metadata-only** (`DiscoveredWorkflow`): Contains id, name, path, but no content
2. **With content** (`DiscoveredWorkflowWithContent`): Includes a `.content` property with the full `WorkflowTemplate` (scenarios, canvas, etc.)

Previously, the type system allowed unsafe access:

```typescript
// ❌ UNSAFE - TypeScript didn't know if .content exists
const node: StoryboardWorkflowNodeData = getNode();
const template = node.workflow.content;  // Might be undefined at runtime!
```

This caused runtime errors like:
```
TypeError: Cannot read property 'scenarios' of undefined
```

## The Solution

The `StoryboardWorkflowNodeData` type now uses a union type for workflows:

```typescript
interface StoryboardWorkflowNodeData {
  workflow?: DiscoveredWorkflow | DiscoveredWorkflowWithContent;
  // ... other properties
}
```

Combined with the `hasWorkflowContent()` type guard:

```typescript
// ✅ SAFE - TypeScript enforces .content exists
if (hasWorkflowContent(node)) {
  // TypeScript knows node.workflow is DiscoveredWorkflowWithContent
  const template = node.workflow.content;  // Guaranteed to exist!
  const scenarios = template.scenarios;    // Type-safe access
}
```

## How to Use

### Import the Type Guard

```typescript
import { hasWorkflowContent } from '@principal-ade/dynamic-file-tree';
import type { StoryboardWorkflowNodeData } from '@principal-ade/dynamic-file-tree';
```

### Check Before Accessing Content

```typescript
const handleWorkflowClick = (node: StoryboardWorkflowNodeData) => {
  // Use type guard to check if workflow has content
  if (hasWorkflowContent(node)) {
    // ✅ Safe - TypeScript knows .content exists here
    const template = node.workflow.content;

    console.log('Scenarios:', template.scenarios);
    console.log('Canvas:', template.canvas);
    console.log('Version:', template.version);
  } else {
    // Handle case where workflow is metadata-only
    console.warn('Workflow has no content:', node.workflow?.id);
  }
};
```

### Example: Emitting Events with Workflow Content

```typescript
const handleSchematicNodeClick = (node: StoryboardWorkflowNodeData) => {
  // Extract workflow template safely
  if (hasWorkflowContent(node)) {
    const workflowTemplate = node.workflow.content;

    // Emit event with type-safe data
    events.emit({
      type: 'custom',
      payload: {
        action: 'openWorkflowScenarios',
        workflowId: node.workflow.id,
        workflowPath: node.workflow.path,
        workflowTemplate,  // Guaranteed to have scenarios[]
      },
    });
  } else {
    console.error('Cannot open workflow - no content available');
  }
};
```

## Type Guard Implementation

The `hasWorkflowContent()` function performs both runtime and compile-time checks:

```typescript
export function hasWorkflowContent(
  node: StoryboardWorkflowNodeData
): node is StoryboardWorkflowNodeData & { workflow: DiscoveredWorkflowWithContent } {
  return (
    node.workflow !== undefined &&
    'content' in node.workflow &&
    node.workflow.content !== undefined
  );
}
```

**Runtime**: Checks if the property actually exists at runtime
**Compile-time**: TypeScript narrows the type inside the `if` block

## When Workflows Have Content

Workflows have content in these scenarios:

1. **Live file tree**: When loaded with `includeContent: true` in discovery options
2. **Version snapshots**: Historical workflow data from version registry
3. **Direct loading**: When workflow files are explicitly read and parsed

Workflows are metadata-only when:

1. Discovery runs without `includeContent` flag
2. Only metadata is needed (e.g., listing workflows)
3. Content hasn't been loaded yet

## Migration Guide

### Before (Unsafe)

```typescript
const handleWorkflowClick = (node: StoryboardWorkflowNodeData) => {
  // ❌ Unsafe - no type checking
  let template = node.workflowTemplate;  // Always undefined!

  if (!template && node.workflow && 'content' in node.workflow) {
    // ❌ Manual type assertion - TypeScript doesn't help
    template = node.workflow.content as WorkflowTemplate;
  }

  // ❌ Might crash if template is undefined
  const scenarios = template.scenarios;
};
```

### After (Safe)

```typescript
import { hasWorkflowContent } from '@principal-ade/dynamic-file-tree';

const handleWorkflowClick = (node: StoryboardWorkflowNodeData) => {
  // ✅ Type-safe check
  if (hasWorkflowContent(node)) {
    // ✅ TypeScript knows .content exists
    const template = node.workflow.content;

    // ✅ Safe access
    const scenarios = template.scenarios;
  } else {
    // ✅ Handle missing content gracefully
    console.error('Workflow content not available');
  }
};
```

## Best Practices

### ✅ Do

- **Always use `hasWorkflowContent()`** before accessing `node.workflow.content`
- **Handle the negative case** when content is not available
- **Trust the type system** - if TypeScript allows it, it's safe

### ❌ Don't

- **Don't use manual type assertions** (`as WorkflowTemplate`)
- **Don't access `.content` without the type guard**
- **Don't use `node.workflowTemplate`** (this property was removed)

## Troubleshooting

### "Property 'content' does not exist on type 'DiscoveredWorkflow'"

**Problem**: You're accessing `.content` without the type guard.

**Solution**:
```typescript
// ❌ Error
const template = node.workflow.content;

// ✅ Fix
if (hasWorkflowContent(node)) {
  const template = node.workflow.content;
}
```

### "Cannot read property 'scenarios' of undefined"

**Problem**: Runtime error - workflow content doesn't exist.

**Solution**: Add type guard check:
```typescript
if (hasWorkflowContent(node)) {
  const scenarios = node.workflow.content.scenarios;  // Safe!
} else {
  console.error('Workflow content not loaded');
}
```

### "Type 'undefined' is not assignable to type 'WorkflowTemplate'"

**Problem**: TypeScript knows the value might be undefined.

**Solution**: Use the type guard to prove it's not undefined:
```typescript
let template: WorkflowTemplate;

if (hasWorkflowContent(node)) {
  template = node.workflow.content;  // ✅ TypeScript knows this is safe
}
```

## Related Types

### `DiscoveredWorkflow`
```typescript
interface DiscoveredWorkflow {
  id: string;
  name: string;
  path: string;
  basename: string;
  storyboardId: string;
  packageName?: string;
  scope: 'root' | 'package';
  testTraces: DiscoveredTestTrace[];
}
```

### `DiscoveredWorkflowWithContent`
```typescript
interface DiscoveredWorkflowWithContent extends DiscoveredWorkflow {
  content: WorkflowTemplate;  // ← The key difference!
  testTraces: (DiscoveredTestTrace | DiscoveredTestTraceWithContent)[];
}
```

### `WorkflowTemplate`
```typescript
interface WorkflowTemplate {
  name: string;
  description?: string;
  version: string;
  mode: 'span-tree' | 'span-sequence';
  canvas: string;
  scenarios: WorkflowScenario[];  // ← This is what we need!
}
```

## Package Versions

This feature requires:
- `@principal-ade/dynamic-file-tree` >= 0.1.66
- `@industry-theme/principal-view-panels` >= 0.10.27
- `@principal-ai/principal-view-core` >= 0.22.1

## See Also

- [Storyboard Discovery Documentation](./STORYBOARD_DISCOVERY_INTEGRATION.md)
- [Panel Event Types](../src/types/panel-events.ts) (for event payload type safety)
- [Dynamic File Tree Types](../../dynamic-file-tree/src/components/StoryboardWorkflowsTree/types.ts)
