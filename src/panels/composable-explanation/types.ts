/**
 * Types for Composable Explanation Documents
 *
 * These types define the format for agent-generated codebase explanations
 * that compose existing canvas visualizations with narrative content.
 */

import type { ExtendedCanvas, WorkflowTemplate } from '@principal-ai/principal-view-core';

/**
 * Reference to a canvas element using canvas-alias:element-id format
 */
export type ElementRef = string;

/**
 * Focus annotation types for visual treatment
 */
export type FocusType = 'existing' | 'modified' | 'added' | 'removed' | 'error' | 'current';

/**
 * Proposed element that doesn't exist in the canvas yet
 */
export interface ProposedElement {
  id: string;
  after?: string; // Insert after this element
  label: string;
  description?: string;
}

/**
 * Focus configuration for a view
 */
export interface ViewFocus {
  /** Relevant existing elements - standard highlight */
  existing?: string[];
  /** Changed elements - yellow/amber */
  modified?: string[];
  /** New elements (proposed or actual) - green */
  added?: string[];
  /** Deleted elements - red/strikethrough */
  removed?: string[];
  /** Proposed elements that don't exist yet */
  proposed?: ProposedElement[];
}

/**
 * A single step in the explanation walkthrough
 */
export interface ExplanationStep {
  /** Unique ID for this step */
  id: string;
  /** Element reference to highlight (canvas-alias:element-id) */
  ref?: ElementRef;
  /** Array of element refs if highlighting multiple */
  refs?: ElementRef[];
  /** Narrative content for this step (markdown supported) */
  content: string;
  /** Optional source file reference */
  source?: string;
  /** Focus configuration for canvas highlighting */
  focus?: ViewFocus;
  /** Optional title for the step */
  title?: string;
}

/**
 * Canvas registry mapping aliases to file paths
 */
export interface CanvasRegistry {
  [alias: string]: string; // alias -> path to .canvas file
}

/**
 * Entity mapping showing same logical entity across canvases
 */
export interface EntityMapping {
  [entityId: string]: {
    description: string;
    occurrences: ElementRef[];
  };
}

/**
 * Cross-canvas bridge connection
 */
export interface CanvasBridge {
  id: string;
  from: ElementRef;
  to: ElementRef;
  label?: string;
  type?: 'sync' | 'async' | 'event';
}

/**
 * Explanation document types
 */
export type ExplanationType =
  | 'code-review'
  | 'design-spec'
  | 'exploration'
  | 'incident-analysis'
  | 'onboarding'
  | 'impact-analysis';

/**
 * Main explanation document structure
 */
export interface ComposableExplanation {
  /** Document type */
  type: ExplanationType;
  /** Semantic version */
  version: string;
  /** Document title */
  title: string;
  /** Optional summary/description */
  summary?: string;
  /** Question being answered (for exploration type) */
  question?: string;

  /** Canvas registry - aliases to file paths */
  canvases: CanvasRegistry;

  /** Entity mappings across canvases */
  entities?: EntityMapping;

  /** Cross-canvas bridges */
  bridges?: CanvasBridge[];

  /** Scope of the explanation */
  scope?: {
    files?: string[];
    areas?: string[];
  };

  /** The walkthrough steps */
  steps: ExplanationStep[];

  /** Related resources */
  related?: {
    scenarios?: string[];
    sources?: string[];
    workflows?: string[];
  };
}

/**
 * Loaded canvas data with alias
 */
export interface LoadedCanvas {
  alias: string;
  path: string;
  canvas: ExtendedCanvas;
}

/**
 * Runtime state for the explanation viewer
 */
export interface ExplanationViewerState {
  /** Currently active step index */
  currentStepIndex: number;
  /** Loaded canvases by alias */
  loadedCanvases: Map<string, LoadedCanvas>;
  /** Currently highlighted node IDs */
  highlightedNodeIds: string[];
  /** Active node IDs (all nodes in current step's focus) */
  activeNodeIds: string[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
}
