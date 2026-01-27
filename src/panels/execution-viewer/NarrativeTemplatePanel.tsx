import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import type {
  NarrativeTemplate,
  NarrativeScenario,
} from '@principal-ai/principal-view-core';
import type { ExecutionFile } from './ExecutionLoader';

interface NarrativeTemplatePanelProps {
  narrativeTemplate: NarrativeTemplate;
  availableExecutions?: ExecutionFile[];
  executionScenarioMap?: Record<string, string>;
  onExecutionSelect?: (executionId: string) => void;
  onScenarioHover?: (eventNames: string[] | null) => void;
  onScenarioClick?: (scenarioId: string, scenario: NarrativeScenario) => void;
}

/**
 * Panel that displays the structure and content of a narrative template
 */
export const NarrativeTemplatePanel: React.FC<NarrativeTemplatePanelProps> = ({
  narrativeTemplate,
  availableExecutions = [],
  executionScenarioMap = {},
  onExecutionSelect,
  onScenarioHover,
  onScenarioClick,
}) => {
  const { theme } = useTheme();

  const handleScenarioClick = (scenarioId: string, scenario: NarrativeScenario) => {
    if (onScenarioClick) {
      onScenarioClick(scenarioId, scenario);
    }
  };

  // Extract event names from a scenario template
  const getScenarioEventNames = (scenario: NarrativeScenario): string[] => {
    const eventNames: string[] = [];

    // Get event names from template.events
    if (scenario.template.events) {
      eventNames.push(...Object.keys(scenario.template.events));
    }

    // Get event names from condition.requires
    if (scenario.condition.requires) {
      eventNames.push(...scenario.condition.requires);
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
        {narrativeTemplate.description && (
          <p
            style={{
              margin: '0',
              fontSize: theme.fontSizes[1],
              color: theme.colors.textSecondary,
              lineHeight: theme.lineHeights.body,
            }}
          >
            {narrativeTemplate.description}
          </p>
        )}
      </div>

      {/* Scenarios - Scrollable */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {narrativeTemplate.scenarios?.map((scenario, index) => {
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
                  <h3 style={{ margin: 0, fontSize: theme.fontSizes[1], fontWeight: 600 }}>
                    {scenarioId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h3>
                  {matchingExecutions.length > 0 && (
                    <div style={{
                      marginTop: '4px',
                      fontSize: theme.fontSizes[0],
                      color: theme.colors.textSecondary
                    }}>
                      {matchingExecutions.length} execution{matchingExecutions.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Show executions for this scenario */}
              {matchingExecutions.length > 0 && (
                <div style={{ paddingLeft: '20px', paddingBottom: '8px' }}>
                  {matchingExecutions.map(exec => (
                    <div
                      key={exec.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onExecutionSelect) {
                          onExecutionSelect(exec.id);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        marginBottom: '4px',
                        background: theme.colors.backgroundSecondary,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: theme.fontSizes[0],
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.colors.border;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.colors.backgroundSecondary;
                      }}
                    >
                      {exec.name}
                    </div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
