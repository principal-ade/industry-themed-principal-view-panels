import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import type {
  NarrativeTemplate,
  NarrativeScenario,
  ScenarioCondition,
  ScenarioTemplate,
  FlowDirective
} from '@principal-ai/principal-view-core/browser';
import type { ExecutionFile } from './ExecutionLoader';
import { Database, ChevronRight, ChevronDown } from 'lucide-react';

interface NarrativeTemplatePanelProps {
  narrativeTemplate: NarrativeTemplate;
  availableExecutions?: ExecutionFile[];
  executionScenarioMap?: Record<string, string>; // Maps execution ID to scenario ID
  onExecutionSelect?: (executionId: string) => void;
  onScenarioHover?: (eventNames: string[] | null) => void;
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
}) => {
  const { theme } = useTheme();
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const toggleScenario = (scenarioId: string, scenario: NarrativeScenario) => {
    setExpandedScenarios(prev => {
      const next = new Set(prev);
      const isExpanding = !next.has(scenarioId);

      if (next.has(scenarioId)) {
        next.delete(scenarioId);
        // Collapsing - clear selection and highlighting
        setSelectedScenarioId(null);
        if (onScenarioHover) {
          onScenarioHover(null);
        }
      } else {
        next.add(scenarioId);
        // Expanding - set selection and highlight nodes
        setSelectedScenarioId(scenarioId);
        if (onScenarioHover) {
          const eventNames = getScenarioEventNames(scenario);
          onScenarioHover(eventNames);
        }
      }
      return next;
    });
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

  // Helper to render text with highlighted template variables
  const renderTemplateText = (text: string) => {
    const parts = text.split(/(\{[^}]+\})/g);
    return (
      <>
        {parts.map((part, i) => {
          if (part.match(/^\{[^}]+\}$/)) {
            return (
              <span key={i} style={{ color: theme.colors.accent, fontWeight: 600 }}>
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  const renderCondition = (condition: ScenarioCondition): React.ReactNode => {
    if (condition.default) {
      return (
        <div
          style={{
            marginTop: '4px',
            fontSize: theme.fontSizes[1],
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.monospace,
            padding: '4px 8px',
            background: theme.colors.background,
            borderRadius: '3px',
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          Always matches (default scenario)
        </div>
      );
    }

    const parts: string[] = [];

    if (condition.requires && condition.requires.length > 0) {
      parts.push(`Requires: ${condition.requires.join(', ')}`);
    }

    if (condition.excludes && condition.excludes.length > 0) {
      parts.push(`Excludes: ${condition.excludes.join(', ')}`);
    }

    if (condition.assertions) {
      const assertionStrs = Object.entries(condition.assertions).map(([key, assertion]) => {
        return `${key}: ${JSON.stringify(assertion)}`;
      });
      if (assertionStrs.length > 0) {
        parts.push(`Assertions: ${assertionStrs.join(', ')}`);
      }
    }

    if (condition.any) {
      parts.push('(Match ANY instead of ALL)');
    }

    return (
      <div
        style={{
          marginTop: '4px',
          fontSize: theme.fontSizes[1],
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.monospace,
          padding: '4px 8px',
          background: theme.colors.background,
          borderRadius: '3px',
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {parts.length > 0 ? parts.join(' | ') : 'No conditions'}
      </div>
    );
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            {narrativeTemplate.name || 'Narrative Template'}
          </h2>
        </div>
        {narrativeTemplate.description && (
          <p
            style={{
              margin: '8px 0 0 0',
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
          const isExpanded = expandedScenarios.has(scenario.id || String(index));

          return (
            <div
              key={scenario.id || index}
              style={{
                background: theme.colors.background,
                borderBottom: `1px solid ${theme.colors.border}`,
                overflow: 'hidden',
              }}
            >
              {/* Scenario Header - Clickable */}
              <div
                onClick={() => toggleScenario(scenario.id || String(index), scenario)}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                  background: isExpanded ? theme.colors.backgroundSecondary : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundSecondary;
                  // Only trigger hover preview if no scenario is currently selected (expanded)
                  if (onScenarioHover && !selectedScenarioId) {
                    const eventNames = getScenarioEventNames(scenario);
                    onScenarioHover(eventNames);
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isExpanded ? theme.colors.backgroundSecondary : 'transparent';
                  // Only clear hover state if no scenario is selected (otherwise keep the selected one highlighted)
                  if (onScenarioHover && !selectedScenarioId) {
                    onScenarioHover(null);
                  }
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: theme.fontSizes[1], fontWeight: 600 }}>
                    {scenario.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h3>
                </div>
              </div>

              {/* Details - Only show when expanded */}
              {isExpanded && (
                <div style={{ padding: '12px', borderTop: `1px solid ${theme.colors.border}` }}>
                  {/* Condition */}
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontSize: theme.fontSizes[0],
                        fontWeight: 600,
                        color: theme.colors.textSecondary,
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Condition
                    </div>
                    {renderCondition(scenario.condition)}
                  </div>

                  {/* Template */}
                  <div>
                    <div
                      style={{
                        fontSize: theme.fontSizes[0],
                        fontWeight: 600,
                        color: theme.colors.textSecondary,
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Template
                    </div>

                    {/* Introduction */}
                    {scenario.template.introduction && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: theme.fontSizes[0], color: theme.colors.textSecondary, marginBottom: '2px' }}>Introduction:</div>
                        <div
                          style={{
                            fontSize: theme.fontSizes[1],
                            color: theme.colors.text,
                            fontFamily: theme.fonts.monospace,
                            padding: '6px 8px',
                            background: theme.colors.background,
                            borderRadius: '3px',
                            border: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          {renderTemplateText(scenario.template.introduction)}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {scenario.template.summary && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: theme.fontSizes[0], color: theme.colors.textSecondary, marginBottom: '2px' }}>Summary (closing):</div>
                        <div
                          style={{
                            fontSize: theme.fontSizes[1],
                            color: theme.colors.text,
                            fontFamily: theme.fonts.monospace,
                            padding: '6px 8px',
                            background: theme.colors.background,
                            borderRadius: '3px',
                            border: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          {renderTemplateText(scenario.template.summary)}
                        </div>
                      </div>
                    )}

                    {/* Flow */}
                    {scenario.template.flow && scenario.template.flow.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: theme.fontSizes[0], color: theme.colors.textSecondary, marginBottom: '4px' }}>
                          Flow ({scenario.template.flow.length}):
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {scenario.template.flow.map((step: string | FlowDirective, i: number) => (
                            <div
                              key={i}
                              style={{
                                fontSize: theme.fontSizes[1],
                                color: theme.colors.textSecondary,
                                fontFamily: theme.fonts.monospace,
                                padding: '4px 8px',
                                background: theme.colors.background,
                                borderRadius: '3px',
                                border: `1px solid ${theme.colors.border}`,
                                display: 'flex',
                                gap: '8px',
                              }}
                            >
                              <span style={{ color: theme.colors.textSecondary, minWidth: '20px' }}>{i + 1}.</span>
                              <span style={{ flex: 1 }}>
                                {typeof step === 'string' ? renderTemplateText(step) : JSON.stringify(step, null, 2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Events */}
                    {scenario.template.events && Object.keys(scenario.template.events).length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: theme.fontSizes[0], color: theme.colors.textSecondary, marginBottom: '4px' }}>Event Templates:</div>
                        <div
                          style={{
                            fontSize: theme.fontSizes[1],
                            fontFamily: theme.fonts.monospace,
                            padding: '6px 8px',
                            background: theme.colors.background,
                            borderRadius: '3px',
                            border: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          {Object.entries(scenario.template.events).map(([key, value]) => (
                            <div key={key} style={{ marginBottom: '2px' }}>
                              <span style={{ color: theme.colors.textSecondary }}>{key}:</span>{' '}
                              <span style={{ color: theme.colors.text }}>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Execution Files - Only show executions that match this scenario */}
                    {(() => {
                      const matchingExecutions = availableExecutions.filter(
                        exec => executionScenarioMap[exec.id] === scenario.id
                      );
                      return matchingExecutions.length > 0 ? (
                        <div>
                          <div
                            style={{
                              fontSize: theme.fontSizes[0],
                              color: theme.colors.textSecondary,
                              marginBottom: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Database size={12} />
                            <span>Execution Files ({matchingExecutions.length})</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {matchingExecutions.map((exec) => (
                              <button
                                key={exec.id}
                                onClick={() => onExecutionSelect?.(exec.id)}
                                style={{
                                  fontSize: theme.fontSizes[1],
                                  padding: '6px 8px',
                                  background: theme.colors.background,
                                  border: `1px solid ${theme.colors.border}`,
                                  borderRadius: '3px',
                                  color: theme.colors.textSecondary,
                                  fontFamily: theme.fonts.monospace,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'all 0.2s',
                                  textAlign: 'left',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = theme.colors.muted;
                                  e.currentTarget.style.borderColor = theme.colors.accent;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = theme.colors.background;
                                  e.currentTarget.style.borderColor = theme.colors.border;
                                }}
                              >
                                <span>{exec.name}</span>
                                <ChevronRight size={14} style={{ color: theme.colors.accent, flexShrink: 0 }} />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
