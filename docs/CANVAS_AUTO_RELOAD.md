# Canvas Auto-Reload Feature

## Overview

Implemented timestamp-based auto-reload for canvas files when they change on disk. This allows panels to automatically refresh when canvas or narrative files are modified externally.

**Date Implemented:** 2026-01-24
**Library Version:** 0.4.21+
**Dependencies:** `@principal-ai/repository-abstraction` (FileInfo with lastModified)

---

## How It Works

### Architecture

```
File Change on Disk
    ↓
File Watcher (Electron Main Process - chokidar)
    ↓
Repository Monitoring Service
    ↓
workspace:changed Event (IPC → Renderer)
    ↓
Panel Context (FileTree updated)
    ↓
Panel Component (checks timestamp)
    ↓
Auto-Reload if timestamp changed
```

### Key Components

1. **FileInfo Type** (`@principal-ai/repository-abstraction/src/fileTree.ts`)
   - Contains `lastModified: Date` for each file
   - Also includes `size`, `path`, `name`, `extension`

2. **CanvasListPanel**
   - Looks up FileInfo for selected canvas/narrative
   - Emits events with `canvasFileInfo` and `narrativeFileInfo`

3. **CanvasDetailPanel / CanvasEditorPanel**
   - Receives FileInfo props
   - Stores `lastModified.getTime()` in refs
   - Listens for `workspace:changed` events
   - Compares timestamps and auto-reloads if different

---

## Changes Made

### Library: `@industry-theme/principal-view-panels`

#### 1. Fixed Type Annotations
**Files:**
- `src/panels/canvas-list/hooks/useCanvasData.ts:33`
- `src/panels/canvas-list/hooks/useCanvasNarrativeData.ts:43`

**Before:**
```typescript
const fileTreeData = fileTreeSlice?.data as {
  fileTree?: FileTree;
  allFiles?: Array<{ path?: string; relativePath?: string; name?: string }>;
  sha?: string;
} | null;
```

**After:**
```typescript
const fileTreeData = fileTreeSlice?.data as FileTree | null;
// Now properly accesses allFiles: FileInfo[] with lastModified!
```

#### 2. CanvasListPanel Updates
**File:** `src/panels/CanvasListPanel.tsx`

**Added:**
```typescript
import type { FileTree, FileInfo } from '@principal-ai/repository-abstraction';

// Helper to find FileInfo for a canvas path
const getCanvasFileInfo = useCallback((canvasPath: string): FileInfo | undefined => {
  return fileTreeData?.allFiles.find(f =>
    f.path === canvasPath || f.relativePath === canvasPath
  );
}, [fileTreeData]);
```

**Event Payload Enhanced:**
```typescript
events.emit({
  type: 'custom',
  source: 'canvas-list-panel',
  timestamp: Date.now(),
  payload: {
    action: 'selectCanvas',
    canvasId: canvas.id,
    canvas,
    canvasFileInfo,           // ✅ Added
    narrativeId,
    narrative,
    narrativeTemplate,
    narrativeFileInfo,        // ✅ Added
  },
});
```

#### 3. CanvasDetailPanel Updates
**File:** `src/panels/CanvasDetailPanel.tsx`

**Interface Updated:**
```typescript
export interface CanvasDetailPanelProps extends PanelComponentProps {
  canvasFileInfo?: FileInfo | null;        // ✅ Added
  narrativeFileInfo?: FileInfo | null;     // ✅ Added
  // ... other props
}
```

**Timestamp Tracking:**
```typescript
// Track file timestamps for auto-reload on changes
const canvasFileTimestampRef = useRef<number | null>(null);
const narrativeFileTimestampRef = useRef<number | null>(null);

// Update timestamp refs when FileInfo props change
useEffect(() => {
  if (canvasFileInfoProp?.lastModified) {
    canvasFileTimestampRef.current = canvasFileInfoProp.lastModified.getTime();
  }
}, [canvasFileInfoProp]);
```

**Auto-Reload Logic:**
```typescript
useEffect(() => {
  if (!events || !canvasPathProp) return;

  const handleWorkspaceChange = (event: any) => {
    const ctx = contextRef.current;
    const fileTreeSlice = ctx.getSlice('fileTree');
    const fileTreeData = fileTreeSlice?.data as FileTree | null;

    // Check canvas file timestamp
    const canvasFile = fileTreeData.allFiles.find(f =>
      f.path === canvasPathProp || f.relativePath === canvasPathProp
    );

    if (canvasFile?.lastModified) {
      const currentTimestamp = canvasFile.lastModified.getTime();
      if (canvasFileTimestampRef.current && currentTimestamp !== canvasFileTimestampRef.current) {
        console.log('[CanvasDetailPanel] Canvas file modified, reloading...');
        loadCanvas(selectedCanvasIdProp, canvasPathProp);
        canvasFileTimestampRef.current = currentTimestamp;
      }
    }

    // Similar logic for narrative file...
  };

  events.on('workspace:changed', handleWorkspaceChange);
  return () => events.off('workspace:changed', handleWorkspaceChange);
}, [events, canvasPathProp, narrativePathProp, selectedCanvasIdProp, loadCanvas]);
```

#### 4. CanvasEditorPanel Updates
**File:** `src/panels/CanvasEditorPanel.tsx`

**Same pattern as CanvasDetailPanel:**
- Added `canvasFileInfo` prop
- Added `canvasFileTimestampRef`
- Listens to `workspace:changed` events
- Respects `skipNextFileChangeRef` to avoid reload after save

---

### Electron App: `electron-app`

#### DevWorkspacePanelFramework Updates
**File:** `src/renderer/dev-workspace/DevWorkspacePanelFramework.tsx`

**1. Import:**
```typescript
import type { FileInfo } from '@principal-ai/repository-abstraction';
```

**2. Tab Interfaces:**
```typescript
interface CanvasEditorTab extends BaseTab {
  contentType: 'canvas-editor';
  canvasId: string;
  canvasPath: string;
  canvasName: string;
  canvasFileInfo?: FileInfo | null;  // ✅ Added
}

interface CanvasTab extends BaseTab {
  contentType: 'canvas-detail';
  canvasId: string;
  canvasPath: string;
  canvasName: string;
  canvasFileInfo?: FileInfo | null;        // ✅ Added
  selectedNarrativeId?: string | null;
  narrativePath?: string | null;
  narrativeTemplate?: NarrativeTemplate | null;
  narrativeFileInfo?: FileInfo | null;     // ✅ Added
}
```

**3. Event Handler:**
```typescript
// Extract FileInfo from event payload
const { canvasId, canvas, canvasFileInfo, narrativeId, narrative, narrativeTemplate, narrativeFileInfo } = event.payload;

// Store in tab
const newTab = {
  // ...
  canvasFileInfo: canvasFileInfo || null,
  narrativeFileInfo: narrativeFileInfo || null,
};
```

**4. Panel Rendering:**
```typescript
<CanvasDetailPanelComponent
  // ... other props
  canvasFileInfo={canvasTab.canvasFileInfo}
  narrativeFileInfo={canvasTab.narrativeFileInfo}
/>

<CanvasEditorPanelComponent
  // ... other props
  canvasFileInfo={canvasEditorTab.canvasFileInfo}
/>
```

---

## Testing Checklist

### Prerequisites
- [ ] Ensure `@industry-theme/principal-view-panels` is version 0.4.21 or later
- [ ] Ensure electron app has updated `DevWorkspacePanelFramework.tsx`
- [ ] Repository monitoring is active and emitting `workspace:changed` events

### Test Scenarios

#### Test 1: Canvas File Auto-Reload
1. [ ] Open Dev Workspace
2. [ ] Click on a canvas in the Canvas List panel
3. [ ] Canvas opens in a new tab (CanvasEditorPanel)
4. [ ] Open the same canvas file in VS Code
5. [ ] Make a change (add a node, modify an edge, etc.)
6. [ ] Save the file
7. [ ] **Expected:** Panel automatically reloads with new content
8. [ ] **Check Console:** Should see log: `[CanvasEditorPanel] Canvas file modified, reloading...`

#### Test 2: Narrative Auto-Reload
1. [ ] Open Dev Workspace
2. [ ] Click on a narrative under a canvas in the Canvas List panel
3. [ ] Canvas opens with narrative view (CanvasDetailPanel)
4. [ ] Open the narrative `.yaml` file in VS Code
5. [ ] Make a change (modify a scenario, etc.)
6. [ ] Save the file
7. [ ] **Expected:** Panel detects change (see TODO comment - narrative reload not fully implemented)
8. [ ] **Check Console:** Should see log about narrative file modification

#### Test 3: Multiple Panels
1. [ ] Open 2+ canvas panels
2. [ ] Edit one of the canvas files externally
3. [ ] Save
4. [ ] **Expected:** Only the affected panel reloads
5. [ ] Other panels remain unchanged

#### Test 4: Save from Editor
1. [ ] Open canvas in CanvasEditorPanel
2. [ ] Enter edit mode
3. [ ] Make changes in the graph
4. [ ] Click Save button
5. [ ] **Expected:** Panel saves changes but does NOT reload
6. [ ] **Check:** `skipNextFileChangeRef` prevents reload loop

#### Test 5: Timestamp Comparison
1. [ ] Open canvas panel
2. [ ] Note the timestamp in console log
3. [ ] Edit file externally
4. [ ] Save
5. [ ] **Check Console:** Should show old vs new timestamp comparison
   ```
   [CanvasDetailPanel] Canvas file modified, reloading... {
     path: '.principal-views/my-canvas.canvas',
     lastLoaded: 2026-01-24T10:30:00.000Z,
     current: 2026-01-24T10:35:00.000Z
   }
   ```

---

## Known Issues & Limitations

### 1. **Narrative Reload Not Fully Implemented**
**Location:** `CanvasDetailPanel.tsx:554`

```typescript
// TODO: Reload narrative template
narrativeFileTimestampRef.current = currentTimestamp;
```

**Impact:** Narrative file changes are detected but template is not reloaded.

**Fix Required:** Implement narrative template reload logic similar to canvas reload.

### 2. **Requires includeStats: true**
The FileTree must be built with `includeStats: true` to populate `lastModified` and `size` fields.

**Current Status:** Using `@principal-ai/repository-monitoring-server` which should include stats by default.

**Verify:** Check that FileTree actually has timestamps:
```typescript
// In browser console:
context.getSlice('fileTree').data.allFiles[0].lastModified
// Should return a Date object, not undefined
```

### 3. **SHA Not Updated**
As discussed, the FileTree SHA only changes when files are added/removed, not when modified. This implementation bypasses the SHA check entirely by using timestamp comparison.

### 4. **Potential Race Conditions**
If multiple files change rapidly (e.g., during git operations), the panel may reload multiple times.

**Mitigation:** Could add debouncing to the workspace:changed handler.

---

## Debug Guide

### Console Logs to Watch

**On Canvas Click:**
```
[CanvasListPanel] Emitting event with canvasFileInfo: { lastModified: Date, size: 12345 }
[DevWorkspacePanelFramework] Received canvas selection event: { canvasFileInfo: {...} }
[CanvasDetailPanel] Canvas loaded, timestamp: 2026-01-24T10:30:00.000Z
```

**On File Change:**
```
[DevWorkspaceApp] Workspace changed: { repoPath: '...', changeCount: 1, state: '...' }
[CanvasDetailPanel] Canvas file modified, reloading... { lastLoaded: ..., current: ... }
[CanvasDetailPanel] Loading canvas from props: my-canvas .principal-views/my-canvas.canvas
```

### Common Issues

**Panel doesn't reload:**
1. Check if `workspace:changed` event is emitted (DevWorkspaceApp.tsx:571)
2. Check if FileInfo has `lastModified` field
3. Check console for timestamp comparison logs
4. Verify `canvasFileInfoProp` is passed to panel

**Panel reloads on save:**
1. Check `skipNextFileChangeRef` logic in CanvasEditorPanel
2. Ensure save handler sets the flag before writing

**Timestamp is null:**
1. Verify FileTree is built with `includeStats: true`
2. Check repository monitoring configuration
3. Look at FileInfo structure in context

---

## Future Enhancements

### 1. **Debounced Reload**
Add debouncing to avoid excessive reloads during rapid file changes:
```typescript
const debouncedReload = useMemo(
  () => debounce(() => loadCanvas(...), 300),
  [loadCanvas]
);
```

### 2. **User Notification**
Show a toast/banner when auto-reload happens:
```typescript
toast.info('Canvas updated - reloading...');
```

### 3. **Opt-Out Option**
Add user preference to disable auto-reload:
```typescript
const autoReloadEnabled = UserPreferencesService.get('canvas.autoReload', true);
```

### 4. **Diff Preview**
Before auto-reloading, show a diff of what changed and ask user to confirm.

### 5. **Conflict Resolution**
If panel has unsaved changes and file changes externally, prompt user:
- Reload and discard changes
- Keep local changes
- Merge changes

---

## Related Files

### Library
- `src/panels/canvas-list/hooks/useCanvasData.ts`
- `src/panels/canvas-list/hooks/useCanvasNarrativeData.ts`
- `src/panels/CanvasListPanel.tsx`
- `src/panels/CanvasDetailPanel.tsx`
- `src/panels/CanvasEditorPanel.tsx`

### Electron App
- `src/renderer/dev-workspace/DevWorkspacePanelFramework.tsx`
- `src/renderer/dev-workspace/DevWorkspaceApp.tsx` (emits workspace:changed)
- `src/renderer/contexts/RepositoryPanelContext.tsx` (provides FileTree)
- `src/main/file-system/fileSystemHandlers.ts` (file watchers)
- `src/main/repository-monitoring/ipcHandlers.ts` (monitoring manager)

### Dependencies
- `@principal-ai/repository-abstraction` (FileTree, FileInfo types)
- `@principal-ai/repository-monitoring-server` (file tree building)

---

## Questions / Follow-Up

- [ ] Should we implement narrative template auto-reload?
- [ ] Do we need debouncing for rapid file changes?
- [ ] Should we add user notifications for auto-reload?
- [ ] Should we handle conflicts when panel has unsaved changes?
- [ ] Should we verify `includeStats: true` is enabled in all environments?
- [ ] Should we add metrics/telemetry for auto-reload events?

---

## References

- **Original Issue:** SHA not updating on file modifications
- **Solution:** Timestamp-based change detection using FileInfo.lastModified
- **Implementation Date:** 2026-01-24
- **Implemented By:** Claude Code
- **Version:** 0.4.21
