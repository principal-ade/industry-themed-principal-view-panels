


One-liner: System stories that validate agent-built software

Describe your product
In a few sentences, tell us what you're working on and why it matters. Is there a particular vertical or customer that you are servicing or focusing on?

Software is becoming machine-written, and the old interface—files, logs, dashboards—assumes humans can inspect systems through text. That assumption is breaking.

Our wedge is System Stories: engineers define expected behavior as narrative templates, and we validate production telemetry against them. Instead of querying logs, you watch the system's behavior as a visual narrative—what actually happened vs. what should have.

Long-term, Principal becomes the shared world model that lets humans supervise and agents operate. This is not observability. It's a new interface.

Focus: Engineering teams adopting AI-assisted development who need to cut mean time to understanding—from hours of log diving to minutes of watching the story.

What stage are you at?
Beta/testflight
Describe how your agent system works.
For context, refer to our blog post regarding the theme of this Camp.

The problem with agents isn't that they can't write code. It's that no human can read fast enough to know what they built.

So we flipped the question: What if humans and agents used the same interface?

System Stories are the shared language.

Engineers write narrative templates describing expected behavior: "When user authenticates, gateway validates → auth service confirms → session created." Simple. Human-readable. But also machine-readable.

Agents use these stories as their specification. Humans use them as their validation criteria. Same document. Same truth.

Here's the loop:

Development agent changes code. Testing agent deploys and captures telemetry. Our narrative agent matches the execution trace to the story template. Did the system do what the story said it should?
Match: Auto-merge. System behaved as intended.
Violation: Generate visual narrative showing expected vs. actual. Human sees: "You said auth service confirms. It timed out instead. Here's the trace as a story."
The human never reads logs. They watch a visual narrative of what diverged and why.

This scales to multiple agents because they share the world model.

Code generation agent, architecture agent, testing agent, narrative agent—all reference the same canvases (visual system graphs) and stories. When one agent changes system structure, the others see the visual diff immediately. The canvas coordinates them. The stories keep them aligned.

Memory persists in Git, not cloud platforms. Your institutional knowledge compounds. Stories evolve as production behavior teaches you what's real.

Why this is agent supervision, not observability:

Observability assumes you know what to watch. We flip it: you define what should happen, we watch for everything else.

That's ambient intelligence. That's autonomous validation. That's how humans stay in control when agents write most of the software.

Principal isn't making agents faster. It's building confidence in agent-built systems.

Link to a live product or demo for us to play with.
For those without a live product: we would like to see even a rough prototype. It doesn't need to be perfect or polished, just something that can demonstrate a proof of concept

Need 

Share screenshots of your product
If it's not live, please share mockups

need

Drop files here-----Videos: 1. Founder(s) background (1min max): who are you? 2. Product demo (1-2min): what are you building and what is the problem you are solving? 3. Explain the agentic aspects of your product. (1min max)
Please link to a video recording of yourself answering these three questions - either three separate clips or a single video covering the three points above. PLEASE stick to the time limits! 4 minutes total, maximum. Any link (YT, Notion, Drive) works for us.-----


Any other relevant link you want to share? (deck/demo/alpha/testflight/github/etc.)
Share any/all links that can give us a sense of your product. Or maybe its your personal blog or Twitter that will help us understand you better.-----
I will do

Do you have any interesting strategies for distribution or growth?
What’s the plan now? Still File City or something else?


What's your technical stack?
Explain in as much detail how your product works and the various models, frameworks, infrastructure, and tools you use, including any notable AI assisted coding strategies. Is there any particular design, architecture, or technical choice that we should attend to that distinguishes your approach?

THE RADICAL CHOICE: GIT IS OUR DATABASE

Every other AI coding tool stores context in cloud databases. We store everything in Git. That's not a feature—it's our architecture.

Canvas definitions (.canvas files), System Stories (.narrative.json), execution artifacts—all live in .principal-views/ folders inside repositories. Version-controlled, branchable, mergeable. When your context is infrastructure, you can't vendor-lock it.

CORE STACK
Frontend: React 19, TypeScript, Vite
Graph Visualization: XyFlow (React Flow), Framer Motion for animations
Telemetry: OpenTelemetry (OTLP protocol), custom span parsers
AI: Claude Sonnet 3.5 via Anthropic API for narrative generation
Agent Integration: UTCP (Universal Tool Call Protocol)
DISTINGUISHING ARCHITECTURE
#1: PANEL EXTENSION FRAMEWORK
We're not building a monolithic platform. We built a plugin architecture where UI components are NPM-published React panels discovered via package.json keywords.

Developers install panels as dependencies: npm install @industry-theme/principal-view-panels

Host applications (IDEs, CLIs, web apps) load panels dynamically. Panels communicate via event-driven pub/sub API.

Why this matters: We exist as infrastructure, not a destination. Principal appears where developers already work—VS Code, CI/CD, Slack, terminal—not as another platform to context-switch to.

#2: VISUAL-FIRST DATA MODEL
Most observability tools start with metrics/logs and add visualization. We inverted it: the canvas IS the data model.

Canvas Parser reads .canvas JSON files (node/edge definitions) and library.yaml for reusable component types. Graph Renderer creates custom node components for different entity types (services, functions, data stores). Traces replay as animated events moving through the graph.

When you query our system, you're querying the visual representation, not transforming data into visuals afterward.

#3: NARRATIVE GENERATION SYSTEM
Input: Raw OpenTelemetry trace (spans, events, logs)
Processing:
Scenario detection: analyze span statuses, timing patterns (success/error/timeout?)
Template matching: load .narrative.json template for this canvas
LLM generation: Claude fills template variables with trace values, adds contextual explanation
Structured output: JSON with narrative sections + visual annotations on canvas
Output: Human-readable story + visual highlights
Stories live in version control as .narrative.json files. They're reviewed in PRs like code. They evolve with the system.

#4: AGENT-NATIVE TOOL PROTOCOL
We expose tools via UTCP (Universal Tool Call Protocol):
focus_node: agent instructs UI to highlight service/component
trigger_event: agent simulates execution flow for visualization
reset_view: agent returns to overview
Why UTCP: Server-safe imports (no React dependencies in tool definitions). Compatible with MCP (Model Context Protocol) ecosystem. Any LLM provider can use our tools.

Multi-agent coordination: code agents, architecture agents, testing agents, narrative agents all share the canvas as ground truth. Visual feedback loop keeps agents aligned.

AI-ASSISTED CODING STRATEGY
We dogfood aggressively. Principal AI is built with Principal AI.
All narrative templates authored with Claude Code from example traces
Architecture agent scans codebase for new services/dependencies, proposes canvas updates
We use our own verify-deploy loop: when we change code, our testing agent validates it against our own System Stories
The meta-loop: We're using agent supervision tools to build agent supervision tools. Every pain point we hit becomes a feature.

PERFORMANCE & SCALE
Lazy-loaded data slices (only fetch file tree when needed)
Virtual rendering for large graphs (1000+ nodes)
Web Workers for graph layout calculations
Canvas files are small (JSON definitions ~10KB each)
TECHNICAL CHOICES THAT MATTER
Git-native storage eliminates third-party costs. No vendor lock-in. Context compounds as institutional knowledge.
Panel framework enables ubiquitous distribution. One codebase → IDE extensions, CI/CD plugins, Slack bots, CLI tools.
Visual-first architecture changes how agents interact with systems. They don't get "API access to metrics." They see what humans see.
Stories-as-code makes intent version-controlled. Not buried in test files. Not tribal knowledge. Explicit, reviewable, evolvable.
This isn't incremental. It's architectural.

Who are your competitors and what makes you different?
Is there an existing product or category that you are displacing / disrupting? Share links if possible.

Our biggest competitor isn't a product. It's the belief that you understand software by reading it.

But engineers at Amazon, Capital One, and other tech companies are already saying they don't review AI-generated code anymore. One engineer: "I am near 100% using Claude. All I do is prompts and testing. Very rarely will I review code written."

They've abandoned code as the primary interface. But they still have the same problems:
Understanding what the system does (no behavioral clarity)
Debugging when something breaks (hours in logs)
System Stories solve both. Define expected behavior upfront. When violations occur, watch a visual narrative of what diverged—in minutes, not hours.

ADJACENT CATEGORIES (NOT COMPETITORS)
Observability Platforms (Datadog, New Relic, Honeycomb)
What they do: Collect metrics, logs, traces; alert on thresholds
Why different: They tell you something broke. We show what happened vs. what should have happened as a visual story. Cuts debugging from hours to minutes.
Distributed Tracing (Jaeger, Zipkin, Lightstep)
What they do: Visualize request flows as timelines
Why different: Timelines show what happened. We show what happened vs. what you expected with AI-generated narratives. Plus we validate agent changes before production.
AI Coding Assistants (Cursor, GitHub Copilot, Windsurf)
What they do: Generate code fast
Why different: They're the write layer. We're the understand and debug layer. They make our problem more urgent—when agents write code quickly, you need to debug it quickly.
THE CATEGORY GAP
Tests tell you: "Did this scenario pass?"
They don't tell you: "What actually happened in production? Why did this path get taken?"

That's where incidents live. That's where engineers spend hours debugging.

System Stories capture expected behavior upfront, then show violations as visual narratives. The human doesn't query logs. They watch: "You expected auth service to confirm. It timed out. Here's why."

WHAT WE UNDERSTAND THAT THEY DON'T
Visual narratives vs. text logs
Logs are the wrong interface when you didn't write the code. Stories show causality visually.
Story-based validation vs. metric alerts
Traditional: "Latency spike → alert → 2 hours finding root cause"
Us: "Behavior violated story → visual narrative → root cause in minutes"
Format ownership
Canvas files and System Stories live in Git. The new standard for behavioral expectations.
THE REAL DISRUPTION
We're not displacing Datadog. We're answering a question that didn't exist before: "How do humans stay in control when agents build most of the software?"

That's the Betaworks-scale opportunity. Not better tools. A new interface for a new era.

What is another startup or founder that you admire? Tell us why.
Help us get a sense of your perspective and taste

Startup: tldraw / Founder: Steve Ruiz

We don't just admire tldraw—we're in dialogue with them. When we posted about using their codebase as a case study for Principal, the official @tldraw account responded asking "what am I looking at?" and reposted it (2.6K+ views, 14 saves).

That interaction matters because tldraw represents everything we're building toward:
Primitives over platforms
tldraw built shapes, canvas, collaboration primitives that others build on. We're doing the same with canvases, traces, narratives. Infrastructure, not apps.
Spatial thinking
Steve Ruiz advocates for "spatial software"—2D space as a fundamental organizing principle. We believe software architecture IS spatial. Execution flow IS spatial. Understanding should be spatial, not linear text.
Open ecosystem
tldraw is OSS with a thriving plugin ecosystem. Our panel framework and canvas format follow the same philosophy. Infrastructure should be open.
Taste at the foundation
Even though tldraw is developer-focused, it's beautifully designed. We apply the same standard: not just functional, genuinely delightful. The agentic era deserves tools that are visual but not overwhelming, powerful but not complex.
Local-first
Steve is vocal about local-first software. Our canvas files living in .principal-views/ folders in repos is the same philosophy: data with the code, not locked in a platform.
The way tldraw makes complex spatial interactions feel effortless is what we're aiming for. When someone pans through a system architecture in Principal, it should feel as smooth as drawing in tldraw.

The fact that they engaged with our work validates we're thinking about spatial interfaces the right way.

X link: https://x.com/Principal_ADE/status/2005325269499068734?s=20

Are you implementing any research that we could familiarize ourselves with before meeting you?


We're building at the intersection of distributed tracing (Google's Dapper paper), software visualization for human cognition (LaToza's work showing visual representations reduce comprehension time 40%), and AI agent supervision (Anthropic's Constitutional AI on behavioral constraints). Most observability tools implement tracing; most AI tools ignore visualization and supervision—we combine all three, which is why System Stories work.

-Inception Date
When did you start working on this idea? If a company exists, provide the founding date.
Date format: yyyy-mm-dd

Prior funding
Have you raised any prior funding via investment or grant programs? From Funds or Angels? Please indicate the total amount that you have raised.

None. Bootstrapped to date.

Origin story & bios
Tell us any relevant information about how your company/product was born and share your team bios.

October 2025. San Francisco Tech Week. A long line for a pitch contest.

Fernando Ramirez had spent six months building an "agentic development environment"—Git as agent infrastructure. Julie and Michael Allen were pitching PIRL, a vibe-coded app they'd hit a wall on. They got talking. Complementary skills. Mutual curiosity.

The insight hit fast: Fernando was building the technical foundation for agent supervision. Julie had been researching AI + observability sparked by Cisco's Splunk acquisition. Michael understood the operational side of scaling businesses. They were each solving different pieces of the same problem.
October 14, 2025: All three went full-time on Principal AI.
October 19: Attended Austin Tech Week to pitch and validate.
Fernando then drove from Little Rock to Sioux Falls and basically moved in with Michael. We’ve all been building together ever since.


In November, Michael and Fernando attended AI Engineer Dev Conference in NYC. To further test and validate Principal AI’s concept.

Team Bios:
Fernando Ramirez - Co-Founder & CTO
Ex-Google, ex-Airbnb. 6 months independent research on Git as agentic infrastructure. Built Principal's core architecture: panel system, canvas definitions, UTCP protocol. Deep expertise in distributed systems, developer tooling, agent orchestration.
Julie Allen - Co-Founder & Chief Product Officer
8+ years at Cisco. 5 tech patents. Led AI messaging during ChatGPT moment (80,000 employees). NDA comms team for $28B Splunk acquisition which sparked researching AI + observability intersection. Certificate in Applied Narrative Intelligence. Power user of AI vibe-coding tools.
Michael Allen - Co-Founder & Chief Operating Officer
Built 3 businesses from the ground up. Proven ops, growth strategy, people management. At Principal: operations, growth, team building. Validates interface works for non-technical users. Translates user needs into requirements both humans and agents understand.
Why are you the team to solve this problem?
Tell us about your passion and industry experience - why does your team have an edge here?

We see the category others don't

Everyone else thinks they're building better observability or better debugging. We see: the interface layer for supervising agent-built systems. That reframe changes the architecture, product, and market.

Unfair advantages
Four provisional patents filed: Including our Context Scaffolding System—Git-native architecture for storing context, stories, and behavioral expectations alongside code. We have IP on treating context as infrastructure. Competitors can copy features, not the architectural foundation.
We're our own case study: We've been using Principal to build Principal. Every feature exists because we needed it to supervise the agents building our own product. We dogfood aggressively—our verify-deploy loop validates our own agent-generated code against our own System Stories.
Format ownership: Canvas files and System Stories live in Git. We're creating the standard, like .tf for Terraform.
Why we'll win
Category creation at the perfect moment. Betaworks sees agent systems as the infrastructure shift. We're the interface layer for that shift—playing a different game than observability or coding tools.
Technical moats stack: Git-native architecture (four provisional patents). Panel framework (ubiquitous distribution). Stories-as-code (institutional knowledge compounds). Each is defensible alone. Together, competitors can't copy without rearchitecting everything.
We were each independently researching this before we met. We're using our own product to build it. IP. Most teams at our stage are still validating. We're already executing.


