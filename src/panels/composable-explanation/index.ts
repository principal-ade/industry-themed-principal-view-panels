/**
 * Composable Explanation Panel
 *
 * A panel for displaying agent-generated codebase explanations
 * with a canvas viewer on top and step-through navigation below.
 *
 * Supports two render modes:
 * - 'full': Shows the entire canvas with highlighted nodes
 * - 'story': Shows only the relevant canvas fragments for each step (focused view)
 */

export { ComposableExplanationPanel } from './ComposableExplanationPanel';
export type {
  ComposableExplanationPanelProps,
  ComposableExplanationPanelContext,
  ComposableExplanationPanelActions,
  CanvasRenderMode,
} from './ComposableExplanationPanel';

export { StepCarousel } from './StepCarousel';
export type { StepCarouselProps } from './StepCarousel';

export { StoryGraphRenderer, explanationStepsToStorySteps } from './StoryGraphRenderer';
export type { StoryGraphRendererProps, StoryStep } from './StoryGraphRenderer';

export {
  extractFragment,
  composeFragments,
  buildStepCanvas,
  calculateBounds,
  calculateStepTransition,
  DEFAULT_COMPOSITION_CONFIG,
} from './canvasFragments';
export type {
  CanvasFragment,
  BridgeEdge,
  CompositionConfig,
  ComposedCanvas,
  StepCanvasConfig,
  StepTransition,
} from './canvasFragments';

export type {
  ComposableExplanation,
  ExplanationStep,
  ExplanationType,
  CanvasRegistry,
  EntityMapping,
  CanvasBridge,
  ViewFocus,
  FocusType,
  ProposedElement,
  LoadedCanvas,
  ExplanationViewerState,
  ElementRef,
} from './types';
