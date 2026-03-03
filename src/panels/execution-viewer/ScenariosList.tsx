import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { CheckCircle2 } from 'lucide-react';
import type {
  WorkflowTemplate,
  WorkflowScenario,
  DiscoveredTestTrace,
} from '@principal-ai/principal-view-core';

interface ScenarioMatchInfo {
  scenarioId: string;
  matchType: 'full' | 'partial';
  coveragePercent?: number;
  missingSteps?: string[];
}

interface ScenariosListProps {
  workflowTemplate: WorkflowTemplate;
  availableExecutions?: DiscoveredTestTrace[];
  executionScenarioMap?: Record<string, string>;
  onExecutionSelect?: (executionId: string) => void;
  onScenarioHover?: (eventNames: string[] | null) => void;
  onScenarioClick?: (scenarioId: string, scenario: WorkflowScenario) => void;
  /** Match info from the current trace (for decorating scenarios) */
  traceMatchInfo?: ScenarioMatchInfo[];
  /** Currently selected scenario ID */
  selectedScenarioId?: string;
}

/**
 * Displays a list of scenarios with their descriptions and test coverage
 */
export const ScenariosList: React.FC<ScenariosListProps> = ({
  workflowTemplate,
  availableExecutions = [],
  executionScenarioMap = {},
  onExecutionSelect: _onExecutionSelect,
  onScenarioHover,
  onScenarioClick,
  traceMatchInfo = [],
  selectedScenarioId,
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
        overflow: 'auto',
      }}
    >
      {workflowTemplate.scenarios?.map((scenario, index) => {
          const scenarioId = scenario.id || String(index);
          // Find executions that match this scenario
          const matchingExecutions = availableExecutions.filter(
            exec => executionScenarioMap[exec.id] === scenarioId
          );
          // Check if current trace has a match for this scenario
          const traceMatch = traceMatchInfo.find(m => m.scenarioId === scenarioId);
          const isSelected = selectedScenarioId === scenarioId;

          // Determine background color based on state
          const getBackground = () => {
            if (isSelected) return theme.colors.muted;
            if (traceMatch) return traceMatch.matchType === 'full' ? '#10b98110' : '#f59e0b10';
            return 'transparent';
          };

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
                  background: getBackground(),
                  borderLeft: isSelected
                    ? `3px solid ${theme.colors.primary}`
                    : traceMatch
                      ? `3px solid ${traceMatch.matchType === 'full' ? '#10b981' : '#f59e0b'}`
                      : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!traceMatch && !isSelected) {
                    e.currentTarget.style.background = theme.colors.backgroundSecondary;
                  }
                  if (onScenarioHover) {
                    const eventNames = getScenarioEventNames(scenario);
                    onScenarioHover(eventNames);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!traceMatch && !isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
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
                    {matchingExecutions.length > 0 && !traceMatch && (
                      <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                    )}
                    {/* Full match badge */}
                    {traceMatch?.matchType === 'full' && (
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 500,
                          backgroundColor: '#10b98120',
                          color: '#10b981',
                        }}
                      >
                        Matched
                      </span>
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
                  {/* Partial match coverage bar - full width */}
                  {traceMatch?.matchType === 'partial' && (
                    <div style={{ display: 'flex', gap: '2px', marginTop: '8px' }}>
                      {(() => {
                        const expectedEvents = scenario.template?.events ? Object.keys(scenario.template.events) : [];
                        const missingEvents = new Set(traceMatch.missingSteps || []);
                        return expectedEvents.map((eventName, idx) => (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              height: '6px',
                              borderRadius: '2px',
                              backgroundColor: missingEvents.has(eventName) ? '#3f3f46' : '#10b981',
                            }}
                            title={eventName}
                          />
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};
