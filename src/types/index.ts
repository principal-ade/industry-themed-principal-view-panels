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
import type { VersionSnapshot } from '@principal-ai/principal-view-core';
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
  fileTree: DataSlice<FileTree>;
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
  fileTree: DataSlice<FileTree>;
  git?: DataSlice<GitStatusWithFiles>;
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
  fileTree?: DataSlice<FileTree>;
  git?: DataSlice<GitStatusWithFiles>;
}

/**
 * Typed panel props for TraceListPanel
 */
export type TraceListPanelPropsTyped = PanelComponentProps<
  TraceListPanelActions,
  TraceListPanelContext
>;
