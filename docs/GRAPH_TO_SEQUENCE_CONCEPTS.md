# Graph vs Sequence Diagram: Conceptual Translation

## Fundamental Model: Sequence First, Graph as Aggregation

**The Core Insight**: We are **sequence diagram first**. Graphs (canvases) are essentially **aggregations of sequence diagrams** - they show the union of all possible execution paths that have been observed or designed.

This means:
- **Sequence diagrams** = Primary source of truth (actual execution traces)
- **Graphs** = Derived view showing all possible interaction paths
- **Edges** = Must represent actual interactions/communications, not abstract dependencies

## Two Types of Events: Move vs Transform

All events in an OTEL system fall into two fundamental categories:

### **Move Events** (Communication/Transfer)
Events that **transfer data across participant boundaries**:
- `request.sent` - Data leaves one participant
- `message.received` - Data arrives at another participant
- `event.emitted` - Data broadcast to listeners
- `response.returned` - Result sent back

**In sequence diagrams:** These are the **arrows/messages** between lifelines
**In OTEL canvases:** These are **edges** connecting participant nodes

### **Transform Events** (Computation/Processing)
Events that **process/change data within a participant**:
- `validation.completed` - Data validated
- `token.generated` - New data created
- `data.parsed` - Data restructured
- `session.created` - State changed

**In sequence diagrams:** These are represented by **activation bars** (vertical rectangles showing processing)
**In OTEL canvases:** These are **annotations/metadata on participant nodes**

### Canvas Structure Implications

```
┌─────────────────┐
│  auth-service   │ ← Node = Participant (not an event)
│                 │
│  Transform events (internal):
│  • validation.started
│  • token.generated
│  • session.created
└─────────────────┘
        │
        │ request.forwarded ← Edge = Move Event
        ↓
┌─────────────────┐
│    database     │ ← Node = Participant
└─────────────────┘
```

**Key principle**:
- **Nodes** represent participants (the "who")
- **Edges** represent move events (the "what happened between")
- **Transform events** decorate nodes (the "what happened within")

### Example: Login Flow

**OTEL Events Generated:**
1. `request.received` (move - arrives at API Gateway)
2. `request.forwarded` (move - sent to Auth Service)
3. `validation.started` (transform - processing in Auth Service)
4. `validation.completed` (transform - processing in Auth Service)
5. `token.generated` (transform - processing in Auth Service)
6. `response.returned` (move - sent back to API Gateway)

**Canvas Representation:**
```
┌──────────────┐                           ┌──────────────┐
│ api-gateway  │──request.forwarded──────>│ auth-service │
│              │                           │              │
│              │                           │ Transform events:
│              │                           │ • validation.started
│              │                           │ • validation.completed
│              │                           │ • token.generated
│              │<──response.returned───────│              │
└──────────────┘                           └──────────────┘

2 participant nodes
2 move event edges
3 transform event annotations
```

**Sequence Diagram:**
```
 api-gateway          auth-service
      |                    |
      |─request.forwarded─>|
      |                    |█ validation.started
      |                    |█ validation.completed
      |                    |█ token.generated
      |<─response.returned─|
      |                    |
```

Both representations show the same information, structured differently:
- Canvas: Spatial, shows all possible paths
- Sequence: Temporal, shows one specific execution

## Core Concepts

### What is a Sequence Diagram? (PRIMARY)

A **sequence diagram** represents a **temporal execution path**:

- **Participants** = Actors/systems that send/receive messages
- **Messages** = Interactions between participants over time
- **Lifelines** = Timeline showing when each participant is active
- **Order** = Explicit temporal sequence (top-to-bottom)

**Key Properties:**
- **Single-path**: One specific execution trace through the system
- **Dynamic**: Represents what actually happened (or a scenario)
- **Temporal**: Y-axis is time, order matters
- **Participant-centric**: Organized by WHO, not WHAT
- **Interaction-based**: Shows actual communication/causation

### What is a Graph (Canvas)? (AGGREGATED)

A **graph** is an **aggregation of possible execution paths**:

- **Nodes** = **Participants** (actors/systems that interact)
  - Examples: `auth-service`, `database`, `api-gateway`
  - Can be scopes or event namespaces for granularity
- **Edges** = **Move Events** (interactions that CAN happen between participants)
  - Examples: `request.forwarded`, `response.returned`, `event.emitted`
  - Observable cross-boundary communications
- **Node Annotations** = **Transform Events** (internal processing within participants)
  - Examples: `validation.completed`, `token.generated`
  - Internal state changes or computations
- **Structure** = Shows ALL possible interaction paths through the system
- **Semantics** = "These are the interactions that have been observed or are possible"

**Key Properties:**
- **Multi-path**: Can have branching, multiple routes, cycles (union of all sequence diagrams)
- **Aggregated**: Represents all observed or designed execution patterns
- **Participant-centric**: Nodes are the actors, edges are their interactions
- **Type-rich**: Edges can have different movement semantics (calls, emits, data-flow)
- **Observable-only**: Edges represent actual communication, not design dependencies

## Fundamental Differences

| Aspect | Graph (Canvas) | Sequence Diagram |
|--------|-------|------------------|
| **Perspective** | All possible interactions | Specific execution trace |
| **Cardinality** | Union of all sequences | Single sequence |
| **Nodes** | Participants (actors/systems) | Participants (lifelines) |
| **Edges** | Move events (possible interactions) | Messages (actual interactions) |
| **Annotations** | Transform events (internal processing) | Activation bars (processing time) |
| **Organization** | Spatial layout | Temporal swimlanes |
| **Branching** | Explicit (multiple edges) | Implicit (alt/opt fragments) |
| **Time** | Absent (aggregated) | Explicit (Y-axis) |

## The Relationship Between Graphs and Sequences

### What We Actually Have

Since we're **sequence-first**:

1. **Sequence Diagrams (Workflows)**: Specific execution traces showing participant interactions over time
2. **Graph (Canvas)**: Aggregation of all possible sequences, showing the full interaction space

### The Mapping

**Sequence → Graph (Aggregation)**
- Each message/interaction in a sequence becomes a potential edge in the graph
- Each participant event becomes a node
- Multiple sequences contribute to the same graph, creating branches/alternatives

**Graph → Sequence (Selection)**
- A workflow scenario selects a specific path through the graph
- The temporal order comes from the sequence, not the graph structure
- The graph validates that the sequence is possible

### Key Requirements for OTEL Canvases

To support this bidirectional relationship, canvases must:
1. **Participant identification**: Scopes or event namespaces define participants
2. **Interaction semantics**: Edges represent actual observable interactions (`calls`, `emits`, `data-flow`)
3. **No abstract dependencies**: Edges must correspond to sequence diagram messages
4. **Temporal neutrality**: Graph structure doesn't dictate time; sequences do

## The Unified Model: Move/Transform Events

With the move/transform distinction, we now have a **single, coherent model**:

### Canvas Structure

```
Canvas:
  nodes:
    - id: "api-gateway"
      scope: "api-gateway"
      transformEvents:
        - "request.received"
        - "response.sent"

    - id: "auth-service"
      scope: "auth-service"
      transformEvents:
        - "validation.started"
        - "validation.completed"
        - "token.generated"

  edges:
    - from: "api-gateway"
      to: "auth-service"
      moveEvent: "request.forwarded"
      type: "calls"

    - from: "auth-service"
      to: "api-gateway"
      moveEvent: "response.returned"
      type: "data-flow"
```

### Sequence Derivation

A sequence diagram is derived by:
1. **Selecting a path** through the canvas (which move events occurred)
2. **Ordering move events** temporally (from scenario/workflow)
3. **Including transform events** that happened at each participant
4. **Drawing arrows** for move events, **activation bars** for transform events

### Benefits of This Model

1. **Structural alignment**: Canvas nodes = Sequence lifelines (participants)
2. **Direct mapping**: Canvas edges = Sequence messages (move events)
3. **Complete information**: Transform events preserved as node annotations
4. **No duplication**: Single source of truth with dual views
5. **Observable-only**: Everything in the canvas corresponds to OTEL telemetry

## Key Insights

### 1. Two Fundamentally Different Event Types

**Move Events** (canvas edges / sequence messages):
- "Data crossed a participant boundary"
- Cross-boundary perspective
- Example: `request.forwarded` from api-gateway to auth-service
- Observable as arrows in sequence diagrams

**Transform Events** (canvas node annotations / sequence activation bars):
- "Data was processed within a participant"
- Internal perspective
- Example: `validation.completed` within auth-service
- Observable as activation bars in sequence diagrams

A single interaction (move event) might trigger multiple transform events:
```
Move: request.forwarded → auth-service
  Transform: validation.started
  Transform: validation.completed
  Transform: token.generated
Move: response.returned → api-gateway
```

### 2. Participants Are Canvas Nodes (Derived from Scopes or Namespaces)

**Canvas nodes represent participants**, which can be derived from:

**Option A: Scopes as Participants**
- Each OTEL instrumentation scope becomes a participant node
- Simple, direct mapping
- Example: `auth-service` scope → `auth-service` participant node

**Option B: Event Namespaces as Participants**
- Parse event names to extract participant identity
- More granular architectural view
- Example:
  ```
  Scope: "auth-service"
  Events:
    - "auth.validation.started"  → Participant: "auth.validation"
    - "auth.session.created"     → Participant: "auth.session"
    - "auth.database.query"      → Participant: "auth.database"
  ```

**Expandable Participant Granularity**:

This allows flexible visualization:

- **Collapsed view**: Single `auth-service` node (scope-level)
  - All transform events shown on one node
  - Move events between services only

- **Expanded view**: Multiple nodes (`auth.validation`, `auth.session`, `auth.database`)
  - Transform events split across internal participants
  - Move events show internal component interactions

- **Hybrid view**: Collapse some participants, expand others based on focus

This expandability provides:
- **Flexibility**: Choose the right level of abstraction for different audiences
- **Granularity**: Show internal component interactions when needed
- **Clarity**: Hide implementation details when focusing on service-to-service communication

### 3. Graph Edges Are Move Events

Since graphs aggregate sequence diagrams, **edges must represent move events** - actual data transfers across participant boundaries.

**Valid edge types for OTEL canvases (all are "move" operations):**
- `calls`: Synchronous move - participant A sends request to participant B, waits for response
  - Example: API Gateway → Auth Service (validate credentials)
- `emits`: Asynchronous move - participant A sends event/message to participant B, doesn't wait
  - Example: Auth Service → Event Bus (user.authenticated)
- `data-flow`: Data move - participant A transfers data to participant B
  - Example: Database → Auth Service (user record)

**NOT intended for OTEL canvases:**
- `depends-on`: This is a design-time constraint, not a runtime move event
  - Doesn't represent data crossing a boundary
  - Can't be drawn as a message arrow in a sequence diagram
  - Belongs in design docs, not execution traces

**Transform events** (validation, parsing, generation) should be:
- **Annotations on nodes**, not edges
- They happen **within** a participant, not **between** participants
- They appear as activation bars in sequence diagrams, not as arrows

**Rule**: **If an event doesn't move data across participant boundaries, it shouldn't be an edge.**

### 4. Temporal Order vs Causal Order

**Canvas edges (move events)** show possible causal paths: "A can trigger B"
- The graph structure shows **what CAN cause what**
- Multiple edges from a node = multiple possible next interactions
- Represents the union of all observed causality

**Sequence diagrams** show actual temporal order: "A happened, then B happened"
- The Y-axis shows **what DID happen and when**
- Single path through the graph
- Specific instance of causality

**Key distinction:**
- **Canvas**: Shows all possible causal relationships (aggregated)
- **Sequence**: Shows one specific temporal execution (concrete)
- Temporal order in sequences must respect causal edges in canvas
- But not all possible edges are traversed in every sequence

## Revised Mental Model: Sequence-First

### The Sequence Diagram is the Story

A sequence diagram (workflow execution) tells:
- **Who**: Which participants were involved
- **What**: What interactions occurred (messages, calls, events)
- **When**: In what temporal order
- **How**: With what data/attributes

**This is the primary source of truth** - it represents what actually happened.

### The Graph is the Library of Possibilities

The canvas/graph aggregates:
- **All Observed Stories**: Union of all sequence diagrams seen or designed
- **Possible Interactions**: What edges CAN exist between participants
- **Event Catalog**: What events can occur in the system
- **Branching Points**: Where different execution paths diverge

**This is derived from sequences** - it shows the possibility space.

### The Scenario is the Script

A scenario (workflow template) defines:
- **Expected Path**: Which events should occur in a typical execution
- **Validation Rules**: What makes a valid sequence through the graph
- **Templates**: Reusable patterns for common execution flows

**This connects sequences to the graph** - it defines valid paths through the possibility space.

## Implementation Strategy

With the move/transform model, the implementation becomes straightforward:

### Canvas Schema Updates

```typescript
interface Canvas {
  nodes: ParticipantNode[]
  edges: MoveEventEdge[]
}

interface ParticipantNode {
  id: string                    // e.g., "auth-service"
  scope?: string                // OTEL scope mapping
  eventNamespace?: string       // e.g., "auth.*" for pattern matching
  transformEvents?: string[]    // Internal events: ["validation.started", ...]
}

interface MoveEventEdge {
  from: string                  // Source participant node ID
  to: string                    // Target participant node ID
  moveEvent: string             // Event name: "request.forwarded"
  type: "calls" | "emits" | "data-flow"
  label?: string                // Display label
}
```

### Sequence Generation Algorithm

```
Given: Canvas + Workflow Scenario

1. Extract participant nodes from canvas
2. For each event in scenario temporal order:
   a. Classify event as move or transform
   b. If move event:
      - Find matching edge in canvas
      - Add message arrow to sequence diagram
   c. If transform event:
      - Find participant node by scope/namespace
      - Add to activation bar on that lifeline

3. Render sequence diagram with:
   - Lifelines for each participant
   - Message arrows for move events (ordered temporally)
   - Activation bars showing transform events
```

### Migration Path

**Phase 1: Identify current edge usage**
- Audit existing canvases for edge types
- Classify edges as move events or dependencies
- Flag `depends-on` edges for removal/restructuring

**Phase 2: Restructure canvases**
- If needed, convert event nodes to participant nodes
- Move transform events to node annotations
- Keep only move events as edges

**Phase 3: Update tooling**
- Canvas editor to support participant nodes
- Sequence diagram generator using new algorithm
- Validation to enforce move-event-only edges

## Edge Confinement Rules for OTEL Canvases

Given the sequence-first model and move/transform distinction, edges in OTEL canvases must be **confined to move events**:

### ✅ Valid Edges (Move Events - Cross Participant Boundaries)

1. **`calls`**: Synchronous move
   - Participant A sends to B, waits for response
   - Example: API Gateway → Auth Service (validate credentials)
   - Sequence diagram: Solid arrow →

2. **`emits`**: Asynchronous move
   - Participant A sends to B, doesn't wait
   - Example: Auth Service → Event Bus (user.authenticated)
   - Sequence diagram: Dashed arrow ⇢

3. **`data-flow`**: Data transfer
   - Data moves from A to B
   - Example: Database → Auth Service (user record)
   - Sequence diagram: Return arrow or data transfer ←

### ❌ Invalid Edges (Transform Events - Internal to Participants)

These should be **node annotations**, not edges:

1. **Transform events**: `validation.completed`, `token.generated`, `data.parsed`
   - Why: Don't cross participant boundaries
   - Where: Annotate the participant node
   - Sequence diagram: Show as activation bars, not arrows

2. **`depends-on`**: Abstract dependency
   - Why: Not a runtime move event, no data transfer
   - Where: Design documentation, not OTEL canvas
   - Sequence diagram: Cannot be drawn as a message

### Event Classification Rules

**For any OTEL event, ask:**

1. **"Does this event move data across a participant boundary?"**
   - **Yes** → Move event → Canvas edge
   - **No** → Transform event → Node annotation

2. **"Can this be drawn as a message arrow in a sequence diagram?"**
   - **Yes** → Valid edge
   - **No** → Not an edge

This ensures:
- Edges represent observable interactions between participants
- The graph structure mirrors sequence diagram structure
- Transform events are captured but don't pollute the interaction graph

## Open Questions

1. **Participant Granularity**: Should participants be scopes, services, or something else?
   - **Answer emerging**: Use scopes as default, with event namespaces for expandable granularity
2. **Multi-Scope Interactions**: How do we represent a single interaction that spans multiple scopes?
3. **Implicit vs Explicit**: Should interactions be derived or explicitly defined?
4. **Bidirectional Flow**: How do we represent request/response pairs?
5. **Async Communication**: How do we show async messages, events, broadcasts?

## Conclusion

**We are sequence-first, graph-aggregated, with move/transform event distinction.**

Key principles:
1. **Sequence diagrams are primary** - They capture actual execution traces with participants and interactions
2. **Graphs aggregate sequences** - Canvases show the union of all possible interaction paths
3. **Two types of events**:
   - **Move events** → Canvas edges (data crossing participant boundaries)
   - **Transform events** → Node annotations (processing within participants)
4. **Nodes are participants** - Not events themselves, but the actors/systems that interact
5. **Edges are move events** - Observable interactions that can be drawn as sequence diagram messages
6. **No abstract dependencies** - The `depends-on` edge type is not intended for OTEL canvases
7. **Participants are flexible** - Use scopes as default, expand into event namespaces for architectural granularity

This model resolves the translation problem by inverting it:
- We don't translate graphs to sequences
- We **aggregate sequences into graphs** and **select paths through graphs back to sequences**

The structural alignment is now clear:
```
Sequence Diagram          Canvas Graph
─────────────────         ────────────
Lifeline              →   Participant Node
Message Arrow         →   Move Event Edge
Activation Bar        →   Transform Event Annotation
```

The graph becomes a **navigation aid** and **validation tool** for understanding the full space of possible executions, while sequence diagrams remain the source of truth for what actually happens.
