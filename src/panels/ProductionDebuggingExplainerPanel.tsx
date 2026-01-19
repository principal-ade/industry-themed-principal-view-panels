import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface ProductionDebuggingExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1TheScenario: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">PRODUCTION ISSUE: WHERE DO WE START?</text>

        {/* Alert */}
        <g>
          <rect x="150" y="50" width="300" height="80" fill="#7f1d1d" stroke="#ef4444" strokeWidth="3" rx="6" />
          <text x="300" y="75" textAnchor="middle" fill="#fecaca" fontSize="12" fontWeight="700">🚨 ALERT: Checkout Flow Failing</text>
          <text x="160" y="95" fill="#fca5a5" fontSize="9">Error rate: 15% (normally 0.1%)</text>
          <text x="160" y="110" fill="#fca5a5" fontSize="9">Latency: 8.5s (normally 1.2s)</text>
          <text x="160" y="122" fill="#ef4444" fontSize="9" fontWeight="bold">Started: 2:47 PM</text>
        </g>

        {/* The problem */}
        <g>
          <rect x="40" y="145" width="520" height="120" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="165" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">THE DEBUGGING CHALLENGE</text>

          <text x="50" y="185" fill="#cbd5e1" fontSize="9">The checkout flow touches many components:</text>
          <text x="60" y="202" fill="#fbbf24" fontSize="8">• API Layer: Authentication, rate limiting, request validation</text>
          <text x="60" y="215" fill="#fbbf24" fontSize="8">• Business Logic: User validation, order creation, inventory checks</text>
          <text x="60" y="228" fill="#fbbf24" fontSize="8">• Data Access: User DB, orders DB, inventory DB, cache layer</text>
          <text x="60" y="241" fill="#fbbf24" fontSize="8">• External Services: Payment gateway, fraud detection, email service</text>

          <text x="50" y="258" fill="#f59e0b" fontSize="9" fontWeight="bold">Without structure: Where do you even start looking?</text>
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
        Production issues in complex systems are hard to debug because they span <strong style={{ color: '#f59e0b' }}>many layers and components</strong>. Where do you start?
      </div>
    </div>
  );
};

const Step2MatchToCanvas: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">STEP 1: MATCH PRODUCTION TRACE TO CANVAS HIERARCHY</text>

        {/* Production trace */}
        <g>
          <rect x="40" y="50" width="240" height="255" fill="#0f172a" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="160" y="70" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="600">Production Trace (FAILED)</text>
          <text x="50" y="85" fill="#fbbf24" fontSize="8">trace_id: prod-error-abc123</text>

          <rect x="55" y="95" width="210" height="150" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="3" />

          {/* Root span - OK */}
          <rect x="65" y="105" width="190" height="30" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
          <text x="75" y="120" fill="#ddd6fe" fontSize="8">handleCheckout (8.5s)</text>
          <text x="75" y="130" fill="#a78bfa" fontSize="7">status: ERROR</text>

          {/* Child spans */}
          <rect x="75" y="145" width="85" height="28" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
          <text x="85" y="158" fill="#dbeafe" fontSize="7">API (0.1s)</text>
          <text x="85" y="168" fill="#3b82f6" fontSize="6">✓ OK</text>

          <rect x="75" y="180" width="85" height="28" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="2" />
          <text x="85" y="193" fill="#fecaca" fontSize="7">Business (8.2s)</text>
          <text x="85" y="203" fill="#ef4444" fontSize="6" fontWeight="bold">✗ ERROR</text>

          <rect x="170" y="180" width="75" height="28" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="180" y="193" fill="#94a3b8" fontSize="7">Data (skipped)</text>
          <text x="180" y="203" fill="#64748b" fontSize="6">not reached</text>

          {/* Grandchild - the culprit */}
          <rect x="85" y="215" width="145" height="25" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="2" />
          <text x="95" y="228" fill="#fecaca" fontSize="7">inventoryCheck (8.0s)</text>
          <text x="95" y="237" fill="#ef4444" fontSize="6" fontWeight="bold">TIMEOUT ✗</text>
        </g>

        {/* Arrow to canvas */}
        <line x1="285" y1="170" x2="315" y2="170" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow-green3)" />
        <text x="300" y="160" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">Match spans</text>
        <text x="300" y="173" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">to canvas</text>

        {/* Canvas hierarchy */}
        <g>
          <rect x="320" y="50" width="240" height="255" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="440" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Canvas Hierarchy</text>

          <rect x="335" y="85" width="210" height="160" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />

          {/* Complete flow canvas */}
          <rect x="345" y="95" width="190" height="30" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
          <text x="355" y="110" fill="#ddd6fe" fontSize="8">complete-flow.otel.canvas</text>
          <text x="355" y="120" fill="#a78bfa" fontSize="6">References child canvases</text>

          {/* Child canvases */}
          <rect x="355" y="135" width="80" height="28" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
          <text x="365" y="148" fill="#dbeafe" fontSize="7">api-layer</text>
          <text x="365" y="158" fill="#60a5fa" fontSize="6">.otel.canvas</text>

          <rect x="355" y="170" width="80" height="28" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" rx="2" />
          <text x="365" y="183" fill="#d1fae5" fontSize="7">business-logic</text>
          <text x="365" y="193" fill="#34d399" fontSize="6">.otel.canvas</text>

          <rect x="445" y="170" width="75" height="28" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="455" y="183" fill="#cbd5e1" fontSize="7">data-access</text>
          <text x="455" y="193" fill="#94a3b8" fontSize="6">.otel.canvas</text>

          {/* Specific component in business logic */}
          <rect x="365" y="205" width="145" height="30" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" rx="2" />
          <text x="375" y="218" fill="#d1fae5" fontSize="7">Node: inventoryCheck</text>
          <text x="375" y="229" fill="#6ee7b7" fontSize="6">In business-logic.otel.canvas</text>
        </g>

        <defs>
          <marker id="arrow-green3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        The production trace's spans <strong style={{ color: '#10b981' }}>automatically match</strong> to canvas nodes. The failed span points you to the exact canvas and node where the problem occurred.
      </div>
    </div>
  );
};

const Step3NarrowTheScope: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">STEP 2: NARROW THE SCOPE HIERARCHICALLY</text>

        {/* Elimination process */}
        <g>
          <rect x="40" y="50" width="520" height="235" fill="#0f172a" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">🔍 Hierarchical Elimination</text>

          {/* Level 1: Top level - found the layer */}
          <rect x="60" y="85" width="480" height="55" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="3" />
          <text x="70" y="100" fill="#dbeafe" fontSize="9" fontWeight="600">Level 1: Which Layer?</text>
          <text x="75" y="115" fill="#93c5fd" fontSize="8">✓ API Layer: 0.1s (normal) - <tspan fill="#3b82f6" fontWeight="bold">NOT HERE</tspan></text>
          <text x="75" y="128" fill="#fca5a5" fontSize="8">✗ Business Logic: 8.2s (abnormal) - <tspan fill="#ef4444" fontWeight="bold">PROBLEM IS HERE!</tspan></text>

          {/* Level 2: Within business logic - found the module */}
          <rect x="60" y="150" width="480" height="55" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="3" />
          <text x="70" y="165" fill="#d1fae5" fontSize="9" fontWeight="600">Level 2: Which Business Logic Module?</text>
          <text x="75" y="180" fill="#6ee7b7" fontSize="8">✓ User validation: 0.05s (normal) - <tspan fill="#10b981" fontWeight="bold">NOT HERE</tspan></text>
          <text x="75" y="193" fill="#fca5a5" fontSize="8">✗ Inventory check: 8.0s (abnormal) - <tspan fill="#ef4444" fontWeight="bold">PROBLEM IS HERE!</tspan></text>

          {/* Level 3: Within inventory check - found the operation */}
          <rect x="60" y="215" width="480" height="60" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="3" />
          <text x="70" y="230" fill="#fecaca" fontSize="9" fontWeight="600">Level 3: What Operation in Inventory Check?</text>
          <text x="75" y="245" fill="#fca5a5" fontSize="8">✗ Query inventory DB: TIMEOUT (8.0s) - <tspan fill="#ef4444" fontWeight="bold">ROOT CAUSE!</tspan></text>
          <text x="75" y="258" fill="#fbbf24" fontSize="8">📍 Location: business-logic.otel.canvas → inventoryCheck node</text>
          <text x="75" y="270" fill="#fbbf24" fontSize="8">📍 Code: src/business/inventory.ts:checkAvailability():67</text>
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
        The canvas hierarchy lets you <strong style={{ color: '#10b981' }}>eliminate possibilities layer by layer</strong>: Not API → Business Logic → Not user validation → Inventory check → Database query timeout.
      </div>
    </div>
  );
};

const Step4CompareToExpected: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">STEP 3: COMPARE ACTUAL VS EXPECTED BEHAVIOR</text>

        {/* Expected narrative */}
        <g>
          <rect x="40" y="50" width="250" height="125" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Expected (Narrative)</text>
          <text x="50" y="85" fill="#6ee7b7" fontSize="8">success.narrative.json</text>

          <rect x="55" y="95" width="220" height="70" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="65" y="110" fill="#a7f3d0" fontSize="8" fontWeight="600">Expected Flow:</text>
          <text x="70" y="125" fill="#6ee7b7" fontSize="7">1. user.authenticated (API)</text>
          <text x="70" y="137" fill="#6ee7b7" fontSize="7">2. inventory.checked (Business, ~0.2s)</text>
          <text x="70" y="149" fill="#6ee7b7" fontSize="7">3. order.created (Business)</text>
          <text x="70" y="161" fill="#6ee7b7" fontSize="7">4. payment.processed (Business)</text>
        </g>

        {/* Actual trace */}
        <g>
          <rect x="310" y="50" width="250" height="125" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#fecaca" fontSize="10" fontWeight="600">Actual (Production Trace)</text>
          <text x="320" y="85" fill="#fca5a5" fontSize="8">trace_id: prod-error-abc123</text>

          <rect x="325" y="95" width="220" height="70" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="3" />
          <text x="335" y="110" fill="#fde68a" fontSize="8" fontWeight="600">Actual Flow:</text>
          <text x="340" y="125" fill="#cbd5e1" fontSize="7">1. user.authenticated (API) ✓</text>
          <text x="340" y="137" fill="#ef4444" fontSize="7" fontWeight="bold">2. inventory.checked TIMEOUT (8.0s) ✗</text>
          <text x="340" y="149" fill="#64748b" fontSize="7">3. order.created (not reached)</text>
          <text x="340" y="161" fill="#64748b" fontSize="7">4. payment.processed (not reached)</text>
        </g>

        {/* The divergence */}
        <g>
          <rect x="40" y="190" width="520" height="115" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="210" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">🎯 DIVERGENCE DETECTED</text>

          <rect x="55" y="220" width="490" height="75" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="65" y="235" fill="#e9d5ff" fontSize="9" fontWeight="600">What's Different?</text>
          <text x="70" y="250" fill="#fbbf24" fontSize="8">• Expected: inventory.checked completes in ~0.2s with success event</text>
          <text x="70" y="263" fill="#fbbf24" fontSize="8">• Actual: inventory.checked TIMEOUT after 8.0s, no event emitted</text>
          <text x="70" y="276" fill="#ef4444" fontSize="8" fontWeight="bold">• Root Cause: Database query timeout in inventory check</text>
          <text x="70" y="289" fill="#10b981" fontSize="8" fontWeight="bold">• Next Steps: Check inventory DB health, query performance, connection pool</text>
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
        Narratives define <strong style={{ color: '#10b981' }}>expected behavior</strong>. Comparing the production trace against the narrative shows exactly <strong style={{ color: '#f59e0b' }}>where reality diverged</strong> from expectations.
      </div>
    </div>
  );
};

const Step5DrillDown: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">STEP 4: DRILL DOWN OR ZOOM OUT AS NEEDED</text>

        {/* Zoom controls */}
        <g>
          <rect x="150" y="50" width="300" height="60" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">Canvas Hierarchy = Zoom Levels</text>
          <text x="160" y="88" fill="#c4b5fd" fontSize="8">🔍 Drill down for detail</text>
          <text x="340" y="88" fill="#c4b5fd" fontSize="8">🔭 Zoom out for context</text>
        </g>

        {/* Three zoom levels */}
        <g>
          {/* Zoomed out - complete flow */}
          <rect x="40" y="125" width="160" height="140" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="120" y="145" textAnchor="middle" fill="#ddd6fe" fontSize="9" fontWeight="600">🔭 Zoomed Out</text>
          <text x="50" y="160" fill="#c4b5fd" fontSize="8">complete-flow.otel.canvas</text>

          <rect x="50" y="170" width="140" height="85" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="60" y="185" fill="#e9d5ff" fontSize="7">View: End-to-end checkout</text>
          <text x="65" y="200" fill="#c4b5fd" fontSize="7">See: API → Business → Data</text>
          <text x="60" y="220" fill="#fbbf24" fontSize="7">Useful for:</text>
          <text x="65" y="232" fill="#fbbf24" fontSize="6">• Which layer is slow?</text>
          <text x="65" y="242" fill="#fbbf24" fontSize="6">• Full workflow timing</text>

          {/* Medium zoom - business logic */}
          <rect x="220" y="125" width="160" height="140" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="145" textAnchor="middle" fill="#d1fae5" fontSize="9" fontWeight="600">🔍 Medium Zoom</text>
          <text x="230" y="160" fill="#6ee7b7" fontSize="8">business-logic.otel.canvas</text>

          <rect x="230" y="170" width="140" height="85" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="240" y="185" fill="#a7f3d0" fontSize="7">View: Business logic layer</text>
          <text x="245" y="200" fill="#6ee7b7" fontSize="7">See: User check, inventory,</text>
          <text x="245" y="210" fill="#6ee7b7" fontSize="7">order creation, payment</text>
          <text x="240" y="225" fill="#fbbf24" fontSize="7">Useful for:</text>
          <text x="245" y="237" fill="#fbbf24" fontSize="6">• Which module failed?</text>
          <text x="245" y="247" fill="#fbbf24" fontSize="6">• Module interactions</text>

          {/* Zoomed in - inventory check */}
          <rect x="400" y="125" width="160" height="140" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="480" y="145" textAnchor="middle" fill="#fecaca" fontSize="9" fontWeight="600">🔬 Zoomed In</text>
          <text x="410" y="160" fill="#fca5a5" fontSize="8">inventoryCheck node</text>

          <rect x="410" y="170" width="140" height="85" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="3" />
          <text x="420" y="185" fill="#fde68a" fontSize="7">View: Inventory check detail</text>
          <text x="425" y="200" fill="#cbd5e1" fontSize="7">See: DB query, cache hit/</text>
          <text x="425" y="210" fill="#cbd5e1" fontSize="7">miss, query duration</text>
          <text x="420" y="225" fill="#fbbf24" fontSize="7">Useful for:</text>
          <text x="425" y="237" fill="#fbbf24" fontSize="6">• Exact operation failing</text>
          <text x="425" y="247" fill="#fbbf24" fontSize="6">• Code location</text>
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
        The canvas hierarchy provides <strong style={{ color: '#8b5cf6' }}>zoom levels</strong>: Start zoomed out to identify the layer, then drill down to find the exact operation, or zoom out for full workflow context.
      </div>
    </div>
  );
};

const Step6HistoricalAnalysis: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">STEP 5: HISTORICAL ANALYSIS & PATTERN DETECTION</text>

        {/* Timeline */}
        <g>
          <rect x="40" y="50" width="520" height="235" fill="#0f172a" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">📊 Production Traces Over Time</text>

          {/* Time axis */}
          <line x1="60" y1="100" x2="540" y2="100" stroke="#475569" strokeWidth="2" />
          <text x="60" y="115" textAnchor="middle" fill="#94a3b8" fontSize="7">2:00 PM</text>
          <text x="220" y="115" textAnchor="middle" fill="#94a3b8" fontSize="7">2:30 PM</text>
          <text x="380" y="115" textAnchor="middle" fill="#94a3b8" fontSize="7">3:00 PM</text>
          <text x="540" y="115" textAnchor="middle" fill="#94a3b8" fontSize="7">3:30 PM</text>

          {/* Successful traces (green bars) */}
          <rect x="65" y="80" width="3" height="15" fill="#10b981" />
          <rect x="90" y="82" width="3" height="13" fill="#10b981" />
          <rect x="115" y="81" width="3" height="14" fill="#10b981" />
          <rect x="140" y="83" width="3" height="12" fill="#10b981" />
          <rect x="165" y="80" width="3" height="15" fill="#10b981" />
          <rect x="190" y="82" width="3" height="13" fill="#10b981" />

          {/* Transition to slow (yellow) */}
          <rect x="225" y="75" width="3" height="20" fill="#fbbf24" />
          <rect x="240" y="70" width="3" height="25" fill="#fbbf24" />

          {/* Failed traces (red bars) */}
          <rect x="255" y="50" width="3" height="45" fill="#ef4444" />
          <rect x="270" y="45" width="3" height="50" fill="#ef4444" />
          <rect x="285" y="48" width="3" height="47" fill="#ef4444" />
          <rect x="300" y="46" width="3" height="49" fill="#ef4444" />
          <rect x="315" y="47" width="3" height="48" fill="#ef4444" />
          <rect x="330" y="49" width="3" height="46" fill="#ef4444" />

          {/* Recovery */}
          <rect x="395" y="75" width="3" height="20" fill="#fbbf24" />
          <rect x="420" y="80" width="3" height="15" fill="#10b981" />
          <rect x="445" y="82" width="3" height="13" fill="#10b981" />

          {/* Pattern detection */}
          <rect x="60" y="130" width="480" height="145" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="3" />
          <text x="70" y="145" fill="#cbd5e1" fontSize="9" fontWeight="600">🔍 Pattern Analysis by Canvas Node</text>

          <rect x="75" y="155" width="450" height="40" fill="#064e3b" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="85" y="170" fill="#d1fae5" fontSize="8">✓ API Layer: Healthy throughout (avg 0.1s)</text>
          <text x="85" y="182" fill="#6ee7b7" fontSize="7">All traces matched expected narrative at this layer</text>

          <rect x="75" y="200" width="450" height="40" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" rx="2" />
          <text x="85" y="215" fill="#fecaca" fontSize="8">✗ Business Logic → inventoryCheck: Degraded 2:45-3:15 PM</text>
          <text x="85" y="227" fill="#fca5a5" fontSize="7">Pattern: Database query timeouts, 15% error rate, resolved after DB restart</text>

          <rect x="75" y="245" width="450" height="20" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="85" y="258" fill="#94a3b8" fontSize="7">Data Access: Not reached during failures (downstream of inventoryCheck)</text>
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
        By matching <strong style={{ color: '#8b5cf6' }}>historical production traces</strong> to canvas nodes, you can detect patterns: Which components fail together? When did degradation start? Which layer is the common factor?
      </div>
    </div>
  );
};

const Step7Benefits: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">WHY THIS ACCELERATES DEBUGGING</text>

        {/* Traditional debugging */}
        <g>
          <rect x="40" y="50" width="250" height="130" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#fecaca" fontSize="10" fontWeight="600">❌ Traditional Debugging</text>

          <rect x="55" y="80" width="220" height="90" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="3" />
          <text x="65" y="95" fill="#fca5a5" fontSize="8">Without structured canvases:</text>
          <text x="70" y="110" fill="#cbd5e1" fontSize="7">• Search logs blindly</text>
          <text x="70" y="122" fill="#cbd5e1" fontSize="7">• Check every component manually</text>
          <text x="70" y="134" fill="#cbd5e1" fontSize="7">• No structured elimination</text>
          <text x="70" y="146" fill="#cbd5e1" fontSize="7">• Hard to know what's "normal"</text>
          <text x="70" y="158" fill="#ef4444" fontSize="7" fontWeight="bold">Time to resolution: Hours or days</text>
        </g>

        {/* Canvas-based debugging */}
        <g>
          <rect x="310" y="50" width="250" height="130" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">✅ Canvas-Based Debugging</text>

          <rect x="325" y="80" width="220" height="90" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="335" y="95" fill="#a7f3d0" fontSize="8">With hierarchical canvases:</text>
          <text x="340" y="110" fill="#d1fae5" fontSize="7">• Trace auto-matches to canvas</text>
          <text x="340" y="122" fill="#d1fae5" fontSize="7">• Hierarchical elimination</text>
          <text x="340" y="134" fill="#d1fae5" fontSize="7">• Compare to expected behavior</text>
          <text x="340" y="146" fill="#d1fae5" fontSize="7">• Pattern detection across traces</text>
          <text x="340" y="158" fill="#10b981" fontSize="7" fontWeight="bold">Time to resolution: Minutes</text>
        </g>

        {/* The workflow */}
        <g>
          <rect x="40" y="195" width="520" height="130" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="215" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">⚡ THE DEBUGGING WORKFLOW</text>

          <rect x="55" y="225" width="490" height="90" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="65" y="240" fill="#e9d5ff" fontSize="8" fontWeight="600">When production alert fires:</text>
          <text x="70" y="256" fill="#c4b5fd" fontSize="8">1. Get trace_id from alert → Match to canvas hierarchy</text>
          <text x="70" y="269" fill="#c4b5fd" fontSize="8">2. Failed span points to exact canvas node → Narrow to specific layer/module</text>
          <text x="70" y="282" fill="#c4b5fd" fontSize="8">3. Compare to narrative → See where behavior diverged from expected</text>
          <text x="70" y="295" fill="#c4b5fd" fontSize="8">4. Drill down or zoom out → Get detail or context as needed</text>
          <text x="70" y="308" fill="#10b981" fontSize="8" fontWeight="bold">5. Root cause identified → Fix deployed in minutes instead of hours</text>
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
        Hierarchical canvases turn production debugging from <strong style={{ color: '#ef4444' }}>unstructured log hunting</strong> into <strong style={{ color: '#10b981' }}>systematic problem isolation</strong>—dramatically reducing mean time to resolution.
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'scenario', title: 'The Scenario', component: Step1TheScenario },
  { id: 'match', title: 'Match Trace to Canvas', component: Step2MatchToCanvas },
  { id: 'narrow', title: 'Narrow the Scope', component: Step3NarrowTheScope },
  { id: 'compare', title: 'Compare to Expected', component: Step4CompareToExpected },
  { id: 'zoom', title: 'Drill Down or Zoom Out', component: Step5DrillDown },
  { id: 'historical', title: 'Historical Analysis', component: Step6HistoricalAnalysis },
  { id: 'benefits', title: 'Why This Works', component: Step7Benefits },
];

export const ProductionDebuggingExplainerPanel: React.FC<ProductionDebuggingExplainerPanelProps> = ({ className }) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['scenario']));

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
          Production Debugging with Canvas Hierarchy
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          How hierarchical canvases help you rapidly isolate production issues
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
          Hierarchical canvases transform production debugging from searching through logs to <strong style={{ color: '#10b981' }}>systematic
          problem isolation</strong>: production traces auto-match to canvas nodes, letting you quickly narrow the scope, compare to
          expected behavior, and identify root causes in minutes instead of hours.
        </div>
      </div>
    </div>
  );
};

export default ProductionDebuggingExplainerPanel;
