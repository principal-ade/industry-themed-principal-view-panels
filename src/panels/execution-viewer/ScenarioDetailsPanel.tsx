import React, { useState, useMemo } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { X, FileCode } from 'lucide-react';
import yaml from 'js-yaml';
import type { WorkflowTemplate, OtelAttributes, WorkflowScenario, ExtendedCanvas } from '@principal-ai/principal-view-core';
import { renderWorkflow } from '@principal-ai/principal-view-core';
import { WorkflowRenderer } from './WorkflowRenderer';
import { convertToOtelEvents } from './workflow-converter';
import { SourceFileList } from './SourceFileList';

interface SpanEvent {
  time: number;
  name: string;
  attributes: OtelAttributes;
}

interface TestSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: OtelAttributes;
  events: SpanEvent[];
  status: 'OK' | 'ERROR';
  errorMessage?: string;
}

// OTEL Log types
export type OtelSeverity = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface OtelLog {
  timestamp: number;
  severity: OtelSeverity;
  body: string | Record<string, unknown>;
  resource: Record<string, string | number>;
  attributes?: OtelAttributes;
  traceId?: string;
  spanId?: string;
}

// Timeline item (event or log)
interface TimelineItem {
  type: 'event' | 'log';
  time: number;
  // For events
  name?: string;
  attributes?: OtelAttributes;
  // For logs
  severity?: OtelSeverity;
  body?: string | Record<string, unknown>;
  resource?: Record<string, string | number>;
}

// View mode type
export type ViewMode = 'raw' | 'narrative' | 'summary';

export interface ScenarioDetailsPanelProps {
  spans: TestSpan[];
  logs?: OtelLog[]; // Optional for backward compatibility
  currentSpanIndex: number;
  currentEventIndex: number;
  highlightedPhase?: string; // 'setup' | 'execution' | 'assertion'
  onSpanIndexChange?: (index: number) => void;

  // Narrative view props
  viewMode?: ViewMode;
  workflowTemplate?: WorkflowTemplate;
  onViewModeChange?: (mode: ViewMode) => void;
  showWorkflowMetadata?: boolean;
  onNarrativeEventClick?: (event: import('@principal-ai/principal-view-core').OtelEvent, eventIndex: number) => void;

  // UI control props
  showNavigation?: boolean; // Show Prev/Next buttons (default: true)
  showTestName?: boolean; // Show test name below header (default: true)

  // Execution selector props
  availableExecutions?: Array<{ id: string; name: string; path: string }>;
  selectedExecutionId?: string | null;
  onExecutionSelect?: (executionId: string) => void;
  onDeselectExecution?: () => void;
  onExecutionHover?: (executionId: string | null) => void;

  // Back button props
  showBackButton?: boolean;
  onBackClick?: () => void;

  // Scenario name display
  scenarioName?: string;

  // Selected scenario for preview mode (when no execution is selected)
  selectedScenario?: WorkflowScenario;

  // Override scenario ID (use this instead of computing from events)
  // Useful when user explicitly selects a scenario from the list
  overrideScenarioId?: string;

  // Canvas for looking up source paths
  canvas?: ExtendedCanvas | null;

  // Source file click handler
  onSourceClick?: (source: string) => void;
}

// Helper functions for log severity
function getSeverityColor(severity: OtelSeverity): string {
  const colors = {
    TRACE: '#6b7280',
    DEBUG: '#60a5fa',
    INFO: '#4ade80',
    WARN: '#fbbf24',
    ERROR: '#f87171',
    FATAL: '#dc2626',
  };
  return colors[severity] || '#9ca3af';
}

function getSeverityIcon(severity: OtelSeverity): string {
  const icons = {
    TRACE: '○',
    DEBUG: '◐',
    INFO: '●',
    WARN: '⚠',
    ERROR: '✕',
    FATAL: '☠',
  };
  return icons[severity] || '•';
}

export const ScenarioDetailsPanel: React.FC<ScenarioDetailsPanelProps> = ({
  spans,
  logs = [],
  currentSpanIndex,
  currentEventIndex,
  highlightedPhase,
  onSpanIndexChange,
  viewMode = 'narrative',
  workflowTemplate,
  onViewModeChange,
  showWorkflowMetadata = false,
  onNarrativeEventClick,
  showNavigation = true,
  showTestName = true,
  availableExecutions = [],
  selectedExecutionId = null,
  onExecutionSelect,
  onDeselectExecution,
  onExecutionHover: _onExecutionHover,
  showBackButton = false,
  onBackClick,
  scenarioName,
  selectedScenario,
  overrideScenarioId,
  canvas,
  onSourceClick,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'template' | 'story'>('template');
  const [showSources, setShowSources] = useState(false);

  // Auto-switch to story tab when execution is selected
  React.useEffect(() => {
    if (selectedExecutionId && spans.length > 0 && spans[currentSpanIndex]) {
      setActiveTab('story');
    }
  }, [selectedExecutionId, spans, currentSpanIndex]);

  // Reset to template tab when no executions are available AND no live trace is selected
  React.useEffect(() => {
    if (availableExecutions.length === 0 && !selectedExecutionId) {
      setActiveTab('template');
    }
  }, [availableExecutions.length, selectedExecutionId]);

  // Helper to get source paths for an event name
  const getEventSources = (eventName: string): string[] => {
    if (!canvas?.nodes) return [];

    const sources = new Set<string>();

    canvas.nodes.forEach(node => {
      const nodeEventName = node.pv?.event?.name ||
        ('metadata' in node ? (node.metadata as Record<string, unknown>)?.['pv.event'] : undefined);

      if (nodeEventName === eventName) {
        const nodeSources = node.pv?.sources ||
          ('metadata' in node ? (node.metadata as Record<string, unknown>)?.['pv.sources'] : undefined);

        if (Array.isArray(nodeSources)) {
          nodeSources.forEach(src => {
            if (typeof src === 'string') {
              sources.add(src);
            }
          });
        }
      }
    });

    return Array.from(sources).sort();
  };

  // Helper to highlight template variables in text
  const highlightTemplateVariables = (text: string) => {
    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return (
      <>
        {parts.map((part, i) => {
          if (part.match(/^\{\{[^}]+\}\}$/)) {
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

  const currentSpan = spans[currentSpanIndex];

  // Convert current span to OtelEvents for narrative rendering
  const otelEvents = useMemo(() => {
    if (!currentSpan || (viewMode !== 'narrative' && viewMode !== 'summary')) return [];
    return convertToOtelEvents(currentSpan, logs);
  }, [currentSpan, logs, viewMode]);

  // Get scenario ID - use override if provided, otherwise compute from events
  const scenarioId = useMemo(() => {
    // If explicitly selected scenario, use that
    if (overrideScenarioId) return overrideScenarioId;
    // Otherwise compute from workflow matching
    if (!workflowTemplate || otelEvents.length === 0) return 'unknown';
    const result = renderWorkflow(workflowTemplate, otelEvents);
    return result.scenarioId;
  }, [workflowTemplate, otelEvents, overrideScenarioId]);

  const handlePrevTest = () => {
    if (currentSpanIndex > 0 && onSpanIndexChange) {
      onSpanIndexChange(currentSpanIndex - 1);
    }
  };

  const handleNextTest = () => {
    if (currentSpanIndex < spans.length - 1 && onSpanIndexChange) {
      onSpanIndexChange(currentSpanIndex + 1);
    }
  };

  // Build interleaved timeline
  const timeline = useMemo(() => {
    if (!currentSpan) return [];

    const items: TimelineItem[] = [
      // Span events - show ALL events, not just up to currentEventIndex
      ...currentSpan.events.map((event) => ({
        type: 'event' as const,
        time: event.time,
        name: event.name,
        attributes: event.attributes,
      })),

      // Correlated logs (matching current span's traceId)
      ...logs
        .filter((log) => log.traceId === currentSpan.id)
        .map((log) => ({
          type: 'log' as const,
          time: typeof log.timestamp === 'number' ? log.timestamp : new Date(log.timestamp).getTime(),
          severity: log.severity,
          body: log.body,
          resource: log.resource,
          attributes: log.attributes,
        })),
    ].sort((a, b) => a.time - b.time);

    return items;
  }, [currentSpan, logs]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fonts.monospace,
        fontSize: theme.fontSizes[1],
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Static Header */}
      <div
        style={{
          padding: '12px 20px 0 20px',
          backgroundColor: theme.colors.background,
          borderBottom: `1px solid ${theme.colors.border}`,
          flexShrink: 0,
        }}
      >
        {/* Scenario Name */}
        {scenarioName && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: theme.fontSizes[4], fontWeight: 600, color: theme.colors.text }}>
              {scenarioName}
            </h2>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Sources Toggle Button */}
              <button
                onClick={() => setShowSources(!showSources)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: showSources ? theme.colors.accent : theme.colors.text,
                  cursor: 'pointer',
                  opacity: showSources ? 1 : 0.5,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = showSources ? '1' : '0.5')}
                title={showSources ? 'Hide source files' : 'Show source files'}
              >
                <FileCode size={18} />
              </button>
              {/* Close Button - Icon only */}
              {showBackButton && onBackClick && (
                <button
                  onClick={onBackClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: theme.colors.text,
                    cursor: 'pointer',
                    opacity: 0.7,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                  title="Back to scenario mapping"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab Controls - only show if there are executions available */}
        {selectedScenario && availableExecutions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginLeft: '-20px', marginRight: '-20px', borderBottom: `1px solid ${theme.colors.border}` }}>
            {/* Template Tab */}
            <button
              onClick={() => {
                setActiveTab('template');
                if (onDeselectExecution) {
                  onDeselectExecution();
                }
              }}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: activeTab === 'template' ? theme.colors.backgroundSecondary : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'template' ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
                color: activeTab === 'template' ? theme.colors.text : theme.colors.textSecondary,
                cursor: 'pointer',
                fontSize: theme.fontSizes[1],
                fontWeight: activeTab === 'template' ? 600 : 400,
                opacity: 1,
                transition: 'all 0.2s',
              }}
            >
              Template
            </button>
            {/* Story Tab */}
            <button
              onClick={() => {
                setActiveTab('story');
                // Auto-select first execution if none selected
                if (!selectedExecutionId && availableExecutions.length > 0 && onExecutionSelect) {
                  onExecutionSelect(availableExecutions[0].id);
                }
              }}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: activeTab === 'story' ? theme.colors.backgroundSecondary : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'story' ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
                color: activeTab === 'story' ? theme.colors.text : theme.colors.textSecondary,
                cursor: 'pointer',
                fontSize: theme.fontSizes[1],
                fontWeight: activeTab === 'story' ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              Story
            </button>
          </div>
        )}

        {/* Test Navigation */}
        {showNavigation && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handlePrevTest}
                disabled={currentSpanIndex === 0}
                style={{
                  padding: '4px 12px',
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '4px',
                  color: currentSpanIndex === 0 ? theme.colors.textMuted : theme.colors.text,
                  cursor: currentSpanIndex === 0 ? 'not-allowed' : 'pointer',
                  fontSize: theme.fontSizes[1],
                  opacity: currentSpanIndex === 0 ? 0.5 : 1,
                }}
              >
                ← Prev
              </button>
              <div style={{ fontSize: theme.fontSizes[1], fontWeight: 'bold' }}>
                Span {currentSpanIndex + 1} of {spans.length}
              </div>
              <button
                onClick={handleNextTest}
                disabled={currentSpanIndex === spans.length - 1}
                style={{
                  padding: '4px 12px',
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '4px',
                  color: currentSpanIndex === spans.length - 1 ? theme.colors.textMuted : theme.colors.text,
                  cursor: currentSpanIndex === spans.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: theme.fontSizes[1],
                  opacity: currentSpanIndex === spans.length - 1 ? 0.5 : 1,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {showTestName && (
          <div style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted, marginBottom: '15px' }}>
            Test: {currentSpan?.name || 'Loading...'}
          </div>
        )}
      </div>


      {/* Scrollable Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: viewMode === 'narrative' ? '0' : '20px',
        }}
      >
        {/* Story Tab - Narrative View with Execution */}
        {activeTab === 'story' && (viewMode === 'narrative' || viewMode === 'summary') && workflowTemplate && currentSpan ? (
          <WorkflowRenderer
            template={workflowTemplate}
            events={otelEvents}
            scenarioId={scenarioId}
            showMetadata={showWorkflowMetadata}
            onEventClick={onNarrativeEventClick}
            activeEventIndex={currentEventIndex}
            showOnlySummary={viewMode === 'summary'}
            canvas={canvas}
            onSourceClick={onSourceClick}
            showSources={showSources}
          />
        ) : activeTab === 'story' && !currentSpan && availableExecutions.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: theme.colors.textMuted,
            }}
          >
            <div style={{ fontSize: theme.fontSizes[3], marginBottom: '12px' }}>No test traces available</div>
            <div style={{ fontSize: theme.fontSizes[1], lineHeight: '1.6' }}>
              Run tests to generate execution artifacts for this scenario.
            </div>
          </div>
        ) : activeTab === 'story' && !currentSpan ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: theme.colors.textMuted,
            }}
          >
            <div style={{ fontSize: theme.fontSizes[3], marginBottom: '12px' }}>Loading story...</div>
            <div style={{ fontSize: theme.fontSizes[1], lineHeight: '1.6' }}>
              Please wait while the execution data loads.
            </div>
          </div>
        ) : activeTab === 'template' && viewMode === 'summary' && workflowTemplate && selectedScenario ? (
          <div style={{ padding: '20px', fontFamily: theme.fonts.body }}>
            {/* Scenario Preview - show template without execution data */}
            {selectedScenario.template.introduction && (
              <div
                style={{
                  fontSize: theme.fontSizes[3],
                  fontWeight: 600,
                  color: theme.colors.text,
                  marginBottom: '16px',
                }}
              >
                {selectedScenario.template.introduction}
              </div>
            )}
            {selectedScenario.template.summary && (
              <div
                style={{
                  fontSize: theme.fontSizes[1],
                  color: theme.colors.textMuted,
                  lineHeight: '1.6',
                  padding: '12px',
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: '4px',
                }}
              >
                {selectedScenario.template.summary}
              </div>
            )}
          </div>
        ) : activeTab === 'template' && viewMode === 'narrative' && workflowTemplate && selectedScenario ? (
          <div style={{ fontFamily: theme.fonts.body }}>
            {selectedScenario.template.events && Object.keys(selectedScenario.template.events).length > 0 ? (
              <div>
                {Object.entries(selectedScenario.template.events).map(([eventName, template], eventIndex) => {
                  const isActive = eventIndex === currentEventIndex;
                  return (
                    <div
                      key={eventName}
                      onClick={() => {
                        if (onNarrativeEventClick) {
                          // Create minimal OtelEvent from template for graph highlighting
                          const templateEvent: import('@principal-ai/principal-view-core').OtelEvent = {
                            name: eventName,
                            timestamp: 0, // No actual timestamp in preview mode
                            type: 'span' as const,
                            spanId: 'preview',
                            traceId: 'preview',
                            attributes: {},
                          };
                          onNarrativeEventClick(templateEvent, eventIndex);
                        }
                      }}
                      style={{
                        padding: '8px 20px 12px 20px',
                        backgroundColor: isActive ? theme.colors.muted : theme.colors.backgroundSecondary,
                        borderBottom: `1px solid ${theme.colors.border}`,
                        fontSize: theme.fontSizes[1],
                        lineHeight: '1.7',
                        fontWeight: 500,
                        color: theme.colors.text,
                        cursor: onNarrativeEventClick ? 'pointer' : 'default',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <div style={{
                        marginTop: '4px',
                      }}>
                        {highlightTemplateVariables(String(template))}
                      </div>
                      {/* Show source paths for this event */}
                      {showSources && <SourceFileList sources={getEventSources(eventName)} onSourceClick={onSourceClick} />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: theme.colors.textMuted,
                  background: theme.colors.backgroundSecondary,
                }}
              >
                <div style={{ fontSize: theme.fontSizes[1] }}>No event templates defined for this scenario</div>
              </div>
            )}
          </div>
        ) : (viewMode === 'narrative' || viewMode === 'summary') && !workflowTemplate ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: theme.colors.textMuted,
            }}
          >
            <div style={{ fontSize: theme.fontSizes[3], marginBottom: '12px' }}>ⓘ No workflow template available</div>
            <div style={{ fontSize: theme.fontSizes[1], lineHeight: '1.6' }}>
              Create a workflow template to see a human-readable
              <br />
              summary of this test execution.
            </div>
            <button
              onClick={() => onViewModeChange?.('raw')}
              style={{
                marginTop: '20px',
                padding: '8px 16px',
                background: theme.colors.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: theme.fontSizes[1],
              }}
            >
              View Raw Events
            </button>
          </div>
        ) : null}

        {/* Raw Events View (Timeline) */}
        {activeTab === 'template' && viewMode === 'raw' && selectedScenario && (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: theme.colors.textMuted,
            }}
          >
            <div style={{ fontSize: theme.fontSizes[3], marginBottom: '12px' }}>ⓘ No raw events in template view</div>
            <div style={{ fontSize: theme.fontSizes[1], lineHeight: '1.6' }}>
              Switch to the Story tab to view raw execution events.
            </div>
          </div>
        )}
        {activeTab === 'story' && viewMode === 'raw' && currentSpan && (
          <div>
            {timeline.map((item, idx) => {
            if (item.type === 'event') {
              // SPAN EVENT RENDERING
              const filepath = item.attributes?.['code.filepath'] as string;
              const lineno = item.attributes?.['code.lineno'] as number;
              const isCodeUnderTest = filepath && filepath !== 'GraphConverter.test.ts';

              // Determine which phase this event belongs to
              const eventPhase = item.name?.split('.')[0]; // 'setup', 'execution', 'assertion'
              const isHighlighted = highlightedPhase === eventPhase;

              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    paddingLeft: '12px',
                    borderBottom: idx < timeline.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                    borderLeft: '3px solid #f59e0b',
                    opacity: highlightedPhase && !isHighlighted ? 0.4 : 1,
                    transition: 'opacity 0.2s ease',
                    transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
                    backgroundColor: isHighlighted ? theme.colors.surface : 'transparent',
                    padding: isHighlighted ? '8px 8px 8px 12px' : '0 0 12px 12px',
                    borderRadius: '4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                      gap: '8px',
                    }}
                  >
                    <div style={{ color: '#f59e0b', fontSize: theme.fontSizes[1], fontWeight: 'bold', flexShrink: 0 }}>
                      EVENT: {item.name}
                    </div>
                    {filepath && (
                      <div
                        style={{
                          fontSize: theme.fontSizes[0],
                          color: isCodeUnderTest ? '#4ade80' : '#60a5fa',
                          fontFamily: 'monospace',
                          background: isCodeUnderTest ? '#064e3b' : '#1e3a8a',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          flexShrink: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isCodeUnderTest && '→ '}
                        {filepath}:{lineno}
                      </div>
                    )}
                  </div>
                  <pre
                    style={{
                      background: theme.colors.surface,
                      padding: '8px',
                      borderRadius: '4px',
                      margin: 0,
                      fontSize: theme.fontSizes[1],
                      lineHeight: '1.5',
                      overflow: 'auto',
                      maxWidth: '100%',
                    }}
                  >
                    {yaml.dump(
                      Object.fromEntries(
                        Object.entries(item.attributes || {}).filter(
                          ([key]) => key !== 'code.filepath' && key !== 'code.lineno'
                        )
                      ),
                      { indent: 2, lineWidth: -1 }
                    )}
                  </pre>
                </div>
              );
            } else {
              // OTEL LOG RENDERING
              const serviceName = item.resource?.['service.name'];
              const severityColor = getSeverityColor(item.severity!);

              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    paddingLeft: '12px',
                    borderBottom: idx < timeline.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                    borderLeft: `3px solid ${severityColor}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: theme.fontSizes[3] }}>{getSeverityIcon(item.severity!)}</span>
                      <span
                        style={{
                          color: severityColor,
                          fontSize: theme.fontSizes[1],
                          fontWeight: 'bold',
                        }}
                      >
                        LOG: {item.severity}
                      </span>
                    </div>
                    {serviceName && (
                      <div
                        style={{
                          fontSize: theme.fontSizes[0],
                          color: '#9ca3af',
                          background: '#1e293b',
                          padding: '2px 6px',
                          borderRadius: '3px',
                        }}
                      >
                        {serviceName}
                      </div>
                    )}
                  </div>

                  {/* Log body */}
                  <div
                    style={{
                      background: theme.colors.surface,
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: item.attributes && Object.keys(item.attributes).length > 0 ? '8px' : '0',
                      fontSize: theme.fontSizes[1],
                    }}
                  >
                    {typeof item.body === 'string' ? (
                      item.body
                    ) : (
                      <pre style={{ margin: 0, fontSize: theme.fontSizes[1], lineHeight: '1.5' }}>
                        {yaml.dump(item.body, { indent: 2, lineWidth: -1 })}
                      </pre>
                    )}
                  </div>

                  {/* Log attributes */}
                  {item.attributes && Object.keys(item.attributes).length > 0 && (
                    <pre
                      style={{
                        background: theme.colors.surface,
                        padding: '8px',
                        borderRadius: '4px',
                        margin: 0,
                        fontSize: theme.fontSizes[0],
                        lineHeight: '1.5',
                        opacity: 0.8,
                      }}
                    >
                      {yaml.dump(item.attributes, { indent: 2, lineWidth: -1 })}
                    </pre>
                  )}
                </div>
              );
            }
          })}
          </div>
        )}
      </div>
    </div>
  );
};
