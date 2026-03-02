# Principal View Panel Architecture

The Principal View Panel package provides a modular system for visualizing and browsing graph-based configurations with industry theming support.

## Problem Solved

Developers need to visualize complex graph structures (canvas files, library definitions) in a consistent, themed UI. This package provides:

- **Graph visualization** with interactive navigation
- **Configuration browsing** for discovering and loading graph files
- **Theme integration** for industry-specific styling

## Core Components

### UI Panels

- **PrincipalViewGraphPanel**: Main visualization surface that renders graph nodes and edges using the principal-view-react library
- **ConfigLibraryBrowserPanel**: File browser for discovering canvas files and library definitions in the project

### Data Loading

- **ConfigLoader**: Parses and validates canvas configuration files
- **LibraryLoader**: Loads component library definitions that define node types, colors, and shapes
- **PanelFileSystemAdapter**: Abstracts filesystem operations, enabling both local and remote file access

### Interactive Tools

The panels expose MCP tools for programmatic control:

- `focusNodeTool`: Centers the view on a specific node by ID
- `triggerEventTool`: Dispatches events to trigger state changes
- `resetViewTool`: Returns the view to its default position and zoom

## Design Choices

**Adapter Pattern**: The filesystem adapter decouples loading logic from storage, allowing the same panels to work in VS Code extensions, web apps, or CLI tools.

**Theme Context**: Industry theming is provided via React context (`@principal-ade/industry-theme`), ensuring consistent styling without prop drilling.

**Separation of Concerns**: Loaders handle data fetching, panels handle rendering, tools handle interaction. This makes each component testable in isolation.

## Common Workflows

1. **Browse and visualize**: Use ConfigLibraryBrowserPanel to find a canvas, which emits to PrincipalViewGraphPanel for display
2. **Programmatic navigation**: Call `focusNodeTool` to highlight specific architecture components
3. **Reset after exploration**: Use `resetViewTool` to return to the overview

## Error Scenarios

- **Missing canvas file**: ConfigLoader returns validation errors with line numbers
- **Invalid library reference**: LibraryLoader reports which library file is missing
- **Theme not provided**: Panels fall back to default Principal View styling
