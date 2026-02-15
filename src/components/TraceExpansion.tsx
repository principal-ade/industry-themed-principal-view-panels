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
import type { TraceInfo, WorkflowMatch } from '../types/otel';
import { WorkflowScenarioTreeCore } from '@principal-ade/dynamic-file-tree';
import type { WorkflowWithScenarios, WorkflowScenarioNodeData } from '@principal-ade/dynamic-file-tree';
import type { DiscoveredStoryboard, WorkflowScenario } from '@principal-ai/principal-view-core';

export interface TraceExpansionProps {
  trace: TraceInfo;
  theme: Theme;
  onWorkflowClick?: (workflowId: string, scenarioId: string) => void;
}

/**
 * Convert WorkflowMatch[] to WorkflowWithScenarios[] for the tree component
 */
function convertMatchesToWorkflows(matches: WorkflowMatch[]): WorkflowWithScenarios[] {
  // Group matches by workflow ID
  const workflowMap = new Map<string, WorkflowMatch[]>();
  for (const match of matches) {
    if (!workflowMap.has(match.workflowId)) {
      workflowMap.set(match.workflowId, []);
    }
    workflowMap.get(match.workflowId)!.push(match);
  }

  // Convert to WorkflowWithScenarios format
  const workflows: WorkflowWithScenarios[] = [];
  for (const [workflowId, workflowMatches] of workflowMap) {
    const firstMatch = workflowMatches[0];

    // Create minimal DiscoveredStoryboard
    const storyboard: DiscoveredStoryboard = {
      id: firstMatch.storyboardId,
      name: firstMatch.storyboardName,
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

    // Create scenarios from matches
    const scenarios: WorkflowScenario[] = workflowMatches.map(match => ({
      id: match.scenarioId,
      priority: 1,
      description: match.scenarioName,
      condition: {},
      template: {},
    }));

    // Create WorkflowWithScenarios (using type assertion for minimal mock data)
    workflows.push({
      id: workflowId,
      name: firstMatch.workflowName,
      path: '',
      basename: '',
      storyboardId: firstMatch.storyboardId,
      packageName: undefined,
      packagePath: undefined,
      scope: 'root',
      storyboard,
      scenarios,
    } as WorkflowWithScenarios);
  }

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
  const matchedCount = trace.matchedWorkflows?.length || 0;
  const unmatchedCount = trace.unmatchedEventNames?.length || 0;

  // Convert matches to WorkflowWithScenarios format for tree
  const workflows = useMemo(() => {
    if (!trace.matchedWorkflows) return [];
    return convertMatchesToWorkflows(trace.matchedWorkflows);
  }, [trace.matchedWorkflows]);

  // Create workflow and scenario trace counts for the tree
  const { workflowTraceCounts, scenarioTraceCounts } = useMemo(() => {
    if (!trace.matchedWorkflows) return { workflowTraceCounts: {}, scenarioTraceCounts: {} };

    const scenarioCounts: Record<string, number> = {};
    const workflowCounts: Record<string, number> = {};

    for (const match of trace.matchedWorkflows) {
      const scenarioKey = `${match.workflowId}/${match.scenarioId}`;
      scenarioCounts[scenarioKey] = match.matchedEventCount;

      // Aggregate workflow counts from scenarios
      if (!workflowCounts[match.workflowId]) {
        workflowCounts[match.workflowId] = 0;
      }
      workflowCounts[match.workflowId] += match.matchedEventCount;
    }

    return { workflowTraceCounts: workflowCounts, scenarioTraceCounts: scenarioCounts };
  }, [trace.matchedWorkflows]);

  // If no workflow matching data, show message
  if (!trace.matchedWorkflows && !trace.totalEventCount) {
    return (
      <div
        style={{
          padding: theme.space[3],
          color: theme.colors.textSecondary,
          fontSize: theme.fontSizes[1],
          fontStyle: 'italic',
        }}
      >
        Workflow matching data not available for this trace.
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
            Unmatched Events ({unmatchedCount})
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
            {trace.unmatchedEventNames?.map((eventName, index) => (
              <div
                key={`${eventName}-${index}`}
                style={{
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.text,
                  padding: `${theme.space[1]} 0`,
                  fontFamily: theme.fonts.monospace || 'monospace',
                }}
              >
                • {eventName}
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
