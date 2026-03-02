/**
 * OpenTelemetry instrumentation for the Principal View Panels library.
 *
 * This module follows the "library instrumentation" pattern:
 * - Only imports @opentelemetry/api (no SDK dependencies)
 * - Gets tracer from global provider (set up by host app or Storybook addon)
 * - Returns no-op tracer if no provider is registered
 *
 * @see https://opentelemetry.io/docs/languages/js/libraries/
 */
import {
  trace,
  context,
  SpanStatusCode,
  type Tracer,
  type Span,
  type SpanOptions,
} from '@opentelemetry/api';

// Package metadata
export const TRACER_NAME = '@industry-theme/principal-view-panels';
export const TRACER_VERSION = '0.11.40';

/**
 * Get a tracer instance for this library.
 * Returns a no-op tracer if no TracerProvider is registered.
 */
export function getTracer(): Tracer {
  return trace.getTracer(TRACER_NAME, TRACER_VERSION);
}

/**
 * Get the currently active span, if any.
 */
export function getActiveSpan(): Span | undefined {
  return trace.getActiveSpan();
}

/**
 * Execute a function within a span's context.
 * Useful for propagating context to child operations.
 */
export async function withSpan<T>(span: Span, fn: () => Promise<T>): Promise<T> {
  return context.with(trace.setSpan(context.active(), span), fn);
}

/**
 * Create and manage a span for an async operation.
 * Automatically handles errors and span ending.
 */
export async function traced<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options?: SpanOptions
): Promise<T> {
  const tracer = getTracer();
  const span = tracer.startSpan(name, options);

  try {
    const result = await context.with(
      trace.setSpan(context.active(), span),
      () => fn(span)
    );
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : String(error),
    });
    span.recordException(
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Create a span for a synchronous operation.
 */
export function tracedSync<T>(
  name: string,
  fn: (span: Span) => T,
  options?: SpanOptions
): T {
  const tracer = getTracer();
  const span = tracer.startSpan(name, options);

  try {
    const result = fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : String(error),
    });
    span.recordException(
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  } finally {
    span.end();
  }
}

// Re-export commonly used types and utilities
export { SpanStatusCode };
export type { Span, SpanOptions };
