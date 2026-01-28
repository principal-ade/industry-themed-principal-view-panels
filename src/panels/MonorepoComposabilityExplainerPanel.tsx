import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface MonorepoComposabilityExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1MonorepoChallenge: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">THE MONOREPO CHALLENGE</text>

        {/* Three services */}
        <g>
          <rect x="40" y="50" width="140" height="100" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="110" y="75" textAnchor="middle" fill="#dbeafe" fontSize="11" fontWeight="600">User Service</text>
          <text x="50" y="95" fill="#93c5fd" fontSize="8">• Authentication</text>
          <text x="50" y="108" fill="#93c5fd" fontSize="8">• User registration</text>
          <text x="50" y="121" fill="#93c5fd" fontSize="8">• Profile management</text>
          <text x="50" y="134" fill="#60a5fa" fontSize="7" fontStyle="italic">packages/user-service/</text>
        </g>

        <g>
          <rect x="230" y="50" width="140" height="100" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="75" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">Order Service</text>
          <text x="240" y="95" fill="#6ee7b7" fontSize="8">• Create orders</text>
          <text x="240" y="108" fill="#6ee7b7" fontSize="8">• Order validation</text>
          <text x="240" y="121" fill="#6ee7b7" fontSize="8">• Inventory check</text>
          <text x="240" y="134" fill="#34d399" fontSize="7" fontStyle="italic">packages/order-service/</text>
        </g>

        <g>
          <rect x="420" y="50" width="140" height="100" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="490" y="75" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">Payment Service</text>
          <text x="430" y="95" fill="#c4b5fd" fontSize="8">• Process payments</text>
          <text x="430" y="108" fill="#c4b5fd" fontSize="8">• Refunds</text>
          <text x="430" y="121" fill="#c4b5fd" fontSize="8">• Payment validation</text>
          <text x="430" y="134" fill="#a78bfa" fontSize="7" fontStyle="italic">packages/payment-service/</text>
        </g>

        {/* Arrows showing interaction */}
        <line x1="180" y1="100" x2="225" y2="100" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow-gray)" />
        <line x1="370" y1="100" x2="415" y2="100" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow-gray)" />

        {/* Problem statement */}
        <g>
          <rect x="40" y="170" width="520" height="95" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="190" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">THE PROBLEM</text>

          <text x="50" y="210" fill="#cbd5e1" fontSize="9">A single user action (e.g., "checkout") flows across all three services:</text>
          <text x="60" y="227" fill="#fbbf24" fontSize="8">1. User Service validates the user</text>
          <text x="60" y="240" fill="#fbbf24" fontSize="8">2. Order Service creates the order</text>
          <text x="60" y="253" fill="#fbbf24" fontSize="8">3. Payment Service processes payment</text>

          <text x="50" y="272" fill="#f59e0b" fontSize="8" fontWeight="bold">How do we validate this end-to-end flow across multiple packages?</text>
        </g>

        <defs>
          <marker id="arrow-gray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
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
        In a monorepo, user workflows often span multiple packages/services. We need a way to <strong style={{ color: '#f59e0b' }}>compose traces and validation across package boundaries</strong>.
      </div>
    </div>
  );
};

const Step2PackageLevelCanvases: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">EACH PACKAGE HAS ITS OWN CANVAS</text>

        {/* Package 1 */}
        <g>
          <rect x="40" y="50" width="160" height="235" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="120" y="70" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">packages/user-service/</text>

          <rect x="50" y="80" width="140" height="195" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="60" y="95" fill="#bfdbfe" fontSize="8" fontWeight="600">.principal-views/</text>
          <text x="70" y="108" fill="#93c5fd" fontSize="7" fontFamily="monospace">user-api.otel.canvas</text>

          <text x="60" y="128" fill="#bfdbfe" fontSize="8" fontWeight="600">__workflows__/</text>
          <text x="70" y="141" fill="#93c5fd" fontSize="7" fontFamily="monospace">registration.workflow.json</text>

          <text x="60" y="161" fill="#bfdbfe" fontSize="8" fontWeight="600">tests/__otel__/</text>
          <text x="70" y="174" fill="#60a5fa" fontSize="7" fontFamily="monospace">register-success.span.json</text>
          <text x="70" y="186" fill="#60a5fa" fontSize="7" fontFamily="monospace">register-duplicate.span.json</text>

          <rect x="55" y="200" width="130" height="65" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="65" y="215" fill="#dbeafe" fontSize="8" fontWeight="600">Validates:</text>
          <text x="70" y="228" fill="#93c5fd" fontSize="7">✓ User service internal flows</text>
          <text x="70" y="240" fill="#93c5fd" fontSize="7">✓ Authentication logic</text>
          <text x="70" y="252" fill="#93c5fd" fontSize="7">✓ User registration events</text>
        </g>

        {/* Package 2 */}
        <g>
          <rect x="220" y="50" width="160" height="235" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">packages/order-service/</text>

          <rect x="230" y="80" width="140" height="195" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="240" y="95" fill="#a7f3d0" fontSize="8" fontWeight="600">.principal-views/</text>
          <text x="250" y="108" fill="#6ee7b7" fontSize="7" fontFamily="monospace">order-api.otel.canvas</text>

          <text x="240" y="128" fill="#a7f3d0" fontSize="8" fontWeight="600">__workflows__/</text>
          <text x="250" y="141" fill="#6ee7b7" fontSize="7" fontFamily="monospace">create-order.workflow.json</text>

          <text x="240" y="161" fill="#a7f3d0" fontSize="8" fontWeight="600">tests/__otel__/</text>
          <text x="250" y="174" fill="#34d399" fontSize="7" fontFamily="monospace">create-order-*.span.json</text>
          <text x="250" y="186" fill="#34d399" fontSize="7" fontFamily="monospace">validate-order-*.span.json</text>

          <rect x="235" y="200" width="130" height="65" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="245" y="215" fill="#d1fae5" fontSize="8" fontWeight="600">Validates:</text>
          <text x="250" y="228" fill="#6ee7b7" fontSize="7">✓ Order service flows</text>
          <text x="250" y="240" fill="#6ee7b7" fontSize="7">✓ Order creation logic</text>
          <text x="250" y="252" fill="#6ee7b7" fontSize="7">✓ Inventory checks</text>
        </g>

        {/* Package 3 */}
        <g>
          <rect x="400" y="50" width="160" height="235" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="480" y="70" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">packages/payment-service/</text>

          <rect x="410" y="80" width="140" height="195" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="420" y="95" fill="#e9d5ff" fontSize="8" fontWeight="600">.principal-views/</text>
          <text x="430" y="108" fill="#c4b5fd" fontSize="7" fontFamily="monospace">payment-api.otel.canvas</text>

          <text x="420" y="128" fill="#e9d5ff" fontSize="8" fontWeight="600">__workflows__/</text>
          <text x="430" y="141" fill="#c4b5fd" fontSize="7" fontFamily="monospace">payment.workflow.json</text>

          <text x="420" y="161" fill="#e9d5ff" fontSize="8" fontWeight="600">tests/__otel__/</text>
          <text x="430" y="174" fill="#a78bfa" fontSize="7" fontFamily="monospace">process-payment-*.span.json</text>
          <text x="430" y="186" fill="#a78bfa" fontSize="7" fontFamily="monospace">refund-*.span.json</text>

          <rect x="415" y="200" width="130" height="65" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="1" rx="2" />
          <text x="425" y="215" fill="#ddd6fe" fontSize="8" fontWeight="600">Validates:</text>
          <text x="430" y="228" fill="#c4b5fd" fontSize="7">✓ Payment flows</text>
          <text x="430" y="240" fill="#c4b5fd" fontSize="7">✓ Payment processing</text>
          <text x="430" y="252" fill="#c4b5fd" fontSize="7">✓ Refund logic</text>
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
        Each package maintains its own <strong>.otel.canvas</strong> files and workflows to validate <em>service-internal behavior</em>. Tests generate <code>*.span.json</code> files in each package.
      </div>
    </div>
  );
};

const Step3TraceCorrelation: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">OTEL TRACES ARE NATURALLY COMPOSABLE</text>

        {/* Single trace across services */}
        <g>
          <rect x="40" y="50" width="520" height="255" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">Single Distributed Trace (trace_id: abc123)</text>

          {/* User Service Span */}
          <rect x="60" y="90" width="140" height="70" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="3" />
          <text x="130" y="108" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="600">User Service Span</text>
          <text x="70" y="122" fill="#93c5fd" fontSize="7">span_id: span-001</text>
          <text x="70" y="134" fill="#93c5fd" fontSize="7">parent_span_id: null</text>
          <text x="70" y="146" fill="#60a5fa" fontSize="7" fontWeight="bold">service.name: user-service</text>
          <text x="70" y="155" fill="#93c5fd" fontSize="7" fontStyle="italic">Saved in: packages/user-service/</text>

          <line x1="205" y1="125" x2="240" y2="125" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow-yellow)" />

          {/* Order Service Span */}
          <rect x="245" y="90" width="140" height="70" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="3" />
          <text x="315" y="108" textAnchor="middle" fill="#d1fae5" fontSize="9" fontWeight="600">Order Service Span</text>
          <text x="255" y="122" fill="#6ee7b7" fontSize="7">span_id: span-002</text>
          <text x="255" y="134" fill="#6ee7b7" fontSize="7">parent_span_id: span-001</text>
          <text x="255" y="146" fill="#34d399" fontSize="7" fontWeight="bold">service.name: order-service</text>
          <text x="255" y="155" fill="#6ee7b7" fontSize="7" fontStyle="italic">Saved in: packages/order-service/</text>

          <line x1="390" y1="125" x2="425" y2="125" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow-yellow)" />

          {/* Payment Service Span */}
          <rect x="430" y="90" width="110" height="70" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="3" />
          <text x="485" y="108" textAnchor="middle" fill="#ddd6fe" fontSize="9" fontWeight="600">Payment Span</text>
          <text x="438" y="122" fill="#c4b5fd" fontSize="7">span_id: span-003</text>
          <text x="438" y="134" fill="#c4b5fd" fontSize="7">parent: span-002</text>
          <text x="438" y="146" fill="#a78bfa" fontSize="7" fontWeight="bold">service.name:</text>
          <text x="438" y="155" fill="#a78bfa" fontSize="7" fontWeight="bold">payment-service</text>

          {/* Key insight */}
          <rect x="60" y="180" width="480" height="115" fill="#1e293b" stroke="#10b981" strokeWidth="2" rx="3" />
          <text x="300" y="200" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="600">THE KEY: All spans share the same trace_id</text>

          <text x="70" y="220" fill="#cbd5e1" fontSize="8">✓ Spans from different packages are part of the same distributed trace</text>
          <text x="70" y="235" fill="#cbd5e1" fontSize="8">✓ Parent-child relationships link spans across service boundaries</text>
          <text x="70" y="250" fill="#cbd5e1" fontSize="8">✓ Each package saves its spans to its own tests/__otel__/ directory</text>

          <rect x="75" y="260" width="450" height="25" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="85" y="275" fill="#6ee7b7" fontSize="8" fontWeight="bold">Correlation: Group all *.span.json files by trace_id to reconstruct the full flow</text>
        </g>

        <defs>
          <marker id="arrow-yellow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        OTEL traces are <strong style={{ color: '#10b981' }}>already composable</strong> - spans share <code>trace_id</code> and link via parent-child relationships. We just need to aggregate them from multiple packages.
      </div>
    </div>
  );
};

const Step4RootComposition: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">ROOT-LEVEL CANVAS COMPOSITION</text>

        {/* Root directory */}
        <g>
          <rect x="40" y="45" width="520" height="280" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="3" rx="6" />
          <text x="300" y="65" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="700">monorepo/.principal-views/</text>

          {/* Root canvas */}
          <rect x="60" y="80" width="480" height="100" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" rx="4" />
          <text x="70" y="95" fill="#e9d5ff" fontSize="9" fontWeight="600">checkout-flow.otel.canvas</text>

          <rect x="75" y="105" width="450" height="65" fill="#1e1b4b" stroke="#c4b5fd" strokeWidth="1" rx="3" />
          <text x="85" y="120" fill="#ddd6fe" fontSize="8" fontFamily="monospace">"nodes": [</text>
          <text x="90" y="133" fill="#c4b5fd" fontSize="8" fontFamily="monospace">  {'{'}id: "user-svc", canvas: "./packages/user-service/.principal-views/user-api.otel.canvas"{'}'},</text>
          <text x="90" y="146" fill="#c4b5fd" fontSize="8" fontFamily="monospace">  {'{'}id: "order-svc", canvas: "./packages/order-service/.principal-views/order-api.otel.canvas"{'}'},</text>
          <text x="90" y="159" fill="#c4b5fd" fontSize="8" fontFamily="monospace">  {'{'}id: "payment-svc", canvas: "./packages/payment-service/.principal-views/payment-api.otel.canvas"{'}'}</text>

          {/* Root narrative */}
          <rect x="60" y="195" width="480" height="120" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="70" y="210" fill="#a7f3d0" fontSize="9" fontWeight="600">__workflows__/end-to-end-checkout.workflow.json</text>

          <rect x="75" y="220" width="450" height="85" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="85" y="235" fill="#d1fae5" fontSize="8" fontFamily="monospace">"traces": {'{'}  </text>
          <text x="90" y="248" fill="#6ee7b7" fontSize="8" fontFamily="monospace">  "sources": ["packages/*/tests/__otel__/*.span.json"],</text>
          <text x="90" y="261" fill="#6ee7b7" fontSize="8" fontFamily="monospace">  "correlateBy": "trace_id",</text>
          <text x="90" y="274" fill="#6ee7b7" fontSize="8" fontFamily="monospace">  "filter": {'{'}  "root_span_name": "checkout_integration_test"  {'}'}</text>
          <text x="85" y="287" fill="#d1fae5" fontSize="8" fontFamily="monospace">{'}'},</text>
          <text x="85" y="300" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">"expectedFlow": ["user.validated", "order.created", "payment.processed"]</text>
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
        Root-level canvases <strong style={{ color: '#8b5cf6' }}>compose package-level canvases</strong>, and root workflows <strong style={{ color: '#10b981' }}>aggregate traces</strong> from all packages using glob patterns and trace correlation.
      </div>
    </div>
  );
};

const Step5HierarchicalValidation: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">HIERARCHICAL VALIDATION</text>

        {/* Two levels */}
        <g>
          {/* Package level */}
          <rect x="40" y="50" width="520" height="100" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#dbeafe" fontSize="11" fontWeight="600">PACKAGE-LEVEL VALIDATION (Service-Internal)</text>

          <rect x="60" y="80" width="160" height="60" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="70" y="95" fill="#93c5fd" fontSize="8">packages/user-service/</text>
          <text x="75" y="108" fill="#bfdbfe" fontSize="7">✓ User auth works</text>
          <text x="75" y="120" fill="#bfdbfe" fontSize="7">✓ Registration succeeds</text>
          <text x="75" y="132" fill="#bfdbfe" fontSize="7">✓ Events emitted correctly</text>

          <rect x="240" y="80" width="140" height="60" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="250" y="95" fill="#93c5fd" fontSize="8">packages/order-service/</text>
          <text x="255" y="108" fill="#bfdbfe" fontSize="7">✓ Orders created</text>
          <text x="255" y="120" fill="#bfdbfe" fontSize="7">✓ Inventory checked</text>

          <rect x="400" y="80" width="140" height="60" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="410" y="95" fill="#93c5fd" fontSize="8">packages/payment-service/</text>
          <text x="415" y="108" fill="#bfdbfe" fontSize="7">✓ Payments processed</text>
          <text x="415" y="120" fill="#bfdbfe" fontSize="7">✓ Refunds work</text>

          {/* Arrow down */}
          <line x1="300" y1="155" x2="300" y2="175" stroke="#fbbf24" strokeWidth="3" markerEnd="url(#arrow-gold)" />
          <text x="315" y="168" fill="#fbbf24" fontSize="9" fontWeight="bold">Compose</text>
        </g>

        {/* Root level */}
        <g>
          <rect x="40" y="180" width="520" height="105" fill="#064e3b" stroke="#10b981" strokeWidth="3" rx="4" />
          <text x="300" y="200" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">ROOT-LEVEL VALIDATION (Cross-Service)</text>

          <rect x="60" y="210" width="480" height="65" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="70" y="225" fill="#6ee7b7" fontSize="8">monorepo/.principal-views/__workflows__/</text>
          <text x="75" y="240" fill="#a7f3d0" fontSize="8">✓ User validated → Order created → Payment processed (complete flow)</text>
          <text x="75" y="253" fill="#a7f3d0" fontSize="8">✓ All services communicated correctly</text>
          <text x="75" y="266" fill="#34d399" fontSize="8" fontWeight="bold">✓ End-to-end checkout scenario succeeds</text>
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
        <strong style={{ color: '#3b82f6' }}>Package-level narratives</strong> validate service-internal behavior. <strong style={{ color: '#10b981' }}>Root-level narratives</strong> validate cross-service workflows by correlating traces from all packages.
      </div>
    </div>
  );
};

const Step6FileOrganization: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 380" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">MONOREPO FILE ORGANIZATION</text>

        {/* File tree */}
        <g>
          <rect x="40" y="45" width="520" height="320" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="4" />

          <text x="60" y="70" fill="#94a3b8" fontSize="11" fontFamily="monospace">monorepo/</text>

          {/* Root .principal-views */}
          <rect x="75" y="80" width="470" height="85" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="3" />
          <text x="85" y="95" fill="#a78bfa" fontSize="10" fontFamily="monospace">📁 .principal-views/</text>
          <text x="100" y="110" fill="#8b5cf6" fontSize="9" fontFamily="monospace" fontWeight="bold">library.yaml</text>
          <text x="270" y="110" fill="#c4b5fd" fontSize="8">← Shared component types for all packages</text>
          <text x="100" y="125" fill="#c4b5fd" fontSize="9" fontFamily="monospace">checkout-flow.otel.canvas</text>
          <text x="270" y="125" fill="#ddd6fe" fontSize="8">← Composes package-level canvases</text>
          <text x="100" y="140" fill="#ddd6fe" fontSize="9" fontFamily="monospace">📁 __workflows__/</text>
          <text x="115" y="155" fill="#e9d5ff" fontSize="8" fontFamily="monospace">end-to-end-checkout.workflow.json</text>
          <text x="330" y="155" fill="#c4b5fd" fontSize="7">← Aggregates traces</text>

          {/* Packages */}
          <text x="80" y="185" fill="#94a3b8" fontSize="10" fontFamily="monospace">📁 packages/</text>

          {/* User service */}
          <rect x="95" y="195" width="450" height="50" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="105" y="210" fill="#3b82f6" fontSize="9" fontFamily="monospace">📁 user-service/</text>
          <text x="120" y="225" fill="#93c5fd" fontSize="8" fontFamily="monospace">.principal-views/user-api.otel.canvas, __workflows__/</text>
          <text x="120" y="237" fill="#60a5fa" fontSize="8" fontFamily="monospace">tests/__otel__/*.span.json</text>

          {/* Order service */}
          <rect x="95" y="252" width="450" height="50" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="105" y="267" fill="#10b981" fontSize="9" fontFamily="monospace">📁 order-service/</text>
          <text x="120" y="282" fill="#6ee7b7" fontSize="8" fontFamily="monospace">.principal-views/order-api.otel.canvas, __workflows__/</text>
          <text x="120" y="294" fill="#34d399" fontSize="8" fontFamily="monospace">tests/__otel__/*.span.json</text>

          {/* Payment service */}
          <rect x="95" y="309" width="450" height="50" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="1" rx="2" />
          <text x="105" y="324" fill="#8b5cf6" fontSize="9" fontFamily="monospace">📁 payment-service/</text>
          <text x="120" y="339" fill="#c4b5fd" fontSize="8" fontFamily="monospace">.principal-views/payment-api.otel.canvas, __workflows__/</text>
          <text x="120" y="351" fill="#a78bfa" fontSize="8" fontFamily="monospace">tests/__otel__/*.span.json</text>
        </g>

        <defs>
          <marker id="arrow-gold" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        Each package maintains its own canvases and traces. Root <code>.principal-views/</code> contains shared library and composed canvases. Root workflows use glob patterns like <code>"packages/*/tests/__otel__/*.span.json"</code> to aggregate.
      </div>
    </div>
  );
};

const Step7Benefits: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">BENEFITS OF COMPOSABILITY</text>

        {/* Benefit 1 */}
        <g>
          <rect x="40" y="50" width="250" height="80" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">Package Independence</text>
          <text x="50" y="88" fill="#93c5fd" fontSize="8">✓ Each service owns its validation</text>
          <text x="50" y="101" fill="#93c5fd" fontSize="8">✓ Service boundaries preserved</text>
          <text x="50" y="114" fill="#93c5fd" fontSize="8">✓ Independent development</text>
        </g>

        {/* Benefit 2 */}
        <g>
          <rect x="310" y="50" width="250" height="80" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">End-to-End Validation</text>
          <text x="320" y="88" fill="#6ee7b7" fontSize="8">✓ Validate complete user workflows</text>
          <text x="320" y="101" fill="#6ee7b7" fontSize="8">✓ Cross-service interactions verified</text>
          <text x="320" y="114" fill="#6ee7b7" fontSize="8">✓ Integration testing with OTEL</text>
        </g>

        {/* Benefit 3 */}
        <g>
          <rect x="40" y="145" width="250" height="80" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="165" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">Trace Reuse</text>
          <text x="50" y="183" fill="#c4b5fd" fontSize="8">✓ Same traces validate at both levels</text>
          <text x="50" y="196" fill="#c4b5fd" fontSize="8">✓ No duplicate test infrastructure</text>
          <text x="50" y="209" fill="#c4b5fd" fontSize="8">✓ Package tests contribute to root</text>
        </g>

        {/* Benefit 4 */}
        <g>
          <rect x="310" y="145" width="250" height="80" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="435" y="165" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="600">Incremental Adoption</text>
          <text x="320" y="183" fill="#fbbf24" fontSize="8">✓ Start with package-level validation</text>
          <text x="320" y="196" fill="#fbbf24" fontSize="8">✓ Add root composition when ready</text>
          <text x="320" y="209" fill="#fbbf24" fontSize="8">✓ Mix validated and non-validated</text>
        </g>

        {/* Key insight */}
        <g>
          <rect x="40" y="240" width="520" height="85" fill="#1e1b4b" stroke="#10b981" strokeWidth="3" rx="4" />
          <text x="300" y="260" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="700">THE POWER: COMPOSABILITY WITHOUT COUPLING</text>

          <text x="50" y="280" fill="#ddd6fe" fontSize="9">Each package validates independently, but root workflows can compose those same traces</text>
          <text x="50" y="295" fill="#ddd6fe" fontSize="9">to validate cross-service workflows—without duplicating tests or creating tight coupling.</text>

          <text x="50" y="315" fill="#34d399" fontSize="9" fontWeight="bold">You get both service isolation AND end-to-end validation from the same test executions.</text>
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
        Composability lets you validate <strong>both</strong> service-internal behavior <strong>and</strong> cross-service workflows from the same OTEL traces, without coupling packages or duplicating tests.
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'challenge', title: 'The Monorepo Challenge', component: Step1MonorepoChallenge },
  { id: 'packages', title: 'Package-Level Canvases', component: Step2PackageLevelCanvases },
  { id: 'correlation', title: 'Trace Correlation', component: Step3TraceCorrelation },
  { id: 'composition', title: 'Root-Level Composition', component: Step4RootComposition },
  { id: 'validation', title: 'Hierarchical Validation', component: Step5HierarchicalValidation },
  { id: 'organization', title: 'File Organization', component: Step6FileOrganization },
  { id: 'benefits', title: 'Benefits of Composability', component: Step7Benefits },
];

export const MonorepoComposabilityExplainerPanel: React.FC<MonorepoComposabilityExplainerPanelProps> = ({ className }) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['challenge']));

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
          Monorepo Composability
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          How canvases and traces compose across package boundaries for end-to-end validation
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
          OTEL traces naturally compose across service boundaries via <code style={{ color: '#fbbf24' }}>trace_id</code>.
          By aggregating <code>*.span.json</code> files from all packages and correlating by trace ID, root-level narratives
          can validate end-to-end workflows while preserving package independence.
        </div>
      </div>
    </div>
  );
};

export default MonorepoComposabilityExplainerPanel;
