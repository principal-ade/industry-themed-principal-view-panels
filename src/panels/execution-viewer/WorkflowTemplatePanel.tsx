import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { CheckCircle2 } from 'lucide-react';
import type {
  WorkflowTemplate,
  WorkflowScenario,
  DiscoveredTestTrace,
} from '@principal-ai/principal-view-core';

interface WorkflowTemplatePanelProps {
  workflowTemplate: WorkflowTemplate;
  availableExecutions?: DiscoveredTestTrace[];
  executionScenarioMap?: Record<string, string>;
  onExecutionSelect?: (executionId: string) => void;
  onScenarioHover?: (eventNames: string[] | null) => void;
  onScenarioClick?: (scenarioId: string, scenario: WorkflowScenario) => void;
}

/**
 * Panel that displays the structure and content of a workflow template
 */
export const WorkflowTemplatePanel: React.FC<WorkflowTemplatePanelProps> = ({
  workflowTemplate,
  availableExecutions = [],
  executionScenarioMap = {},
  onExecutionSelect: _onExecutionSelect,
  onScenarioHover,
  onScenarioClick,
}) => {
  const { theme } = useTheme();

  const handleScenarioClick = (scenarioId: string, scenario: WorkflowScenario) => {
    if (onScenarioClick) {
      onScenarioClick(scenarioId, scenario);
    }
  };

  // Extract event names from a scenario template
  const getScenarioEventNames = (scenario: WorkflowScenario): string[] => {
    const eventNames: string[] = [];

    // Get event names from template.events
    if (scenario.template.events) {
      eventNames.push(...Object.keys(scenario.template.events));
    }

    return eventNames;
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
      }}
    >
      {/* Header - Fixed */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: theme.colors.backgroundSecondary,
          flexShrink: 0,
        }}
      >
        {workflowTemplate.description && (
          <p
            style={{
              margin: '0',
              fontSize: theme.fontSizes[1],
              color: theme.colors.textSecondary,
              lineHeight: theme.lineHeights.body,
            }}
          >
            {workflowTemplate.description}
          </p>
        )}
      </div>

      {/* Scenarios - Scrollable */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {workflowTemplate.scenarios?.map((scenario, index) => {
          const scenarioId = scenario.id || String(index);
          // Find executions that match this scenario
          const matchingExecutions = availableExecutions.filter(
            exec => executionScenarioMap[exec.id] === scenarioId
          );

          return (
            <div
              key={scenarioId}
              style={{
                background: theme.colors.background,
                borderBottom: `1px solid ${theme.colors.border}`,
                overflow: 'hidden',
              }}
            >
              {/* Scenario Header - Clickable */}
              <div
                onClick={() => handleScenarioClick(scenarioId, scenario)}
                style={{
                  padding: '12px 12px 12px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundSecondary;
                  if (onScenarioHover) {
                    const eventNames = getScenarioEventNames(scenario);
                    onScenarioHover(eventNames);
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  if (onScenarioHover) {
                    onScenarioHover(null);
                  }
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: theme.fontSizes[1], fontWeight: 600 }}>
                      {scenarioId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </h3>
                    {matchingExecutions.length > 0 && (
                      <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                    )}
                  </div>
                  {scenario.description && (
                    <div style={{
                      marginTop: '6px',
                      fontSize: theme.fontSizes[1],
                      color: theme.colors.textSecondary,
                      lineHeight: theme.lineHeights.body,
                    }}>
                      {scenario.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
