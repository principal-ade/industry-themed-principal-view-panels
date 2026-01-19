import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface ChangeImpactAnalysisExplainerPanelProps {
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
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">THE CHANGE IMPACT PROBLEM</text>

        {/* Developer scenario */}
        <g>
          <rect x="150" y="50" width="300" height="80" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="75" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">👨‍💻 Developer Question</text>
          <text x="160" y="95" fill="#fbbf24" fontSize="9">"I need to change the inventory check logic.</text>
          <text x="160" y="110" fill="#fbbf24" fontSize="9">What else will break if I change this?"</text>
        </g>

        {/* Unknowns */}
        <g>
          <rect x="40" y="145" width="520" height="120" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="300" y="165" textAnchor="middle" fill="#fecaca" fontSize="11" fontWeight="600">🚨 WITHOUT RUNTIME DATA, YOU'RE GUESSING</text>

          <text x="50" y="185" fill="#fca5a5" fontSize="9">❓ Which workflows depend on inventory check?</text>
          <text x="50" y="200" fill="#fca5a5" fontSize="9">❓ What breaks if inventory check fails or is slow?</text>
          <text x="50" y="215" fill="#fca5a5" fontSize="9">❓ Which other components must work for inventory check to work?</text>
          <text x="50" y="230" fill="#fca5a5" fontSize="9">❓ Is this on the critical path for checkout? For admin? For reporting?</text>
          <text x="50" y="245" fill="#fca5a5" fontSize="9">❓ How many users/requests will be affected?</text>
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
        Static code analysis shows <em>possible</em> dependencies. <strong style={{ color: '#f59e0b' }}>Runtime traces show ACTUAL dependencies</strong> - what really calls what, in production.
      </div>
    </div>
  );
};

const Step2DownstreamEffects: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">DOWNSTREAM EFFECTS: WHAT DEPENDS ON THIS?</text>

        {/* The component being changed */}
        <g>
          <rect x="220" y="50" width="160" height="50" fill="#f59e0b" stroke="#fbbf24" strokeWidth="3" rx="4" />
          <text x="300" y="75" textAnchor="middle" fill="#1e1b4b" fontSize="11" fontWeight="700">🔧 inventoryCheck</text>
          <text x="300" y="90" textAnchor="middle" fill="#422006" fontSize="8">(Component being changed)</text>
        </g>

        {/* Arrows down */}
        <line x1="250" y1="105" x2="120" y2="135" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
        <line x1="300" y1="105" x2="300" y2="135" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
        <line x1="350" y1="105" x2="480" y2="135" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />

        {/* Downstream components */}
        <g>
          <rect x="40" y="140" width="140" height="80" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="110" y="160" textAnchor="middle" fill="#fecaca" fontSize="9" fontWeight="600">Checkout Flow</text>
          <rect x="48" y="168" width="124" height="45" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="55" y="183" fill="#fca5a5" fontSize="7">Impact: HIGH</text>
          <text x="55" y="195" fill="#cbd5e1" fontSize="7">User-facing: Yes</text>
          <text x="55" y="207" fill="#cbd5e1" fontSize="7">Traffic: 10K req/min</text>
        </g>

        <g>
          <rect x="230" y="140" width="140" height="80" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="300" y="160" textAnchor="middle" fill="#fecaca" fontSize="9" fontWeight="600">Order Creation</text>
          <rect x="238" y="168" width="124" height="45" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="245" y="183" fill="#fca5a5" fontSize="7">Impact: HIGH</text>
          <text x="245" y="195" fill="#cbd5e1" fontSize="7">User-facing: Yes</text>
          <text x="245" y="207" fill="#cbd5e1" fontSize="7">Traffic: 8K req/min</text>
        </g>

        <g>
          <rect x="420" y="140" width="140" height="80" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="490" y="160" textAnchor="middle" fill="#fef3c7" fontSize="9" fontWeight="600">Admin Reports</text>
          <rect x="428" y="168" width="124" height="45" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="435" y="183" fill="#fbbf24" fontSize="7">Impact: MEDIUM</text>
          <text x="435" y="195" fill="#cbd5e1" fontSize="7">User-facing: No</text>
          <text x="435" y="207" fill="#cbd5e1" fontSize="7">Traffic: 10 req/min</text>
        </g>

        {/* How we know */}
        <g>
          <rect x="40" y="235" width="520" height="90" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="255" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">📊 HOW WE KNOW (from OTEL traces)</text>

          <rect x="55" y="265" width="490" height="50" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="65" y="280" fill="#a7f3d0" fontSize="8" fontWeight="600">From production traces, we see:</text>
          <text x="70" y="295" fill="#6ee7b7" fontSize="8">• 10,000 traces/min where inventoryCheck span is child of checkoutFlow span</text>
          <text x="70" y="307" fill="#6ee7b7" fontSize="8">• 8,000 traces/min where inventoryCheck span is child of createOrder span</text>
        </g>

        <defs>
          <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
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
        <strong style={{ color: '#ef4444' }}>Downstream effects</strong>: Look at OTEL traces to find spans that are <em>children</em> of this component. These workflows depend on this component working correctly.
      </div>
    </div>
  );
};

const Step3UpstreamRequirements: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">UPSTREAM REQUIREMENTS: WHAT DOES THIS NEED?</text>

        {/* Upstream components */}
        <g>
          <rect x="40" y="50" width="140" height="80" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="110" y="70" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="600">User Validation</text>
          <rect x="48" y="78" width="124" height="45" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="2" />
          <text x="55" y="93" fill="#93c5fd" fontSize="7">Required: ALWAYS</text>
          <text x="55" y="105" fill="#cbd5e1" fontSize="7">Must complete first</text>
          <text x="55" y="117" fill="#cbd5e1" fontSize="7">Failure rate: 0.1%</text>
        </g>

        <g>
          <rect x="230" y="50" width="140" height="80" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="600">Product Exists</text>
          <rect x="238" y="78" width="124" height="45" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="2" />
          <text x="245" y="93" fill="#93c5fd" fontSize="7">Required: ALWAYS</text>
          <text x="245" y="105" fill="#cbd5e1" fontSize="7">Must complete first</text>
          <text x="245" y="117" fill="#cbd5e1" fontSize="7">Failure rate: 0.05%</text>
        </g>

        <g>
          <rect x="420" y="50" width="140" height="80" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="490" y="70" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="600">Database Available</text>
          <rect x="428" y="78" width="124" height="45" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="2" />
          <text x="435" y="93" fill="#93c5fd" fontSize="7">Required: ALWAYS</text>
          <text x="435" y="105" fill="#cbd5e1" fontSize="7">Direct dependency</text>
          <text x="435" y="117" fill="#cbd5e1" fontSize="7">Avg latency: 15ms</text>
        </g>

        {/* Arrows down */}
        <line x1="110" y1="135" x2="250" y2="165" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-blue2)" />
        <line x1="300" y1="135" x2="300" y2="165" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-blue2)" />
        <line x1="490" y1="135" x2="350" y2="165" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-blue2)" />

        {/* The component */}
        <g>
          <rect x="220" y="170" width="160" height="50" fill="#f59e0b" stroke="#fbbf24" strokeWidth="3" rx="4" />
          <text x="300" y="195" textAnchor="middle" fill="#1e1b4b" fontSize="11" fontWeight="700">🔧 inventoryCheck</text>
          <text x="300" y="210" textAnchor="middle" fill="#422006" fontSize="8">(Component being changed)</text>
        </g>

        {/* How we know */}
        <g>
          <rect x="40" y="235" width="520" height="90" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="255" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">📊 HOW WE KNOW (from OTEL traces)</text>

          <rect x="55" y="265" width="490" height="50" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="65" y="280" fill="#a7f3d0" fontSize="8" fontWeight="600">From production traces, we see:</text>
          <text x="70" y="295" fill="#6ee7b7" fontSize="8">• 100% of inventoryCheck spans have validateUser as parent or ancestor</text>
          <text x="70" y="307" fill="#6ee7b7" fontSize="8">• 100% of inventoryCheck spans have productExists completed before them</text>
        </g>

        <defs>
          <marker id="arrow-blue2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        <strong style={{ color: '#3b82f6' }}>Upstream requirements</strong>: Look at OTEL traces to find spans that are <em>parents</em> or <em>ancestors</em> of this component. These must work for this component to be reached.
      </div>
    </div>
  );
};

const Step4CriticalPathAnalysis: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">CRITICAL PATH ANALYSIS</text>

        {/* Trace showing critical path */}
        <g>
          <rect x="40" y="50" width="520" height="255" fill="#0f172a" stroke="#64748b" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="600">Production Trace: Checkout Flow (1200ms total)</text>

          {/* Timeline */}
          <line x1="60" y1="100" x2="540" y2="100" stroke="#475569" strokeWidth="2" />

          {/* Spans */}
          <rect x="70" y="85" width="80" height="30" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" rx="2" />
          <text x="110" y="103" textAnchor="middle" fill="#dbeafe" fontSize="7">validateUser</text>
          <text x="110" y="112" textAnchor="middle" fill="#93c5fd" fontSize="6">100ms</text>

          <rect x="160" y="85" width="160" height="30" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="2" />
          <text x="240" y="103" textAnchor="middle" fill="#fecaca" fontSize="7" fontWeight="bold">inventoryCheck</text>
          <text x="240" y="112" textAnchor="middle" fill="#fca5a5" fontSize="6" fontWeight="bold">800ms (67%!)</text>

          <rect x="330" y="85" width="120" height="30" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" rx="2" />
          <text x="390" y="103" textAnchor="middle" fill="#d1fae5" fontSize="7">processPayment</text>
          <text x="390" y="112" textAnchor="middle" fill="#6ee7b7" fontSize="6">200ms</text>

          <rect x="460" y="85" width="60" height="30" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="1.5" rx="2" />
          <text x="490" y="103" textAnchor="middle" fill="#ddd6fe" fontSize="7">confirm</text>
          <text x="490" y="112" textAnchor="middle" fill="#c4b5fd" fontSize="6">100ms</text>

          {/* Critical path highlight */}
          <rect x="55" y="130" width="490" height="30" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="3" />
          <text x="300" y="148" textAnchor="middle" fill="#fecaca" fontSize="9" fontWeight="600">⚠️ CRITICAL PATH: inventoryCheck is the bottleneck (67% of total time)</text>

          {/* Impact analysis */}
          <rect x="60" y="175" width="480" height="120" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="3" />
          <text x="70" y="190" fill="#cbd5e1" fontSize="9" fontWeight="600">Change Impact Analysis:</text>

          <text x="75" y="210" fill="#fca5a5" fontSize="8">❌ If inventoryCheck gets 10% SLOWER (880ms):</text>
          <text x="85" y="223" fill="#fbbf24" fontSize="7">→ Total checkout time: 1200ms → 1280ms (6.7% slower)</text>
          <text x="85" y="235" fill="#fbbf24" fontSize="7">→ Impact: HIGH (on critical path, user-facing)</text>

          <text x="75" y="253" fill="#6ee7b7" fontSize="8">✅ If inventoryCheck gets 50% FASTER (400ms):</text>
          <text x="85" y="266" fill="#10b981" fontSize="7">→ Total checkout time: 1200ms → 800ms (33% faster!)</text>
          <text x="85" y="278" fill="#10b981" fontSize="7">→ Impact: HIGH (major performance win)</text>
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
        <strong style={{ color: '#ef4444' }}>Critical path analysis</strong>: OTEL traces show which components consume the most time. Changes to bottleneck components have outsized impact on total latency.
      </div>
    </div>
  );
};

const Step5BlastRadius: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">CALCULATING BLAST RADIUS</text>

        {/* Metrics */}
        <g>
          <rect x="40" y="50" width="520" height="235" fill="#0f172a" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#fecaca" fontSize="11" fontWeight="600">🎯 Blast Radius for inventoryCheck Change</text>

          {/* Traffic impact */}
          <rect x="60" y="85" width="240" height="80" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="3" />
          <text x="180" y="105" textAnchor="middle" fill="#fecaca" fontSize="9" fontWeight="600">Traffic Impact</text>
          <rect x="70" y="113" width="220" height="45" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="80" y="128" fill="#fca5a5" fontSize="8">Traces using this component:</text>
          <text x="85" y="141" fill="#fbbf24" fontSize="7">18,000 requests/minute</text>
          <text x="85" y="153" fill="#fbbf24" fontSize="7">1.08M requests/hour</text>

          {/* User impact */}
          <rect x="320" y="85" width="220" height="80" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="3" />
          <text x="430" y="105" textAnchor="middle" fill="#fef3c7" fontSize="9" fontWeight="600">User Impact</text>
          <rect x="330" y="113" width="200" height="45" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="2" />
          <text x="340" y="128" fill="#fde68a" fontSize="8">Affected workflows:</text>
          <text x="345" y="141" fill="#fbbf24" fontSize="7">• Checkout (user-facing)</text>
          <text x="345" y="153" fill="#fbbf24" fontSize="7">• Order creation (user-facing)</text>

          {/* Downstream services */}
          <rect x="60" y="180" width="240" height="95" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="3" />
          <text x="180" y="200" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="600">Downstream Services</text>
          <rect x="70" y="208" width="220" height="60" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="2" />
          <text x="80" y="223" fill="#93c5fd" fontSize="8">Services that depend on this:</text>
          <text x="85" y="236" fill="#cbd5e1" fontSize="7">• Payment Service</text>
          <text x="85" y="248" fill="#cbd5e1" fontSize="7">• Notification Service</text>
          <text x="85" y="260" fill="#cbd5e1" fontSize="7">• Analytics Service</text>

          {/* Failure scenarios */}
          <rect x="320" y="180" width="220" height="95" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="3" />
          <text x="430" y="200" textAnchor="middle" fill="#ddd6fe" fontSize="9" fontWeight="600">Failure Scenarios</text>
          <rect x="330" y="208" width="200" height="60" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" rx="2" />
          <text x="340" y="223" fill="#c4b5fd" fontSize="8">If this fails:</text>
          <text x="345" y="236" fill="#cbd5e1" fontSize="7">• Checkout fails immediately</text>
          <text x="345" y="248" fill="#cbd5e1" fontSize="7">• Orders cannot be created</text>
          <text x="345" y="260" fill="#cbd5e1" fontSize="7">• Revenue loss: ~$30K/hour</text>
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
        <strong style={{ color: '#ef4444' }}>Blast radius</strong>: Aggregate production traces to quantify traffic volume, user impact, downstream dependencies, and failure scenarios for a component change.
      </div>
    </div>
  );
};

const Step6ChangeSimulation: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">"WHAT IF" CHANGE SIMULATION</text>

        {/* Simulation scenarios */}
        <g>
          <rect x="40" y="50" width="520" height="275" fill="#0f172a" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">Simulate Different Change Scenarios</text>

          {/* Scenario 1: Performance change */}
          <rect x="60" y="85" width="480" height="55" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="3" />
          <text x="70" y="103" fill="#dbeafe" fontSize="9" fontWeight="600">Scenario 1: Optimize inventoryCheck (800ms → 400ms)</text>
          <text x="75" y="118" fill="#93c5fd" fontSize="8">Impact on checkout: 1200ms → 800ms (33% faster) ✓</text>
          <text x="75" y="130" fill="#93c5fd" fontSize="8">Impact on order creation: 900ms → 500ms (44% faster) ✓</text>

          {/* Scenario 2: Add caching */}
          <rect x="60" y="150" width="480" height="55" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="3" />
          <text x="70" y="168" fill="#d1fae5" fontSize="9" fontWeight="600">Scenario 2: Add caching layer (cache hit rate: 80%)</text>
          <text x="75" y="183" fill="#6ee7b7" fontSize="8">Cache hit: 800ms → 50ms | Cache miss: 800ms (unchanged)</text>
          <text x="75" y="195" fill="#6ee7b7" fontSize="8">Weighted avg: 80% × 50ms + 20% × 800ms = 200ms (75% improvement) ✓✓</text>

          {/* Scenario 3: Failure */}
          <rect x="60" y="215" width="480" height="55" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="3" />
          <text x="70" y="233" fill="#fecaca" fontSize="9" fontWeight="600">Scenario 3: inventoryCheck starts failing 5% of the time</text>
          <text x="75" y="248" fill="#fca5a5" fontSize="8">Checkout failure rate: 0.1% → 5.1% (51× worse!) ✗</text>
          <text x="75" y="260" fill="#fca5a5" fontSize="8">Affected users: 900 failed checkouts/hour → Revenue impact: $27K/hour ✗</text>

          {/* Scenario 4: Removal */}
          <rect x="60" y="280" width="480" height="35" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="3" />
          <text x="70" y="298" fill="#ddd6fe" fontSize="9" fontWeight="600">Scenario 4: Remove inventoryCheck entirely</text>
          <text x="75" y="310" fill="#c4b5fd" fontSize="8">Breaks: Checkout ✗, Order Creation ✗ | Requires: Redesign of 2 workflows</text>
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
        Use historical trace data to <strong style={{ color: '#10b981' }}>simulate "what if" scenarios</strong>: What if this gets faster? Slower? Fails? Gets removed? Real data gives real impact estimates.
      </div>
    </div>
  );
};

const Step7Benefits: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">WHY RUNTIME DEPENDENCY ANALYSIS MATTERS</text>

        {/* Static vs Runtime */}
        <g>
          <rect x="40" y="50" width="250" height="90" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">Static Analysis</text>
          <rect x="50" y="78" width="230" height="55" fill="#0f172a" stroke="#475569" strokeWidth="1" rx="2" />
          <text x="60" y="93" fill="#94a3b8" fontSize="8">Shows: Possible dependencies</text>
          <text x="60" y="106" fill="#94a3b8" fontSize="8">Limited to: Code structure</text>
          <text x="60" y="119" fill="#94a3b8" fontSize="8">Misses: Runtime paths, frequency</text>
        </g>

        <g>
          <rect x="310" y="50" width="250" height="90" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Runtime Analysis</text>
          <rect x="320" y="78" width="230" height="55" fill="#022c22" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="330" y="93" fill="#6ee7b7" fontSize="8">Shows: ACTUAL dependencies</text>
          <text x="330" y="106" fill="#6ee7b7" fontSize="8">Includes: Traffic, latency, failures</text>
          <text x="330" y="119" fill="#6ee7b7" fontSize="8">Quantifies: Blast radius, impact</text>
        </g>

        {/* Key benefits */}
        <g>
          <rect x="40" y="155" width="250" height="75" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="175" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">Data-Driven Decisions</text>
          <text x="50" y="193" fill="#93c5fd" fontSize="8">✓ Know before you change</text>
          <text x="50" y="206" fill="#93c5fd" fontSize="8">✓ Quantify risk & impact</text>
          <text x="50" y="219" fill="#93c5fd" fontSize="8">✓ Prioritize optimization work</text>
        </g>

        <g>
          <rect x="310" y="155" width="250" height="75" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="175" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Prevent Surprises</text>
          <text x="320" y="193" fill="#6ee7b7" fontSize="8">✓ Identify critical paths</text>
          <text x="320" y="206" fill="#6ee7b7" fontSize="8">✓ Find hidden dependencies</text>
          <text x="320" y="219" fill="#6ee7b7" fontSize="8">✓ Avoid production incidents</text>
        </g>

        <g>
          <rect x="40" y="245" width="250" height="75" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="265" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">Architecture Evolution</text>
          <text x="50" y="283" fill="#c4b5fd" fontSize="8">✓ Safely refactor</text>
          <text x="50" y="296" fill="#c4b5fd" fontSize="8">✓ Validate migrations</text>
          <text x="50" y="309" fill="#c4b5fd" fontSize="8">✓ Measure improvements</text>
        </g>

        <g>
          <rect x="310" y="245" width="250" height="75" fill="#713f12" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="435" y="265" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="600">Team Communication</text>
          <text x="320" y="283" fill="#fde68a" fontSize="8">✓ Show impact to stakeholders</text>
          <text x="320" y="296" fill="#fde68a" fontSize="8">✓ Coordinate cross-team work</text>
          <text x="320" y="309" fill="#fde68a" fontSize="8">✓ Objective risk assessment</text>
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
        Runtime dependency analysis transforms "I think this might affect X" into <strong style={{ color: '#10b981' }}>"This affects 18K requests/min across checkout and order creation, and is on the critical path"</strong>—from guesses to data.
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'problem', title: 'The Change Impact Problem', component: Step1TheProblem },
  { id: 'downstream', title: 'Downstream Effects', component: Step2DownstreamEffects },
  { id: 'upstream', title: 'Upstream Requirements', component: Step3UpstreamRequirements },
  { id: 'criticalpath', title: 'Critical Path Analysis', component: Step4CriticalPathAnalysis },
  { id: 'blastradius', title: 'Blast Radius', component: Step5BlastRadius },
  { id: 'simulation', title: 'Change Simulation', component: Step6ChangeSimulation },
  { id: 'benefits', title: 'Why It Matters', component: Step7Benefits },
];

export const ChangeImpactAnalysisExplainerPanel: React.FC<ChangeImpactAnalysisExplainerPanelProps> = ({ className }) => {
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
          Change Impact Analysis
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          Using OTEL traces to understand downstream effects and upstream requirements
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
          OTEL traces reveal actual runtime dependencies—what calls what, how often, how long, and what fails when.
          This transforms change impact analysis from guesswork into data-driven decision making with quantified blast radius.
        </div>
      </div>
    </div>
  );
};

export default ChangeImpactAnalysisExplainerPanel;
