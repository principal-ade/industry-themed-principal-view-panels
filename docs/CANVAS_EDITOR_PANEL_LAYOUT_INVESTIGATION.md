# CanvasEditorPanel Layout Investigation

## Problem Summary

CanvasEditorPanel stories in Storybook fail to render the graph on initial load, but work after hot reload. The `AnimatedResizableLayout` component (which uses `react-resizable-panels`) reports `height: 0` on initial render.

## Symptoms

- DirectGraphRenderer story works fine on initial load
- CanvasEditorPanel stories show header and scenarios list, but canvas area is blank/white
- Inspecting the DOM shows `AnimatedResizableLayout` has width but 0 height
- After hot reload, it sometimes works
- Console shows: `[React Flow]: The React Flow parent container needs a width and a height to render the graph`

## Root Cause (Suspected)

The issue appears to be a timing/initialization race condition with `react-resizable-panels`. On initial render:

1. The flex container chain doesn't establish calculated heights fast enough
2. `react-resizable-panels` measures its container before the layout is settled
3. It gets 0 height and doesn't re-measure

On hot reload:
- The layout is already rendered and has dimensions
- `react-resizable-panels` sees correct dimensions when it re-initializes

## Key Differences: DirectGraphRenderer vs CanvasEditorPanel

| Aspect | DirectGraphRenderer | CanvasEditorPanel |
|--------|---------------------|-------------------|
| Uses AnimatedResizableLayout | No | Yes |
| Uses react-resizable-panels | No | Yes (via AnimatedResizableLayout) |
| Async data loading | No | Yes |
| Works on initial load | Yes | Sometimes no |

## What We Tried

### 1. Waiting for containerDimensions before rendering GraphRenderer
- **Result**: Didn't help - the dimensions never came because the container had 0 height

### 2. Using ResizeObserver with various timing strategies
- Empty dependency array `[]`
- Dependency on `state.loading`
- Double requestAnimationFrame delay
- Ref callback instead of useEffect
- **Result**: Observer fires but reports `height: 0`

### 3. Absolute positioning for layout
- Changed from flex to `position: absolute` with `top/bottom/left/right`
- **Result**: Still got 0 height

### 4. Adding explicit height to wrappers
- Added `height: 100%` and `style` props to AnimatedResizableLayout
- **Result**: No improvement

### 5. Nested absolute positioning divs
- Wrapped AnimatedResizableLayout in multiple absolute-positioned divs
- **Result**: Still 0 height

## What Fixed It (v0.12.66)

Reverted to flex layout with specific flex properties:

```tsx
{/* Main content area */}
<div style={{ flex: '1 1 0%', minHeight: 0, overflow: 'hidden' }}>
  <AnimatedResizableLayout ... />
</div>
```

Key elements:
- `flex: '1 1 0%'` - explicit flex-grow, flex-shrink, and 0% flex-basis
- `minHeight: 0` - allows flex item to shrink below content size (critical for nested flex)
- `overflow: 'hidden'` - prevents content from affecting container size

Also:
- Render GraphRenderer immediately without waiting for dimensions
- Pass `width="100%"` and `height="100%"` as strings
- Pass `containerWidth` and `containerHeight` as optional hints (may be undefined)

## Areas for Future Investigation

1. **react-resizable-panels initialization**: Does it have a known issue with measuring containers on first render? Is there a way to force re-measurement?

2. **Storybook-specific issue**: Does this only happen in Storybook, or also in the electron app? (Note: Works in electron app per testing)

3. **CSS containment**: Would adding `contain: strict` or `contain: size` to parent containers help establish dimensions faster?

4. **PanelGroup autoSaveId**: react-resizable-panels supports `autoSaveId` for persisting sizes - could this help with initialization?

5. **AnimatedResizableLayout CSS**: The component uses `height: 100%` in CSS - should this be changed to use flex properties instead?

6. **Race condition timing**: Is there a specific timing threshold? Would a small setTimeout before rendering help diagnose?

## Related Files

- `src/panels/CanvasEditorPanel.tsx` - Main panel component
- `src/panels/CanvasEditorPanel.stories.tsx` - Storybook stories
- `@principal-ade/panels` - Contains AnimatedResizableLayout
- `react-resizable-panels` - Underlying panel library

## Environment

- Storybook with Vite
- React 19
- react-resizable-panels (via AnimatedResizableLayout)
- React Flow (via GraphRenderer)
