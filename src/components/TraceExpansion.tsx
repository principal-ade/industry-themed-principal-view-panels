/**
 * TraceExpansion - Detailed view of trace workflow matches and coverage
 *
 * Shows:
 * - WorkflowScenarioTree with matched workflows/scenarios
 * - Events that didn't match any workflow
 * - Coverage metrics
 */

import React, { useMemo } from 'react';
import type { Theme } from '@principal-ade/industry-theme';
import type { RegisteredTrace } from '../types/otel';
import { WorkflowScenarioTreeCore } from '@principal-ade/dynamic-file-tree';
import type { WorkflowWithScenarios, WorkflowScenarioNodeData } from '@principal-ade/dynamic-file-tree';
import type { DiscoveredStoryboard, WorkflowScenario } from '@principal-ai/principal-view-core';

export interface TraceExpansionProps {
  trace: RegisteredTrace;
  theme: Theme;
  onWorkflowClick?: (workflowId: string, scenarioId: string) => void;
}

/**
 * Convert RegisteredTrace matchInfo to WorkflowWithScenarios[] for the tree component
 */
function convertTraceToWorkflows(trace: RegisteredTrace): WorkflowWithScenarios[] {
  // If trace is not matched or has no matchInfo, return empty array
  if (trace.registryStatus !== 'matched' || !trace.matchInfo) {
    return [];
  }

  const { matchInfo } = trace;

  // Create minimal DiscoveredStoryboard
  const storyboard: DiscoveredStoryboard = {
    id: matchInfo.storyboardId || 'unknown',
    name: matchInfo.storyboardId || 'Unknown Storyboard',
    path: '',
    basename: '',
    canvas: {
      id: '',
      name: '',
      path: '',
      basename: '',
      type: 'otel' as const,
      scope: 'root' as const,
    },
    workflows: [],
    packageName: undefined,
    packagePath: undefined,
    scope: 'root',
  };

  // Create single scenario from matchInfo
  const scenarios: WorkflowScenario[] = matchInfo.scenarioId ? [{
    id: matchInfo.scenarioId,
    priority: 1,
    description: matchInfo.scenarioId,
    template: {},
  }] : [];

  // Create WorkflowWithScenarios
  const workflows: WorkflowWithScenarios[] = matchInfo.workflowId ? [{
    id: matchInfo.workflowId,
    name: matchInfo.workflowId,
    path: '',
    basename: '',
    storyboardId: matchInfo.storyboardId || 'unknown',
    packageName: undefined,
    packagePath: undefined,
    scope: 'root',
    storyboard,
    scenarios,
  } as WorkflowWithScenarios] : [];

  return workflows;
}

/**
 * TraceExpansion component displays detailed workflow matching information
 * for a selected trace, including matched workflows, unmatched events, and coverage metrics
 */
export const TraceExpansion: React.FC<TraceExpansionProps> = ({
  trace,
  theme,
  onWorkflowClick,
}) => {
  const matchedCount = trace.registryStatus === 'matched' ? 1 : 0;
  const unmatchedCount = trace.validationIssues?.length || 0;

  // Convert trace to WorkflowWithScenarios format for tree
  const workflows = useMemo(() => {
    return convertTraceToWorkflows(trace);
  }, [trace]);

  // Create workflow and scenario trace counts for the tree
  const { workflowTraceCounts, scenarioTraceCounts } = useMemo(() => {
    if (trace.registryStatus !== 'matched' || !trace.matchInfo) {
      return { workflowTraceCounts: {}, scenarioTraceCounts: {} };
    }

    const scenarioCounts: Record<string, number> = {};
    const workflowCounts: Record<string, number> = {};

    // Count matched spans (those with matchedNodeIds)
    const matchedSpanCount = trace.spanMatches.filter(m => m.matchedNodeIds.length > 0).length;

    if (trace.matchInfo.workflowId && trace.matchInfo.scenarioId) {
      const scenarioKey = `${trace.matchInfo.workflowId}/${trace.matchInfo.scenarioId}`;
      scenarioCounts[scenarioKey] = matchedSpanCount;
      workflowCounts[trace.matchInfo.workflowId] = matchedSpanCount;
    }

    return { workflowTraceCounts: workflowCounts, scenarioTraceCounts: scenarioCounts };
  }, [trace.registryStatus, trace.matchInfo, trace.spanMatches]);

  // If no workflow matching data, show message
  if (trace.registryStatus === 'unmatched' || trace.registryStatus === 'not-registered') {
    return (
      <div
        style={{
          padding: theme.space[3],
          color: theme.colors.textSecondary,
          fontSize: theme.fontSizes[1],
          fontStyle: 'italic',
        }}
      >
        This trace is {trace.registryStatus === 'unmatched' ? 'unmatched' : 'not registered'}.
      </div>
    );
  }

  const handleNodeClick = (node: WorkflowScenarioNodeData) => {
    if (node.type === 'scenario' && node.scenario && node.workflow) {
      onWorkflowClick?.(node.workflow.id, node.scenario.id);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.space[2],
        padding: theme.space[2],
        backgroundColor: theme.colors.background,
        borderRadius: theme.radii[2],
      }}
    >
      {/* Matched Workflows Tree */}
      {matchedCount > 0 && (
        <div
          style={{
            backgroundColor: theme.colors.backgroundSecondary,
            borderRadius: theme.radii[2],
            overflow: 'hidden',
            maxHeight: '300px',
          }}
        >
          <WorkflowScenarioTreeCore
            workflows={workflows}
            theme={theme}
            onClick={handleNodeClick}
            defaultOpen={true}
            workflowTraceCounts={workflowTraceCounts}
            scenarioTraceCounts={scenarioTraceCounts}
            horizontalNodePadding="8px"
            verticalNodePadding="4px"
            verticalPadding="4px"
          />
        </div>
      )}

      {/* Unmatched Events Section */}
      {unmatchedCount > 0 && (
        <div>
          <div
            style={{
              fontSize: theme.fontSizes[1],
              fontWeight: theme.fontWeights.semibold,
              marginBottom: theme.space[2],
              paddingLeft: theme.space[2],
              color: theme.colors.warning || '#f59e0b',
            }}
          >
            Validation Issues ({unmatchedCount})
          </div>
          <div
            style={{
              padding: theme.space[3],
              backgroundColor: `${theme.colors.warning || '#f59e0b'}10`,
              border: `1px solid ${theme.colors.warning || '#f59e0b'}40`,
              borderRadius: theme.radii[2],
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {trace.validationIssues?.map((issue, index) => (
              <div
                key={`${issue.category}-${issue.message}-${index}`}
                style={{
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.text,
                  padding: `${theme.space[1]} 0`,
                  fontFamily: theme.fonts.monospace || 'monospace',
                }}
              >
                • {issue.message}
                {issue.suggestion && (
                  <span style={{ color: theme.colors.textMuted, marginLeft: theme.space[2] }}>
                    ({issue.suggestion})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No matches message */}
      {matchedCount === 0 && unmatchedCount === 0 && (
        <div
          style={{
            padding: theme.space[3],
            fontSize: theme.fontSizes[1],
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          No workflow matching data available
        </div>
      )}
    </div>
  );
};
