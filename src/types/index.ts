/**
 * Panel Extension Type Definitions
 *
 * Re-exports core types from @principal-ade/panel-framework-core
 */

// Re-export all core types from panel-framework-core
export type {
  // Core data types
  DataSlice,
  WorkspaceMetadata,
  RepositoryMetadata,
  FileTreeSource,
  ActiveFileSlice,

  // Event system
  PanelEventType,
  PanelEvent,
  PanelEventEmitter,

  // Panel interface
  PanelActions,
  PanelContextValue,
  PanelComponentProps,

  // Panel definition
  PanelMetadata,
  PanelLifecycleHooks,
  PanelDefinition,
  PanelModule,

  // Registry types
  PanelRegistryEntry,
  PanelLoader,
  PanelRegistryConfig,
} from '@principal-ade/panel-framework-core';

// Import types needed for local interfaces
import type {
  PanelActions,
  PanelComponentProps,
  DataSlice,
} from '@principal-ade/panel-framework-core';

import type { FileTree, GitStatusWithFiles } from '@principal-ai/repository-abstraction';
import type { VersionSnapshot, WorkflowTemplate } from '@principal-ai/principal-view-core';
import type { RegisteredTrace } from './otel';

// ============================================================================
// Typed Panel Interfaces (v0.4.2+)
// ============================================================================

/**
 * Typed actions for panels that edit canvas files
 */
export interface CanvasEditorPanelActions extends PanelActions {
  readFile: (path: string) => Promise<string>;
  writeFile?: (path: string, content: string) => Promise<void>;
}

/**
 * Typed context for CanvasEditorPanel
 */
export interface CanvasEditorPanelContext {
  fileTree: DataSlice<FileTree | null>;
}

/**
 * Typed panel props for CanvasEditorPanel
 */
export type CanvasEditorPanelPropsTyped = PanelComponentProps<
  CanvasEditorPanelActions,
  CanvasEditorPanelContext
>;

/**
 * Typed context for WorkflowScenariosPanel
 */
export interface WorkflowScenariosPanelContext {
  fileTree: DataSlice<FileTree | null>;
  telemetry: DataSlice<RegisteredTrace[]>;
}

/**
 * Typed panel props for WorkflowScenariosPanel
 */
export type WorkflowScenariosPanelPropsTyped = PanelComponentProps<
  PanelActions,
  WorkflowScenariosPanelContext
>;

/**
 * Typed context for StoryboardListPanel
 */
export interface StoryboardListPanelContext {
  fileTree: DataSlice<FileTree | null>;
  git?: DataSlice<GitStatusWithFiles | null>;
  /**
   * Controlled selection - when provided, syncs with internal selection state.
   * Format: 'canvas:{canvasId}' or 'workflow:{workflowId}'
   *
   * Examples:
   * - 'canvas:my-canvas' - Select a canvas node
   * - 'workflow:my-workflow' - Select a workflow node
   *
   * Used for programmatic control (e.g., tours, external navigation).
   */
  selectedNodeId?: string | null;
}

/**
 * Typed panel props for StoryboardListPanel
 */
export type StoryboardListPanelPropsTyped = PanelComponentProps<
  PanelActions,
  StoryboardListPanelContext
>;

/**
 * Typed actions for TraceListPanel
 */
export interface TraceListPanelActions extends PanelActions {
  clearTelemetry?: () => Promise<void>;
  readFile: (path: string) => Promise<string>;
  /**
   * Update a scenario's filterDefault property in the workflow file.
   * If not provided, visibility toggle will only affect local UI state.
   *
   * @param workflowPath - Path to the workflow.json file
   * @param scenarioId - ID of the scenario to update
   * @param filterDefault - New filterDefault value (true = hidden by default)
   */
  updateScenarioFilterDefault?: (
    workflowPath: string,
    scenarioId: string,
    filterDefault: boolean
  ) => Promise<void>;
}

/**
 * Typed context for TraceListPanel
 */
export interface TraceListPanelContext {
  telemetry: DataSlice<RegisteredTrace[]>;
  schematics?: DataSlice<VersionSnapshot[]>;
  fileTree: DataSlice<FileTree | null>;
  git?: DataSlice<GitStatusWithFiles | null>;
  /** Whether to show the Configuration tab. Defaults to false. */
  showConfigurationTab?: boolean;
}

/**
 * Typed panel props for TraceListPanel
 */
export type TraceListPanelPropsTyped = PanelComponentProps<
  TraceListPanelActions,
  TraceListPanelContext
>;

/**
 * Programmatic control action types for TraceListPanel
 *
 * Used with 'custom' events to control the panel programmatically.
 *
 * Actions:
 * - selectTrace: Expand and scroll to a specific trace
 * - clickSpan: Click on a span within an expanded trace (triggers workflow panel)
 *
 * @example
 * ```typescript
 * // Select and expand a trace by ID
 * events.emit({
 *   type: 'custom',
 *   source: 'tour-controller',
 *   timestamp: Date.now(),
 *   payload: { action: 'selectTrace', traceId: 'abc123' }
 * });
 *
 * // Select the most recent trace (index 0)
 * events.emit({
 *   type: 'custom',
 *   source: 'tour-controller',
 *   timestamp: Date.now(),
 *   payload: { action: 'selectTrace', traceIndex: 0 }
 * });
 *
 * // Click on a specific span (opens workflow panel)
 * events.emit({
 *   type: 'custom',
 *   source: 'tour-controller',
 *   timestamp: Date.now(),
 *   payload: { action: 'clickSpan', traceIndex: 0, spanIndex: 0 }
 * });
 * ```
 */
export interface TraceListPanelAction {
  action: 'selectTrace' | 'clickSpan';
  /** Trace ID to select or find span in */
  traceId?: string;
  /** Trace index (0 = most recent trace) - alternative to traceId */
  traceIndex?: number;
  /** Span ID to click (for clickSpan action) */
  spanId?: string;
  /** Span index within the trace (alternative to spanId for clickSpan) */
  spanIndex?: number;
}

/**
 * Typed actions for MultiCanvasPanel
 */
export interface MultiCanvasPanelActions extends PanelActions {
  readFile: (path: string) => Promise<string>;
}

/**
 * Typed context for MultiCanvasPanel
 * Note: repositoryPath is accessed via casting as it's part of the base context
 */
export interface MultiCanvasPanelContext {
  fileTree: DataSlice<FileTree | null>;
}

/**
 * Typed panel props for MultiCanvasPanel
 */
export type MultiCanvasPanelPropsTyped = PanelComponentProps<
  MultiCanvasPanelActions,
  MultiCanvasPanelContext
>;

// ============================================================================
// Panel Event Payloads
// ============================================================================

/**
 * Payload for 'custom' event with action: 'openCanvas'
 * Emitted by TraceListPanel when a matched workflow span is clicked.
 * Used to navigate to WorkflowScenariosPanel with the appropriate context.
 */
export interface OpenCanvasPayload {
  action: 'openCanvas';
  /** Canvas ID (if available from storyboard) */
  canvasId?: string;
  /** Path to the .canvas file */
  canvasPath?: string;
  /** Canvas metadata */
  canvas?: { id: string; path: string; name: string };
  /** Workflow ID to display */
  workflowId: string;
  /** Path to the workflow file */
  workflowPath?: string;
  /** Full workflow template with scenarios */
  workflow?: WorkflowTemplate;
  /** How to open: 'detail' for WorkflowScenariosPanel, 'editor' for CanvasEditorPanel */
  openMode: 'detail' | 'editor';
  /** Storyboard ID containing the workflow */
  storyboardId: string;
  /** Storyboard display name */
  storyboardName: string;
  /** Scenario ID to highlight */
  scenarioId: string;
  /** The trace that triggered this navigation */
  trace: RegisteredTrace;
  /** Trace ID for context */
  traceId: string;
  /** Span ID to highlight in the workflow view */
  spanId: string;
}
