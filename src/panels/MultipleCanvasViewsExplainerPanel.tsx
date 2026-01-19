import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface MultipleCanvasViewsExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1OneTraceManyViews: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">ONE TRACE, MULTIPLE CANVAS VIEWS</text>

        {/* Single trace in center */}
        <g>
          <rect x="200" y="50" width="200" height="60" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" rx="6" />
          <text x="300" y="75" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="700">📊 Production Trace</text>
          <text x="300" y="92" textAnchor="middle" fill="#fbbf24" fontSize="9">trace_id: checkout-xyz123</text>
        </g>

        {/* Arrows to different canvases */}
        <line x1="200" y1="80" x2="120" y2="135" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple4)" />
        <line x1="250" y1="115" x2="250" y2="135" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple4)" />
        <line x1="350" y1="115" x2="350" y2="135" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple4)" />
        <line x1="400" y1="80" x2="480" y2="135" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple4)" />

        {/* Different canvas views */}
        <g>
          <rect x="40" y="140" width="120" height="125" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="100" y="160" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="600">🏗️ Architecture</text>
          <text x="50" y="175" fill="#93c5fd" fontSize="7">architecture.otel.canvas</text>
          <rect x="50" y="183" width="100" height="72" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="2" />
          <text x="60" y="197" fill="#bfdbfe" fontSize="7">Shows:</text>
          <text x="65" y="209" fill="#93c5fd" fontSize="6">• High-level layers</text>
          <text x="65" y="219" fill="#93c5fd" fontSize="6">• Component interactions</text>
          <text x="65" y="229" fill="#93c5fd" fontSize="6">• System boundaries</text>
          <text x="60" y="245" fill="#60a5fa" fontSize="6" fontStyle="italic">Stakeholder view</text>
        </g>

        <g>
          <rect x="190" y="140" width="120" height="125" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="250" y="160" textAnchor="middle" fill="#d1fae5" fontSize="9" fontWeight="600">⚡ Performance</text>
          <text x="200" y="175" fill="#6ee7b7" fontSize="7">performance.otel.canvas</text>
          <rect x="200" y="183" width="100" height="72" fill="#022c22" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="210" y="197" fill="#a7f3d0" fontSize="7">Shows:</text>
          <text x="215" y="209" fill="#6ee7b7" fontSize="6">• Critical path spans</text>
          <text x="215" y="219" fill="#6ee7b7" fontSize="6">• Latency bottlenecks</text>
          <text x="215" y="229" fill="#6ee7b7" fontSize="6">• Resource usage</text>
          <text x="210" y="245" fill="#34d399" fontSize="6" fontStyle="italic">SRE view</text>
        </g>

        <g>
          <rect x="340" y="140" width="120" height="125" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="400" y="160" textAnchor="middle" fill="#ddd6fe" fontSize="9" fontWeight="600">🔒 Security</text>
          <text x="350" y="175" fill="#c4b5fd" fontSize="7">security.otel.canvas</text>
          <rect x="350" y="183" width="100" height="72" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" rx="2" />
          <text x="360" y="197" fill="#e9d5ff" fontSize="7">Shows:</text>
          <text x="365" y="209" fill="#c4b5fd" fontSize="6">• Auth/authz checks</text>
          <text x="365" y="219" fill="#c4b5fd" fontSize="6">• Data access control</text>
          <text x="365" y="229" fill="#c4b5fd" fontSize="6">• Audit trail events</text>
          <text x="360" y="245" fill="#a78bfa" fontSize="6" fontStyle="italic">Security team view</text>
        </g>

        <g>
          <rect x="490" y="140" width="70" height="125" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="525" y="160" textAnchor="middle" fill="#fef3c7" fontSize="9" fontWeight="600">💰 Billing</text>
          <text x="495" y="175" fill="#fde68a" fontSize="7">billing.otel</text>
          <text x="495" y="184" fill="#fde68a" fontSize="7">.canvas</text>
          <rect x="495" y="190" width="60" height="65" fill="#422006" stroke="#fbbf24" strokeWidth="1" rx="2" />
          <text x="502" y="203" fill="#fef3c7" fontSize="7">Shows:</text>
          <text x="505" y="215" fill="#fde68a" fontSize="6">• Billable</text>
          <text x="505" y="223" fill="#fde68a" fontSize="6">events</text>
          <text x="505" y="231" fill="#fde68a" fontSize="6">• Usage</text>
          <text x="505" y="239" fill="#fde68a" fontSize="6">metrics</text>
          <text x="502" y="251" fill="#fbbf24" fontSize="6" fontStyle="italic">Finance</text>
        </g>

        <defs>
          <marker id="arrow-purple4" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        The <strong style={{ color: '#8b5cf6' }}>same production trace</strong> can be validated by multiple canvases, each providing a different perspective—like looking at the same system through different lenses.
      </div>
    </div>
  );
};

const Step2DatabaseAnalogy: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">ANALOGY: CANVASES AS DATABASE VIEWS</text>

        {/* Underlying data */}
        <g>
          <rect x="150" y="50" width="300" height="80" fill="#0f172a" stroke="#64748b" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">🗄️ Underlying Data (OTEL Trace)</text>
          <text x="160" y="90" fill="#94a3b8" fontSize="7" fontFamily="monospace">span_id | parent_id | service | operation | duration | attributes</text>
          <text x="160" y="102" fill="#94a3b8" fontSize="7" fontFamily="monospace">001 | null | api | validateUser | 100ms | {'{'}user_id: 123{'}'}</text>
          <text x="160" y="114" fill="#94a3b8" fontSize="7" fontFamily="monospace">002 | 001 | business | checkInventory | 200ms | {'{'}product_id: 456{'}'}</text>
        </g>

        {/* Arrow down */}
        <line x1="300" y1="135" x2="300" y2="155" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple5)" />
        <text x="315" y="148" fill="#8b5cf6" fontSize="8">Create views</text>

        {/* Different views */}
        <g>
          <rect x="40" y="160" width="160" height="105" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="120" y="180" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="600">View 1: Performance</text>
          <rect x="50" y="188" width="140" height="67" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="2" />
          <text x="60" y="203" fill="#93c5fd" fontSize="7" fontFamily="monospace">SELECT operation,</text>
          <text x="60" y="215" fill="#93c5fd" fontSize="7" fontFamily="monospace">  duration</text>
          <text x="60" y="227" fill="#93c5fd" fontSize="7" fontFamily="monospace">WHERE duration {'>'} 100ms</text>
          <text x="60" y="239" fill="#60a5fa" fontSize="7" fontFamily="monospace">ORDER BY duration DESC</text>
        </g>

        <g>
          <rect x="220" y="160" width="160" height="105" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="180" textAnchor="middle" fill="#d1fae5" fontSize="9" fontWeight="600">View 2: By Service</text>
          <rect x="230" y="188" width="140" height="67" fill="#022c22" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="240" y="203" fill="#6ee7b7" fontSize="7" fontFamily="monospace">SELECT service,</text>
          <text x="240" y="215" fill="#6ee7b7" fontSize="7" fontFamily="monospace">  COUNT(*) as calls</text>
          <text x="240" y="227" fill="#6ee7b7" fontSize="7" fontFamily="monospace">GROUP BY service</text>
          <text x="240" y="239" fill="#34d399" fontSize="7" fontFamily="monospace">ORDER BY calls DESC</text>
        </g>

        <g>
          <rect x="400" y="160" width="160" height="105" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="480" y="180" textAnchor="middle" fill="#ddd6fe" fontSize="9" fontWeight="600">View 3: User Activity</text>
          <rect x="410" y="188" width="140" height="67" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" rx="2" />
          <text x="420" y="203" fill="#c4b5fd" fontSize="7" fontFamily="monospace">SELECT </text>
          <text x="420" y="215" fill="#c4b5fd" fontSize="7" fontFamily="monospace">  attributes-{'>'}user_id,</text>
          <text x="420" y="227" fill="#c4b5fd" fontSize="7" fontFamily="monospace">  operation</text>
          <text x="420" y="239" fill="#a78bfa" fontSize="7" fontFamily="monospace">WHERE user_id IS NOT NULL</text>
        </g>

        <defs>
          <marker id="arrow-purple5" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        Like <strong style={{ color: '#8b5cf6' }}>database views</strong>, multiple canvases can select and organize different subsets of spans from the same trace—same data, different perspectives.
      </div>
    </div>
  );
};

const Step3CommonPatterns: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 380" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">COMMON PATTERNS FOR MULTIPLE VIEWS</text>

        {/* Pattern 1: Stakeholder views */}
        <g>
          <rect x="40" y="50" width="250" height="75" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">1. Different Stakeholders</text>
          <rect x="50" y="78" width="230" height="40" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="2" />
          <text x="60" y="93" fill="#93c5fd" fontSize="8">• developer-view.otel.canvas - Technical details</text>
          <text x="60" y="105" fill="#93c5fd" fontSize="8">• product-view.otel.canvas - User features</text>
          <text x="60" y="117" fill="#93c5fd" fontSize="8">• operations-view.otel.canvas - Infrastructure</text>
        </g>

        {/* Pattern 2: Different concerns */}
        <g>
          <rect x="310" y="50" width="250" height="75" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">2. Validation Concerns</text>
          <rect x="320" y="78" width="230" height="40" fill="#022c22" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="330" y="93" fill="#6ee7b7" fontSize="8">• security-audit.otel.canvas - Auth/authz</text>
          <text x="330" y="105" fill="#6ee7b7" fontSize="8">• compliance.otel.canvas - Regulatory events</text>
          <text x="330" y="117" fill="#6ee7b7" fontSize="8">• business-metrics.otel.canvas - KPIs</text>
        </g>

        {/* Pattern 3: Overlapping scopes */}
        <g>
          <rect x="40" y="140" width="250" height="75" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="160" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">3. Overlapping Scopes</text>
          <rect x="50" y="168" width="230" height="40" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" rx="2" />
          <text x="60" y="183" fill="#c4b5fd" fontSize="8">• checkout-complete.otel.canvas - Full flow</text>
          <text x="60" y="195" fill="#c4b5fd" fontSize="8">• payment-only.otel.canvas - Payment subset</text>
          <text x="60" y="207" fill="#c4b5fd" fontSize="8">Both match same trace, different spans</text>
        </g>

        {/* Pattern 4: Different granularities */}
        <g>
          <rect x="310" y="140" width="250" height="75" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="435" y="160" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">4. Different Granularities</text>
          <rect x="320" y="168" width="230" height="40" fill="#422006" stroke="#fbbf24" strokeWidth="1" rx="2" />
          <text x="330" y="183" fill="#fde68a" fontSize="8">• overview.otel.canvas - High-level only</text>
          <text x="330" y="195" fill="#fde68a" fontSize="8">• detailed.otel.canvas - All spans</text>
          <text x="330" y="207" fill="#fde68a" fontSize="8">• critical-path.otel.canvas - Longest path</text>
        </g>

        {/* Pattern 5: Team ownership */}
        <g>
          <rect x="40" y="230" width="250" height="75" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="2" rx="4" />
          <text x="165" y="250" textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="600">5. Team Ownership</text>
          <rect x="50" y="258" width="230" height="40" fill="#082f49" stroke="#38bdf8" strokeWidth="1" rx="2" />
          <text x="60" y="273" fill="#7dd3fc" fontSize="8">• frontend-team.otel.canvas - UI spans</text>
          <text x="60" y="285" fill="#7dd3fc" fontSize="8">• backend-team.otel.canvas - API spans</text>
          <text x="60" y="297" fill="#7dd3fc" fontSize="8">• data-team.otel.canvas - DB/cache spans</text>
        </g>

        {/* Pattern 6: Environment-specific */}
        <g>
          <rect x="310" y="230" width="250" height="75" fill="#831843" stroke="#ec4899" strokeWidth="2" rx="4" />
          <text x="435" y="250" textAnchor="middle" fill="#fce7f3" fontSize="10" fontWeight="600">6. Environment-Specific</text>
          <rect x="320" y="258" width="230" height="40" fill="#500724" stroke="#f472b6" strokeWidth="1" rx="2" />
          <text x="330" y="273" fill="#fbcfe8" fontSize="8">• prod-monitoring.otel.canvas - Prod health</text>
          <text x="330" y="285" fill="#fbcfe8" fontSize="8">• test-validation.otel.canvas - Test assertions</text>
          <text x="330" y="297" fill="#fbcfe8" fontSize="8">Same trace structure, different purpose</text>
        </g>

        {/* Key insight */}
        <g>
          <rect x="40" y="320" width="520" height="45" fill="#1e1b4b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="340" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="600">Mix and match these patterns as needed!</text>
          <text x="50" y="357" fill="#ddd6fe" fontSize="8">One trace can be validated by security.otel.canvas (concern) + frontend-team.otel.canvas</text>
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
        Multiple canvases let you organize validation by <strong style={{ color: '#3b82f6' }}>stakeholder</strong>, <strong style={{ color: '#10b981' }}>concern</strong>, <strong style={{ color: '#8b5cf6' }}>scope</strong>, <strong style={{ color: '#f59e0b' }}>granularity</strong>, <strong style={{ color: '#0ea5e9' }}>team</strong>, or <strong style={{ color: '#ec4899' }}>environment</strong>.
      </div>
    </div>
  );
};

const Step4HowMatching: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">HOW MULTIPLE CANVASES MATCH THE SAME TRACE</text>

        {/* The trace */}
        <g>
          <rect x="40" y="50" width="180" height="255" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="130" y="70" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="600">Production Trace</text>
          <text x="50" y="85" fill="#fbbf24" fontSize="8">trace_id: xyz123</text>

          <rect x="50" y="95" width="160" height="200" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="3" />
          <text x="60" y="110" fill="#cbd5e1" fontSize="8" fontWeight="600">All spans in trace:</text>

          <rect x="60" y="118" width="140" height="20" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="70" y="131" fill="#dbeafe" fontSize="7">validateUser (API)</text>

          <rect x="60" y="143" width="140" height="20" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="70" y="156" fill="#d1fae5" fontSize="7">checkInventory (Business)</text>

          <rect x="60" y="168" width="140" height="20" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="1" rx="2" />
          <text x="70" y="181" fill="#ddd6fe" fontSize="7">queryDB (Data)</text>

          <rect x="60" y="193" width="140" height="20" fill="#713f12" stroke="#f59e0b" strokeWidth="1" rx="2" />
          <text x="70" y="206" fill="#fef3c7" fontSize="7">processPayment (Business)</text>

          <rect x="60" y="218" width="140" height="20" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="70" y="231" fill="#dbeafe" fontSize="7">sendConfirmation (API)</text>

          <rect x="60" y="243" width="140" height="20" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="70" y="256" fill="#d1fae5" fontSize="7">updateMetrics (Business)</text>

          <rect x="60" y="268" width="140" height="20" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="1" rx="2" />
          <text x="70" y="281" fill="#e0f2fe" fontSize="7">auditLog (Security)</text>
        </g>

        {/* Canvas 1: API only */}
        <g>
          <rect x="240" y="50" width="160" height="110" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="320" y="70" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="600">api-layer.otel.canvas</text>

          <rect x="250" y="78" width="140" height="72" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="2" />
          <text x="260" y="93" fill="#bfdbfe" fontSize="8" fontWeight="600">Matches these spans:</text>
          <rect x="265" y="100" width="125" height="16" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="1" />
          <text x="272" y="111" fill="#dbeafe" fontSize="6">validateUser ✓</text>
          <rect x="265" y="120" width="125" height="16" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="1" />
          <text x="272" y="131" fill="#dbeafe" fontSize="6">sendConfirmation ✓</text>
        </g>

        {/* Canvas 2: Business logic */}
        <g>
          <rect x="420" y="50" width="140" height="130" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="490" y="70" textAnchor="middle" fill="#d1fae5" fontSize="9" fontWeight="600">business.otel</text>
          <text x="490" y="82" textAnchor="middle" fill="#d1fae5" fontSize="9" fontWeight="600">.canvas</text>

          <rect x="428" y="90" width="124" height="82" fill="#022c22" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="435" y="103" fill="#a7f3d0" fontSize="7" fontWeight="600">Matches:</text>
          <rect x="438" y="108" width="108" height="13" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="1" />
          <text x="443" y="117" fill="#d1fae5" fontSize="6">checkInventory ✓</text>
          <rect x="438" y="124" width="108" height="13" fill="#713f12" stroke="#f59e0b" strokeWidth="1" rx="1" />
          <text x="443" y="133" fill="#fef3c7" fontSize="6">processPayment ✓</text>
          <rect x="438" y="140" width="108" height="13" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="1" />
          <text x="443" y="149" fill="#d1fae5" fontSize="6">updateMetrics ✓</text>
        </g>

        {/* Canvas 3: Security */}
        <g>
          <rect x="240" y="175" width="160" height="80" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="320" y="195" textAnchor="middle" fill="#ddd6fe" fontSize="9" fontWeight="600">security.otel.canvas</text>

          <rect x="250" y="203" width="140" height="42" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" rx="2" />
          <text x="260" y="218" fill="#e9d5ff" fontSize="8" fontWeight="600">Matches these spans:</text>
          <rect x="265" y="225" width="125" height="13" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="1" />
          <text x="272" y="234" fill="#dbeafe" fontSize="6">validateUser ✓</text>
        </g>

        {/* Canvas 4: Critical path */}
        <g>
          <rect x="420" y="195" width="140" height="110" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="490" y="215" textAnchor="middle" fill="#fef3c7" fontSize="9" fontWeight="600">critical-path</text>
          <text x="490" y="227" textAnchor="middle" fill="#fef3c7" fontSize="9" fontWeight="600">.otel.canvas</text>

          <rect x="428" y="235" width="124" height="62" fill="#422006" stroke="#fbbf24" strokeWidth="1" rx="2" />
          <text x="435" y="248" fill="#fde68a" fontSize="7" fontWeight="600">Longest path:</text>
          <rect x="438" y="253" width="108" height="13" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="1" />
          <text x="443" y="262" fill="#d1fae5" fontSize="6">checkInventory ✓</text>
          <rect x="438" y="269" width="108" height="13" fill="#713f12" stroke="#f59e0b" strokeWidth="1" rx="1" />
          <text x="443" y="278" fill="#fef3c7" fontSize="6">processPayment ✓</text>
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
        Each canvas defines <strong style={{ color: '#10b981' }}>which spans it cares about</strong> via node matching rules. The same trace spans can match multiple canvases based on different criteria.
      </div>
    </div>
  );
};

const Step5ProductionExample: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">PRODUCTION EXAMPLE: SAME TRACE, DIFFERENT ALERTS</text>

        {/* Failed trace */}
        <g>
          <rect x="200" y="50" width="200" height="60" fill="#7f1d1d" stroke="#ef4444" strokeWidth="3" rx="6" />
          <text x="300" y="75" textAnchor="middle" fill="#fecaca" fontSize="11" fontWeight="700">🚨 Failed Production Trace</text>
          <text x="300" y="92" textAnchor="middle" fill="#fca5a5" fontSize="9">trace_id: prod-failure-123</text>
        </g>

        {/* Arrow down */}
        <line x1="300" y1="115" x2="300" y2="135" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow-gray3)" />
        <text x="315" y="128" fill="#94a3b8" fontSize="8">Validated by</text>

        {/* Different teams see different issues */}
        <g>
          {/* SRE alert */}
          <rect x="40" y="140" width="160" height="145" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="120" y="160" textAnchor="middle" fill="#fecaca" fontSize="10" fontWeight="600">🚨 SRE Team Alert</text>
          <text x="50" y="175" fill="#fca5a5" fontSize="8">performance.otel.canvas</text>

          <rect x="50" y="183" width="140" height="92" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="60" y="198" fill="#fde68a" fontSize="8" fontWeight="600">Validation Failed:</text>
          <text x="65" y="213" fill="#fca5a5" fontSize="7">✗ checkInventory: 8.5s</text>
          <text x="70" y="225" fill="#cbd5e1" fontSize="7">(expected: {'<'}200ms)</text>
          <text x="65" y="240" fill="#fca5a5" fontSize="7">✗ P95 latency exceeded</text>
          <text x="60" y="258" fill="#ef4444" fontSize="7" fontWeight="bold">Action: Scale inventory DB</text>

          {/* Security alert */}
          <rect x="220" y="140" width="160" height="145" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="160" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">⚠️ Security Alert</text>
          <text x="230" y="175" fill="#fde68a" fontSize="8">security.otel.canvas</text>

          <rect x="230" y="183" width="140" height="92" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="240" y="198" fill="#fde68a" fontSize="8" fontWeight="600">Validation Warning:</text>
          <text x="245" y="213" fill="#fbbf24" fontSize="7">⚠ validateUser: success</text>
          <text x="245" y="225" fill="#fbbf24" fontSize="7">⚠ BUT auditLog: missing!</text>
          <text x="240" y="240" fill="#cbd5e1" fontSize="7">(Auth succeeded but no audit)</text>
          <text x="240" y="258" fill="#f59e0b" fontSize="7" fontWeight="bold">Action: Check audit service</text>

          {/* Product alert */}
          <rect x="400" y="140" width="160" height="145" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="480" y="160" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">✅ Product Team</text>
          <text x="410" y="175" fill="#6ee7b7" fontSize="8">user-journey.otel.canvas</text>

          <rect x="410" y="183" width="140" height="92" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="420" y="198" fill="#a7f3d0" fontSize="8" fontWeight="600">Validation Passed:</text>
          <text x="425" y="213" fill="#6ee7b7" fontSize="7">✓ User authenticated</text>
          <text x="425" y="225" fill="#6ee7b7" fontSize="7">✓ Inventory checked</text>
          <text x="425" y="237" fill="#6ee7b7" fontSize="7">✓ Error shown to user</text>
          <text x="420" y="258" fill="#10b981" fontSize="7" fontWeight="bold">No action: UX working</text>
        </g>

        <defs>
          <marker id="arrow-gray3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        The <strong style={{ color: '#ef4444' }}>same failed trace</strong> generates <strong style={{ color: '#8b5cf6' }}>different alerts</strong> for different teams: SRE sees performance degradation, Security sees missing audit log, Product sees correct user experience.
      </div>
    </div>
  );
};

const Step6Benefits: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">WHY MULTIPLE CANVAS VIEWS MATTER</text>

        {/* Benefits */}
        <g>
          <rect x="40" y="50" width="250" height="80" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">Separation of Concerns</text>
          <text x="50" y="88" fill="#93c5fd" fontSize="8">✓ Each team validates what they care about</text>
          <text x="50" y="101" fill="#93c5fd" fontSize="8">✓ No single "god canvas"</text>
          <text x="50" y="114" fill="#93c5fd" fontSize="8">✓ Independent evolution</text>
        </g>

        <g>
          <rect x="310" y="50" width="250" height="80" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Targeted Alerts</text>
          <text x="320" y="88" fill="#6ee7b7" fontSize="8">✓ SRE gets performance alerts</text>
          <text x="320" y="101" fill="#6ee7b7" fontSize="8">✓ Security gets compliance alerts</text>
          <text x="320" y="114" fill="#6ee7b7" fontSize="8">✓ No alert fatigue</text>
        </g>

        <g>
          <rect x="40" y="145" width="250" height="80" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="165" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">Reuse Same Data</text>
          <text x="50" y="183" fill="#c4b5fd" fontSize="8">✓ One trace, many validations</text>
          <text x="50" y="196" fill="#c4b5fd" fontSize="8">✓ No duplicate instrumentation</text>
          <text x="50" y="209" fill="#c4b5fd" fontSize="8">✓ Efficient data collection</text>
        </g>

        <g>
          <rect x="310" y="145" width="250" height="80" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="435" y="165" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">Different Perspectives</text>
          <text x="320" y="183" fill="#fde68a" fontSize="8">✓ Same issue, different impacts</text>
          <text x="320" y="196" fill="#fde68a" fontSize="8">✓ Holistic understanding</text>
          <text x="320" y="209" fill="#fde68a" fontSize="8">✓ Cross-team coordination</text>
        </g>

        {/* The power */}
        <g>
          <rect x="40" y="240" width="520" height="85" fill="#1e1b4b" stroke="#10b981" strokeWidth="3" rx="4" />
          <text x="300" y="260" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="700">THE POWER: SAME DATA, MULTIPLE VALIDATIONS</text>

          <text x="50" y="280" fill="#ddd6fe" fontSize="9">Each team creates canvases that validate what matters to them, without interfering</text>
          <text x="50" y="295" fill="#ddd6fe" fontSize="9">with other teams. Production traces automatically validate against ALL relevant canvases,</text>
          <text x="50" y="310" fill="#ddd6fe" fontSize="9">providing comprehensive coverage without coordination overhead or data duplication.</text>
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
        Multiple canvases enable <strong style={{ color: '#3b82f6' }}>team autonomy</strong>, <strong style={{ color: '#10b981' }}>targeted alerts</strong>, and <strong style={{ color: '#8b5cf6' }}>data reuse</strong>—the same production trace validates performance, security, compliance, and business metrics simultaneously.
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'onetrace', title: 'One Trace, Many Views', component: Step1OneTraceManyViews },
  { id: 'analogy', title: 'Database Views Analogy', component: Step2DatabaseAnalogy },
  { id: 'patterns', title: 'Common Patterns', component: Step3CommonPatterns },
  { id: 'matching', title: 'How Matching Works', component: Step4HowMatching },
  { id: 'production', title: 'Production Example', component: Step5ProductionExample },
  { id: 'benefits', title: 'Why It Matters', component: Step6Benefits },
];

export const MultipleCanvasViewsExplainerPanel: React.FC<MultipleCanvasViewsExplainerPanelProps> = ({ className }) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['onetrace']));

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
          Multiple Canvas Views
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          How the same trace can be validated by multiple canvases for different perspectives
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
          Like database views, multiple canvases can select and organize different subsets of spans from the same trace.
          This enables team autonomy (each team owns their validation), targeted alerts (right information to right people),
          and data reuse (one trace, many validations).
        </div>
      </div>
    </div>
  );
};

export default MultipleCanvasViewsExplainerPanel;
