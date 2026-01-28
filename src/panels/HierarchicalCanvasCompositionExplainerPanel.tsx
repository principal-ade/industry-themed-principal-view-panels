import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface HierarchicalCanvasCompositionExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1ThePattern: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">HIERARCHICAL CANVAS COMPOSITION</text>

        {/* Parent canvas */}
        <g>
          <rect x="150" y="50" width="300" height="80" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="3" rx="6" />
          <text x="300" y="75" textAnchor="middle" fill="#ddd6fe" fontSize="12" fontWeight="700">Parent Canvas</text>
          <text x="300" y="92" textAnchor="middle" fill="#c4b5fd" fontSize="9">High-level architecture</text>
          <text x="160" y="110" fill="#e9d5ff" fontSize="8">Composes child canvases:</text>
          <text x="165" y="122" fill="#a78bfa" fontSize="7" fontFamily="monospace">canvas: "./layer-1.otel.canvas"</text>
        </g>

        {/* Arrows down */}
        <line x1="230" y1="135" x2="150" y2="165" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple)" />
        <line x1="300" y1="135" x2="300" y2="165" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple)" />
        <line x1="370" y1="135" x2="450" y2="165" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple)" />

        {/* Child canvases */}
        <g>
          <rect x="40" y="170" width="140" height="95" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="110" y="190" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">Child Canvas 1</text>
          <text x="50" y="205" fill="#93c5fd" fontSize="8">API Layer</text>
          <text x="50" y="218" fill="#93c5fd" fontSize="8">• HTTP endpoints</text>
          <text x="50" y="231" fill="#93c5fd" fontSize="8">• Request validation</text>
          <text x="50" y="244" fill="#60a5fa" fontSize="7" fontStyle="italic">Own narratives</text>
          <text x="50" y="256" fill="#60a5fa" fontSize="7" fontStyle="italic">Own events</text>
        </g>

        <g>
          <rect x="230" y="170" width="140" height="95" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="190" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Child Canvas 2</text>
          <text x="240" y="205" fill="#6ee7b7" fontSize="8">Business Logic</text>
          <text x="240" y="218" fill="#6ee7b7" fontSize="8">• Domain rules</text>
          <text x="240" y="231" fill="#6ee7b7" fontSize="8">• Validation</text>
          <text x="240" y="244" fill="#34d399" fontSize="7" fontStyle="italic">Own narratives</text>
          <text x="240" y="256" fill="#34d399" fontSize="7" fontStyle="italic">Own events</text>
        </g>

        <g>
          <rect x="420" y="170" width="140" height="95" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" rx="4" />
          <text x="490" y="190" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">Child Canvas 3</text>
          <text x="430" y="205" fill="#c4b5fd" fontSize="8">Data Access</text>
          <text x="430" y="218" fill="#c4b5fd" fontSize="8">• Database queries</text>
          <text x="430" y="231" fill="#c4b5fd" fontSize="8">• Caching</text>
          <text x="430" y="244" fill="#a78bfa" fontSize="7" fontStyle="italic">Own narratives</text>
          <text x="430" y="256" fill="#a78bfa" fontSize="7" fontStyle="italic">Own events</text>
        </g>

        <defs>
          <marker id="arrow-purple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#8b5cf6" />
          </marker>
        </defs>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        <strong style={{ color: '#8b5cf6' }}>Hierarchical composition</strong> lets you decompose complex systems into smaller, manageable canvases that compose together. Each child canvas validates independently while parent canvases validate the composition.
      </div>
    </div>
  );
};

const Step2ParentChildSpans: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">OTEL PARENT-CHILD SPAN RELATIONSHIPS</text>

        {/* Single trace visualization */}
        <g>
          <rect x="40" y="50" width="520" height="235" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">Single Trace with Nested Spans (trace_id: xyz789)</text>

          {/* Root span */}
          <rect x="60" y="90" width="480" height="45" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="3" />
          <text x="70" y="108" fill="#ddd6fe" fontSize="9" fontWeight="600">Root Span: handleCheckout</text>
          <text x="75" y="122" fill="#c4b5fd" fontSize="7">span_id: span-root | parent_span_id: null | matched by: complete-flow.otel.canvas</text>

          {/* Child spans - level 1 */}
          <rect x="80" y="150" width="200" height="45" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="3" />
          <text x="90" y="168" fill="#dbeafe" fontSize="8" fontWeight="600">validateUser (API Layer)</text>
          <text x="95" y="182" fill="#93c5fd" fontSize="7">span_id: span-001 | parent: span-root</text>
          <text x="95" y="192" fill="#60a5fa" fontSize="6">matched by: api-layer.otel.canvas</text>

          <rect x="300" y="150" width="240" height="45" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="3" />
          <text x="310" y="168" fill="#d1fae5" fontSize="8" fontWeight="600">processOrder (Business Logic)</text>
          <text x="315" y="182" fill="#6ee7b7" fontSize="7">span_id: span-002 | parent: span-root</text>
          <text x="315" y="192" fill="#34d399" fontSize="6">matched by: business-logic.otel.canvas</text>

          {/* Child spans - level 2 */}
          <rect x="320" y="210" width="200" height="45" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" rx="3" />
          <text x="330" y="228" fill="#ddd6fe" fontSize="8" fontWeight="600">saveToDatabase (Data Access)</text>
          <text x="335" y="242" fill="#c4b5fd" fontSize="7">span_id: span-003 | parent: span-002</text>
          <text x="335" y="252" fill="#a78bfa" fontSize="6">matched by: data-access.otel.canvas</text>

          {/* Arrows showing parent-child */}
          <line x1="300" y1="115" x2="180" y2="145" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />
          <line x1="300" y1="115" x2="420" y2="145" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />
          <line x1="420" y1="195" x2="420" y2="205" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />
        </g>

        <defs>
          <marker id="arrow-orange" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <path d="M0,0 L0,8 L8,4 z" fill="#fbbf24" />
          </marker>
        </defs>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        OTEL spans form a <strong style={{ color: '#f59e0b' }}>natural hierarchy</strong> via <code>parent_span_id</code>. Different canvases can match different spans in the same trace, validating their respective parts of the system.
      </div>
    </div>
  );
};

const Step3UseCases: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 420" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">COMMON USE CASES FOR HIERARCHICAL COMPOSITION</text>

        {/* Use case 1: Layered Architecture */}
        <g>
          <rect x="40" y="45" width="250" height="85" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="65" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">1. Layered Architecture</text>
          <rect x="50" y="73" width="230" height="50" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="2" />
          <text x="60" y="88" fill="#93c5fd" fontSize="8">api-layer.otel.canvas</text>
          <text x="60" y="100" fill="#93c5fd" fontSize="8">business-logic.otel.canvas</text>
          <text x="60" y="112" fill="#93c5fd" fontSize="8">data-access.otel.canvas</text>
        </g>

        {/* Use case 2: Feature Modules */}
        <g>
          <rect x="310" y="45" width="250" height="85" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="65" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">2. Feature Modules</text>
          <rect x="320" y="73" width="230" height="50" fill="#022c22" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="330" y="88" fill="#6ee7b7" fontSize="8">auth-module.otel.canvas</text>
          <text x="330" y="100" fill="#6ee7b7" fontSize="8">billing-module.otel.canvas</text>
          <text x="330" y="112" fill="#6ee7b7" fontSize="8">reporting-module.otel.canvas</text>
        </g>

        {/* Use case 3: Subsystem Decomposition */}
        <g>
          <rect x="40" y="145" width="250" height="85" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="165" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">3. Subsystem Decomposition</text>
          <rect x="50" y="173" width="230" height="50" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" rx="2" />
          <text x="60" y="188" fill="#c4b5fd" fontSize="8">payment-processing.otel.canvas</text>
          <text x="60" y="200" fill="#c4b5fd" fontSize="8">fraud-detection.otel.canvas</text>
          <text x="60" y="212" fill="#c4b5fd" fontSize="8">transaction-logging.otel.canvas</text>
        </g>

        {/* Use case 4: Async/Background Workflows */}
        <g>
          <rect x="310" y="145" width="250" height="85" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="435" y="165" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="600">4. Async/Background Workflows</text>
          <rect x="320" y="173" width="230" height="50" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" rx="2" />
          <text x="330" y="188" fill="#fbbf24" fontSize="8">request-handling.otel.canvas</text>
          <text x="330" y="200" fill="#fbbf24" fontSize="8">background-jobs.otel.canvas</text>
          <text x="330" y="212" fill="#fbbf24" fontSize="8">event-handlers.otel.canvas</text>
        </g>

        {/* Use case 5: Different Zoom Levels */}
        <g>
          <rect x="40" y="245" width="250" height="85" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="2" rx="4" />
          <text x="165" y="265" textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="600">5. Different Zoom Levels</text>
          <rect x="50" y="273" width="230" height="50" fill="#082f49" stroke="#38bdf8" strokeWidth="1" rx="2" />
          <text x="60" y="288" fill="#7dd3fc" fontSize="8">high-level-overview.otel.canvas</text>
          <text x="60" y="300" fill="#7dd3fc" fontSize="8">detailed-workflow.otel.canvas</text>
          <text x="60" y="312" fill="#7dd3fc" fontSize="8">implementation-details.otel.canvas</text>
        </g>

        {/* Use case 6: Test Scope Levels */}
        <g>
          <rect x="310" y="245" width="250" height="85" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="435" y="265" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">6. Test Scope Levels</text>
          <rect x="320" y="273" width="230" height="50" fill="#422006" stroke="#fbbf24" strokeWidth="1" rx="2" />
          <text x="330" y="288" fill="#fde68a" fontSize="8">component-tests.otel.canvas</text>
          <text x="330" y="300" fill="#fde68a" fontSize="8">integration-tests.otel.canvas</text>
          <text x="330" y="312" fill="#fde68a" fontSize="8">e2e-tests.otel.canvas</text>
        </g>

        {/* Common theme */}
        <g>
          <rect x="40" y="345" width="520" height="60" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="365" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">COMMON THEME: HIERARCHICAL DECOMPOSITION</text>
          <text x="50" y="383" fill="#c4b5fd" fontSize="9">All use cases involve breaking down a complex system into smaller, focused parts that</text>
          <text x="50" y="397" fill="#c4b5fd" fontSize="9">can be validated independently, then composed to validate the complete behavior.</text>
        </g>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        Any <strong style={{ color: '#8b5cf6' }}>hierarchical decomposition</strong> of your system benefits from composable canvases. Choose the decomposition that matches your mental model and team structure.
      </div>
    </div>
  );
};

const Step4HowItWorks: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">HOW CANVAS COMPOSITION WORKS</text>

        {/* Parent canvas structure */}
        <g>
          <rect x="40" y="50" width="250" height="130" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">complete-flow.otel.canvas</text>

          <rect x="50" y="80" width="230" height="90" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="60" y="95" fill="#e9d5ff" fontSize="8" fontFamily="monospace">"nodes": [</text>
          <text x="65" y="108" fill="#c4b5fd" fontSize="8" fontFamily="monospace">  {'{'}  </text>
          <text x="70" y="121" fill="#c4b5fd" fontSize="8" fontFamily="monospace">    id: "api",</text>
          <text x="70" y="134" fill="#a78bfa" fontSize="8" fontFamily="monospace" fontWeight="bold">    canvas: "./api-layer.otel.canvas",</text>
          <text x="70" y="147" fill="#c4b5fd" fontSize="8" fontFamily="monospace">    otel: {'{'}  resourceMatch: ...  {'}'}</text>
          <text x="65" y="160" fill="#c4b5fd" fontSize="8" fontFamily="monospace">  {'}'}</text>
        </g>

        {/* Arrow to child */}
        <line x1="295" y1="115" x2="335" y2="115" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple2)" />
        <text x="315" y="105" textAnchor="middle" fill="#8b5cf6" fontSize="8">references</text>

        {/* Child canvas structure */}
        <g>
          <rect x="340" y="50" width="220" height="130" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="450" y="70" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">api-layer.otel.canvas</text>

          <rect x="350" y="80" width="200" height="90" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="360" y="95" fill="#bfdbfe" fontSize="8" fontFamily="monospace">"nodes": [</text>
          <text x="365" y="108" fill="#93c5fd" fontSize="8" fontFamily="monospace">  {'{'}  id: "endpoint-1" {'}'},</text>
          <text x="365" y="121" fill="#93c5fd" fontSize="8" fontFamily="monospace">  {'{'}  id: "endpoint-2" {'}'}</text>
          <text x="360" y="134" fill="#bfdbfe" fontSize="8" fontFamily="monospace">],</text>
          <text x="360" y="147" fill="#60a5fa" fontSize="8" fontFamily="monospace" fontWeight="bold">"pv": {'{'}  events: [...] {'}'}</text>
        </g>

        {/* Validation flow */}
        <g>
          <rect x="40" y="200" width="520" height="125" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="220" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">VALIDATION FLOW</text>

          <rect x="55" y="230" width="240" height="85" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="65" y="245" fill="#a7f3d0" fontSize="9" fontWeight="600">1. Child Canvas Validates:</text>
          <text x="70" y="260" fill="#6ee7b7" fontSize="8">✓ Spans that match its nodes</text>
          <text x="70" y="273" fill="#6ee7b7" fontSize="8">✓ Events from API layer</text>
          <text x="70" y="286" fill="#6ee7b7" fontSize="8">✓ API-specific narratives</text>
          <text x="70" y="299" fill="#34d399" fontSize="7" fontStyle="italic">Independent validation</text>

          <rect x="305" y="230" width="245" height="85" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="315" y="245" fill="#a7f3d0" fontSize="9" fontWeight="600">2. Parent Canvas Validates:</text>
          <text x="320" y="260" fill="#6ee7b7" fontSize="8">✓ Complete trace flow</text>
          <text x="320" y="273" fill="#6ee7b7" fontSize="8">✓ Cross-layer interactions</text>
          <text x="320" y="286" fill="#6ee7b7" fontSize="8">✓ End-to-end narratives</text>
          <text x="320" y="299" fill="#34d399" fontSize="7" fontStyle="italic">Composed validation</text>
        </g>

        <defs>
          <marker id="arrow-purple2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#8b5cf6" />
          </marker>
        </defs>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        Parent canvases <strong style={{ color: '#8b5cf6' }}>reference child canvases</strong> using a <code>canvas</code> property. Child canvases validate their portion of the trace, parent canvases validate the composition.
      </div>
    </div>
  );
};

const Step5TraceAggregation: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">TRACE AGGREGATION AND CORRELATION</text>

        {/* Span files in different locations */}
        <g>
          <rect x="40" y="50" width="520" height="100" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">Spans Saved in Different Locations</text>

          <rect x="60" y="80" width="150" height="60" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="70" y="95" fill="#93c5fd" fontSize="8">tests/__otel__/api/</text>
          <text x="75" y="108" fill="#60a5fa" fontSize="7" fontFamily="monospace">api-*.span.json</text>
          <text x="75" y="120" fill="#60a5fa" fontSize="7" fontFamily="monospace">validate-*.span.json</text>
          <text x="75" y="132" fill="#60a5fa" fontSize="7" fontFamily="monospace">auth-*.span.json</text>

          <rect x="225" y="80" width="150" height="60" fill="#0f172a" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="235" y="95" fill="#6ee7b7" fontSize="8">tests/__otel__/logic/</text>
          <text x="240" y="108" fill="#34d399" fontSize="7" fontFamily="monospace">process-*.span.json</text>
          <text x="240" y="120" fill="#34d399" fontSize="7" fontFamily="monospace">validate-*.span.json</text>
          <text x="240" y="132" fill="#34d399" fontSize="7" fontFamily="monospace">compute-*.span.json</text>

          <rect x="390" y="80" width="150" height="60" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1" rx="2" />
          <text x="400" y="95" fill="#c4b5fd" fontSize="8">tests/__otel__/data/</text>
          <text x="405" y="108" fill="#a78bfa" fontSize="7" fontFamily="monospace">query-*.span.json</text>
          <text x="405" y="120" fill="#a78bfa" fontSize="7" fontFamily="monospace">save-*.span.json</text>
          <text x="405" y="132" fill="#a78bfa" fontSize="7" fontFamily="monospace">cache-*.span.json</text>
        </g>

        {/* Arrows down */}
        <line x1="135" y1="155" x2="225" y2="180" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow-yellow2)" />
        <line x1="300" y1="155" x2="300" y2="180" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow-yellow2)" />
        <line x1="465" y1="155" x2="375" y2="180" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow-yellow2)" />

        {/* Correlation */}
        <g>
          <rect x="40" y="185" width="520" height="100" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="205" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Aggregated and Correlated by trace_id</text>

          <rect x="60" y="215" width="480" height="60" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="70" y="230" fill="#a7f3d0" fontSize="8" fontFamily="monospace">Parent narrative traces config:</text>
          <text x="75" y="243" fill="#6ee7b7" fontSize="8" fontFamily="monospace">"sources": ["tests/__otel__/**/*.span.json"],</text>
          <text x="75" y="256" fill="#6ee7b7" fontSize="8" fontFamily="monospace">"correlateBy": "trace_id"</text>
          <text x="70" y="269" fill="#34d399" fontSize="7" fontWeight="bold">→ All spans with same trace_id are grouped into a single distributed trace</text>
        </g>

        <defs>
          <marker id="arrow-yellow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" />
          </marker>
        </defs>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        Parent workflows use <strong style={{ color: '#10b981' }}>glob patterns</strong> to aggregate span files from multiple locations, then <strong>correlate by trace_id</strong> to reconstruct the complete distributed trace.
      </div>
    </div>
  );
};

const Step6IndependentAndComposed: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">INDEPENDENT YET COMPOSED VALIDATION</text>

        {/* Two validation paths */}
        <g>
          {/* Left: Independent validation */}
          <rect x="40" y="50" width="240" height="215" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="160" y="70" textAnchor="middle" fill="#dbeafe" fontSize="11" fontWeight="600">Independent Validation</text>

          <rect x="55" y="85" width="210" height="170" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="65" y="100" fill="#bfdbfe" fontSize="9" fontWeight="600">Each Child Canvas:</text>
          <text x="70" y="118" fill="#93c5fd" fontSize="8">✓ Has its own test suite</text>
          <text x="70" y="131" fill="#93c5fd" fontSize="8">✓ Generates its own traces</text>
          <text x="70" y="144" fill="#93c5fd" fontSize="8">✓ Has its own narratives</text>
          <text x="70" y="157" fill="#93c5fd" fontSize="8">✓ Validates independently</text>

          <rect x="60" y="170" width="200" height="75" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="70" y="185" fill="#dbeafe" fontSize="8" fontWeight="600">Benefits:</text>
          <text x="75" y="198" fill="#93c5fd" fontSize="7">• Fast feedback on specific layer</text>
          <text x="75" y="210" fill="#93c5fd" fontSize="7">• Isolated failures</text>
          <text x="75" y="222" fill="#93c5fd" fontSize="7">• Team ownership</text>
          <text x="75" y="234" fill="#93c5fd" fontSize="7">• Can develop in parallel</text>

          {/* Right: Composed validation */}
          <rect x="320" y="50" width="240" height="215" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="440" y="70" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">Composed Validation</text>

          <rect x="335" y="85" width="210" height="170" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="345" y="100" fill="#a7f3d0" fontSize="9" fontWeight="600">Parent Canvas:</text>
          <text x="350" y="118" fill="#6ee7b7" fontSize="8">✓ Aggregates child traces</text>
          <text x="350" y="131" fill="#6ee7b7" fontSize="8">✓ Validates cross-layer flow</text>
          <text x="350" y="144" fill="#6ee7b7" fontSize="8">✓ End-to-end narratives</text>
          <text x="350" y="157" fill="#6ee7b7" fontSize="8">✓ Integration validation</text>

          <rect x="340" y="170" width="200" height="75" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="350" y="185" fill="#d1fae5" fontSize="8" fontWeight="600">Benefits:</text>
          <text x="355" y="198" fill="#6ee7b7" fontSize="7">• Complete workflow coverage</text>
          <text x="355" y="210" fill="#6ee7b7" fontSize="7">• Interaction validation</text>
          <text x="355" y="222" fill="#6ee7b7" fontSize="7">• User journey verification</text>
          <text x="355" y="234" fill="#6ee7b7" fontSize="7">• Same traces, both levels</text>
        </g>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        You get <strong style={{ color: '#3b82f6' }}>independent validation</strong> at each level for fast feedback, <strong>plus</strong> <strong style={{ color: '#10b981' }}>composed validation</strong> for complete workflows—from the same test executions.
      </div>
    </div>
  );
};

const Step7Benefits: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">WHY HIERARCHICAL COMPOSITION MATTERS</text>

        {/* Key benefits */}
        <g>
          <rect x="40" y="50" width="250" height="80" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">Separation of Concerns</text>
          <text x="50" y="88" fill="#93c5fd" fontSize="8">✓ Each canvas focuses on one aspect</text>
          <text x="50" y="101" fill="#93c5fd" fontSize="8">✓ Clear boundaries and responsibilities</text>
          <text x="50" y="114" fill="#93c5fd" fontSize="8">✓ Easier to understand and maintain</text>
        </g>

        <g>
          <rect x="310" y="50" width="250" height="80" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Progressive Complexity</text>
          <text x="320" y="88" fill="#6ee7b7" fontSize="8">✓ Start simple, add detail as needed</text>
          <text x="320" y="101" fill="#6ee7b7" fontSize="8">✓ High-level view or deep dive</text>
          <text x="320" y="114" fill="#6ee7b7" fontSize="8">✓ Different audiences, same data</text>
        </g>

        <g>
          <rect x="40" y="145" width="250" height="80" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="165" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">Team Autonomy</text>
          <text x="50" y="183" fill="#c4b5fd" fontSize="8">✓ Teams own their canvas/layer</text>
          <text x="50" y="196" fill="#c4b5fd" fontSize="8">✓ Independent development cycles</text>
          <text x="50" y="209" fill="#c4b5fd" fontSize="8">✓ Clear integration contracts</text>
        </g>

        <g>
          <rect x="310" y="145" width="250" height="80" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="435" y="165" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="600">No Test Duplication</text>
          <text x="320" y="183" fill="#fbbf24" fontSize="8">✓ Same traces validate at all levels</text>
          <text x="320" y="196" fill="#fbbf24" fontSize="8">✓ No separate integration tests</text>
          <text x="320" y="209" fill="#fbbf24" fontSize="8">✓ Single source of truth</text>
        </g>

        {/* The key insight */}
        <g>
          <rect x="40" y="240" width="520" height="85" fill="#1e1b4b" stroke="#10b981" strokeWidth="3" rx="4" />
          <text x="300" y="260" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="700">THE KEY: MATCH YOUR MENTAL MODEL</text>

          <text x="50" y="280" fill="#ddd6fe" fontSize="9">Hierarchical composition lets you structure your canvases the way you think about</text>
          <text x="50" y="295" fill="#ddd6fe" fontSize="9">your system—whether that's layers, features, subsystems, or any other decomposition.</text>

          <text x="50" y="315" fill="#34d399" fontSize="9" fontWeight="bold">Your architecture documentation becomes your validation framework.</text>
        </g>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        Hierarchical composition lets you <strong style={{ color: '#8b5cf6' }}>decompose complex systems</strong> naturally, validate at <strong style={{ color: '#10b981' }}>multiple levels</strong>, and maintain <strong style={{ color: '#3b82f6' }}>team autonomy</strong>—all from the same OTEL traces.
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'pattern', title: 'The Pattern', component: Step1ThePattern },
  { id: 'spans', title: 'Parent-Child Span Relationships', component: Step2ParentChildSpans },
  { id: 'usecases', title: 'Common Use Cases', component: Step3UseCases },
  { id: 'howitworks', title: 'How It Works', component: Step4HowItWorks },
  { id: 'aggregation', title: 'Trace Aggregation', component: Step5TraceAggregation },
  { id: 'independent', title: 'Independent Yet Composed', component: Step6IndependentAndComposed },
  { id: 'benefits', title: 'Why It Matters', component: Step7Benefits },
];

export const HierarchicalCanvasCompositionExplainerPanel: React.FC<HierarchicalCanvasCompositionExplainerPanelProps> = ({ className }) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pattern']));

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        padding: '24px',
        minHeight: '100vh',
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '1024px', margin: '0 auto 32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: theme.colors.text, marginBottom: '8px' }}>
          Hierarchical Canvas Composition
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          How to decompose complex systems into composable canvases using OTEL parent-child span relationships
        </p>
      </div>

      {/* Progressive sections */}
      <div style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id);
          const SectionComponent = section.component;

          return (
            <div
              key={section.id}
              style={{
                backgroundColor: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.colors.muted)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      fontSize: '14px',
                    }}
                  >
                    {index + 1}
                  </span>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: theme.colors.text, margin: 0 }}>
                    {section.title}
                  </h2>
                </div>
                <svg
                  style={{
                    width: '24px',
                    height: '24px',
                    color: theme.colors.textSecondary,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Section content */}
              {isExpanded && (
                <div style={{ padding: '24px', borderTop: `1px solid ${theme.colors.border}` }}>
                  <SectionComponent />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          maxWidth: '1024px',
          margin: '48px auto 0',
          padding: '24px',
          backgroundColor: theme.colors.background,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: theme.colors.text, marginBottom: '12px' }}>
          Key Takeaway
        </h3>
        <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>
          Hierarchical composition lets you structure canvases to match your mental model—whether that's architectural
          layers, feature modules, subsystems, or test scopes. OTEL's parent-child span relationships make this natural
          and efficient.
        </div>
      </div>
    </div>
  );
};

export default HierarchicalCanvasCompositionExplainerPanel;
