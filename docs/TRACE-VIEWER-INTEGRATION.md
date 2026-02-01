# OpenTelemetry Trace Viewer - Integration Guide

## Overview

We've built a complete trace viewer system for visualizing OpenTelemetry traces in your Electron application. The system consists of two panels that work together to provide a list-detail view of traces.

## What's Included

### Components

1. **TraceList** (`src/components/TraceList.tsx`)
   - Displays traces in card format with metadata
   - Search/filter functionality
   - Shows: operation name, service, duration, span count, trace ID, workflow matching
   - Click-to-copy trace IDs (first 12 chars, hover for full)

2. **TraceDetails** (`src/components/TraceDetails.tsx`)
   - Shows detailed span tree with parent-child relationships
   - Expandable spans (open by default)
   - Shows span attributes and events (exceptions, logs)
   - Clean, scannable layout

### Panels

3. **TraceListPanel** (`src/panels/TraceListPanel.tsx`)
   - Panel wrapper for TraceList component
   - Emits events when traces are selected
   - Currently uses mock data (needs telemetry integration)

4. **TraceDetailsPanel** (`src/panels/TraceDetailsPanel.tsx`)
   - Panel wrapper for TraceDetails component
   - **Prop-controlled** - receives `selectedTrace` prop
   - Shows header with trace summary
   - Empty state when no trace selected

### Type Definitions & Utilities

5. **OTEL Types** (`src/types/otel.ts`)
   - Full OTLP/JSON type definitions
   - Helper functions for parsing spans, attributes, durations
   - `TraceInfo` aggregation type
   - `groupSpansByTrace()` function
   - Workflow matching metadata

6. **Mock Data** (`src/mocks/otelMocks.ts`)
   - Generators for testing: `generateCheckoutTrace()`, `generateAuthErrorTrace()`, etc.
   - Supports workflow matching metadata

## Integration Pattern

### Panel Communication Flow

```
TraceListPanel (list of traces)
    ↓
  User clicks trace
    ↓
  Emits event: { action: 'selectTrace', trace: TraceInfo }
    ↓
  Host app listens & manages state
    ↓
  Passes trace as prop to TraceDetailsPanel
    ↓
TraceDetailsPanel (shows span details)
```

### Why Prop-Controlled?

The `TraceDetailsPanel` uses the **prop-controlled pattern** (not event-driven internally) to avoid timing issues:
- ✅ Content loads immediately when trace is selected
- ✅ No race conditions with context updates
- ✅ Clearer data flow
- ✅ Follows recommended panel framework patterns

See: `~/.claude/skills/add-custom-panel-tab/SKILL.md` (lines 187-206, 480-544)

## How to Integrate

### Step 1: Install the Package

```bash
npm install @industry-theme/principal-view-panels@latest
```

### Step 2: Add Panels to Your Layout

**Option A: Side-by-side (recommended)**
```typescript
import { TraceListPanel, TraceDetailsPanel } from '@industry-theme/principal-view-panels';
import { AnimatedResizableLayout } from '@principal-ade/panels';
import { useState, useEffect } from 'react';
import type { TraceInfo } from '@industry-theme/principal-view-panels/dist/types/otel';

export const TraceViewer = ({ context, actions, events }) => {
  const [selectedTrace, setSelectedTrace] = useState<TraceInfo | null>(null);

  // Listen for trace selection events
  useEffect(() => {
    const unsubscribe = events.on('custom', (event) => {
      if (event.payload?.action === 'selectTrace') {
        setSelectedTrace(event.payload.trace);
      }
    });
    return unsubscribe;
  }, [events]);

  return (
    <AnimatedResizableLayout
      direction="horizontal"
      defaultRatio={0.4}
      minRatio={0.2}
      maxRatio={0.8}
    >
      <TraceListPanel context={context} actions={actions} events={events} />
      <TraceDetailsPanel
        context={context}
        actions={actions}
        events={events}
        selectedTrace={selectedTrace}
      />
    </AnimatedResizableLayout>
  );
};
```

**Option B: Tabbed layout**

If you're using `TabbedTerminalPanel`, you can add trace details as tabs:

```typescript
// 1. Define trace tab type
interface TraceTab extends BaseTab {
  contentType: 'trace-details';
  trace: TraceInfo;
}

type AppTab = TerminalTab | TraceTab;

// 2. Listen for trace selection and create tabs
useEffect(() => {
  const cleanup = events.on('custom', (event) => {
    if (event.payload?.action === 'selectTrace') {
      const trace = event.payload.trace;

      setTabs((prevTabs) => {
        // Check if tab already exists
        const existingTab = prevTabs.find(
          (t) => t.contentType === 'trace-details' && t.trace.traceId === trace.traceId
        );

        if (existingTab) {
          setActiveTabId(existingTab.id);
          return prevTabs;
        }

        // Create new tab
        const newTab: TraceTab = {
          id: `trace-${trace.traceId}-${Date.now()}`,
          label: trace.rootSpan?.name || 'Trace',
          contentType: 'trace-details',
          trace,
          closable: true,
        };

        setActiveTabId(newTab.id);
        return [...prevTabs, newTab];
      });
    }
  });
  return cleanup;
}, [events]);

// 3. Render in renderTabContent
renderTabContent={(tab, isActive) => {
  switch (tab.contentType) {
    case 'terminal':
      return null;

    case 'trace-details': {
      const traceTab = tab as TraceTab;
      return (
        <TraceDetailsPanel
          context={context}
          actions={actions}
          events={events}
          selectedTrace={traceTab.trace}
        />
      );
    }
  }
}}
```

### Step 3: Connect Real Telemetry Data

Currently, `TraceListPanel` uses mock data. You need to replace this with real telemetry:

**In TraceListPanel.tsx (line ~42):**

```typescript
// TODO: Replace with actual trace data from context/telemetry provider
// For now, using mock data
const mockTraces = useMemo(() => {
  // ...
}, []);
```

**Replace with:**

```typescript
// Get traces from your telemetry provider
const traces = useMemo(() => {
  const telemetrySlice = context.getSlice('telemetry');
  const resourceSpans = telemetrySlice?.data as OtelResourceSpans | null;

  if (!resourceSpans) return [];

  return groupSpansByTrace(resourceSpans);
}, [context]);
```

**Or with event-driven approach:**

```typescript
const [traces, setTraces] = useState<TraceInfo[]>([]);

useEffect(() => {
  if (!events) return;

  const unsubscribe = events.on('telemetry:batch', (event) => {
    const { resourceSpans } = event.payload;
    const newTraces = groupSpansByTrace(resourceSpans);

    // Append or replace depending on your needs
    setTraces(prev => [...newTraces, ...prev].slice(0, 100)); // Keep last 100
  });

  return unsubscribe;
}, [events]);
```

## Data Flow & Requirements

### Input: OTLP/JSON Format

The trace viewer expects OpenTelemetry data in **OTLP/JSON format**:

```typescript
interface OtelResourceSpans {
  resourceSpans: Array<{
    resource: {
      attributes: Array<{
        key: string;
        value: { stringValue?: string; intValue?: number; /* ... */ };
      }>;
    };
    scopeSpans: Array<{
      scope: { name: string; version?: string };
      spans: Array<{
        traceId: string;
        spanId: string;
        parentSpanId?: string;
        name: string;
        startTimeUnixNano: string;
        endTimeUnixNano: string;
        attributes?: /* ... */;
        events?: /* ... */;
        status?: /* ... */;
      }>;
    }>;
  }>;
}
```

See `src/types/otel.ts` for complete type definitions.

### Workflow Matching (Optional)

To show which storyboard/workflow a trace belongs to, add these attributes to the resource:

```typescript
resource.attributes.push(
  { key: 'pv.storyboard.id', value: { stringValue: 'payment-processing' } },
  { key: 'pv.storyboard.name', value: { stringValue: 'Payment Processing' } },
  { key: 'pv.workflow.id', value: { stringValue: 'successful-payment' } },
  { key: 'pv.workflow.name', value: { stringValue: 'Successful Payment' } }
);
```

The trace list will automatically display this information.

## Events Reference

### Events Emitted

**From TraceListPanel:**
```typescript
{
  type: 'custom',
  source: 'trace-list-panel',
  timestamp: number,
  payload: {
    action: 'selectTrace',
    trace: TraceInfo // Full trace object with spans, metadata, etc.
  }
}
```

### Events Consumed

**By your integration layer (not the panels themselves):**
```typescript
// Listen for trace selection
events.on('custom', (event) => {
  if (event.payload?.action === 'selectTrace') {
    const trace = event.payload.trace;
    // Update state, create tab, etc.
  }
});

// Optionally: Listen for incoming telemetry
events.on('telemetry:batch', (event) => {
  const { resourceSpans, spanCount } = event.payload;
  // Process and display traces
});

events.on('telemetry:span', (event) => {
  const { span, resource, scope } = event.payload;
  // Handle individual span
});
```

See `docs/OTEL-EVENT-STRUCTURE.md` for complete event specifications.

## Testing

Check out the Storybook stories:
- **Components/TraceList** - Trace list component in isolation
- **Components/TraceDetails** - Trace details component in isolation
- **Panels/TraceListPanel** - Panel with mock data
- **Panels/TraceDetailsPanel** - Panel with sample traces
- **Panels/TraceViewerIntegration** - Full integration showing both panels working together

Run Storybook:
```bash
cd industry-themed-principal-view-panels
bun run storybook
```

## Key Files Reference

```
src/
├── components/
│   ├── TraceList.tsx          # List component
│   ├── TraceDetails.tsx       # Details component
│   └── index.ts               # Exports
├── panels/
│   ├── TraceListPanel.tsx     # List panel
│   ├── TraceDetailsPanel.tsx  # Details panel (prop-controlled)
│   └── TraceViewerIntegration.stories.tsx  # Integration example
├── types/
│   └── otel.ts                # OTLP/JSON types & helpers
└── mocks/
    └── otelMocks.ts           # Mock data generators

docs/
└── OTEL-EVENT-STRUCTURE.md   # Complete OTEL spec & event types
```

## Next Steps

1. **Install the package** in your Electron app
2. **Add panels to your layout** (see Step 2 above)
3. **Connect real telemetry data** (see Step 3 above)
4. **Test with real traces** from your instrumented application
5. **Adjust styling/behavior** as needed for your use case

## Questions?

If you need help with:
- Custom telemetry event formats
- Integration with specific panel layouts
- Performance optimization for large trace volumes
- Custom filtering or grouping logic

Please reach out or check the existing Storybook examples for patterns.

## Version

Added in: `@industry-theme/principal-view-panels@0.9.0`

Last updated: 2026-02-01
