import React from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import type { NarrativeTemplate } from '@principal-ai/principal-view-core/browser';
import type { ExecutionFile } from './ExecutionLoader';
import { FileText, CheckCircle2, AlertCircle, Database, ChevronRight } from 'lucide-react';

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

  const renderCondition = (condition: any, depth: number = 0): React.ReactNode => {
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
          {condition.conditions?.map((c: any, i: number) => (
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} style={{ color: theme.colors.accent }} />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            {(narrativeTemplate as any).name || 'Narrative Template'}
          </h2>
        </div>
        {(narrativeTemplate as any).description && (
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '13px',
              color: theme.colors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            {(narrativeTemplate as any).description}
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

        {narrativeTemplate.scenarios?.map((scenario, index) => (
          <div
            key={scenario.id || index}
            style={{
              marginBottom: '16px',
              padding: '12px',
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
            }}
          >
            {/* Scenario Header */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {scenario.priority === 1 ? (
                  <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                ) : (
                  <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                )}
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                  {scenario.description}
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    background: theme.colors.background,
                    borderRadius: '3px',
                    color: theme.colors.textSecondary,
                  }}
                >
                  Priority: {scenario.priority}
                </span>
              </div>
            </div>

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

              {/* Summary */}
              {scenario.template.summary && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '2px' }}>Summary:</div>
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
                    {scenario.template.summary}
                  </div>
                </div>
              )}

              {/* Steps */}
              {(scenario.template as any).steps && (scenario.template as any).steps.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>
                    Steps ({(scenario.template as any).steps.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(scenario.template as any).steps.map((step: string, i: number) => (
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
                        <span style={{ flex: 1 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              {(scenario.template as any).details && Object.keys((scenario.template as any).details).length > 0 && (
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
                    {Object.entries((scenario.template as any).details).map(([key, value]) => (
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
        ))}
      </div>
    </div>
  );
};
