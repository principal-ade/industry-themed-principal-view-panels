import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { StoryboardListPanelPropsTyped } from '../types';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { AlertCircle, Search, X, RefreshCw, HelpCircle, Copy, Check, Network, Layers } from 'lucide-react';
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
  type CanvasNodeStatus,
} from '@principal-ade/dynamic-file-tree';
import type { FileTree, FileInfo, GitStatusWithFiles } from '@principal-ai/repository-abstraction';
import type { WorkflowTemplate, DiscoveredTestTrace, WorkflowScenario, DiscoveredCanvasWithContent, PVNodeExtension } from '@principal-ai/principal-view-core';

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
export const StoryboardListPanel: React.FC<StoryboardListPanelPropsTyped> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  usePanelFocusListener('storyboard-list', events, () => panelRef.current?.focus());

  // State for controlled tree expansion (for programmatic control like tours)
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  // Handle tree node toggle - update openState
  const handleTreeToggle = useCallback((nodeId: string, isOpen: boolean) => {
    setOpenState(prev => ({ ...prev, [nodeId]: isOpen }));
  }, []);

  // Ref to store the click handler for programmatic access
  const handleTreeNodeClickRef = useRef<((node: StoryboardWorkflowNodeData | CanvasListNodeData, event?: React.MouseEvent) => void) | null>(null);

  // Listen for basic programmatic events (switchTab, toggleNode)
  useEffect(() => {
    if (!events) return;

    const handleCustomEvent = (event: { type: string; payload?: unknown }) => {
      const payload = event.payload as {
        action?: string;
        tab?: 'otel' | 'regular';
        nodeId?: string;
        open?: boolean;
      } | undefined;

      if (payload?.action === 'switchTab' && payload.tab) {
        setCanvasTypeFilter(payload.tab);
      } else if (payload?.action === 'toggleNode' && payload.nodeId !== undefined) {
        // Toggle or set specific open state for a node
        setOpenState(prev => {
          const currentState = prev[payload.nodeId!] ?? false;
          const newState = payload.open !== undefined ? payload.open : !currentState;
          return { ...prev, [payload.nodeId!]: newState };
        });
      }
    };

    events.on('custom', handleCustomEvent);
    return () => {
      events.off('custom', handleCustomEvent);
    };
  }, [events]);

  // Get controlled selection from context (for programmatic control like tours)
  const selectedNodeIdFromContext = context.selectedNodeId;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync controlled selection from context to internal state
  useEffect(() => {
    if (selectedNodeIdFromContext !== undefined) {
      setSelectedNodeId(selectedNodeIdFromContext);
    }
  }, [selectedNodeIdFromContext]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cliCommandCopied, setCliCommandCopied] = useState(false);
  const [canvasTypeFilter, setCanvasTypeFilter] = useState<'otel' | 'regular' | null>(null);

  // Context menu state for copying file paths
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: StoryboardWorkflowNodeData | CanvasListNodeData;
  } | null>(null);
  const [contextMenuCopied, setContextMenuCopied] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Load storyboard data from discovery system
  // Storyboards come directly from the discovery system (no transformation needed)
  // Also load full workflow templates for sending complete data when workflows are clicked
  const { storyboards, workflows, testTraces, isLoading, error, discovery } = useCanvasWorkflowData({ context, actions });

  // Listen for selectNode events (requires storyboards to be loaded)
  useEffect(() => {
    if (!events) return;

    const handleSelectNode = (event: { type: string; payload?: unknown }) => {
      const payload = event.payload as {
        action?: string;
        nodeId?: string;
      } | undefined;

      if (payload?.action === 'selectNode' && payload.nodeId !== undefined) {
        // Programmatically select a node and emit events as if clicked
        // nodeId format: "canvas:id", "workflow:id", "overview:id", "storyboard:id"
        const [type, ...idParts] = payload.nodeId.split(':');
        const id = idParts.join(':'); // Rejoin in case id contains colons

        if (handleTreeNodeClickRef.current) {
          // Find the matching node data based on type and id
          if (type === 'storyboard' || type === 'canvas') {
            // Find storyboard by id (basename)
            const storyboard = storyboards.find(sb => sb.basename === id || sb.canvas.id === id);
            if (storyboard) {
              const node: StoryboardWorkflowNodeData = {
                id: `canvas:${storyboard.canvas.id}`,
                name: storyboard.canvas.name,
                type: 'canvas',
                canvas: storyboard.canvas,
                storyboard,
              };
              handleTreeNodeClickRef.current(node);
            }
          } else if (type === 'workflow') {
            // Find workflow by id - need to search through storyboards
            // Workflow IDs can be full paths like "storyboard-name/workflow-name" or just "workflow-name"
            for (const storyboard of storyboards) {
              const workflow = storyboard.workflows.find(wf =>
                wf.id === id ||
                wf.name === id ||
                wf.id.endsWith(`/${id}`) ||  // Match partial path
                wf.id.split('/').pop() === id  // Match just the workflow folder name
              );
              if (workflow) {
                const node: StoryboardWorkflowNodeData = {
                  id: `workflow:${workflow.id}`,
                  name: workflow.name,
                  type: 'workflow',
                  workflow,
                  storyboard,
                };
                handleTreeNodeClickRef.current(node);
                break;
              }
            }
          } else if (type === 'overview') {
            // Find canvas with markdown for overview
            const storyboard = storyboards.find(sb => sb.basename === id || sb.canvas.id === id);
            if (storyboard && storyboard.canvas.markdownPath) {
              const node: StoryboardWorkflowNodeData = {
                id: `overview:${storyboard.canvas.id}`,
                name: 'Overview',
                type: 'overview',
                markdownPath: storyboard.canvas.markdownPath,
                canvas: storyboard.canvas,
                storyboard,
              };
              handleTreeNodeClickRef.current(node);
            }
          }
        }
      }
    };

    events.on('custom', handleSelectNode);
    return () => {
      events.off('custom', handleSelectNode);
    };
  }, [events, storyboards]);

  // Count storyboards by type to determine default tab
  // Architecture canvases: regular, scopes, resources, spans
  const { otelCount, staticCount } = useMemo(() => {
    const otel = storyboards.filter(sb => sb.canvas.type === 'otel').length;
    const architectureTypes = ['regular', 'scopes', 'resources', 'spans'];
    const regular = storyboards.filter(sb => architectureTypes.includes(sb.canvas.type)).length;
    return { otelCount: otel, staticCount: regular };
  }, [storyboards]);

  // Auto-select the tab that has content (only once when data loads)
  // If both have content, prefer Architecture; if neither, default to Architecture
  const effectiveCanvasTypeFilter = useMemo(() => {
    if (canvasTypeFilter !== null) {
      return canvasTypeFilter;
    }
    // Auto-select: prefer the one with content, or Architecture if both/neither have content
    if (otelCount > 0 && staticCount === 0) {
      return 'otel';
    }
    if (staticCount > 0 && otelCount === 0) {
      return 'regular';
    }
    return 'regular'; // Default to Architecture if both have content or neither has content
  }, [canvasTypeFilter, otelCount, staticCount]);

  // Get fileTree to access FileInfo metadata
  // Get fileTree and git from typed context (direct property access)
  const fileTreeSlice = context.fileTree;
  const fileTreeData = fileTreeSlice?.data as FileTree | null;

  // Get git status data for showing file change badges
  // Only include git status for files relevant to canvas discovery to avoid unnecessary re-renders
  const gitSlice = context.gitStatusWithFiles;
  const gitStatusData = useMemo(() => {
    const gitStatus = gitSlice?.data as GitStatusWithFiles | null;
    if (!gitStatus || !fileTreeData) {
      return [];
    }
    // Filter to only relevant files using discovery instance
    const filteredGitStatus = discovery.filterRelevantGitChanges(fileTreeData, gitStatus);
    if (!filteredGitStatus) {
      return [];
    }
    return convertGitStatusToFileStatus(filteredGitStatus);
  }, [gitSlice?.data, fileTreeData, discovery]);

  // Helper to find FileInfo for a canvas path
  // Uses allFiles array reference - only changes when file tree content changes
  const allFiles = fileTreeData?.allFiles;
  const getCanvasFileInfo = useCallback((canvasPath: string): FileInfo | undefined => {
    return allFiles?.find(f =>
      f.path === canvasPath || f.relativePath === canvasPath
    );
  }, [allFiles]);

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

  // Calculate canvas node status map (storyboard ID -> implementation status counts)
  // This extracts status from each canvas node's pv.status field
  const canvasNodeStatusMap = useMemo(() => {
    const statusMap: Record<string, CanvasNodeStatus> = {};

    for (const storyboard of storyboards) {
      // Content is loaded via includeContent: true but types don't expose it
      const canvasWithContent = storyboard.canvas as DiscoveredCanvasWithContent;
      const canvas = canvasWithContent.content;

      if (canvas?.nodes) {
        let implemented = 0;
        let approved = 0;
        let draft = 0;

        for (const node of canvas.nodes) {
          const pv = (node as { pv?: PVNodeExtension }).pv;
          // Skip nodes without pv extension - they're visual labels, not functional nodes
          if (!pv) continue;

          const status = pv.status ?? 'draft';

          if (status === 'implemented') {
            implemented++;
          } else if (status === 'approved') {
            approved++;
          } else {
            draft++;
          }
        }

        statusMap[storyboard.id] = { implemented, approved, draft };
      }
    }

    return statusMap;
  }, [storyboards]);

  // Filter storyboards by search query and canvas type
  const filteredStoryboards = useMemo(() => {
    let filtered = storyboards;

    // Filter by canvas type (always filter to show one type)
    // Architecture canvases: regular, scopes, resources, spans
    filtered = filtered.filter((storyboard) => {
      if (effectiveCanvasTypeFilter === 'regular') {
        const architectureTypes = ['regular', 'scopes', 'resources', 'spans'];
        return architectureTypes.includes(storyboard.canvas.type);
      }
      return storyboard.canvas.type === effectiveCanvasTypeFilter;
    });

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
  }, [storyboards, searchQuery, effectiveCanvasTypeFilter]);

  // Extract canvases for static canvas view (when canvasTypeFilter === 'regular')
  const filteredCanvases = useMemo(() => {
    return filteredStoryboards.map((storyboard) => storyboard.canvas);
  }, [filteredStoryboards]);

  const handleTreeNodeClick = useCallback((node: StoryboardWorkflowNodeData | CanvasListNodeData, event?: React.MouseEvent) => {
    // Command-click (macOS) or Ctrl-click (Windows/Linux) opens file in editor tab
    if (event?.metaKey || event?.ctrlKey) {
      let filePath: string | undefined;

      if (node.type === 'canvas' && node.canvas?.path) {
        filePath = node.canvas.path;
      } else if (node.type === 'workflow' && 'workflow' in node && node.workflow?.path) {
        filePath = node.workflow.path;
      } else if (node.markdownPath) {
        filePath = node.markdownPath;
      }

      if (filePath && events) {
        events.emit({
          type: 'file:open',
          source: 'storyboard-list-panel',
          timestamp: Date.now(),
          payload: { path: filePath },
        });
        return; // Don't proceed with normal click handling
      }
    }

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
        if (!fullWorkflow) {
          // Template not loaded yet - don't emit incomplete data
          console.warn('[StoryboardListPanel] Workflow template not loaded for:', node.workflow?.path);
          return;
        }

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
            workflow: fullWorkflow.template,
            workflowFileInfo,
            openMode: 'detail', // Indicates canvas detail should be opened
          },
        });
      }
    }
  }, [events, getCanvasFileInfo, workflows]);

  // Helper to get the file path from a node (works for both tree types)
  const getNodeFilePath = useCallback((node: StoryboardWorkflowNodeData | CanvasListNodeData): string | undefined => {
    if (node.type === 'canvas' && node.canvas?.path) {
      return node.canvas.path;
    } else if (node.type === 'workflow' && 'workflow' in node && node.workflow?.path) {
      return node.workflow.path;
    } else if (node.type === 'overview' && node.markdownPath) {
      return node.markdownPath;
    } else if (node.type === 'storyboard' && 'storyboard' in node && node.storyboard?.canvas?.path) {
      return node.storyboard.canvas.path;
    } else if (node.type === 'canvas-folder' && node.canvas?.path) {
      return node.canvas.path;
    }
    return undefined;
  }, []);

  // Context menu handler for copying file paths (works for both tree types)
  const handleContextMenu = useCallback((event: React.MouseEvent, node: StoryboardWorkflowNodeData | CanvasListNodeData) => {
    event.preventDefault();
    const path = getNodeFilePath(node);
    if (path) {
      setContextMenu({ x: event.clientX, y: event.clientY, node });
      setContextMenuCopied(false);
    }
  }, [getNodeFilePath]);

  // Copy path to clipboard and close menu
  const handleCopyPath = useCallback(async () => {
    if (!contextMenu) return;
    const path = getNodeFilePath(contextMenu.node);
    if (path) {
      try {
        await navigator.clipboard.writeText(path);
        setContextMenuCopied(true);
        setTimeout(() => {
          setContextMenu(null);
          setContextMenuCopied(false);
        }, 800);
      } catch {
        console.error('Failed to copy path to clipboard');
        setContextMenu(null);
      }
    }
  }, [contextMenu, getNodeFilePath]);

  // Close context menu on click outside or escape
  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

  // Keep ref updated for programmatic access from event handlers
  useEffect(() => {
    handleTreeNodeClickRef.current = handleTreeNodeClick;
  }, [handleTreeNodeClick]);

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
      // Brief delay so user sees the checkmark confirmation before modal closes
      setTimeout(() => {
        setShowHelp(false);
        setCliCommandCopied(false);
      }, 600);
    });
  }, [storyboards.length]);

  const handleCopyInitCommand = useCallback(() => {
    navigator.clipboard.writeText('npx @principal-ai/principal-view-cli@latest init').then(() => {
      setCliCommandCopied(true);
      setTimeout(() => setCliCommandCopied(false), 2000);
    });
  }, []);

  const handleOpenMultiCanvas = useCallback(() => {
    if (!events || filteredStoryboards.length === 0) return;

    // Emit event to open multi-canvas view with all visible canvases
    events.emit({
      type: 'custom',
      source: 'storyboard-list-panel',
      timestamp: Date.now(),
      payload: {
        action: 'openMultiCanvas',
        canvases: filteredStoryboards.map((sb) => ({
          id: sb.canvas.id,
          canvas: sb.canvas,
          label: sb.name,
          fileInfo: getCanvasFileInfo(sb.canvas.path),
        })),
        canvasType: effectiveCanvasTypeFilter,
      },
    });
  }, [events, filteredStoryboards, effectiveCanvasTypeFilter, getCanvasFileInfo]);

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
          flexDirection: 'column',
          gap: '8px',
          paddingLeft: 'clamp(12px, 3vw, 16px)',
          paddingRight: 'clamp(12px, 3vw, 16px)',
        }}
      >
        {/* Title row - always inline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: theme.fontSizes[4],
              color: theme.colors.text,
              whiteSpace: 'nowrap',
            }}
          >
            Storyboards
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {/* View All Canvases button */}
            {filteredStoryboards.length >= 2 && (
              <button
                onClick={handleOpenMultiCanvas}
                style={{
                  background: theme.colors.backgroundSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radii[1],
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                title={`View all ${filteredStoryboards.length} canvases together`}
              >
                <Layers
                  size={14}
                  color={theme.colors.textSecondary}
                />
              </button>
            )}

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              style={{
                background: theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[1],
                padding: '6px',
                cursor: isRefreshing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title="Refresh storyboards"
            >
              <RefreshCw
                size={14}
                color={theme.colors.textSecondary}
                style={{
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                }}
              />
            </button>

            {/* Help button - draggable to copy CLI command */}
            <button
              onClick={toggleHelp}
              draggable
              onDragStart={(e) => {
                const cliCommand = storyboards.length > 0
                  ? 'npx @principal-ai/principal-view-cli@latest --help'
                  : 'npx @principal-ai/principal-view-cli@latest init';

                const dragData = {
                  dataType: 'cli-command',
                  primaryData: cliCommand,
                  metadata: {
                    description: 'Principal View CLI command',
                    action: storyboards.length > 0 ? 'help' : 'init',
                  },
                  suggestedActions: ['paste', 'execute'],
                  sourcePanel: 'storyboard-list',
                  dragPreview: cliCommand,
                };

                e.dataTransfer.setData('application/x-panel-data', JSON.stringify(dragData));
                e.dataTransfer.setData('text/plain', cliCommand);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              style={{
                background: showHelp ? theme.colors.primary : theme.colors.backgroundSecondary,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[1],
                padding: '6px',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title="Help & Getting Started (drag to copy CLI command)"
            >
              <HelpCircle
                size={14}
                color={showHelp ? 'white' : theme.colors.textSecondary}
              />
            </button>
          </div>
        </div>

        {/* Canvas type toggle - full width, 50/50 split */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii[2],
          padding: '3px',
        }}>
          <button
            onClick={() => setCanvasTypeFilter('regular')}
            style={{
              flex: 1,
              background: effectiveCanvasTypeFilter === 'regular' ? theme.colors.primary : 'transparent',
              border: 'none',
              borderRadius: theme.radii[1],
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
              fontWeight: effectiveCanvasTypeFilter === 'regular' ? 600 : 400,
              color: effectiveCanvasTypeFilter === 'regular' ? 'white' : theme.colors.text,
              transition: 'all 0.2s ease',
            }}
            title="Static architecture .canvas files"
          >
            Architecture
          </button>
          <button
            onClick={() => setCanvasTypeFilter('otel')}
            style={{
              flex: 1,
              background: effectiveCanvasTypeFilter === 'otel' ? theme.colors.primary : 'transparent',
              border: 'none',
              borderRadius: theme.radii[1],
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
              fontWeight: effectiveCanvasTypeFilter === 'otel' ? 600 : 400,
              color: effectiveCanvasTypeFilter === 'otel' ? 'white' : theme.colors.text,
              transition: 'all 0.2s ease',
            }}
            title="Runtime validated .otel.canvas files"
          >
            OTEL Workflows
          </button>
        </div>

        {/* Search input - only show if there are 10 or more storyboards */}
        {storyboards.length >= 10 && (
          <div
            style={{
              position: 'relative',
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
              color: theme.colors.textMuted,
              padding: theme.space[4],
              fontFamily: theme.fonts.body,
            }}
          >
            {searchQuery ? (
              <div style={{ textAlign: 'center', fontFamily: theme.fonts.body }}>
                <Network size={56} style={{ marginBottom: theme.space[3], opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: theme.fontSizes[2] }}>
                  No storyboards match your search
                </p>
                <p style={{ margin: `${theme.space[2]}px 0 0 0`, fontSize: theme.fontSizes[1] }}>
                  Try a different search term
                </p>
              </div>
            ) : effectiveCanvasTypeFilter === 'otel' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: theme.fonts.body,
                maxWidth: '500px',
                width: '90%',
              }}>
                <Network size={56} style={{ marginBottom: theme.space[3], opacity: 0.3 }} />
                <span style={{
                  fontSize: theme.fontSizes[3],
                  fontWeight: theme.fontWeights.medium,
                  marginBottom: theme.space[2],
                  color: theme.colors.text,
                }}>
                  No OTEL Workflows found
                </span>
                <span style={{
                  fontSize: theme.fontSizes[2],
                  marginBottom: theme.space[3],
                  lineHeight: 1.5,
                }}>
                  Create runtime-validated canvases that connect to your codebase with OpenTelemetry traces.
                </span>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.space[2],
                  width: '100%',
                }}>
                  <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted, marginTop: `${theme.space[4]}px` }}>
                    Run this command to get started:
                  </span>
                  <button
                    onClick={handleCopyInitCommand}
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
                    <code>
                      npx @principal-ai/principal-view-cli@latest init
                    </code>
                    {cliCommandCopied ? (
                      <Check size={16} style={{ color: theme.colors.success || '#22c55e', flexShrink: 0 }} />
                    ) : (
                      <Copy size={16} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: theme.fonts.body,
                maxWidth: '500px',
                width: '90%',
              }}>
                <Network size={56} style={{ marginBottom: theme.space[3], opacity: 0.3 }} />
                <span style={{
                  fontSize: theme.fontSizes[3],
                  fontWeight: theme.fontWeights.medium,
                  marginBottom: theme.space[2],
                  color: theme.colors.text,
                }}>
                  No Architecture Diagrams found
                </span>
                <span style={{
                  fontSize: theme.fontSizes[2],
                  marginBottom: theme.space[3],
                  lineHeight: 1.5,
                }}>
                  Create architecture diagrams to document your codebase structure.
                </span>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.space[2],
                  width: '100%',
                }}>
                  <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted, marginTop: `${theme.space[4]}px` }}>
                    Run this command to get started:
                  </span>
                  <button
                    onClick={handleCopyInitCommand}
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
                    <code>
                      npx @principal-ai/principal-view-cli@latest init
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
        ) : effectiveCanvasTypeFilter === 'otel' ? (
          <StoryboardWorkflowsTreeCore
            storyboards={filteredStoryboards}
            theme={theme}
            onClick={handleTreeNodeClick}
            onContextMenu={handleContextMenu}
            selectedNodeId={selectedNodeId ?? undefined}
            defaultOpen={filteredStoryboards.length <= 2}
            openState={openState}
            onToggle={handleTreeToggle}
            horizontalNodePadding="clamp(16px, 4vw, 24px)"
            verticalPadding="10px"
            workflowCoverageMap={workflowCoverageMap}
            canvasNodeStatusMap={canvasNodeStatusMap}
            gitStatusData={gitStatusData}
            enablePanelDrag
          />
        ) : (
          <CanvasListTreeCore
            canvases={filteredCanvases}
            theme={theme}
            onClick={handleTreeNodeClick as (node: CanvasListNodeData, event?: React.MouseEvent) => void}
            onContextMenu={handleContextMenu}
            selectedNodeId={selectedNodeId ?? undefined}
            defaultOpen={filteredCanvases.length <= 2}
            openState={openState}
            onToggle={handleTreeToggle}
            horizontalNodePadding="clamp(16px, 4vw, 24px)"
            verticalPadding="10px"
            gitStatusData={gitStatusData}
            enablePanelDrag
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

      {/* Context menu for copying file paths - rendered as portal */}
      {contextMenu && createPortal(
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: '180px',
            padding: '4px 0',
            fontFamily: theme.fonts.body,
          }}
        >
          <style>
            {`
              .storyboard-context-menu-item {
                transition: background-color 0.15s ease;
              }
              .storyboard-context-menu-item:hover {
                background-color: ${theme.colors.backgroundTertiary} !important;
              }
            `}
          </style>
          <button
            onClick={handleCopyPath}
            className="storyboard-context-menu-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: theme.fontSizes[1],
              color: theme.colors.text,
              textAlign: 'left',
            }}
          >
            {contextMenuCopied ? (
              <>
                <Check size={14} style={{ color: theme.colors.success || '#22c55e' }} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Path</span>
              </>
            )}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};
