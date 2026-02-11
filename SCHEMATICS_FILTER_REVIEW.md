# Schematics Tree Filter Updates - Review

## Overview
Updated to use the new `@principal-ade/dynamic-file-tree` API with improved filtering capabilities.

## Key Changes in dynamic-file-tree

### 1. WorkflowFilterMode Type
**Before**: Boolean `showOnlyVersionsWithTraces`
**After**: Enum `WorkflowFilterMode` with 3 modes:
- `'all'` - Show all workflows (default)
- `'with-traces'` - Show only workflows that have traces
- `'without-traces'` - Show only workflows without traces (NEW!)

**Benefits**:
- More flexible filtering options
- Clearer intent in code
- Supports future filter modes (e.g., 'only-covered', 'only-uncovered')

### 2. Simplified Props
**Removed**:
- `showOnlyVersionsWithTraces?: boolean`
- `traceVersionsSet?: Set<string>`

**Added**:
- `workflowFilterMode?: WorkflowFilterMode`

**Kept**:
- `traceWorkflowsSet?: Set<string>` (this is what matters for filtering)

**Why**: Filtering is purely workflow-based, so version-level tracking was redundant.

### 3. Version Prefix for IDs
**Before**: `id: 'workflow:checkout-flow'`
**After**: `id: 'workflow:repo@sha:checkout-flow'`

**Why**: Same workflow ID can appear in multiple versions. Prefixing with version key ensures unique IDs in the tree.

### 4. Tree API Update
**Before**: `<Tree initialData={treeData} />`
**After**: `<Tree data={treeData} />`

**Why**: Clearer prop name - `data` better represents dynamic tree data.

## Updates in TraceListPanel

### 1. State Management
```typescript
// Before
const [showOnlyVersionsWithTraces, setShowOnlyVersionsWithTraces] = useState(false);

// After
const [workflowFilterMode, setWorkflowFilterMode] = useState<WorkflowFilterMode>('all');
```

### 2. Trace Data Extraction
```typescript
// Before - Tracked both versions and workflows
const { traceVersionsSet, traceWorkflowsSet } = useMemo(() => {
  const versionSet = new Set<string>();
  const workflowSet = new Set<string>();
  // ... extract both
  return { traceVersionsSet, traceWorkflowsSet };
}, [traces]);

// After - Only track workflows
const traceWorkflowsSet = useMemo(() => {
  const workflowSet = new Set<string>();
  traces.forEach(trace => {
    if (trace.matchedWorkflow?.workflowId) {
      workflowSet.add(trace.matchedWorkflow.workflowId);
    }
  });
  return workflowSet;
}, [traces]);
```

**Why**: Version-level tracking was unnecessary. Filtering happens at workflow level, and version indicators are derived from whether they contain traced workflows.

### 3. Filter UI
```typescript
// Before
<input
  type="checkbox"
  checked={showOnlyVersionsWithTraces}
  onChange={(e) => setShowOnlyVersionsWithTraces(e.target.checked)}
/>

// After
<input
  type="checkbox"
  checked={workflowFilterMode === 'with-traces'}
  onChange={(e) => setWorkflowFilterMode(e.target.checked ? 'with-traces' : 'all')}
/>
```

Simple checkbox that toggles between showing all workflows vs only traced workflows.

### 4. Tree Props
```typescript
// Before
<StoryboardWorkflowsTreeCore
  showOnlyVersionsWithTraces={showOnlyVersionsWithTraces}
  traceVersionsSet={traceVersionsSet}
  traceWorkflowsSet={traceWorkflowsSet}
/>

// After
<StoryboardWorkflowsTreeCore
  workflowFilterMode={workflowFilterMode}
  traceWorkflowsSet={traceWorkflowsSet}
/>
```

Cleaner API with fewer props and clearer intent.

## Behavior

### Unfiltered (workflowFilterMode='all')
Shows complete tree with indicators:
```
🔀 repo@abc12345  ●
  └─ 📊 Checkout Flow  ●
     └─ 📁 Workflows
        └─ ⚡ Standard Checkout  ●
        └─ ⚡ Express Checkout  ○
        └─ ⚡ Guest Checkout  ○

🔀 repo@def67890  ○
  └─ 📊 Checkout Flow v2  ○
     └─ 📁 Workflows
        └─ ⚡ Enhanced Checkout  ○
```

### Filtered (workflowFilterMode='with-traces')
Shows only workflows with traces:
```
🔀 repo@abc12345  ●
  └─ 📊 Checkout Flow  ●
     └─ 📁 Workflows
        └─ ⚡ Standard Checkout  ●
```

Versions, storyboards, and workflows without traces are hidden.

## Migration Benefits

1. **Simpler Logic**: Removed version-level tracking complexity
2. **Fewer Props**: Reduced API surface
3. **Extensible**: Easy to add new filter modes ('without-traces', 'only-covered', etc.)
4. **Unique IDs**: No ID collisions when same workflows appear in multiple versions
5. **Clearer Intent**: `workflowFilterMode` is more explicit than boolean flag

## Future Enhancements

With the new `WorkflowFilterMode`, we can easily add:
- Filter selector UI (dropdown instead of checkbox)
- `'without-traces'` mode to find workflows that need coverage
- `'only-covered'` mode to show fully tested workflows
- Combined filters (e.g., traced AND covered)

## Testing Checklist

- [x] Tree renders correctly with `workflowFilterMode='all'`
- [x] Filter checkbox toggles between 'all' and 'with-traces'
- [x] Indicators show correctly (●/○) for workflows
- [x] Workflows without traces hidden when filtered
- [x] Empty versions/storyboards hidden when filtered
- [x] No duplicate IDs in tree (check via React DevTools)
- [x] Click handlers work on filtered nodes
- [x] Selection state preserved when toggling filter

## Conclusion

The refactor simplifies the filtering logic while making it more powerful and extensible. The API is cleaner and the behavior is clearer to users.
