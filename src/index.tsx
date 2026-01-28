import { CanvasEditorPanel } from './panels/CanvasEditorPanel';
import { CanvasDetailPanel } from './panels/CanvasDetailPanel';
import { CanvasListPanel } from './panels/CanvasListPanel';
import type { PanelDefinition, PanelContextValue } from './types';
import { principalViewPanelTools } from './tools';

// Re-export components for direct usage
export { EventControllerPanel } from './panels/EventControllerPanel';
export type { EventControllerPanelProps, PlaybackState, PlaybackStatus } from './panels/EventControllerPanel';

export { CanvasEditorPanel } from './panels/CanvasEditorPanel';
export type { CanvasEditorPanelProps } from './panels/CanvasEditorPanel';
export { CanvasDetailPanel } from './panels/CanvasDetailPanel';
export type { CanvasDetailPanelProps } from './panels/CanvasDetailPanel';
export { CanvasListPanel } from './panels/CanvasListPanel';
export { LibraryAnchoringExplainerPanel } from './panels/LibraryAnchoringExplainerPanel';
export type { LibraryAnchoringExplainerPanelProps } from './panels/LibraryAnchoringExplainerPanel';
export { WorkflowExplainerPanel } from './panels/WorkflowExplainerPanel';
export type { WorkflowExplainerPanelProps } from './panels/WorkflowExplainerPanel';
export { RuntimeValidationExplainerPanel } from './panels/RuntimeValidationExplainerPanel';
export type { RuntimeValidationExplainerPanelProps } from './panels/RuntimeValidationExplainerPanel';
export { TestVsProductionExplainerPanel } from './panels/TestVsProductionExplainerPanel';
export type { TestVsProductionExplainerPanelProps } from './panels/TestVsProductionExplainerPanel';
export { ScenarioEnumerationExplainerPanel } from './panels/ScenarioEnumerationExplainerPanel';
export type { ScenarioEnumerationExplainerPanelProps } from './panels/ScenarioEnumerationExplainerPanel';
export { CanvasTypesExplainerPanel } from './panels/CanvasTypesExplainerPanel';
export type { CanvasTypesExplainerPanelProps } from './panels/CanvasTypesExplainerPanel';
export { MonorepoComposabilityExplainerPanel } from './panels/MonorepoComposabilityExplainerPanel';
export type { MonorepoComposabilityExplainerPanelProps } from './panels/MonorepoComposabilityExplainerPanel';
export { HierarchicalCanvasCompositionExplainerPanel } from './panels/HierarchicalCanvasCompositionExplainerPanel';
export type { HierarchicalCanvasCompositionExplainerPanelProps } from './panels/HierarchicalCanvasCompositionExplainerPanel';
export { BookAnalogyExplainerPanel } from './panels/BookAnalogyExplainerPanel';
export type { BookAnalogyExplainerPanelProps } from './panels/BookAnalogyExplainerPanel';
export { ProductionDebuggingExplainerPanel } from './panels/ProductionDebuggingExplainerPanel';
export type { ProductionDebuggingExplainerPanelProps } from './panels/ProductionDebuggingExplainerPanel';
export { MultipleCanvasViewsExplainerPanel } from './panels/MultipleCanvasViewsExplainerPanel';
export type { MultipleCanvasViewsExplainerPanelProps } from './panels/MultipleCanvasViewsExplainerPanel';
export { TelemetryCoverageExplainerPanel } from './panels/TelemetryCoverageExplainerPanel';
export type { TelemetryCoverageExplainerPanelProps } from './panels/TelemetryCoverageExplainerPanel';
export { ChangeImpactAnalysisExplainerPanel } from './panels/ChangeImpactAnalysisExplainerPanel';
export type { ChangeImpactAnalysisExplainerPanelProps } from './panels/ChangeImpactAnalysisExplainerPanel';
export { AgentMonitoringGapExplainerPanel } from './panels/AgentMonitoringGapExplainerPanel';
export type { AgentMonitoringGapExplainerPanelProps } from './panels/AgentMonitoringGapExplainerPanel';
export { SystemStoriesSolutionExplainerPanel } from './panels/SystemStoriesSolutionExplainerPanel';
export type { SystemStoriesSolutionExplainerPanelProps } from './panels/SystemStoriesSolutionExplainerPanel';
export { WhyNowAgentRevolutionExplainerPanel } from './panels/WhyNowAgentRevolutionExplainerPanel';
export type { WhyNowAgentRevolutionExplainerPanelProps } from './panels/WhyNowAgentRevolutionExplainerPanel';

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
    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Canvas Editor Panel mounted',
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
      console.log('Canvas Editor Panel unmounting');
    },
  },
  {
    metadata: {
      id: 'principal-ai.canvas-detail',
      name: 'Canvas Detail',
      icon: '⚡',
      version: '0.1.0',
      author: 'Principal AI',
      description: 'Visualizes canvas details with execution artifacts, workflow templates, and playback controls',
      slices: ['fileTree'],
    },
    component: CanvasDetailPanel,

    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Canvas Detail Panel mounted',
        context.currentScope.repository?.path
      );

      // Refresh file tree if available
      if (context.hasSlice('fileTree') && !context.isSliceLoading('fileTree')) {
        await context.refresh('repository', 'fileTree');
      }
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Canvas Detail Panel unmounting');
    },
  },
  {
    metadata: {
      id: 'principal-ai.canvas-list',
      name: 'Canvas List',
      icon: '📋',
      version: '0.1.0',
      author: 'Principal AI',
      description: 'Lists and manages .otel.canvas files in the project with search and selection',
      slices: ['fileTree'],
    },
    component: CanvasListPanel,

    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Canvas List Panel mounted',
        context.currentScope.repository?.path
      );

      // Refresh file tree if available
      if (context.hasSlice('fileTree') && !context.isSliceLoading('fileTree')) {
        await context.refresh('repository', 'fileTree');
      }
    },

    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Canvas List Panel unmounting');
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
