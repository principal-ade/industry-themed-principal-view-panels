import type { DiscoveredCanvas, DiscoveredStoryboard, DiscoveredWorkflow, WorkflowTemplate } from '@principal-ai/principal-view-core';
import type { WorkflowFile } from '../../execution-viewer/WorkflowLoader';

/**
 * Transform canvases and workflows into storyboard format
 *
 * This is a temporary utility until the discovery logic in principal-view-core
 * provides storyboards directly via CanvasDiscovery.
 */
export function transformToStoryboards(
  canvases: DiscoveredCanvas[],
  workflows: Array<{ file: WorkflowFile; template: WorkflowTemplate }>
): DiscoveredStoryboard[] {
  // Group canvases by their directory (storyboard folder)
  const storyboardMap = new Map<string, {
    canvas: DiscoveredCanvas;
    workflows: Array<{ file: WorkflowFile; template: WorkflowTemplate }>;
  }>();

  // Process each canvas
  for (const canvas of canvases) {
    // Extract storyboard path (directory containing the canvas)
    const storyboardPath = canvas.path.substring(0, canvas.path.lastIndexOf('/'));

    if (!storyboardMap.has(storyboardPath)) {
      storyboardMap.set(storyboardPath, {
        canvas,
        workflows: [],
      });
    }
  }

  // Group workflows by their storyboard path
  for (const workflow of workflows) {
    const canvasPath = workflow.template.canvas;

    // Find matching canvas
    const matchingCanvas = canvases.find(c =>
      c.path === canvasPath || c.path.endsWith(canvasPath)
    );

    if (matchingCanvas) {
      const storyboardPath = matchingCanvas.path.substring(0, matchingCanvas.path.lastIndexOf('/'));
      const storyboardEntry = storyboardMap.get(storyboardPath);

      if (storyboardEntry) {
        storyboardEntry.workflows.push(workflow);
      }
    }
  }

  // Build DiscoveredStoryboard array
  const storyboards: DiscoveredStoryboard[] = [];

  for (const [storyboardPath, { canvas, workflows: storyboardWorkflows }] of storyboardMap) {
    const basename = storyboardPath.substring(storyboardPath.lastIndexOf('/') + 1);
    const id = canvas.id.substring(0, canvas.id.lastIndexOf('/')) || canvas.id;

    // Transform workflows to DiscoveredWorkflow format
    const discoveredWorkflows: DiscoveredWorkflow[] = storyboardWorkflows.map((wf) => {
      // Extract basename from path (remove extension)
      const fileName = wf.file.path.substring(wf.file.path.lastIndexOf('/') + 1);
      const basename = fileName.replace(/\.workflow\.json$/, '');

      return {
        id: `${id}/${basename}`,
        name: wf.file.name,
        path: wf.file.path,
        basename,
        storyboardId: id,
        packageName: canvas.packageName,
        packagePath: canvas.packagePath,
        scope: canvas.scope,
        executions: [], // TODO: Add execution discovery
      };
    });

    storyboards.push({
      id,
      name: canvas.name,
      path: storyboardPath,
      basename,
      canvas,
      workflows: discoveredWorkflows,
      packageName: canvas.packageName,
      packagePath: canvas.packagePath,
      scope: canvas.scope,
    });
  }

  return storyboards;
}
