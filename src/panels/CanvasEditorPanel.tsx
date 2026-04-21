import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { CanvasEditorPanelPropsTyped } from '../types';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer, WorkflowSequenceDiagram } from '@principal-ai/principal-view-react';
import type { GraphRendererHandle, PendingChanges } from '@principal-ai/principal-view-react';
import type { ExtendedCanvas, PVNodeExtension, ComponentLibrary, WorkflowTemplate, WorkflowScenario, OtelAttributes, OtelEvent } from '@principal-ai/principal-view-core';
import { getNodeEventName, isStandardCanvasNode } from '@principal-ai/principal-view-core';
import { getSpansFromTrace, type RegisteredTrace } from '../types/otel';
import { Loader, Save, X, Pencil, Copy, Check, Info, Grid3X3, RefreshCw, Search, ChevronUp, ChevronDown, Layers } from 'lucide-react';
import { ConfigLoader } from './principal-view/ConfigLoader';
import { ErrorStateContent } from './principal-view/ErrorStateContent';
import { EmptyStateContent } from './principal-view/EmptyStateContent';
import type { FileInfo } from '@principal-ai/repository-abstraction';
import { AnimatedResizableLayout } from '@principal-ade/panels';
import { ScenariosList } from './execution-viewer/ScenariosList';
import { EventCarousel } from './execution-viewer/EventCarousel';
import { mapEventToNodeId } from './execution-viewer/EventNodeMapper';
import { HexColorPicker } from 'react-colorful';
import yaml from 'js-yaml';

/**
 * Default minimal library used when no library.yaml is found.
 */
const DEFAULT_LIBRARY: ComponentLibrary = {
  version: '1.0.0',
  name: 'Default Library',
  description: 'Minimal default library for rendering',
};

interface GraphPanelState {
  canvas: ExtendedCanvas | null;
  library: ComponentLibrary; // Always defined, uses default if no library.yaml found
  libraryVersion: number; // Increment when library changes to force GraphRenderer refresh
  spansCanvas: ExtendedCanvas | null;
  loading: boolean;
  error: string | null;
  // Legend overlay
  showLegend: boolean;
  // Tooltips on hover
  showTooltips: boolean;
  // Grid lines background
  showGridLines: boolean;
  // Edit mode state
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  // Scenario state (for workflow integration)
  selectedScenarioId: string | null;
  selectedScenario: WorkflowScenario | null;
  hoveredScenarioEventNames: string[] | null;
  currentEventIndex: number;
  highlightedNodeId: string | null;
  focusedNodeId: string | null;
  // Search state
  isSearchOpen: boolean;
  searchQuery: string;
  // Main view mode (canvas graph vs sequence diagram)
  mainViewMode: 'canvas' | 'sequence';
  // Color picker state for scopes
  colorPickerScope: string | null;
  colorPickerPosition: { x: number; y: number } | null;
}

/**
 * Props for CanvasEditorPanel
 */
export interface CanvasEditorPanelProps extends CanvasEditorPanelPropsTyped {
  /**
   * Canvas path to load (relative to repository root).
   */
  canvasPath?: string;

  /**
   * Canvas display name.
   */
  canvasName?: string;

  /**
   * Optional canvas file info with metadata (size, lastModified, etc.).
   * Used for detecting file changes and auto-reloading.
   */
  canvasFileInfo?: FileInfo | null;

  /**
   * Workflow template with scenarios (optional).
   * When provided, displays ScenariosList side panel and enables scenario browsing.
   */
  workflowTemplate?: WorkflowTemplate | null;

  /**
   * Workflow ID for display and identification (optional).
   */
  selectedWorkflowId?: string | null;

  /**
   * Path to the workflow file (optional).
   */
  workflowPath?: string | null;

  /**
   * Workflow file info with metadata (optional).
   */
  workflowFileInfo?: FileInfo | null;

  /**
   * Match info from a trace showing which scenarios matched (optional).
   * Used to highlight matched scenarios in the ScenariosList.
   */
  traceMatchInfo?: Array<{
    scenarioId: string;
    matchType: 'full' | 'partial';
    coveragePercent?: number;
  }>;

  /**
   * Scenario ID to auto-select (optional).
   * When provided, auto-selects the matching scenario from workflowTemplate.
   */
  selectedScenarioId?: string | null;

  /**
   * Selected trace for template interpolation (optional).
   * When provided, trace events are passed to EventCarousel to fill in
   * template variables like {{session.id}}.
   */
  selectedTrace?: RegisteredTrace | null;

  /**
   * Optional callback to close the panel.
   * When provided, displays a close button (X) in the header.
   */
  onClosePanel?: () => void;

  /**
   * Path to a .spans.canvas file (relative to repository root).
   * When provided, span colors from this file are used to color event nodes.
   * Span colors become the FILL color for nodes.
   */
  spansCanvasPath?: string | null;

  /**
   * Span pattern to use for coloring event nodes.
   * Should match a spanPattern defined in the spansCanvas.
   * When provided with spansCanvasPath, events are colored with the span's color.
   */
  workflowSpanPattern?: string | null;
}

/**
 * Principal View Graph Panel
 *
 * Visualizes .canvas configuration files as interactive graph diagrams
 * with full editing support for nodes, edges, and positions.
 */
export const CanvasEditorPanel: React.FC<CanvasEditorPanelProps> = ({
  context,
  actions,
  events,
  canvasPath,
  canvasName,
  canvasFileInfo,
  workflowTemplate,
  selectedWorkflowId: _selectedWorkflowId,
  workflowPath: _workflowPath,
  workflowFileInfo: _workflowFileInfo,
  traceMatchInfo,
  selectedScenarioId: selectedScenarioIdProp,
  selectedTrace,
  onClosePanel,
  spansCanvasPath,
  workflowSpanPattern,
}) => {
  const { theme } = useTheme();

  // Ref to GraphRenderer for getting pending changes
  const graphRef = useRef<GraphRendererHandle>(null);

  // Track container dimensions for instant viewport positioning
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number } | null>(null);

  // Store library path for saving
  const libraryPathRef = useRef<string | null>(null);

  const [state, setState] = useState<GraphPanelState>({
    canvas: null,
    library: DEFAULT_LIBRARY,
    libraryVersion: 0,
    spansCanvas: null,
    loading: true,
    error: null,
    showLegend: false,
    showTooltips: true,
    showGridLines: false,
    isEditMode: false,
    hasUnsavedChanges: false,
    isSaving: false,
    // Scenario state
    selectedScenarioId: null,
    selectedScenario: null,
    hoveredScenarioEventNames: null,
    currentEventIndex: 0,
    highlightedNodeId: null,
    focusedNodeId: null,
    // Search state
    isSearchOpen: false,
    searchQuery: '',
    // Main view mode
    mainViewMode: 'canvas',
    // Color picker state
    colorPickerScope: null,
    colorPickerPosition: null,
  });

  // Track container dimensions using ref callback + ResizeObserver
  const observerRef = useRef<ResizeObserver | null>(null);

  const containerRefCallback = useCallback((node: HTMLDivElement | null) => {
    // Clean up old observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Store ref for other uses
    (canvasContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;

    if (!node) return;

    // Create observer immediately
    observerRef.current = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setContainerDimensions({ width, height });
      }
    });

    observerRef.current.observe(node);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Track whether to fit viewport to active nodes (one-shot on scenario selection)
  const [shouldFitToNodes, setShouldFitToNodes] = useState(false);
  // Counter to force new array reference when re-fitting to same nodes
  const [fitCounter, setFitCounter] = useState(0);

  // Track dimensions for re-fit detection when container size stabilizes
  const initialDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const dimensionStabilizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect when dimensions stabilize after significant change and trigger re-fit
  useEffect(() => {
    if (!containerDimensions || !state.canvas) return;

    // Clear any pending stabilization timer
    if (dimensionStabilizeTimerRef.current) {
      clearTimeout(dimensionStabilizeTimerRef.current);
    }

    // If we don't have initial dimensions yet, record them
    if (!initialDimensionsRef.current) {
      initialDimensionsRef.current = containerDimensions;
      return;
    }

    const initial = initialDimensionsRef.current;
    const widthChange = Math.abs(containerDimensions.width - initial.width);

    // If width changed significantly (>100px), wait for stabilization then re-fit
    if (widthChange > 100) {
      dimensionStabilizeTimerRef.current = setTimeout(() => {
        // Update initial dimensions to current
        initialDimensionsRef.current = containerDimensions;
        // Trigger re-fit
        setFitCounter(c => c + 1);
        setShouldFitToNodes(true);
      }, 100); // Wait 100ms for dimensions to stabilize
    }

    return () => {
      if (dimensionStabilizeTimerRef.current) {
        clearTimeout(dimensionStabilizeTimerRef.current);
      }
    };
  }, [containerDimensions, state.canvas]);

  // Track whether the event carousel is expanded
  const [isCarouselExpanded, setIsCarouselExpanded] = useState(false);

  // Store context and actions in refs to avoid recreation of callbacks
  const contextRef = useRef(context);
  const actionsRef = useRef(actions);
  const eventsRef = useRef(events);
  contextRef.current = context;
  actionsRef.current = actions;
  eventsRef.current = events;

  // Track if we should skip the next file change (after save)
  const skipNextFileChangeRef = useRef(false);

  // Check if editing is available (writeFile action exists)
  const canEdit = !!actions.writeFile;

  // Track canvas file timestamp for auto-reload on changes
  const canvasFileTimestampRef = useRef<number | null>(null);

  // Extract fileTree SHA to detect changes without breaking ref optimization
  // This allows effects to trigger when fileTree changes while keeping context as a ref
  const fileTreeSha = React.useMemo(() => {
    // Get fileTree from typed context (direct property access)
    const slice = context.fileTree;
    return slice?.data?.sha || null;
  }, [context]);

  // Track "copied" feedback for copy path button
  const [pathCopied, setPathCopied] = useState(false);

  // Track "copied nodes" feedback toast
  const [copiedNodesCount, setCopiedNodesCount] = useState<number | null>(null);

  // Search input ref for focus management
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Track current search result index for navigation
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  const loadConfiguration = useCallback(async () => {
    // Early return if required props are missing
    if (!canvasPath) {
      setState(prev => ({ ...prev, canvas: null, library: DEFAULT_LIBRARY, libraryVersion: prev.libraryVersion + 1, spansCanvas: null, loading: false, error: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const ctx = contextRef.current;
      const acts = actionsRef.current;

      const readFile = (acts as { readFile?: (path: string) => Promise<string> }).readFile;
      if (!readFile) {
        throw new Error('readFile action not available');
      }

      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      // Read canvas file directly using canvasPath prop
      const fullPath = `${repositoryPath}/${canvasPath}`;
      const configContent = await readFile(fullPath);

      if (!configContent || typeof configContent !== 'string') {
        throw new Error('Failed to read canvas file');
      }

      const canvas = ConfigLoader.parseCanvas(configContent);

      // Load library.yaml if it exists
      let library: ComponentLibrary | null = null;

      // Check if fileTree slice is available for library loading
      const fileTreeSlice = ctx.fileTree;
      if (fileTreeSlice && !fileTreeSlice.loading) {
        const fileTreeData = fileTreeSlice.data;

        if (fileTreeData?.allFiles) {
          const libraryPath = ConfigLoader.findLibraryPath(fileTreeData.allFiles);
          if (libraryPath) {
            // Store library path for saving
            libraryPathRef.current = `${repositoryPath}/${libraryPath}`;
            try {
              const libraryFullPath = `${repositoryPath}/${libraryPath}`;
              const libraryContent = await readFile(libraryFullPath);
              if (libraryContent && typeof libraryContent === 'string') {
                library = ConfigLoader.parseLibrary(libraryContent);
              }
            } catch (libraryError) {
              // Library loading is optional, don't fail the whole operation
              console.warn('[PrincipalView] Failed to load library.yaml:', libraryError);
            }
          }
        }
      }

      // Load spans canvas if spansCanvasPath is provided
      let spansCanvas: ExtendedCanvas | null = null;
      if (spansCanvasPath) {
        try {
          const spansFullPath = `${repositoryPath}/${spansCanvasPath}`;
          const spansContent = await readFile(spansFullPath);
          if (spansContent && typeof spansContent === 'string') {
            spansCanvas = ConfigLoader.parseCanvas(spansContent);
          }
        } catch (spansError) {
          // Spans canvas loading is optional, don't fail the whole operation
          console.warn('[PrincipalView] Failed to load spans canvas:', spansError);
        }
      }

      // Ensure we always have a library with states (use default if none found)
      const finalLibrary: ComponentLibrary = library || DEFAULT_LIBRARY;

      setState(prev => ({
        ...prev,
        canvas,
        library: finalLibrary,
        libraryVersion: prev.libraryVersion + 1, // Increment when loading new library
        spansCanvas,
        loading: false,
        error: null,
        hasUnsavedChanges: false
      }));
    } catch (error) {
      console.error('[PrincipalView] Error during config load:', error);
      // Provide default library even on error to prevent undefined access
      setState(prev => ({
        ...prev,
        canvas: null,
        library: DEFAULT_LIBRARY,
        spansCanvas: null,
        loading: false,
        error: (error as Error).message
      }));
    }
  }, [canvasPath, spansCanvasPath]);

  // Toggle legend overlay
  const toggleLegend = useCallback(() => {
    setState(prev => ({ ...prev, showLegend: !prev.showLegend }));
  }, []);

  // Toggle grid lines
  const toggleGridLines = useCallback(() => {
    setState(prev => ({ ...prev, showGridLines: !prev.showGridLines }));
  }, []);

  // Toggle main view mode between canvas and sequence
  const toggleMainViewMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      mainViewMode: prev.mainViewMode === 'canvas' ? 'sequence' : 'canvas'
    }));
  }, []);

  // Copy current config path to clipboard
  const copyConfigPath = useCallback(() => {
    if (!canvasPath) return;
    navigator.clipboard.writeText(canvasPath).then(() => {
      setPathCopied(true);
      setTimeout(() => setPathCopied(false), 2000);
    });
  }, [canvasPath]);

  // Open search with Cmd+F / Ctrl+F
  const openSearch = useCallback(() => {
    setState(prev => ({ ...prev, isSearchOpen: true }));
    // Focus the input after state updates
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  // Close search
  const closeSearch = useCallback(() => {
    setState(prev => ({ ...prev, isSearchOpen: false, searchQuery: '' }));
    setCurrentSearchIndex(0);
  }, []);

  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    setCurrentSearchIndex(0);
  }, []);

  // Open color picker for a scope
  const openColorPicker = useCallback((scopeName: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setState(prev => ({
      ...prev,
      colorPickerScope: scopeName,
      colorPickerPosition: { x: rect.left, y: rect.bottom + 8 }
    }));
  }, []);

  // Close color picker
  const closeColorPicker = useCallback(() => {
    setState(prev => ({ ...prev, colorPickerScope: null, colorPickerPosition: null }));
  }, []);

  // Handle color change for a scope
  // DEPRECATED: Scope colors are now managed in .scopes.canvas files
  // const handleScopeColorChange = useCallback(async (scopeName: string, newColor: string) => {
  //   // This functionality has been removed as scopes are no longer in library.yaml
  // }, [actions]);

  // Compute search results (matching node IDs)
  const searchMatchedNodeIds = useMemo(() => {
    if (!state.isSearchOpen || !state.searchQuery.trim() || !state.canvas?.nodes) {
      return [];
    }

    const query = state.searchQuery.toLowerCase().trim();
    const matchedIds: string[] = [];

    for (const node of state.canvas.nodes) {
      // Search in node id
      if (node.id.toLowerCase().includes(query)) {
        matchedIds.push(node.id);
        continue;
      }

      // Search in node text (for text nodes)
      if ('text' in node && typeof node.text === 'string' && node.text.toLowerCase().includes(query)) {
        matchedIds.push(node.id);
        continue;
      }

      // Search in pv extension fields (only for standard canvas nodes)
      if (isStandardCanvasNode(node)) {
        const pv = node.pv;
        if (pv) {
          // Search in pv.name
          if (pv.name && pv.name.toLowerCase().includes(query)) {
            matchedIds.push(node.id);
            continue;
          }

          // Search in pv.description
          if (pv.description && pv.description.toLowerCase().includes(query)) {
            matchedIds.push(node.id);
            continue;
          }

          // Search in pv.eventRef
          if (pv.eventRef && pv.eventRef.toLowerCase().includes(query)) {
            matchedIds.push(node.id);
            continue;
          }

          // Search in pv.event.name
          if (pv.event?.name && pv.event.name.toLowerCase().includes(query)) {
            matchedIds.push(node.id);
            continue;
          }

          // Search in pv.nodeType
          if (pv.nodeType && pv.nodeType.toLowerCase().includes(query)) {
            matchedIds.push(node.id);
            continue;
          }
        }
      }
    }

    return matchedIds;
  }, [state.isSearchOpen, state.searchQuery, state.canvas?.nodes]);

  // Navigate to next search result
  const goToNextSearchResult = useCallback(() => {
    if (searchMatchedNodeIds.length === 0) return;
    setCurrentSearchIndex(prev => (prev + 1) % searchMatchedNodeIds.length);
  }, [searchMatchedNodeIds.length]);

  // Navigate to previous search result
  const goToPrevSearchResult = useCallback(() => {
    if (searchMatchedNodeIds.length === 0) return;
    setCurrentSearchIndex(prev => (prev - 1 + searchMatchedNodeIds.length) % searchMatchedNodeIds.length);
  }, [searchMatchedNodeIds.length]);

  // Keyboard shortcut handler for Cmd+F / Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+F / Ctrl+F to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        openSearch();
      }

      // Escape to close search
      if (e.key === 'Escape' && state.isSearchOpen) {
        e.preventDefault();
        closeSearch();
      }

      // Enter to go to next result, Shift+Enter for previous
      if (e.key === 'Enter' && state.isSearchOpen && searchMatchedNodeIds.length > 0) {
        e.preventDefault();
        if (e.shiftKey) {
          goToPrevSearchResult();
        } else {
          goToNextSearchResult();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch, closeSearch, state.isSearchOpen, searchMatchedNodeIds.length, goToNextSearchResult, goToPrevSearchResult]);

  // Handle copy of selected nodes (Cmd+C / Ctrl+C)
  const handleCopyNodes = useCallback((selectedNodeIds: string[]) => {
    if (!state.canvas || selectedNodeIds.length === 0) return;

    const selectedSet = new Set(selectedNodeIds);

    // Build node context for each selected node
    const nodes = selectedNodeIds.map(nodeId => {
      const node = state.canvas!.nodes?.find(n => n.id === nodeId);
      if (!node) return null;

      const pv = isStandardCanvasNode(node) ? node.pv : undefined;

      // Get label: prefer pv.name, fall back to text content for text nodes
      let label = pv?.name || nodeId;
      if ('text' in node && node.text && !pv?.name) {
        // Extract first line of text content as label
        label = node.text.split('\n')[0].trim() || nodeId;
      }

      return {
        id: node.id,
        type: node.type,
        label,
        ...(pv?.nodeType && { nodeType: pv.nodeType }),
        ...(pv?.description && { description: pv.description }),
        ...(pv?.icon && { icon: pv.icon }),
        ...(pv?.eventRef && { eventRef: pv.eventRef }),
        ...(pv?.event?.name && { eventName: pv.event.name }),
        ...(pv?.sources && pv.sources.length > 0 && { sources: pv.sources }),
      };
    }).filter(Boolean);

    // Find edges that connect selected nodes to each other
    const edges = (state.canvas!.edges || [])
      .filter(edge => selectedSet.has(edge.fromNode) && selectedSet.has(edge.toNode))
      .map(edge => ({
        from: edge.fromNode,
        to: edge.toNode,
        ...(edge.pv?.edgeType && { type: edge.pv.edgeType }),
      }));

    // Build the full context object
    const copyContext = {
      canvas: {
        path: canvasPath || 'unknown',
        name: canvasName || state.canvas!.pv?.name || 'Untitled',
      },
      nodes,
      ...(edges.length > 0 && { edges }),
    };

    // Copy to clipboard as formatted JSON
    navigator.clipboard.writeText(JSON.stringify(copyContext, null, 2)).then(() => {
      // Show toast feedback
      setCopiedNodesCount(nodes.length);
      setTimeout(() => setCopiedNodesCount(null), 2000);
    }).catch(err => {
      console.error('[CanvasEditorPanel] Failed to copy nodes:', err);
    });
  }, [state.canvas, canvasPath, canvasName]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setState(prev => {
      if (prev.isEditMode && prev.hasUnsavedChanges) {
        // Exiting edit mode with unsaved changes - reload to discard
        loadConfiguration();
        return { ...prev, isEditMode: false, hasUnsavedChanges: false };
      }
      return { ...prev, isEditMode: !prev.isEditMode };
    });
  }, [loadConfiguration]);

  // Discard changes and reload
  const discardChanges = useCallback(() => {
    loadConfiguration();
    setState(prev => ({ ...prev, hasUnsavedChanges: false }));
  }, [loadConfiguration]);


  // Handle scenario hover - highlight nodes that have events matching the scenario
  const handleScenarioHover = useCallback((eventNames: string[] | null) => {
    setState(prev => ({
      ...prev,
      hoveredScenarioEventNames: eventNames,
    }));
    // Trigger fit-to-nodes when hovering (not when leaving)
    if (eventNames && eventNames.length > 0) {
      setFitCounter(c => c + 1); // Force new array reference
      setShouldFitToNodes(true);
    }
  }, []);

  // Handle scenario click - show list view and fit to all scenario nodes
  const handleScenarioClick = useCallback((scenarioId: string, scenario: WorkflowScenario) => {
    setState(prev => ({
      ...prev,
      selectedScenarioId: scenarioId,
      selectedScenario: scenario,
      currentEventIndex: 0,
      highlightedNodeId: null,
      focusedNodeId: null, // null so fitViewToNodeIds uses activeNodeIds (all scenario nodes)
    }));
    setIsCarouselExpanded(true); // Show list view on single click
    setFitCounter(c => c + 1); // Force new array reference
    setShouldFitToNodes(true);
  }, []);

  // Handle scenario double-click - show compact carousel view
  const handleScenarioDoubleClick = useCallback((scenarioId: string, scenario: WorkflowScenario) => {
    setState(prev => {
      // Get the first event name from the scenario and map it to a node
      const eventNames = scenario.template?.events ? Object.keys(scenario.template.events) : [];
      const firstEventName = eventNames[0];
      const firstNodeId = firstEventName
        ? mapEventToNodeId({ name: firstEventName, time: 0, attributes: {} }, prev.canvas)
        : null;

      return {
        ...prev,
        selectedScenarioId: scenarioId,
        selectedScenario: scenario,
        currentEventIndex: 0,
        highlightedNodeId: null,
        focusedNodeId: firstNodeId,
      };
    });
    setIsCarouselExpanded(false); // Show carousel view on double click
    setFitCounter(c => c + 1);
    setShouldFitToNodes(true);
  }, []);

  // Handle narrative event click from EventCarousel - focus on corresponding canvas node (without highlighting)
  const handleNarrativeEventClick = useCallback((event: { name: string; timestamp?: string | number; attributes?: OtelAttributes }, eventIndex: number) => {
    setState(prev => {
      const nodeId = mapEventToNodeId({ name: event.name, time: Number(event.timestamp) || 0, attributes: event.attributes }, prev.canvas);
      return {
        ...prev,
        focusedNodeId: nodeId,
        currentEventIndex: eventIndex,
      };
    });
    // Trigger fit to the focused node
    setFitCounter(c => c + 1); // Force new array reference
    setShouldFitToNodes(true);
  }, []);

  // Handle EventCarousel dismiss - clear selected scenario
  const handleEventCarouselDismiss = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedScenario: null,
      selectedScenarioId: null,
      currentEventIndex: 0,
      highlightedNodeId: null,
      focusedNodeId: null,
      mainViewMode: 'canvas', // Switch back to canvas view when scenario is dismissed
    }));
    setIsCarouselExpanded(false);
  }, []);

  // Save all pending changes
  const saveAllChanges = useCallback(async () => {
    if (!state.canvas || !canvasPath) return;

    // Get pending changes from GraphRenderer if available
    const pendingChanges = graphRef.current?.getPendingChanges();

    // If no pending changes from GraphRenderer but hasUnsavedChanges is true,
    // this means the canvas was updated directly (e.g., via auto-layout).
    // In that case, save state.canvas directly.
    const hasGraphChanges = pendingChanges?.hasChanges ?? false;
    if (!hasGraphChanges && !state.hasUnsavedChanges) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const ctx = contextRef.current;
      const acts = actionsRef.current;

      if (!acts.writeFile) {
        throw new Error('writeFile action not available');
      }

      const repositoryPath = (ctx as { repositoryPath?: string }).repositoryPath;
      if (!repositoryPath) {
        throw new Error('Repository path not available');
      }

      // Apply changes to canvas if there are pending changes from GraphRenderer,
      // otherwise use state.canvas directly (already contains auto-layout changes)
      const updatedCanvas = hasGraphChanges && pendingChanges
        ? applyChangesToCanvas(state.canvas, pendingChanges)
        : state.canvas;

      // Serialize to JSON
      const jsonContent = JSON.stringify(updatedCanvas, null, 2);

      // Write to file using canvasPath prop
      const fullPath = `${repositoryPath}/${canvasPath}`;
      await acts.writeFile(fullPath, jsonContent);

      // Skip the next file change event since we caused it
      skipNextFileChangeRef.current = true;

      // Update local state with the saved canvas (no reload needed)
      setState(prev => ({
        ...prev,
        canvas: updatedCanvas,
        isSaving: false,
        hasUnsavedChanges: false,
      }));

      // NOTE: We intentionally do NOT call resetEditState() here.
      // The visual state (node positions) is already correct - it reflects what the user edited.
      // Calling resetEditState() would reset visual state to xyflowNodesBase, which uses a
      // stale closure (the old canvas prop) because React state updates are async.
      // The pending changes in editStateRef will be overwritten by subsequent edits,
      // and hasUnsavedChanges is already cleared above.
    } catch (error) {
      console.error('[PrincipalView] Error saving changes:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: `Failed to save: ${(error as Error).message}`
      }));
    }
  }, [state.canvas, state.hasUnsavedChanges, canvasPath]);

  // Calculate active node IDs for scenario hover preview or search
  const activeNodeIds = useMemo(() => {
    if (!state.canvas) return null;

    // Search results take priority
    if (state.isSearchOpen && searchMatchedNodeIds.length > 0) {
      return searchMatchedNodeIds;
    }

    // Hovered scenario preview (find nodes with matching events)
    if (state.hoveredScenarioEventNames && state.hoveredScenarioEventNames.length > 0) {
      const activeIds = new Set<string>();

      // Find nodes that have eventRef or event.name matching hovered scenario events
      if (state.canvas.nodes) {
        for (const node of state.canvas.nodes) {
          const nodeEventName = getNodeEventName(node);
          if (nodeEventName && state.hoveredScenarioEventNames.includes(nodeEventName)) {
            activeIds.add(node.id);
          }
        }
      }

      return activeIds.size > 0 ? Array.from(activeIds) : null;
    }

    // Selected scenario - find nodes matching scenario events
    if (state.selectedScenario?.template?.events) {
      const scenarioEventNames = Object.keys(state.selectedScenario.template.events);
      const activeIds = new Set<string>();

      if (state.canvas.nodes) {
        for (const node of state.canvas.nodes) {
          const nodeEventName = getNodeEventName(node);
          if (nodeEventName && scenarioEventNames.includes(nodeEventName)) {
            activeIds.add(node.id);
          }
        }
      }

      return activeIds.size > 0 ? Array.from(activeIds) : null;
    }

    // Workflow provided but no scenario selected/hovered - find nodes matching ANY scenario event
    if (workflowTemplate?.scenarios && workflowTemplate.scenarios.length > 0) {
      // Collect all event names from all scenarios
      const allWorkflowEventNames = new Set<string>();
      for (const scenario of workflowTemplate.scenarios) {
        if (scenario.template?.events) {
          for (const eventName of Object.keys(scenario.template.events)) {
            allWorkflowEventNames.add(eventName);
          }
        }
      }

      if (allWorkflowEventNames.size > 0) {
        const activeIds = new Set<string>();

        if (state.canvas.nodes) {
          for (const node of state.canvas.nodes) {
            const nodeEventName = getNodeEventName(node);
            if (nodeEventName && allWorkflowEventNames.has(nodeEventName)) {
              activeIds.add(node.id);
            }
          }
        }

        return activeIds.size > 0 ? Array.from(activeIds) : null;
      }
    }

    return null;
  }, [state.canvas, state.hoveredScenarioEventNames, state.selectedScenario, workflowTemplate, state.isSearchOpen, searchMatchedNodeIds]);

  // Build a map from event names to node IDs for sequence edge mapping
  const eventNameToNodeId = useMemo(() => {
    const map = new Map<string, string>();
    if (!state.canvas?.nodes) return map;

    for (const node of state.canvas.nodes) {
      const eventName = getNodeEventName(node);
      if (eventName) {
        map.set(eventName, node.id);
      }
    }
    return map;
  }, [state.canvas?.nodes]);

  // Compute scenarioEdges for sequence numbering on edges when a scenario is selected
  const scenarioEdges = useMemo((): Array<{ fromSpan: string; toSpan: string; sequenceNumber: number }> | undefined => {
    if (!state.selectedScenario?.template?.events || !state.canvas?.nodes) return undefined;

    try {
      // Get event names from the scenario in order
      const eventNames = Object.keys(state.selectedScenario.template.events);
      if (eventNames.length < 2) return undefined;

      // Build edges from consecutive events, mapping event names to node IDs
      const edges: Array<{ fromSpan: string; toSpan: string; sequenceNumber: number }> = [];
      const seenEdges = new Set<string>();
      let sequenceNumber = 0;

      for (let i = 0; i < eventNames.length - 1; i++) {
        const fromEventName = eventNames[i];
        const toEventName = eventNames[i + 1];

        // Map event names to node IDs
        const fromNodeId = eventNameToNodeId.get(fromEventName);
        const toNodeId = eventNameToNodeId.get(toEventName);

        if (fromNodeId && toNodeId && fromNodeId !== toNodeId) {
          const edgeKey = `${fromNodeId}->${toNodeId}`;

          if (!seenEdges.has(edgeKey)) {
            seenEdges.add(edgeKey);
            sequenceNumber++;
            edges.push({
              fromSpan: fromNodeId,  // GraphRenderer expects these as node IDs
              toSpan: toNodeId,
              sequenceNumber,
            });
          }
        }
      }

      return edges.length > 0 ? edges : undefined;
    } catch (error) {
      console.warn('[CanvasEditorPanel] Failed to derive scenario edges:', error);
      return undefined;
    }
  }, [state.selectedScenario, state.canvas?.nodes, eventNameToNodeId]);

  // Compute fitViewToNodeIds - controls which nodes GraphRenderer fits to
  // IMPORTANT: We must keep returning activeNodeIds even after shouldFitToNodes resets,
  // otherwise GraphRenderer's default fitView effect triggers and fits to ALL nodes.
  // The fitCounter forces new array references when we want to trigger a new fit animation.
  const fitViewToNodeIds = useMemo(() => {
    // Priority 1: If a node is focused (from event navigation), include it plus adjacent scenario nodes
    if (state.focusedNodeId && state.selectedScenario) {
      const eventNames = Object.keys(state.selectedScenario.template.events || {});
      const currentIndex = state.currentEventIndex;
      const nodeIds: string[] = [state.focusedNodeId];

      // Add previous event's node if exists
      if (currentIndex > 0) {
        const prevEventName = eventNames[currentIndex - 1];
        if (prevEventName) {
          const prevNodeId = mapEventToNodeId({ name: prevEventName, time: 0, attributes: {} }, state.canvas);
          if (prevNodeId && !nodeIds.includes(prevNodeId)) {
            nodeIds.push(prevNodeId);
          }
        }
      }

      // Add next event's node if exists
      if (currentIndex < eventNames.length - 1) {
        const nextEventName = eventNames[currentIndex + 1];
        if (nextEventName) {
          const nextNodeId = mapEventToNodeId({ name: nextEventName, time: 0, attributes: {} }, state.canvas);
          if (nextNodeId && !nodeIds.includes(nextNodeId)) {
            nodeIds.push(nextNodeId);
          }
        }
      }

      return nodeIds;
    }
    // Priority 2: If we have active nodes (hover/selection) and no focused node, fit to them
    // This prevents the fit-to-all fallback when shouldFitToNodes resets
    if (activeNodeIds && activeNodeIds.length > 0) {
      return [...activeNodeIds]; // New array reference (fitCounter in deps forces this)
    }
    // Priority 3: Fit to all nodes only when explicitly requested
    if (shouldFitToNodes && state.canvas?.nodes && state.canvas.nodes.length > 0) {
      return state.canvas.nodes.map(n => n.id);
    }
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fitCounter intentionally forces new array reference for fit animations
  }, [shouldFitToNodes, activeNodeIds, state.canvas, state.focusedNodeId, state.selectedScenario, state.currentEventIndex, fitCounter]);

  // Clear shouldFitToNodes after the fit happens (one-shot behavior)
  useEffect(() => {
    if (shouldFitToNodes) {
      // Allow time for the fit animation to trigger, then reset (300ms animation duration)
      const timer = setTimeout(() => setShouldFitToNodes(false), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldFitToNodes]);

  // Track previous workflow state to detect transitions
  const prevWorkflowTemplateRef = useRef<typeof workflowTemplate>(workflowTemplate);

  // Clear scenario state when workflow changes, and trigger fit to workflow nodes
  useEffect(() => {
    const hadWorkflow = !!prevWorkflowTemplateRef.current;
    const hasWorkflow = !!workflowTemplate;
    const workflowChanged = prevWorkflowTemplateRef.current !== workflowTemplate;

    // Update ref for next comparison
    prevWorkflowTemplateRef.current = workflowTemplate;

    // If workflow state changed, clear scenario state
    if (hadWorkflow !== hasWorkflow) {
      setState(prev => ({
        ...prev,
        selectedScenarioId: null,
        selectedScenario: null,
        hoveredScenarioEventNames: null,
        highlightedNodeId: null,
        focusedNodeId: null,
        currentEventIndex: 0,
        mainViewMode: 'canvas', // Reset to canvas view when workflow changes
      }));
      setIsCarouselExpanded(false);
    }

    // Trigger fit to workflow nodes when workflow is provided or changes
    if (hasWorkflow && workflowChanged) {
      setFitCounter(c => c + 1);
      setShouldFitToNodes(true);
    }
  }, [workflowTemplate]);

  // Sync selectedScenarioIdProp to state when it changes
  useEffect(() => {
    if (selectedScenarioIdProp && workflowTemplate?.scenarios) {
      const scenario = workflowTemplate.scenarios.find(s => s.id === selectedScenarioIdProp);
      if (scenario && state.selectedScenarioId !== selectedScenarioIdProp) {
        setState(prev => ({
          ...prev,
          selectedScenarioId: selectedScenarioIdProp,
          selectedScenario: scenario,
          currentEventIndex: 0,
          hoveredScenarioEventNames: null,
          highlightedNodeId: null,
          focusedNodeId: null,
        }));
        setIsCarouselExpanded(true); // Show expanded list view
        setFitCounter(c => c + 1);
        setShouldFitToNodes(true);
      }
    }
  }, [selectedScenarioIdProp, workflowTemplate, state.selectedScenarioId]);

  // Extract trace events from selectedTrace for template interpolation
  const traceEvents = useMemo((): OtelEvent[] => {
    if (!selectedTrace) return [];

    const spans = getSpansFromTrace(selectedTrace);
    const events: OtelEvent[] = [];

    for (const span of spans) {
      // Add span-level event (the span itself)
      events.push({
        name: span.name,
        timestamp: Math.floor(Number(span.startTimeUnixNano) / 1_000_000),
        spanId: span.spanId,
        traceId: selectedTrace.traceId,
        attributes: span.attributes?.reduce((acc: OtelAttributes, attr: { key: string; value?: { stringValue?: string; intValue?: number; boolValue?: boolean } }) => {
          if (attr.value?.stringValue !== undefined) acc[attr.key] = attr.value.stringValue;
          else if (attr.value?.intValue !== undefined) acc[attr.key] = attr.value.intValue;
          else if (attr.value?.boolValue !== undefined) acc[attr.key] = attr.value.boolValue;
          return acc;
        }, {} as OtelAttributes),
      });

      // Add span events
      for (const evt of span.events || []) {
        events.push({
          name: evt.name,
          timestamp: Math.floor(Number(evt.timeUnixNano) / 1_000_000),
          spanId: span.spanId,
          traceId: selectedTrace.traceId,
          attributes: evt.attributes?.reduce((acc: OtelAttributes, attr: { key: string; value?: { stringValue?: string; intValue?: number; boolValue?: boolean } }) => {
            if (attr.value?.stringValue !== undefined) acc[attr.key] = attr.value.stringValue;
            else if (attr.value?.intValue !== undefined) acc[attr.key] = attr.value.intValue;
            else if (attr.value?.boolValue !== undefined) acc[attr.key] = attr.value.boolValue;
            return acc;
          }, {} as OtelAttributes),
        });
      }
    }

    return events;
  }, [selectedTrace]);

  // Load configuration when canvasPath prop changes
  useEffect(() => {
    loadConfiguration();
  }, [canvasPath, loadConfiguration]);

  // Update timestamp ref when FileInfo prop changes
  useEffect(() => {
    if (canvasFileInfo?.lastModified) {
      canvasFileTimestampRef.current = canvasFileInfo.lastModified.getTime();
    }
  }, [canvasFileInfo]);

  // Auto-reload on file changes via workspace:changed events
  // Note: This provides immediate feedback even before fileTree SHA updates
  useEffect(() => {
    if (!events || !canvasPath) return;

    const handleWorkspaceChange = () => {
      // Skip if we just saved (we caused this file change)
      if (skipNextFileChangeRef.current) {
        skipNextFileChangeRef.current = false;
        return;
      }

      // Get current file tree to check timestamps
      const ctx = contextRef.current;
      const fileTreeSlice = ctx.fileTree;
      if (!fileTreeSlice) return;

      const fileTreeData = fileTreeSlice.data;
      if (!fileTreeData?.allFiles) return;

      // Check canvas file timestamp
      const canvasFile = fileTreeData.allFiles.find(f =>
        f.path === canvasPath || f.relativePath === canvasPath
      );

      if (canvasFile?.lastModified) {
        const currentTimestamp = canvasFile.lastModified.getTime();

        if (canvasFileTimestampRef.current && currentTimestamp !== canvasFileTimestampRef.current) {
          loadConfiguration();
          canvasFileTimestampRef.current = currentTimestamp;
        }
      }
    };

    events.on('workspace:changed', handleWorkspaceChange);
    return () => {
      events.off('workspace:changed', handleWorkspaceChange);
    };
  }, [events, canvasPath, loadConfiguration]);

  // Watch for fileTree SHA changes to detect external file modifications
  // This complements workspace:changed to handle race conditions
  // Using fileTreeSha allows this effect to trigger on changes while keeping context as a ref
  useEffect(() => {
    if (!canvasPath || !fileTreeSha) return;

    // Skip if we just saved
    if (skipNextFileChangeRef.current) {
      return;
    }

    // Get fresh fileTree data using ref (always up-to-date)
    const ctx = contextRef.current;
    const slice = ctx.fileTree;
    const data = slice?.data;
    if (!data?.allFiles) return;

    // Find canvas file and check timestamp
    const canvasFile = data.allFiles.find(f =>
      f.path === canvasPath || f.relativePath === canvasPath
    );

    if (canvasFile?.lastModified) {
      const currentTimestamp = canvasFile.lastModified.getTime();

      if (canvasFileTimestampRef.current && currentTimestamp !== canvasFileTimestampRef.current) {
        loadConfiguration();
        canvasFileTimestampRef.current = currentTimestamp;
      }
    }
  }, [fileTreeSha, canvasPath, loadConfiguration]);

  // Subscribe to data refresh events
  useEffect(() => {
    const unsubscribe = eventsRef.current.on('data:refresh', () => {
      loadConfiguration();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for programmatic control events (selectScenario, selectEvent)
  useEffect(() => {
    if (!events) return;

    const handleCustomEvent = (event: { type: string; payload?: unknown }) => {
      const payload = event.payload as {
        action?: string;
        scenarioId?: string;
        mode?: 'list' | 'carousel';
        eventIndex?: number;
        eventName?: string;
      } | undefined;

      if (payload?.action === 'selectScenario' && payload.scenarioId !== undefined) {
        // Programmatically select a scenario from the workflow
        if (!workflowTemplate?.scenarios) {
          console.warn('[CanvasEditorPanel] No workflow template or scenarios available');
          return;
        }

        const scenario = workflowTemplate.scenarios.find(s => s.id === payload.scenarioId);
        if (!scenario) {
          console.warn('[CanvasEditorPanel] Scenario not found:', payload.scenarioId);
          return;
        }

        // Use the mode to determine whether to show list view or carousel view
        if (payload.mode === 'carousel') {
          handleScenarioDoubleClick(payload.scenarioId, scenario);
        } else {
          // Default to list view (expanded mode)
          handleScenarioClick(payload.scenarioId, scenario);
        }
      } else if (payload?.action === 'selectEvent') {
        // Programmatically select an event within the current scenario
        if (!state.selectedScenario?.template?.events) {
          console.warn('[CanvasEditorPanel] No scenario selected or no events available');
          return;
        }

        const eventNames = Object.keys(state.selectedScenario.template.events);
        let targetIndex: number;

        if (payload.eventIndex !== undefined) {
          // Select by index
          targetIndex = payload.eventIndex;
        } else if (payload.eventName !== undefined) {
          // Select by event name
          targetIndex = eventNames.indexOf(payload.eventName);
          if (targetIndex === -1) {
            console.warn('[CanvasEditorPanel] Event not found:', payload.eventName);
            return;
          }
        } else {
          console.warn('[CanvasEditorPanel] selectEvent requires eventIndex or eventName');
          return;
        }

        // Validate index bounds
        if (targetIndex < 0 || targetIndex >= eventNames.length) {
          console.warn('[CanvasEditorPanel] Event index out of bounds:', targetIndex);
          return;
        }

        const eventName = eventNames[targetIndex];

        // Trigger the same behavior as clicking an event in the carousel
        handleNarrativeEventClick({ name: eventName, timestamp: 0, attributes: {} }, targetIndex);
      }
    };

    events.on('custom', handleCustomEvent);
    return () => {
      events.off('custom', handleCustomEvent);
    };
  }, [events, workflowTemplate, state.selectedScenario, handleScenarioClick, handleScenarioDoubleClick, handleNarrativeEventClick]);

  // Determine what content to show in the canvas area
  const canvasContent = state.loading ? (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      color: theme.colors.textMuted,
      fontFamily: theme.fonts.body
    }}>
      <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ marginLeft: theme.space[2] }}>Loading configuration...</span>
    </div>
  ) : state.error ? (
    <ErrorStateContent theme={theme} error={state.error} onRetry={() => loadConfiguration()} />
  ) : !state.canvas ? (
    <EmptyStateContent theme={theme} />
  ) : null;

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: theme.fonts.body
    }}>
      {/* Header */}
      <div style={{
        height: 39,
        flexShrink: 0,
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background,
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'content-box',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', gap: theme.space[3], minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[2], minWidth: 0, flex: 1 }}>
            <h2 style={{
            margin: 0,
            fontSize: theme.fontSizes[3],
            fontWeight: theme.fontWeights.medium,
            color: theme.colors.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}>
            {canvasName || 'Untitled'}{workflowTemplate?.name && <span style={{ color: theme.colors.textMuted }}> / {workflowTemplate.name}</span>}
          </h2>

          {/* Copy path button */}
          <button
            onClick={copyConfigPath}
            title={pathCopied ? 'Copied!' : 'Copy path to clipboard'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: theme.space[1],
              backgroundColor: 'transparent',
              color: pathCopied ? (theme.colors.success || '#22c55e') : theme.colors.textMuted,
              border: 'none',
              borderRadius: theme.radii[0],
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {pathCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: theme.space[2], flexShrink: 0 }}>
          </div>
        </div>

        {/* Refresh Button - only shown when editing is available */}
        {canEdit && (
          <button
            onClick={() => loadConfiguration()}
            disabled={state.hasUnsavedChanges}
            title={state.hasUnsavedChanges ? 'Save or discard changes before refreshing' : 'Refresh'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 39,
              padding: 0,
              backgroundColor: 'transparent',
              color: theme.colors.textMuted,
              border: 'none',
              borderLeft: `1px solid ${theme.colors.border}`,
              cursor: state.hasUnsavedChanges ? 'not-allowed' : 'pointer',
              opacity: state.hasUnsavedChanges ? 0.5 : 1,
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <RefreshCw size={18} />
          </button>
        )}

        {/* Sequence Diagram Toggle Button - only shown when scenario is selected */}
        {state.selectedScenario && (
          <button
            onClick={toggleMainViewMode}
            title={state.mainViewMode === 'sequence' ? 'Show Canvas Graph' : 'Show Sequence Diagram'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 39,
              padding: 0,
              backgroundColor: state.mainViewMode === 'sequence' ? theme.colors.primary : 'transparent',
              color: state.mainViewMode === 'sequence' ? 'white' : theme.colors.textMuted,
              border: 'none',
              borderLeft: `1px solid ${theme.colors.border}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <Layers size={18} />
          </button>
        )}

        {/* Grid Lines Toggle Button */}
        <button
          onClick={toggleGridLines}
          title={state.showGridLines ? 'Hide Grid Lines' : 'Show Grid Lines'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 39,
            padding: 0,
            backgroundColor: state.showGridLines ? theme.colors.primary : 'transparent',
            color: state.showGridLines ? 'white' : theme.colors.textMuted,
            border: 'none',
            borderLeft: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <Grid3X3 size={18} />
        </button>

        {/* Legend Button - flush right, full height */}
        <button
          onClick={toggleLegend}
          title="Edge Legend"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 39,
            padding: 0,
            backgroundColor: state.showLegend ? theme.colors.primary : 'transparent',
            color: state.showLegend ? 'white' : theme.colors.textMuted,
            border: 'none',
            borderLeft: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <Info size={18} />
        </button>

        {/* Edit Mode Toggle - only shown when writeFile action is available */}
        {canEdit && (
          <button
            onClick={toggleEditMode}
            disabled={state.isSaving}
            title={state.isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 39,
              padding: 0,
              backgroundColor: state.isEditMode ? theme.colors.primary : 'transparent',
              color: state.isEditMode ? 'white' : theme.colors.textMuted,
              border: 'none',
              borderLeft: `1px solid ${theme.colors.border}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <Pencil size={18} />
          </button>
        )}

        {/* Close Panel Button - only shown when onClosePanel is provided */}
        {onClosePanel && (
          <button
            onClick={onClosePanel}
            title="Close panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 39,
              padding: 0,
              backgroundColor: 'transparent',
              color: theme.colors.textMuted,
              border: 'none',
              borderLeft: `1px solid ${theme.colors.border}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main content area - flex container to allow children to use flex: 1 */}
      <div style={{ flex: '1 1 0%', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AnimatedResizableLayout
          theme={theme}
          collapsed={!workflowTemplate}
          showCollapseButton={false}
          leftPanel={
            workflowTemplate ? (
              <div style={{ height: '100%', overflow: 'hidden', background: theme.colors.background }}>
                <ScenariosList
                  workflowTemplate={workflowTemplate}
                  onScenarioHover={handleScenarioHover}
                  onScenarioClick={handleScenarioClick}
                  onScenarioDoubleClick={handleScenarioDoubleClick}
                  selectedScenarioId={state.selectedScenarioId ?? undefined}
                  traceMatchInfo={traceMatchInfo}
                />
              </div>
            ) : (
              <div />
            )
          }
          rightPanel={
            <div ref={containerRefCallback} style={{ height: '100%', width: '100%', background: theme.colors.background, display: 'flex', flexDirection: 'column' }}>
              {/* Canvas area - shrinks when carousel is visible */}
              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                {/* Show loading/error/empty states, or GraphRenderer/SequenceDiagram when ready */}
                {canvasContent ? (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {canvasContent}
                  </div>
                ) : (state.canvas && !containerDimensions) ? (
                  // Canvas loaded but waiting for container dimensions (happens when mounted hidden)
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader className="animate-spin" size={24} style={{ opacity: 0.5 }} />
                  </div>
                ) : (state.canvas && containerDimensions?.width && containerDimensions?.height) ? (
                  state.mainViewMode === 'sequence' && state.selectedScenario ? (
                    // Render sequence diagram in main canvas area
                    <WorkflowSequenceDiagram
                      scenario={state.selectedScenario}
                      canvas={state.canvas}
                      height="100%"
                      layoutOptions={{
                        laneWidth: 220,
                        laneGap: 60,
                        eventSpacing: 100,
                        namespaceStrategy: 'first',
                      }}
                      showControls
                      selectedEventIndex={state.currentEventIndex}
                      onEventIndexChange={(eventIndex) => {
                        // Update current event index to sync with EventCarousel
                        setState(prev => ({ ...prev, currentEventIndex: eventIndex }));
                      }}
                    />
                  ) : (
                    // Render canvas graph
                    <GraphRenderer
                      ref={graphRef}
                      canvas={state.canvas}
                      library={state.library}
                      spansCanvas={state.spansCanvas ?? undefined}
                      workflowSpanPattern={workflowSpanPattern ?? undefined}
                      width="100%"
                      height="100%"
                      editable={state.isEditMode}
                      onPendingChangesChange={(hasChanges) => {
                        setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
                      }}
                      onCopy={handleCopyNodes}
                      showBackground={state.showGridLines}
                      backgroundVariant="lines"
                      showControls={true}
                      highlightedNodeId={state.highlightedNodeId}
                      activeNodeIds={activeNodeIds}
                      fitViewToNodeIds={fitViewToNodeIds}
                      fitViewPadding={0.15}
                      containerWidth={containerDimensions.width}
                      containerHeight={containerDimensions.height}
                      scenarioEdges={scenarioEdges}
                    />
                  )
                ) : null}

                {/* Save/Discard Overlay - top right corner */}
                {state.isEditMode && state.hasUnsavedChanges && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    height: 40,
                    display: 'flex',
                    alignItems: 'stretch',
                    backgroundColor: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 0,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 40,
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: theme.space[3],
                      fontSize: theme.fontSizes[1],
                      color: theme.colors.warning || '#f59e0b',
                      fontStyle: 'italic',
                      fontWeight: theme.fontWeights.medium,
                    }}>
                      Unsaved changes
                    </div>

                    <button
                      onClick={saveAllChanges}
                      disabled={state.isSaving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: theme.space[1],
                        padding: `0 ${theme.space[3]}`,
                        fontSize: theme.fontSizes[1],
                        fontFamily: theme.fonts.body,
                        color: 'white',
                        backgroundColor: theme.colors.primary,
                        border: 'none',
                        borderRadius: 0,
                        cursor: state.isSaving ? 'wait' : 'pointer',
                        opacity: state.isSaving ? 0.7 : 1,
                        transition: 'all 0.2s',
                        minWidth: 80,
                      }}
                    >
                      {state.isSaving ? (
                        <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Save size={14} />
                      )}
                      <span>Save</span>
                    </button>

                    <button
                      onClick={discardChanges}
                      disabled={state.isSaving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: theme.space[1],
                        padding: `0 ${theme.space[3]}`,
                        fontSize: theme.fontSizes[1],
                        fontFamily: theme.fonts.body,
                        color: theme.colors.text,
                        backgroundColor: theme.colors.backgroundSecondary,
                        border: 'none',
                        borderLeft: `1px solid ${theme.colors.border}`,
                        borderRadius: 0,
                        cursor: state.isSaving ? 'wait' : 'pointer',
                        opacity: state.isSaving ? 0.7 : 1,
                        transition: 'all 0.2s',
                        minWidth: 80,
                      }}
                    >
                      <X size={14} />
                      <span>Discard</span>
                    </button>
                  </div>
                )}

                {/* Legend Bar */}
                {state.showLegend && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    minHeight: 48,
                    maxHeight: 96,
                    backgroundColor: theme.colors.background,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    padding: `${theme.space[3]}px ${theme.space[4]}px`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${theme.space[4]}px`,
                    overflowY: 'auto',
                    flexWrap: 'wrap',
                    zIndex: 50,
                    boxSizing: 'border-box',
                  }}>
                    <span style={{
                      fontSize: theme.fontSizes[1],
                      fontWeight: theme.fontWeights.medium,
                      color: theme.colors.textMuted,
                      flexShrink: 0,
                    }}>
                      Edges:
                    </span>

                    {state.canvas?.edgeTypes && Object.keys(state.canvas.edgeTypes).length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: `${theme.space[4]}px`, flexWrap: 'wrap' }}>
                        {Object.entries(state.canvas.edgeTypes).map(([typeName, edgeType]) => (
                          <div
                            key={typeName}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: `${theme.space[2]}px`,
                            }}
                          >
                            <svg width="40" height="12" style={{ flexShrink: 0 }}>
                              <defs>
                                <marker
                                  id={`legend-arrow-${typeName}`}
                                  markerWidth="8"
                                  markerHeight="6"
                                  refX="7"
                                  refY="3"
                                  orient="auto"
                                >
                                  <polygon
                                    points="0 0, 8 3, 0 6"
                                    fill={edgeType.color || '#64748b'}
                                  />
                                </marker>
                              </defs>
                              <line
                                x1="2"
                                y1="6"
                                x2="32"
                                y2="6"
                                stroke={edgeType.color || '#64748b'}
                                strokeWidth={Math.min(edgeType.width || 2, 3)}
                                strokeDasharray={
                                  edgeType.style === 'dashed' ? '4,2' :
                                  edgeType.style === 'dotted' ? '2,2' : undefined
                                }
                                markerEnd={edgeType.directed ? `url(#legend-arrow-${typeName})` : undefined}
                              />
                            </svg>
                            <span style={{
                              fontSize: theme.fontSizes[1],
                              color: theme.colors.text,
                              textTransform: 'capitalize',
                              whiteSpace: 'nowrap',
                            }}>
                              {typeName.replace(/-/g, ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{
                        fontSize: theme.fontSizes[1],
                        color: theme.colors.textMuted,
                        fontStyle: 'italic',
                      }}>
                        No edge types defined
                      </span>
                    )}

                    {/* DEPRECATED: Scopes Section - scopes are now managed in .scopes.canvas files */}
                    {/* Scopes color editing has been removed as scopes are no longer in library.yaml */}
                  </div>
                )}

                {/* DEPRECATED: Color Picker Popover - removed as scopes are no longer in library.yaml */}

                {/* Search Bar - top center */}
                {state.isSearchOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.space[2],
                    padding: `${theme.space[2]} ${theme.space[3]}`,
                    backgroundColor: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radii[2],
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 60,
                  }}>
                    <Search size={16} style={{ color: theme.colors.textMuted, flexShrink: 0 }} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={state.searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search nodes..."
                      style={{
                        width: 200,
                        padding: `${theme.space[1]} ${theme.space[2]}`,
                        fontSize: theme.fontSizes[1],
                        fontFamily: theme.fonts.body,
                        color: theme.colors.text,
                        backgroundColor: theme.colors.backgroundSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.radii[1],
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = theme.colors.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.colors.border;
                      }}
                    />
                    {/* Result count and navigation */}
                    {state.searchQuery.trim() && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.space[1],
                      }}>
                        <span style={{
                          fontSize: theme.fontSizes[0],
                          color: searchMatchedNodeIds.length > 0 ? theme.colors.textMuted : (theme.colors.error || '#ef4444'),
                          whiteSpace: 'nowrap',
                          minWidth: 50,
                          textAlign: 'center',
                        }}>
                          {searchMatchedNodeIds.length > 0
                            ? `${currentSearchIndex + 1}/${searchMatchedNodeIds.length}`
                            : 'No results'
                          }
                        </span>
                        {searchMatchedNodeIds.length > 1 && (
                          <>
                            <button
                              onClick={goToPrevSearchResult}
                              title="Previous result (Shift+Enter)"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                padding: 0,
                                backgroundColor: 'transparent',
                                color: theme.colors.textMuted,
                                border: 'none',
                                borderRadius: theme.radii[0],
                                cursor: 'pointer',
                              }}
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              onClick={goToNextSearchResult}
                              title="Next result (Enter)"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                padding: 0,
                                backgroundColor: 'transparent',
                                color: theme.colors.textMuted,
                                border: 'none',
                                borderRadius: theme.radii[0],
                                cursor: 'pointer',
                              }}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {/* Close button */}
                    <button
                      onClick={closeSearch}
                      title="Close search (Escape)"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        padding: 0,
                        backgroundColor: 'transparent',
                        color: theme.colors.textMuted,
                        border: 'none',
                        borderRadius: theme.radii[0],
                        cursor: 'pointer',
                        marginLeft: theme.space[1],
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Copy nodes toast - bottom center */}
                {copiedNodesCount !== null && (
                  <div style={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.space[2],
                    padding: `${theme.space[2]} ${theme.space[3]}`,
                    backgroundColor: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radii[1],
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 50,
                    animation: 'fadeIn 0.15s ease-out',
                  }}>
                    <Check size={14} style={{ color: theme.colors.success || '#22c55e' }} />
                    <span style={{
                      fontSize: theme.fontSizes[1],
                      color: theme.colors.text,
                      whiteSpace: 'nowrap',
                    }}>
                      Copied {copiedNodesCount} node{copiedNodesCount !== 1 ? 's' : ''} to clipboard
                    </span>
                  </div>
                )}
              </div>

              {/* Event Carousel - shown when scenario is selected */}
              {state.selectedScenario && (
                  <EventCarousel
                  scenario={state.selectedScenario}
                  currentEventIndex={state.currentEventIndex}
                  onEventIndexChange={(index) => setState(prev => ({ ...prev, currentEventIndex: index }))}
                  onEventClick={handleNarrativeEventClick}
                  onDismiss={handleEventCarouselDismiss}
                  isExpanded={isCarouselExpanded}
                  onExpandToggle={() => setIsCarouselExpanded(prev => !prev)}
                  canvas={state.canvas}
                  sources={(() => {
                    // Get sources for the current event
                    const eventNames = Object.keys(state.selectedScenario?.template.events || {});
                    const currentEventName = eventNames[state.currentEventIndex];
                    if (!currentEventName || !state.canvas?.nodes) return [];

                    const sources: string[] = [];
                    state.canvas.nodes.forEach(node => {
                      if (!isStandardCanvasNode(node)) return;
                      const nodePv = node.pv as PVNodeExtension | undefined;
                      const nodeEventName = nodePv?.eventRef || nodePv?.event?.name;
                      if (nodeEventName === currentEventName && nodePv?.sources) {
                        const nodeSources = nodePv.sources as string[];
                        nodeSources.forEach(src => {
                          if (typeof src === 'string' && !sources.includes(src)) {
                            sources.push(src);
                          }
                        });
                      }
                    });
                    return sources;
                  })()}
                  getSourcesForEvent={(eventName: string) => {
                    if (!state.canvas?.nodes) return [];
                    const sources: string[] = [];
                    state.canvas.nodes.forEach(node => {
                      if (!isStandardCanvasNode(node)) return;
                      const nodePv = node.pv as PVNodeExtension | undefined;
                      const nodeEventName = nodePv?.eventRef || nodePv?.event?.name;
                      if (nodeEventName === eventName && nodePv?.sources) {
                        const nodeSources = nodePv.sources as string[];
                        nodeSources.forEach(src => {
                          if (typeof src === 'string' && !sources.includes(src)) {
                            sources.push(src);
                          }
                        });
                      }
                    });
                    return sources;
                  }}
                      traceEvents={traceEvents}
                    />
                )}
            </div>
          }
        />
      </div>
    </div>
  );
};

/**
 * Convert React Flow handle ID back to canvas side format.
 * Source handles have '-out' suffix (e.g., 'right-out' -> 'right')
 * Target handles are already in side format (e.g., 'left' -> 'left')
 */
function handleToCanvasSide(handle?: string): 'top' | 'right' | 'bottom' | 'left' | undefined {
  if (!handle) return undefined;
  const side = handle.replace(/-out$/, '');
  if (side === 'top' || side === 'right' || side === 'bottom' || side === 'left') {
    return side;
  }
  return undefined;
}

/**
 * Apply pending changes from GraphRenderer to the canvas
 */
function applyChangesToCanvas(
  canvas: ExtendedCanvas,
  changes: PendingChanges
): ExtendedCanvas {
  const updatedCanvas: ExtendedCanvas = JSON.parse(JSON.stringify(canvas));

  // Apply position changes
  for (const { nodeId, position } of changes.positionChanges) {
    const node = updatedCanvas.nodes?.find(n => n.id === nodeId);
    if (node) {
      node.x = Math.round(position.x);
      node.y = Math.round(position.y);
    }
  }

  // Apply dimension changes
  for (const { nodeId, dimensions } of changes.dimensionChanges) {
    const node = updatedCanvas.nodes?.find(n => n.id === nodeId);
    if (node) {
      node.width = dimensions.width;
      node.height = dimensions.height;
    }
  }

  // Apply node updates
  for (const { nodeId, updates } of changes.nodeUpdates) {
    const node = updatedCanvas.nodes?.find(n => n.id === nodeId);
    if (node) {
      // Handle type/id rename
      if (updates.type && updates.type !== nodeId) {
        node.id = updates.type;
        // Update edge references
        if (updatedCanvas.edges) {
          for (const edge of updatedCanvas.edges) {
            if (edge.fromNode === nodeId) edge.fromNode = updates.type;
            if (edge.toNode === nodeId) edge.toNode = updates.type;
          }
        }
      }

      // Handle data updates
      if (updates.data) {
        if (updates.data.icon && isStandardCanvasNode(node) && node.pv) {
          node.pv.icon = updates.data.icon as string;
        }
        if (updates.data.label !== undefined && 'text' in node) {
          (node as { text?: string }).text = updates.data.label as string;
        }
      }
    }
  }

  // Apply node deletions
  for (const nodeId of changes.deletedNodeIds) {
    if (updatedCanvas.nodes) {
      updatedCanvas.nodes = updatedCanvas.nodes.filter(n => n.id !== nodeId);
    }
    if (updatedCanvas.edges) {
      updatedCanvas.edges = updatedCanvas.edges.filter(
        e => e.fromNode !== nodeId && e.toNode !== nodeId
      );
    }
  }

  // Apply edge deletions FIRST (before creations, so reconnected edges work correctly)
  // Match by from/to/type since id is not available in pending changes
  for (const { from, to, type } of changes.deletedEdges) {
    if (updatedCanvas.edges) {
      updatedCanvas.edges = updatedCanvas.edges.filter(
        e => !(e.fromNode === from && e.toNode === to && e.pv?.edgeType === type)
      );
    }
  }

  // Apply edge creations AFTER deletions
  for (const { from, to, type, sourceHandle, targetHandle } of changes.createdEdges) {
    if (!updatedCanvas.edges) {
      updatedCanvas.edges = [];
    }
    // Generate a unique ID for the new edge
    const edgeId = `edge-${from}-${to}-${Date.now()}`;
    updatedCanvas.edges.push({
      id: edgeId,
      fromNode: from,
      toNode: to,
      // Convert React Flow handle IDs back to canvas side format
      fromSide: handleToCanvasSide(sourceHandle),
      toSide: handleToCanvasSide(targetHandle),
      pv: { edgeType: type },
    });
  }

  return updatedCanvas;
}
