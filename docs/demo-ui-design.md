# Principal View Demo UI - Design Document

## Overview

A production-ready demo UI showcasing runtime validation capabilities with a **library/book aesthetic**. The UI demonstrates telemetry coverage analysis, change impact analysis, production debugging, and hierarchical canvas composition using mocked production data.

---

## Design Philosophy: The Library Metaphor

### Core Concept
The system is a **living technical library** where:
- **Books** = Canvas files (.otel.canvas)
- **Chapters** = Canvas nodes (components)
- **Reading Sessions** = OTEL traces
- **Bookmarks** = Key events and spans
- **Card Catalog** = File tree navigation
- **Reading Room** = Main workspace

### Visual Language

**Color Palette (Book/Library Theme):**
```
Primary (Leather-bound books):
- Rich Brown: #3E2723 (dark leather)
- Warm Brown: #5D4037 (medium leather)
- Tan: #8D6E63 (aged pages)

Secondary (Accent):
- Gold Foil: #D4AF37 (book gilding)
- Deep Green: #1B5E20 (reading lamp)
- Burgundy: #880E4F (bookmark ribbon)

Neutrals (Paper):
- Cream: #FFF8E1 (aged paper)
- Off-white: #FAFAF8 (clean pages)
- Charcoal: #424242 (ink)

Status Colors:
- Success: #2E7D32 (forest green)
- Warning: #F57C00 (amber)
- Error: #C62828 (red ink)
- Info: #1565C0 (blue ink)
```

**Typography:**
```
Headings: 'Playfair Display' (serif, book titles)
Body: 'Source Serif Pro' (readable serif)
Code/Data: 'JetBrains Mono' (monospace)
Labels: 'Lato' (clean sans-serif)
```

**UI Elements:**
- Rounded corners (like book edges)
- Subtle shadows (books on shelves)
- Leather-textured backgrounds for panels
- Paper-textured backgrounds for content
- Gold accent borders for important elements
- Ribbon bookmarks for active/selected items

---

## Data Formats

### 1. OTEL Trace Format (OpenTelemetry JSON)

```json
{
  "resourceSpans": [
    {
      "resource": {
        "attributes": [
          { "key": "service.name", "value": { "stringValue": "checkout-service" } },
          { "key": "service.version", "value": { "stringValue": "1.2.3" } }
        ]
      },
      "scopeSpans": [
        {
          "scope": {
            "name": "checkout-instrumentation",
            "version": "1.0.0"
          },
          "spans": [
            {
              "traceId": "5b8efff798038103d269b633813fc60c",
              "spanId": "eee19b7ec3c1b174",
              "parentSpanId": "eee19b7ec3c1b173",
              "name": "inventoryCheck",
              "kind": "SPAN_KIND_INTERNAL",
              "startTimeUnixNano": "1610000000000000000",
              "endTimeUnixNano": "1610000000800000000",
              "attributes": [
                { "key": "code.filepath", "value": { "stringValue": "src/business/inventory.ts" } },
                { "key": "code.lineno", "value": { "intValue": "67" } },
                { "key": "code.function", "value": { "stringValue": "checkAvailability" } },
                { "key": "product.id", "value": { "stringValue": "prod-123" } },
                { "key": "inventory.quantity", "value": { "intValue": "42" } }
              ],
              "events": [
                {
                  "timeUnixNano": "1610000000200000000",
                  "name": "inventory.checked",
                  "attributes": [
                    { "key": "result", "value": { "stringValue": "available" } }
                  ]
                }
              ],
              "status": {
                "code": "STATUS_CODE_OK"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. Canvas File Format (.otel.canvas)

```json
{
  "pv": {
    "name": "Checkout Flow",
    "version": "1.0.0",
    "description": "End-to-end checkout with payment processing"
  },
  "nodes": [
    {
      "id": "user-validation",
      "nodeType": "rest-api",
      "label": "User Validation",
      "position": { "x": 100, "y": 100 },
      "pv": {
        "events": [
          { "name": "user.authenticated" },
          { "name": "user.validated" }
        ],
        "otel": {
          "resourceMatch": {
            "service.name": "checkout-service"
          },
          "spanMatch": {
            "name": "validateUser"
          }
        }
      }
    },
    {
      "id": "inventory-check",
      "nodeType": "business-logic",
      "label": "Inventory Check",
      "position": { "x": 300, "y": 100 },
      "pv": {
        "events": [
          { "name": "inventory.checked" },
          { "name": "inventory.reserved" }
        ],
        "otel": {
          "resourceMatch": {
            "service.name": "checkout-service"
          },
          "spanMatch": {
            "name": "inventoryCheck"
          }
        }
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "from": "user-validation",
      "to": "inventory-check",
      "label": "on success"
    }
  ]
}
```

### 3. Library Definition (library.yaml)

```yaml
version: "1.0"

nodeComponents:
  rest-api:
    label: "REST API"
    description: "HTTP REST endpoints"
    sources:
      - "src/api/**/*.ts"
      - "src/routes/**/*.ts"
    visual:
      shape: "rectangle"
      color: "#1976D2"
      icon: "🌐"

  business-logic:
    label: "Business Logic"
    description: "Core domain logic"
    sources:
      - "src/business/**/*.ts"
      - "src/domain/**/*.ts"
    visual:
      shape: "rounded-rectangle"
      color: "#388E3C"
      icon: "⚙️"

  database:
    label: "Database"
    description: "Data persistence layer"
    sources:
      - "src/db/**/*.ts"
      - "src/repositories/**/*.ts"
    visual:
      shape: "cylinder"
      color: "#7B1FA2"
      icon: "🗄️"

edgeComponents:
  http-call:
    label: "HTTP Call"
    style: "solid"
    color: "#424242"

  event-emit:
    label: "Event"
    style: "dashed"
    color: "#FF6F00"
```

---

## UI Layout

### Overall Structure (Library/Reading Room Layout)

```
┌─────────────────────────────────────────────────────────────────┐
│  📚 Principal View Library                          [User] [⚙️]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌────────────────────────────────────────┐  │
│  │              │  │                                          │  │
│  │  Card        │  │                                          │  │
│  │  Catalog     │  │         Reading Room                    │  │
│  │  (File Tree) │  │         (Main Canvas View)              │  │
│  │              │  │                                          │  │
│  │  📖 Canvases │  │                                          │  │
│  │  📊 Traces   │  │                                          │  │
│  │  📁 Files    │  │                                          │  │
│  │              │  │                                          │  │
│  │              │  │                                          │  │
│  └──────────────┘  └────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Book Details / Reading Notes (Bottom Panel)            │   │
│  │  [Selected Trace Timeline / Node Details / Events]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Card Catalog (Left Sidebar - File Tree)

**Design:**
- Wooden card catalog aesthetic
- Drawer-like sections that expand/collapse
- Gold label plates for section headers
- Leather-bound book icons for canvas files

**Sections:**
```
📚 Library
  └─ 📖 Canvases (.otel.canvas files)
      ├─ checkout-flow.otel.canvas
      ├─ user-registration.otel.canvas
      └─ payment-processing.otel.canvas

  └─ 📄 Static Docs (.canvas files)
      ├─ architecture.canvas
      └─ system-overview.canvas

📊 Reading Sessions (Traces)
  └─ 🔖 Recent Sessions
      ├─ trace-abc123 (Success)
      ├─ trace-def456 (Failed)
      └─ trace-ghi789 (Slow)

  └─ 📅 By Date
      └─ 2026-01-18
          └─ [10,234 traces]

📁 Source Files
  └─ src/
      ├─ api/
      ├─ business/
      └─ db/

📖 Library Catalog
  └─ library.yaml
  └─ Component Definitions
```

**Interactions:**
- Click canvas → Load in Reading Room
- Click trace → Overlay on current canvas
- Hover → Show quick preview tooltip
- Right-click → Context menu (view details, compare, analyze impact)
- Drag canvas → Create comparison view

**Visual Details:**
- Background: Leather texture (#3E2723)
- Text: Cream color (#FFF8E1)
- Selected item: Gold border + burgundy ribbon bookmark
- Icons: Gold color (#D4AF37)
- Scroll: Vintage scrollbar style

---

### 2. Reading Room (Main Canvas View)

**Design:**
- Large central workspace with aged paper background
- Canvas rendered as an illustrated diagram
- Vintage cartography/blueprint aesthetic
- Nodes look like hand-drawn diagram elements

**Canvas Rendering:**
- Nodes: Rounded boxes with leather-texture headers
- Edges: Hand-drawn connector lines
- Labels: Serif font, looks hand-lettered
- Grid: Subtle dot grid (like graph paper)

**Overlays:**
- Trace overlay: Animated "ink trail" following the trace path
- Highlighting: Gold glow around active nodes
- Errors: Red ink splotches
- Success: Green checkmarks

**Toolbar (Top of Reading Room):**
```
┌──────────────────────────────────────────────────────────┐
│  [🔍 Zoom] [⊕ Fit] [↶ Pan] │ [📊 Show Traces] [📈 Metrics] │
└──────────────────────────────────────────────────────────┘
```

**View Modes:**
1. **Book View** - Traditional canvas diagram
2. **Timeline View** - Trace spans in chronological order
3. **Coverage View** - Heatmap showing telemetry coverage
4. **Impact View** - Dependency graph with blast radius

---

### 3. Book Details Panel (Bottom)

**Design:**
- Tabbed interface with leather tab headers
- Content area: Aged paper texture
- Gold tab borders for active tab

**Tabs:**

**Tab 1: Trace Timeline** (when trace selected)
```
┌─────────────────────────────────────────────────────────┐
│  📖 Reading Session: trace-abc123                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  Timeline (1200ms total):                               │
│  ├─ validateUser (100ms) ✓                             │
│  ├─ inventoryCheck (800ms) ⚠️ SLOW                     │
│  ├─ processPayment (200ms) ✓                           │
│  └─ sendConfirmation (100ms) ✓                         │
│                                                          │
│  [View Full Trace] [Export] [Compare]                   │
└─────────────────────────────────────────────────────────┘
```

**Tab 2: Node Details** (when node selected)
```
┌─────────────────────────────────────────────────────────┐
│  📑 Chapter: inventoryCheck                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  Type: business-logic                                   │
│  Source Files: src/business/inventory.ts (67)           │
│                                                          │
│  Expected Events:                                       │
│  • inventory.checked                                    │
│  • inventory.reserved                                   │
│                                                          │
│  Production Stats (last 24h):                           │
│  • Requests: 18,000/min                                 │
│  • P50 latency: 120ms                                   │
│  • P95 latency: 800ms                                   │
│  • Error rate: 0.1%                                     │
│                                                          │
│  [Analyze Impact] [View Coverage] [See Dependencies]    │
└─────────────────────────────────────────────────────────┘
```

**Tab 3: Event Log** (narrative events)
```
┌─────────────────────────────────────────────────────────┐
│  📝 Annotations & Events                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  10:23:15.100 - user.authenticated                      │
│    └─ User ID: user-456                                 │
│                                                          │
│  10:23:15.220 - inventory.checked                       │
│    └─ Product: prod-123, Quantity: 42                   │
│                                                          │
│  10:23:15.450 - payment.processed                       │
│    └─ Amount: $129.99, Status: success                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Tab 4: Coverage** (telemetry coverage)
```
┌─────────────────────────────────────────────────────────┐
│  📊 Telemetry Coverage                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  Overall: 82% (123/150 files)                           │
│                                                          │
│  By Component:                                          │
│  rest-api:        ████████████████░░ 93% (42/45)       │
│  business-logic:  ██████░░░░░░░░░░ 30% (18/60)         │
│  database:        ███████████░░░░░ 70% (21/30)         │
│                                                          │
│  Missing Coverage:                                      │
│  • src/business/shipping.ts                             │
│  • src/business/notifications.ts                        │
│  • ... 39 more files                                    │
│                                                          │
│  [View Report] [Export CSV]                             │
└─────────────────────────────────────────────────────────┘
```

---

## Key Features / Demo Workflows

### Workflow 1: Production Debugging

**User Story:** "Checkout is failing in production, where's the problem?"

**Steps:**
1. Select "Recent Sessions" → Click failed trace
2. Trace overlays on checkout-flow.otel.canvas
3. Red highlighting shows inventoryCheck failed
4. Bottom panel shows error details
5. Click "View Source" → Opens src/business/inventory.ts:67
6. Hierarchical elimination shown in sidebar

**Visual:**
- Failed spans: Red ink splotches
- Success spans: Green checkmarks
- Path animation: Stops at failure point
- Error callout: Aged paper note with red border

---

### Workflow 2: Telemetry Coverage Analysis

**User Story:** "Which parts of my system lack observability?"

**Steps:**
1. Click "Coverage View" mode in Reading Room
2. Canvas nodes show coverage heatmap
   - Green (90%+): Well instrumented
   - Yellow (50-90%): Partial coverage
   - Red (<50%): Dark/uninstrumented
3. Click red node → Bottom panel shows missing files
4. Right-click → "Analyze Impact" → Shows blast radius

**Visual:**
- Heatmap overlay on canvas
- Color-coded nodes
- Coverage percentage badges
- Missing files list with urgency indicators

---

### Workflow 3: Change Impact Analysis

**User Story:** "If I change inventoryCheck, what breaks?"

**Steps:**
1. Right-click inventoryCheck node → "Analyze Impact"
2. Switch to "Impact View" mode
3. Canvas transforms to dependency graph:
   - Upstream: What this needs (blue incoming arrows)
   - Downstream: What depends on this (red outgoing arrows)
4. Bottom panel shows quantified impact:
   - Traffic: 18K req/min
   - Critical path: 67% of checkout latency
   - Blast radius: 2 user-facing workflows
5. "Simulate Change" button → What-if scenarios

**Visual:**
- Dependency arrows with traffic volume labels
- Node sizes based on request volume
- Critical path highlighted in gold
- Simulation slider for performance changes

---

### Workflow 4: Canvas Composition (Hierarchical)

**User Story:** "See both high-level and detailed views"

**Steps:**
1. Select "architecture.otel.canvas" (parent)
2. Node "checkout-service" has book icon
3. Click book icon → Expands to show child canvas
4. Child canvas: "checkout-flow.otel.canvas" loads inline
5. Breadcrumb navigation at top
6. Traces flow through both levels

**Visual:**
- Parent canvas: Zoomed out view
- Child canvas: Nested frame with leather border
- Breadcrumbs: "Library > Architecture > Checkout Service > Checkout Flow"
- Zoom animation: Book opening effect

---

## Mocked Endpoints

### API Specification

**Base URL:** `/api/v1`

**1. GET /canvases**
```json
{
  "canvases": [
    {
      "id": "checkout-flow",
      "path": ".principal-views/checkout-flow.otel.canvas",
      "name": "Checkout Flow",
      "type": "otel.canvas",
      "parent": null,
      "lastModified": "2026-01-18T10:30:00Z"
    },
    {
      "id": "architecture",
      "path": ".principal-views/architecture.canvas",
      "name": "System Architecture",
      "type": "canvas",
      "parent": null,
      "lastModified": "2026-01-15T14:20:00Z"
    }
  ]
}
```

**2. GET /canvases/:id**
```json
{
  "canvas": {
    /* Full .otel.canvas content */
  }
}
```

**3. GET /traces**
```json
{
  "traces": [
    {
      "traceId": "5b8efff798038103d269b633813fc60c",
      "timestamp": "2026-01-18T10:23:15.000Z",
      "duration": 1200,
      "status": "success",
      "serviceName": "checkout-service",
      "rootSpan": "handleCheckout",
      "spanCount": 12
    }
  ],
  "pagination": {
    "total": 10234,
    "page": 1,
    "pageSize": 50
  }
}
```

**4. GET /traces/:traceId**
```json
{
  "trace": {
    /* Full OTEL trace format */
  }
}
```

**5. GET /coverage**
```json
{
  "overall": {
    "expected": 150,
    "actual": 123,
    "percentage": 82
  },
  "byComponent": [
    {
      "type": "rest-api",
      "expected": 45,
      "actual": 42,
      "percentage": 93,
      "missingFiles": [
        "src/api/legacy.ts",
        "src/api/deprecated.ts"
      ]
    }
  ]
}
```

**6. POST /analysis/impact**
```json
{
  "nodeId": "inventory-check",
  "canvasId": "checkout-flow",
  "analysis": {
    "downstream": [
      {
        "component": "checkout",
        "traffic": "10000 req/min",
        "impact": "high",
        "userFacing": true
      }
    ],
    "upstream": [
      {
        "component": "user-validation",
        "required": "always",
        "failureRate": 0.001
      }
    ],
    "criticalPath": {
      "isBottleneck": true,
      "percentageOfTotal": 67,
      "avgDuration": 800
    },
    "blastRadius": {
      "requestsPerMinute": 18000,
      "affectedWorkflows": 2,
      "revenueAtRisk": 30000
    }
  }
}
```

**7. GET /library**
```json
{
  "library": {
    /* Full library.yaml content in JSON */
  }
}
```

**8. GET /files/tree**
```json
{
  "tree": [
    {
      "path": "src",
      "type": "directory",
      "children": [
        {
          "path": "src/api",
          "type": "directory",
          "hasTelemetry": true,
          "coveragePercentage": 93
        }
      ]
    }
  ]
}
```

---

## Visual Design Details

### Component Library

**1. Book Card (for canvas files)**
```
┌──────────────────┐
│  📖              │
│                  │
│  Checkout Flow   │
│                  │
│  .otel.canvas    │
│                  │
│  [18K req/min]   │
└──────────────────┘
```
- Leather texture background
- Gold embossed title
- Ribbon bookmark if recently viewed
- Stats badge at bottom

**2. Trace Card (for trace sessions)**
```
┌──────────────────┐
│  🔖  trace-abc123│
│                  │
│  Success         │
│  1200ms          │
│  12 spans        │
│                  │
│  10:23:15 AM     │
└──────────────────┘
```
- Paper texture background
- Status indicator (green/yellow/red dot)
- Timestamp in vintage style
- Bookmark icon in status color

**3. Coverage Badge**
```
╔═══════════════╗
║  Coverage     ║
║  ████████░░   ║
║  82%          ║
╚═══════════════╝
```
- Gold border
- Progress bar with leather texture
- Percentage in large serif font

**4. Impact Meter**
```
┌─────────────────┐
│  Blast Radius   │
│  ◯───────●──────│
│  LOW    HIGH    │
│                 │
│  18K req/min    │
└─────────────────┘
```
- Vintage gauge aesthetic
- Gold needle pointing to impact level
- Detailed stats below

### Animations

**1. Page Turn (when switching canvases)**
- Canvas fades out with page-curl effect
- New canvas fades in from the spine

**2. Ink Trail (when playing trace)**
- Animated line follows trace path
- Droplet effects at each node
- Speed based on span duration

**3. Book Opening (when expanding hierarchical canvas)**
- Zoom animation with book cover opening
- Child canvas slides out from parent

**4. Bookmark Drop (when selecting item)**
- Burgundy ribbon bookmark slides down from top
- Settles on selected item with bounce

---

## Interaction Patterns

### Navigation

**Breadcrumbs (Library Navigation):**
```
📚 Library > 📖 Checkout Flow > 📑 Inventory Check
```
- Each level clickable
- Gold separators (>)
- Current level in bold

**Keyboard Shortcuts:**
```
Ctrl/Cmd + K  - Quick search (card catalog)
Ctrl/Cmd + T  - Open trace finder
Ctrl/Cmd + F  - Find in canvas
Esc           - Close overlay/modal
Space         - Play/pause trace animation
Arrow keys    - Navigate canvas
+/-           - Zoom in/out
```

### Context Menus

**On Canvas Node (right-click):**
```
┌──────────────────────────┐
│  📖 View Details         │
│  📊 Analyze Impact       │
│  📈 Show Coverage        │
│  🔗 Find Dependencies    │
│  ───────────────────     │
│  📂 Open Source File     │
│  📋 Copy Node ID         │
└──────────────────────────┘
```

**On Trace (right-click):**
```
┌──────────────────────────┐
│  👁️ View Full Trace      │
│  📊 Compare with...      │
│  📈 Performance Profile  │
│  ───────────────────     │
│  📋 Copy Trace ID        │
│  📥 Export JSON          │
└──────────────────────────┘
```

---

## Responsive Behavior

### Desktop (1920×1080 and up)
- Full three-column layout
- Sidebar: 280px
- Reading Room: Flexible
- Bottom Panel: 300px

### Laptop (1366×768)
- Collapsible sidebar (toggle with Ctrl+B)
- Bottom panel: 250px
- Toolbar icons smaller

### Tablet (landscape)
- Sidebar overlay (slides in/out)
- Bottom panel becomes tabs that slide up
- Touch-optimized buttons

---

## Mock Data Generation

### Sample Datasets

**1. Canvases (5 examples)**
- checkout-flow.otel.canvas
- user-registration.otel.canvas
- payment-processing.otel.canvas
- architecture.canvas (static)
- system-overview.canvas (static)

**2. Traces (100+ examples)**
- 70% success (200-1500ms)
- 20% slow (>1500ms)
- 10% failed (various failure points)
- Time range: Last 24 hours

**3. Coverage Data**
- 150 total files across 3 component types
- 82% overall coverage
- Realistic gaps in business-logic layer

**4. Library Definition**
- 5 node component types
- 3 edge component types
- Source globs for each type

---

## Technical Stack Recommendations

**Frontend:**
- React + TypeScript
- React Flow (for canvas rendering)
- Recharts (for metrics/charts)
- Framer Motion (for animations)
- TanStack Query (for data fetching)

**Styling:**
- Tailwind CSS (utility classes)
- CSS Modules (component styles)
- Custom fonts from Google Fonts

**State Management:**
- Zustand (lightweight, simple)
- Context for theme

**Mock Backend:**
- MSW (Mock Service Worker)
- Faker.js (for realistic data)
- Local storage for persistence

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Layout structure
- File tree navigation
- Basic canvas rendering
- Mock endpoints setup

### Phase 2: Core Features (Week 2)
- Trace overlay on canvas
- Node/trace selection
- Bottom panel with tabs
- Coverage visualization

### Phase 3: Advanced Features (Week 3)
- Impact analysis
- Change simulation
- Hierarchical composition
- Search and filtering

### Phase 4: Polish (Week 4)
- Library aesthetic refinement
- Animations and transitions
- Responsive design
- Performance optimization

---

## Success Metrics

**Demo Effectiveness:**
- User can find failed component in trace within 30 seconds
- Coverage gaps identified and visualized clearly
- Impact analysis shows quantified blast radius
- Hierarchical navigation feels intuitive
- Library aesthetic creates memorable experience

**Technical Quality:**
- Initial load < 2 seconds
- Smooth 60fps animations
- Works on all modern browsers
- Accessible (WCAG AA)

---

## Accessibility Considerations

**ARIA Labels:**
- All interactive elements labeled
- Canvas nodes have descriptions
- Trace timeline screen-reader friendly

**Keyboard Navigation:**
- Full keyboard support
- Focus indicators visible
- Skip links for main sections

**Color Contrast:**
- All text meets WCAG AA
- Status colors distinguishable
- High-contrast mode available

**Screen Readers:**
- Semantic HTML structure
- Live regions for dynamic updates
- Alternative text for visualizations

---

## Future Enhancements

**Phase 2 Features:**
- Real-time trace streaming
- Collaborative annotations
- Custom canvas templates
- Export to PDF/PNG
- Integration with CI/CD
- Slack/Teams notifications
- Multi-workspace support

**Advanced Visualizations:**
- 3D dependency graphs
- Flame graphs for performance
- Sankey diagrams for flow analysis
- Timeline scrubbing

---

## Appendix: Sample Mocked Data

### Example: Checkout Flow Canvas with Failed Trace

**Canvas:** checkout-flow.otel.canvas (5 nodes, 4 edges)

**Trace:** trace-abc123 (Failed at inventoryCheck)
- validateUser: 100ms ✓
- inventoryCheck: TIMEOUT (8000ms) ✗
- processPayment: NOT REACHED
- sendConfirmation: NOT REACHED

**Coverage:**
- validateUser: 100% (all files instrumented)
- inventoryCheck: 70% (missing files listed)
- processPayment: 95%

**Impact Analysis:**
- Downstream: checkout (10K req/min), orderCreation (8K req/min)
- Upstream: validateUser (required), database (direct dep)
- Critical Path: 67% of total latency
- Blast Radius: $30K/hour revenue at risk

---

This design document provides a complete blueprint for building a production-ready demo with a distinctive library/book aesthetic that showcases all the runtime validation capabilities we've documented.
