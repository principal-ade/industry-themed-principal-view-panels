import React, { useState } from 'react';

export interface SystemStoriesSolutionExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1WhatAreStories: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 240" style={{ width: '100%', height: 'auto' }}>
        {/* Title */}
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">STORIES = HOW HUMANS UNDERSTAND SYSTEMS</text>

        {/* Traditional Monitoring */}
        <g>
          <rect x="40" y="50" width="240" height="170" fill="#1e293b" stroke="#ef4444" strokeWidth="2" rx="6" />
          <text x="160" y="73" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="700">❌ Traditional Monitoring</text>

          <rect x="60" y="85" width="200" height="120" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="4" />
          <text x="160" y="100" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">span.duration = 1234ms</text>
          <text x="160" y="115" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">http.status_code = 200</text>
          <text x="160" y="130" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">db.query.count = 12</text>
          <text x="160" y="145" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">event.type = "order.created"</text>
          <text x="160" y="160" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">trace.id = "abc123..."</text>
          <text x="160" y="175" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">error.count = 0</text>
          <text x="160" y="190" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">...</text>

          <text x="160" y="215" textAnchor="middle" fill="#fca5a5" fontSize="10" fontStyle="italic">Needle in haystack</text>
        </g>

        {/* Arrow */}
        <g>
          <line x1="290" y1="135" x2="310" y2="135" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowblue)" />
          <text x="300" y="127" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="600">vs</text>
        </g>

        {/* System Stories */}
        <g>
          <rect x="320" y="50" width="240" height="170" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="6" />
          <text x="440" y="73" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="700">✓ System Stories</text>

          <rect x="340" y="85" width="200" height="120" fill="#022c22" stroke="#059669" strokeWidth="1.5" rx="4" />
          <text x="440" y="103" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">Story: "User Checkout"</text>
          <text x="350" y="120" fill="#a7f3d0" fontSize="9">When user completes checkout:</text>
          <text x="355" y="135" fill="#a7f3d0" fontSize="9">• Payment processes in &lt;2s</text>
          <text x="355" y="148" fill="#a7f3d0" fontSize="9">• Order confirmation sent</text>
          <text x="355" y="161" fill="#a7f3d0" fontSize="9">• Inventory decremented</text>
          <text x="355" y="174" fill="#a7f3d0" fontSize="9">• Analytics event fired</text>
          <text x="355" y="187" fill="#a7f3d0" fontSize="9">• User redirected to success</text>

          <text x="440" y="215" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontStyle="italic">Human-readable expectations</text>
        </g>

        <defs>
          <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
          </marker>
        </defs>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#d1fae5',
        backgroundColor: '#064e3b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #059669'
      }}>
        <strong>Stories work because:</strong> Humans naturally think in workflows, not metrics.
        "User checkout should take &lt;2s and send confirmation" is clearer than tracking 50 telemetry signals.
      </div>
    </div>
  );
};

const Step2HowStoriesWork: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        {/* Define Story */}
        <g>
          <rect x="30" y="30" width="180" height="80" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" rx="6" />
          <text x="120" y="52" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="700">1. DEFINE STORY</text>
          <text x="40" y="70" fill="#cbd5e1" fontSize="9">Story: "Payment Flow"</text>
          <text x="45" y="84" fill="#94a3b8" fontSize="8">Expected behavior:</text>
          <text x="50" y="96" fill="#94a3b8" fontSize="8">• Charge succeeds</text>
          <text x="50" y="105" fill="#94a3b8" fontSize="8">• Receipt generated</text>
        </g>

        {/* Arrow 1 */}
        <g>
          <line x1="220" y1="70" x2="270" y2="70" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowgreen)" />
          <text x="245" y="65" textAnchor="middle" fill="#10b981" fontSize="9">Maps to</text>
        </g>

        {/* Telemetry Signals */}
        <g>
          <rect x="280" y="30" width="180" height="80" fill="#0f172a" stroke="#6366f1" strokeWidth="2" rx="6" />
          <text x="370" y="52" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="700">2. TELEMETRY SIGNALS</text>
          <text x="290" y="70" fill="#c4b5fd" fontSize="8" fontFamily="monospace">span: "ProcessPayment"</text>
          <text x="290" y="82" fill="#c4b5fd" fontSize="8" fontFamily="monospace">event: "payment.success"</text>
          <text x="290" y="94" fill="#c4b5fd" fontSize="8" fontFamily="monospace">event: "receipt.generated"</text>
          <text x="290" y="106" fill="#c4b5fd" fontSize="8" fontFamily="monospace">attr: amount, customer_id</text>
        </g>

        {/* Arrow 2 */}
        <g>
          <line x1="370" y1="120" x2="370" y2="160" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrowyellow)" />
          <text x="400" y="145" fill="#fbbf24" fontSize="9">Monitors</text>
        </g>

        {/* Production System */}
        <g>
          <rect x="280" y="170" width="180" height="80" fill="#064e3b" stroke="#059669" strokeWidth="2" rx="6" />
          <text x="370" y="192" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="700">3. PRODUCTION SYSTEM</text>
          <text x="290" y="210" fill="#a7f3d0" fontSize="9">Real telemetry events</text>
          <text x="290" y="224" fill="#a7f3d0" fontSize="9">flowing from system</text>
          <text x="290" y="238" fill="#10b981" fontSize="9" fontWeight="600">✓ Story validated in real-time</text>
        </g>

        {/* Arrow 3 (back to engineer) */}
        <g>
          <path d="M 270 210 Q 120 210, 120 120"
                stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="5,5" markerEnd="url(#arrowblue2)" />
          <text x="180" y="230" fill="#3b82f6" fontSize="9">Alert if story breaks</text>
        </g>

        {/* Engineer */}
        <g>
          <circle cx="120" cy="195" r="25" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
          <text x="120" y="200" textAnchor="middle" fill="#fff" fontSize="20">👨‍💻</text>
          <text x="120" y="235" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">ENGINEER</text>
          <text x="120" y="247" textAnchor="middle" fill="#10b981" fontSize="8">Gets alerts</text>
        </g>

        <defs>
          <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
          </marker>
          <marker id="arrowyellow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" />
          </marker>
          <marker id="arrowblue2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        <strong>How it works:</strong> Define expected behavior as a story → Map to telemetry signals →
        Monitor production in real-time → Get alerts when expectations are violated.
      </div>
    </div>
  );
};

const Step3AvoidNeedleInHaystack: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        {/* Title */}
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">AVOIDING THE NEEDLE IN THE HAYSTACK</text>

        {/* Reactive Monitoring */}
        <g>
          <rect x="40" y="50" width="240" height="220" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="6" />
          <text x="160" y="73" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="700">❌ Reactive Monitoring</text>
          <text x="160" y="88" textAnchor="middle" fill="#fca5a5" fontSize="9">"Something is wrong, find it!"</text>

          {/* Haystack */}
          <rect x="60" y="100" width="200" height="130" fill="#450a0a" stroke="#991b1b" strokeWidth="1.5" rx="4" />
          <text x="160" y="118" textAnchor="middle" fill="#7f1d1d" fontSize="40">🌾</text>
          <text x="100" y="155" fill="#fca5a5" fontSize="8" fontFamily="monospace">10,000 spans/sec</text>
          <text x="100" y="168" fill="#fca5a5" fontSize="8" fontFamily="monospace">500 services</text>
          <text x="100" y="181" fill="#fca5a5" fontSize="8" fontFamily="monospace">millions of events</text>
          <text x="100" y="194" fill="#fca5a5" fontSize="8" fontFamily="monospace">complex traces</text>
          <text x="100" y="207" fill="#fca5a5" fontSize="8" fontFamily="monospace">distributed systems</text>
          <text x="180" y="175" fill="#ef4444" fontSize="28">📍</text>

          <text x="160" y="248" textAnchor="middle" fill="#fca5a5" fontSize="10" fontStyle="italic">Hours hunting for root cause</text>
        </g>

        {/* Arrow */}
        <g>
          <line x1="290" y1="160" x2="310" y2="160" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowgreen2)" />
          <text x="300" y="150" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">VS</text>
        </g>

        {/* Proactive Stories */}
        <g>
          <rect x="320" y="50" width="240" height="220" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="6" />
          <text x="440" y="73" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="700">✓ Proactive Stories</text>
          <text x="440" y="88" textAnchor="middle" fill="#a7f3d0" fontSize="9">"This is what should happen"</text>

          {/* Clear Expectations */}
          <rect x="340" y="100" width="200" height="130" fill="#022c22" stroke="#059669" strokeWidth="1.5" rx="4" />
          <text x="440" y="120" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">Expected Stories:</text>

          <g>
            <circle cx="355" cy="138" r="4" fill="#10b981" />
            <text x="365" y="142" fill="#a7f3d0" fontSize="9">✓ User Login (Active)</text>
          </g>
          <g>
            <circle cx="355" cy="155" r="4" fill="#10b981" />
            <text x="365" y="159" fill="#a7f3d0" fontSize="9">✓ Checkout Flow (Active)</text>
          </g>
          <g>
            <circle cx="355" cy="172" r="4" fill="#10b981" />
            <text x="365" y="176" fill="#a7f3d0" fontSize="9">✓ Payment Process (Active)</text>
          </g>
          <g>
            <circle cx="355" cy="189" r="4" fill="#ef4444" />
            <text x="365" y="193" fill="#fca5a5" fontSize="9">❌ Email Send (VIOLATED!)</text>
            <text x="375" y="203" fill="#fbbf24" fontSize="8">→ Immediate alert</text>
          </g>
          <g>
            <circle cx="355" cy="215" r="4" fill="#10b981" />
            <text x="365" y="219" fill="#a7f3d0" fontSize="9">✓ Analytics Track (Active)</text>
          </g>

          <text x="440" y="248" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontStyle="italic">Know immediately what broke</text>
        </g>

        <defs>
          <marker id="arrowgreen2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
          </marker>
        </defs>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#d1fae5',
        backgroundColor: '#064e3b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #059669'
      }}>
        <strong>The Key Insight:</strong> Instead of searching millions of events for problems,
        define expected behaviors upfront. When a story is violated, you know exactly what broke and why.
      </div>
    </div>
  );
};

const Step4AgentIntegration: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        {/* Title */}
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">STORIES MAKE AGENT WORK TRUSTWORTHY</text>

        {/* Step 1: Agent Makes Change */}
        <g>
          <rect x="40" y="50" width="160" height="80" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" rx="6" />
          <text x="120" y="70" textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="700">1. AGENT WRITES CODE</text>
          <text x="120" y="88" textAnchor="middle" fill="#e9d5ff" fontSize="24">🤖</text>
          <text x="120" y="110" textAnchor="middle" fill="#c4b5fd" fontSize="9">Makes change to</text>
          <text x="120" y="122" textAnchor="middle" fill="#c4b5fd" fontSize="9">checkout flow</text>
        </g>

        {/* Arrow */}
        <g>
          <line x1="210" y1="90" x2="270" y2="90" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowblue3)" />
          <text x="240" y="82" textAnchor="middle" fill="#3b82f6" fontSize="9">Deploy</text>
        </g>

        {/* Step 2: Stories Monitor */}
        <g>
          <rect x="280" y="50" width="160" height="80" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" rx="6" />
          <text x="360" y="70" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="700">2. STORIES VALIDATE</text>
          <text x="290" y="90" fill="#94a3b8" fontSize="9">Story: "Checkout"</text>
          <text x="295" y="103" fill="#a7f3d0" fontSize="8">✓ Payment processes</text>
          <text x="295" y="114" fill="#fca5a5" fontSize="8">❌ Email not sent!</text>
        </g>

        {/* Arrow down */}
        <g>
          <line x1="360" y1="140" x2="360" y2="180" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowred)" />
          <text x="380" y="165" fill="#ef4444" fontSize="9" fontWeight="600">Alert!</text>
        </g>

        {/* Step 3: Engineer Alerted */}
        <g>
          <rect x="280" y="190" width="160" height="80" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="6" />
          <text x="360" y="210" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="700">3. IMMEDIATE FEEDBACK</text>
          <text x="360" y="228" textAnchor="middle" fill="#fca5a5" fontSize="24">⚠️</text>
          <text x="290" y="250" fill="#fca5a5" fontSize="9">"Agent broke checkout</text>
          <text x="290" y="262" fill="#fca5a5" fontSize="9">confirmation emails"</text>
        </g>

        {/* Arrow back */}
        <g>
          <path d="M 270 230 Q 220 230, 220 190"
                stroke="#fbbf24" strokeWidth="2" fill="none" markerEnd="url(#arrowyellow2)" />
          <text x="235" y="225" fill="#fbbf24" fontSize="9">Fix & redeploy</text>
        </g>

        {/* Step 4: Confidence */}
        <g>
          <rect x="40" y="190" width="160" height="80" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="6" />
          <text x="120" y="210" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="700">4. CONFIDENCE</text>
          <text x="120" y="228" textAnchor="middle" fill="#10b981" fontSize="24">✓</text>
          <text x="50" y="250" fill="#a7f3d0" fontSize="9">All stories pass =</text>
          <text x="50" y="262" fill="#a7f3d0" fontSize="9">Safe to trust agent</text>
        </g>

        {/* Bottom Summary */}
        <g>
          <rect x="40" y="290" width="520" height="40" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" rx="6" />
          <text x="300" y="310" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="700">
            RESULT: Engineers can leverage agents without fear
          </text>
          <text x="300" y="323" textAnchor="middle" fill="#94a3b8" fontSize="9">
            Stories act as automated acceptance tests for all agent changes
          </text>
        </g>

        <defs>
          <marker id="arrowblue3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
          </marker>
          <marker id="arrowred" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
          </marker>
          <marker id="arrowyellow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" />
          </marker>
        </defs>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#d1fae5',
        backgroundColor: '#064e3b',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #059669'
      }}>
        <strong>Why This Works:</strong> Every engineer now spends time defining system stories instead of writing all code.
        Stories automatically verify agent changes in production. When all stories pass, you can trust the agent's work.
      </div>
    </div>
  );
};

export const SystemStoriesSolutionExplainerPanel: React.FC<SystemStoriesSolutionExplainerPanelProps> = ({
  className
}) => {
  const [activeSection, setActiveSection] = useState<string>('what');

  const sections: Section[] = [
    { id: 'what', title: 'What Are Stories?', component: Step1WhatAreStories },
    { id: 'how', title: 'How They Work', component: Step2HowStoriesWork },
    { id: 'avoid-haystack', title: 'Avoid Haystack Problem', component: Step3AvoidNeedleInHaystack },
    { id: 'agent-integration', title: 'Agent Integration', component: Step4AgentIntegration },
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || Step1WhatAreStories;

  return (
    <div className={className} style={{
      backgroundColor: '#0f172a',
      color: '#cbd5e1',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#f1f5f9',
          marginBottom: '8px'
        }}>
          System Stories: The Solution
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          margin: 0
        }}>
          How stories transform telemetry into trustworthy agent monitoring
        </p>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #334155',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeSection === section.id ? '#3b82f6' : '#1e293b',
              color: activeSection === section.id ? '#fff' : '#94a3b8',
              border: '1px solid',
              borderColor: activeSection === section.id ? '#60a5fa' : '#334155',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeSection === section.id ? '600' : '400',
              transition: 'all 0.2s'
            }}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        padding: '24px',
        border: '1px solid #334155'
      }}>
        <ActiveComponent />
      </div>
    </div>
  );
};
