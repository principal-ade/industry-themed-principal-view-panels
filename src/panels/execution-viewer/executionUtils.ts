/**
 * Utility functions for working with execution artifacts
 * These utilities work with ExecutionData from the core library
 */

import { ExecutionValidator, type ExecutionData } from '@principal-ai/principal-view-core';

// Create singleton validator instance
const executionValidator = new ExecutionValidator();

/**
 * Execution metadata extracted from an execution artifact
 */
export interface ExecutionMetadata {
  name: string;
  canvasName?: string;
  exportedAt?: string;
  source?: string;
  framework?: string;
  status?: 'success' | 'error' | 'OK';
  spanCount: number;
  eventCount: number;
}

/**
 * Parse and validate JSON execution artifact content
 * Automatically handles OTLP format conversion
 */
export function parseExecutionArtifact(content: string): ExecutionData {
  try {
    const parsed = JSON.parse(content);
    return executionValidator.validateOrThrow(parsed);
  } catch (error) {
    throw new Error(`Failed to parse execution artifact JSON: ${(error as Error).message}`);
  }
}

/**
 * Get spans array from execution artifact
 */
export function getSpans(artifact: ExecutionData) {
  return artifact.spans;
}

/**
 * Extract metadata from an execution artifact
 */
export function getExecutionMetadata(artifact: ExecutionData): ExecutionMetadata {
  const spans = getSpans(artifact);
  const spanCount = spans.length;
  const eventCount = spans.reduce((total, span) => total + (span.events?.length || 0), 0);

  const metadata = artifact.metadata;
  let status: 'success' | 'error' | 'OK' = 'success';
  if (metadata?.status) {
    status = metadata.status as 'success' | 'error' | 'OK';
  } else if (spans.length > 0) {
    const hasError = spans.some(s => s.status === 'ERROR');
    status = hasError ? 'error' : 'OK';
  }

  return {
    name: metadata?.canvasName || 'Untitled Execution',
    canvasName: metadata?.canvasName,
    exportedAt: metadata?.exportedAt,
    source: metadata?.source,
    framework: metadata?.framework,
    status,
    spanCount,
    eventCount,
  };
}
