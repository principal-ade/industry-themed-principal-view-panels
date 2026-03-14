import React, { useCallback } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ExplanationStep } from './types';

export interface StepCarouselProps {
  /** Array of explanation steps */
  steps: ExplanationStep[];
  /** Currently active step index */
  currentIndex: number;
  /** Callback when step changes */
  onStepChange: (index: number) => void;
  /** Optional height override */
  height?: number | string;
}

/**
 * StepCarousel - Bottom navigation component for composable explanations
 *
 * Features:
 * - Left/right arrow navigation
 * - Step indicator dots
 * - Current step content display
 * - Smooth transitions between steps
 */
export const StepCarousel: React.FC<StepCarouselProps> = ({
  steps,
  currentIndex,
  onStepChange,
  height = 180,
}) => {
  const { theme } = useTheme();

  const currentStep = steps[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < steps.length - 1;

  const handlePrev = useCallback(() => {
    if (canGoPrev) {
      onStepChange(currentIndex - 1);
    }
  }, [canGoPrev, currentIndex, onStepChange]);

  const handleNext = useCallback(() => {
    if (canGoNext) {
      onStepChange(currentIndex + 1);
    }
  }, [canGoNext, currentIndex, onStepChange]);

  const handleDotClick = useCallback(
    (index: number) => {
      onStepChange(index);
    },
    [onStepChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    },
    [handlePrev, handleNext]
  );

  if (steps.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.colors.background,
          borderTop: `1px solid ${theme.colors.border}`,
          color: theme.colors.textMuted,
        }}
      >
        No explanation steps available
      </div>
    );
  }

  return (
    <div
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        background: theme.colors.background,
        borderTop: `1px solid ${theme.colors.border}`,
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Main content area with navigation */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'stretch',
          overflow: 'hidden',
        }}
      >
        {/* Left arrow */}
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          style={{
            width: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRight: `1px solid ${theme.colors.border}`,
            color: canGoPrev ? theme.colors.text : theme.colors.textMuted,
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            opacity: canGoPrev ? 1 : 0.3,
            transition: 'all 0.2s',
          }}
          title="Previous step (←)"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Step content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 20px',
            overflow: 'auto',
          }}
        >
          {/* Step header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: theme.fontSizes[0],
                color: theme.colors.textMuted,
                fontFamily: theme.fonts.monospace,
              }}
            >
              Step {currentIndex + 1} of {steps.length}
            </span>
            {currentStep?.title && (
              <span
                style={{
                  fontSize: theme.fontSizes[1],
                  fontWeight: theme.fontWeights.semibold,
                  color: theme.colors.text,
                }}
              >
                {currentStep.title}
              </span>
            )}
          </div>

          {/* Step narrative */}
          <div
            style={{
              flex: 1,
              fontSize: theme.fontSizes[2],
              lineHeight: 1.6,
              color: theme.colors.text,
              fontFamily: theme.fonts.body,
            }}
          >
            {currentStep?.content}
          </div>

          {/* Source reference if present */}
          {currentStep?.source && (
            <div
              style={{
                marginTop: '8px',
                fontSize: theme.fontSizes[0],
                fontFamily: theme.fonts.monospace,
                color: theme.colors.primary,
                opacity: 0.8,
              }}
            >
              📄 {currentStep.source}
            </div>
          )}
        </div>

        {/* Right arrow */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          style={{
            width: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderLeft: `1px solid ${theme.colors.border}`,
            color: canGoNext ? theme.colors.text : theme.colors.textMuted,
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            opacity: canGoNext ? 1 : 0.3,
            transition: 'all 0.2s',
          }}
          title="Next step (→)"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dot indicators */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          borderTop: `1px solid ${theme.colors.border}`,
          background: theme.colors.backgroundSecondary,
        }}
      >
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            style={{
              width: '8px',
              height: '8px',
              padding: 0,
              border: 'none',
              borderRadius: '50%',
              background:
                index === currentIndex
                  ? theme.colors.primary
                  : theme.colors.border,
              cursor: 'pointer',
              transition: 'all 0.2s',
              transform: index === currentIndex ? 'scale(1.25)' : 'scale(1)',
            }}
            title={`Go to step ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
