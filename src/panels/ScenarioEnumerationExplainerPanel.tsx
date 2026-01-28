import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface ScenarioEnumerationExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1TheEnumerationProblem: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 260" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">THE ENUMERATION PROBLEM</text>

        {/* Left - Traditional approach */}
        <g>
          <rect x="40" y="50" width="240" height="185" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
          <text x="160" y="72" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">TRADITIONAL TESTS</text>

          <rect x="55" y="85" width="210" height="140" fill="#450a0a" stroke="#991b1b" strokeWidth="1.5" rx="3" />
          <text x="65" y="100" fill="#fca5a5" fontSize="9" fontWeight="600">Problem: Implicit Expectations</text>
          <text x="70" y="118" fill="#fecaca" fontSize="8">test('creates user') {'{'}</text>
          <text x="75" y="131" fill="#fecaca" fontSize="8">  expect(response.status).toBe(201)</text>
          <text x="70" y="144" fill="#fecaca" fontSize="8">{'}'}</text>

          <text x="65" y="165" fill="#f87171" fontSize="8">❌ What about:</text>
          <text x="70" y="178" fill="#fca5a5" fontSize="7">• User already exists?</text>
          <text x="70" y="189" fill="#fca5a5" fontSize="7">• Invalid email?</text>
          <text x="70" y="200" fill="#fca5a5" fontSize="7">• Database down?</text>
          <text x="70" y="211" fill="#fca5a5" fontSize="7">• Rate limit exceeded?</text>
        </g>

        {/* Arrow */}
        <text x="300" y="150" textAnchor="middle" fill="#f59e0b" fontSize="24" fontWeight="700">→</text>

        {/* Right - Scenario enumeration */}
        <g>
          <rect x="320" y="50" width="240" height="185" fill="#1e293b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="440" y="72" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">SCENARIO ENUMERATION</text>

          <rect x="335" y="85" width="210" height="140" fill="#064e3b" stroke="#059669" strokeWidth="1.5" rx="3" />
          <text x="345" y="100" fill="#6ee7b7" fontSize="9" fontWeight="600">Explicit: All Possibilities</text>
          <text x="350" y="118" fill="#d1fae5" fontSize="8">scenarios:</text>
          <text x="355" y="131" fill="#a7f3d0" fontSize="8">✓ success (user.created)</text>
          <text x="355" y="144" fill="#a7f3d0" fontSize="8">✓ duplicate (user.exists)</text>
          <text x="355" y="157" fill="#a7f3d0" fontSize="8">✓ invalid-email (validation.failed)</text>
          <text x="355" y="170" fill="#a7f3d0" fontSize="8">✓ db-error (database.error)</text>
          <text x="355" y="183" fill="#a7f3d0" fontSize="8">✓ rate-limited (rate.exceeded)</text>

          <text x="345" y="205" fill="#34d399" fontSize="8" fontWeight="bold">All paths documented!</text>
          <text x="345" y="217" fill="#34d399" fontSize="8" fontWeight="bold">Validation checks each one</text>
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
        <strong style={{ color: '#ef4444' }}>Problem:</strong> Traditional tests have <em>implicit</em> expectations. <strong style={{ color: '#10b981' }}>Solution:</strong> Narrative scenarios <em>explicitly enumerate</em> all possible execution paths.
      </div>
    </div>
  );
};

const Step2CanvasPlusScenarios: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">CANVAS + SCENARIOS = COMPLETE SPECIFICATION</text>

        {/* Canvas defines structure */}
        <g>
          <rect x="40" y="50" width="240" height="100" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="160" y="70" textAnchor="middle" fill="#dbeafe" fontSize="11" fontWeight="600">CANVAS (Architecture)</text>

          <rect x="55" y="85" width="210" height="55" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="65" y="100" fill="#bfdbfe" fontSize="8">Defines WHAT can happen:</text>
          <text x="70" y="113" fill="#93c5fd" fontSize="8">• Nodes: UserAPI, UserService, DB</text>
          <text x="70" y="125" fill="#93c5fd" fontSize="8">• Events: user.created, user.exists</text>
          <text x="70" y="137" fill="#93c5fd" fontSize="8">• Edges: API → Service → DB</text>
        </g>

        {/* Plus */}
        <text x="300" y="105" textAnchor="middle" fill="#10b981" fontSize="24" fontWeight="700">+</text>

        {/* Scenarios define outcomes */}
        <g>
          <rect x="320" y="50" width="240" height="100" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="440" y="70" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">SCENARIOS (Outcomes)</text>

          <rect x="335" y="85" width="210" height="55" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="345" y="100" fill="#a7f3d0" fontSize="8">Defines HOW it happens:</text>
          <text x="350" y="113" fill="#6ee7b7" fontSize="8">• Success: user.created emitted</text>
          <text x="350" y="125" fill="#6ee7b7" fontSize="8">• Duplicate: user.exists emitted</text>
          <text x="350" y="137" fill="#6ee7b7" fontSize="8">• Error: validation.failed emitted</text>
        </g>

        {/* Result */}
        <g>
          <rect x="40" y="170" width="520" height="95" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="190" textAnchor="middle" fill="#ddd6fe" fontSize="12" fontWeight="600">COMPLETE FUNCTIONAL SPECIFICATION</text>

          <rect x="55" y="200" width="490" height="55" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="65" y="215" fill="#e9d5ff" fontSize="9">Canvas + Scenarios = Exhaustive enumeration of system behavior</text>
          <text x="70" y="230" fill="#ddd6fe" fontSize="8">• Canvas: "User registration involves API, Service, DB"</text>
          <text x="70" y="242" fill="#ddd6fe" fontSize="8">• Scenarios: "Can succeed, fail (duplicate), fail (invalid), fail (db error)"</text>
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
        <strong style={{ color: '#3b82f6' }}>Canvas</strong> defines the architectural components. <strong style={{ color: '#10b981' }}>Scenarios</strong> enumerate all possible outcomes. Together = complete specification.
      </div>
    </div>
  );
};

const Step3ScenarioConditions: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">SCENARIO CONDITIONS: HOW VALIDATION WORKS</text>

        {/* OTEL Trace comes in */}
        <g>
          <rect x="40" y="50" width="180" height="95" fill="#451a03" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="130" y="70" textAnchor="middle" fill="#fef3c7" fontSize="11" fontWeight="600">OTEL TRACE</text>

          <rect x="55" y="80" width="150" height="55" fill="#422006" stroke="#ea580c" strokeWidth="1" rx="3" />
          <text x="65" y="95" fill="#fde68a" fontSize="8">Runtime execution:</text>
          <text x="70" y="108" fill="#fbbf24" fontSize="8">events: [</text>
          <text x="75" y="120" fill="#f59e0b" fontSize="8" fontWeight="bold">  user.exists</text>
          <text x="70" y="132" fill="#fbbf24" fontSize="8">]</text>
        </g>

        {/* Arrow */}
        <line x1="225" y1="97" x2="255" y2="97" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-validate)" />
        <text x="240" y="87" textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="600">match</text>

        {/* Scenarios */}
        <g>
          <rect x="260" y="50" width="300" height="240" fill="#0f172a" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="410" y="70" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">NARRATIVE SCENARIOS</text>

          {/* Scenario 1 - Not matched */}
          <rect x="275" y="80" width="270" height="40" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="3" />
          <text x="285" y="95" fill="#94a3b8" fontSize="8" fontWeight="600">success:</text>
          <text x="290" y="107" fill="#64748b" fontSize="7">condition: event = "user.created"</text>
          <text x="290" y="117" fill="#64748b" fontSize="7">✗ Does NOT match trace</text>

          {/* Scenario 2 - MATCHED! */}
          <rect x="275" y="128" width="270" height="40" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="3" />
          <text x="285" y="143" fill="#6ee7b7" fontSize="8" fontWeight="600">duplicate:</text>
          <text x="290" y="155" fill="#a7f3d0" fontSize="7">condition: event = "user.exists"</text>
          <text x="290" y="165" fill="#34d399" fontSize="7" fontWeight="bold">✓ MATCHES! Use this scenario</text>

          {/* Scenario 3 - Not matched */}
          <rect x="275" y="176" width="270" height="40" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="3" />
          <text x="285" y="191" fill="#94a3b8" fontSize="8" fontWeight="600">invalid-email:</text>
          <text x="290" y="203" fill="#64748b" fontSize="7">condition: event = "validation.failed"</text>
          <text x="290" y="213" fill="#64748b" fontSize="7">✗ Does NOT match trace</text>

          {/* Scenario 4 - Not matched */}
          <rect x="275" y="224" width="270" height="40" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="3" />
          <text x="285" y="239" fill="#94a3b8" fontSize="8" fontWeight="600">db-error:</text>
          <text x="290" y="251" fill="#64748b" fontSize="7">condition: event = "database.error"</text>
          <text x="290" y="261" fill="#64748b" fontSize="7">✗ Does NOT match trace</text>
        </g>

        <defs>
          <marker id="arrow-validate" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        <strong style={{ color: '#8b5cf6' }}>Validation:</strong> OTEL trace is matched against scenario conditions. The first matching scenario determines which workflow template to use and validates expected behavior.
      </div>
    </div>
  );
};

const Step4ExhaustiveEnumeration: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">EXHAUSTIVE ENUMERATION EXAMPLE</text>

        {/* User Registration Canvas + Scenarios */}
        <g>
          <rect x="40" y="45" width="520" height="260" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="300" y="65" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="600">user-registration.workflow.json</text>

          {/* Canvas reference */}
          <rect x="55" y="75" width="490" height="25" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="3" />
          <text x="65" y="90" fill="#dbeafe" fontSize="8" fontFamily="monospace">canvas: "./user-registration.otel.canvas"</text>

          {/* All scenarios enumerated */}
          <rect x="55" y="110" width="490" height="185" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" rx="3" />
          <text x="65" y="125" fill="#6ee7b7" fontSize="9" fontWeight="600">scenarios: [</text>

          {/* Scenario 1 */}
          <rect x="70" y="135" width="460" height="25" fill="#064e3b" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="80" y="148" fill="#d1fae5" fontSize="8">1. <tspan fill="#a7f3d0" fontWeight="bold">success</tspan> - condition: event("user.created") → "User registered successfully"</text>

          {/* Scenario 2 */}
          <rect x="70" y="165" width="460" height="25" fill="#064e3b" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="80" y="178" fill="#d1fae5" fontSize="8">2. <tspan fill="#a7f3d0" fontWeight="bold">duplicate</tspan> - condition: event("user.exists") → "User already exists"</text>

          {/* Scenario 3 */}
          <rect x="70" y="195" width="460" height="25" fill="#064e3b" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="80" y="208" fill="#d1fae5" fontSize="8">3. <tspan fill="#a7f3d0" fontWeight="bold">invalid-email</tspan> - condition: event("validation.failed") → "Invalid email format"</text>

          {/* Scenario 4 */}
          <rect x="70" y="225" width="460" height="25" fill="#064e3b" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="80" y="238" fill="#d1fae5" fontSize="8">4. <tspan fill="#a7f3d0" fontWeight="bold">db-error</tspan> - condition: event("database.error") → "Database unavailable"</text>

          {/* Scenario 5 */}
          <rect x="70" y="255" width="460" height="25" fill="#064e3b" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="80" y="268" fill="#d1fae5" fontSize="8">5. <tspan fill="#a7f3d0" fontWeight="bold">rate-limited</tspan> - condition: event("rate.exceeded") → "Too many requests"</text>

          <text x="65" y="290" fill="#6ee7b7" fontSize="9" fontWeight="600">]</text>
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
        Every possible outcome is <strong style={{ color: '#10b981' }}>explicitly enumerated</strong> as a scenario. This creates a complete specification of expected functionality - nothing is implicit!
      </div>
    </div>
  );
};

const Step5ValidationProcess: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">THE VALIDATION PROCESS</text>

        {/* Step 1: Run code */}
        <g>
          <rect x="40" y="50" width="140" height="70" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="110" y="70" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="700">1. EXECUTE</text>
          <text x="48" y="85" fill="#a78bfa" fontSize="8">Run test or</text>
          <text x="48" y="97" fill="#a78bfa" fontSize="8">production code</text>
          <text x="48" y="109" fill="#a78bfa" fontSize="8">with OTEL</text>

          <line x1="185" y1="85" x2="215" y2="85" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow1)" />

          {/* Step 2: Capture trace */}
          <rect x="220" y="50" width="140" height="70" fill="#451a03" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="290" y="70" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="700">2. CAPTURE</text>
          <text x="228" y="85" fill="#fbbf24" fontSize="8">OTEL records</text>
          <text x="228" y="97" fill="#fbbf24" fontSize="8">spans, events,</text>
          <text x="228" y="109" fill="#fbbf24" fontSize="8">attributes</text>

          <line x1="365" y1="85" x2="395" y2="85" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow1)" />

          {/* Step 3: Match scenario */}
          <rect x="400" y="50" width="160" height="70" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="480" y="70" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="700">3. MATCH</text>
          <text x="408" y="85" fill="#93c5fd" fontSize="8">Find scenario</text>
          <text x="408" y="97" fill="#93c5fd" fontSize="8">where condition</text>
          <text x="408" y="109" fill="#93c5fd" fontSize="8">matches trace</text>
        </g>

        {/* Arrow down from step 3 */}
        <line x1="480" y1="125" x2="480" y2="150" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow1)" />

        {/* Branching */}
        <g>
          {/* Scenario matched */}
          <rect x="320" y="155" width="140" height="65" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="390" y="173" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="700">MATCHED ✓</text>
          <text x="328" y="188" fill="#a7f3d0" fontSize="8">Use scenario's</text>
          <text x="328" y="200" fill="#a7f3d0" fontSize="8">workflow template</text>
          <text x="328" y="212" fill="#34d399" fontSize="8" fontWeight="bold">Validation PASSED</text>

          <line x1="315" y1="187" x2="285" y2="187" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow1)" />

          {/* No match */}
          <rect x="475" y="155" width="140" height="65" fill="#7f1d1d" stroke="#dc2626" strokeWidth="2" rx="4" />
          <text x="545" y="173" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="700">NO MATCH ✗</text>
          <text x="483" y="188" fill="#fecaca" fontSize="8">Unexpected</text>
          <text x="483" y="200" fill="#fecaca" fontSize="8">behavior!</text>
          <text x="483" y="212" fill="#ef4444" fontSize="8" fontWeight="bold">Validation FAILED</text>
        </g>

        {/* Result */}
        <g>
          <rect x="40" y="235" width="240" height="55" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" rx="3" />
          <text x="50" y="252" fill="#ddd6fe" fontSize="9" fontWeight="600">Narrative Output:</text>
          <text x="55" y="267" fill="#c4b5fd" fontSize="8">"User registration failed: email</text>
          <text x="55" y="279" fill="#c4b5fd" fontSize="8">already exists (duplicate scenario)"</text>

          <rect x="295" y="235" width="265" height="55" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" rx="3" />
          <text x="305" y="252" fill="#ddd6fe" fontSize="9" fontWeight="600">Validation Ensures:</text>
          <text x="310" y="267" fill="#c4b5fd" fontSize="8">✓ Only expected scenarios happen</text>
          <text x="310" y="279" fill="#c4b5fd" fontSize="8">✓ Each has proper narrative explanation</text>
        </g>

        <defs>
          <marker id="arrow1" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        Execute → Capture → Match scenario. If trace matches an enumerated scenario = <strong style={{ color: '#10b981' }}>validated ✓</strong>. If no match = <strong style={{ color: '#dc2626' }}>unexpected behavior ✗</strong>.
      </div>
    </div>
  );
};

const Step6CompleteExample: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="20" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">COMPLETE EXAMPLE: ORDER PROCESSING</text>

        {/* Canvas defines architecture */}
        <g>
          <rect x="40" y="40" width="250" height="90" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="60" textAnchor="middle" fill="#dbeafe" fontSize="11" fontWeight="600">order-processing.canvas</text>

          <rect x="55" y="70" width="220" height="50" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="65" y="85" fill="#bfdbfe" fontSize="8">Architecture components:</text>
          <text x="70" y="98" fill="#93c5fd" fontSize="8">• OrderAPI → OrderService → DB</text>
          <text x="70" y="110" fill="#93c5fd" fontSize="8">• PaymentService, InventoryService</text>
        </g>

        {/* Arrow */}
        <text x="300" y="85" textAnchor="middle" fill="#10b981" fontSize="20" fontWeight="700">+</text>

        {/* Scenarios enumerate outcomes */}
        <g>
          <rect x="310" y="40" width="250" height="90" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="60" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">order-processing.workflow.json</text>

          <rect x="325" y="70" width="220" height="50" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="335" y="85" fill="#a7f3d0" fontSize="8">Enumerated scenarios:</text>
          <text x="340" y="98" fill="#6ee7b7" fontSize="7">1. completed 2. payment-declined</text>
          <text x="340" y="108" fill="#6ee7b7" fontSize="7">3. out-of-stock 4. invalid-order</text>
        </g>

        {/* Real execution */}
        <g>
          <rect x="40" y="145" width="520" height="185" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="165" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">REAL EXECUTION WITH OTEL</text>

          {/* Test case 1 */}
          <rect x="55" y="175" width="240" height="70" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" rx="3" />
          <text x="65" y="190" fill="#6ee7b7" fontSize="9" fontWeight="600">Test: Valid Order</text>
          <text x="70" y="205" fill="#a7f3d0" fontSize="8">Events: order.created,</text>
          <text x="70" y="217" fill="#a7f3d0" fontSize="8">        payment.processed,</text>
          <text x="70" y="229" fill="#a7f3d0" fontSize="8">        order.completed</text>
          <text x="70" y="241" fill="#34d399" fontSize="8" fontWeight="bold">✓ Matches "completed" scenario</text>

          {/* Test case 2 */}
          <rect x="305" y="175" width="240" height="70" fill="#1e293b" stroke="#dc2626" strokeWidth="1.5" rx="3" />
          <text x="315" y="190" fill="#fca5a5" fontSize="9" fontWeight="600">Test: Insufficient Stock</text>
          <text x="320" y="205" fill="#fecaca" fontSize="8">Events: order.created,</text>
          <text x="320" y="217" fill="#fecaca" fontSize="8">        inventory.insufficient</text>
          <text x="320" y="241" fill="#34d399" fontSize="8" fontWeight="bold">✓ Matches "out-of-stock" scenario</text>

          {/* Unexpected case */}
          <rect x="55" y="255" width="490" height="65" fill="#7f1d1d" stroke="#991b1b" strokeWidth="2" rx="3" />
          <text x="65" y="270" fill="#fca5a5" fontSize="9" fontWeight="600">Production: Unexpected Event</text>
          <text x="70" y="285" fill="#fecaca" fontSize="8">Events: order.created, payment.processed, shipping.failed,</text>
          <text x="70" y="297" fill="#fecaca" fontSize="8">        email.service.down</text>
          <text x="70" y="312" fill="#ef4444" fontSize="8" fontWeight="bold">✗ NO SCENARIO MATCHES! Drift detected - update narrative to add "shipping-failed" scenario</text>
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
        Scenarios create a <strong style={{ color: '#10b981' }}>checklist of expected behavior</strong>. Each execution either matches a scenario (validated ✓) or reveals <strong style={{ color: '#dc2626' }}>missing coverage</strong> (add new scenario!).
      </div>
    </div>
  );
};

const Step7Benefits: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">WHY SCENARIO ENUMERATION MATTERS</text>

        {/* Traditional approach problems */}
        <g>
          <rect x="40" y="50" width="250" height="115" fill="#450a0a" stroke="#dc2626" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="600">WITHOUT ENUMERATION</text>

          <rect x="55" y="80" width="220" height="75" fill="#7f1d1d" stroke="#991b1b" strokeWidth="1" rx="3" />
          <text x="65" y="95" fill="#fecaca" fontSize="8">❌ Implicit expectations</text>
          <text x="65" y="108" fill="#fecaca" fontSize="8">❌ Edge cases forgotten</text>
          <text x="65" y="121" fill="#fecaca" fontSize="8">❌ No complete specification</text>
          <text x="65" y="134" fill="#fecaca" fontSize="8">❌ Unknown unknowns</text>
          <text x="65" y="147" fill="#fecaca" fontSize="8">❌ Hard to know coverage</text>
        </g>

        {/* Scenario enumeration benefits */}
        <g>
          <rect x="310" y="50" width="250" height="115" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">WITH ENUMERATION</text>

          <rect x="325" y="80" width="220" height="75" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="335" y="95" fill="#d1fae5" fontSize="8">✓ Explicit expectations</text>
          <text x="335" y="108" fill="#d1fae5" fontSize="8">✓ Edge cases documented</text>
          <text x="335" y="121" fill="#d1fae5" fontSize="8">✓ Complete specification</text>
          <text x="335" y="134" fill="#d1fae5" fontSize="8">✓ Known knowns enumerated</text>
          <text x="335" y="147" fill="#d1fae5" fontSize="8">✓ Clear coverage metrics</text>
        </g>

        {/* Key benefits */}
        <g>
          <rect x="40" y="185" width="520" height="105" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="205" textAnchor="middle" fill="#ddd6fe" fontSize="12" fontWeight="600">POWERFUL COMBINATION</text>

          <text x="50" y="225" fill="#c4b5fd" fontSize="9">1. <tspan fill="#3b82f6" fontWeight="bold">Canvas</tspan> + <tspan fill="#10b981" fontWeight="bold">Scenarios</tspan> = Complete functional specification</text>
          <text x="50" y="242" fill="#c4b5fd" fontSize="9">2. Every possible outcome is <tspan fill="#6ee7b7" fontWeight="bold">explicitly enumerated and documented</tspan></text>
          <text x="50" y="259" fill="#c4b5fd" fontSize="9">3. Validation ensures <tspan fill="#34d399" fontWeight="bold">only expected scenarios occur</tspan></text>
          <text x="50" y="276" fill="#c4b5fd" fontSize="9">4. Unexpected behavior = <tspan fill="#f59e0b" fontWeight="bold">immediate feedback</tspan> to update specification</text>
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
        <strong style={{ color: '#8b5cf6' }}>Scenario enumeration</strong> transforms implicit test expectations into an <strong style={{ color: '#10b981' }}>explicit, complete specification</strong> of all possible system behaviors.
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'problem', title: 'The Enumeration Problem', component: Step1TheEnumerationProblem },
  { id: 'together', title: 'Canvas + Scenarios = Complete Spec', component: Step2CanvasPlusScenarios },
  { id: 'conditions', title: 'How Scenario Conditions Work', component: Step3ScenarioConditions },
  { id: 'exhaustive', title: 'Exhaustive Enumeration Example', component: Step4ExhaustiveEnumeration },
  { id: 'validation', title: 'The Validation Process', component: Step5ValidationProcess },
  { id: 'example', title: 'Complete Example: Order Processing', component: Step6CompleteExample },
  { id: 'benefits', title: 'Why This Matters', component: Step7Benefits },
];

export const ScenarioEnumerationExplainerPanel: React.FC<ScenarioEnumerationExplainerPanelProps> = ({ className }) => {
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
          Scenario Enumeration Guide
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          Learn how workflow scenarios enumerate all expected functionality and validate against runtime behavior
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
          Key Takeaway
        </h3>
        <p style={{ color: theme.colors.textSecondary, marginBottom: '16px', fontSize: '14px' }}>
          Scenario enumeration transforms implicit expectations into explicit, validated specifications:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#3b82f6' }}>•</span>
            <span style={{ color: theme.colors.textSecondary }}>
              <strong style={{ color: '#3b82f6' }}>Canvas</strong> defines architecture (what components exist)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>•</span>
            <span style={{ color: theme.colors.textSecondary }}>
              <strong style={{ color: '#10b981' }}>Scenarios</strong> enumerate outcomes (how they behave)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#8b5cf6' }}>•</span>
            <span style={{ color: theme.colors.textSecondary }}>
              <strong style={{ color: '#8b5cf6' }}>Validation</strong> ensures only enumerated scenarios occur
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#f59e0b' }}>•</span>
            <span style={{ color: theme.colors.textSecondary }}>
              <strong style={{ color: '#f59e0b' }}>Unexpected behavior</strong> reveals missing scenarios
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioEnumerationExplainerPanel;
