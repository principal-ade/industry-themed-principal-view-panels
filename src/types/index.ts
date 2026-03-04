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
