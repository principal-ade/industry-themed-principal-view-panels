import { CanvasEditorPanel } from './panels/CanvasEditorPanel';
import { StoryboardListPanel } from './panels/StoryboardListPanel';
import { TraceListPanel } from './panels/TraceListPanel';
import type { PanelDefinition, PanelContextValue } from './types';
import { principalViewPanelTools } from './tools';

// Re-export components for direct usage
export { CanvasEditorPanel } from './panels/CanvasEditorPanel';
export type { CanvasEditorPanelProps } from './panels/CanvasEditorPanel';
export { StoryboardListPanel } from './panels/StoryboardListPanel';
export { TraceListPanel } from './panels/TraceListPanel';
export { TraceDetailsPanel } from './panels/TraceDetailsPanel';
export { MultiCanvasPanel, createMultiCanvasLayout } from './panels/MultiCanvasPanel';
export type { MultiCanvasPanelProps, CanvasInfo } from './panels/MultiCanvasPanel';

// Re-export adapter for external use
export { PanelFileSystemAdapter } from './adapters/PanelFileSystemAdapter';
export type { FileTreeEntry, PanelFileSystemAdapterOptions } from './adapters/PanelFileSystemAdapter';

// Re-export panel-specific OTEL types
// Note: Base OTEL types should be imported from @principal-ai/principal-view-core
export type { RegisteredTrace, WorkflowMatch } from './types/otel';
export { getServiceName, getSpansFromTrace, getRootSpan, getResource } from './types/otel';

// Re-export event payload types for panel navigation
export type { OpenCanvasPayload, TraceListPanelAction } from './types';

// Re-export trace components
export { TraceExpansion } from './components/TraceExpansion';
export type { TraceExpansionProps } from './components/TraceExpansion';

// Re-export telemetry utilities for library instrumentation
export {
  getTracer,
  getActiveSpan,
  withSpan,
  traced,
  tracedSync,
  SpanStatusCode,
  TRACER_NAME,
  TRACER_VERSION,
} from './telemetry';
export type { Span, SpanOptions } from './telemetry';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 * Using generic types for v0.4.2+ typed actions and context.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const panels: PanelDefinition<any, any>[] = [
  {
    metadata: {
      id: 'principal-ai.canvas-editor',
      name: 'Canvas Editor',
      icon: '🎨',
      version: '0.1.0',
      author: 'Principal AI',
      description: 'Edits .canvas configuration files as interactive graph diagrams',
      slices: ['fileTree'], // Data slices this panel depends on
      // UTCP-compatible tools this panel exposes
      tools: principalViewPanelTools,
    },
    component: CanvasEditorPanel,

    // Optional: Called when this specific panel is mounted
    onMount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Canvas Editor Panel mounted',
        _context.currentScope.repository?.path
      );

      // Slice availability is enforced by panel metadata slices declaration
    },

    // Optional: Called when this specific panel is unmounted
    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Canvas Editor Panel unmounting');
    },
  },
  {
    metadata: {
      id: 'principal-ai.storyboard-list',
      name: 'Storyboard List',
      icon: '📖',
      version: '0.1.0',
      author: 'Principal AI',
      description: 'Lists and manages storyboards using the new discovery system (v0.15.1+)',
      slices: ['fileTree'],
    },
    component: StoryboardListPanel,

    onMount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Storyboard List Panel mounted',
        _context.currentScope.repository?.path
      );

      // Slice availability is enforced by panel metadata slices declaration
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Storyboard List Panel unmounting');
    },
  },
  {
    metadata: {
      id: 'principal-ai.trace-list',
      name: 'Trace List',
      icon: '📊',
      version: '0.1.0',
      author: 'Principal AI',
      description: 'Lists OpenTelemetry traces with search and filtering',
      slices: ['telemetry'],
    },
    component: TraceListPanel,

    onMount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Trace List Panel mounted');

      // Telemetry slice is automatically managed by RepositoryPanelContext
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Trace List Panel unmounting');
    },
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 * Use this for package-level initialization.
 */
export const onPackageLoad = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package loaded - Principal View Panels');
};

/**
 * Optional: Called once when the package is unloaded.
 * Use this for package-level cleanup.
 */
export const onPackageUnload = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package unloading - Principal View Panels');
};

/**
 * Export tools for server-safe imports.
 * Use '@industry-theme/principal-view-panels/tools' to import without React dependencies.
 */
export {
  principalViewPanelTools,
  principalViewPanelToolsMetadata,
  focusNodeTool,
  resetViewTool,
  triggerEventTool,
} from './tools';
