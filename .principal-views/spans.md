# Span Conventions

This canvas defines the span hierarchy patterns used across Principal View panels.

## Root Spans

| Pattern | Description |
|---------|-------------|
| `multi-canvas-panel.render` | MultiCanvasPanel rendering lifecycle |
| `canvas-editor-panel.session` | User session with CanvasEditorPanel |
| `canvas-editor-panel.trace-analysis` | Trace analysis operations |

## Child Spans

### MultiCanvasPanel
- `canvas.load` - Loading individual canvas files
- `layout.compute` - Computing layout positions

### CanvasEditorPanel
- `scenario.interaction` - Scenario selection/hover events
- `trace.playback` - Trace playback session
- `trace.match` - Matching events to scenarios
- `coverage.compute` - Computing coverage metrics
