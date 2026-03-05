# Multi Canvas Panel

The MultiCanvasPanel displays multiple canvas configurations on a single unified view, enabling users to visualize and compare related OTEL event schemas or architectural diagrams side-by-side.

## Problem Solved

When working with complex systems, understanding how different components relate to each other requires seeing multiple event flows simultaneously. Previously, users had to switch between individual canvas views, losing context. The MultiCanvasPanel solves this by:

- Displaying multiple canvases in a unified, pannable/zoomable view
- Grouping each canvas with visible borders and labels
- Supporting flexible layouts (grid, vertical, horizontal) for different viewing preferences
- Providing controls and minimap for navigation of large canvas collections

## Operation Modes

### Static Layout Mode (Storybook/Testing)

Pass a pre-built `layout` prop with canvas data directly:

```tsx
<MultiCanvasPanel
  layout={prebuiltLayout}
  showGroups={true}
  showMinimap={true}
/>
```

Use this mode when canvas data is already available in memory, such as in Storybook stories or unit tests.

### Dynamic Loading Mode (Production)

Pass `canvasInfos` with file paths to load from the repository:

```tsx
<MultiCanvasPanel
  context={panelContext}
  actions={panelActions}
  canvasInfos={[
    { id: 'checkout', path: '.principal-views/checkout/checkout.otel.canvas', label: 'Checkout Flow' },
    { id: 'payment', path: '.principal-views/payment/payment.otel.canvas', label: 'Payment Processing' }
  ]}
  direction="grid"
  columns={2}
/>
```

This mode loads canvas files asynchronously using the panel framework's `readFile` action.

## Layout Options

### Grid Layout (Default)

Arranges canvases in a 2-column grid with uniform cell sizing. Automatically calculates cell dimensions based on the largest canvas to ensure consistent spacing.

### Vertical Layout

Stacks canvases top to bottom, useful for viewing sequential workflows or comparing different versions of the same flow.

### Horizontal Layout

Places canvases side by side, ideal for comparing parallel processes or alternative implementations.

## Display Options

| Option | Default | Description |
|--------|---------|-------------|
| `showGroups` | `true` | Display borders around each canvas with labels |
| `showMinimap` | `true` | Show navigation minimap for large canvas areas |
| `showControls` | `true` | Display zoom and fit controls |
| `showBackground` | `true` | Show background pattern |
| `backgroundVariant` | `dots` | Pattern style: `dots`, `lines`, or `cross` |

## Error Handling

The panel handles several error scenarios gracefully:

1. **Missing readFile action**: Displays error if panel framework doesn't provide file reading capability
2. **Missing repository path**: Displays error if context doesn't include repository root
3. **Individual load failures**: Logs warnings but continues loading other canvases
4. **Empty result**: Displays "No canvases loaded" if all loads fail

## Integration with StoryboardListPanel

The StoryboardListPanel provides a Layers button that opens the MultiCanvasPanel with all discovered OTEL canvases from the current storyboard filter. This enables quick comparison of related event schemas.

## Common Workflow Patterns

1. **Compare Event Flows**: Open multiple OTEL canvases to compare instrumentation between different features
2. **Review Architecture**: View system components and their interactions across multiple diagrams
3. **Validate Coverage**: Check that all user flows have corresponding OTEL event schemas
