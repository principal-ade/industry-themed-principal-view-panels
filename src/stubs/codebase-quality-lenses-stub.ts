/**
 * Browser stub for @principal-ai/codebase-quality-lenses
 * This package has Node.js dependencies and isn't used in browser contexts
 */

// Export empty implementations for any imports from quality-lenses
export const ALL_LENS_REQUIREMENTS = [];
export const getAvailableLenses = () => [];
export const getMissingLenses = () => [];
export const calculateQualityMetrics = () => null;
export const QualityMetricsCalculator = class {
  calculateMetrics() {
    return null;
  }
};

// Default export
export default {
  ALL_LENS_REQUIREMENTS: [],
  getAvailableLenses: () => [],
  getMissingLenses: () => [],
  calculateQualityMetrics: () => null,
  QualityMetricsCalculator,
};
