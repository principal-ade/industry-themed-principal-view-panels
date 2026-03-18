# Storyboard List Panel

The StoryboardListPanel provides a tree-based navigation interface for browsing and selecting canvases and workflows in the Principal View system.

## Overview

This panel displays:
- **Storyboards** - Discovered canvas/workflow groupings from `.principal-views/` directories
- **Canvases** - Visual architecture diagrams (`.canvas` files)
- **Workflows** - Scenario definitions with test traces (`.workflow.json` files)
- **Documentation** - Associated markdown files for each canvas

## Features

### Tab Navigation
- **OTEL Tab** - Shows `.otel.canvas` files for telemetry documentation
- **Architecture Tab** - Shows architecture canvases (`.canvas`, `.scopes.canvas`, `.spans.canvas`, `.resources.canvas`)

### Tree Interactions
- **Click** canvas/workflow to open in editor panel
- **Shift+Click** to open the raw file directly
- **Right-click** to copy file path
- **Expand/Collapse** storyboard nodes to show workflows

### Search
- Filter storyboards by name using the search box
- Search is applied within the current tab (OTEL or Architecture)

### Refresh
- Click refresh button to re-scan file tree for new canvases
- Emits `canvas:refresh` event for parent to handle

## Event Flow

```
Panel Loading → Panel Loaded → User Interactions
                    ↓
              Canvas Selected → openCanvas event
              Workflow Selected → openCanvas event (with workflow)
              Overview Selected → file:open event
```

## Programmatic Control

The panel can be controlled programmatically via custom events:

- `selectNode` - Select a specific node by ID
- `toggleNode` - Expand/collapse a node

Node ID formats:
- `canvas:{canvasId}`
- `workflow:{workflowId}`
- `overview:{canvasId}`
- `storyboard:{basename}`
