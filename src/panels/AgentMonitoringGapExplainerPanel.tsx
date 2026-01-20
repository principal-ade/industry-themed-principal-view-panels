import React, { useState } from 'react';

export interface AgentMonitoringGapExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1TraditionalDevelopment: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 250" style={{ width: '100%', height: 'auto' }}>
        {/* Developer */}
        <g>
          <circle cx="100" cy="100" r="30" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
          <text x="100" y="105" textAnchor="middle" fill="#fff" fontSize="28">👨‍💻</text>
          <text x="100" y="150" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">DEVELOPER</text>
        </g>

        {/* Arrow 1: Building */}
        <g>
          <line x1="140" y1="100" x2="220" y2="100" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowgreen)" />
          <text x="180" y="90" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="600">Builds Code</text>
          <text x="180" y="118" textAnchor="middle" fill="#10b981" fontSize="9">Gains Expertise</text>
        </g>

        {/* Code System */}
        <g>
          <rect x="230" y="70" width="120" height="60" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="4" />
          <text x="290" y="92" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">CODE</text>
          <text x="290" y="106" textAnchor="middle" fill="#64748b" fontSize="9">system.ts</text>
          <text x="290" y="120" textAnchor="middle" fill="#64748b" fontSize="9">features.ts</text>
        </g>

        {/* Arrow 2: Monitoring */}
        <g>
          <line x1="290" y1="140" x2="290" y2="180" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowblue)" />
          <text x="320" y="165" fill="#3b82f6" fontSize="10" fontWeight="600">Monitors</text>
        </g>

        {/* Production */}
        <g>
          <rect x="230" y="190" width="120" height="45" fill="#064e3b" stroke="#059669" strokeWidth="2" rx="4" />
          <text x="290" y="210" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">PRODUCTION</text>
          <text x="290" y="224" textAnchor="middle" fill="#a7f3d0" fontSize="9">Running System</text>
        </g>

        {/* Knowledge Loop */}
        <g>
          <path d="M 360 100 Q 420 100, 420 160 Q 420 220, 360 220"
                stroke="#fbbf24" strokeWidth="2" fill="none" strokeDasharray="5,5" markerEnd="url(#arrowyellow)" />
          <text x="440" y="160" fill="#fbbf24" fontSize="10" fontWeight="600">Developer</text>
          <text x="440" y="172" fill="#fbbf24" fontSize="10" fontWeight="600">Knowledge</text>
          <text x="440" y="184" fill="#fbbf24" fontSize="10" fontWeight="600">= Monitoring</text>
        </g>

        <defs>
          <marker id="arrowgreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
          </marker>
          <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
          </marker>
          <marker id="arrowyellow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" />
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
        <strong>Traditional Development:</strong> Engineers built deep system knowledge while writing code.
        Their expertise was the monitoring system - they could debug because they understood every piece.
      </div>
    </div>
  );
};

const Step2AgentDevelopment: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 250" style={{ width: '100%', height: 'auto' }}>
        {/* Developer */}
        <g>
          <circle cx="100" cy="100" r="30" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
          <text x="100" y="105" textAnchor="middle" fill="#fff" fontSize="28">👨‍💻</text>
          <text x="100" y="150" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">DEVELOPER</text>
        </g>

        {/* Arrow 1: Directs */}
        <g>
          <line x1="130" y1="80" x2="210" y2="50" stroke="#a78bfa" strokeWidth="2" markerEnd="url(#arrowpurple)" />
          <text x="170" y="55" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">Directs</text>
        </g>

        {/* AI Agent */}
        <g>
          <rect x="220" y="20" width="100" height="50" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" rx="4" />
          <text x="270" y="42" textAnchor="middle" fill="#e9d5ff" fontSize="24">🤖</text>
          <text x="270" y="63" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="600">AI AGENT</text>
        </g>

        {/* Arrow 2: Generates Code */}
        <g>
          <line x1="270" y1="80" x2="270" y2="120" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowred)" strokeDasharray="5,5" />
          <text x="300" y="105" fill="#ef4444" fontSize="10" fontWeight="600">Generates</text>
          <text x="300" y="117" fill="#ef4444" fontSize="9">Without Context</text>
        </g>

        {/* Code System */}
        <g>
          <rect x="220" y="130" width="100" height="60" fill="#1e293b" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="270" y="150" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">CODE</text>
          <text x="270" y="164" textAnchor="middle" fill="#64748b" fontSize="9">agent-gen.ts</text>
          <text x="270" y="178" textAnchor="middle" fill="#64748b" fontSize="9">auto-feat.ts</text>
          <text x="245" y="148" fill="#ef4444" fontSize="24">⚠️</text>
        </g>

        {/* Production */}
        <g>
          <rect x="380" y="130" width="120" height="60" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="440" y="152" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="600">PRODUCTION</text>
          <text x="440" y="166" textAnchor="middle" fill="#fca5a5" fontSize="9">Unknown Behavior</text>
          <text x="440" y="180" textAnchor="middle" fill="#fca5a5" fontSize="9">No Understanding</text>
        </g>

        {/* Arrow 3: Deploy */}
        <g>
          <line x1="330" y1="160" x2="370" y2="160" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowgray)" />
          <text x="350" y="150" textAnchor="middle" fill="#64748b" fontSize="9">Deploy</text>
        </g>

        {/* Broken Knowledge Loop */}
        <g>
          <path d="M 100 130 Q 100 200, 440 200"
                stroke="#ef4444" strokeWidth="3" fill="none" strokeDasharray="5,5" />
          <text x="70" y="225" fill="#ef4444" fontSize="11" fontWeight="700">❌ KNOWLEDGE GAP</text>
          <text x="240" y="225" fill="#ef4444" fontSize="9">Developer didn't build it = No debugging context</text>
        </g>

        <defs>
          <marker id="arrowpurple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#a78bfa" />
          </marker>
          <marker id="arrowred" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
          </marker>
          <marker id="arrowgray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
          </marker>
        </defs>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#fca5a5',
        backgroundColor: '#7f1d1d',
        padding: '16px',
        borderRadius: '6px',
        border: '1px solid #ef4444'
      }}>
        <strong>The Agent Gap:</strong> AI generates code without building developer understanding.
        When issues arise in production, there's no expertise to rely on. Traditional monitoring can't fill this gap.
      </div>
    </div>
  );
};

const Step3TheGap: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        {/* Title */}
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">THE MONITORING GAP</text>

        {/* Traditional Column */}
        <g>
          <rect x="40" y="50" width="220" height="250" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="6" />
          <text x="150" y="75" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="600">TRADITIONAL (Before)</text>

          <rect x="60" y="90" width="180" height="50" fill="#064e3b" stroke="#059669" strokeWidth="1.5" rx="4" />
          <text x="150" y="108" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="600">Developer Expertise</text>
          <text x="150" y="122" textAnchor="middle" fill="#a7f3d0" fontSize="9">Built while coding</text>
          <text x="150" y="133" textAnchor="middle" fill="#a7f3d0" fontSize="9">Deep system knowledge</text>

          <text x="150" y="160" textAnchor="middle" fill="#94a3b8" fontSize="10">+</text>

          <rect x="60" y="170" width="180" height="45" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="4" />
          <text x="150" y="188" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">Basic Monitoring</text>
          <text x="150" y="202" textAnchor="middle" fill="#64748b" fontSize="9">Logs, metrics, traces</text>

          <text x="150" y="235" textAnchor="middle" fill="#10b981" fontSize="11">=</text>

          <rect x="60" y="245" width="180" height="40" fill="#064e3b" stroke="#059669" strokeWidth="2" rx="4" />
          <text x="150" y="264" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="700">✓ Effective Monitoring</text>
          <text x="150" y="277" textAnchor="middle" fill="#a7f3d0" fontSize="9">Human knowledge filled gaps</text>
        </g>

        {/* AI-Era Column */}
        <g>
          <rect x="340" y="50" width="220" height="250" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="6" />
          <text x="450" y="75" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="600">AI-ERA (Now)</text>

          <rect x="360" y="90" width="180" height="50" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" rx="4" />
          <text x="450" y="108" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="600">❌ No Expertise</text>
          <text x="450" y="122" textAnchor="middle" fill="#fca5a5" fontSize="9">AI wrote the code</text>
          <text x="450" y="133" textAnchor="middle" fill="#fca5a5" fontSize="9">Developer has no context</text>

          <text x="450" y="160" textAnchor="middle" fill="#94a3b8" fontSize="10">+</text>

          <rect x="360" y="170" width="180" height="45" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="4" />
          <text x="450" y="188" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">Basic Monitoring</text>
          <text x="450" y="202" textAnchor="middle" fill="#64748b" fontSize="9">Same logs, metrics, traces</text>

          <text x="450" y="235" textAnchor="middle" fill="#ef4444" fontSize="11">=</text>

          <rect x="360" y="245" width="180" height="40" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="4" />
          <text x="450" y="264" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="700">❌ Monitoring Gap</text>
          <text x="450" y="277" textAnchor="middle" fill="#fca5a5" fontSize="9">No knowledge to fill gaps</text>
        </g>

        {/* Gap Arrow */}
        <g>
          <path d="M 280 200 L 320 200" stroke="#fbbf24" strokeWidth="3" markerEnd="url(#arrowyellow2)" />
          <text x="300" y="190" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="700">THE GAP</text>
        </g>

        <defs>
          <marker id="arrowyellow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" />
          </marker>
        </defs>
      </svg>

      <div style={{
        fontSize: '14px',
        color: '#fef3c7',
        backgroundColor: '#78350f',
        padding: '16px',
        borderRadius: '6px',
        border: '2px solid #fbbf24'
      }}>
        <strong>The Critical Gap:</strong> Traditional monitoring worked because developer expertise filled the gaps.
        With AI agents, that expertise is missing. <strong>We need tools to encapsulate what was once in developers' heads.</strong>
      </div>
    </div>
  );
};

const Step4ImplicationsDevelopers: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        {/* Title */}
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">WHAT THIS MEANS FOR DEVELOPERS</text>

        {/* Developer as Team Lead */}
        <g>
          <rect x="40" y="50" width="250" height="100" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" rx="6" />
          <text x="165" y="72" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="700">Every Engineer = Team Lead</text>

          <text x="50" y="92" fill="#94a3b8" fontSize="10">✓ Manages AI agents making changes</text>
          <text x="50" y="108" fill="#94a3b8" fontSize="10">✓ Reviews agent-generated code</text>
          <text x="50" y="124" fill="#94a3b8" fontSize="10">✓ Ensures quality & correctness</text>
          <text x="50" y="140" fill="#10b981" fontSize="10" fontWeight="600">→ Time shifts from coding to oversight</text>
        </g>

        {/* The Challenge */}
        <g>
          <rect x="310" y="50" width="250" height="100" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" rx="6" />
          <text x="435" y="72" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="700">The Challenge</text>

          <text x="320" y="92" fill="#fca5a5" fontSize="10">❌ Can't fully trust agent output</text>
          <text x="320" y="108" fill="#fca5a5" fontSize="10">❌ No context for debugging issues</text>
          <text x="320" y="124" fill="#fca5a5" fontSize="10">❌ Traditional tools don't help</text>
          <text x="320" y="140" fill="#fca5a5" fontSize="10" fontWeight="600">→ Can't leverage agents without risk</text>
        </g>

        {/* What's Needed */}
        <g>
          <rect x="40" y="170" width="520" height="90" fill="#064e3b" stroke="#10b981" strokeWidth="3" rx="6" />
          <text x="300" y="195" textAnchor="middle" fill="#6ee7b7" fontSize="13" fontWeight="700">WHAT DEVELOPERS NEED</text>

          <text x="60" y="218" fill="#a7f3d0" fontSize="11">1. <tspan fontWeight="600">Encode Expectations:</tspan> Define what the system should do</text>
          <text x="60" y="235" fill="#a7f3d0" fontSize="11">2. <tspan fontWeight="600">Automatic Validation:</tspan> Verify agent changes against expectations</text>
          <text x="60" y="252" fill="#a7f3d0" fontSize="11">3. <tspan fontWeight="600">Confidence to Deploy:</tspan> Trust that agents' work is correct</text>
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
        <strong>The Opportunity:</strong> Developers have time to craft system expectations instead of writing every line.
        They need tools that turn those expectations into automated verification - making agent work trustworthy.
      </div>
    </div>
  );
};

export const AgentMonitoringGapExplainerPanel: React.FC<AgentMonitoringGapExplainerPanelProps> = ({
  className
}) => {
  const [activeSection, setActiveSection] = useState<string>('traditional');

  const sections: Section[] = [
    { id: 'traditional', title: 'Traditional Development', component: Step1TraditionalDevelopment },
    { id: 'agent-era', title: 'Agent Era', component: Step2AgentDevelopment },
    { id: 'the-gap', title: 'The Gap', component: Step3TheGap },
    { id: 'implications', title: 'What Developers Need', component: Step4ImplicationsDevelopers },
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || Step1TraditionalDevelopment;

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
          The Agent Monitoring Gap
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          margin: 0
        }}>
          Why traditional monitoring fails with AI-generated code
        </p>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #334155',
        paddingBottom: '12px'
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
