import React, { useState, useMemo, useRef, useCallback } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { AlertCircle, Search, X, RefreshCw, HelpCircle, Copy, Check } from 'lucide-react';
import { useCanvasWorkflowData } from './canvas-list/hooks/useCanvasWorkflowData';
import { EmptyStateContent } from './principal-view/EmptyStateContent';
import { StoryboardLoadingGraph } from './canvas-list/components/StoryboardLoadingGraph';
import {
  StoryboardWorkflowsTreeCore,
  type StoryboardWorkflowNodeData,
  CanvasListTreeCore,
  type CanvasListNodeData,
  type GitFileStatus,
  type GitStatus,
} from '@principal-ade/dynamic-file-tree';
import type { FileTree, FileInfo, GitStatusWithFiles } from '@principal-ai/repository-abstraction';
import type { WorkflowTemplate, DiscoveredTestTrace, WorkflowScenario } from '@principal-ai/principal-view-core';

/**
 * Helper to convert GitStatusWithFiles to GitFileStatus[] format for tree components
 */
function convertGitStatusToFileStatus(gitStatus: GitStatusWithFiles | null): GitFileStatus[] {
  if (!gitStatus) return [];

  const fileStatuses: GitFileStatus[] = [];

  // Modified files
  gitStatus.modifiedFiles.forEach(filePath => {
    fileStatuses.push({
      filePath,
      indexStatus: ' ',
      workingTreeStatus: 'M',
      status: 'M' as GitStatus,
    });
  });

  // Staged files
  gitStatus.stagedFiles.forEach(filePath => {
    fileStatuses.push({
      filePath,
      indexStatus: 'A',
      workingTreeStatus: ' ',
      status: 'A' as GitStatus,
    });
  });

  // Untracked files
  gitStatus.untrackedFiles.forEach(filePath => {
    fileStatuses.push({
      filePath,
      indexStatus: '?',
      workingTreeStatus: '?',
      status: '??' as GitStatus,
    });
  });

  // Deleted files
  gitStatus.deletedFiles.forEach(filePath => {
    fileStatuses.push({
      filePath,
      indexStatus: ' ',
      workingTreeStatus: 'D',
      status: 'D' as GitStatus,
    });
  });

  return fileStatuses;
}

/**
 * StoryboardListPanel - A panel for displaying storyboards from the discovery system
 *
 * This panel shows:
 * - Hierarchical storyboard structures with canvases and workflows
 * - Search functionality to filter storyboards
 * - Storyboard metadata (name, source, path, workflows)
 * - Click to select and emit events for detail views
 *
 * Uses the new storyboard discovery system from @principal-ai/principal-view-core@0.15.1+
 * Storyboards are provided directly by the discovery system, no transformation needed.
 */
export const StoryboardListPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  usePanelFocusListener('storyboard-list', events, () => panelRef.current?.focus());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cliCommandCopied, setCliCommandCopied] = useState(false);
  const [canvasTypeFilter, setCanvasTypeFilter] = useState<'otel' | 'regular'>('otel');

  // Load storyboard data from discovery system
  // Storyboards come directly from the discovery system (no transformation needed)
  // Also load full workflow templates for sending complete data when workflows are clicked
  const { storyboards, workflows, testTraces, isLoading, error } = useCanvasWorkflowData({ context, actions });

  // Get fileTree to access FileInfo metadata
  const fileTreeSlice = context.getSlice('fileTree');
  const fileTreeData = fileTreeSlice?.data as FileTree | null;

  // Get git status data for showing file change badges
  const gitSlice = context.getSlice('git');
  const gitStatusData = useMemo(() => {
    const gitStatus = gitSlice?.data as GitStatusWithFiles | null;
    return convertGitStatusToFileStatus(gitStatus);
  }, [gitSlice]);

  // Helper to find FileInfo for a canvas path
  const getCanvasFileInfo = useCallback((canvasPath: string): FileInfo | undefined => {
    return fileTreeData?.allFiles.find(f =>
      f.path === canvasPath || f.relativePath === canvasPath
    );
  }, [fileTreeData]);

  // Helper to extract workflow folder name from a test trace path
  // E.g., ".principal-views/authentication-flow/successful-login/execution-1.otel.json" → "successful-login"
  const getWorkflowFromPath = (path: string): string | null => {
    const match = path.match(/\.principal-views\/[^/]+\/([^/]+)\//);
    return match ? match[1] : null;
  };

  // Helper to build execution-scenario map (similar to WorkflowScenariosPanel logic)
  const buildExecutionScenarioMap = (
    workflowTemplate: WorkflowTemplate,
    workflowTestTraces: DiscoveredTestTrace[]
  ): Record<string, string> => {
    const map: Record<string, string> = {};

    if (!workflowTemplate.scenarios) {
      return map;
    }

    workflowTestTraces.forEach((trace) => {
      // Try to match execution to scenario by checking trace content or using index
      // For now, we'll use a simple heuristic: match by execution order
      const executionIndex = workflowTestTraces.indexOf(trace);
      const scenarioIndex = executionIndex % workflowTemplate.scenarios.length;
      const scenario = workflowTemplate.scenarios[scenarioIndex];

      if (scenario) {
        const scenarioId = scenario.id || String(scenarioIndex);
        map[trace.id] = scenarioId;
      }
    });

    return map;
  };

  // Calculate workflow coverage map (workflow ID -> all scenarios have test traces)
  // This checks if ALL scenarios in the workflow have at least one test trace
  const workflowCoverageMap = useMemo(() => {
    const coverageMap: Record<string, boolean> = {};

    workflows.forEach(({ file: workflow, template: workflowTemplate }) => {
      // Find the storyboard/canvas this workflow belongs to
      const workflowStoryboard = storyboards.find(sb =>
        sb.workflows.some(wf => wf.id === workflow.id)
      );

      if (!workflowStoryboard) {
        coverageMap[workflow.id] = false;
        return;
      }

      // Check if workflow has scenarios
      if (!workflowTemplate.scenarios || workflowTemplate.scenarios.length === 0) {
        coverageMap[workflow.id] = false;
        return;
      }

      // Filter test traces that belong to this specific workflow folder
      const workflowFolder = workflow.id.split('/').pop(); // Get last part of workflow ID
      const workflowTestTraces = testTraces.filter(trace => {
        const traceWorkflowFolder = getWorkflowFromPath(trace.path);
        return traceWorkflowFolder === workflowFolder;
      });

      if (workflowTestTraces.length === 0) {
        coverageMap[workflow.id] = false;
        return;
      }

      // Build execution-scenario map
      const executionScenarioMap = buildExecutionScenarioMap(workflowTemplate, workflowTestTraces);

      // Count how many scenarios have at least one test trace
      const totalScenarios = workflowTemplate.scenarios.length;
      const scenariosWithTests = workflowTemplate.scenarios.filter((scenario: WorkflowScenario, index: number) => {
        const scenarioId = scenario.id || String(index);
        const matchingExecutions = workflowTestTraces.filter(
          trace => executionScenarioMap[trace.id] === scenarioId
        );
        return matchingExecutions.length > 0;
      }).length;

      const isFullyCovered = scenariosWithTests === totalScenarios;
      coverageMap[workflow.id] = isFullyCovered;
    });

    return coverageMap;
  }, [workflows, testTraces, storyboards]);

  // Filter storyboards by search query and canvas type
  const filteredStoryboards = useMemo(() => {
    let filtered = storyboards;

    // Filter by canvas type (always filter to show one type)
    filtered = filtered.filter((storyboard) => storyboard.canvas.type === canvasTypeFilter);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((storyboard) => {
        // Search in name
        if (storyboard.name.toLowerCase().includes(query)) return true;
        // Search in path
        if (storyboard.path.toLowerCase().includes(query)) return true;
        // Search in basename
        if (storyboard.basename.toLowerCase().includes(query)) return true;
        // Search in package name
        if (storyboard.packageName && storyboard.packageName.toLowerCase().includes(query)) return true;
        // Search in canvas name
        if (storyboard.canvas.name.toLowerCase().includes(query)) return true;
        // Search in workflows
        if (storyboard.workflows.some(wf => wf.name.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    return filtered;
  }, [storyboards, searchQuery, canvasTypeFilter]);

  // Extract canvases for static canvas view (when canvasTypeFilter === 'regular')
  const filteredCanvases = useMemo(() => {
    return filteredStoryboards.map((storyboard) => storyboard.canvas);
  }, [filteredStoryboards]);

  const handleTreeNodeClick = useCallback((node: StoryboardWorkflowNodeData | CanvasListNodeData) => {
    if (node.type === 'overview' && node.markdownPath) {
      // Overview node click - open markdown documentation
      // For CanvasListNodeData, canvas is directly on node; for StoryboardWorkflowNodeData, it's on storyboard
      const canvasId = (node.canvas?.id) || ('storyboard' in node && (node as StoryboardWorkflowNodeData).storyboard?.canvas?.id) || 'unknown';
      setSelectedNodeId(`overview:${canvasId}`);
      if (events) {
        events.emit({
          type: 'file:open',
          source: 'storyboard-list-panel',
          timestamp: Date.now(),
          payload: { path: node.markdownPath },
        });
      }
    } else if (node.type === 'canvas' && node.canvas) {
      // Canvas click - open canvas editor
      setSelectedNodeId(`canvas:${node.canvas.id}`);
      if (events) {
        const canvasFileInfo = getCanvasFileInfo(node.canvas.path);
        events.emit({
          type: 'custom',
          source: 'storyboard-list-panel',
          timestamp: Date.now(),
          payload: {
            action: 'openCanvas',
            canvasId: node.canvas.id,
            canvas: node.canvas,
            canvasFileInfo,
            openMode: 'editor', // Indicates canvas editor should be opened
          },
        });
      }
    } else if (node.type === 'workflow' && 'workflow' in node && node.workflow && 'storyboard' in node && node.storyboard) {
      // Workflow click - select workflow and open canvas detail with workflow
      setSelectedNodeId(`workflow:${node.workflow.id}`);
      if (events) {
        const canvasFileInfo = getCanvasFileInfo(node.storyboard.canvas.path);
        const workflowFileInfo = getCanvasFileInfo(node.workflow.path);

        // Look up the full workflow template from the loaded workflows
        // node.workflow only has metadata, we need the full template with scenarios
        const fullWorkflow = workflows.find(wf => wf.file.path === node.workflow?.path);
        const workflowToSend = fullWorkflow ? fullWorkflow.template : node.workflow;

        events.emit({
          type: 'custom',
          source: 'storyboard-list-panel',
          timestamp: Date.now(),
          payload: {
            action: 'openCanvas',
            canvasId: node.storyboard.canvas.id,
            canvas: node.storyboard.canvas,
            canvasFileInfo,
            workflowId: node.workflow.id,
            workflow: workflowToSend, // Send full template with scenarios and description
            workflowFileInfo,
            openMode: 'detail', // Indicates canvas detail should be opened
          },
        });
      }
    }
  }, [events, getCanvasFileInfo, workflows]);

  const handleRefresh = () => {
    setIsRefreshing(true);

    // Emit refresh event so parent can handle filesystem rescans, etc.
    // The parent will update the file tree SHA, which will trigger automatic reload via useEffect
    if (events) {
      events.emit({
        type: 'canvas:refresh',
        source: 'storyboard-list-panel',
        timestamp: Date.now(),
        payload: {},
      });
    }

    // Stop the spinner after a short delay to give visual feedback
    // The actual reload happens when parent updates the file tree SHA
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  const handleCopyCliCommand = useCallback(() => {
    const cliCommand = storyboards.length > 0
      ? 'npx @principal-ai/principal-view-cli@latest --help'
      : 'npx @principal-ai/principal-view-cli@latest init';
    navigator.clipboard.writeText(cliCommand).then(() => {
      setCliCommandCopied(true);
      setTimeout(() => setCliCommandCopied(false), 2000);
    });
  }, [storyboards.length]);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      style={{
        position: 'relative',
        paddingTop: 'clamp(8px, 2vw, 12px)',
        paddingBottom: 'clamp(12px, 3vw, 20px)',
        fontFamily: theme.fonts.body,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        overflow: 'hidden',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        outline: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingLeft: 'clamp(16px, 4vw, 24px)',
          paddingRight: 'clamp(8px, 2vw, 16px)',
          flexWrap: 'wrap',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: theme.fontSizes[4],
            color: theme.colors.text,
          }}
        >
          Storyboards
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: storyboards.length >= 10 ? '1 1 200px' : '0 0 auto', maxWidth: storyboards.length >= 10 ? '400px' : 'none' }}>
          {/* Canvas type toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: theme.colors.backgroundSecondary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii[2],
            padding: '4px',
          }}>
            <button
              onClick={() => setCanvasTypeFilter('otel')}
              style={{
                background: canvasTypeFilter === 'otel' ? theme.colors.primary : 'transparent',
                border: 'none',
                borderRadius: theme.radii[1],
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: theme.fontSizes[1],
                fontFamily: theme.fonts.body,
                fontWeight: canvasTypeFilter === 'otel' ? 600 : 400,
                color: canvasTypeFilter === 'otel' ? 'white' : theme.colors.text,
                transition: 'all 0.2s ease',
              }}
              title="Runtime validated .otel.canvas files"
            >
              OTEL
            </button>
            <button
              onClick={() => setCanvasTypeFilter('regular')}
              style={{
                background: canvasTypeFilter === 'regular' ? theme.colors.primary : 'transparent',
                border: 'none',
                borderRadius: theme.radii[1],
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: theme.fontSizes[1],
                fontFamily: theme.fonts.body,
                fontWeight: canvasTypeFilter === 'regular' ? 600 : 400,
                color: canvasTypeFilter === 'regular' ? 'white' : theme.colors.text,
                transition: 'all 0.2s ease',
              }}
              title="Static documentation .canvas files"
            >
              Static
            </button>
          </div>

          {/* Search input - only show if there are 10 or more storyboards */}
          {storyboards.length >= 10 && (
            <div
              style={{
                position: 'relative',
                flex: 1,
                minWidth: '150px',
              }}
            >
              <Search
                size={16}
                color={theme.colors.textSecondary}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search storyboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 32px 8px 32px',
                  fontSize: theme.fontSizes[1],
                  fontFamily: theme.fonts.body,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radii[2],
                  background: theme.colors.backgroundSecondary,
                  color: theme.colors.text,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.textSecondary,
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            style={{
              background: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[1],
              padding: '8px',
              cursor: isRefreshing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Refresh storyboards"
          >
            <RefreshCw
              size={16}
              color={theme.colors.textSecondary}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>

          {/* Help button */}
          <button
            onClick={toggleHelp}
            style={{
              background: showHelp ? theme.colors.primary : theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[1],
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Help & Getting Started"
          >
            <HelpCircle
              size={16}
              color={showHelp ? 'white' : theme.colors.textSecondary}
            />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            flexShrink: 0,
            padding: '12px',
            marginLeft: 'clamp(12px, 3vw, 20px)',
            marginRight: 'clamp(12px, 3vw, 20px)',
            background: `${theme.colors.error}20`,
            border: `1px solid ${theme.colors.error}`,
            borderRadius: theme.radii[2],
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: theme.colors.error,
            fontSize: theme.fontSizes[1],
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'hidden',
          minHeight: 0,
        }}
      >
        {isLoading ? (
          <StoryboardLoadingGraph />
        ) : filteredStoryboards.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textSecondary,
              padding: '24px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: theme.fontSizes[2] }}>
                {searchQuery
                  ? 'No storyboards match your search'
                  : `No ${canvasTypeFilter === 'otel' ? '.otel.canvas' : '.canvas'} files found`}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: theme.fontSizes[1] }}>
                {searchQuery
                  ? 'Try a different search term'
                  : `Add ${canvasTypeFilter === 'otel' ? '.otel.canvas' : '.canvas'} files to .principal-views/ to get started`}
              </p>
            </div>
          </div>
        ) : canvasTypeFilter === 'otel' ? (
          <StoryboardWorkflowsTreeCore
            storyboards={filteredStoryboards}
            theme={theme}
            onClick={handleTreeNodeClick}
            selectedNodeId={selectedNodeId ?? undefined}
            defaultOpen={filteredStoryboards.length <= 2}
            horizontalNodePadding="clamp(16px, 4vw, 24px)"
            verticalPadding="10px"
            workflowCoverageMap={workflowCoverageMap}
            gitStatusData={gitStatusData}
          />
        ) : (
          <CanvasListTreeCore
            canvases={filteredCanvases}
            theme={theme}
            onClick={handleTreeNodeClick as (node: CanvasListNodeData) => void}
            selectedNodeId={selectedNodeId ?? undefined}
            defaultOpen={filteredCanvases.length <= 2}
            horizontalNodePadding="clamp(16px, 4vw, 24px)"
            verticalPadding="10px"
            gitStatusData={gitStatusData}
          />
        )}
      </div>

      {/* Help Overlay */}
      {showHelp && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            position: 'relative',
            width: '90%',
            maxWidth: 500,
            maxHeight: '80%',
            backgroundColor: theme.colors.background,
            borderRadius: theme.radii[3],
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Close button */}
            <button
              onClick={toggleHelp}
              style={{
                position: 'absolute',
                top: theme.space[2],
                right: theme.space[2],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                padding: 0,
                backgroundColor: theme.colors.backgroundSecondary,
                color: theme.colors.textMuted,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[2],
                cursor: 'pointer',
                zIndex: 1,
                transition: 'all 0.15s',
              }}
            >
              <X size={16} />
            </button>
            {storyboards.length === 0 ? (
              <EmptyStateContent theme={theme} />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                padding: theme.space[4],
                gap: theme.space[3],
                overflowY: 'auto',
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: theme.fontSizes[3],
                  fontWeight: theme.fontWeights.medium,
                  color: theme.colors.text,
                }}>
                  Storyboards Panel
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: theme.fontSizes[2],
                  color: theme.colors.textMuted,
                  lineHeight: 1.5,
                }}>
                  This panel displays .canvas (static) and .otel.canvas (runtime validated) files found in your project's .principal-views/ directory. Use the toggle to switch between types.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.space[2],
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: theme.fontSizes[2],
                    fontWeight: theme.fontWeights.medium,
                    color: theme.colors.text,
                  }}>
                    Features:
                  </h4>
                  <ul style={{
                    margin: 0,
                    paddingLeft: theme.space[4],
                    fontSize: theme.fontSizes[1],
                    color: theme.colors.textMuted,
                    lineHeight: 1.6,
                  }}>
                    <li>Toggle between runtime validated (.otel.canvas) and static (.canvas) files</li>
                    <li>Browse and search through available storyboards</li>
                    <li>Filter by package if you have a monorepo structure</li>
                    <li>Click a storyboard to view the canvas in the editor</li>
                    <li>Click a workflow to view executions for that workflow</li>
                    <li>Use the refresh button to rescan for new files</li>
                  </ul>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.space[2],
                  marginTop: theme.space[2],
                  paddingTop: theme.space[3],
                  borderTop: `1px solid ${theme.colors.border}`,
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: theme.fontSizes[2],
                    fontWeight: theme.fontWeights.medium,
                    color: theme.colors.text,
                  }}>
                    CLI Tool:
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: theme.fontSizes[1],
                    color: theme.colors.textMuted,
                    lineHeight: 1.5,
                  }}>
                    View available commands for managing storyboards:
                  </p>
                  <button
                    onClick={handleCopyCliCommand}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: theme.space[2],
                      padding: `${theme.space[2]}px ${theme.space[3]}px`,
                      backgroundColor: theme.colors.backgroundSecondary,
                      color: theme.colors.text,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radii[2],
                      cursor: 'pointer',
                      fontFamily: theme.fonts.monospace,
                      fontSize: theme.fontSizes[1],
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <code style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      npx @principal-ai/principal-view-cli@latest --help
                    </code>
                    {cliCommandCopied ? (
                      <Check size={16} style={{ color: theme.colors.success || '#22c55e', flexShrink: 0 }} />
                    ) : (
                      <Copy size={16} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
