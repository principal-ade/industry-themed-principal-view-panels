# Storyboard Discovery - Quick Reference

## Installation

```bash
npm install @principal-ai/principal-view-core@^0.15.1
```

## Basic Usage

### 1. Import Types

```typescript
import {
  CanvasDiscovery,
  type DiscoveredCanvas,
  type DiscoveredStoryboard,
  type DiscoveredWorkflow,
  type DiscoveredExecution,
  type CanvasDiscoveryResult,
} from '@principal-ai/principal-view-core';
import type { FileTree } from '@principal-ai/repository-abstraction';
```

### 2. Discover Storyboards

```typescript
const discovery = new CanvasDiscovery();

const result: CanvasDiscoveryResult = await discovery.discover(fileTree, {
  includeContent: false,  // Set true to load canvas content
});

// Access discovered data
const {
  canvases,      // All canvas files
  storyboards,   // Hierarchical storyboard structures
  executions,    // All execution files
  warnings,      // Deprecation warnings
  errors,        // Discovery errors
} = result;
```

### 3. Navigate Storyboard Hierarchy

```typescript
// Find a storyboard
const storyboard = storyboards.find(sb => sb.name === 'checkout');

// Access its canvas
const canvas = storyboard.canvas;

// List workflows
console.log(`Found ${storyboard.workflows.length} workflows`);

// Access workflow executions
storyboard.workflows.forEach(workflow => {
  console.log(`${workflow.name}: ${workflow.executions.length} executions`);

  workflow.executions.forEach(execution => {
    console.log(`  - ${execution.name}`);
  });
});
```

## Data Structure

```typescript
// Storyboard (feature/component)
{
  id: ".principal-views/checkout",
  name: "Checkout Flow",
  path: ".principal-views/checkout",
  basename: "checkout",
  canvas: { /* canvas file */ },
  workflows: [
    // Workflow (scenario/variation)
    {
      id: ".principal-views/checkout/happy-path",
      name: "happy-path",
      path: ".principal-views/checkout/happy-path",
      storyboardId: ".principal-views/checkout",
      executions: [
        // Execution (test run)
        {
          id: ".principal-views/checkout/happy-path/success-1.otel.json",
          name: "success-1",
          workflowId: ".principal-views/checkout/happy-path",
          /* ... */
        }
      ]
    }
  ],
  packageName: "my-package",  // For monorepos
  scope: "package"            // or "root"
}
```

## Common Patterns

### Display Storyboard Tree

```typescript
function StoryboardTree({ storyboards }: { storyboards: DiscoveredStoryboard[] }) {
  return (
    <ul>
      {storyboards.map(storyboard => (
        <li key={storyboard.id}>
          <strong>{storyboard.name}</strong>
          <ul>
            {storyboard.workflows.map(workflow => (
              <li key={workflow.id}>
                {workflow.name} ({workflow.executions.length} executions)
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
```

### Find Execution by Path

```typescript
function findExecution(
  storyboards: DiscoveredStoryboard[],
  executionPath: string
): DiscoveredExecution | undefined {
  for (const storyboard of storyboards) {
    for (const workflow of storyboard.workflows) {
      const execution = workflow.executions.find(e => e.path === executionPath);
      if (execution) return execution;
    }
  }
  return undefined;
}
```

### Group by Package (Monorepo)

```typescript
function groupByPackage(storyboards: DiscoveredStoryboard[]) {
  const packages = new Map<string, DiscoveredStoryboard[]>();

  for (const storyboard of storyboards) {
    const key = storyboard.packageName || 'root';
    if (!packages.has(key)) {
      packages.set(key, []);
    }
    packages.get(key)!.push(storyboard);
  }

  return packages;
}
```

### Handle Deprecation Warnings

```typescript
if (result.warnings.length > 0) {
  console.warn('⚠️ Legacy structures found:');
  result.warnings.forEach(warning => {
    console.warn(`  ${warning.path}`);
    console.warn(`    ${warning.message}`);
  });
  console.warn('See migration guide: docs/MIGRATION_GUIDE.md');
}
```

### Cache Discovery Results

```typescript
// Discovery automatically caches by fileTree.sha
const discovery = new CanvasDiscovery();

// First call - performs discovery
const result1 = await discovery.discover(fileTree);

// Second call with same fileTree.sha - returns cached result
const result2 = await discovery.discover(fileTree);

// Force refresh
discovery.clearCache();
const result3 = await discovery.discover(fileTree);
```

## React Hook Example

```typescript
function useStoryboards(fileTree: FileTree | null) {
  const [storyboards, setStoryboards] = useState<DiscoveredStoryboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [warnings, setWarnings] = useState<string[]>([]);

  const discoveryRef = useRef(new CanvasDiscovery());

  useEffect(() => {
    async function load() {
      if (!fileTree) return;

      setIsLoading(true);

      try {
        const result = await discoveryRef.current.discover(fileTree);
        setStoryboards(result.storyboards);
        setWarnings(result.warnings.map(w => w.message));
      } catch (error) {
        console.error('Discovery failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [fileTree?.sha]);

  return { storyboards, isLoading, warnings };
}
```

## File Structure Patterns

### ✅ Recommended: Storyboard Structure

```
.principal-views/
└── feature-name/                    # Storyboard folder
    ├── feature-name.otel.canvas     # Canvas
    ├── workflow-1/                  # Workflow folder
    │   ├── workflow-1.workflow.json # Workflow definition
    │   └── test-1.otel.json         # Execution
    └── workflow-2/
        ├── workflow-2.workflow.json
        └── test-2.otel.json
```

### ⚠️ Legacy: Flat Structure (Deprecated)

```
.principal-views/
├── feature.otel.canvas
├── feature.workflow.json
└── __executions__/
    └── test.otel.json
```

## CLI Commands

### Check for Legacy Structures

```bash
npx @principal-ai/principal-view-cli doctor
```

Output:
```
⚠ File Structure Warnings:
  ⚠ .principal-views/old-canvas.otel.canvas
    Legacy flat canvas structure is deprecated...
  ⚠ .principal-views/__executions__/test.otel.json
    Legacy __executions__/ directory is deprecated...

⚠ 2 warning(s) found
  See: docs/MIGRATION_GUIDE.md for migration instructions
```

## TypeScript Types

```typescript
// Main discovery result
interface CanvasDiscoveryResult {
  canvases: DiscoveredCanvas[];
  executions: DiscoveredExecution[];
  storyboards: DiscoveredStoryboard[];
  errors: Array<{ path: string; error: string }>;
  warnings: Array<{ path: string; message: string; type: 'deprecation' }>;
}

// Storyboard
interface DiscoveredStoryboard {
  id: string;
  name: string;
  path: string;
  basename: string;
  canvas: DiscoveredCanvas;
  workflows: DiscoveredWorkflow[];
  packageName?: string;
  packagePath?: string;
  scope: 'root' | 'package';
}

// Workflow
interface DiscoveredWorkflow {
  id: string;
  name: string;
  path: string;
  basename: string;
  storyboardId: string;
  executions: DiscoveredExecution[];
  packageName?: string;
  packagePath?: string;
  scope: 'root' | 'package';
}

// Execution
interface DiscoveredExecution {
  id: string;
  name: string;
  path: string;
  type: 'otel' | 'json';
  workflowId?: string;
  packageName?: string;
  packagePath?: string;
  scope: 'root' | 'package';
}
```

## Performance Tips

1. **Cache discovery instance**: Create `CanvasDiscovery` once, reuse it
2. **Use SHA-based caching**: Discovery is cached by `fileTree.sha`
3. **Lazy load content**: Set `includeContent: false` for listing, load content on-demand
4. **Debounce refreshes**: Avoid calling `clearCache()` on every render

## Troubleshooting

### Storyboards array is empty

**Check**:
- File structure follows the storyboard pattern (canvas in folder with workflow subfolders)
- Canvas files have `.otel.canvas` or `.canvas` extension
- Workflow folders contain `.workflow.json` files

### Warnings not showing

**Check**:
- Using `@principal-ai/principal-view-core@0.15.1` or later
- Accessing `result.warnings` array
- Legacy files exist in flat structure

### Executions not discovered

**Check**:
- Execution files are in workflow folders (not `__executions__/`)
- Files have `.otel.json` or `.json` extension
- Files are in the file tree

## More Resources

- [Full Integration Guide](./STORYBOARD_DISCOVERY_INTEGRATION.md)
- [Storyboard Design](../../principal-view-core-library/docs/STORYBOARD_DISCOVERY_DESIGN.md)
- [Migration Guide](../../principal-view-core-library/docs/MIGRATION_GUIDE.md)
