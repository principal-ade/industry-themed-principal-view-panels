# Type Safety Issues - Canvas Detail Panel

## Overview
This document tracks type safety issues encountered in `CanvasDetailPanel.tsx` that required workarounds using `any` casts. These should be properly addressed to improve type safety.

## Issues

### 1. OtelEvent Timestamp Type Mismatch

**Location**: `CanvasDetailPanel.tsx:602`

**Problem**:
```typescript
// OtelEvent.timestamp is string | number, but mapEventToNodeId expects number
const nodeId = mapEventToNodeId({
  name: event.name,
  time: event.timestamp,  // Type error: string | number not assignable to number
  attributes: event.attributes
}, prev.canvas);
```

**Current Workaround**:
```typescript
time: Number(event.timestamp)
```

**Proper Solution Needed**:
- Decide if `OtelEvent.timestamp` should always be `number` or if `mapEventToNodeId` should accept `string | number`
- Update type definitions in `@principal-ai/principal-view-core/browser` accordingly
- The timestamp should likely be standardized as `number` throughout the codebase for consistency

**Impact**: Low - workaround is safe and converts correctly

---

### 2. Canvas Node Data Property Access

**Location**: `CanvasDetailPanel.tsx:623, 741`

**Problem**:
```typescript
// ExtendedCanvasNode union doesn't guarantee .data property exists
const nodePv = (node as any).pv || ((node as any).data as any)?.pv;
```

The `ExtendedCanvasNode` type is a union that includes:
- `ExtendedCanvasTextNode`
- `ExtendedCanvasFileNode`
- `ExtendedCanvasLinkNode`
- `ExtendedCanvasGroupNode`

Not all of these node types have a `data` property, but the JSON Canvas spec supports both formats:
1. Properties directly on the node: `node.pv`
2. Properties nested under data: `node.data.pv`

**Current Workaround**:
```typescript
const nodePv = (node as any).pv || ((node as any).data as any)?.pv;
```

**Proper Solution Needed**:
Two possible approaches:

**Option A: Extend the Type System**
```typescript
// Add a discriminated union or helper type
type NodeWithPV = ExtendedCanvasNode & {
  pv?: PVMetadata;
  data?: {
    pv?: PVMetadata;
  };
};

// Then use type guards
function getNodePV(node: ExtendedCanvasNode): PVMetadata | undefined {
  const nodeWithPV = node as NodeWithPV;
  return nodeWithPV.pv || nodeWithPV.data?.pv;
}
```

**Option B: Normalize on Load**
Normalize the canvas structure when loading so all nodes have a consistent shape:
```typescript
// In ConfigLoader or canvas parser
function normalizeCanvasNode(node: ExtendedCanvasNode): NormalizedCanvasNode {
  return {
    ...node,
    pv: node.pv || (node as any).data?.pv
  };
}
```

**Impact**: Medium - affects all code that accesses node properties, pattern used in multiple places

---

### 3. OTEL Attributes Type Incompatibility

**Location**: `CanvasDetailPanel.tsx:678, 725, 778`

**Problem**:
```typescript
// mapEventToNodeId expects OtelAttributes but we're using Record<string, unknown>
const allEvents: Array<{
  name: string;
  time: number;
  attributes?: Record<string, unknown>  // Too broad!
}> = [];

// Later passed to:
mapEventToNodeId(event, prev.canvas);  // Expects OtelAttributes
```

**Type Definitions**:
```typescript
// Expected by mapEventToNodeId:
type OtelAttributeValue = string | number | boolean | string[] | number[] | boolean[];
type OtelAttributes = Record<string, OtelAttributeValue>;

// What we're using:
type Loose = Record<string, unknown>;
```

**Current Workaround**:
```typescript
attributes?: any
```

**Proper Solution Needed**:

**Option A: Type Assertion Helper**
```typescript
function assertOtelAttributes(attrs: unknown): OtelAttributes {
  // Runtime validation that attributes match expected types
  // Throw or log warning if not
  return attrs as OtelAttributes;
}
```

**Option B: Fix at Source**
Ensure that when creating event objects from execution spans, we properly type the attributes:
```typescript
// In ExecutionLoader or wherever spans are converted to events
const allEvents: Array<ExecutionEvent> = [];  // Use proper type from core

for (const span of spans) {
  if (span.events) {
    for (const event of span.events) {
      allEvents.push({
        name: event.name,
        time: event.time,
        attributes: event.attributes as OtelAttributes  // Assert at source
      });
    }
  }
}
```

**Option C: Make mapEventToNodeId More Permissive**
If the function doesn't actually need strict typing:
```typescript
// In EventNodeMapper.ts
function mapEventToNodeId(
  event: {
    name: string;
    time: number;
    attributes?: Record<string, unknown>  // Accept looser type
  },
  canvas: ExtendedCanvas | null
): string | null
```

**Impact**: Medium - affects event handling throughout the application

---

## Priority Recommendations

1. **High Priority**: Fix Canvas Node Data Property Access (#2)
   - Most pervasive issue
   - Creates uncertainty about data structure
   - Recommend Option B (normalize on load) for consistency

2. **Medium Priority**: Fix OTEL Attributes (#3)
   - Important for type safety
   - Recommend Option B (fix at source) to catch issues early

3. **Low Priority**: Fix Timestamp Type (#1)
   - Current workaround is safe
   - But should standardize for consistency
   - Recommend making timestamp always `number`

## Files to Update

When fixing these issues, the following files will need attention:

1. `@principal-ai/principal-view-core/browser` - Core type definitions
   - `OtelEvent` type
   - `ExtendedCanvasNode` types
   - `ExecutionEvent` type

2. `industry-themed-principal-view-panels`
   - `src/panels/CanvasDetailPanel.tsx` - Remove workarounds
   - `src/panels/execution-viewer/EventNodeMapper.ts` - Update types
   - `src/panels/execution-viewer/ExecutionLoader.ts` - Ensure proper typing

3. Consider adding:
   - Type guards for node property access
   - Runtime validation utilities
   - Helper functions for type conversions

## Testing Considerations

When fixing these issues:
- Test with various canvas formats (both `node.pv` and `node.data.pv`)
- Test with different OTEL event attribute types
- Ensure backward compatibility with existing canvas files
- Add unit tests for type conversion utilities

---

**Document Version**: 1.0
**Last Updated**: 2026-01-21
**Related Issue**: Type safety improvements for Canvas/OTEL integration
