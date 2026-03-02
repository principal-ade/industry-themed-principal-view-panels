# Workflow Scenarios Panel

The Workflow Scenarios Panel visualizes workflow scenarios overlaid on canvas diagrams, with execution artifacts and playback controls.

## What It Does

The panel enables developers to:

- **View workflow scenarios** - Display defined scenarios from workflow templates on an interactive canvas
- **Inspect trace executions** - Load and visualize OTEL traces from test runs or live telemetry
- **Playback traces** - Step through or auto-play trace events to see how data flows through the architecture
- **Match traces to scenarios** - Automatically match incoming traces to defined workflow scenarios

## User Workflows

### Scenario Exploration

1. Panel loads with a canvas and workflow template
2. User sees list of scenarios from the workflow
3. Hovering a scenario highlights relevant nodes on the canvas
4. Clicking a scenario shows its details and any associated test traces

### Trace Analysis

1. User selects a trace (from test artifacts or live telemetry)
2. Panel loads the trace and matches it to scenarios
3. Timeline shows events with their attributes
4. Clicking events highlights corresponding canvas nodes
5. User can step through or play back the trace

### Source Navigation

- Shift+clicking a canvas node opens its source file
- Clicking source links in scenario details opens the file

## Design Choices

- **Split view layout**: Left panel shows scenario/trace details, right panel shows interactive canvas
- **Color-coded nodes**: Active nodes (matching current trace events) are visually distinct
- **Fit-to-nodes**: When a trace loads, viewport automatically fits to show active nodes
- **View modes**: Raw (JSON), Narrative (templated), and Summary views for trace data

## Error Handling

- **Canvas load failure**: Shows error message with details
- **Missing workflow**: Panel still shows canvas, but without scenario features
- **Unmatched traces**: Traces that don't match any scenario are still viewable as "orphaned"
