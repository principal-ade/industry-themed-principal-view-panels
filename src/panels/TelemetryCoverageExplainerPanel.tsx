import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface TelemetryCoverageExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1TheProblem: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">THE OBSERVABILITY GAP PROBLEM</text>

        {/* Your codebase */}
        <g>
          <rect x="40" y="50" width="520" height="105" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="600">Your Codebase (1000s of files)</text>

          {/* Instrumented files */}
          <rect x="60" y="85" width="200" height="60" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="3" />
          <text x="160" y="105" textAnchor="middle" fill="#d1fae5" fontSize="9" fontWeight="600">✅ Instrumented Files</text>
          <text x="70" y="120" fill="#6ee7b7" fontSize="8">api/users.ts</text>
          <text x="70" y="132" fill="#6ee7b7" fontSize="8">api/orders.ts</text>

          {/* Dark files */}
          <rect x="280" y="85" width="260" height="60" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="3" />
          <text x="410" y="105" textAnchor="middle" fill="#ddd6fe" fontSize="9" fontWeight="600">❓ "Dark" Files (No Telemetry)</text>
          <text x="290" y="120" fill="#c4b5fd" fontSize="8">api/inventory.ts, api/payments.ts, api/shipping.ts,</text>
          <text x="290" y="132" fill="#c4b5fd" fontSize="8">api/notifications.ts, api/analytics.ts, ...</text>
        </g>

        {/* The question */}
        <g>
          <rect x="40" y="170" width="520" height="95" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="300" y="190" textAnchor="middle" fill="#fecaca" fontSize="11" fontWeight="600">🚨 CRITICAL QUESTIONS</text>

          <text x="50" y="210" fill="#fca5a5" fontSize="9">• Which parts of our system have NO observability?</text>
          <text x="50" y="225" fill="#fca5a5" fontSize="9">• Are critical paths instrumented?</text>
          <text x="50" y="240" fill="#fca5a5" fontSize="9">• How much of our codebase is "dark" to monitoring?</text>
          <text x="50" y="255" fill="#fca5a5" fontSize="9">• Is our telemetry coverage improving or degrading over time?</text>
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
        Without measuring <strong style={{ color: '#ef4444' }}>telemetry coverage</strong>, you don't know which parts of your system are "dark"—invisible to your observability tools when things go wrong.
      </div>
    </div>
  );
};

const Step2HowItWorks: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">HOW TELEMETRY COVERAGE WORKS</text>

        {/* Step 1: Expected files from library.yaml */}
        <g>
          <rect x="40" y="50" width="240" height="120" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="160" y="70" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">1. Expected Files (library.yaml)</text>

          <rect x="55" y="80" width="210" height="80" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="65" y="95" fill="#e9d5ff" fontSize="8" fontFamily="monospace">nodeComponents:</text>
          <text x="70" y="108" fill="#c4b5fd" fontSize="8" fontFamily="monospace">  rest-api:</text>
          <text x="75" y="121" fill="#a78bfa" fontSize="8" fontFamily="monospace" fontWeight="bold">    sources: ["src/api/**/*.ts"]</text>
          <text x="70" y="134" fill="#c4b5fd" fontSize="8" fontFamily="monospace">  database:</text>
          <text x="75" y="147" fill="#a78bfa" fontSize="8" fontFamily="monospace" fontWeight="bold">    sources: ["src/db/**/*.ts"]</text>
        </g>

        {/* Arrow */}
        <text x="300" y="115" textAnchor="middle" fill="#10b981" fontSize="16" fontWeight="700">+</text>

        {/* Step 2: Actual files from OTEL traces */}
        <g>
          <rect x="320" y="50" width="240" height="120" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="440" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">2. Actual Files (OTEL Traces)</text>

          <rect x="335" y="80" width="210" height="80" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="345" y="95" fill="#a7f3d0" fontSize="8" fontFamily="monospace">Spans with code.filepath:</text>
          <text x="350" y="108" fill="#6ee7b7" fontSize="8" fontFamily="monospace">• src/api/users.ts</text>
          <text x="350" y="121" fill="#6ee7b7" fontSize="8" fontFamily="monospace">• src/api/orders.ts</text>
          <text x="350" y="134" fill="#6ee7b7" fontSize="8" fontFamily="monospace">• src/db/queries.ts</text>
          <text x="345" y="147" fill="#34d399" fontSize="7" fontStyle="italic">From code.filepath attributes</text>
        </g>

        {/* Arrow down */}
        <line x1="300" y1="175" x2="300" y2="195" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-orange2)" />
        <text x="315" y="188" fill="#f59e0b" fontSize="9" fontWeight="bold">Compare</text>

        {/* Coverage metric */}
        <g>
          <rect x="40" y="200" width="520" height="105" fill="#1e293b" stroke="#10b981" strokeWidth="3" rx="4" />
          <text x="300" y="220" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">3. Coverage Metric</text>

          <rect x="55" y="230" width="490" height="65" fill="#0f172a" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="300" y="250" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Telemetry Coverage = (Actual Files / Expected Files) × 100%</text>

          <text x="65" y="270" fill="#a7f3d0" fontSize="9">Expected files (from library sources globs): 150 files</text>
          <text x="65" y="283" fill="#a7f3d0" fontSize="9">Actual files (from OTEL code.filepath): 120 files emitting telemetry</text>
          <text x="300" y="295" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">Coverage: 80% ✓</text>
        </g>

        <defs>
          <marker id="arrow-orange2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        <strong style={{ color: '#8b5cf6' }}>library.yaml sources</strong> define which files <em>should</em> have telemetry. <strong style={{ color: '#10b981' }}>OTEL code.filepath attributes</strong> show which files <em>actually</em> emit telemetry. The ratio is your coverage.
      </div>
    </div>
  );
};

const Step3CoverageByComponent: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">COVERAGE BY COMPONENT TYPE</text>

        {/* Component type breakdown */}
        <g>
          <rect x="40" y="50" width="520" height="275" fill="#0f172a" stroke="#64748b" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="600">Coverage Breakdown by Component Type</text>

          {/* REST API - Good coverage */}
          <rect x="60" y="85" width="480" height="50" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="3" />
          <text x="70" y="103" fill="#d1fae5" fontSize="9" fontWeight="600">rest-api (src/api/**/*.ts)</text>
          <text x="70" y="118" fill="#6ee7b7" fontSize="8">Expected: 45 files | Actual: 42 files | Coverage: 93% ✓</text>
          <rect x="70" y="123" width="420" height="8" fill="#1e293b" stroke="#059669" strokeWidth="1" rx="2" />
          <rect x="70" y="123" width="390" height="8" fill="#10b981" rx="2" />

          {/* Database - Medium coverage */}
          <rect x="60" y="145" width="480" height="50" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="3" />
          <text x="70" y="163" fill="#fef3c7" fontSize="9" fontWeight="600">database (src/db/**/*.ts)</text>
          <text x="70" y="178" fill="#fde68a" fontSize="8">Expected: 30 files | Actual: 21 files | Coverage: 70% ⚠</text>
          <rect x="70" y="183" width="420" height="8" fill="#1e293b" stroke="#fbbf24" strokeWidth="1" rx="2" />
          <rect x="70" y="183" width="294" height="8" fill="#f59e0b" rx="2" />

          {/* Business logic - Low coverage */}
          <rect x="60" y="205" width="480" height="50" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="3" />
          <text x="70" y="223" fill="#fecaca" fontSize="9" fontWeight="600">business-logic (src/business/**/*.ts)</text>
          <text x="70" y="238" fill="#fca5a5" fontSize="8">Expected: 60 files | Actual: 18 files | Coverage: 30% ✗</text>
          <rect x="70" y="243" width="420" height="8" fill="#1e293b" stroke="#ef4444" strokeWidth="1" rx="2" />
          <rect x="70" y="243" width="126" height="8" fill="#ef4444" rx="2" />

          {/* External services - Perfect coverage */}
          <rect x="60" y="265" width="480" height="50" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="3" />
          <text x="70" y="283" fill="#dbeafe" fontSize="9" fontWeight="600">external-services (src/integrations/**/*.ts)</text>
          <text x="70" y="298" fill="#93c5fd" fontSize="8">Expected: 15 files | Actual: 15 files | Coverage: 100% ✓✓</text>
          <rect x="70" y="303" width="420" height="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <rect x="70" y="303" width="420" height="8" fill="#3b82f6" rx="2" />
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
        Break down coverage by <strong style={{ color: '#8b5cf6' }}>component type</strong> (matching library.yaml nodeComponents) to identify which layers have good observability and which are "dark".
      </div>
    </div>
  );
};

const Step4FindingGaps: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">IDENTIFYING COVERAGE GAPS</text>

        {/* Gap analysis */}
        <g>
          <rect x="40" y="50" width="250" height="235" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">Expected Files (library.yaml)</text>

          <rect x="55" y="80" width="210" height="195" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="65" y="95" fill="#e9d5ff" fontSize="8" fontWeight="600">business-logic sources matched:</text>
          <text x="70" y="110" fill="#c4b5fd" fontSize="7">src/business/orders.ts</text>
          <text x="70" y="122" fill="#c4b5fd" fontSize="7">src/business/inventory.ts</text>
          <text x="70" y="134" fill="#c4b5fd" fontSize="7">src/business/pricing.ts</text>
          <text x="70" y="146" fill="#c4b5fd" fontSize="7">src/business/shipping.ts</text>
          <text x="70" y="158" fill="#c4b5fd" fontSize="7">src/business/notifications.ts</text>
          <text x="70" y="170" fill="#c4b5fd" fontSize="7">src/business/analytics.ts</text>
          <text x="70" y="182" fill="#c4b5fd" fontSize="7">src/business/fraud.ts</text>
          <text x="70" y="194" fill="#c4b5fd" fontSize="7">... 53 more files</text>
          <text x="65" y="210" fill="#a78bfa" fontSize="8" fontWeight="bold">Total: 60 files expected</text>
        </g>

        {/* Arrow */}
        <text x="300" y="165" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="700">−</text>

        {/* Actual files */}
        <g>
          <rect x="310" y="50" width="250" height="235" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Actual Files (OTEL traces)</text>

          <rect x="325" y="80" width="210" height="195" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="335" y="95" fill="#a7f3d0" fontSize="8" fontWeight="600">Files with code.filepath:</text>
          <text x="340" y="110" fill="#6ee7b7" fontSize="7">src/business/orders.ts ✓</text>
          <text x="340" y="122" fill="#6ee7b7" fontSize="7">src/business/inventory.ts ✓</text>
          <text x="340" y="134" fill="#6ee7b7" fontSize="7">src/business/pricing.ts ✓</text>
          <text x="340" y="146" fill="#64748b" fontSize="7">src/business/shipping.ts ✗</text>
          <text x="340" y="158" fill="#64748b" fontSize="7">src/business/notifications.ts ✗</text>
          <text x="340" y="170" fill="#64748b" fontSize="7">src/business/analytics.ts ✗</text>
          <text x="340" y="182" fill="#64748b" fontSize="7">src/business/fraud.ts ✗</text>
          <text x="340" y="194" fill="#64748b" fontSize="7">... 39 more missing</text>
          <text x="335" y="210" fill="#34d399" fontSize="8" fontWeight="bold">Total: 18 files instrumented</text>
        </g>

        {/* Missing files callout */}
        <rect x="40" y="265" width="520" height="20" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="3" />
        <text x="50" y="279" fill="#fecaca" fontSize="9" fontWeight="bold">🚨 Gap: 42 files in business logic have NO telemetry (70% dark!)</text>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        Subtract <strong style={{ color: '#10b981' }}>actual files</strong> from <strong style={{ color: '#8b5cf6' }}>expected files</strong> to get a precise list of which files need instrumentation.
      </div>
    </div>
  );
};

const Step5OverTime: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">TRACKING COVERAGE OVER TIME</text>

        {/* Timeline chart */}
        <g>
          <rect x="40" y="50" width="520" height="215" fill="#0f172a" stroke="#64748b" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="600">📊 Telemetry Coverage Trend</text>

          {/* Y-axis */}
          <line x1="60" y1="90" x2="60" y2="240" stroke="#475569" strokeWidth="2" />
          <text x="55" y="95" textAnchor="end" fill="#94a3b8" fontSize="7">100%</text>
          <text x="55" y="140" textAnchor="end" fill="#94a3b8" fontSize="7">75%</text>
          <text x="55" y="185" textAnchor="end" fill="#94a3b8" fontSize="7">50%</text>
          <text x="55" y="230" textAnchor="end" fill="#94a3b8" fontSize="7">25%</text>

          {/* X-axis */}
          <line x1="60" y1="240" x2="540" y2="240" stroke="#475569" strokeWidth="2" />
          <text x="100" y="255" textAnchor="middle" fill="#94a3b8" fontSize="7">Jan</text>
          <text x="200" y="255" textAnchor="middle" fill="#94a3b8" fontSize="7">Feb</text>
          <text x="300" y="255" textAnchor="middle" fill="#94a3b8" fontSize="7">Mar</text>
          <text x="400" y="255" textAnchor="middle" fill="#94a3b8" fontSize="7">Apr</text>
          <text x="500" y="255" textAnchor="middle" fill="#94a3b8" fontSize="7">May</text>

          {/* Coverage line */}
          <polyline
            points="100,185 200,175 300,160 400,140 500,110"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
          />

          {/* Data points */}
          <circle cx="100" cy="185" r="4" fill="#10b981" />
          <circle cx="200" cy="175" r="4" fill="#10b981" />
          <circle cx="300" cy="160" r="4" fill="#10b981" />
          <circle cx="400" cy="140" r="4" fill="#10b981" />
          <circle cx="500" cy="110" r="4" fill="#10b981" />

          {/* Labels */}
          <text x="100" y="178" textAnchor="middle" fill="#6ee7b7" fontSize="7">52%</text>
          <text x="200" y="168" textAnchor="middle" fill="#6ee7b7" fontSize="7">58%</text>
          <text x="300" y="153" textAnchor="middle" fill="#6ee7b7" fontSize="7">65%</text>
          <text x="400" y="133" textAnchor="middle" fill="#6ee7b7" fontSize="7">73%</text>
          <text x="500" y="103" textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold">82%</text>

          {/* Annotations */}
          <rect x="380" y="90" width="145" height="35" fill="#1e293b" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="390" y="105" fill="#6ee7b7" fontSize="8">Improvement: +30%</text>
          <text x="390" y="117" fill="#34d399" fontSize="7">Added instrumentation</text>
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
        Track coverage over time to see if your observability is <strong style={{ color: '#10b981' }}>improving</strong> or <strong style={{ color: '#ef4444' }}>degrading</strong> as the codebase evolves.
      </div>
    </div>
  );
};

const Step6Benefits: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">WHY TELEMETRY COVERAGE MATTERS</text>

        {/* Traditional vs telemetry coverage */}
        <g>
          <rect x="40" y="50" width="250" height="90" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">Traditional Code Coverage</text>
          <rect x="50" y="78" width="230" height="55" fill="#0f172a" stroke="#475569" strokeWidth="1" rx="2" />
          <text x="60" y="93" fill="#94a3b8" fontSize="8">Measures: Lines executed by tests</text>
          <text x="60" y="106" fill="#94a3b8" fontSize="8">Purpose: Test quality</text>
          <text x="60" y="119" fill="#94a3b8" fontSize="8">Scope: Test environment only</text>
        </g>

        <g>
          <rect x="310" y="50" width="250" height="90" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Telemetry Coverage</text>
          <rect x="320" y="78" width="230" height="55" fill="#022c22" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="330" y="93" fill="#6ee7b7" fontSize="8">Measures: Files emitting OTEL</text>
          <text x="330" y="106" fill="#6ee7b7" fontSize="8">Purpose: Observability quality</text>
          <text x="330" y="119" fill="#6ee7b7" fontSize="8">Scope: Production runtime</text>
        </g>

        {/* Key benefits */}
        <g>
          <rect x="40" y="155" width="250" height="80" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="175" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">Find Blind Spots</text>
          <text x="50" y="193" fill="#93c5fd" fontSize="8">✓ Identify "dark" code paths</text>
          <text x="50" y="206" fill="#93c5fd" fontSize="8">✓ Ensure critical flows monitored</text>
          <text x="50" y="219" fill="#93c5fd" fontSize="8">✓ Prevent production surprises</text>
        </g>

        <g>
          <rect x="310" y="155" width="250" height="80" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="175" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Prioritize Work</text>
          <text x="320" y="193" fill="#6ee7b7" fontSize="8">✓ Focus on high-value areas first</text>
          <text x="320" y="206" fill="#6ee7b7" fontSize="8">✓ Data-driven instrumentation</text>
          <text x="320" y="219" fill="#6ee7b7" fontSize="8">✓ ROI on observability effort</text>
        </g>

        <g>
          <rect x="40" y="250" width="250" height="75" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="270" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">Prevent Regression</text>
          <text x="50" y="288" fill="#c4b5fd" fontSize="8">✓ New code must be instrumented</text>
          <text x="50" y="301" fill="#c4b5fd" fontSize="8">✓ Coverage gates in CI/CD</text>
          <text x="50" y="314" fill="#c4b5fd" fontSize="8">✓ Maintain observability quality</text>
        </g>

        <g>
          <rect x="310" y="250" width="250" height="75" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="435" y="270" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">Compliance & Audit</text>
          <text x="320" y="288" fill="#fde68a" fontSize="8">✓ Prove critical paths monitored</text>
          <text x="320" y="301" fill="#fde68a" fontSize="8">✓ Demonstrate observability</text>
          <text x="320" y="314" fill="#fde68a" fontSize="8">✓ Meet audit requirements</text>
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
        Telemetry coverage ensures your <strong style={{ color: '#10b981' }}>production observability</strong> keeps pace with your codebase growth, preventing blind spots where failures can hide.
      </div>
    </div>
  );
};

const Step7Implementation: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">IMPLEMENTATION: CALCULATING COVERAGE</text>

        {/* Pseudocode */}
        <g>
          <rect x="40" y="50" width="520" height="235" fill="#0f172a" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">Coverage Calculation Algorithm</text>

          <rect x="55" y="80" width="490" height="195" fill="#1e293b" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="65" y="95" fill="#6ee7b7" fontSize="8" fontFamily="monospace">function calculateTelemetryCoverage(library, traces) {'{'}</text>

          <text x="70" y="110" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  // 1. Get expected files from library.yaml sources</text>
          <text x="70" y="123" fill="#cbd5e1" fontSize="8" fontFamily="monospace">  const expectedFiles = new Set();</text>
          <text x="70" y="136" fill="#cbd5e1" fontSize="8" fontFamily="monospace">  for (const component of library.nodeComponents) {'{'}</text>
          <text x="75" y="149" fill="#cbd5e1" fontSize="8" fontFamily="monospace">    const files = glob(component.sources);</text>
          <text x="75" y="162" fill="#cbd5e1" fontSize="8" fontFamily="monospace">    expectedFiles.add(...files);</text>
          <text x="70" y="175" fill="#cbd5e1" fontSize="8" fontFamily="monospace">  {'}'}</text>

          <text x="70" y="190" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  // 2. Get actual files from OTEL traces</text>
          <text x="70" y="203" fill="#cbd5e1" fontSize="8" fontFamily="monospace">  const actualFiles = new Set();</text>
          <text x="70" y="216" fill="#cbd5e1" fontSize="8" fontFamily="monospace">  for (const trace of traces) {'{'}</text>
          <text x="75" y="229" fill="#cbd5e1" fontSize="8" fontFamily="monospace">    for (const span of trace.spans) {'{'}</text>
          <text x="80" y="242" fill="#cbd5e1" fontSize="8" fontFamily="monospace">      const filepath = span.attributes['code.filepath'];</text>
          <text x="80" y="255" fill="#cbd5e1" fontSize="8" fontFamily="monospace">      if (filepath) actualFiles.add(filepath);</text>
          <text x="70" y="268" fill="#cbd5e1" fontSize="8" fontFamily="monospace">  {'}'}</text>
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
        Implementation is straightforward: expand library.yaml sources globs to get expected files, extract code.filepath from OTEL spans to get actual files, then calculate the ratio.
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'problem', title: 'The Observability Gap', component: Step1TheProblem },
  { id: 'howitworks', title: 'How It Works', component: Step2HowItWorks },
  { id: 'bycomponent', title: 'Coverage by Component', component: Step3CoverageByComponent },
  { id: 'gaps', title: 'Finding Coverage Gaps', component: Step4FindingGaps },
  { id: 'overtime', title: 'Tracking Over Time', component: Step5OverTime },
  { id: 'benefits', title: 'Why It Matters', component: Step6Benefits },
  { id: 'implementation', title: 'Implementation', component: Step7Implementation },
];

export const TelemetryCoverageExplainerPanel: React.FC<TelemetryCoverageExplainerPanelProps> = ({ className }) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['problem']));

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
          Measuring Telemetry Coverage
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          Using library.yaml sources and OTEL traces to measure which files have observability
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
          Telemetry coverage = (Files with OTEL / Files expected from library.yaml) × 100%. This metric reveals
          which parts of your codebase are "dark" to observability and helps prevent production blind spots.
        </div>
      </div>
    </div>
  );
};

export default TelemetryCoverageExplainerPanel;
