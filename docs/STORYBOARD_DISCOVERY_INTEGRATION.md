# Storyboard Discovery Integration Guide

## Overview

As of `@principal-ai/principal-view-core@0.15.1`, the `CanvasDiscovery` system now provides **storyboards** directly, eliminating the need for manual transformation of canvases and workflows.

This guide shows how to integrate the new storyboard discovery system into the **CanvasListPanel** and **CanvasDetailPanel**.

## What's New

### Before (v0.15.0 and earlier)

The discovery system returned separate lists:
- `canvases[]` - Flat list of canvas files
- `executions[]` - Flat list of execution files
- Manual workflow discovery via file tree scanning
- Manual transformation to create storyboard structures

### After (v0.15.1+)

The discovery system now returns:
- `canvases[]` - All canvases (including those in storyboards)
- `executions[]` - All executions (including those in workflows)
- **`storyboards[]`** - ✨ **NEW**: Hierarchical storyboard structures
- `warnings[]` - ✨ **NEW**: Deprecation warnings for legacy structures

### Storyboard Structure

```typescript
interface DiscoveredStoryboard {
  id: string;                          // Unique storyboard identifier
  name: string;                        // Display name from canvas
  path: string;                        // Directory path to storyboard
  basename: string;                    // Folder name
  canvas: DiscoveredCanvas;            // The storyboard's canvas
  workflows: DiscoveredWorkflow[];     // Workflows in this storyboard
  packageName?: string;                // Package name (monorepo)
  packagePath?: string;                // Package path (monorepo)
  scope: 'root' | 'package';           // Scope location
}

interface DiscoveredWorkflow {
  id: string;                          // Unique workflow identifier
  name: string;                        // Workflow folder name
  path: string;                        // Directory path to workflow
  basename: string;                    // Folder name
  storyboardId: string;                // Parent storyboard ID
  executions: DiscoveredExecution[];   // Execution files in this workflow
  packageName?: string;
  packagePath?: string;
  scope: 'root' | 'package';
}
```

## Migration Guide

### Step 1: Update `useCanvasData` Hook

**Current Implementation** (`src/panels/canvas-list/hooks/useCanvasData.ts`):

```typescript
const result = await discovery.current.discover(fileTreeData, {
  includeContent: false,
});

console.log('[useCanvasData] Found canvases:', result.canvases.length);
```

**Updated Implementation**:

```typescript
const result = await discovery.current.discover(fileTreeData, {
  includeContent: false,
});

console.log('[useCanvasData] Found canvases:', result.canvases.length);
console.log('[useCanvasData] Found storyboards:', result.storyboards.length);
console.log('[useCanvasData] Found executions:', result.executions.length);

// Check for deprecation warnings
if (result.warnings.length > 0) {
  console.warn('[useCanvasData] Structure warnings:', result.warnings);
}
```

**Add storyboards to return value**:

```typescript
interface UseCanvasDataReturn {
  canvases: DiscoveredCanvas[];
  storyboards: DiscoveredStoryboard[];  // ✨ NEW
  executions: DiscoveredExecution[];    // ✨ NEW
  warnings: Array<{ path: string; message: string; type: 'deprecation' }>; // ✨ NEW
  isLoading: boolean;
  error: string | null;
  refreshCanvases: () => Promise<void>;
}
```

**Update state and return**:

```typescript
const [canvases, setCanvases] = useState<DiscoveredCanvas[]>(EMPTY_CANVAS_ARRAY);
const [storyboards, setStoryboards] = useState<DiscoveredStoryboard[]>([]);
const [executions, setExecutions] = useState<DiscoveredExecution[]>([]);
const [warnings, setWarnings] = useState<DiscoveryWarning[]>([]);

// In loadCanvases:
setCanvases(sortedCanvases);
setStoryboards(result.storyboards);
setExecutions(result.executions);
setWarnings(result.warnings);

// In return:
return {
  canvases,
  storyboards,
  executions,
  warnings,
  isLoading,
  error,
  refreshCanvases,
};
```

### Step 2: Simplify `useCanvasWorkflowData` Hook

**Current Implementation**:
- Calls `useCanvasData` to get canvases
- Manually discovers workflow files via `WorkflowLoader.findWorkflowFiles()`
- Loads workflow templates by reading files
- Uses `transformToStoryboards()` to combine canvases + workflows

**Simplified Implementation**:

```typescript
export const useCanvasWorkflowData = ({
  context,
  actions,
}: UseCanvasNarrativeDataParams): UseCanvasNarrativeDataReturn => {
  // Get all discovery data including storyboards
  const {
    canvases,
    storyboards,
    executions,
    warnings,
    isLoading: canvasesLoading,
    error: canvasesError,
    refreshCanvases
  } = useCanvasData({ context });

  // Load workflow templates for discovered workflows
  const [workflowTemplates, setWorkflowTemplates] = useState<Map<string, WorkflowTemplate>>(new Map());
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [workflowsError, setWorkflowsError] = useState<string | null>(null);

  const fileTreeSlice = context.getSlice('fileTree');
  const fileTreeData = fileTreeSlice?.data as FileTree | null;
  const fileTreeSha = fileTreeData?.sha;
  const readFile = (actions as { readFile?: (path: string) => Promise<string> }).readFile;

  const lastLoadedSha = useRef<string | undefined>(undefined);

  const loadWorkflowTemplates = useCallback(async () => {
    if (fileTreeSha === lastLoadedSha.current || !readFile) {
      return;
    }

    setWorkflowsLoading(true);
    setWorkflowsError(null);

    try {
      const templates = new Map<string, WorkflowTemplate>();

      // Load templates for all workflows in all storyboards
      for (const storyboard of storyboards) {
        for (const workflow of storyboard.workflows) {
          // Find the workflow.json file in the workflow directory
          const workflowFiles = fileTreeData?.allFiles.filter(f =>
            f.path.startsWith(workflow.path) &&
            f.name.endsWith('.workflow.json')
          ) || [];

          if (workflowFiles.length > 0) {
            const workflowFile = workflowFiles[0];
            try {
              const content = await readFile(workflowFile.path);
              const template = JSON.parse(content) as WorkflowTemplate;
              templates.set(workflow.id, template);
            } catch (error) {
              console.warn(`Failed to load workflow template ${workflowFile.path}:`, error);
            }
          }
        }
      }

      setWorkflowTemplates(templates);
      lastLoadedSha.current = fileTreeSha;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workflow templates';
      setWorkflowsError(errorMessage);
      console.error('[useCanvasWorkflowData] Error loading workflows:', err);
    } finally {
      setWorkflowsLoading(false);
    }
  }, [fileTreeSha, storyboards, fileTreeData, readFile]);

  useEffect(() => {
    loadWorkflowTemplates();
  }, [fileTreeSha, storyboards.length]);

  const refreshData = useCallback(async () => {
    lastLoadedSha.current = undefined;
    await refreshCanvases();
    await loadWorkflowTemplates();
  }, [refreshCanvases, loadWorkflowTemplates]);

  return {
    canvases,
    storyboards,        // ✨ From discovery, not transformed
    executions,         // ✨ From discovery
    workflowTemplates,  // ✨ Loaded separately
    warnings,           // ✨ Deprecation warnings
    isLoading: canvasesLoading || workflowsLoading,
    error: canvasesError || workflowsError,
    refreshData,
  };
};
```

### Step 3: Remove `transformToStoryboards` Utility

**Delete**: `src/panels/canvas-list/utils/transformToStoryboards.ts`

This utility is no longer needed since `CanvasDiscovery` now returns storyboards directly.

### Step 4: Update CanvasListPanel

**Current Implementation**:

```typescript
const { canvases, workflows, isLoading, error } = useCanvasWorkflowData({ context, actions });

// Transform to storyboards
const storyboards = useMemo(() => {
  return transformToStoryboards(canvases, workflows);
}, [canvases, workflows]);
```

**Updated Implementation**:

```typescript
const {
  canvases,
  storyboards,        // ✨ Already in storyboard format!
  workflowTemplates,
  warnings,           // ✨ Show deprecation warnings
  isLoading,
  error
} = useCanvasWorkflowData({ context, actions });

// No transformation needed! Storyboards are ready to use
```

**Display deprecation warnings** (optional):

```typescript
{warnings.length > 0 && (
  <div style={{
    padding: '12px',
    background: theme.colors.warning.background,
    borderBottom: `1px solid ${theme.colors.border}`,
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.colors.warning.text,
      fontSize: '13px',
    }}>
      <AlertCircle size={16} />
      <span>
        {warnings.length} legacy structure{warnings.length > 1 ? 's' : ''} detected.
        Consider migrating to storyboards.
      </span>
    </div>
  </div>
)}
```

### Step 5: Update CanvasDetailPanel

The CanvasDetailPanel can now access the full storyboard hierarchy:

**Access workflow data**:

```typescript
// Find the storyboard containing this canvas
const storyboard = storyboards.find(sb => sb.canvas.id === selectedCanvasId);

// Access workflows in this storyboard
const workflows = storyboard?.workflows || [];

// Access executions for a specific workflow
const workflow = workflows.find(wf => wf.id === selectedWorkflowId);
const executions = workflow?.executions || [];
```

**Display workflow selector**:

```typescript
{storyboard && storyboard.workflows.length > 0 && (
  <select
    value={selectedWorkflowId}
    onChange={(e) => setSelectedWorkflowId(e.target.value)}
  >
    <option value="">All Workflows</option>
    {storyboard.workflows.map(workflow => (
      <option key={workflow.id} value={workflow.id}>
        {workflow.name} ({workflow.executions.length} executions)
      </option>
    ))}
  </select>
)}
```

## File Structure Examples

### New Storyboard Structure (Recommended)

```
.principal-views/
└── checkout/                              # Storyboard folder
    ├── checkout.otel.canvas               # Canvas file
    ├── happy-path/                        # Workflow folder
    │   ├── happy-path.workflow.json       # Workflow definition
    │   └── success-1.otel.json            # Execution file
    └── payment-failures/                  # Another workflow
        ├── payment-failures.workflow.json
        └── declined-1.otel.json
```

**Discovery Result**:

```typescript
{
  storyboards: [
    {
      id: ".principal-views/checkout",
      name: "Checkout Flow",
      path: ".principal-views/checkout",
      basename: "checkout",
      canvas: { /* DiscoveredCanvas */ },
      workflows: [
        {
          id: ".principal-views/checkout/happy-path",
          name: "happy-path",
          path: ".principal-views/checkout/happy-path",
          basename: "happy-path",
          storyboardId: ".principal-views/checkout",
          executions: [
            {
              id: ".principal-views/checkout/happy-path/success-1.otel.json",
              name: "success-1",
              path: ".principal-views/checkout/happy-path/success-1.otel.json",
              workflowId: ".principal-views/checkout/happy-path",
              /* ... */
            }
          ]
        },
        {
          id: ".principal-views/checkout/payment-failures",
          name: "payment-failures",
          /* ... */
        }
      ]
    }
  ]
}
```

### Legacy Flat Structure (Deprecated)

```
.principal-views/
├── checkout.otel.canvas
├── checkout.workflow.json
└── __executions__/
    └── test-1.otel.json
```

**Discovery Result**:

```typescript
{
  canvases: [
    { id: ".principal-views/checkout.otel.canvas", /* ... */ }
  ],
  executions: [
    { id: ".principal-views/__executions__/test-1.otel.json", /* ... */ }
  ],
  storyboards: [],  // Empty - no hierarchical structure
  warnings: [
    {
      path: ".principal-views/checkout.otel.canvas",
      message: "Legacy flat canvas structure is deprecated. Consider migrating to the storyboard structure.",
      type: "deprecation"
    },
    {
      path: ".principal-views/__executions__/test-1.otel.json",
      message: "Legacy __executions__/ directory is deprecated. Consider migrating executions to workflow folders.",
      type: "deprecation"
    }
  ]
}
```

## Benefits of the New System

### 1. **Automatic Hierarchy**
No need to manually group canvases and workflows - the discovery system handles it.

### 2. **Execution Discovery**
Executions are automatically discovered and associated with their workflows.

### 3. **Deprecation Warnings**
Get notified about legacy structures that should be migrated.

### 4. **Type Safety**
All types (`DiscoveredStoryboard`, `DiscoveredWorkflow`, `DiscoveredExecution`) are properly typed and exported from core.

### 5. **Package Awareness**
Works seamlessly in monorepos with package-scoped principal-views.

### 6. **Performance**
Discovery is cached by file tree SHA - no redundant processing.

## Migration Checklist

- [ ] Update `useCanvasData` to return `storyboards`, `executions`, and `warnings`
- [ ] Simplify `useCanvasWorkflowData` to use discovered workflows
- [ ] Remove `transformToStoryboards` utility
- [ ] Update `CanvasListPanel` to use `storyboards` directly
- [ ] Update `CanvasDetailPanel` to navigate storyboard hierarchy
- [ ] Add deprecation warning UI (optional)
- [ ] Test with both legacy and new storyboard structures
- [ ] Update panel documentation

## Testing

### Test with Legacy Structure

Create a test project with the old flat structure to ensure backward compatibility.

### Test with Storyboard Structure

Create a test project with the new hierarchical structure:

```bash
mkdir -p .principal-views/test-storyboard/test-workflow
# Add canvas, workflow, and execution files
```

### Verify Discovery

Check console logs to ensure:
- Storyboards are discovered correctly
- Workflows are nested under storyboards
- Executions are nested under workflows
- Warnings appear for legacy structures

## Support

For issues or questions:
- See `@principal-ai/principal-view-core` documentation
- Check [STORYBOARD_DISCOVERY_DESIGN.md](../../principal-view-core-library/docs/STORYBOARD_DISCOVERY_DESIGN.md)
- Refer to [MIGRATION_GUIDE.md](../../principal-view-core-library/docs/MIGRATION_GUIDE.md) for structure migration

## Version Requirements

- `@principal-ai/principal-view-core` >= 0.15.1
- `@principal-ai/repository-abstraction` >= 0.2.6

## Future Enhancements

Planned features for the discovery system:
- Execution content loading on demand
- Workflow template validation
- Storyboard metadata (README.md support)
- Cross-storyboard references
- Execution search/filtering APIs
