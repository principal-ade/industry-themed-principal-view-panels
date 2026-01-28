import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { CanvasDetailPanel } from './CanvasDetailPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { DataSlice } from '../types';

/**
 * Skill Installation - Multi-Agent Telemetry
 *
 * Demonstrates per-event attribute rendering in workflow templates.
 * Shows the same skill being installed to different agents with varying attributes.
 */
const meta = {
  title: 'Panels/SkillInstallation',
  component: CanvasDetailPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Skill installation visualization showing per-event attributes (different agents, modes) rendered in workflow templates.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof CanvasDetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Mock Data - Skill Installation Flow
// ============================================================================

const skillInstallationCanvas = {
  nodes: [
    {
      id: 'installation-started',
      type: 'text',
      text: '# Installation Started',
      x: 200,
      y: 0,
      width: 200,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#3b82f6',
        otel: {
          kind: 'event',
        },
        event: {
          name: 'installation.started',
          description: 'Installation begins',
          attributes: {
            'install.scope': { type: 'string', required: true },
            'install.mode': { type: 'string', required: true },
          },
        },
      },
    },
    {
      id: 'skill-installing',
      type: 'text',
      text: '# Skill Installing',
      x: 200,
      y: 120,
      width: 200,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#10b981',
        otel: {
          kind: 'event',
        },
        event: {
          name: 'skill.installing',
          description: 'Installing to agent',
          attributes: {
            'skill.name': { type: 'string', required: true },
            'agent.name': { type: 'string', required: true },
            'install.mode': { type: 'string', required: true },
          },
        },
      },
    },
    {
      id: 'skill-installed',
      type: 'text',
      text: '# Skill Installed',
      x: 200,
      y: 240,
      width: 200,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#10b981',
        otel: {
          kind: 'event',
        },
        event: {
          name: 'skill.installed',
          description: 'Installation complete',
          attributes: {
            'skill.name': { type: 'string', required: true },
            'agent.name': { type: 'string', required: true },
          },
        },
      },
    },
    {
      id: 'installation-complete',
      type: 'text',
      text: '# Installation Complete',
      x: 200,
      y: 360,
      width: 200,
      height: 80,
      color: '#1e3a5f',
      pv: {
        nodeType: 'event',
        fill: '#ec4899',
        otel: {
          kind: 'event',
        },
        event: {
          name: 'installation.complete',
          description: 'All installations done',
          attributes: {
            'install.success_count': { type: 'number', required: true },
            'install.failure_count': { type: 'number', required: true },
          },
        },
      },
    },
  ],
  edges: [
    { id: 'edge-1', fromNode: 'installation-started', toNode: 'skill-installing', fromSide: 'bottom', toSide: 'top' },
    { id: 'edge-2', fromNode: 'skill-installing', toNode: 'skill-installed', fromSide: 'bottom', toSide: 'top' },
    { id: 'edge-3', fromNode: 'skill-installed', toNode: 'installation-complete', fromSide: 'bottom', toSide: 'top' },
  ],
  pv: {
    version: '1.0.0',
    name: 'Skill Installation Flow',
    description: 'Multi-agent skill installation',
  },
};

const skillInstallationNarrative = {
  version: '1.0.0',
  canvas: 'skill-installation.otel.canvas',
  name: 'Skill Installation',
  description: 'Skill installation execution scenarios',
  mode: 'timeline',
  scenarioSelection: 'first-match',
  scenarios: [
    {
      id: 'success',
      priority: 1,
      description: 'Successful installation',
      condition: {
        requires: ['installation.complete'],
        assertions: {
          'install.failure_count': { $eq: 0 },
        },
      },
      template: {
        introduction: '✅ Skill Installation Successful',
        events: {
          'installation.started': 'Starting installation ({{install.scope}})',
          'skill.installing': 'Installing {{skill.name}} to {{agent.name}} (Mode: {{install.mode}})',
          'skill.installed': 'Installed successfully',
          'installation.complete': '{{install.success_count}} successful installations',
        },
      },
    },
    {
      id: 'default',
      priority: 99,
      description: 'Default scenario',
      condition: {
        default: true,
      },
      template: {
        introduction: 'Skill Installation',
        events: {
          'installation.started': 'Installation started',
          'skill.installing': 'Installing skill',
          'skill.installed': 'Skill installed',
          'installation.complete': 'Installation complete',
        },
      },
    },
  ],
};

/**
 * Multi-agent installation execution
 * Demonstrates per-event attributes with different agent names and modes
 */
const multiAgentInstallation = {
  metadata: {
    canvasName: 'Skill Installation Flow',
    exportedAt: new Date().toISOString(),
    source: 'test:skill-installation',
    framework: 'bun',
    status: 'success' as const,
  },
  spans: [
    {
      id: 'span-skill-install',
      name: 'install demo-skill globally',
      startTime: 1704067200000,
      endTime: 1704067205000,
      duration: 5000,
      status: 'OK' as const,
      attributes: {
        'span.kind': 'test.case',
        'test.name': 'install demo-skill to multiple agents',
        'test.framework': 'bun',
        'test.file': 'skill-install.test.ts',
      },
      events: [
        {
          time: 1704067200000,
          name: 'installation.started',
          attributes: {
            'install.scope': 'global',
            'install.mode': 'copy',
          },
        },
        // Install to Amp with symlink
        {
          time: 1704067201000,
          name: 'skill.installing',
          attributes: {
            'skill.name': 'demo-skill',
            'agent.name': 'Amp',
            'install.mode': 'symlink',
            'install.scope': 'global',
          },
        },
        {
          time: 1704067201500,
          name: 'skill.installed',
          attributes: {
            'skill.name': 'demo-skill',
            'agent.name': 'Amp',
          },
        },
        // Install to Cursor with symlink
        {
          time: 1704067202000,
          name: 'skill.installing',
          attributes: {
            'skill.name': 'demo-skill',
            'agent.name': 'Cursor',
            'install.mode': 'symlink',
            'install.scope': 'global',
          },
        },
        {
          time: 1704067202500,
          name: 'skill.installed',
          attributes: {
            'skill.name': 'demo-skill',
            'agent.name': 'Cursor',
          },
        },
        // Install to Claude Code with copy
        {
          time: 1704067203000,
          name: 'skill.installing',
          attributes: {
            'skill.name': 'demo-skill',
            'agent.name': 'Claude Code',
            'install.mode': 'copy',
            'install.scope': 'global',
          },
        },
        {
          time: 1704067203500,
          name: 'skill.installed',
          attributes: {
            'skill.name': 'demo-skill',
            'agent.name': 'Claude Code',
          },
        },
        // Install to Windsurf with symlink
        {
          time: 1704067204000,
          name: 'skill.installing',
          attributes: {
            'skill.name': 'demo-skill',
            'agent.name': 'Windsurf',
            'install.mode': 'symlink',
            'install.scope': 'global',
          },
        },
        {
          time: 1704067204500,
          name: 'skill.installed',
          attributes: {
            'skill.name': 'demo-skill',
            'agent.name': 'Windsurf',
          },
        },
        {
          time: 1704067205000,
          name: 'installation.complete',
          attributes: {
            'install.success_count': 4,
            'install.failure_count': 0,
          },
        },
      ],
    },
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

const createMockProvider = (files: Array<{ path: string; relativePath: string; name: string; content: string }>) => {
  const fileTreeData = { allFiles: files };
  const mockSlices = new Map<string, DataSlice>();
  mockSlices.set('fileTree', {
    scope: 'repository',
    name: 'fileTree',
    data: fileTreeData,
    loading: false,
    error: null,
    refresh: async () => {},
  });

  return {
    contextOverrides: {
      slices: mockSlices,
      getSlice: <T,>(name: string) => mockSlices.get(name) as DataSlice<T> | undefined,
      repositoryPath: '/mock/repository',
    },
    actionsOverrides: {
      readFile: async (path: string) => {
        const file = files.find((f) => path.endsWith(f.relativePath));
        if (!file) throw new Error(`File not found: ${path}`);
        return file.content;
      },
    },
  };
};

// ============================================================================
// Stories
// ============================================================================

/**
 * Multi-Agent Installation
 *
 * Shows installation of the same skill to 4 different agents.
 * Each event has different agent.name and install.mode attributes.
 * Narrative should show all 4 installations with correct agent names.
 */
export const MultiAgentInstallation: Story = {
  args: {} as never,
  render: () => {
    const mock = createMockProvider([
      {
        path: '.principal-views/skill-installation.otel.canvas',
        relativePath: '.principal-views/skill-installation.otel.canvas',
        name: 'skill-installation.otel.canvas',
        content: JSON.stringify(skillInstallationCanvas),
      },
      {
        path: '.principal-views/skill-installation.workflow.json',
        relativePath: '.principal-views/skill-installation.workflow.json',
        name: 'skill-installation.workflow.json',
        content: JSON.stringify(skillInstallationNarrative),
      },
      {
        path: '.principal-views/__executions__/skill-installation.otel.json',
        relativePath: '.principal-views/__executions__/skill-installation.otel.json',
        name: 'skill-installation.otel.json',
        content: JSON.stringify(multiAgentInstallation),
      },
    ]);

    return (
      <MockPanelProvider contextOverrides={mock.contextOverrides} actionsOverrides={mock.actionsOverrides}>
        {(props) => (
          <CanvasDetailPanel
            {...props}
            selectedCanvasId="skill-installation"
            canvasPath=".principal-views/skill-installation.otel.canvas"
            canvasName="Skill Installation"
          />
        )}
      </MockPanelProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '✅ Installing demo-skill to 4 agents. Check workflow view - should show:\n' +
          '• "Installing demo-skill to Amp (Mode: symlink)"\n' +
          '• "Installing demo-skill to Cursor (Mode: symlink)"\n' +
          '• "Installing demo-skill to Claude Code (Mode: copy)"\n' +
          '• "Installing demo-skill to Windsurf (Mode: symlink)"\n\n' +
          'This tests that per-event attributes (agent.name, install.mode) override aggregate values.',
      },
    },
  },
};
