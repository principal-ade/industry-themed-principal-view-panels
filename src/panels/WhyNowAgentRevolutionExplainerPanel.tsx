import React, { useState } from 'react';

export interface WhyNowAgentRevolutionExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1AgentAdoption: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        {/* Title */}
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">THE AGENT REVOLUTION IS HERE</text>

        {/* Timeline */}
        <line x1="50" y1="100" x2="550" y2="100" stroke="#475569" strokeWidth="3" />

        {/* 2020 */}
        <g>
          <circle cx="100" cy="100" r="8" fill="#64748b" />
          <text x="100" y="125" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">2020</text>
          <text x="100" y="140" textAnchor="middle" fill="#64748b" fontSize="9">GPT-3</text>
          <text x="100" y="152" textAnchor="middle" fill="#64748b" fontSize="9">Copilot beta</text>
        </g>

        {/* 2022 */}
        <g>
          <circle cx="220" cy="100" r="10" fill="#3b82f6" />
          <text x="220" y="125" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">2022</text>
          <text x="220" y="140" textAnchor="middle" fill="#60a5fa" fontSize="9">ChatGPT</text>
          <text x="220" y="152" textAnchor="middle" fill="#60a5fa" fontSize="9">GitHub Copilot GA</text>
          <text x="220" y="164" textAnchor="middle" fill="#60a5fa" fontSize="9">~30% code assist</text>
        </g>

        {/* 2024 */}
        <g>
          <circle cx="380" cy="100" r="12" fill="#8b5cf6" />
          <text x="380" y="125" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">2024</text>
          <text x="380" y="140" textAnchor="middle" fill="#c4b5fd" fontSize="9">Claude Sonnet 3.5</text>
          <text x="380" y="152" textAnchor="middle" fill="#c4b5fd" fontSize="9">Cursor, Claude Code</text>
          <text x="380" y="164" textAnchor="middle" fill="#c4b5fd" fontSize="9">Agents write entire features</text>
          <text x="380" y="176" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">~50-80% agent-written</text>
        </g>

        {/* 2025+ */}
        <g>
          <circle cx="500" cy="100" r="14" fill="#10b981" />
          <text x="500" y="125" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700">2025+</text>
          <text x="500" y="140" textAnchor="middle" fill="#6ee7b7" fontSize="9">Autonomous agents</text>
          <text x="500" y="152" textAnchor="middle" fill="#6ee7b7" fontSize="9">Full feature ownership</text>
          <text x="500" y="164" textAnchor="middle" fill="#6ee7b7" fontSize="9">Engineers = reviewers</text>
          <text x="500" y="176" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="700">~90%+ agent-written</text>
        </g>

        {/* Adoption Curve */}
        <g>
          <path d="M 100 250 Q 220 240, 380 200 Q 440 180, 500 150"
                stroke="#10b981" strokeWidth="3" fill="none" markerEnd="url(#arrowgreen)" />
          <text x="320" y="230" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="600">Exponential Agent Adoption</text>
        </g>

        <defs>
          <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        <strong>200%+ YoY Growth:</strong> AI coding assistants went from autocomplete to writing entire features in 3 years.
        GitHub Copilot, Cursor, Claude Code are now table stakes. The question isn't "if" but "how much" code is agent-generated.
      </div>
    </div>
  );
};

const Step2GrowingGap: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        {/* Title */}
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">THE EXPERIENCE GAP IS GROWING</text>

        {/* Left: Code Volume */}
        <g>
          <rect x="40" y="50" width="220" height="220" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" rx="6" />
          <text x="150" y="72" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="700">CODE VOLUME</text>

          {/* Growing bars */}
          <rect x="60" y="220" width="40" height="30" fill="#3b82f6" />
          <text x="80" y="264" textAnchor="middle" fill="#94a3b8" fontSize="9">2020</text>

          <rect x="110" y="190" width="40" height="60" fill="#3b82f6" />
          <text x="130" y="264" textAnchor="middle" fill="#94a3b8" fontSize="9">2022</text>

          <rect x="160" y="140" width="40" height="110" fill="#6366f1" />
          <text x="180" y="264" textAnchor="middle" fill="#94a3b8" fontSize="9">2024</text>

          <rect x="210" y="90" width="40" height="160" fill="#8b5cf6" />
          <text x="230" y="264" textAnchor="middle" fill="#94a3b8" fontSize="9">2026</text>

          <text x="150" y="95" textAnchor="middle" fill="#a78bfa" fontSize="20">📈</text>
          <text x="150" y="115" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="600">10x more code</text>
          <text x="150" y="128" textAnchor="middle" fill="#c4b5fd" fontSize="9">Agents ship faster</text>
        </g>

        {/* Right: Developer Understanding */}
        <g>
          <rect x="340" y="50" width="220" height="220" fill="#1e293b" stroke="#ef4444" strokeWidth="2" rx="6" />
          <text x="450" y="72" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="700">DEVELOPER CONTEXT</text>

          {/* Shrinking bars */}
          <rect x="360" y="140" width="40" height="110" fill="#10b981" />
          <text x="380" y="264" textAnchor="middle" fill="#94a3b8" fontSize="9">2020</text>

          <rect x="410" y="170" width="40" height="80" fill="#fbbf24" />
          <text x="430" y="264" textAnchor="middle" fill="#94a3b8" fontSize="9">2022</text>

          <rect x="460" y="210" width="40" height="40" fill="#f97316" />
          <text x="480" y="264" textAnchor="middle" fill="#94a3b8" fontSize="9">2024</text>

          <rect x="510" y="235" width="40" height="15" fill="#ef4444" />
          <text x="530" y="264" textAnchor="middle" fill="#94a3b8" fontSize="9">2026</text>

          <text x="450" y="95" textAnchor="middle" fill="#fca5a5" fontSize="20">📉</text>
          <text x="450" y="115" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="600">90% less context</text>
          <text x="450" y="128" textAnchor="middle" fill="#fca5a5" fontSize="9">Didn't write code</text>
        </g>

        {/* Gap indicator */}
        <g>
          <path d="M 270 160 L 330 160" stroke="#fbbf24" strokeWidth="4" strokeDasharray="8,4" />
          <text x="300" y="155" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="700">WIDENING</text>
          <text x="300" y="175" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="700">GAP</text>
        </g>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#fef3c7',
        backgroundColor: '#78350f',
        padding: '16px',
        borderRadius: '6px',
        border: '2px solid #fbbf24'
      }}>
        <strong>The Scissors Problem:</strong> Code volume exploding while developer understanding plummets.
        Junior devs manage agent output without context. Senior devs lose touch with details. Traditional monitoring can't bridge this gap.
      </div>
    </div>
  );
};

const Step3InfrastructureReady: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        {/* Title */}
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">TELEMETRY INFRASTRUCTURE IS MATURE</text>

        {/* Foundation Layer */}
        <g>
          <rect x="80" y="200" width="440" height="60" fill="#064e3b" stroke="#059669" strokeWidth="2" rx="6" />
          <text x="300" y="222" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="700">MATURE FOUNDATION</text>
          <text x="100" y="240" fill="#a7f3d0" fontSize="10">✓ OpenTelemetry standard</text>
          <text x="100" y="253" fill="#a7f3d0" fontSize="10">✓ Distributed tracing</text>
          <text x="320" y="240" fill="#a7f3d0" fontSize="10">✓ Cloud-native observability</text>
          <text x="320" y="253" fill="#a7f3d0" fontSize="10">✓ Wide adoption</text>
        </g>

        {/* Missing Layer */}
        <g>
          <rect x="80" y="120" width="440" height="60" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" strokeDasharray="8,4" rx="6" />
          <text x="300" y="142" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="700">MISSING: INTELLIGENCE LAYER</text>
          <text x="100" y="160" fill="#fca5a5" fontSize="10">❌ No behavior expectations</text>
          <text x="100" y="173" fill="#fca5a5" fontSize="10">❌ No story understanding</text>
          <text x="320" y="160" fill="#fca5a5" fontSize="10">❌ No agent validation</text>
          <text x="320" y="173" fill="#fca5a5" fontSize="10">❌ Reactive, not proactive</text>
        </g>

        {/* Our Solution */}
        <g>
          <rect x="80" y="40" width="440" height="60" fill="#1e40af" stroke="#3b82f6" strokeWidth="3" rx="6" />
          <text x="300" y="62" textAnchor="middle" fill="#60a5fa" fontSize="13" fontWeight="700">PRINCIPAL AI: THE INTELLIGENCE LAYER</text>
          <text x="100" y="80" fill="#bfdbfe" fontSize="10">✓ Story-based expectations</text>
          <text x="100" y="93" fill="#bfdbfe" fontSize="10">✓ Telemetry synthesis</text>
          <text x="320" y="80" fill="#bfdbfe" fontSize="10">✓ Agent workflow integration</text>
          <text x="320" y="93" fill="#bfdbfe" fontSize="10">✓ Automated validation</text>
        </g>

        {/* Arrows */}
        <g>
          <line x1="300" y1="110" x2="300" y2="115" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowblue)" />
          <line x1="300" y1="190" x2="300" y2="195" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowgreen2)" />
        </g>

        <defs>
          <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
          </marker>
          <marker id="arrowgreen2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        <strong>Perfect Timing:</strong> OpenTelemetry and distributed tracing solved the data collection problem.
        The infrastructure is ready for an intelligent layer that understands behavior, not just metrics.
      </div>
    </div>
  );
};

const Step4MarketOpportunity: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        {/* Title */}
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">CONVERGING MARKET FORCES</text>

        {/* Force 1: Agent Adoption */}
        <g>
          <rect x="40" y="50" width="250" height="80" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" rx="6" />
          <text x="165" y="72" textAnchor="middle" fill="#e9d5ff" fontSize="12" fontWeight="700">🤖 AGENT ADOPTION</text>
          <text x="50" y="90" fill="#c4b5fd" fontSize="10">• Every team using AI coding tools</text>
          <text x="50" y="104" fill="#c4b5fd" fontSize="10">• 50-80% code now agent-generated</text>
          <text x="50" y="118" fill="#c4b5fd" fontSize="10">• Growing dependency on automation</text>
        </g>

        {/* Force 2: Developer Productivity */}
        <g>
          <rect x="310" y="50" width="250" height="80" fill="#1e40af" stroke="#3b82f6" strokeWidth="2" rx="6" />
          <text x="435" y="72" textAnchor="middle" fill="#bfdbfe" fontSize="12" fontWeight="700">⚡ PRODUCTIVITY PRESSURE</text>
          <text x="320" y="90" fill="#bfdbfe" fontSize="10">• Ship faster with fewer engineers</text>
          <text x="320" y="104" fill="#bfdbfe" fontSize="10">• Do more with AI leverage</text>
          <text x="320" y="118" fill="#bfdbfe" fontSize="10">• Need confidence to deploy</text>
        </g>

        {/* Force 3: Complexity */}
        <g>
          <rect x="40" y="150" width="250" height="80" fill="#7c2d12" stroke="#f97316" strokeWidth="2" rx="6" />
          <text x="165" y="172" textAnchor="middle" fill="#fed7aa" fontSize="12" fontWeight="700">🌐 SYSTEM COMPLEXITY</text>
          <text x="50" y="190" fill="#fed7aa" fontSize="10">• Microservices proliferation</text>
          <text x="50" y="204" fill="#fed7aa" fontSize="10">• Distributed systems everywhere</text>
          <text x="50" y="218" fill="#fed7aa" fontSize="10">• Traditional monitoring overwhelmed</text>
        </g>

        {/* Force 4: Knowledge Distribution */}
        <g>
          <rect x="310" y="150" width="250" height="80" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="6" />
          <text x="435" y="172" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="700">🧠 KNOWLEDGE PROBLEM</text>
          <text x="320" y="190" fill="#fca5a5" fontSize="10">• Junior devs managing agent output</text>
          <text x="320" y="204" fill="#fca5a5" fontSize="10">• Team scaling loses context</text>
          <text x="320" y="218" fill="#fca5a5" fontSize="10">• Tribal knowledge doesn't scale</text>
        </g>

        {/* Convergence */}
        <g>
          <path d="M 165 140 L 300 270" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowgreen3)" />
          <path d="M 435 140 L 300 270" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowgreen3)" />
          <path d="M 165 240 L 300 270" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowgreen3)" />
          <path d="M 435 240 L 300 270" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowgreen3)" />

          <circle cx="300" cy="275" r="30" fill="#064e3b" stroke="#10b981" strokeWidth="3" />
          <text x="300" y="280" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="700">PERFECT</text>
          <text x="300" y="293" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="700">TIMING</text>
        </g>

        <defs>
          <marker id="arrowgreen3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        border: '2px solid #10b981'
      }}>
        <strong>Why Now:</strong> Agent adoption + productivity pressure + system complexity + knowledge distribution =
        urgent need for story-based monitoring. The market timing has never been better.
      </div>
    </div>
  );
};

export const WhyNowAgentRevolutionExplainerPanel: React.FC<WhyNowAgentRevolutionExplainerPanelProps> = ({
  className
}) => {
  const [activeSection, setActiveSection] = useState<string>('adoption');

  const sections: Section[] = [
    { id: 'adoption', title: 'Agent Adoption', component: Step1AgentAdoption },
    { id: 'growing-gap', title: 'Growing Gap', component: Step2GrowingGap },
    { id: 'infrastructure', title: 'Infrastructure Ready', component: Step3InfrastructureReady },
    { id: 'market', title: 'Market Opportunity', component: Step4MarketOpportunity },
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || Step1AgentAdoption;

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
          Why Now: The Agent Revolution
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          margin: 0
        }}>
          Understanding the perfect market timing for story-based monitoring
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
