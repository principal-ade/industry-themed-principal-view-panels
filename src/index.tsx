import { PrincipalViewGraphPanel } from './panels/PrincipalViewGraphPanel';
import { TraceViewerPanel } from './panels/TraceViewerPanel';
import { EventControllerPanel } from './panels/EventControllerPanel';
import type { PanelDefinition, PanelContextValue } from './types';
import { principalViewPanelTools, principalViewPanelToolsMetadata } from './tools';

// Re-export components for direct usage
export { EventControllerPanel } from './panels/EventControllerPanel';
export type { EventControllerPanelProps, PlaybackState, PlaybackStatus } from './panels/EventControllerPanel';

export { TraceViewerPanel } from './panels/TraceViewerPanel';

// Re-export adapter for external use
export { PanelFileSystemAdapter } from './adapters/PanelFileSystemAdapter';
export type { FileTreeEntry, PanelFileSystemAdapterOptions } from './adapters/PanelFileSystemAdapter';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      id: 'principal-ai.principal-view-graph',
      name: 'Principal View Graph',
      icon: '🕸️',
      version: '0.1.0',
      author: 'Principal AI',
      description: 'Visualizes .canvas configuration files as interactive graph diagrams',
      slices: ['fileTree'], // Data slices this panel depends on
      // UTCP-compatible tools this panel exposes
      tools: principalViewPanelTools,
    },
    component: PrincipalViewGraphPanel,

    // Optional: Called when this specific panel is mounted
    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Principal View Graph Panel mounted',
        context.currentScope.repository?.path
      );

      // Refresh file tree if available
      if (context.hasSlice('fileTree') && !context.isSliceLoading('fileTree')) {
        await context.refresh('repository', 'fileTree');
      }
    },

    // Optional: Called when this specific panel is unmounted
    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Principal View Graph Panel unmounting');
    },
  },
  {
    metadata: {
      id: 'principal-ai.trace-viewer',
      name: 'Trace Viewer',
      icon: '📊',
      version: '0.1.0',
      author: 'Principal AI',
      description: 'Visualizes OpenTelemetry traces captured from test runs as canvas diagrams',
      slices: ['fileTree'],
    },
    component: TraceViewerPanel,

    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Trace Viewer Panel mounted',
        context.currentScope.repository?.path
      );

      // Refresh file tree if available
      if (context.hasSlice('fileTree') && !context.isSliceLoading('fileTree')) {
        await context.refresh('repository', 'fileTree');
      }
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Trace Viewer Panel unmounting');
    },
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 * Use this for package-level initialization.
 */
export const onPackageLoad = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package loaded - Principal View Graph Panel');
};

/**
 * Optional: Called once when the package is unloaded.
 * Use this for package-level cleanup.
 */
export const onPackageUnload = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package unloading - Principal View Graph Panel');
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
