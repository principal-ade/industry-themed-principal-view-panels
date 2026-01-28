import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface LibraryAnchoringExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1WhatIsAnchoring: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 200" style={{ width: '100%', height: 'auto' }}>
        {/* Three layers */}
        <g>
          {/* Canvas Layer */}
          <rect x="40" y="30" width="160" height="140" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="120" y="55" textAnchor="middle" fill="#dbeafe" fontSize="12" fontWeight="600">CANVAS FILE</text>
          <text x="50" y="75" fill="#bfdbfe" fontSize="10">Architecture View</text>
          <text x="55" y="95" fill="#93c5fd" fontSize="9" fontFamily="monospace">node: "UserAPI"</text>
          <text x="55" y="110" fill="#93c5fd" fontSize="9" fontFamily="monospace">nodeType:</text>
          <text x="60" y="125" fill="#60a5fa" fontSize="9" fontFamily="monospace" fontWeight="bold">  "rest-api"</text>
          <text x="50" y="150" fill="#bfdbfe" fontSize="8" fontStyle="italic">What component</text>
          <text x="50" y="162" fill="#bfdbfe" fontSize="8" fontStyle="italic">type is this?</text>
        </g>

        {/* Arrow 1 */}
        <g>
          <line x1="205" y1="100" x2="235" y2="100" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green)" />
          <text x="220" y="90" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="600">looks up</text>
        </g>

        {/* Library Layer */}
        <g>
          <rect x="240" y="30" width="160" height="140" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="320" y="55" textAnchor="middle" fill="#d1fae5" fontSize="12" fontWeight="600">LIBRARY.YAML</text>
          <text x="250" y="75" fill="#a7f3d0" fontSize="10">Component Definition</text>
          <text x="255" y="95" fill="#6ee7b7" fontSize="9" fontFamily="monospace">rest-api:</text>
          <text x="260" y="110" fill="#6ee7b7" fontSize="9" fontFamily="monospace">  sources:</text>
          <text x="265" y="125" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">    - src/api/**</text>
          <text x="250" y="150" fill="#a7f3d0" fontSize="8" fontStyle="italic">Where is this</text>
          <text x="250" y="162" fill="#a7f3d0" fontSize="8" fontStyle="italic">code located?</text>
        </g>

        {/* Arrow 2 */}
        <g>
          <line x1="405" y1="100" x2="435" y2="100" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-orange)" />
          <text x="420" y="90" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="600">globs</text>
        </g>

        {/* Runtime Layer */}
        <g>
          <rect x="440" y="30" width="145" height="140" fill="#451a03" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="512" y="55" textAnchor="middle" fill="#fef3c7" fontSize="12" fontWeight="600">RUNTIME</text>
          <text x="450" y="75" fill="#fde68a" fontSize="10">OTEL Events</text>
          <text x="455" y="95" fill="#fbbf24" fontSize="8" fontFamily="monospace">code.filepath:</text>
          <text x="460" y="108" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">  src/api/</text>
          <text x="460" y="121" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">  users.ts:42</text>
          <text x="450" y="145" fill="#fde68a" fontSize="8" fontStyle="italic">Exact file and</text>
          <text x="450" y="157" fill="#fde68a" fontSize="8" fontStyle="italic">line at runtime</text>
        </g>

        <defs>
          <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
          </marker>
          <marker id="arrow-orange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
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
        <strong>Implementation Anchoring</strong> connects architectural diagrams to actual source code through a three-layer system: Canvas defines components, Library maps to code areas, and OTEL traces reveal runtime execution.
      </div>
    </div>
  );
};

const Step2LibraryStructure: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">LIBRARY.YAML STRUCTURE</text>

        {/* Library file */}
        <g>
          <rect x="40" y="45" width="520" height="260" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="6" />

          {/* Header */}
          <text x="300" y="70" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">library.yaml</text>

          {/* Node Components Section */}
          <g>
            <rect x="60" y="85" width="240" height="200" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" rx="4" />
            <text x="180" y="105" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="700">NODE COMPONENTS</text>

            {/* Example 1: rest-api */}
            <rect x="70" y="115" width="220" height="75" fill="#064e3b" stroke="#059669" strokeWidth="1" rx="3" />
            <text x="80" y="130" fill="#d1fae5" fontSize="9" fontFamily="monospace" fontWeight="600">rest-api:</text>
            <text x="85" y="143" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  shape: rectangle</text>
            <text x="85" y="155" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  color: "#4A90E2"</text>
            <text x="85" y="167" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  icon: "Globe"</text>
            <text x="85" y="179" fill="#6ee7b7" fontSize="8" fontFamily="monospace" fontWeight="600">  sources:</text>
            <text x="90" y="191" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">    - "src/api/**/*.ts"</text>

            {/* Example 2: service */}
            <rect x="70" y="200" width="220" height="70" fill="#064e3b" stroke="#059669" strokeWidth="1" rx="3" />
            <text x="80" y="215" fill="#d1fae5" fontSize="9" fontFamily="monospace" fontWeight="600">service:</text>
            <text x="85" y="228" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  shape: hexagon</text>
            <text x="85" y="240" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  color: "#7ED321"</text>
            <text x="85" y="252" fill="#6ee7b7" fontSize="8" fontFamily="monospace" fontWeight="600">  sources:</text>
            <text x="90" y="264" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">    - "src/services/**"</text>
          </g>

          {/* Edge Components Section */}
          <g>
            <rect x="320" y="85" width="240" height="200" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" rx="4" />
            <text x="440" y="105" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">EDGE COMPONENTS</text>

            {/* Example 1: http-request */}
            <rect x="330" y="115" width="220" height="65" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="3" />
            <text x="340" y="130" fill="#dbeafe" fontSize="9" fontFamily="monospace" fontWeight="600">http-request:</text>
            <text x="345" y="143" fill="#bfdbfe" fontSize="8" fontFamily="monospace">  style: solid</text>
            <text x="345" y="155" fill="#bfdbfe" fontSize="8" fontFamily="monospace">  color: "#4A90E2"</text>
            <text x="345" y="167" fill="#bfdbfe" fontSize="8" fontFamily="monospace">  directed: true</text>

            {/* Example 2: publish-event */}
            <rect x="330" y="190" width="220" height="80" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="3" />
            <text x="340" y="205" fill="#dbeafe" fontSize="9" fontFamily="monospace" fontWeight="600">publish-event:</text>
            <text x="345" y="218" fill="#bfdbfe" fontSize="8" fontFamily="monospace">  style: dashed</text>
            <text x="345" y="230" fill="#bfdbfe" fontSize="8" fontFamily="monospace">  color: "#FF6B35"</text>
            <text x="345" y="242" fill="#bfdbfe" fontSize="8" fontFamily="monospace">  animation:</text>
            <text x="350" y="254" fill="#93c5fd" fontSize="8" fontFamily="monospace">    type: particle</text>
            <text x="350" y="266" fill="#93c5fd" fontSize="8" fontFamily="monospace">    duration: 1500</text>
          </g>
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
        Library files define <strong style={{ color: '#6ee7b7' }}>nodeComponents</strong> (like rest-api, service) and <strong style={{ color: '#93c5fd' }}>edgeComponents</strong> (like http-request) with visual styles and source file patterns.
      </div>
    </div>
  );
};

const Step3SourcesGlobbing: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">SOURCE GLOB PATTERNS</text>

        {/* Library definition */}
        <g>
          <rect x="40" y="45" width="200" height="90" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="140" y="65" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">library.yaml</text>
          <text x="50" y="83" fill="#a7f3d0" fontSize="9" fontFamily="monospace">rest-api:</text>
          <text x="55" y="96" fill="#6ee7b7" fontSize="9" fontFamily="monospace">  sources:</text>
          <text x="60" y="109" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">    - "src/api/**/*.ts"</text>
          <text x="60" y="122" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">    - "src/routes/**/*.ts"</text>
        </g>

        {/* Arrow */}
        <g>
          <line x1="250" y1="90" x2="330" y2="90" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow2)" />
          <text x="290" y="80" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="600">glob match</text>
        </g>

        {/* Matched files */}
        <g>
          <rect x="340" y="45" width="220" height="230" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="450" y="65" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">MATCHED FILES</text>

          {/* File tree */}
          <text x="355" y="85" fill="#fbbf24" fontSize="9" fontFamily="monospace">📁 src/</text>
          <text x="370" y="100" fill="#fbbf24" fontSize="9" fontFamily="monospace">📁 api/</text>
          <text x="385" y="115" fill="#34d399" fontSize="9" fontFamily="monospace">✓ users.ts</text>
          <text x="385" y="128" fill="#34d399" fontSize="9" fontFamily="monospace">✓ orders.ts</text>
          <text x="385" y="141" fill="#34d399" fontSize="9" fontFamily="monospace">✓ products.ts</text>

          <text x="370" y="160" fill="#fbbf24" fontSize="9" fontFamily="monospace">📁 routes/</text>
          <text x="385" y="175" fill="#34d399" fontSize="9" fontFamily="monospace">✓ auth.ts</text>
          <text x="385" y="188" fill="#34d399" fontSize="9" fontFamily="monospace">✓ public.ts</text>

          <text x="370" y="207" fill="#64748b" fontSize="9" fontFamily="monospace">📁 utils/</text>
          <text x="385" y="222" fill="#64748b" fontSize="9" fontFamily="monospace">✗ helpers.ts</text>
          <text x="385" y="235" fill="#64748b" fontSize="9" fontFamily="monospace">✗ validators.ts</text>

          <text x="355" y="255" fill="#6ee7b7" fontSize="8" fontStyle="italic">✓ = matched by glob</text>
          <text x="355" y="267" fill="#64748b" fontSize="8" fontStyle="italic">✗ = not matched</text>
        </g>

        {/* Glob explanation */}
        <rect x="40" y="155" width="280" height="120" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" rx="4" />
        <text x="50" y="175" fill="#dbeafe" fontSize="10" fontWeight="600">Glob Pattern Syntax:</text>
        <text x="55" y="195" fill="#bfdbfe" fontSize="9" fontFamily="monospace">**</text>
        <text x="75" y="195" fill="#93c5fd" fontSize="9">= matches any directory depth</text>
        <text x="55" y="210" fill="#bfdbfe" fontSize="9" fontFamily="monospace">*</text>
        <text x="75" y="210" fill="#93c5fd" fontSize="9">= matches any characters</text>
        <text x="55" y="225" fill="#bfdbfe" fontSize="9" fontFamily="monospace">*.ts</text>
        <text x="75" y="225" fill="#93c5fd" fontSize="9">= matches TypeScript files</text>
        <text x="55" y="245" fill="#60a5fa" fontSize="8">Example: src/api/**/*.ts matches:</text>
        <text x="60" y="257" fill="#93c5fd" fontSize="8">  src/api/users.ts ✓</text>
        <text x="60" y="267" fill="#93c5fd" fontSize="8">  src/api/v2/products.ts ✓</text>

        <defs>
          <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
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
        <strong>Glob patterns</strong> in the <code style={{ color: '#34d399' }}>sources</code> field match multiple files and directories, linking component types to all related implementation files.
      </div>
    </div>
  );
};

const Step4CanvasReferences: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">CANVAS REFERENCES LIBRARY</text>

        {/* Canvas file */}
        <g>
          <rect x="40" y="50" width="240" height="210" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="160" y="72" textAnchor="middle" fill="#dbeafe" fontSize="12" fontWeight="600">my-architecture.canvas</text>

          {/* Node 1 */}
          <rect x="55" y="85" width="210" height="75" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="65" y="100" fill="#bfdbfe" fontSize="9" fontFamily="monospace">&#123;</text>
          <text x="70" y="113" fill="#bfdbfe" fontSize="9" fontFamily="monospace">  id: "user-api",</text>
          <text x="70" y="126" fill="#bfdbfe" fontSize="9" fontFamily="monospace">  text: "User API",</text>
          <text x="70" y="139" fill="#bfdbfe" fontSize="9" fontFamily="monospace">  pv: &#123;</text>
          <text x="75" y="152" fill="#60a5fa" fontSize="9" fontFamily="monospace" fontWeight="bold">    nodeType: "rest-api"</text>
          <text x="70" y="165" fill="#bfdbfe" fontSize="9" fontFamily="monospace">  &#125;</text>

          {/* Node 2 */}
          <rect x="55" y="170" width="210" height="75" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="65" y="185" fill="#bfdbfe" fontSize="9" fontFamily="monospace">&#123;</text>
          <text x="70" y="198" fill="#bfdbfe" fontSize="9" fontFamily="monospace">  id: "order-svc",</text>
          <text x="70" y="211" fill="#bfdbfe" fontSize="9" fontFamily="monospace">  text: "OrderService",</text>
          <text x="70" y="224" fill="#bfdbfe" fontSize="9" fontFamily="monospace">  pv: &#123;</text>
          <text x="75" y="237" fill="#60a5fa" fontSize="9" fontFamily="monospace" fontWeight="bold">    nodeType: "service"</text>
          <text x="70" y="250" fill="#bfdbfe" fontSize="9" fontFamily="monospace">  &#125;</text>
        </g>

        {/* Arrows */}
        <g>
          <line x1="285" y1="122" x2="315" y2="105" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow3)" />
          <line x1="285" y1="207" x2="315" y2="145" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow3)" />
          <text x="295" y="115" fill="#10b981" fontSize="8" fontWeight="600">lookup</text>
          <text x="295" y="195" fill="#10b981" fontSize="8" fontWeight="600">lookup</text>
        </g>

        {/* Library */}
        <g>
          <rect x="320" y="50" width="240" height="210" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="440" y="72" textAnchor="middle" fill="#d1fae5" fontSize="12" fontWeight="600">library.yaml</text>

          {/* rest-api definition */}
          <rect x="335" y="85" width="210" height="60" fill="#022c22" stroke="#047857" strokeWidth="1" rx="3" />
          <text x="345" y="100" fill="#6ee7b7" fontSize="9" fontFamily="monospace" fontWeight="600">rest-api:</text>
          <text x="350" y="113" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  color: "#4A90E2"</text>
          <text x="350" y="125" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  sources:</text>
          <text x="355" y="137" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">    - src/api/**/*.ts</text>

          {/* service definition */}
          <rect x="335" y="155" width="210" height="60" fill="#022c22" stroke="#047857" strokeWidth="1" rx="3" />
          <text x="345" y="170" fill="#6ee7b7" fontSize="9" fontFamily="monospace" fontWeight="600">service:</text>
          <text x="350" y="183" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  color: "#7ED321"</text>
          <text x="350" y="195" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  sources:</text>
          <text x="355" y="207" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">    - src/services/**</text>

          {/* metadata */}
          <rect x="335" y="225" width="210" height="25" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="3" />
          <text x="345" y="240" fill="#93c5fd" fontSize="8" fontStyle="italic">+ visual styles, schemas, states...</text>
        </g>

        <defs>
          <marker id="arrow3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        Canvas nodes use <code style={{ color: '#60a5fa' }}>pv.nodeType</code> to reference library component definitions, inheriting all visual styles and source file patterns.
      </div>
    </div>
  );
};

const Step5RuntimeAnchoring: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 350" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">RUNTIME EXECUTION ANCHORING</text>

        {/* Flow */}
        <g>
          {/* Step 1: Code Runs */}
          <rect x="40" y="50" width="140" height="80" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="110" y="68" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="600">1. CODE RUNS</text>
          <text x="48" y="85" fill="#94a3b8" fontSize="8" fontFamily="monospace">src/api/users.ts</text>
          <text x="48" y="100" fill="#a78bfa" fontSize="8">Function executes</text>
          <text x="48" y="115" fill="#a78bfa" fontSize="8">with OTEL</text>
          <text x="48" y="127" fill="#a78bfa" fontSize="8">instrumentation</text>

          {/* Arrow */}
          <line x1="185" y1="90" x2="215" y2="90" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow4)" />

          {/* Step 2: OTEL Captures */}
          <rect x="220" y="50" width="140" height="80" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="290" y="68" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="600">2. OTEL EVENT</text>
          <text x="228" y="85" fill="#fbbf24" fontSize="8" fontFamily="monospace">name: "api.request"</text>
          <text x="228" y="100" fill="#fbbf24" fontSize="8" fontFamily="monospace">attributes:</text>
          <text x="233" y="115" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">  code.filepath:</text>
          <text x="238" y="127" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">    src/api/users.ts</text>

          {/* Arrow */}
          <line x1="365" y1="90" x2="395" y2="90" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow4)" />

          {/* Step 3: Event Mapper */}
          <rect x="400" y="50" width="160" height="80" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="480" y="68" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="600">3. EVENT MAPPER</text>
          <text x="408" y="85" fill="#60a5fa" fontSize="8">Matches event to</text>
          <text x="408" y="100" fill="#60a5fa" fontSize="8">canvas node via:</text>
          <text x="408" y="115" fill="#bfdbfe" fontSize="8">• pv.events schema</text>
          <text x="408" y="127" fill="#bfdbfe" fontSize="8">• pv.otel.resourceMatch</text>
        </g>

        {/* Connection visualization */}
        <g>
          <text x="300" y="160" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">THE COMPLETE CHAIN</text>

          {/* Layer boxes */}
          <rect x="40" y="180" width="520" height="150" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="4" />

          {/* Canvas Node */}
          <rect x="55" y="195" width="150" height="120" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" rx="3" />
          <text x="130" y="210" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="600">Canvas Node</text>
          <text x="62" y="225" fill="#93c5fd" fontSize="8">id: "user-api"</text>
          <text x="62" y="238" fill="#60a5fa" fontSize="8" fontWeight="bold">nodeType: "rest-api"</text>
          <text x="62" y="255" fill="#93c5fd" fontSize="8">pv.events:</text>
          <text x="67" y="268" fill="#93c5fd" fontSize="8">  - "api.request"</text>
          <line x1="62" y1="280" x2="198" y2="280" stroke="#3b82f6" strokeWidth="1" />
          <text x="130" y="293" textAnchor="middle" fill="#60a5fa" fontSize="7" fontStyle="italic">Architecture layer</text>

          {/* Library Type */}
          <rect x="220" y="195" width="150" height="120" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" rx="3" />
          <text x="295" y="210" textAnchor="middle" fill="#d1fae5" fontSize="9" fontWeight="600">Library Type</text>
          <text x="227" y="225" fill="#a7f3d0" fontSize="8">rest-api:</text>
          <text x="232" y="238" fill="#6ee7b7" fontSize="8">  sources:</text>
          <text x="237" y="251" fill="#34d399" fontSize="8" fontWeight="bold">    - src/api/**</text>
          <line x1="227" y1="262" x2="363" y2="262" stroke="#10b981" strokeWidth="1" />
          <text x="295" y="275" textAnchor="middle" fill="#6ee7b7" fontSize="7" fontStyle="italic">Code area globs</text>
          <text x="295" y="293" textAnchor="middle" fill="#34d399" fontSize="7" fontWeight="bold">Matches 5 files</text>

          {/* Runtime Event */}
          <rect x="385" y="195" width="160" height="120" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" rx="3" />
          <text x="465" y="210" textAnchor="middle" fill="#fef3c7" fontSize="9" fontWeight="600">Runtime Event</text>
          <text x="392" y="225" fill="#fde68a" fontSize="8">name: "api.request"</text>
          <text x="392" y="238" fill="#fbbf24" fontSize="8">attributes:</text>
          <text x="397" y="251" fill="#f59e0b" fontSize="8" fontWeight="bold">  code.filepath:</text>
          <text x="402" y="264" fill="#f59e0b" fontSize="8" fontWeight="bold">    src/api/users.ts</text>
          <text x="397" y="277" fill="#f59e0b" fontSize="8" fontWeight="bold">  code.lineno: 42</text>
          <line x1="392" y1="285" x2="538" y2="285" stroke="#f59e0b" strokeWidth="1" />
          <text x="465" y="298" textAnchor="middle" fill="#fbbf24" fontSize="7" fontStyle="italic">Exact file + line</text>
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
        At runtime, OTEL events include <code style={{ color: '#f59e0b' }}>code.filepath</code> and <code style={{ color: '#f59e0b' }}>code.lineno</code> attributes that pinpoint the exact source location, completing the anchoring from architecture to implementation.
      </div>
    </div>
  );
};

const Step6FileOrganization: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">FILE ORGANIZATION</text>

        {/* File tree */}
        <g>
          <rect x="40" y="45" width="520" height="240" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="4" />

          {/* Project root */}
          <text x="60" y="70" fill="#94a3b8" fontSize="11" fontFamily="monospace">my-project/</text>

          {/* .principal-views folder */}
          <text x="80" y="95" fill="#a78bfa" fontSize="11" fontFamily="monospace">📁 .principal-views/</text>
          <text x="100" y="115" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">library.yaml</text>
          <text x="285" y="115" fill="#6ee7b7" fontSize="9">← Component definitions + source globs</text>

          <text x="100" y="135" fill="#3b82f6" fontSize="10" fontFamily="monospace">architecture.canvas</text>
          <text x="285" y="135" fill="#93c5fd" fontSize="9">← References library nodeTypes</text>

          <text x="100" y="155" fill="#3b82f6" fontSize="10" fontFamily="monospace">api-flow.otel.canvas</text>
          <text x="285" y="155" fill="#93c5fd" fontSize="9">← References library + event schemas</text>

          <text x="100" y="175" fill="#a78bfa" fontSize="10" fontFamily="monospace">__workflows__/</text>
          <text x="120" y="193" fill="#c4b5fd" fontSize="9" fontFamily="monospace">api-flow.workflow.json</text>

          {/* Source code folder */}
          <text x="80" y="220" fill="#fbbf24" fontSize="11" fontFamily="monospace">📁 src/</text>
          <text x="100" y="238" fill="#f59e0b" fontSize="10" fontFamily="monospace">📁 api/</text>
          <text x="120" y="256" fill="#fde68a" fontSize="9" fontFamily="monospace">users.ts, orders.ts...</text>
          <text x="340" y="256" fill="#f59e0b" fontSize="9">← Matched by library sources globs</text>
          <text x="100" y="273" fill="#f59e0b" fontSize="10" fontFamily="monospace">📁 services/</text>
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
        Keep <code style={{ color: '#10b981' }}>library.yaml</code> in <code>.principal-views/</code> to define reusable component types. Canvas files reference these types, and the <code style={{ color: '#f59e0b' }}>sources</code> globs anchor them to actual source code.
      </div>
    </div>
  );
};

const Step7EndToEnd: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="20" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">END-TO-END ANCHORING WORKFLOW</text>

        {/* Top row */}
        <g>
          {/* Step 1: Define Library */}
          <rect x="40" y="40" width="140" height="75" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="110" y="58" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="700">1. DEFINE</text>
          <text x="48" y="73" fill="#a7f3d0" fontSize="8">Create library.yaml</text>
          <text x="48" y="85" fill="#a7f3d0" fontSize="8">with component</text>
          <text x="48" y="97" fill="#a7f3d0" fontSize="8">types and source</text>
          <text x="48" y="109" fill="#a7f3d0" fontSize="8">globs</text>

          <line x1="185" y1="77" x2="215" y2="77" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow5)" />

          {/* Step 2: Create Canvas */}
          <rect x="220" y="40" width="140" height="75" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="290" y="58" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="700">2. CREATE</text>
          <text x="228" y="73" fill="#bfdbfe" fontSize="8">Build canvas with</text>
          <text x="228" y="85" fill="#bfdbfe" fontSize="8">nodes referencing</text>
          <text x="228" y="97" fill="#bfdbfe" fontSize="8">library nodeTypes</text>

          <line x1="365" y1="77" x2="395" y2="77" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow5)" />

          {/* Step 3: Write Code */}
          <rect x="400" y="40" width="160" height="75" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="480" y="58" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="700">3. IMPLEMENT</text>
          <text x="408" y="73" fill="#a78bfa" fontSize="8">Write code in files</text>
          <text x="408" y="85" fill="#a78bfa" fontSize="8">matching source</text>
          <text x="408" y="97" fill="#a78bfa" fontSize="8">globs (src/api/**)</text>
        </g>

        {/* Arrow down */}
        <line x1="480" y1="120" x2="480" y2="145" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow5)" />

        {/* Middle row */}
        <g>
          {/* Step 4: Instrument */}
          <rect x="400" y="150" width="160" height="75" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="480" y="168" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="700">4. INSTRUMENT</text>
          <text x="408" y="183" fill="#fbbf24" fontSize="8">Add OTEL tracing</text>
          <text x="408" y="195" fill="#fbbf24" fontSize="8">to your code</text>
          <text x="408" y="207" fill="#fbbf24" fontSize="8">(auto or manual)</text>

          <line x1="395" y1="187" x2="365" y2="187" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow5)" />

          {/* Step 5: Execute */}
          <rect x="220" y="150" width="140" height="75" fill="#1e293b" stroke="#ec4899" strokeWidth="2" rx="4" />
          <text x="290" y="168" textAnchor="middle" fill="#fbcfe8" fontSize="10" fontWeight="700">5. EXECUTE</text>
          <text x="228" y="183" fill="#f9a8d4" fontSize="8">Run your app/tests</text>
          <text x="228" y="195" fill="#f9a8d4" fontSize="8">OTEL captures</text>
          <text x="228" y="207" fill="#f9a8d4" fontSize="8">events with</text>
          <text x="228" y="219" fill="#f9a8d4" fontSize="8">code.filepath</text>

          <line x1="215" y1="187" x2="185" y2="187" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow5)" />

          {/* Step 6: Visualize */}
          <rect x="40" y="150" width="140" height="75" fill="#064e3b" stroke="#059669" strokeWidth="2" rx="4" />
          <text x="110" y="168" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="700">6. VISUALIZE</text>
          <text x="48" y="183" fill="#a7f3d0" fontSize="8">View execution</text>
          <text x="48" y="195" fill="#a7f3d0" fontSize="8">mapped to canvas</text>
          <text x="48" y="207" fill="#a7f3d0" fontSize="8">nodes with file</text>
          <text x="48" y="219" fill="#a7f3d0" fontSize="8">locations</text>
        </g>

        {/* Benefits section */}
        <rect x="40" y="245" width="520" height="80" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
        <text x="300" y="263" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="700">WHY THIS MATTERS</text>

        <g>
          <text x="50" y="280" fill="#94a3b8" fontSize="9">• <tspan fill="#6ee7b7" fontWeight="600">Architecture stays in sync</tspan> - globs auto-find new files</text>
          <text x="50" y="293" fill="#94a3b8" fontSize="9">• <tspan fill="#93c5fd" fontWeight="600">Reusable component types</tspan> - define once, use everywhere</text>
          <text x="50" y="306" fill="#94a3b8" fontSize="9">• <tspan fill="#fbbf24" fontWeight="600">Runtime to source mapping</tspan> - click event → open exact file</text>
          <text x="50" y="319" fill="#94a3b8" fontSize="9">• <tspan fill="#f9a8d4" fontWeight="600">Self-documenting</tspan> - architecture reflects actual code structure</text>
        </g>

        <defs>
          <marker id="arrow5" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        The complete flow: <strong style={{ color: '#6ee7b7' }}>define library</strong> → <strong style={{ color: '#93c5fd' }}>create canvas</strong> → <strong style={{ color: '#8b5cf6' }}>implement code</strong> → <strong style={{ color: '#f59e0b' }}>add OTEL</strong> → <strong style={{ color: '#ec4899' }}>execute</strong> → <strong style={{ color: '#059669' }}>visualize</strong> with full source anchoring!
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'what', title: 'What is Implementation Anchoring?', component: Step1WhatIsAnchoring },
  { id: 'structure', title: 'Library File Structure', component: Step2LibraryStructure },
  { id: 'globs', title: 'Source Glob Patterns', component: Step3SourcesGlobbing },
  { id: 'canvas', title: 'Canvas References Library', component: Step4CanvasReferences },
  { id: 'runtime', title: 'Runtime Execution Anchoring', component: Step5RuntimeAnchoring },
  { id: 'files', title: 'File Organization', component: Step6FileOrganization },
  { id: 'workflow', title: 'End-to-End Workflow', component: Step7EndToEnd },
];

export const LibraryAnchoringExplainerPanel: React.FC<LibraryAnchoringExplainerPanelProps> = ({ className }) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['what']));

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
          Library Anchoring Guide
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          Learn how library.yaml files anchor canvas components to actual source code implementations
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
                      backgroundColor: '#10b981',
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
          Ready to Create Your Own?
        </h3>
        <p style={{ color: theme.colors.textSecondary, marginBottom: '16px', fontSize: '14px' }}>
          Now that you understand how library anchoring works, you can define component types and link them to your codebase.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>1.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              Create <code style={{ color: '#10b981' }}>library.yaml</code> in <code>.principal-views/</code>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>2.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              Define component types with <code style={{ color: '#34d399' }}>sources</code> glob patterns
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>3.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              Reference types in canvas files using <code style={{ color: '#60a5fa' }}>pv.nodeType</code>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>4.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              Add OTEL instrumentation and see runtime events anchored to source files
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryAnchoringExplainerPanel;
