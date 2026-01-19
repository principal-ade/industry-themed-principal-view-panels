import React, { useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import type { NarrativeTemplate } from '@principal-ai/principal-view-core/browser';
import type { ExecutionFile } from './ExecutionLoader';
import { Database, ChevronRight, ChevronDown } from 'lucide-react';

// Type definitions for narrative template structure
interface AndOrCondition {
  type: 'and' | 'or';
  conditions: Condition[];
}

interface EventCondition {
  type: 'event';
  event: string;
}

interface AttributeCondition {
  type: 'attribute';
  key: string;
  value: unknown;
}

interface SpanCondition {
  type: 'span';
  name: string;
}

type Condition = AndOrCondition | EventCondition | AttributeCondition | SpanCondition;

interface ScenarioTemplate {
  introduction?: string;
  summary?: string;
  flow?: string[];
  details?: Record<string, unknown>;
}

interface Scenario {
  id?: string;
  name?: string;
  description?: string;
  condition: Condition;
  template: ScenarioTemplate;
}

interface ExtendedNarrativeTemplate {
  name?: string;
  description?: string;
  scenarios?: Scenario[];
}

interface NarrativeTemplatePanelProps {
  narrativeTemplate: NarrativeTemplate;
  availableExecutions?: ExecutionFile[];
  executionScenarioMap?: Record<string, string>; // Maps execution ID to scenario ID
  onExecutionSelect?: (executionId: string) => void;
}

/**
 * Panel that displays the structure and content of a narrative template
 */
export const NarrativeTemplatePanel: React.FC<NarrativeTemplatePanelProps> = ({
  narrativeTemplate,
  availableExecutions = [],
  executionScenarioMap = {},
  onExecutionSelect,
}) => {
  const { theme } = useTheme();
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());

  const toggleScenario = (scenarioId: string) => {
    setExpandedScenarios(prev => {
      const next = new Set(prev);
      if (next.has(scenarioId)) {
        next.delete(scenarioId);
      } else {
        next.add(scenarioId);
      }
      return next;
    });
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

  const renderCondition = (condition: Condition, depth: number = 0): React.ReactNode => {
    const indent = depth * 16;

    if (condition.type === 'and' || condition.type === 'or') {
      return (
        <div key={`${condition.type}-${depth}`} style={{ marginLeft: `${indent}px`, marginTop: '8px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: theme.colors.accent,
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
          >
            {condition.type}
          </div>
          {condition.conditions?.map((c: Condition, i: number) => (
            <div key={i}>{renderCondition(c, depth + 1)}</div>
          ))}
        </div>
      );
    }

    let conditionText = '';
    if (condition.type === 'event') {
      conditionText = `Event: "${condition.event}"`;
    } else if (condition.type === 'attribute') {
      conditionText = `Attribute: ${condition.key} = ${JSON.stringify(condition.value)}`;
    } else if (condition.type === 'span') {
      conditionText = `Span: "${condition.name}"`;
    } else {
      conditionText = JSON.stringify(condition);
    }

    return (
      <div
        key={`${condition.type}-${depth}`}
        style={{
          marginLeft: `${indent}px`,
          marginTop: '4px',
          fontSize: '12px',
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.monospace,
          padding: '4px 8px',
          background: theme.colors.background,
          borderRadius: '3px',
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {conditionText}
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
          background: theme.colors.background,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            {(narrativeTemplate as ExtendedNarrativeTemplate).name || 'Narrative Template'}
          </h2>
        </div>
        {(narrativeTemplate as ExtendedNarrativeTemplate).description && (
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '13px',
              color: theme.colors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            {(narrativeTemplate as ExtendedNarrativeTemplate).description}
          </p>
        )}
      </div>

      {/* Scenarios - Scrollable */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          Scenarios ({narrativeTemplate.scenarios?.length || 0})
        </h3>

        {narrativeTemplate.scenarios?.map((scenario, index) => {
          const isExpanded = expandedScenarios.has(scenario.id || String(index));

          return (
            <div
              key={scenario.id || index}
              style={{
                marginBottom: '16px',
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              {/* Scenario Header - Clickable */}
              <div
                onClick={() => toggleScenario(scenario.id || String(index))}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                  background: isExpanded ? theme.colors.backgroundSecondary : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.colors.backgroundSecondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isExpanded ? theme.colors.backgroundSecondary : 'transparent';
                }}
              >
                {isExpanded ? (
                  <ChevronDown size={16} style={{ color: theme.colors.textSecondary, flexShrink: 0 }} />
                ) : (
                  <ChevronRight size={16} style={{ color: theme.colors.textSecondary, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                    {scenario.name || scenario.description || scenario.id}
                  </h3>
                  {scenario.description && scenario.name && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: theme.colors.textSecondary }}>
                      {scenario.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Details - Only show when expanded */}
              {isExpanded && (
                <div style={{ padding: '12px', borderTop: `1px solid ${theme.colors.border}` }}>
                  {/* Condition */}
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontSize: '11px',
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
                        fontSize: '11px',
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
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '2px' }}>Introduction:</div>
                        <div
                          style={{
                            fontSize: '12px',
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
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '2px' }}>Summary (closing):</div>
                        <div
                          style={{
                            fontSize: '12px',
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
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                          Flow ({scenario.template.flow.length}):
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {scenario.template.flow.map((step: string, i: number) => (
                            <div
                              key={i}
                              style={{
                                fontSize: '12px',
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
                              <span style={{ flex: 1 }}>{renderTemplateText(step)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    {scenario.template.details && Object.keys(scenario.template.details).length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>Details:</div>
                        <div
                          style={{
                            fontSize: '12px',
                            fontFamily: theme.fonts.monospace,
                            padding: '6px 8px',
                            background: theme.colors.background,
                            borderRadius: '3px',
                            border: `1px solid ${theme.colors.border}`,
                          }}
                        >
                          {Object.entries(scenario.template.details).map(([key, value]) => (
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
                              fontSize: '11px',
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
                                  fontSize: '12px',
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
