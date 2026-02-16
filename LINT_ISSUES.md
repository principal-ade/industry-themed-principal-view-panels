# Remaining Lint Issues

**Status:** 97 problems (64 errors, 33 warnings)

Last updated: 2026-01-25

## Progress

✅ **Completed:**
- Fixed all unused variables and imports (5 files)
- Fixed all TypeScript `any` types (14 errors + 3 console warnings)
- Reduced from 121 problems to 97 problems

## Remaining Issues by Category

### 1. React Hooks Rules (61 errors) - `react-hooks/rules-of-hooks`

**Issue:** Hooks being called in functions named `render` instead of React components. React requires hooks to be called in:
- Function components (must start with uppercase letter)
- Custom hooks (must start with "use")

**Files affected:**
- (Previously affected story files have been deleted)

**Example error:**
```
React Hook "useState" is called in function "render" that is neither a React function component nor a custom React Hook function
```

**Fix:** Rename the `render` function to start with uppercase (e.g., `RenderComponent`) or restructure to avoid hooks in render functions.

---

### 2. Console Statements (31 warnings) - `no-console`

**Issue:** Using `console.log()` instead of `console.warn()` or `console.error()`

**Files affected:**
- `.storybook/preview.ts` (1 warning)
- `src/mocks/panelContext.tsx` (2 warnings)
- `src/panels/CanvasDetailPanel.tsx` (~6 warnings)
- `src/panels/CanvasEditorPanel.tsx` (1 warning)
- `src/panels/CanvasListPanel.stories.tsx` (~3 warnings)
- `src/panels/canvas-list/hooks/useCanvasData.ts` (3 warnings)
- `src/panels/canvas-list/hooks/useCanvasNarrativeData.ts` (4 warnings)

**Lines in CanvasDetailPanel.tsx:**
- Line 533, 586, 610, 746

**Fix:** Change `console.log()` to `console.warn()` or `console.error()` based on context, or remove debug logs.

---

### 3. Unused Variables (2 errors) - `@typescript-eslint/no-unused-vars`

**File:** `src/panels/CanvasListPanel.tsx`

**Issues:**
- Line 42: `fileTreeSha` is assigned but never used
- Line 74: `handleCanvasClick` is assigned but never used

**Fix:**
- Prefix with underscore (`_fileTreeSha`, `_handleCanvasClick`) if intentionally unused
- Remove if truly not needed
- Or use them if they should be used

---

### 4. Missing Hook Dependencies (2 warnings) - `react-hooks/exhaustive-deps`

**File:** `src/panels/CanvasDetailPanel.tsx`
- Line 468: `useCallback` missing dependency `state.narrativeTemplate`

**File:** `src/panels/CanvasEditorPanel.tsx`
- Line 216: `useCallback` missing dependency `canvasPath`

**Fix:** Either add the missing dependencies to the dependency array, or use ESLint disable comment if the omission is intentional.

---

### 5. TypeScript Comment (1 error) - `@typescript-eslint/ban-ts-comment`

**File:** `src/panels/CanvasListPanel.tsx`
- Line 39: Use `@ts-expect-error` instead of `@ts-ignore`

**Fix:** Replace `// @ts-ignore` with `// @ts-expect-error` and add a comment explaining why the error is expected.

---

## Recommended Fix Order

1. **Unused variables (2 errors)** - Quick win, 5 minutes
2. **TypeScript comment (1 error)** - Quick win, 2 minutes
3. **Console statements (31 warnings)** - Medium effort, 20-30 minutes
4. **Hook dependencies (2 warnings)** - Requires understanding of component logic
5. **React Hooks rules (61 errors)** - Requires refactoring Storybook stories

## Commands

```bash
# Run linting
bun run lint

# Count remaining issues by type
bun run lint 2>&1 | grep -E "error|warning" | awk '{print $NF}' | sort | uniq -c | sort -rn

# Check specific file
bun run lint src/panels/CanvasListPanel.tsx
```
