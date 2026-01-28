import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface CanvasTypesExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1TwoTypes: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 240" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">TWO TYPES OF CANVAS FILES</text>

        {/* .canvas - Static */}
        <g>
          <rect x="40" y="50" width="240" height="165" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="160" y="72" textAnchor="middle" fill="#dbeafe" fontSize="12" fontWeight="600">.canvas</text>
          <text x="160" y="87" textAnchor="middle" fill="#93c5fd" fontSize="10">(Static Architecture)</text>

          <rect x="55" y="100" width="210" height="105" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.5" rx="3" />
          <text x="65" y="115" fill="#bfdbfe" fontSize="9" fontWeight="600">Purpose: Documentation</text>
          <text x="70" y="133" fill="#93c5fd" fontSize="8">✓ Visual architecture diagrams</text>
          <text x="70" y="146" fill="#93c5fd" fontSize="8">✓ Design & planning</text>
          <text x="70" y="159" fill="#93c5fd" fontSize="8">✓ Stakeholder communication</text>
          <text x="70" y="172" fill="#93c5fd" fontSize="8">✓ External system docs</text>
          <text x="70" y="185" fill="#93c5fd" fontSize="8">✓ High-level overviews</text>
          <text x="65" y="200" fill="#60a5fa" fontSize="7" fontStyle="italic">No runtime validation</text>
        </g>

        {/* vs */}
        <text x="300" y="135" textAnchor="middle" fill="#94a3b8" fontSize="16" fontWeight="700">vs</text>

        {/* .otel.canvas - Runtime Validated */}
        <g>
          <rect x="320" y="50" width="240" height="165" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="440" y="72" textAnchor="middle" fill="#d1fae5" fontSize="12" fontWeight="600">.otel.canvas</text>
          <text x="440" y="87" textAnchor="middle" fill="#6ee7b7" fontSize="10">(Runtime Validated)</text>

          <rect x="335" y="100" width="210" height="105" fill="#022c22" stroke="#059669" strokeWidth="1.5" rx="3" />
          <text x="345" y="115" fill="#a7f3d0" fontSize="9" fontWeight="600">Purpose: Validation</text>
          <text x="350" y="133" fill="#6ee7b7" fontSize="8">✓ Runtime behavior validation</text>
          <text x="350" y="146" fill="#6ee7b7" fontSize="8">✓ Test execution verification</text>
          <text x="350" y="159" fill="#6ee7b7" fontSize="8">✓ Production monitoring</text>
          <text x="350" y="172" fill="#6ee7b7" fontSize="8">✓ Event schema definitions</text>
          <text x="350" y="185" fill="#6ee7b7" fontSize="8">✓ OTEL trace matching</text>
          <text x="345" y="200" fill="#34d399" fontSize="7" fontStyle="italic" fontWeight="bold">Validated against OTEL</text>
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
        <strong style={{ color: '#3b82f6' }}>.canvas</strong> files are for <em>static documentation</em> - visual diagrams that don't need runtime validation. <strong style={{ color: '#10b981' }}>.otel.canvas</strong> files include event schemas and are <em>validated against runtime OTEL traces</em>.
      </div>
    </div>
  );
};

const Step2StaticCanvas: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">STATIC .canvas FILES</text>

        {/* Example structure */}
        <g>
          <rect x="40" y="50" width="250" height="235" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#dbeafe" fontSize="11" fontWeight="600">architecture.canvas</text>

          <rect x="55" y="85" width="220" height="190" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="65" y="100" fill="#bfdbfe" fontSize="8" fontFamily="monospace">{'{'}</text>
          <text x="70" y="113" fill="#93c5fd" fontSize="8" fontFamily="monospace">  "pv": {'{'}</text>
          <text x="75" y="126" fill="#93c5fd" fontSize="8" fontFamily="monospace">    "name": "System Architecture",</text>
          <text x="75" y="139" fill="#93c5fd" fontSize="8" fontFamily="monospace">    "version": "1.0.0"</text>
          <text x="70" y="152" fill="#93c5fd" fontSize="8" fontFamily="monospace">  {'}'},</text>
          <text x="70" y="165" fill="#93c5fd" fontSize="8" fontFamily="monospace">  "nodes": [</text>
          <text x="75" y="178" fill="#93c5fd" fontSize="8" fontFamily="monospace">    {'{'} id: "api",</text>
          <text x="80" y="191" fill="#60a5fa" fontSize="8" fontFamily="monospace" fontWeight="bold">      nodeType: "rest-api" {'}'}</text>
          <text x="70" y="204" fill="#93c5fd" fontSize="8" fontFamily="monospace">  ],</text>
          <text x="70" y="217" fill="#93c5fd" fontSize="8" fontFamily="monospace">  "edges": [...]</text>
          <text x="65" y="230" fill="#bfdbfe" fontSize="8" fontFamily="monospace">{'}'}</text>

          <text x="165" y="255" textAnchor="middle" fill="#60a5fa" fontSize="7" fontStyle="italic">No event schemas</text>
          <text x="165" y="267" textAnchor="middle" fill="#60a5fa" fontSize="7" fontStyle="italic">No OTEL expectations</text>
        </g>

        {/* Use cases */}
        <g>
          <rect x="310" y="50" width="250" height="235" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="600">WHEN TO USE .canvas</text>

          <rect x="325" y="85" width="220" height="190" fill="#0f172a" stroke="#64748b" strokeWidth="1" rx="3" />

          <text x="335" y="105" fill="#94a3b8" fontSize="9" fontWeight="600">1. High-Level Architecture</text>
          <text x="340" y="118" fill="#cbd5e1" fontSize="7">System-wide overview for stakeholders</text>

          <text x="335" y="138" fill="#94a3b8" fontSize="9" fontWeight="600">2. Design Documents</text>
          <text x="340" y="151" fill="#cbd5e1" fontSize="7">Planning before implementation</text>

          <text x="335" y="171" fill="#94a3b8" fontSize="9" fontWeight="600">3. External Systems</text>
          <text x="340" y="184" fill="#cbd5e1" fontSize="7">Third-party services you don't control</text>

          <text x="335" y="204" fill="#94a3b8" fontSize="9" fontWeight="600">4. Team Onboarding</text>
          <text x="340" y="217" fill="#cbd5e1" fontSize="7">Visual guides for new developers</text>

          <text x="335" y="237" fill="#94a3b8" fontSize="9" fontWeight="600">5. Communication</text>
          <text x="340" y="250" fill="#cbd5e1" fontSize="7">Explaining architecture to non-technical</text>
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
        <strong style={{ color: '#3b82f6' }}>Static .canvas files</strong> still use <code style={{ color: '#60a5fa' }}>library.yaml</code> for consistent component types and styling, but they're just diagrams - no runtime expectations.
      </div>
    </div>
  );
};

const Step3OtelCanvas: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">RUNTIME .otel.canvas FILES</text>

        {/* Example structure */}
        <g>
          <rect x="40" y="50" width="250" height="255" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">user-registration.otel.canvas</text>

          <rect x="55" y="85" width="220" height="210" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="65" y="100" fill="#a7f3d0" fontSize="8" fontFamily="monospace">{'{'}</text>
          <text x="70" y="113" fill="#6ee7b7" fontSize="8" fontFamily="monospace">  "nodes": [</text>
          <text x="75" y="126" fill="#6ee7b7" fontSize="8" fontFamily="monospace">    {'{'} id: "user-api",</text>
          <text x="80" y="139" fill="#6ee7b7" fontSize="8" fontFamily="monospace">      nodeType: "rest-api",</text>
          <text x="80" y="152" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">      pv: {'{'}</text>
          <text x="85" y="165" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">        events: [</text>
          <text x="90" y="178" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">          {'{'} name: "user.created" {'}'},</text>
          <text x="90" y="191" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">          {'{'} name: "user.validated" {'}'}</text>
          <text x="85" y="204" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">        ],</text>
          <text x="85" y="217" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">        otel: {'{'}</text>
          <text x="90" y="230" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">          resourceMatch: {'{'}...{'}'}</text>
          <text x="85" y="243" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">        {'}'}</text>
          <text x="80" y="256" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">      {'}'}</text>
          <text x="75" y="269" fill="#6ee7b7" fontSize="8" fontFamily="monospace">    {'}'}</text>
          <text x="70" y="282" fill="#6ee7b7" fontSize="8" fontFamily="monospace">  ]</text>
          <text x="65" y="295" fill="#a7f3d0" fontSize="8" fontFamily="monospace">{'}'}</text>
        </g>

        {/* Key additions */}
        <g>
          <rect x="310" y="50" width="250" height="255" fill="#1e293b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">OTEL-SPECIFIC ADDITIONS</text>

          <rect x="325" y="85" width="220" height="210" fill="#0f172a" stroke="#059669" strokeWidth="1" rx="3" />

          <text x="335" y="105" fill="#6ee7b7" fontSize="9" fontWeight="600">pv.events: [...]</text>
          <text x="340" y="120" fill="#d1fae5" fontSize="7">Expected events this node emits</text>
          <text x="340" y="132" fill="#a7f3d0" fontSize="7">Example: "user.created", "user.validated"</text>

          <text x="335" y="152" fill="#6ee7b7" fontSize="9" fontWeight="600">pv.otel.resourceMatch</text>
          <text x="340" y="167" fill="#d1fae5" fontSize="7">Attribute patterns to match OTEL traces</text>
          <text x="340" y="179" fill="#a7f3d0" fontSize="7">Example: service.name = "user-service"</text>

          <text x="335" y="199" fill="#6ee7b7" fontSize="9" fontWeight="600">Used with:</text>
          <text x="340" y="214" fill="#d1fae5" fontSize="7">• Workflow templates (.workflow.json)</text>
          <text x="340" y="226" fill="#d1fae5" fontSize="7">• OTEL instrumented code</text>
          <text x="340" y="238" fill="#d1fae5" fontSize="7">• Validation engine</text>

          <text x="335" y="258" fill="#34d399" fontSize="8" fontWeight="bold">Purpose: Validate runtime</text>
          <text x="335" y="271" fill="#34d399" fontSize="8" fontWeight="bold">behavior matches architecture</text>
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
        <strong style={{ color: '#10b981' }}>.otel.canvas files</strong> add <code style={{ color: '#34d399' }}>pv.events</code> and <code style={{ color: '#34d399' }}>pv.otel</code> metadata that define <em>expected runtime behavior</em> for validation.
      </div>
    </div>
  );
};

const Step4SharedLibrary: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">BOTH USE library.yaml</text>

        {/* Library in center */}
        <g>
          <rect x="200" y="50" width="200" height="100" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="3" rx="6" />
          <text x="300" y="72" textAnchor="middle" fill="#ddd6fe" fontSize="12" fontWeight="700">library.yaml</text>

          <rect x="215" y="85" width="170" height="55" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="225" y="100" fill="#e9d5ff" fontSize="8">nodeComponents:</text>
          <text x="230" y="113" fill="#ddd6fe" fontSize="8">  rest-api: {'{'}</text>
          <text x="235" y="126" fill="#c4b5fd" fontSize="7">    sources: ["src/api/**"]</text>
        </g>

        {/* Arrow left to .canvas */}
        <line x1="195" y1="100" x2="160" y2="100" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-blue)" />
        <text x="178" y="90" textAnchor="middle" fill="#3b82f6" fontSize="8">uses</text>

        {/* .canvas uses */}
        <g>
          <rect x="30" y="65" width="125" height="70" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="92" y="85" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">.canvas</text>
          <text x="40" y="100" fill="#93c5fd" fontSize="7">✓ nodeType reference</text>
          <text x="40" y="112" fill="#93c5fd" fontSize="7">✓ Visual styling</text>
          <text x="40" y="124" fill="#93c5fd" fontSize="7">✓ Consistent types</text>
        </g>

        {/* Arrow right to .otel.canvas */}
        <line x1="405" y1="100" x2="440" y2="100" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green2)" />
        <text x="422" y="90" textAnchor="middle" fill="#10b981" fontSize="8">uses</text>

        {/* .otel.canvas uses */}
        <g>
          <rect x="445" y="65" width="125" height="70" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="507" y="85" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">.otel.canvas</text>
          <text x="455" y="100" fill="#6ee7b7" fontSize="7">✓ nodeType reference</text>
          <text x="455" y="112" fill="#6ee7b7" fontSize="7">✓ Visual styling</text>
          <text x="455" y="124" fill="#6ee7b7" fontSize="7">✓ Source anchoring</text>
        </g>

        {/* Benefits */}
        <g>
          <rect x="40" y="180" width="520" height="85" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="200" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">SHARED BENEFITS FROM library.yaml</text>

          <text x="50" y="220" fill="#c4b5fd" fontSize="9">• <tspan fill="#8b5cf6" fontWeight="bold">Consistent component types</tspan> - Both reference same nodeTypes (rest-api, service, etc.)</text>
          <text x="50" y="235" fill="#c4b5fd" fontSize="9">• <tspan fill="#8b5cf6" fontWeight="bold">Visual consistency</tspan> - Same colors, shapes, icons across all diagrams</text>
          <text x="50" y="250" fill="#c4b5fd" fontSize="9">• <tspan fill="#8b5cf6" fontWeight="bold">Source anchoring</tspan> - Library's <code>sources</code> globs link types to code areas</text>
        </g>

        <defs>
          <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M9,0 L9,6 L0,3 z" fill="#3b82f6" />
          </marker>
          <marker id="arrow-green2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
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
        Both canvas types use <strong style={{ color: '#8b5cf6' }}>library.yaml</strong> for reusable component definitions, visual consistency, and source code anchoring - the difference is runtime validation.
      </div>
    </div>
  );
};

const Step5WhenToUseWhich: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">DECISION GUIDE: WHICH TYPE TO USE?</text>

        {/* Decision tree */}
        <g>
          <rect x="180" y="50" width="240" height="45" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">Do you need runtime validation?</text>

          {/* Arrow down */}
          <line x1="200" y1="100" x2="200" y2="120" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow3)" />
          <line x1="400" y1="100" x2="400" y2="120" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow3)" />

          <text x="150" y="113" fill="#ef4444" fontSize="10" fontWeight="bold">NO</text>
          <text x="440" y="113" fill="#10b981" fontSize="10" fontWeight="bold">YES</text>
        </g>

        {/* NO branch - .canvas */}
        <g>
          <rect x="40" y="125" width="320" height="180" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="200" y="145" textAnchor="middle" fill="#dbeafe" fontSize="12" fontWeight="600">Use .canvas</text>

          <rect x="55" y="155" width="290" height="140" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="65" y="170" fill="#bfdbfe" fontSize="9" fontWeight="600">Perfect for:</text>
          <text x="70" y="185" fill="#93c5fd" fontSize="8">✓ High-level system architecture</text>
          <text x="70" y="198" fill="#93c5fd" fontSize="8">✓ Design documents & planning</text>
          <text x="70" y="211" fill="#93c5fd" fontSize="8">✓ External/third-party systems</text>
          <text x="70" y="224" fill="#93c5fd" fontSize="8">✓ Stakeholder presentations</text>
          <text x="70" y="237" fill="#93c5fd" fontSize="8">✓ Team onboarding materials</text>
          <text x="70" y="250" fill="#93c5fd" fontSize="8">✓ Documentation that won't change</text>

          <text x="65" y="270" fill="#60a5fa" fontSize="8" fontStyle="italic">Just visual - no OTEL needed</text>
        </g>

        {/* YES branch - .otel.canvas */}
        <g>
          <rect x="380" y="125" width="180" height="180" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="470" y="145" textAnchor="middle" fill="#d1fae5" fontSize="12" fontWeight="600">Use .otel.canvas</text>

          <rect x="395" y="155" width="150" height="140" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="405" y="170" fill="#a7f3d0" fontSize="9" fontWeight="600">Perfect for:</text>
          <text x="410" y="185" fill="#6ee7b7" fontSize="8">✓ Test validation</text>
          <text x="410" y="198" fill="#6ee7b7" fontSize="8">✓ Production monitoring</text>
          <text x="410" y="211" fill="#6ee7b7" fontSize="8">✓ API flows</text>
          <text x="410" y="224" fill="#6ee7b7" fontSize="8">✓ Service interactions</text>
          <text x="410" y="237" fill="#6ee7b7" fontSize="8">✓ Event-driven systems</text>
          <text x="410" y="250" fill="#6ee7b7" fontSize="8">✓ Critical workflows</text>

          <text x="405" y="270" fill="#34d399" fontSize="8" fontStyle="italic" fontWeight="bold">Validated at runtime</text>
        </g>

        <defs>
          <marker id="arrow3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
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
        <strong>Simple rule:</strong> If you're instrumenting code with OTEL and want to validate execution, use <code style={{ color: '#10b981' }}>.otel.canvas</code>. For everything else (docs, design, planning), use <code style={{ color: '#3b82f6' }}>.canvas</code>.
      </div>
    </div>
  );
};

const Step6FileOrganization: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">TYPICAL FILE ORGANIZATION</text>

        {/* File tree */}
        <g>
          <rect x="40" y="45" width="520" height="240" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="4" />

          <text x="60" y="70" fill="#94a3b8" fontSize="11" fontFamily="monospace">my-project/</text>

          {/* .principal-views folder */}
          <text x="80" y="95" fill="#a78bfa" fontSize="11" fontFamily="monospace">📁 .principal-views/</text>
          <text x="100" y="115" fill="#8b5cf6" fontSize="10" fontFamily="monospace" fontWeight="bold">library.yaml</text>
          <text x="285" y="115" fill="#c4b5fd" fontSize="9">← Shared component definitions</text>

          {/* Static .canvas files */}
          <rect x="95" y="125" width="450" height="50" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="105" y="142" fill="#3b82f6" fontSize="9" fontWeight="600">Static Documentation (.canvas):</text>
          <text x="110" y="155" fill="#93c5fd" fontSize="8" fontFamily="monospace">architecture.canvas</text>
          <text x="110" y="167" fill="#93c5fd" fontSize="8" fontFamily="monospace">system-overview.canvas</text>

          {/* Runtime .otel.canvas files */}
          <rect x="95" y="185" width="450" height="75" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="105" y="202" fill="#10b981" fontSize="9" fontWeight="600">Runtime Validated (.otel.canvas):</text>
          <text x="110" y="215" fill="#6ee7b7" fontSize="8" fontFamily="monospace">user-registration.otel.canvas</text>
          <text x="110" y="227" fill="#6ee7b7" fontSize="8" fontFamily="monospace">order-processing.otel.canvas</text>
          <text x="110" y="239" fill="#6ee7b7" fontSize="8" fontFamily="monospace">payment-flow.otel.canvas</text>
          <text x="110" y="251" fill="#6ee7b7" fontSize="8" fontFamily="monospace">api-gateway.otel.canvas</text>

          {/* Narratives */}
          <text x="100" y="275" fill="#a78bfa" fontSize="10" fontFamily="monospace">📁 __workflows__/</text>
          <text x="120" y="290" fill="#c4b5fd" fontSize="8" fontFamily="monospace">*.workflow.json</text>
          <text x="285" y="290" fill="#ddd6fe" fontSize="8">← Match .otel.canvas files</text>
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
        Organize by purpose: <strong style={{ color: '#3b82f6' }}>Static .canvas</strong> for documentation, <strong style={{ color: '#10b981' }}>.otel.canvas</strong> for validated workflows, and workflows only for OTEL files.
      </div>
    </div>
  );
};

const Step7Evolution: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="20" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">EVOLUTION PATH</text>

        {/* Timeline */}
        <g>
          {/* Phase 1: Design */}
          <rect x="40" y="40" width="140" height="90" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="110" y="60" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="700">1. DESIGN</text>
          <text x="48" y="75" fill="#93c5fd" fontSize="8">Create .canvas</text>
          <text x="48" y="87" fill="#93c5fd" fontSize="8">for planning</text>
          <text x="48" y="99" fill="#93c5fd" fontSize="8">and design</text>
          <text x="48" y="111" fill="#93c5fd" fontSize="8">discussions</text>

          <line x1="185" y1="85" x2="215" y2="85" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow4)" />

          {/* Phase 2: Implement */}
          <rect x="220" y="40" width="140" height="90" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="290" y="60" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="700">2. IMPLEMENT</text>
          <text x="228" y="75" fill="#c4b5fd" fontSize="8">Write code</text>
          <text x="228" y="87" fill="#c4b5fd" fontSize="8">Add OTEL</text>
          <text x="228" y="99" fill="#c4b5fd" fontSize="8">instrumentation</text>

          <line x1="365" y1="85" x2="395" y2="85" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow4)" />

          {/* Phase 3: Validate */}
          <rect x="400" y="40" width="160" height="90" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="480" y="60" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="700">3. VALIDATE</text>
          <text x="408" y="75" fill="#6ee7b7" fontSize="8">Convert to</text>
          <text x="408" y="87" fill="#6ee7b7" fontSize="8">.otel.canvas</text>
          <text x="408" y="99" fill="#6ee7b7" fontSize="8">Add event schemas</text>
          <text x="408" y="111" fill="#6ee7b7" fontSize="8">Create narratives</text>
        </g>

        {/* You can keep both! */}
        <g>
          <rect x="40" y="155" width="520" height="110" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="175" textAnchor="middle" fill="#ddd6fe" fontSize="12" fontWeight="600">YOU CAN HAVE BOTH!</text>

          <text x="50" y="195" fill="#c4b5fd" fontSize="9">Keep <tspan fill="#3b82f6" fontWeight="bold">architecture.canvas</tspan> for high-level overview</text>
          <text x="50" y="210" fill="#c4b5fd" fontSize="9">+ Create <tspan fill="#10b981" fontWeight="bold">user-flow.otel.canvas</tspan> for specific validated workflows</text>

          <rect x="55" y="220" width="490" height="35" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="65" y="235" fill="#e9d5ff" fontSize="8">Example: architecture.canvas shows entire system</text>
          <text x="65" y="247" fill="#e9d5ff" fontSize="8">         + order-processing.otel.canvas validates critical order flow with tests</text>
        </g>

        <defs>
          <marker id="arrow4" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
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
        <strong>Evolution:</strong> Start with <code style={{ color: '#3b82f6' }}>.canvas</code> for design. When you add OTEL and need validation, create <code style={{ color: '#10b981' }}>.otel.canvas</code> for critical flows. Keep both!
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'types', title: 'Two Types of Canvas Files', component: Step1TwoTypes },
  { id: 'static', title: 'Static .canvas Files', component: Step2StaticCanvas },
  { id: 'otel', title: 'Runtime .otel.canvas Files', component: Step3OtelCanvas },
  { id: 'library', title: 'Both Use library.yaml', component: Step4SharedLibrary },
  { id: 'decision', title: 'When to Use Which?', component: Step5WhenToUseWhich },
  { id: 'organization', title: 'File Organization', component: Step6FileOrganization },
  { id: 'evolution', title: 'Evolution Path', component: Step7Evolution },
];

export const CanvasTypesExplainerPanel: React.FC<CanvasTypesExplainerPanelProps> = ({ className }) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['types']));

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
          Canvas Types Guide
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          Understanding the difference between .canvas (static documentation) and .otel.canvas (runtime validated) files
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
          Quick Reference
        </h3>
        <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
          <div style={{ flex: 1, padding: '16px', backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '6px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#60a5fa', marginBottom: '8px' }}>
              📄 .canvas
            </div>
            <div style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '8px' }}>
              Static documentation
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              Design, planning, high-level views. No runtime validation needed.
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px', backgroundColor: '#022c22', border: '1px solid #10b981', borderRadius: '6px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#34d399', marginBottom: '8px' }}>
              🔍 .otel.canvas
            </div>
            <div style={{ fontSize: '14px', color: '#6ee7b7', marginBottom: '8px' }}>
              Runtime validated
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              OTEL instrumented code, tests, production monitoring. Includes event schemas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasTypesExplainerPanel;
