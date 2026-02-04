# Library Discovery Guide

## Overview

`LibraryDiscovery` is a class from `@principal-ai/principal-view-core` that discovers all `library.yaml` files across a monorepo's packages and loads their resources, particularly OTEL (OpenTelemetry) service configurations.

This guide shows how to use `LibraryDiscovery` with a `FileTree` to discover service names and resources for trace routing in dev tools.

## Key Concepts

### What LibraryDiscovery Does

1. **Package-Aware Discovery**: Uses `PackageLayerModule` from `@principal-ai/codebase-composition` to find all packages in a monorepo
2. **Library Loading**: Loads `.principal-views/library.yaml` from each package
3. **Resource Extraction**: Extracts OTEL resource attributes (especially `service.name`) from each library
4. **Multi-Service Support**: Handles repositories where a single package can define multiple services

### Library.yaml Structure

```yaml
version: "1.0.0"
name: "My Service"

# Service resource registry
resources:
  web-service:
    service.name: "web-service"
    service.version: "1.0.0"
    deployment.environment: "development"

  api-worker:
    service.name: "api-worker"
    service.version: "1.0.0"
    deployment.environment: "development"

nodeComponents: {}
edgeComponents: {}
```

## Usage

### Basic Example

```typescript
import { LibraryDiscovery } from '@principal-ai/principal-view-core';
import { createRendererFileSystemAdapter } from '../utils/RendererFileSystemAdapter';
import { RepositoryMonitoringService } from '../main-process-api/RepositoryMonitoringService';

async function discoverServices(repositoryPath: string): Promise<string[]> {
  // 1. Get file tree from repository monitoring service
  const fileTree = await RepositoryMonitoringService.getFileTree(repositoryPath);

  if (!fileTree) {
    console.warn('No file tree available');
    return [];
  }

  // 2. Create file system adapter (renderer-safe)
  const fsAdapter = await createRendererFileSystemAdapter();

  // 3. Create discovery instance
  const discovery = new LibraryDiscovery(fsAdapter);

  // 4. Discover all libraries and services
  const result = await discovery.discover(fileTree, {
    repositoryPath, // IMPORTANT: Pass repository path for correct resolution
  });

  // 5. Get all service names
  console.log('Discovered services:', result.allServiceNames);
  console.log('Found libraries:', result.libraries.length);

  if (result.errors.length > 0) {
    console.error('Discovery errors:', result.errors);
  }

  return result.allServiceNames;
}
```

### Getting OTEL Resources

```typescript
async function getOtelResources(
  repositoryPath: string
): Promise<Record<string, ResourceAttributes>> {
  const fileTree = await RepositoryMonitoringService.getFileTree(repositoryPath);
  if (!fileTree) return {};

  const fsAdapter = await createRendererFileSystemAdapter();
  const discovery = new LibraryDiscovery(fsAdapter);

  const result = await discovery.discover(fileTree, { repositoryPath });

  // Flatten all resources from all libraries
  const allResources: Record<string, ResourceAttributes> = {};

  for (const lib of result.libraries) {
    if (lib.library.resources) {
      for (const [serviceId, attrs] of Object.entries(lib.library.resources)) {
        // Prefix with package name to avoid collisions
        const key = lib.packageName === 'root'
          ? serviceId
          : `${lib.packageName}/${serviceId}`;

        allResources[key] = attrs;
      }
    }
  }

  return allResources;
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';
import type { FileTree } from '@principal-ai/repository-abstraction';

function useServiceNames(repositoryPath: string): {
  serviceNames: string[];
  loading: boolean;
  error: Error | null;
} {
  const [serviceNames, setServiceNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const fileTree = await RepositoryMonitoringService.getFileTree(repositoryPath);
        if (!fileTree) {
          if (mounted) {
            setServiceNames([]);
            setLoading(false);
          }
          return;
        }

        const fsAdapter = await createRendererFileSystemAdapter();
        const discovery = new LibraryDiscovery(fsAdapter);
        const result = await discovery.discover(fileTree, { repositoryPath });

        if (mounted) {
          setServiceNames(result.allServiceNames);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setServiceNames([]);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [repositoryPath]);

  return { serviceNames, loading, error };
}
```

## API Reference

### LibraryDiscovery Class

#### Constructor

```typescript
constructor(fsAdapter: FileSystemAdapter)
```

- `fsAdapter`: File system adapter (use `createRendererFileSystemAdapter()` in renderer process)

#### Methods

##### discover()

```typescript
async discover(
  fileTree: FileTree,
  options?: {
    fileReader?: (path: string) => Promise<string>;
    repositoryPath?: string;
  }
): Promise<LibraryDiscoveryResult>
```

**Parameters:**
- `fileTree`: FileTree from `RepositoryMonitoringService.getFileTree()`
- `options.fileReader`: Optional custom file reader for package.json parsing
- `options.repositoryPath`: **CRITICAL** - Absolute path to repository root for correct file resolution

**Returns:** `LibraryDiscoveryResult`

```typescript
interface LibraryDiscoveryResult {
  libraries: DiscoveredLibrary[];      // All discovered libraries with metadata
  allServiceNames: string[];           // Flattened list of all service names
  errors: Array<{                      // Any errors encountered
    path: string;
    error: string;
  }>;
}
```

##### clearCache()

```typescript
clearCache(): void
```

Clears the internal package discovery cache. Useful when file tree changes.

### Types

#### DiscoveredLibrary

```typescript
interface DiscoveredLibrary {
  path: string;              // Full path to library.yaml file
  packageName: string;       // Package name (or 'root' for non-package)
  packagePath: string;       // Full path to package directory
  library: ComponentLibrary; // Loaded library content
  serviceNames: string[];    // Service names from this library
}
```

#### ResourceAttributes

```typescript
interface ResourceAttributes {
  'service.name': string;              // Required
  'service.version'?: string;
  'service.namespace'?: string;
  'deployment.environment'?: string;
  'k8s.namespace.name'?: string;
  'k8s.deployment.name'?: string;
  'k8s.pod.name'?: string;
  'cloud.provider'?: string;
  'cloud.region'?: string;
  [key: string]: string | undefined;   // Allow arbitrary OTEL attributes
}
```

## Common Patterns

### Pattern 1: Service Selector Dropdown

```typescript
// In your component
const [availableServices, setAvailableServices] = useState<string[]>([]);
const [selectedService, setSelectedService] = useState<string>('all');

useEffect(() => {
  async function loadServices() {
    const fileTree = await RepositoryMonitoringService.getFileTree(repositoryPath);
    if (!fileTree) return;

    const fsAdapter = await createRendererFileSystemAdapter();
    const discovery = new LibraryDiscovery(fsAdapter);
    const result = await discovery.discover(fileTree, { repositoryPath });

    setAvailableServices(result.allServiceNames);

    // Auto-select first service if available
    if (result.allServiceNames.length > 0) {
      setSelectedService(result.allServiceNames[0]);
    }
  }

  loadServices();
}, [repositoryPath]);

// In your JSX
<select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
  <option value="all">All Services</option>
  {availableServices.map(name => (
    <option key={name} value={name}>
      {name}
    </option>
  ))}
</select>
```

### Pattern 2: Trace Filtering by Service

```typescript
// Use the selected service name for OTEL MessagePort routing
useEffect(() => {
  // Register telemetry port with selected service
  const sourceUrl = selectedService === 'all' ? undefined : selectedService;

  OtelCollectorService.registerPort(windowId, sourceUrl || 'principal-ade')
    .then(() => {
      console.log('Registered for traces from:', sourceUrl || 'all services');
    });

  return () => {
    OtelCollectorService.unregisterPort(windowId, sourceUrl || 'principal-ade');
  };
}, [selectedService]);
```

### Pattern 3: Multi-Service Status Display

```typescript
const { serviceNames, loading } = useServiceNames(repositoryPath);

if (loading) return <div>Discovering services...</div>;

return (
  <div>
    <h3>Discovered Services ({serviceNames.length})</h3>
    <ul>
      {serviceNames.map(name => (
        <li key={name}>
          <ServiceStatus serviceName={name} />
        </li>
      ))}
    </ul>
  </div>
);
```

## Important Notes

### ⚠️ Always Pass repositoryPath

The `repositoryPath` option is **critical** for correct operation:

```typescript
// ❌ WRONG - Will default to current working directory (electron app dir)
const result = await discovery.discover(fileTree);

// ✅ CORRECT - Explicitly passes repository path
const result = await discovery.discover(fileTree, { repositoryPath });
```

Without `repositoryPath`, LibraryDiscovery will use the current working directory (`.`), which in an Electron renderer process is typically the electron app directory, not the user's repository.

### FileTree Caching

The `RepositoryMonitoringService` caches file trees. If you make changes to library.yaml files during development:

1. The file tree itself (paths/metadata) is cached
2. But LibraryDiscovery reads file contents fresh using the FileSystemAdapter
3. If you add/remove library.yaml files, you may need to reload the dev workspace window

### Error Handling

Always check `result.errors` after discovery:

```typescript
const result = await discovery.discover(fileTree, { repositoryPath });

if (result.errors.length > 0) {
  console.error('Discovery encountered errors:');
  result.errors.forEach(({ path, error }) => {
    console.error(`  ${path}: ${error}`);
  });
}
```

Common errors:
- Missing required field `service.name` in resource entry
- Invalid YAML syntax in library.yaml
- Invalid resource structure (not an object)

## Migration from Previous Patterns

### Before (Manual File Reading)

```typescript
// Old approach - manually reading single library.yaml
const libraryPath = path.join(repositoryPath, '.principal-views', 'library.yaml');
const content = await fs.readFile(libraryPath, 'utf-8');
const library = yaml.parse(content);
const serviceName = library.resources?.['my-service']?.['service.name'];
```

### After (LibraryDiscovery)

```typescript
// New approach - discovers all packages automatically
const fileTree = await RepositoryMonitoringService.getFileTree(repositoryPath);
const fsAdapter = await createRendererFileSystemAdapter();
const discovery = new LibraryDiscovery(fsAdapter);
const result = await discovery.discover(fileTree, { repositoryPath });

// Get all service names across all packages
const allServiceNames = result.allServiceNames;
```

### Benefits

1. **Monorepo Support**: Automatically finds libraries in all packages
2. **Type Safety**: Returns typed `ResourceAttributes`
3. **Validation**: Built-in validation of library.yaml structure
4. **Caching**: Package discovery is cached by file tree SHA
5. **Error Handling**: Structured error reporting

## Troubleshooting

### Issue: No Services Found

**Check:**
1. Does `.principal-views/library.yaml` exist in repository?
2. Does `library.yaml` have a `resources` field?
3. Does each resource entry have `service.name`?
4. Did you pass `repositoryPath` to `discover()`?

### Issue: Wrong Library Being Read

**Cause:** Missing `repositoryPath` parameter

**Fix:**
```typescript
// Always pass repositoryPath
const result = await discovery.discover(fileTree, { repositoryPath });
```

### Issue: Services Not Updating

**Cause:** File tree cache not refreshing

**Fix:** Reload the dev workspace window or trigger a file tree rebuild

## See Also

- [OTEL Event Structure](./OTEL-EVENT-STRUCTURE.md) - Understanding trace/span data
- [Trace Viewer Integration](./TRACE-VIEWER-INTEGRATION.md) - Using traces in panels
- [@principal-ai/principal-view-core](https://www.npmjs.com/package/@principal-ai/principal-view-core) - Package documentation
- [@principal-ai/codebase-composition](https://www.npmjs.com/package/@principal-ai/codebase-composition) - PackageLayerModule docs
