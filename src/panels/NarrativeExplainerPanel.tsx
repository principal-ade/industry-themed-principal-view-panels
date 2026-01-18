import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface NarrativeExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1WhatIsNarrative: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 200" style={{ width: '100%', height: 'auto' }}>
        {/* Raw OTEL Data */}
        <g>
          <rect x="20" y="35" width="170" height="130" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="105" y="55" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">RAW OTEL DATA</text>
          <text x="30" y="77" fill="#64748b" fontSize="10" fontFamily="monospace">span: "ProcessOrder"</text>
          <text x="30" y="94" fill="#64748b" fontSize="10" fontFamily="monospace">event: "order.created"</text>
          <text x="30" y="111" fill="#64748b" fontSize="10" fontFamily="monospace">attr: order.id=123</text>
          <text x="30" y="128" fill="#64748b" fontSize="10" fontFamily="monospace">attr: total=99.99</text>
          <text x="30" y="145" fill="#64748b" fontSize="10" fontFamily="monospace">status: OK</text>
        </g>

        {/* Arrow */}
        <g>
          <line x1="200" y1="100" x2="290" y2="100" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowblue)" />
          <text x="245" y="85" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="600">Narrative</text>
          <text x="245" y="97" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="600">Template</text>
        </g>

        {/* Human-Readable Story */}
        <g>
          <rect x="300" y="40" width="280" height="120" fill="#064e3b" stroke="#059669" strokeWidth="2" rx="4" />
          <text x="440" y="60" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="600">HUMAN-READABLE STORY</text>
          <text x="310" y="82" fill="#d1fae5" fontSize="10">Order #123 completed for John Doe</text>
          <text x="315" y="100" fill="#a7f3d0" fontSize="9">• Order placed: 3 items, total $99.99</text>
          <text x="315" y="114" fill="#a7f3d0" fontSize="9">• Payment processed via credit card</text>
          <text x="315" y="128" fill="#a7f3d0" fontSize="9">• Shipping scheduled via UPS</text>
          <text x="315" y="142" fill="#a7f3d0" fontSize="9">• Estimated delivery: Jan 20</text>
        </g>

        <defs>
          <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        <strong>Narrative Templates</strong> transform raw OpenTelemetry events into clear, human-readable execution stories.
      </div>
    </div>
  );
};

const Step2Components: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        {/* Template File */}
        <g>
          <rect x="20" y="20" width="560" height="240" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="6" />
          <text x="300" y="45" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="700">NARRATIVE TEMPLATE STRUCTURE</text>

          {/* Header Info */}
          <g>
            <rect x="40" y="60" width="240" height="80" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="4" />
            <text x="160" y="78" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">METADATA</text>
            <text x="50" y="95" fill="#94a3b8" fontSize="9" fontFamily="monospace">version: "1.0.0"</text>
            <text x="50" y="108" fill="#94a3b8" fontSize="9" fontFamily="monospace">name: "Order Processing"</text>
            <text x="50" y="121" fill="#94a3b8" fontSize="9" fontFamily="monospace">canvas: "./order.otel.canvas"</text>
            <text x="50" y="134" fill="#94a3b8" fontSize="9" fontFamily="monospace">mode: "flow"</text>
          </g>

          {/* Scenarios */}
          <g>
            <rect x="300" y="60" width="260" height="190" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="4" />
            <text x="430" y="78" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="600">SCENARIOS</text>

            {/* Scenario 1 */}
            <g>
              <rect x="310" y="85" width="240" height="55" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" rx="3" />
              <text x="315" y="98" fill="#c4b5fd" fontSize="9" fontWeight="600">Scenario: success (priority: 1)</text>
              <text x="320" y="110" fill="#94a3b8" fontSize="8" fontFamily="monospace">condition: event = "order.completed"</text>
              <text x="320" y="122" fill="#94a3b8" fontSize="8" fontFamily="monospace">template: "Order #&#123;order.id&#125; completed"</text>
              <text x="320" y="134" fill="#94a3b8" fontSize="8" fontFamily="monospace">steps: [4 narrative steps...]</text>
            </g>

            {/* Scenario 2 */}
            <g>
              <rect x="310" y="145" width="240" height="50" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" rx="3" />
              <text x="315" y="158" fill="#c4b5fd" fontSize="9" fontWeight="600">Scenario: payment-declined (priority: 2)</text>
              <text x="320" y="170" fill="#94a3b8" fontSize="8" fontFamily="monospace">condition: event = "payment.declined"</text>
              <text x="320" y="182" fill="#94a3b8" fontSize="8" fontFamily="monospace">template: "Payment declined..."</text>
            </g>

            {/* Scenario 3 */}
            <g>
              <rect x="310" y="200" width="240" height="45" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" rx="3" />
              <text x="315" y="213" fill="#c4b5fd" fontSize="9" fontWeight="600">Scenario: error (priority: 10)</text>
              <text x="320" y="225" fill="#94a3b8" fontSize="8" fontFamily="monospace">condition: status = "ERROR"</text>
              <text x="320" y="237" fill="#94a3b8" fontSize="8" fontFamily="monospace">template: "Error occurred..."</text>
            </g>
          </g>

          {/* Canvas Reference */}
          <g>
            <rect x="40" y="155" width="240" height="95" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="4" />
            <text x="160" y="173" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="600">CANVAS REFERENCE</text>
            <text x="50" y="190" fill="#94a3b8" fontSize="9">Links to .otel.canvas file that defines:</text>
            <text x="55" y="205" fill="#6ee7b7" fontSize="9">• What events to capture</text>
            <text x="55" y="218" fill="#6ee7b7" fontSize="9">• Which spans to track</text>
            <text x="55" y="231" fill="#6ee7b7" fontSize="9">• Expected attributes</text>
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
        A template has <strong style={{ color: '#60a5fa' }}>metadata</strong>, links to a <strong style={{ color: '#34d399' }}>canvas file</strong>, and defines multiple <strong style={{ color: '#a78bfa' }}>scenarios</strong> for different execution outcomes.
      </div>
    </div>
  );
};

const Step3Scenarios: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">HOW SCENARIOS MATCH</text>

        {/* Incoming execution */}
        <g>
          <rect x="40" y="40" width="150" height="100" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="115" y="60" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">EXECUTION DATA</text>
          <text x="50" y="80" fill="#64748b" fontSize="9" fontFamily="monospace">events:</text>
          <text x="55" y="95" fill="#94a3b8" fontSize="9" fontFamily="monospace">• order.created</text>
          <text x="55" y="108" fill="#94a3b8" fontSize="9" fontFamily="monospace">• payment.declined</text>
          <text x="50" y="128" fill="#f87171" fontSize="9" fontFamily="monospace">status: ERROR</text>
        </g>

        {/* Matching Logic */}
        <g>
          <path d="M 200 90 L 240 130" stroke="#475569" strokeWidth="2" strokeDasharray="4,2" />
          <path d="M 200 90 L 240 200" stroke="#475569" strokeWidth="2" strokeDasharray="4,2" />
          <path d="M 200 90 L 240 270" stroke="#475569" strokeWidth="2" strokeDasharray="4,2" />
        </g>

        {/* Scenarios with priority */}
        <g>
          {/* Success scenario - doesn't match */}
          <rect x="250" y="50" width="320" height="60" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" opacity="0.5" />
          <circle cx="265" cy="80" r="12" fill="#334155" stroke="#475569" strokeWidth="1.5" />
          <text x="265" y="85" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">1</text>
          <text x="285" y="75" fill="#64748b" fontSize="10" fontWeight="600">Success Scenario</text>
          <text x="285" y="90" fill="#64748b" fontSize="9">condition: event = "order.completed" (no match)</text>
          <text x="285" y="103" fill="#64748b" fontSize="8" fontStyle="italic">Not matched - event not found</text>

          {/* Payment declined - MATCHES! */}
          <rect x="250" y="120" width="320" height="60" fill="#1e1b4b" stroke="#3b82f6" strokeWidth="3" rx="4" />
          <circle cx="265" cy="150" r="12" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
          <text x="265" y="155" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">2</text>
          <text x="285" y="145" fill="#dbeafe" fontSize="10" fontWeight="600">Payment Declined Scenario</text>
          <text x="285" y="160" fill="#93c5fd" fontSize="9">condition: event = "payment.declined" (match)</text>
          <text x="285" y="173" fill="#34d399" fontSize="9" fontWeight="600">MATCHED! This scenario will render</text>

          {/* Error fallback - lower priority */}
          <rect x="250" y="190" width="320" height="60" fill="#1e293b" stroke="#475569" strokeWidth="1.5" rx="4" opacity="0.5" />
          <circle cx="265" cy="220" r="12" fill="#334155" stroke="#475569" strokeWidth="1.5" />
          <text x="265" y="225" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="700">10</text>
          <text x="285" y="215" fill="#64748b" fontSize="10" fontWeight="600">Error Fallback Scenario</text>
          <text x="285" y="230" fill="#64748b" fontSize="9">condition: status = "ERROR" (match)</text>
          <text x="285" y="243" fill="#64748b" fontSize="8" fontStyle="italic">Matches, but priority 2 wins</text>
        </g>

        {/* Selection explanation */}
        <rect x="40" y="270" width="520" height="35" fill="#065f46" stroke="#059669" strokeWidth="1.5" rx="4" />
        <text x="50" y="288" fill="#d1fae5" fontSize="10" fontWeight="600">SELECTION RULE:</text>
        <text x="50" y="300" fill="#a7f3d0" fontSize="9">The scenario with the LOWEST priority number that matches will be selected.</text>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        Scenarios are tested in <strong style={{ color: '#60a5fa' }}>priority order</strong> (1, 2, 3...). The first matching scenario renders its template.
      </div>
    </div>
  );
};

const Step4Templates: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">TEMPLATE VARIABLE SUBSTITUTION</text>

        {/* Template Definition */}
        <g>
          <rect x="40" y="45" width="520" height="90" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="60" y="65" fill="#94a3b8" fontSize="11" fontWeight="600">TEMPLATE WITH VARIABLES:</text>

          <rect x="60" y="75" width="500" height="50" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="3" />
          <text x="70" y="93" fill="#c4b5fd" fontSize="10" fontFamily="monospace">summary: "Order #&#123;order.id&#125; for &#123;customer.name&#125;"</text>
          <text x="70" y="108" fill="#c4b5fd" fontSize="10" fontFamily="monospace">steps:</text>
          <text x="80" y="120" fill="#c4b5fd" fontSize="10" fontFamily="monospace">- "Payment: $&#123;order.total&#125; via &#123;payment.method&#125;"</text>
        </g>

        {/* Plus OTEL Data */}
        <g>
          <text x="300" y="160" textAnchor="middle" fill="#3b82f6" fontSize="16" fontWeight="700">+</text>
        </g>

        {/* OTEL Attributes */}
        <g>
          <rect x="40" y="175" width="250" height="75" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="60" y="193" fill="#94a3b8" fontSize="11" fontWeight="600">OTEL ATTRIBUTES:</text>

          <rect x="60" y="200" width="210" height="45" fill="#0f172a" stroke="#334155" strokeWidth="1" rx="3" />
          <text x="70" y="215" fill="#fbbf24" fontSize="9" fontFamily="monospace">order.id = "ORD-12345"</text>
          <text x="70" y="227" fill="#fbbf24" fontSize="9" fontFamily="monospace">customer.name = "John Doe"</text>
          <text x="70" y="239" fill="#fbbf24" fontSize="9" fontFamily="monospace">order.total = 99.99</text>
        </g>

        {/* Equals */}
        <g>
          <text x="310" y="220" textAnchor="middle" fill="#10b981" fontSize="18" fontWeight="700">=</text>
        </g>

        {/* Rendered Output */}
        <g>
          <rect x="330" y="175" width="230" height="75" fill="#064e3b" stroke="#059669" strokeWidth="2" rx="4" />
          <text x="350" y="193" fill="#6ee7b7" fontSize="11" fontWeight="600">RENDERED OUTPUT:</text>

          <rect x="340" y="200" width="210" height="45" fill="#022c22" stroke="#047857" strokeWidth="1" rx="3" />
          <text x="345" y="215" fill="#d1fae5" fontSize="10">Order #ORD-12345 for John Doe</text>
          <text x="345" y="230" fill="#d1fae5" fontSize="10">• Payment: $99.99 via credit_card</text>
        </g>

        {/* Variable syntax reference */}
        <rect x="40" y="260" width="520" height="15" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1" rx="3" />
        <text x="50" y="270" fill="#bfdbfe" fontSize="9">
          <tspan fontWeight="600">Syntax:</tspan> &#123;variable.name&#125; gets replaced with actual values from OTEL attributes, events, or span data
        </text>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#cbd5e1',
        backgroundColor: '#1e293b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #475569'
      }}>
        Variables in <code style={{ color: '#a78bfa' }}>&#123;single.braces&#125;</code> are replaced with actual values from your execution data.
      </div>
    </div>
  );
};

const Step5Conditions: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 380" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">CONDITION TYPES</text>

        {/* Event Condition */}
        <g>
          <rect x="40" y="40" width="250" height="75" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="55" y="58" fill="#c4b5fd" fontSize="11" fontWeight="700">EVENT CONDITION</text>
          <rect x="55" y="65" width="220" height="45" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" rx="3" />
          <text x="65" y="80" fill="#e0e7ff" fontSize="9" fontFamily="monospace">&#123;</text>
          <text x="70" y="92" fill="#e0e7ff" fontSize="9" fontFamily="monospace">  type: "event",</text>
          <text x="70" y="104" fill="#e0e7ff" fontSize="9" fontFamily="monospace">  event: "payment.success"</text>
          <text x="65" y="115" fill="#e0e7ff" fontSize="9" fontFamily="monospace">&#125;</text>
        </g>

        {/* Attribute Condition */}
        <g>
          <rect x="310" y="40" width="250" height="75" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="325" y="58" fill="#fde68a" fontSize="11" fontWeight="700">ATTRIBUTE CONDITION</text>
          <rect x="325" y="65" width="220" height="45" fill="#451a03" stroke="#f59e0b" strokeWidth="1" rx="3" />
          <text x="335" y="80" fill="#fef3c7" fontSize="9" fontFamily="monospace">&#123;</text>
          <text x="340" y="92" fill="#fef3c7" fontSize="9" fontFamily="monospace">  type: "attribute",</text>
          <text x="340" y="104" fill="#fef3c7" fontSize="9" fontFamily="monospace">  key: "http.status", value: 200</text>
          <text x="335" y="115" fill="#fef3c7" fontSize="9" fontFamily="monospace">&#125;</text>
        </g>

        {/* Span Condition */}
        <g>
          <rect x="40" y="130" width="250" height="75" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" rx="4" />
          <text x="55" y="148" fill="#a5f3fc" fontSize="11" fontWeight="700">SPAN CONDITION</text>
          <rect x="55" y="155" width="220" height="45" fill="#083344" stroke="#06b6d4" strokeWidth="1" rx="3" />
          <text x="65" y="170" fill="#cffafe" fontSize="9" fontFamily="monospace">&#123;</text>
          <text x="70" y="182" fill="#cffafe" fontSize="9" fontFamily="monospace">  type: "span",</text>
          <text x="70" y="194" fill="#cffafe" fontSize="9" fontFamily="monospace">  name: "ProcessPayment"</text>
          <text x="65" y="205" fill="#cffafe" fontSize="9" fontFamily="monospace">&#125;</text>
        </g>

        {/* Combined Condition */}
        <g>
          <rect x="310" y="130" width="250" height="75" fill="#1e293b" stroke="#ec4899" strokeWidth="2" rx="4" />
          <text x="325" y="148" fill="#fbcfe8" fontSize="11" fontWeight="700">COMBINED (AND/OR)</text>
          <rect x="325" y="155" width="220" height="45" fill="#500724" stroke="#ec4899" strokeWidth="1" rx="3" />
          <text x="335" y="170" fill="#fce7f3" fontSize="9" fontFamily="monospace">&#123; type: "and", conditions: [</text>
          <text x="340" y="182" fill="#fce7f3" fontSize="9" fontFamily="monospace">  &#123;type: "event", ...&#125;,</text>
          <text x="340" y="194" fill="#fce7f3" fontSize="9" fontFamily="monospace">  &#123;type: "attribute", ...&#125;</text>
          <text x="335" y="205" fill="#fce7f3" fontSize="9" fontFamily="monospace">]&#125;</text>
        </g>

        {/* Visual Flow */}
        <g>
          <text x="300" y="235" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="700">EXAMPLE: COMPLEX MATCHING</text>

          <rect x="40" y="250" width="520" height="115" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="4" />

          {/* Condition */}
          <text x="55" y="268" fill="#94a3b8" fontSize="10" fontWeight="600">Scenario matches when:</text>
          <rect x="55" y="275" width="500" height="55" fill="#1e293b" stroke="#334155" strokeWidth="1" rx="3" />
          <text x="65" y="290" fill="#a78bfa" fontSize="9" fontFamily="monospace">type: "and"</text>
          <text x="70" y="303" fill="#c4b5fd" fontSize="9" fontFamily="monospace">├─ event exists: "order.created"</text>
          <text x="70" y="315" fill="#c4b5fd" fontSize="9" fontFamily="monospace">├─ event exists: "payment.processed"</text>
          <text x="70" y="327" fill="#c4b5fd" fontSize="9" fontFamily="monospace">└─ attribute: payment.status = "success"</text>

          {/* Result */}
          <text x="55" y="350" fill="#6ee7b7" fontSize="10" fontWeight="600">All conditions must be true for this scenario to match</text>
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
        Conditions determine when a scenario matches. You can check for <strong style={{ color: '#8b5cf6' }}>events</strong>, <strong style={{ color: '#f59e0b' }}>attributes</strong>, <strong style={{ color: '#06b6d4' }}>spans</strong>, or combine them with <strong style={{ color: '#ec4899' }}>AND/OR</strong> logic.
      </div>
    </div>
  );
};

const Step6FileStructure: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">FILE ORGANIZATION</text>

        {/* File tree */}
        <g>
          <rect x="40" y="40" width="520" height="265" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="4" />

          {/* Root */}
          <text x="60" y="65" fill="#94a3b8" fontSize="11" fontFamily="monospace">.principal-views/</text>

          {/* Narratives folder */}
          <text x="80" y="85" fill="#a78bfa" fontSize="11" fontFamily="monospace">__narratives__/</text>
          <text x="100" y="105" fill="#c4b5fd" fontSize="10" fontFamily="monospace">auth-flow.narrative.json</text>
          <text x="100" y="122" fill="#c4b5fd" fontSize="10" fontFamily="monospace">payment-flow.narrative.json</text>
          <text x="100" y="139" fill="#c4b5fd" fontSize="10" fontFamily="monospace">order-processing.narrative.json</text>

          {/* Arrow showing relationship */}
          <line x1="340" y1="105" x2="380" y2="175" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,2" markerEnd="url(#arrow1)" />
          <text x="350" y="135" fill="#60a5fa" fontSize="9">references</text>

          {/* Canvas files */}
          <text x="80" y="165" fill="#fbbf24" fontSize="11" fontFamily="monospace">auth-flow.otel.canvas</text>
          <text x="80" y="182" fill="#34d399" fontSize="11" fontFamily="monospace">payment-flow.otel.canvas</text>
          <text x="80" y="199" fill="#60a5fa" fontSize="11" fontFamily="monospace">order-processing.otel.canvas</text>

          {/* Explanation boxes */}
          <rect x="60" y="220" width="240" height="70" fill="#1e293b" stroke="#a78bfa" strokeWidth="1.5" rx="3" />
          <text x="70" y="235" fill="#c4b5fd" fontSize="10" fontWeight="600">__narratives__/</text>
          <text x="75" y="248" fill="#94a3b8" fontSize="9">Contains .narrative.json files</text>
          <text x="75" y="260" fill="#94a3b8" fontSize="9">that define scenarios and</text>
          <text x="75" y="272" fill="#94a3b8" fontSize="9">templates for rendering</text>
          <text x="75" y="284" fill="#94a3b8" fontSize="9">execution stories.</text>

          <rect x="320" y="220" width="220" height="70" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" rx="3" />
          <text x="330" y="235" fill="#6ee7b7" fontSize="10" fontWeight="600">.otel.canvas files</text>
          <text x="335" y="248" fill="#94a3b8" fontSize="9">Define what OTEL events,</text>
          <text x="335" y="260" fill="#94a3b8" fontSize="9">spans, and attributes to</text>
          <text x="335" y="272" fill="#94a3b8" fontSize="9">capture from execution</text>
          <text x="335" y="284" fill="#94a3b8" fontSize="9">traces.</text>
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
        Keep <strong style={{ color: '#a78bfa' }}>narrative templates</strong> in <code>__narratives__/</code> folders and link them to <strong style={{ color: '#34d399' }}>.otel.canvas</strong> files using relative paths.
      </div>
    </div>
  );
};

const Step7Workflow: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 310" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="20" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">END-TO-END WORKFLOW</text>

        {/* Row 1: Steps 1, 2, 3 */}

        {/* Step 1: Code runs */}
        <g>
          <rect x="20" y="40" width="110" height="60" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="75" y="56" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="700">1. CODE RUNS</text>
          <text x="28" y="70" fill="#94a3b8" fontSize="8">App executes</text>
          <text x="28" y="80" fill="#94a3b8" fontSize="8">with OTEL</text>
          <text x="28" y="90" fill="#94a3b8" fontSize="8">instrumentation</text>
        </g>

        <path d="M 135 70 L 165 70" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow2)" />

        {/* Step 2: OTEL capture */}
        <g>
          <rect x="170" y="40" width="110" height="60" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="225" y="56" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="700">2. CAPTURE</text>
          <text x="178" y="70" fill="#94a3b8" fontSize="8">Canvas defines</text>
          <text x="178" y="80" fill="#94a3b8" fontSize="8">spans, events,</text>
          <text x="178" y="90" fill="#94a3b8" fontSize="8">attributes</text>
        </g>

        <path d="M 285 70 L 315 70" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow2)" />

        {/* Step 3: Storage */}
        <g>
          <rect x="320" y="40" width="110" height="60" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" rx="4" />
          <text x="375" y="56" textAnchor="middle" fill="#a5f3fc" fontSize="10" fontWeight="700">3. STORE</text>
          <text x="328" y="70" fill="#94a3b8" fontSize="8">Trace saved</text>
          <text x="328" y="80" fill="#94a3b8" fontSize="8">to file (.json</text>
          <text x="328" y="90" fill="#94a3b8" fontSize="8">or protobuf)</text>
        </g>

        <path d="M 435 70 L 465 70" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow2)" />

        {/* Step 4: Viewer loads */}
        <g>
          <rect x="470" y="40" width="110" height="60" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="525" y="56" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="700">4. LOAD</text>
          <text x="478" y="70" fill="#94a3b8" fontSize="8">Panel reads</text>
          <text x="478" y="80" fill="#94a3b8" fontSize="8">trace and</text>
          <text x="478" y="90" fill="#94a3b8" fontSize="8">narrative</text>
        </g>

        {/* Arrow down to row 2 */}
        <path d="M 525 105 L 525 125" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow2)" />

        {/* Row 2: Steps 5, 6, 7 */}

        {/* Step 5: Match scenario */}
        <g>
          <rect x="470" y="130" width="110" height="60" fill="#1e293b" stroke="#ec4899" strokeWidth="2" rx="4" />
          <text x="525" y="146" textAnchor="middle" fill="#fbcfe8" fontSize="10" fontWeight="700">5. MATCH</text>
          <text x="478" y="160" fill="#94a3b8" fontSize="8">Test conditions</text>
          <text x="478" y="170" fill="#94a3b8" fontSize="8">pick best</text>
          <text x="478" y="180" fill="#94a3b8" fontSize="8">scenario</text>
        </g>

        <path d="M 465 160 L 435 160" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow2)" />

        {/* Step 6: Render template */}
        <g>
          <rect x="320" y="130" width="110" height="60" fill="#1e293b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="375" y="146" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="700">6. RENDER</text>
          <text x="328" y="160" fill="#94a3b8" fontSize="8">Replace vars</text>
          <text x="328" y="170" fill="#94a3b8" fontSize="8">with actual</text>
          <text x="328" y="180" fill="#94a3b8" fontSize="8">values</text>
        </g>

        <path d="M 315 160 L 285 160" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow2)" />

        {/* Step 7: Display */}
        <g>
          <rect x="170" y="130" width="110" height="60" fill="#064e3b" stroke="#059669" strokeWidth="3" rx="4" />
          <text x="225" y="146" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="700">7. STORY!</text>
          <text x="178" y="160" fill="#d1fae5" fontSize="8">Order done</text>
          <text x="180" y="170" fill="#a7f3d0" fontSize="7">• Payment OK</text>
          <text x="180" y="178" fill="#a7f3d0" fontSize="7">• Shipped</text>
        </g>

        {/* Benefits */}
        <rect x="20" y="210" width="560" height="75" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
        <text x="300" y="228" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="700">WHY THIS MATTERS</text>
        <text x="30" y="245" fill="#94a3b8" fontSize="9">• Testing: Clear pass/fail stories vs raw logs</text>
        <text x="30" y="258" fill="#94a3b8" fontSize="9">• Documentation: Self-documenting flows</text>
        <text x="310" y="245" fill="#94a3b8" fontSize="9">• Debugging: Understand production behavior</text>
        <text x="310" y="258" fill="#94a3b8" fontSize="9">• Monitoring: Human-readable narratives</text>

        <defs>
          <marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        The complete flow: <strong style={{ color: '#3b82f6' }}>code runs</strong> → <strong style={{ color: '#8b5cf6' }}>OTEL captures</strong> → <strong style={{ color: '#06b6d4' }}>data stored</strong> → <strong style={{ color: '#f59e0b' }}>viewer loads</strong> → <strong style={{ color: '#ec4899' }}>scenario matches</strong> → <strong style={{ color: '#10b981' }}>template renders</strong> → human-readable story!
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'what', title: 'What is a Narrative?', component: Step1WhatIsNarrative },
  { id: 'components', title: 'Template Components', component: Step2Components },
  { id: 'scenarios', title: 'How Scenarios Match', component: Step3Scenarios },
  { id: 'templates', title: 'Template Variables', component: Step4Templates },
  { id: 'conditions', title: 'Condition Types', component: Step5Conditions },
  { id: 'files', title: 'File Organization', component: Step6FileStructure },
  { id: 'workflow', title: 'End-to-End Workflow', component: Step7Workflow },
];

export const NarrativeExplainerPanel: React.FC<NarrativeExplainerPanelProps> = ({ className }) => {
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
          Narrative Templates Guide
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          Learn how to transform OpenTelemetry execution traces into human-readable stories
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
          Ready to Create Your Own?
        </h3>
        <p style={{ color: theme.colors.textSecondary, marginBottom: '16px', fontSize: '14px' }}>
          Now that you understand the concepts, you can create narrative templates for your own execution traces.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#34d399' }}>1.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              Create a <code style={{ color: '#a78bfa' }}>.otel.canvas</code> file defining what to capture
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#34d399' }}>2.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              Create a <code style={{ color: '#a78bfa' }}>.narrative.json</code> file with scenarios and templates
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#34d399' }}>3.</span>
            <span style={{ color: theme.colors.textSecondary }}>
              Run your code with OpenTelemetry instrumentation
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#34d399' }}>4.</span>
            <span style={{ color: theme.colors.textSecondary }}>View the results in CanvasDetailPanel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NarrativeExplainerPanel;
