import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface RuntimeValidationExplainerPanelProps {
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
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">THE TRADITIONAL TESTING PROBLEM</text>

        {/* Left side - What we think happens */}
        <g>
          <rect x="40" y="45" width="240" height="210" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="160" y="68" textAnchor="middle" fill="#dbeafe" fontSize="12" fontWeight="600">WHAT WE THINK HAPPENS</text>

          {/* Architecture diagram */}
          <rect x="60" y="80" width="80" height="40" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" rx="3" />
          <text x="100" y="103" textAnchor="middle" fill="#fff" fontSize="9">API</text>

          <line x1="140" y1="100" x2="165" y2="100" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow-gray)" />

          <rect x="170" y="80" width="80" height="40" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" rx="3" />
          <text x="210" y="103" textAnchor="middle" fill="#fff" fontSize="9">Service</text>

          <line x1="210" y1="125" x2="210" y2="145" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow-gray)" />

          <rect x="170" y="150" width="80" height="40" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" rx="3" />
          <text x="210" y="173" textAnchor="middle" fill="#fff" fontSize="9">Database</text>

          {/* Test result */}
          <rect x="60" y="210" width="200" height="35" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" rx="3" />
          <text x="160" y="230" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">✓ Test Passed</text>
        </g>

        {/* Question mark */}
        <g>
          <text x="300" y="150" textAnchor="middle" fill="#f59e0b" fontSize="40" fontWeight="700">?</text>
          <text x="300" y="175" textAnchor="middle" fill="#fbbf24" fontSize="10" fontStyle="italic">Does it match?</text>
        </g>

        {/* Right side - What actually happened */}
        <g>
          <rect x="320" y="45" width="240" height="210" fill="#450a0a" stroke="#dc2626" strokeWidth="2" rx="4" />
          <text x="440" y="68" textAnchor="middle" fill="#fecaca" fontSize="12" fontWeight="600">WHAT ACTUALLY HAPPENED</text>

          {/* Mystery box */}
          <rect x="360" y="85" width="160" height="100" fill="#1e293b" stroke="#64748b" strokeWidth="2" strokeDasharray="4,4" rx="4" />
          <text x="440" y="110" textAnchor="middle" fill="#94a3b8" fontSize="10">???</text>
          <text x="440" y="130" textAnchor="middle" fill="#64748b" fontSize="9">Unknown execution</text>
          <text x="440" y="145" textAnchor="middle" fill="#64748b" fontSize="9">path at runtime</text>
          <text x="440" y="160" textAnchor="middle" fill="#64748b" fontSize="9">No visibility</text>
          <text x="440" y="175" textAnchor="middle" fill="#64748b" fontSize="9">No trace</text>

          {/* Problems list */}
          <rect x="330" y="195" width="220" height="55" fill="#7f1d1d" stroke="#991b1b" strokeWidth="1" rx="3" />
          <text x="340" y="210" fill="#fca5a5" fontSize="8">• Cache hit instead of DB query?</text>
          <text x="340" y="222" fill="#fca5a5" fontSize="8">• Service called twice?</text>
          <text x="340" y="234" fill="#fca5a5" fontSize="8">• Wrong code path executed?</text>
          <text x="340" y="246" fill="#fca5a5" fontSize="8">• Side effects we don't know about?</text>
        </g>

        <defs>
          <marker id="arrow-gray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
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
        <strong style={{ color: '#ef4444' }}>The Problem:</strong> Traditional tests tell you if code passed or failed, but not <em>what actually happened at runtime</em>. You're validating expectations without observing reality.
      </div>
    </div>
  );
};

const Step2WhatIsRuntimeValidation: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 200" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">RUNTIME VALIDATION APPROACH</text>

        {/* Three components */}
        <g>
          {/* Expected Behavior */}
          <rect x="40" y="50" width="160" height="130" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="120" y="72" textAnchor="middle" fill="#dbeafe" fontSize="11" fontWeight="600">EXPECTED</text>
          <text x="120" y="87" textAnchor="middle" fill="#93c5fd" fontSize="10">(Canvas Definition)</text>

          <rect x="55" y="100" width="130" height="70" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="65" y="115" fill="#bfdbfe" fontSize="8" fontFamily="monospace">• API → Service</text>
          <text x="65" y="128" fill="#bfdbfe" fontSize="8" fontFamily="monospace">• Service → DB</text>
          <text x="65" y="141" fill="#bfdbfe" fontSize="8" fontFamily="monospace">• DB returns data</text>
          <text x="65" y="154" fill="#bfdbfe" fontSize="8" fontFamily="monospace">• Service responds</text>

          {/* Plus sign */}
          <text x="220" y="120" textAnchor="middle" fill="#10b981" fontSize="24" fontWeight="700">+</text>

          {/* Actual Behavior */}
          <rect x="240" y="50" width="160" height="130" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="320" y="72" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">ACTUAL</text>
          <text x="320" y="87" textAnchor="middle" fill="#6ee7b7" fontSize="10">(OTEL Trace)</text>

          <rect x="255" y="100" width="130" height="70" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="265" y="115" fill="#a7f3d0" fontSize="8" fontFamily="monospace">✓ API called</text>
          <text x="265" y="128" fill="#a7f3d0" fontSize="8" fontFamily="monospace">✓ Service executed</text>
          <text x="265" y="141" fill="#a7f3d0" fontSize="8" fontFamily="monospace">✓ DB query ran</text>
          <text x="265" y="154" fill="#a7f3d0" fontSize="8" fontFamily="monospace">✓ Response sent</text>

          {/* Equals sign */}
          <text x="420" y="120" textAnchor="middle" fill="#8b5cf6" fontSize="24" fontWeight="700">=</text>

          {/* Validation Result */}
          <rect x="440" y="50" width="140" height="130" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="510" y="72" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">VALIDATED</text>

          <rect x="455" y="90" width="110" height="80" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="510" y="110" textAnchor="middle" fill="#fff" fontSize="20">✓</text>
          <text x="510" y="130" textAnchor="middle" fill="#e9d5ff" fontSize="9">Execution</text>
          <text x="510" y="143" textAnchor="middle" fill="#e9d5ff" fontSize="9">matches</text>
          <text x="510" y="156" textAnchor="middle" fill="#e9d5ff" fontSize="9">architecture!</text>
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
        <strong style={{ color: '#8b5cf6' }}>Runtime Validation</strong> compares your expected architecture (canvas) against actual execution traces (OTEL) to verify the system behaves as designed.
      </div>
    </div>
  );
};

const Step3ObservabilityGap: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">THE OBSERVABILITY GAP</text>

        {/* Without Observability */}
        <g>
          <rect x="40" y="45" width="250" height="115" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="165" y="65" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">WITHOUT OTEL TRACING</text>

          <rect x="55" y="75" width="220" height="75" fill="#450a0a" stroke="#991b1b" strokeWidth="1.5" rx="3" />
          <text x="65" y="92" fill="#fca5a5" fontSize="9" fontWeight="600">❌ Problems:</text>
          <text x="70" y="107" fill="#fecaca" fontSize="8">• Tests pass but wrong code runs</text>
          <text x="70" y="120" fill="#fecaca" fontSize="8">• Architecture docs out of sync</text>
          <text x="70" y="133" fill="#fecaca" fontSize="8">• Debug by reading logs manually</text>
          <text x="70" y="146" fill="#fecaca" fontSize="8">• No proof of correct execution path</text>
        </g>

        {/* Arrow */}
        <g>
          <text x="165" y="180" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="700">↓</text>
          <text x="165" y="195" textAnchor="middle" fill="#6ee7b7" fontSize="9">Add OTEL</text>
        </g>

        {/* With Observability */}
        <g>
          <rect x="40" y="205" width="250" height="85" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="165" y="225" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">WITH OTEL TRACING</text>

          <rect x="55" y="235" width="220" height="45" fill="#064e3b" stroke="#059669" strokeWidth="1.5" rx="3" />
          <text x="65" y="250" fill="#6ee7b7" fontSize="9" fontWeight="600">✓ Visibility:</text>
          <text x="70" y="263" fill="#d1fae5" fontSize="8">• Exactly what code ran, in what order</text>
          <text x="70" y="275" fill="#d1fae5" fontSize="8">• Performance metrics (duration, spans)</text>
        </g>

        {/* Right side - What OTEL captures */}
        <g>
          <rect x="310" y="45" width="250" height="245" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="435" y="65" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">WHAT OTEL CAPTURES</text>

          {/* Span trace */}
          <rect x="325" y="75" width="220" height="205" fill="#1e293b" stroke="#fbbf24" strokeWidth="1" rx="3" />

          {/* Span 1 */}
          <rect x="335" y="85" width="200" height="35" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="345" y="100" fill="#dbeafe" fontSize="8" fontWeight="600">Span: HTTP Request</text>
          <text x="345" y="112" fill="#93c5fd" fontSize="7" fontFamily="monospace">code.filepath: src/api/users.ts:42</text>

          {/* Span 2 */}
          <rect x="345" y="125" width="190" height="35" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="355" y="140" fill="#dbeafe" fontSize="8" fontWeight="600">Span: ValidateInput</text>
          <text x="355" y="152" fill="#93c5fd" fontSize="7" fontFamily="monospace">code.filepath: src/validation.ts:15</text>

          {/* Event */}
          <rect x="355" y="165" width="180" height="30" fill="#451a03" stroke="#f59e0b" strokeWidth="1" rx="2" />
          <text x="365" y="177" fill="#fde68a" fontSize="8" fontWeight="600">Event: user.validated</text>
          <text x="365" y="188" fill="#fbbf24" fontSize="7" fontFamily="monospace">attributes: {'{'}userId: 123{'}'}</text>

          {/* Span 3 */}
          <rect x="345" y="200" width="190" height="35" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="355" y="215" fill="#dbeafe" fontSize="8" fontWeight="600">Span: DatabaseQuery</text>
          <text x="355" y="227" fill="#93c5fd" fontSize="7" fontFamily="monospace">code.filepath: src/db/users.ts:88</text>

          {/* Span 4 */}
          <rect x="345" y="240" width="190" height="35" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="355" y="255" fill="#dbeafe" fontSize="8" fontWeight="600">Span: FormatResponse</text>
          <text x="355" y="267" fill="#93c5fd" fontSize="7" fontFamily="monospace">duration: 5ms</text>
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
        <strong style={{ color: '#f59e0b' }}>OpenTelemetry</strong> closes the observability gap by capturing detailed execution traces showing exactly what code ran, when, and with what data.
      </div>
    </div>
  );
};

const Step4ArchitectureValidation: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">ARCHITECTURE VALIDATION IN ACTION</text>

        {/* Canvas Definition */}
        <g>
          <rect x="40" y="50" width="250" height="120" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="72" textAnchor="middle" fill="#dbeafe" fontSize="11" fontWeight="600">CANVAS (Expected Architecture)</text>

          <rect x="55" y="85" width="220" height="75" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="65" y="100" fill="#bfdbfe" fontSize="8" fontFamily="monospace">nodes:</text>
          <text x="70" y="113" fill="#93c5fd" fontSize="8" fontFamily="monospace">  - UserAPI (rest-api)</text>
          <text x="70" y="126" fill="#93c5fd" fontSize="8" fontFamily="monospace">  - UserService (service)</text>
          <text x="70" y="139" fill="#93c5fd" fontSize="8" fontFamily="monospace">  - UserDB (database)</text>
          <text x="65" y="155" fill="#bfdbfe" fontSize="8" fontFamily="monospace">events expected:</text>
          <text x="70" y="168" fill="#60a5fa" fontSize="8" fontFamily="monospace" fontWeight="bold">  - user.created, user.validated</text>
        </g>

        {/* Validation Engine */}
        <g>
          <rect x="200" y="185" width="200" height="50" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="205" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">🔍 VALIDATION ENGINE</text>
          <text x="300" y="220" textAnchor="middle" fill="#c4b5fd" fontSize="9">Compares Expected vs Actual</text>
        </g>

        {/* Runtime Trace */}
        <g>
          <rect x="310" y="50" width="250" height="120" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="72" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">OTEL TRACE (Actual Execution)</text>

          <rect x="325" y="85" width="220" height="75" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="335" y="100" fill="#a7f3d0" fontSize="8" fontFamily="monospace">spans captured:</text>
          <text x="340" y="113" fill="#6ee7b7" fontSize="8" fontFamily="monospace">  ✓ src/api/users.ts</text>
          <text x="340" y="126" fill="#6ee7b7" fontSize="8" fontFamily="monospace">  ✓ src/services/user.ts</text>
          <text x="340" y="139" fill="#6ee7b7" fontSize="8" fontFamily="monospace">  ✓ src/db/users.ts</text>
          <text x="335" y="155" fill="#a7f3d0" fontSize="8" fontFamily="monospace">events emitted:</text>
          <text x="340" y="168" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">  ✓ user.created, user.validated</text>
        </g>

        {/* Results */}
        <g>
          <rect x="40" y="250" width="250" height="60" fill="#064e3b" stroke="#059669" strokeWidth="2" rx="4" />
          <text x="165" y="270" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">✓ VALIDATION PASSED</text>
          <text x="50" y="287" fill="#d1fae5" fontSize="8">• All expected nodes executed</text>
          <text x="50" y="299" fill="#d1fae5" fontSize="8">• All expected events emitted</text>

          <rect x="310" y="250" width="250" height="60" fill="#7f1d1d" stroke="#dc2626" strokeWidth="2" rx="4" />
          <text x="435" y="270" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="600">✗ VALIDATION FAILED</text>
          <text x="320" y="287" fill="#fecaca" fontSize="8">• Missing event: user.validated</text>
          <text x="320" y="299" fill="#fecaca" fontSize="8">• Unexpected call to PaymentService</text>
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
        The validation engine compares your canvas architecture against OTEL traces to verify execution matches design, catching architectural drift and unexpected behavior.
      </div>
    </div>
  );
};

const Step5SelfDocumenting: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">SELF-DOCUMENTING SYSTEMS</text>

        {/* Old Way */}
        <g>
          <rect x="40" y="50" width="250" height="100" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">TRADITIONAL APPROACH</text>

          <rect x="55" y="85" width="220" height="55" fill="#1f2937" stroke="#6b7280" strokeWidth="1" rx="3" />
          <text x="65" y="100" fill="#9ca3af" fontSize="8">📄 Architecture docs (manual)</text>
          <text x="65" y="113" fill="#9ca3af" fontSize="8">🧪 Tests (no visibility)</text>
          <text x="65" y="126" fill="#9ca3af" fontSize="8">⚠️ Docs drift from reality over time</text>

          <text x="165" y="165" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="600">Problems:</text>
          <text x="50" y="180" fill="#fca5a5" fontSize="8">• Docs require manual updates</text>
          <text x="50" y="192" fill="#fca5a5" fontSize="8">• No proof docs match code</text>
          <text x="50" y="204" fill="#fca5a5" fontSize="8">• Tests don't validate architecture</text>
        </g>

        {/* New Way */}
        <g>
          <rect x="310" y="50" width="250" height="100" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">RUNTIME VALIDATION</text>

          <rect x="325" y="85" width="220" height="55" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="335" y="100" fill="#6ee7b7" fontSize="8">📐 Canvas = Architecture + Tests</text>
          <text x="335" y="113" fill="#6ee7b7" fontSize="8">🔍 OTEL = Runtime proof</text>
          <text x="335" y="126" fill="#6ee7b7" fontSize="8">✅ Validation keeps them in sync</text>

          <text x="435" y="165" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="600">Benefits:</text>
          <text x="320" y="180" fill="#d1fae5" fontSize="8">• Docs auto-validate against reality</text>
          <text x="320" y="192" fill="#d1fae5" fontSize="8">• Tests verify architecture + behavior</text>
          <text x="320" y="204" fill="#d1fae5" fontSize="8">• Single source of truth</text>
        </g>

        {/* Example */}
        <g>
          <rect x="40" y="220" width="520" height="50" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="240" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">EXAMPLE: TEST OUTPUT</text>
          <text x="50" y="255" fill="#c4b5fd" fontSize="9" fontFamily="monospace">✓ User Registration Flow - Order #12345 completed for John Doe</text>
          <text x="60" y="267" fill="#a78bfa" fontSize="8" fontFamily="monospace">• User input validated → UserService.validate() [src/services/user.ts:42]</text>
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
        Tests become <strong style={{ color: '#10b981' }}>self-documenting</strong> by generating human-readable workflows from OTEL traces, showing exactly what happened with links to source code.
      </div>
    </div>
  );
};

const Step6DebuggingClarity: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">DEBUGGING WITH RUNTIME VALIDATION</text>

        {/* Test Failure - Old Way */}
        <g>
          <rect x="40" y="50" width="250" height="115" fill="#7f1d1d" stroke="#dc2626" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="600">OLD WAY: Test Failed</text>

          <rect x="55" y="85" width="220" height="70" fill="#450a0a" stroke="#991b1b" strokeWidth="1" rx="3" />
          <text x="65" y="100" fill="#fecaca" fontSize="9" fontFamily="monospace">AssertionError:</text>
          <text x="65" y="113" fill="#fecaca" fontSize="9" fontFamily="monospace">  Expected: 200</text>
          <text x="65" y="126" fill="#fecaca" fontSize="9" fontFamily="monospace">  Actual: 500</text>
          <text x="65" y="145" fill="#f87171" fontSize="8" fontStyle="italic">😕 Where did it fail? Why?</text>
        </g>

        {/* Test Failure - New Way */}
        <g>
          <rect x="310" y="50" width="250" height="115" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">NEW WAY: Rich Failure Info</text>

          <rect x="325" y="85" width="220" height="70" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="335" y="100" fill="#d1fae5" fontSize="8" fontFamily="monospace">✗ Validation failed at step 3:</text>
          <text x="335" y="113" fill="#6ee7b7" fontSize="8" fontFamily="monospace">  Expected: payment.processed</text>
          <text x="335" y="126" fill="#f87171" fontSize="8" fontFamily="monospace">  Got: payment.declined</text>
          <text x="335" y="145" fill="#34d399" fontSize="8" fontStyle="italic">🎯 Click to open PaymentService.ts:88</text>
        </g>

        {/* Detailed trace view */}
        <g>
          <rect x="40" y="180" width="520" height="110" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="300" y="200" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">EXECUTION TIMELINE WITH SOURCE LINKS</text>

          {/* Step 1 */}
          <rect x="55" y="210" width="240" height="20" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="60" y="223" fill="#dbeafe" fontSize="8">1. API Request → <tspan fill="#60a5fa" fontFamily="monospace">src/api/orders.ts:15</tspan></text>

          {/* Step 2 */}
          <rect x="55" y="235" width="240" height="20" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="60" y="248" fill="#dbeafe" fontSize="8">2. Validate Input → <tspan fill="#60a5fa" fontFamily="monospace">src/validation.ts:42</tspan></text>

          {/* Step 3 - FAILED */}
          <rect x="55" y="260" width="240" height="20" fill="#7f1d1d" stroke="#dc2626" strokeWidth="2" rx="2" />
          <text x="60" y="273" fill="#fca5a5" fontSize="8" fontWeight="bold">3. ✗ Process Payment → <tspan fontFamily="monospace">src/payment.ts:88</tspan></text>

          {/* Right side explanation */}
          <rect x="310" y="210" width="240" height="75" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" rx="3" />
          <text x="320" y="225" fill="#ddd6fe" fontSize="9" fontWeight="600">Why this helps debugging:</text>
          <text x="325" y="240" fill="#c4b5fd" fontSize="8">• See exact execution order</text>
          <text x="325" y="252" fill="#c4b5fd" fontSize="8">• Know which file/line failed</text>
          <text x="325" y="264" fill="#c4b5fd" fontSize="8">• Understand the full context</text>
          <text x="325" y="276" fill="#c4b5fd" fontSize="8">• Compare expected vs actual</text>
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
        When tests fail, you get the <strong style={{ color: '#10b981' }}>full execution context</strong>: what code ran, in what order, with links to exact source locations - no more mystery debugging.
      </div>
    </div>
  );
};

const Step7EndToEnd: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="20" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">COMPLETE RUNTIME VALIDATION WORKFLOW</text>

        {/* Step 1 */}
        <g>
          <rect x="40" y="40" width="140" height="70" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="110" y="58" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="700">1. DESIGN</text>
          <text x="48" y="73" fill="#93c5fd" fontSize="8">Define expected</text>
          <text x="48" y="85" fill="#93c5fd" fontSize="8">architecture in</text>
          <text x="48" y="97" fill="#93c5fd" fontSize="8">canvas files</text>

          <line x1="185" y1="75" x2="215" y2="75" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow6)" />

          {/* Step 2 */}
          <rect x="220" y="40" width="140" height="70" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="290" y="58" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="700">2. IMPLEMENT</text>
          <text x="228" y="73" fill="#6ee7b7" fontSize="8">Write code</text>
          <text x="228" y="85" fill="#6ee7b7" fontSize="8">matching the</text>
          <text x="228" y="97" fill="#6ee7b7" fontSize="8">architecture</text>

          <line x1="365" y1="75" x2="395" y2="75" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow6)" />

          {/* Step 3 */}
          <rect x="400" y="40" width="160" height="70" fill="#451a03" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="480" y="58" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="700">3. INSTRUMENT</text>
          <text x="408" y="73" fill="#fbbf24" fontSize="8">Add OTEL to</text>
          <text x="408" y="85" fill="#fbbf24" fontSize="8">capture runtime</text>
          <text x="408" y="97" fill="#fbbf24" fontSize="8">execution</text>
        </g>

        {/* Arrow down */}
        <line x1="480" y1="115" x2="480" y2="140" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow6)" />

        {/* Step 4 */}
        <g>
          <rect x="400" y="145" width="160" height="70" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="480" y="163" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="700">4. EXECUTE</text>
          <text x="408" y="178" fill="#c4b5fd" fontSize="8">Run tests/app</text>
          <text x="408" y="190" fill="#c4b5fd" fontSize="8">OTEL captures</text>
          <text x="408" y="202" fill="#c4b5fd" fontSize="8">traces</text>

          <line x1="395" y1="180" x2="365" y2="180" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow6)" />

          {/* Step 5 */}
          <rect x="220" y="145" width="140" height="70" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" rx="4" />
          <text x="290" y="163" textAnchor="middle" fill="#e9d5ff" fontSize="10" fontWeight="700">5. VALIDATE</text>
          <text x="228" y="178" fill="#ddd6fe" fontSize="8">Compare traces</text>
          <text x="228" y="190" fill="#ddd6fe" fontSize="8">against canvas</text>
          <text x="228" y="202" fill="#ddd6fe" fontSize="8">expectations</text>

          <line x1="215" y1="180" x2="185" y2="180" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow6)" />

          {/* Step 6 */}
          <rect x="40" y="145" width="140" height="70" fill="#064e3b" stroke="#059669" strokeWidth="2" rx="4" />
          <text x="110" y="163" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="700">6. REPORT</text>
          <text x="48" y="178" fill="#a7f3d0" fontSize="8">Generate</text>
          <text x="48" y="190" fill="#a7f3d0" fontSize="8">narrative with</text>
          <text x="48" y="202" fill="#a7f3d0" fontSize="8">source links</text>
        </g>

        {/* Benefits */}
        <rect x="40" y="235" width="520" height="75" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
        <text x="300" y="253" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="700">WHAT YOU GET</text>

        <g>
          <text x="50" y="270" fill="#94a3b8" fontSize="9">• <tspan fill="#10b981" fontWeight="600">Proof of correctness</tspan> - verify execution matches design</text>
          <text x="50" y="283" fill="#94a3b8" fontSize="9">• <tspan fill="#3b82f6" fontWeight="600">Architecture validation</tspan> - catch drift automatically</text>
          <text x="50" y="296" fill="#94a3b8" fontSize="9">• <tspan fill="#8b5cf6" fontWeight="600">Better debugging</tspan> - see exactly what ran and where</text>
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
        The complete workflow: <strong style={{ color: '#3b82f6' }}>design</strong> → <strong style={{ color: '#10b981' }}>implement</strong> → <strong style={{ color: '#f59e0b' }}>instrument</strong> → <strong style={{ color: '#8b5cf6' }}>execute</strong> → <strong style={{ color: '#a78bfa' }}>validate</strong> → <strong style={{ color: '#059669' }}>report</strong> with full confidence!
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'problem', title: 'The Traditional Testing Problem', component: Step1TheProblem },
  { id: 'validation', title: 'What is Runtime Validation?', component: Step2WhatIsRuntimeValidation },
  { id: 'observability', title: 'The Observability Gap', component: Step3ObservabilityGap },
  { id: 'architecture', title: 'Architecture Validation', component: Step4ArchitectureValidation },
  { id: 'documenting', title: 'Self-Documenting Systems', component: Step5SelfDocumenting },
  { id: 'debugging', title: 'Debugging Clarity', component: Step6DebuggingClarity },
  { id: 'workflow', title: 'Complete Workflow', component: Step7EndToEnd },
];

export const RuntimeValidationExplainerPanel: React.FC<RuntimeValidationExplainerPanelProps> = ({ className }) => {
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
          Runtime Validation Guide
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          Understand the problem this workflow solves: validating that your code actually does what you think it does
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
                      backgroundColor: '#8b5cf6',
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
          Ready to Implement Runtime Validation?
        </h3>
        <p style={{ color: theme.colors.textSecondary, marginBottom: '16px', fontSize: '14px' }}>
          Now that you understand the problem and the solution, you can start validating your systems at runtime.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#8b5cf6' }}>1.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              Define your architecture in <code style={{ color: '#3b82f6' }}>.canvas</code> files
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#8b5cf6' }}>2.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              Add <code style={{ color: '#f59e0b' }}>OpenTelemetry</code> instrumentation to your code
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#8b5cf6' }}>3.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              Run tests and capture <code style={{ color: '#10b981' }}>OTEL traces</code>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#8b5cf6' }}>4.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              View validated execution with source anchoring
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuntimeValidationExplainerPanel;
