import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface TestVsProductionExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1SameInfrastructure: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 220" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">SAME CANVAS, TWO CONTEXTS</text>

        {/* Center - Shared Canvas */}
        <g>
          <rect x="220" y="45" width="160" height="140" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="3" rx="6" />
          <text x="300" y="68" textAnchor="middle" fill="#dbeafe" fontSize="13" fontWeight="700">CANVAS FILE</text>
          <text x="300" y="85" textAnchor="middle" fill="#93c5fd" fontSize="10">(Architecture Definition)</text>

          <rect x="235" y="95" width="130" height="80" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="245" y="110" fill="#bfdbfe" fontSize="8" fontFamily="monospace">nodes:</text>
          <text x="250" y="123" fill="#93c5fd" fontSize="8" fontFamily="monospace">  API → Service → DB</text>
          <text x="245" y="140" fill="#bfdbfe" fontSize="8" fontFamily="monospace">events:</text>
          <text x="250" y="153" fill="#93c5fd" fontSize="8" fontFamily="monospace">  user.created</text>
          <text x="250" y="166" fill="#93c5fd" fontSize="8" fontFamily="monospace">  user.validated</text>
        </g>

        {/* Left - Tests */}
        <g>
          <line x1="215" y1="115" x2="170" y2="115" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-left)" />
          <text x="193" y="105" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="600">validates</text>

          <rect x="30" y="70" width="135" height="90" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="97" y="88" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="700">TESTS</text>
          <text x="40" y="105" fill="#6ee7b7" fontSize="8">✓ Known inputs</text>
          <text x="40" y="118" fill="#6ee7b7" fontSize="8">✓ Controlled env</text>
          <text x="40" y="131" fill="#6ee7b7" fontSize="8">✓ Pass/Fail</text>
          <text x="40" y="144" fill="#6ee7b7" fontSize="8">✓ CI/CD validation</text>
        </g>

        {/* Right - Production */}
        <g>
          <line x1="385" y1="115" x2="430" y2="115" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-right)" />
          <text x="407" y="105" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="600">monitors</text>

          <rect x="435" y="70" width="135" height="90" fill="#451a03" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="502" y="88" textAnchor="middle" fill="#fef3c7" fontSize="11" fontWeight="700">PRODUCTION</text>
          <text x="445" y="105" fill="#fbbf24" fontSize="8">📊 Real users</text>
          <text x="445" y="118" fill="#fbbf24" fontSize="8">📊 Live traffic</text>
          <text x="445" y="131" fill="#fbbf24" fontSize="8">📊 Observe/Alert</text>
          <text x="445" y="144" fill="#fbbf24" fontSize="8">📊 Drift detection</text>
        </g>

        {/* Bottom note */}
        <rect x="80" y="195" width="440" height="18" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1" rx="3" />
        <text x="300" y="207" textAnchor="middle" fill="#ddd6fe" fontSize="9">
          Same OTEL instrumentation, same canvas - different purposes!
        </text>

        <defs>
          <marker id="arrow-left" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M9,0 L9,6 L0,3 z" fill="#10b981" />
          </marker>
          <marker id="arrow-right" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        The <strong style={{ color: '#3b82f6' }}>same canvas file</strong> serves both <strong style={{ color: '#10b981' }}>test validation</strong> (prove correctness) and <strong style={{ color: '#f59e0b' }}>production monitoring</strong> (observe reality).
      </div>
    </div>
  );
};

const Step2TestExecution: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">TEST EXECUTION VALIDATION</text>

        {/* Test scenario */}
        <g>
          <rect x="40" y="50" width="520" height="235" fill="#0f172a" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="72" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="600">Controlled Environment - Known Inputs</text>

          {/* Test code */}
          <rect x="55" y="85" width="240" height="90" fill="#064e3b" stroke="#059669" strokeWidth="1.5" rx="3" />
          <text x="65" y="100" fill="#d1fae5" fontSize="9" fontWeight="600">test('user registration', async function() {'{'}</text>
          <text x="70" y="115" fill="#a7f3d0" fontSize="8" fontFamily="monospace">const user = {'{'}</text>
          <text x="75" y="128" fill="#6ee7b7" fontSize="8" fontFamily="monospace">email: 'test@example.com',</text>
          <text x="75" y="141" fill="#6ee7b7" fontSize="8" fontFamily="monospace">password: 'secure123'</text>
          <text x="70" y="154" fill="#a7f3d0" fontSize="8" fontFamily="monospace">{'}'}</text>
          <text x="70" y="167" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">await registerUser(user)</text>

          {/* Arrow */}
          <line x1="300" y1="130" x2="330" y2="130" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow1)" />
          <text x="315" y="120" textAnchor="middle" fill="#3b82f6" fontSize="8">runs</text>

          {/* OTEL Trace */}
          <rect x="335" y="85" width="210" height="90" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" rx="3" />
          <text x="345" y="100" fill="#dbeafe" fontSize="9" fontWeight="600">OTEL Captured:</text>
          <text x="350" y="115" fill="#93c5fd" fontSize="8" fontFamily="monospace">✓ Span: UserAPI.register</text>
          <text x="350" y="128" fill="#93c5fd" fontSize="8" fontFamily="monospace">✓ Span: UserService.create</text>
          <text x="350" y="141" fill="#93c5fd" fontSize="8" fontFamily="monospace">✓ Span: Database.insert</text>
          <text x="350" y="154" fill="#93c5fd" fontSize="8" fontFamily="monospace">✓ Event: user.created</text>
          <text x="350" y="167" fill="#93c5fd" fontSize="8" fontFamily="monospace">✓ Event: user.validated</text>

          {/* Arrow down */}
          <line x1="300" y1="180" x2="300" y2="195" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow1)" />
          <text x="320" y="190" fill="#8b5cf6" fontSize="8">validates</text>

          {/* Validation */}
          <rect x="55" y="200" width="490" height="75" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" rx="3" />
          <text x="65" y="218" fill="#ddd6fe" fontSize="10" fontWeight="600">Validation Engine Checks:</text>

          <g>
            <text x="70" y="235" fill="#c4b5fd" fontSize="8">✓ Did API call Service? <tspan fill="#34d399" fontWeight="bold">YES</tspan> (expected edge in canvas)</text>
            <text x="70" y="248" fill="#c4b5fd" fontSize="8">✓ Did Service call DB? <tspan fill="#34d399" fontWeight="bold">YES</tspan> (expected edge)</text>
            <text x="70" y="261" fill="#c4b5fd" fontSize="8">✓ Were events emitted? <tspan fill="#34d399" fontWeight="bold">YES</tspan> (user.created, user.validated)</text>
          </g>

          <rect x="360" y="225" width="175" height="45" fill="#064e3b" stroke="#059669" strokeWidth="1.5" rx="3" />
          <text x="447" y="242" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="700">TEST PASSED ✓</text>
          <text x="447" y="257" textAnchor="middle" fill="#a7f3d0" fontSize="8">Architecture validated</text>
        </g>

        <defs>
          <marker id="arrow1" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
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
        <strong style={{ color: '#10b981' }}>Test Execution:</strong> Use known inputs to <em>prove</em> your code follows the architecture. Test fails if execution doesn't match canvas - hard assertion.
      </div>
    </div>
  );
};

const Step3ProductionTelemetry: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">PRODUCTION TELEMETRY MONITORING</text>

        {/* Production scenario */}
        <g>
          <rect x="40" y="50" width="520" height="235" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="72" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="600">Live Environment - Unknown Inputs</text>

          {/* Real user request */}
          <rect x="55" y="85" width="240" height="90" fill="#451a03" stroke="#ea580c" strokeWidth="1.5" rx="3" />
          <text x="65" y="100" fill="#fed7aa" fontSize="9" fontWeight="600">POST /api/register (Production)</text>
          <text x="70" y="115" fill="#fdba74" fontSize="8" fontFamily="monospace">Request from real user:</text>
          <text x="75" y="128" fill="#fbbf24" fontSize="8" fontFamily="monospace">email: 'alice@company.com'</text>
          <text x="75" y="141" fill="#fbbf24" fontSize="8" fontFamily="monospace">password: '********'</text>
          <text x="75" y="154" fill="#fbbf24" fontSize="8" fontFamily="monospace">referralCode: 'PROMO2024'</text>
          <text x="70" y="167" fill="#f59e0b" fontSize="7" fontStyle="italic">Unknown data, real traffic</text>

          {/* Arrow */}
          <line x1="300" y1="130" x2="330" y2="130" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow2)" />
          <text x="315" y="120" textAnchor="middle" fill="#3b82f6" fontSize="8">executes</text>

          {/* OTEL Trace */}
          <rect x="335" y="85" width="210" height="90" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" rx="3" />
          <text x="345" y="100" fill="#dbeafe" fontSize="9" fontWeight="600">OTEL Captured:</text>
          <text x="350" y="115" fill="#93c5fd" fontSize="8" fontFamily="monospace">Span: UserAPI (125ms)</text>
          <text x="350" y="128" fill="#93c5fd" fontSize="8" fontFamily="monospace">Span: UserService (98ms)</text>
          <text x="350" y="141" fill="#fca5a5" fontSize="8" fontFamily="monospace">Span: PromoService ⚠️</text>
          <text x="350" y="154" fill="#93c5fd" fontSize="8" fontFamily="monospace">Span: Database (450ms)</text>
          <text x="350" y="167" fill="#93c5fd" fontSize="8" fontFamily="monospace">Event: user.created</text>

          {/* Arrow down */}
          <line x1="300" y1="180" x2="300" y2="195" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow2)" />
          <text x="320" y="190" fill="#8b5cf6" fontSize="8">compares</text>

          {/* Monitoring */}
          <rect x="55" y="200" width="490" height="75" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" rx="3" />
          <text x="65" y="218" fill="#ddd6fe" fontSize="10" fontWeight="600">Monitoring System Observes:</text>

          <g>
            <text x="70" y="235" fill="#6ee7b7" fontSize="8">✓ Expected flow executed successfully</text>
            <text x="70" y="248" fill="#fbbf24" fontSize="8">⚠️ Unexpected: PromoService called (not in canvas!)</text>
            <text x="70" y="261" fill="#fbbf24" fontSize="8">⚠️ Performance: DB query 450ms (expected &lt; 100ms)</text>
          </g>

          <rect x="360" y="225" width="175" height="45" fill="#7f1d1d" stroke="#dc2626" strokeWidth="1.5" rx="3" />
          <text x="447" y="242" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="700">DRIFT DETECTED</text>
          <text x="447" y="257" textAnchor="middle" fill="#fecaca" fontSize="8">Alert team, log anomaly</text>
        </g>

        <defs>
          <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
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
        <strong style={{ color: '#f59e0b' }}>Production Telemetry:</strong> Use real traffic to <em>observe</em> how the system behaves. Detects drift and anomalies - soft monitoring with alerts.
      </div>
    </div>
  );
};

const Step4KeyDifferences: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">KEY DIFFERENCES</text>

        {/* Table header */}
        <rect x="40" y="45" width="160" height="30" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" />
        <text x="120" y="64" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">ASPECT</text>

        <rect x="205" y="45" width="165" height="30" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
        <text x="287" y="64" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">TEST EXECUTION</text>

        <rect x="375" y="45" width="185" height="30" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
        <text x="467" y="64" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">PRODUCTION TELEMETRY</text>

        {/* Row 1: Environment */}
        <rect x="40" y="80" width="160" height="35" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="50" y="100" fill="#cbd5e1" fontSize="9" fontWeight="600">Environment</text>

        <rect x="205" y="80" width="165" height="35" fill="#022c22" stroke="#059669" strokeWidth="1" />
        <text x="215" y="100" fill="#a7f3d0" fontSize="8">Controlled test env</text>

        <rect x="375" y="80" width="185" height="35" fill="#422006" stroke="#ea580c" strokeWidth="1" />
        <text x="385" y="100" fill="#fed7aa" fontSize="8">Live production system</text>

        {/* Row 2: Data */}
        <rect x="40" y="120" width="160" height="35" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="50" y="140" fill="#cbd5e1" fontSize="9" fontWeight="600">Data</text>

        <rect x="205" y="120" width="165" height="35" fill="#022c22" stroke="#059669" strokeWidth="1" />
        <text x="215" y="140" fill="#a7f3d0" fontSize="8">Known test fixtures</text>

        <rect x="375" y="120" width="185" height="35" fill="#422006" stroke="#ea580c" strokeWidth="1" />
        <text x="385" y="140" fill="#fed7aa" fontSize="8">Real user data (unknown)</text>

        {/* Row 3: Purpose */}
        <rect x="40" y="160" width="160" height="35" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="50" y="180" fill="#cbd5e1" fontSize="9" fontWeight="600">Purpose</text>

        <rect x="205" y="160" width="165" height="35" fill="#022c22" stroke="#059669" strokeWidth="1" />
        <text x="215" y="180" fill="#a7f3d0" fontSize="8">Validate correctness</text>

        <rect x="375" y="160" width="185" height="35" fill="#422006" stroke="#ea580c" strokeWidth="1" />
        <text x="385" y="180" fill="#fed7aa" fontSize="8">Monitor & debug</text>

        {/* Row 4: Validation */}
        <rect x="40" y="200" width="160" height="35" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="50" y="220" fill="#cbd5e1" fontSize="9" fontWeight="600">Validation</text>

        <rect x="205" y="200" width="165" height="35" fill="#022c22" stroke="#059669" strokeWidth="1" />
        <text x="215" y="220" fill="#34d399" fontSize="8" fontWeight="bold">Pass/Fail (hard assert)</text>

        <rect x="375" y="200" width="185" height="35" fill="#422006" stroke="#ea580c" strokeWidth="1" />
        <text x="385" y="220" fill="#fbbf24" fontSize="8" fontWeight="bold">Detect anomalies (soft alert)</text>

        {/* Row 5: Output */}
        <rect x="40" y="240" width="160" height="35" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="50" y="260" fill="#cbd5e1" fontSize="9" fontWeight="600">Output</text>

        <rect x="205" y="240" width="165" height="35" fill="#022c22" stroke="#059669" strokeWidth="1" />
        <text x="215" y="260" fill="#a7f3d0" fontSize="8">Test documentation</text>

        <rect x="375" y="240" width="185" height="35" fill="#422006" stroke="#ea580c" strokeWidth="1" />
        <text x="385" y="260" fill="#fed7aa" fontSize="8">Incident investigation</text>

        {/* Row 6: Frequency */}
        <rect x="40" y="280" width="160" height="35" fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <text x="50" y="300" fill="#cbd5e1" fontSize="9" fontWeight="600">Frequency</text>

        <rect x="205" y="280" width="165" height="35" fill="#022c22" stroke="#059669" strokeWidth="1" />
        <text x="215" y="300" fill="#a7f3d0" fontSize="8">Every test run (CI/CD)</text>

        <rect x="375" y="280" width="185" height="35" fill="#422006" stroke="#ea580c" strokeWidth="1" />
        <text x="385" y="300" fill="#fed7aa" fontSize="8">Continuous streaming</text>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        Tests use <strong style={{ color: '#10b981' }}>deterministic validation</strong> (known inputs, hard failures). Production uses <strong style={{ color: '#f59e0b' }}>observational monitoring</strong> (unknown inputs, soft alerts).
      </div>
    </div>
  );
};

const Step5FindingBugs: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">EXAMPLE: FINDING A BUG</text>

        {/* Tests pass */}
        <g>
          <rect x="40" y="50" width="250" height="110" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">IN TESTS (Passed ✓)</text>

          <rect x="55" y="85" width="220" height="65" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="65" y="100" fill="#6ee7b7" fontSize="8" fontFamily="monospace">Test: Basic User Registration</text>
          <text x="65" y="113" fill="#a7f3d0" fontSize="8" fontFamily="monospace">Input: &#123; email, password &#125;</text>
          <text x="65" y="130" fill="#34d399" fontSize="8" fontWeight="bold">✓ All events matched canvas</text>
          <text x="65" y="143" fill="#34d399" fontSize="8" fontWeight="bold">✓ Architecture validated</text>
        </g>

        {/* But production... */}
        <g>
          <rect x="310" y="50" width="250" height="110" fill="#7f1d1d" stroke="#dc2626" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#fecaca" fontSize="11" fontWeight="600">IN PRODUCTION (Alert! ⚠️)</text>

          <rect x="325" y="85" width="220" height="65" fill="#450a0a" stroke="#991b1b" strokeWidth="1" rx="3" />
          <text x="335" y="100" fill="#fca5a5" fontSize="8" fontFamily="monospace">User: alice@company.com</text>
          <text x="335" y="113" fill="#fecaca" fontSize="8" fontFamily="monospace">Has premium billing enabled</text>
          <text x="335" y="130" fill="#ef4444" fontSize="8" fontWeight="bold">✗ Unexpected: payment.charged</text>
          <text x="335" y="143" fill="#ef4444" fontSize="8" fontWeight="bold">✗ Drift from canvas detected!</text>
        </g>

        {/* The timeline */}
        <g>
          <rect x="40" y="180" width="520" height="125" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="300" y="200" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">PRODUCTION TRACE TIMELINE</text>

          {/* Expected events */}
          <rect x="55" y="215" width="240" height="20" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="60" y="228" fill="#dbeafe" fontSize="8">1. user.created ✓</text>

          <rect x="55" y="240" width="240" height="20" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="2" />
          <text x="60" y="253" fill="#dbeafe" fontSize="8">2. email.sent ✓</text>

          {/* Unexpected event! */}
          <rect x="55" y="265" width="240" height="30" fill="#7f1d1d" stroke="#dc2626" strokeWidth="2" rx="2" />
          <text x="60" y="278" fill="#fca5a5" fontSize="8" fontWeight="bold">3. payment.charged ✗ UNEXPECTED!</text>
          <text x="65" y="290" fill="#fecaca" fontSize="7" fontFamily="monospace">src/billing/autocharge.ts:142</text>

          {/* Why this happened */}
          <rect x="310" y="215" width="235" height="80" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" rx="3" />
          <text x="320" y="230" fill="#ddd6fe" fontSize="9" fontWeight="600">Why didn't tests catch this?</text>
          <text x="325" y="245" fill="#c4b5fd" fontSize="8">• Test used basic user (no billing)</text>
          <text x="325" y="258" fill="#c4b5fd" fontSize="8">• Production user = premium</text>
          <text x="325" y="271" fill="#c4b5fd" fontSize="8">• New code path only for premium!</text>
          <text x="325" y="284" fill="#a78bfa" fontSize="8" fontWeight="bold">Canvas caught architectural drift!</text>
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
        Tests validate <strong style={{ color: '#10b981' }}>known scenarios</strong>. Production telemetry catches <strong style={{ color: '#dc2626' }}>edge cases and real-world behavior</strong> that tests miss.
      </div>
    </div>
  );
};

const Step6CodeExample: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">CODE EXAMPLES</text>

        {/* Test code */}
        <g>
          <rect x="40" y="45" width="520" height="120" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="65" textAnchor="middle" fill="#d1fae5" fontSize="12" fontWeight="600">TEST CODE (Validation)</text>

          <rect x="55" y="75" width="490" height="80" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="65" y="90" fill="#6ee7b7" fontSize="8" fontFamily="monospace">test('user registration', async function() {'{'}</text>
          <text x="70" y="103" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  const trace = await captureOtelTrace(...);</text>
          <text x="75" y="116" fill="#a7f3d0" fontSize="8" fontFamily="monospace">    await registerUser({'{'} email: 'test@ex.com' {'}'});</text>
          <text x="70" y="129" fill="#a7f3d0" fontSize="8" fontFamily="monospace">  // trace captured</text>
          <text x="70" y="145" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">  const validation = validateExecution(canvas, trace);</text>
          <text x="70" y="158" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold">  expect(validation.passed).toBe(true); // Hard assert</text>
        </g>

        {/* Production code */}
        <g>
          <rect x="40" y="180" width="520" height="125" fill="#451a03" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="200" textAnchor="middle" fill="#fef3c7" fontSize="12" fontWeight="600">PRODUCTION CODE (Monitoring)</text>

          <rect x="55" y="210" width="490" height="85" fill="#422006" stroke="#ea580c" strokeWidth="1" rx="3" />
          <text x="65" y="225" fill="#fbbf24" fontSize="8" fontFamily="monospace">app.use(async (req, res, next) {'{'}</text>
          <text x="70" y="238" fill="#fdba74" fontSize="8" fontFamily="monospace">  const trace = await captureRequestTrace(req, next);</text>
          <text x="70" y="253" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">  const validation = validateExecution(canvas, trace);</text>
          <text x="70" y="268" fill="#fbbf24" fontSize="8" fontFamily="monospace">  if (!validation.passed) {'{'}</text>
          <text x="75" y="281" fill="#fed7aa" fontSize="8" fontFamily="monospace">logger.warn('Drift detected', validation);</text>
          <text x="75" y="294" fill="#fed7aa" fontSize="8" fontFamily="monospace">alertTeam(validation); // Soft alert, keep serving</text>
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
        Same <code style={{ color: '#8b5cf6' }}>validateExecution()</code> function, but different responses: tests <strong style={{ color: '#10b981' }}>fail hard</strong>, production <strong style={{ color: '#f59e0b' }}>alerts and continues</strong>.
      </div>
    </div>
  );
};

const Step7WorkingTogether: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="20" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">HOW THEY WORK TOGETHER</text>

        {/* Development cycle */}
        <g>
          {/* Step 1: Design */}
          <rect x="40" y="40" width="120" height="60" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="100" y="60" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="700">1. DESIGN</text>
          <text x="48" y="75" fill="#93c5fd" fontSize="8">Define canvas</text>
          <text x="48" y="87" fill="#93c5fd" fontSize="8">with expected</text>
          <text x="48" y="99" fill="#93c5fd" fontSize="8">architecture</text>

          <line x1="165" y1="70" x2="195" y2="70" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow3)" />

          {/* Step 2: Implement + Test */}
          <rect x="200" y="40" width="120" height="60" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="260" y="60" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="700">2. TEST</text>
          <text x="208" y="75" fill="#6ee7b7" fontSize="8">Write code</text>
          <text x="208" y="87" fill="#6ee7b7" fontSize="8">Validate with</text>
          <text x="208" y="99" fill="#6ee7b7" fontSize="8">tests ✓</text>

          <line x1="325" y1="70" x2="355" y2="70" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow3)" />

          {/* Step 3: Deploy */}
          <rect x="360" y="40" width="120" height="60" fill="#451a03" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="420" y="60" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="700">3. DEPLOY</text>
          <text x="368" y="75" fill="#fbbf24" fontSize="8">Ship to prod</text>
          <text x="368" y="87" fill="#fbbf24" fontSize="8">Monitor with</text>
          <text x="368" y="99" fill="#fbbf24" fontSize="8">telemetry 📊</text>

          {/* Arrow back */}
          <line x1="480" y1="60" x2="520" y2="60" stroke="#475569" strokeWidth="2" />
          <line x1="520" y1="60" x2="520" y2="140" stroke="#475569" strokeWidth="2" />
          <line x1="520" y1="140" x2="80" y2="140" stroke="#475569" strokeWidth="2" />
          <line x1="80" y1="140" x2="80" y2="105" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow3)" />
          <text x="540" y="100" fill="#dc2626" fontSize="8" fontWeight="600">Found drift?</text>
          <text x="540" y="112" fill="#f87171" fontSize="8">Update canvas!</text>
        </g>

        {/* Benefits */}
        <g>
          <rect x="40" y="160" width="250" height="125" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="180" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">TESTS GIVE YOU:</text>
          <text x="50" y="197" fill="#c4b5fd" fontSize="8">✓ Proof code works correctly</text>
          <text x="50" y="210" fill="#c4b5fd" fontSize="8">✓ Fast feedback in CI/CD</text>
          <text x="50" y="223" fill="#c4b5fd" fontSize="8">✓ Architectural validation</text>
          <text x="50" y="236" fill="#c4b5fd" fontSize="8">✓ Regression prevention</text>
          <text x="50" y="249" fill="#c4b5fd" fontSize="8">✓ Self-documenting test output</text>
          <text x="50" y="275" fill="#10b981" fontSize="9" fontWeight="bold">Known scenarios, deterministic</text>

          <rect x="310" y="160" width="250" height="125" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="435" y="180" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">PRODUCTION GIVES YOU:</text>
          <text x="320" y="197" fill="#c4b5fd" fontSize="8">📊 Real user behavior patterns</text>
          <text x="320" y="210" fill="#c4b5fd" fontSize="8">📊 Edge cases tests didn't cover</text>
          <text x="320" y="223" fill="#c4b5fd" fontSize="8">📊 Performance under load</text>
          <text x="320" y="236" fill="#c4b5fd" fontSize="8">📊 Architectural drift detection</text>
          <text x="320" y="249" fill="#c4b5fd" fontSize="8">📊 Production incident debugging</text>
          <text x="320" y="275" fill="#f59e0b" fontSize="9" fontWeight="bold">Unknown scenarios, observational</text>
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
        <strong style={{ color: '#8b5cf6' }}>Together they're powerful:</strong> Tests prove correctness with known inputs. Production catches real-world edge cases. Both use the same canvas as source of truth.
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'infrastructure', title: 'Same Infrastructure, Different Purposes', component: Step1SameInfrastructure },
  { id: 'test', title: 'Test Execution Validation', component: Step2TestExecution },
  { id: 'production', title: 'Production Telemetry Monitoring', component: Step3ProductionTelemetry },
  { id: 'differences', title: 'Key Differences', component: Step4KeyDifferences },
  { id: 'bugs', title: 'Finding Bugs: An Example', component: Step5FindingBugs },
  { id: 'code', title: 'Code Examples', component: Step6CodeExample },
  { id: 'together', title: 'How They Work Together', component: Step7WorkingTogether },
];

export const TestVsProductionExplainerPanel: React.FC<TestVsProductionExplainerPanelProps> = ({ className }) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['infrastructure']));

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
          Test vs Production: Understanding the Difference
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          Learn how the same canvas and OTEL infrastructure serves both test validation and production monitoring
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
                      backgroundColor: '#f59e0b',
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
        <p style={{ color: theme.colors.textSecondary, marginBottom: '16px', fontSize: '14px' }}>
          One canvas, one codebase with OTEL, two powerful use cases:
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1, padding: '16px', backgroundColor: '#022c22', border: '1px solid #059669', borderRadius: '6px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#6ee7b7', marginBottom: '8px' }}>
              🧪 Tests
            </div>
            <div style={{ fontSize: '14px', color: '#a7f3d0' }}>
              Validate correctness with known inputs. Hard assertions. Fast feedback in CI/CD.
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px', backgroundColor: '#422006', border: '1px solid #ea580c', borderRadius: '6px' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#fbbf24', marginBottom: '8px' }}>
              📊 Production
            </div>
            <div style={{ fontSize: '14px', color: '#fdba74' }}>
              Monitor real behavior with unknown inputs. Soft alerts. Detect drift and anomalies.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestVsProductionExplainerPanel;
