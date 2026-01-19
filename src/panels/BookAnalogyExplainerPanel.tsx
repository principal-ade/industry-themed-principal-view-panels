import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';

export interface BookAnalogyExplainerPanelProps {
  className?: string;
}

interface Section {
  id: string;
  title: string;
  component: React.ComponentType;
}

const Step1BookStructure: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 280" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">CANVASES ARE LIKE A BOOK'S TABLE OF CONTENTS</text>

        {/* Book visualization */}
        <g>
          <rect x="150" y="50" width="300" height="215" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="3" rx="6" />
          <text x="300" y="75" textAnchor="middle" fill="#ddd6fe" fontSize="12" fontWeight="700">📖 The Complete System (Book)</text>
          <text x="300" y="92" textAnchor="middle" fill="#c4b5fd" fontSize="9">complete-system.otel.canvas</text>

          <rect x="170" y="105" width="260" height="150" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" rx="4" />
          <text x="180" y="125" fill="#e9d5ff" fontSize="10" fontWeight="600">Table of Contents:</text>

          {/* Part I */}
          <rect x="185" y="135" width="230" height="35" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" rx="3" />
          <text x="195" y="150" fill="#dbeafe" fontSize="9" fontWeight="600">Part I: API Layer</text>
          <text x="200" y="162" fill="#93c5fd" fontSize="7">Chapter 1: Authentication</text>

          {/* Part II */}
          <rect x="185" y="175" width="230" height="35" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" rx="3" />
          <text x="195" y="190" fill="#d1fae5" fontSize="9" fontWeight="600">Part II: Business Logic</text>
          <text x="200" y="202" fill="#6ee7b7" fontSize="7">Chapter 2: Order Processing</text>

          {/* Part III */}
          <rect x="185" y="215" width="230" height="35" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1.5" rx="3" />
          <text x="195" y="230" fill="#ddd6fe" fontSize="9" fontWeight="600">Part III: Data Access</text>
          <text x="200" y="242" fill="#c4b5fd" fontSize="7">Chapter 3: Database Operations</text>
        </g>

        {/* Analogy explanation */}
        <g>
          <rect x="40" y="50" width="95" height="100" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="3" />
          <text x="87" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">Canvas =</text>
          <text x="87" y="85" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">Table of</text>
          <text x="87" y="100" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">Contents</text>
          <text x="50" y="120" fill="#94a3b8" fontSize="7">Shows structure</text>
          <text x="50" y="132" fill="#94a3b8" fontSize="7">and organization</text>
        </g>

        <g>
          <rect x="465" y="50" width="95" height="100" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="3" />
          <text x="512" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">Nodes =</text>
          <text x="512" y="85" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">Chapters/</text>
          <text x="512" y="100" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">Sections</text>
          <text x="475" y="120" fill="#94a3b8" fontSize="7">Individual parts</text>
          <text x="475" y="132" fill="#94a3b8" fontSize="7">of the book</text>
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
        A <strong style={{ color: '#8b5cf6' }}>.otel.canvas file</strong> is like a <strong>table of contents</strong> for your system—it shows the structure and how the parts are organized.
      </div>
    </div>
  );
};

const Step2ReadersJourney: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">OTEL TRACES ARE LIKE AN ANNOTATED READING SESSION</text>

        {/* Reader's journey */}
        <g>
          <rect x="40" y="50" width="520" height="235" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="600">📚 Reader's Annotated Journey (OTEL Trace)</text>
          <text x="300" y="87" textAnchor="middle" fill="#fbbf24" fontSize="9">trace_id: "reader-alice-session-2025-01-18"</text>

          {/* Reading timeline */}
          <rect x="60" y="105" width="480" height="170" fill="#1e293b" stroke="#64748b" strokeWidth="1" rx="3" />

          {/* Part I reading */}
          <rect x="75" y="120" width="200" height="45" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="3" />
          <text x="85" y="135" fill="#dbeafe" fontSize="9" fontWeight="600">Read Part I: API Layer</text>
          <text x="90" y="148" fill="#93c5fd" fontSize="7">Started: 10:00 AM</text>
          <text x="90" y="158" fill="#93c5fd" fontSize="7">Completed: 10:15 AM</text>

          {/* Part II reading */}
          <rect x="290" y="120" width="240" height="45" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="3" />
          <text x="300" y="135" fill="#d1fae5" fontSize="9" fontWeight="600">Read Part II: Business Logic</text>
          <text x="305" y="148" fill="#6ee7b7" fontSize="7">Started: 10:15 AM</text>
          <text x="305" y="158" fill="#6ee7b7" fontSize="7">Completed: 10:30 AM</text>

          {/* Annotations */}
          <rect x="75" y="180" width="450" height="85" fill="#422006" stroke="#fbbf24" strokeWidth="1" rx="3" />
          <text x="85" y="195" fill="#fde68a" fontSize="9" fontWeight="600">📝 Reader's Annotations (Span Attributes):</text>
          <text x="90" y="210" fill="#fbbf24" fontSize="8">✓ Highlighted key concepts in Chapter 1, line 45</text>
          <text x="90" y="223" fill="#fbbf24" fontSize="8">✓ Added bookmark at Chapter 2, page 87</text>
          <text x="90" y="236" fill="#fbbf24" fontSize="8">✓ Noted "important!" at Section 2.3</text>
          <text x="90" y="249" fill="#fbbf24" fontSize="8">✓ Comprehension check: passed ✓</text>
        </g>

        {/* Analogy box */}
        <g>
          <rect x="560" y="50" width="40" height="1" fill="none" />
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
        An <strong style={{ color: '#f59e0b' }}>OTEL trace</strong> is like a reader's annotated journey through the book—timestamps, highlights, bookmarks, and notes about what happened and when.
      </div>
    </div>
  );
};

const Step3NestedReading: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">PARENT-CHILD SPANS = NESTED READING EXPERIENCE</text>

        {/* Nested reading structure */}
        <g>
          <rect x="40" y="50" width="520" height="255" fill="#0f172a" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="70" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">Reading the Complete Book (Root Span)</text>
          <text x="300" y="85" textAnchor="middle" fill="#c4b5fd" fontSize="8">span_id: root | duration: 60 minutes</text>

          {/* Level 1: Parts */}
          <rect x="60" y="100" width="140" height="60" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="3" />
          <text x="130" y="118" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="600">Reading Part I</text>
          <text x="70" y="133" fill="#93c5fd" fontSize="7">span_id: part-1</text>
          <text x="70" y="145" fill="#93c5fd" fontSize="7">parent: root</text>
          <text x="70" y="155" fill="#60a5fa" fontSize="6">duration: 20 min</text>

          <rect x="230" y="100" width="140" height="60" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="3" />
          <text x="300" y="118" textAnchor="middle" fill="#d1fae5" fontSize="9" fontWeight="600">Reading Part II</text>
          <text x="240" y="133" fill="#6ee7b7" fontSize="7">span_id: part-2</text>
          <text x="240" y="145" fill="#6ee7b7" fontSize="7">parent: root</text>
          <text x="240" y="155" fill="#34d399" fontSize="6">duration: 25 min</text>

          <rect x="400" y="100" width="140" height="60" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" rx="3" />
          <text x="470" y="118" textAnchor="middle" fill="#ddd6fe" fontSize="9" fontWeight="600">Reading Part III</text>
          <text x="410" y="133" fill="#c4b5fd" fontSize="7">span_id: part-3</text>
          <text x="410" y="145" fill="#c4b5fd" fontSize="7">parent: root</text>
          <text x="410" y="155" fill="#a78bfa" fontSize="6">duration: 15 min</text>

          {/* Arrows down */}
          <line x1="130" y1="165" x2="130" y2="180" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />
          <line x1="300" y1="165" x2="300" y2="180" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />

          {/* Level 2: Chapters */}
          <rect x="60" y="185" width="140" height="50" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="1.5" rx="3" />
          <text x="130" y="202" textAnchor="middle" fill="#e0f2fe" fontSize="8" fontWeight="600">Reading Chapter 1</text>
          <text x="70" y="215" fill="#7dd3fc" fontSize="7">span_id: ch-1</text>
          <text x="70" y="225" fill="#7dd3fc" fontSize="7">parent: part-1</text>

          <rect x="230" y="185" width="140" height="50" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="1.5" rx="3" />
          <text x="300" y="202" textAnchor="middle" fill="#e0f2fe" fontSize="8" fontWeight="600">Reading Chapter 2</text>
          <text x="240" y="215" fill="#7dd3fc" fontSize="7">span_id: ch-2</text>
          <text x="240" y="225" fill="#7dd3fc" fontSize="7">parent: part-2</text>

          {/* Arrows down */}
          <line x1="130" y1="240" x2="130" y2="255" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,2" />

          {/* Level 3: Sections */}
          <rect x="60" y="260" width="140" height="35" fill="#713f12" stroke="#f59e0b" strokeWidth="1.5" rx="3" />
          <text x="130" y="275" textAnchor="middle" fill="#fef3c7" fontSize="7" fontWeight="600">Reading Section 1.1</text>
          <text x="70" y="287" fill="#fde68a" fontSize="6">parent: ch-1</text>
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
        <strong style={{ color: '#8b5cf6' }}>Parent-child spans</strong> create a nested reading experience: Reading the book → Reading a part → Reading a chapter → Reading a section. Each level tracks its own duration and details.
      </div>
    </div>
  );
};

const Step4MultipleOutlines: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">HIERARCHICAL COMPOSITION = MULTIPLE NESTED OUTLINES</text>

        {/* Complete book outline */}
        <g>
          <rect x="150" y="50" width="300" height="80" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="3" rx="6" />
          <text x="300" y="75" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="700">📖 complete-book.otel.canvas</text>
          <text x="160" y="95" fill="#c4b5fd" fontSize="8">Outline:</text>
          <text x="165" y="108" fill="#a78bfa" fontSize="8">• Part I → references part-1.otel.canvas</text>
          <text x="165" y="120" fill="#a78bfa" fontSize="8">• Part II → references part-2.otel.canvas</text>
        </g>

        {/* Arrows down */}
        <line x1="240" y1="135" x2="160" y2="160" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple3)" />
        <line x1="360" y1="135" x2="440" y2="160" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrow-purple3)" />

        {/* Part outlines */}
        <g>
          <rect x="40" y="165" width="200" height="85" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="140" y="185" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">part-1.otel.canvas</text>
          <text x="50" y="200" fill="#93c5fd" fontSize="8">Part I Outline:</text>
          <text x="55" y="213" fill="#93c5fd" fontSize="7">• Chapter 1: Authentication</text>
          <text x="60" y="224" fill="#60a5fa" fontSize="7">- Section 1.1: Login</text>
          <text x="60" y="235" fill="#60a5fa" fontSize="7">- Section 1.2: Tokens</text>
        </g>

        <g>
          <rect x="360" y="165" width="200" height="85" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="460" y="185" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">part-2.otel.canvas</text>
          <text x="370" y="200" fill="#6ee7b7" fontSize="8">Part II Outline:</text>
          <text x="375" y="213" fill="#6ee7b7" fontSize="7">• Chapter 2: Order Processing</text>
          <text x="380" y="224" fill="#34d399" fontSize="7">- Section 2.1: Create Order</text>
          <text x="380" y="235" fill="#34d399" fontSize="7">- Section 2.2: Validate Order</text>
        </g>

        {/* The insight */}
        <g>
          <rect x="40" y="270" width="520" height="55" fill="#1e1b4b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="290" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="600">Each Part Has Its Own Detailed Outline</text>
          <text x="50" y="308" fill="#ddd6fe" fontSize="8">The complete book's outline references each part's outline. Each part can be read</text>
          <text x="50" y="320" fill="#ddd6fe" fontSize="8">independently OR as part of the complete book—same reading session, multiple views!</text>
        </g>

        <defs>
          <marker id="arrow-purple3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        <strong style={{ color: '#8b5cf6' }}>Hierarchical composition</strong> works like nested book outlines: the complete book references part outlines, which reference chapter outlines. Each level can be validated independently!
      </div>
    </div>
  );
};

const Step5DifferentLevels: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 300" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">VALIDATION AT DIFFERENT READING LEVELS</text>

        {/* Chapter level */}
        <g>
          <rect x="40" y="50" width="250" height="110" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">📄 Chapter-Level Validation</text>

          <rect x="55" y="80" width="220" height="70" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="3" />
          <text x="65" y="95" fill="#bfdbfe" fontSize="8" fontWeight="600">Did the reader understand Chapter 1?</text>
          <text x="70" y="110" fill="#93c5fd" fontSize="7">✓ Read Section 1.1: Login (5 min)</text>
          <text x="70" y="122" fill="#93c5fd" fontSize="7">✓ Read Section 1.2: Tokens (4 min)</text>
          <text x="70" y="134" fill="#60a5fa" fontSize="7" fontWeight="bold">✓ Chapter 1 comprehension: PASSED</text>
        </g>

        {/* Part level */}
        <g>
          <rect x="310" y="50" width="250" height="110" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">📚 Part-Level Validation</text>

          <rect x="325" y="80" width="220" height="70" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="335" y="95" fill="#a7f3d0" fontSize="8" fontWeight="600">Did Part I build the foundation?</text>
          <text x="340" y="110" fill="#6ee7b7" fontSize="7">✓ Chapter 1: Authentication complete</text>
          <text x="340" y="122" fill="#6ee7b7" fontSize="7">✓ Chapters flow logically</text>
          <text x="340" y="134" fill="#34d399" fontSize="7" fontWeight="bold">✓ Part I learning goals: ACHIEVED</text>
        </g>

        {/* Book level */}
        <g>
          <rect x="40" y="175" width="520" height="110" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="195" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">📖 Complete Book Validation</text>

          <rect x="55" y="205" width="490" height="70" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="65" y="220" fill="#e9d5ff" fontSize="8" fontWeight="600">Did the reader go from beginner to expert?</text>
          <text x="70" y="235" fill="#c4b5fd" fontSize="7">✓ Part I (Foundation) → Part II (Advanced) → Part III (Applications)</text>
          <text x="70" y="247" fill="#c4b5fd" fontSize="7">✓ All learning objectives met</text>
          <text x="70" y="259" fill="#c4b5fd" fontSize="7">✓ Complete reading journey validated</text>
          <text x="70" y="271" fill="#a78bfa" fontSize="7" fontWeight="bold">✓ Reader transformation: Beginner → Expert ✓</text>
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
        <strong>Same reading session</strong>, validated at three levels: Did they understand <strong style={{ color: '#3b82f6' }}>this chapter</strong>? Did <strong style={{ color: '#10b981' }}>this part</strong> achieve its goals? Did the <strong style={{ color: '#8b5cf6' }}>complete book</strong> transform the reader?
      </div>
    </div>
  );
};

const Step6ReadingPaths: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">NARRATIVES = DIFFERENT READING PATHS</text>

        {/* The book */}
        <g>
          <rect x="200" y="50" width="200" height="60" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="300" y="75" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">📖 Programming Mastery</text>
          <text x="300" y="92" textAnchor="middle" fill="#c4b5fd" fontSize="8">(The Same Book)</text>
        </g>

        {/* Arrows to different paths */}
        <line x1="200" y1="80" x2="120" y2="135" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow-gray2)" />
        <line x1="300" y1="115" x2="300" y2="135" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow-gray2)" />
        <line x1="400" y1="80" x2="480" y2="135" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow-gray2)" />

        {/* Path 1: Beginner */}
        <g>
          <rect x="40" y="140" width="140" height="165" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" rx="4" />
          <text x="110" y="160" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="600">🎓 Beginner Path</text>
          <text x="50" y="175" fill="#93c5fd" fontSize="8">beginner.narrative.json</text>

          <rect x="50" y="185" width="120" height="110" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" rx="2" />
          <text x="60" y="200" fill="#bfdbfe" fontSize="7" fontWeight="600">Reading Guide:</text>
          <text x="65" y="213" fill="#93c5fd" fontSize="7">1. Start with Part I</text>
          <text x="65" y="225" fill="#93c5fd" fontSize="7">2. Read all chapters</text>
          <text x="65" y="237" fill="#93c5fd" fontSize="7">3. Do exercises</text>
          <text x="65" y="249" fill="#93c5fd" fontSize="7">4. Take your time</text>
          <text x="60" y="265" fill="#60a5fa" fontSize="7" fontWeight="bold">Expected: 6 weeks</text>
          <text x="60" y="278" fill="#60a5fa" fontSize="7" fontWeight="bold">Skip nothing!</text>
        </g>

        {/* Path 2: Advanced */}
        <g>
          <rect x="230" y="140" width="140" height="165" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="300" y="160" textAnchor="middle" fill="#d1fae5" fontSize="10" fontWeight="600">🚀 Advanced Path</text>
          <text x="240" y="175" fill="#6ee7b7" fontSize="8">advanced.narrative.json</text>

          <rect x="240" y="185" width="120" height="110" fill="#022c22" stroke="#059669" strokeWidth="1" rx="2" />
          <text x="250" y="200" fill="#a7f3d0" fontSize="7" fontWeight="600">Reading Guide:</text>
          <text x="255" y="213" fill="#6ee7b7" fontSize="7">1. Skim Part I</text>
          <text x="255" y="225" fill="#6ee7b7" fontSize="7">2. Focus on Part II</text>
          <text x="255" y="237" fill="#6ee7b7" fontSize="7">3. Deep dive Part III</text>
          <text x="255" y="249" fill="#6ee7b7" fontSize="7">4. Skip basics</text>
          <text x="250" y="265" fill="#34d399" fontSize="7" fontWeight="bold">Expected: 2 weeks</text>
          <text x="250" y="278" fill="#34d399" fontSize="7" fontWeight="bold">Advanced topics only</text>
        </g>

        {/* Path 3: Reference */}
        <g>
          <rect x="420" y="140" width="140" height="165" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="490" y="160" textAnchor="middle" fill="#ddd6fe" fontSize="10" fontWeight="600">📑 Reference Path</text>
          <text x="430" y="175" fill="#c4b5fd" fontSize="8">reference.narrative.json</text>

          <rect x="430" y="185" width="120" height="110" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" rx="2" />
          <text x="440" y="200" fill="#e9d5ff" fontSize="7" fontWeight="600">Reading Guide:</text>
          <text x="445" y="213" fill="#c4b5fd" fontSize="7">1. Jump to any chapter</text>
          <text x="445" y="225" fill="#c4b5fd" fontSize="7">2. Look up as needed</text>
          <text x="445" y="237" fill="#c4b5fd" fontSize="7">3. Use index/search</text>
          <text x="445" y="249" fill="#c4b5fd" fontSize="7">4. Non-linear reading</text>
          <text x="440" y="265" fill="#a78bfa" fontSize="7" fontWeight="bold">Expected: Ongoing</text>
          <text x="440" y="278" fill="#a78bfa" fontSize="7" fontWeight="bold">Random access</text>
        </g>

        <defs>
          <marker id="arrow-gray2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
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
        <strong style={{ color: '#8b5cf6' }}>Narratives</strong> are like reading guides for the same book—beginners read cover-to-cover, advanced readers skip to Part II, reference readers jump around. Each validates a different expected journey!
      </div>
    </div>
  );
};

const Step7WhyItWorks: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <svg viewBox="0 0 600 340" style={{ width: '100%', height: 'auto' }}>
        <text x="300" y="25" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">WHY THE BOOK ANALOGY WORKS SO WELL</text>

        {/* Mapping */}
        <g>
          <rect x="40" y="50" width="250" height="135" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2" rx="4" />
          <text x="165" y="70" textAnchor="middle" fill="#ddd6fe" fontSize="11" fontWeight="600">📚 Book Concepts</text>

          <rect x="55" y="80" width="220" height="95" fill="#4c1d95" stroke="#a78bfa" strokeWidth="1" rx="3" />
          <text x="65" y="95" fill="#e9d5ff" fontSize="8">📖 Table of contents</text>
          <text x="65" y="107" fill="#e9d5ff" fontSize="8">📚 Reader's annotated session</text>
          <text x="65" y="119" fill="#e9d5ff" fontSize="8">📄 Nested parts/chapters/sections</text>
          <text x="65" y="131" fill="#e9d5ff" fontSize="8">🎓 Reading guides (beginner/advanced)</text>
          <text x="65" y="143" fill="#e9d5ff" fontSize="8">✓ Comprehension checks</text>
          <text x="65" y="155" fill="#e9d5ff" fontSize="8">🏷️ Bookmarks and highlights</text>
          <text x="65" y="167" fill="#e9d5ff" fontSize="8">📚 Book series (multiple books)</text>
        </g>

        <text x="300" y="120" textAnchor="middle" fill="#f59e0b" fontSize="16" fontWeight="700">→</text>

        <g>
          <rect x="310" y="50" width="250" height="135" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
          <text x="435" y="70" textAnchor="middle" fill="#d1fae5" fontSize="11" fontWeight="600">💻 Technical Concepts</text>

          <rect x="325" y="80" width="220" height="95" fill="#022c22" stroke="#059669" strokeWidth="1" rx="3" />
          <text x="335" y="95" fill="#a7f3d0" fontSize="8">.otel.canvas file structure</text>
          <text x="335" y="107" fill="#a7f3d0" fontSize="8">OTEL trace with spans</text>
          <text x="335" y="119" fill="#a7f3d0" fontSize="8">Parent-child span relationships</text>
          <text x="335" y="131" fill="#a7f3d0" fontSize="8">Narrative templates (scenarios)</text>
          <text x="335" y="143" fill="#a7f3d0" fontSize="8">Validation engine</text>
          <text x="335" y="155" fill="#a7f3d0" fontSize="8">Span attributes (metadata)</text>
          <text x="335" y="167" fill="#a7f3d0" fontSize="8">Monorepo packages</text>
        </g>

        {/* The power */}
        <g>
          <rect x="40" y="200" width="520" height="125" fill="#1e293b" stroke="#10b981" strokeWidth="3" rx="4" />
          <text x="300" y="220" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="700">THE POWER OF THE ANALOGY</text>

          <text x="50" y="243" fill="#cbd5e1" fontSize="9">Everyone understands books! The analogy makes complex concepts intuitive:</text>

          <text x="60" y="263" fill="#a7f3d0" fontSize="8">✓ <tspan fontWeight="bold">Natural hierarchy</tspan> - Parts contain chapters contain sections (like canvases compose)</text>
          <text x="60" y="277" fill="#a7f3d0" fontSize="8">✓ <tspan fontWeight="bold">Multiple views</tspan> - Same book, different reading paths (like narratives)</text>
          <text x="60" y="291" fill="#a7f3d0" fontSize="8">✓ <tspan fontWeight="bold">Progress tracking</tspan> - Reading annotations (like OTEL traces)</text>
          <text x="60" y="305" fill="#a7f3d0" fontSize="8">✓ <tspan fontWeight="bold">Independent yet connected</tspan> - Each chapter works alone, but builds to complete story</text>
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
        The book analogy works because <strong style={{ color: '#10b981' }}>everyone has read a book</strong>! It makes hierarchical canvas composition, OTEL traces, and validation narratives feel natural and intuitive.
      </div>
    </div>
  );
};

const sections: Section[] = [
  { id: 'structure', title: 'Canvases = Table of Contents', component: Step1BookStructure },
  { id: 'journey', title: 'OTEL Traces = Annotated Reading', component: Step2ReadersJourney },
  { id: 'nested', title: 'Parent-Child Spans = Nested Reading', component: Step3NestedReading },
  { id: 'outlines', title: 'Composition = Nested Outlines', component: Step4MultipleOutlines },
  { id: 'levels', title: 'Validation at Different Levels', component: Step5DifferentLevels },
  { id: 'paths', title: 'Narratives = Reading Paths', component: Step6ReadingPaths },
  { id: 'why', title: 'Why This Analogy Works', component: Step7WhyItWorks },
];

export const BookAnalogyExplainerPanel: React.FC<BookAnalogyExplainerPanelProps> = ({ className }) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['structure']));

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
          📖 The Book Analogy
        </h1>
        <p style={{ color: theme.colors.textSecondary, fontSize: '18px' }}>
          Understanding canvas composition through the familiar metaphor of reading a book
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
          Now You're Ready!
        </h3>
        <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>
          With this book analogy in mind, the technical concepts of canvas composition, OTEL traces, and
          hierarchical validation should feel natural. Think of building your system's validation the same way
          you'd organize a well-structured book—with clear chapters, multiple reading paths, and validation at every level.
        </div>
      </div>
    </div>
  );
};

export default BookAnalogyExplainerPanel;
