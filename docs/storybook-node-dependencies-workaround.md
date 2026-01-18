# Storybook Browser Bundling - Node.js Dependencies Workaround

## Problem Summary

Storybook fails to build stories when `@principal-ai/codebase-composition` is imported, due to Node.js-specific dependencies (`glob`, `minipass`, `path-scurry`, `minimatch`, `brace-expansion`) being bundled for the browser environment.

### Error Messages Encountered

```
TypeError: Class extends value undefined is not a constructor or null
  at node_modules/minipass/dist/esm/index.js

SyntaxError: The requested module '/node_modules/glob/node_modules/minimatch/node_modules/brace-expansion/index.js'
does not provide an export named 'default'
```

## Root Cause

The `@principal-ai/codebase-composition` package includes modules (`PackageLayerModule.ts`) that use Node.js-specific packages for parsing configuration files:

1. **`js-toml`** - For parsing TOML files (pyproject.toml, Cargo.toml)
2. **`pip-requirements-js`** - For parsing Python requirements.txt files
3. **QualityMetricsCalculator** - Uses `glob` for file discovery

These dependencies are loaded at module import time, causing Vite to attempt pre-bundling them for the browser, which fails because they depend on Node.js built-ins.

### Dependency Chain

```
@principal-ai/codebase-composition
  └─> PackageLayerModule
      ├─> js-toml
      ├─> pip-requirements-js
      └─> QualityMetricsCalculator
          └─> @principal-ai/codebase-quality-lenses
              └─> glob
                  ├─> minipass
                  ├─> path-scurry
                  └─> minimatch
                      └─> brace-expansion
```

## Attempted Solutions

### 1. Package.json Conditional Exports (v0.2.35)
**Attempted:** Added `"browser"` conditional export to `@principal-ai/codebase-composition`
**Result:** Failed - browser export still loaded Node.js dependencies

### 2. Dynamic Requires with Try-Catch (v0.2.36, v0.2.37, v0.2.38)
**Attempted:** Made `js-toml`, `QualityMetricsCalculator`, and `pip-requirements-js` optional via dynamic `require()` inside try-catch blocks
**Result:** Failed - Vite's static analysis still detected and pre-bundled the dependencies

### 3. Vite optimizeDeps.exclude
**Attempted:** Added Node.js packages to Vite's `optimizeDeps.exclude` list
**Result:** Failed - exclusion happens after Vite's module resolution phase

### 4. Virtual Module Plugin
**Attempted:** Created custom Vite plugin to intercept and stub Node.js package imports
**Result:** Failed - plugin's `resolveId` hook runs after Vite's dependency pre-bundling

### 5. Vite resolve.alias (CURRENT SOLUTION ✅)
**Implemented:** Redirect Node.js packages to empty stub module using `resolve.alias`
**Result:** Success - aliasing happens before pre-bundling phase

## Current Workaround

### Files Modified

#### `.storybook/node-stub.js` (NEW)
Empty stub module that provides exports for Node.js packages:

```javascript
export default {};
export const parse = () => ({});
export const load = () => ({});
export const Minipass = class {};
export const glob = () => [];
export const minimatch = () => false;
```

#### `.storybook/main.ts` (MODIFIED)
Added `resolve.alias` configuration to redirect Node.js packages:

```typescript
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stubPath = path.resolve(__dirname, 'node-stub.js');

async viteFinal(config) {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      conditions: ['browser', 'import', 'module', 'default'],
      alias: {
        ...config.resolve?.alias,
        'glob': stubPath,
        'minipass': stubPath,
        'path-scurry': stubPath,
        'minimatch': stubPath,
        'brace-expansion': stubPath,
        'balanced-match': stubPath,
        'concat-map': stubPath,
      },
    },
    optimizeDeps: {
      exclude: [
        '@opentelemetry/api',
        '@principal-ai/codebase-composition',
        'glob', 'minipass', 'path-scurry', 'minimatch', 'brace-expansion',
      ],
    },
  };
}
```

### Why This Works

- **`resolve.alias`** runs during Vite's module resolution phase, BEFORE dependency pre-bundling
- When Vite encounters `import 'glob'`, it immediately resolves it to our stub module
- The stub module is browser-compatible and provides empty implementations
- No Node.js code ever gets bundled for the browser

## Proper Solution (Future Work)

This workaround is functional but not ideal. Here are better long-term solutions:

### Option 1: Split Browser and Node Bundles (RECOMMENDED)

Refactor `@principal-ai/codebase-composition` to provide separate entry points:

```json
{
  "exports": {
    ".": {
      "browser": "./dist/browser.js",
      "node": "./dist/node.js",
      "default": "./dist/index.js"
    }
  }
}
```

**`src/browser.ts`** - Export only browser-safe modules:
```typescript
export { ExecutionFileDiscovery } from './modules/ExecutionFileDiscovery';
export type * from './types';
// Do NOT export PackageLayerModule or anything using Node.js deps
```

**`src/node.ts`** - Export all modules including Node.js ones:
```typescript
export * from './browser';
export { PackageLayerModule } from './modules/PackageLayerModule';
export { QualityMetricsCalculator } from './helpers/QualityMetricsCalculator';
```

### Option 2: Lazy Loading with Dynamic Imports

Change from static requires to async dynamic imports:

```typescript
// Instead of:
const TOML = require('js-toml');

// Use:
let TOML: any = null;
async function getTomlParser() {
  if (!TOML) {
    TOML = await import('js-toml');
  }
  return TOML;
}
```

This won't work for browser builds, but could be combined with Option 1.

### Option 3: Replace Node.js Dependencies

- Replace `js-toml` with a browser-compatible TOML parser
- Replace `glob` with `fast-glob` which has better browser support
- Make `pip-requirements-js` truly optional (only use in Node.js environments)

### Option 4: Plugin Architecture

Make parsers pluggable so they can be injected at runtime:

```typescript
class PackageLayerModule {
  constructor(
    private parsers?: {
      toml?: (content: string) => any;
      pip?: (content: string) => any;
    }
  ) {}
}
```

Browser builds don't provide parsers, Node.js builds do.

## Impact Assessment

### What Works Now
- Storybook builds successfully ✅
- Stories render without errors ✅
- Browser-safe functionality (ExecutionFileDiscovery) works ✅

### What Doesn't Work
- Any functionality requiring Node.js file system operations in Storybook
- Package detection/parsing (TOML, requirements.txt) in browser
- Quality metrics calculation in Storybook

### Side Effects
- Additional maintenance burden (stub file must match package exports)
- Obscures actual dependencies in browser builds
- May hide runtime errors if browser code tries to use stubbed packages

## Related Files

- `.storybook/main.ts:5-6,34-44` - Alias configuration
- `.storybook/node-stub.js` - Stub module
- `/Users/griever/Developer/new-panels/codebase-composition/src/modules/PackageLayerModule.ts` - Source of Node.js dependencies
- `/Users/griever/Developer/new-panels/codebase-composition/package.json` - Package exports configuration

## Version History

- **v0.2.35** - Added browser export (failed)
- **v0.2.36** - Made js-toml optional (failed)
- **v0.2.37** - Made QualityMetricsCalculator optional (failed)
- **v0.2.38** - Made pip-requirements-js optional (failed)
- **Current** - Vite resolve.alias workaround (working)

## Recommendations

1. **Short-term:** Keep current workaround, document it clearly (this file)
2. **Medium-term:** Implement Option 1 (split browser/node bundles) in `codebase-composition`
3. **Long-term:** Consider Plugin Architecture (Option 4) for maximum flexibility

## References

- [Vite Module Resolution](https://vitejs.dev/guide/dep-pre-bundling.html)
- [Package.json Conditional Exports](https://nodejs.org/api/packages.html#conditional-exports)
- [Storybook Vite Configuration](https://storybook.js.org/docs/react/builders/vite)
