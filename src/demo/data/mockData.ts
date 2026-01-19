/**
 * Mock data for the demo UI
 */

import type {
  Canvas,
  CanvasMetadata,
  OTELTrace,
  TraceMetadata,
  CoverageData,
  ImpactAnalysis,
  FileTreeNode,
} from './types';

import checkoutFlowCanvas from './canvases/checkout-flow.otel.canvas.json';
import traceFailedInventory from './traces/trace-failed-inventory.json';
import traceSuccess from './traces/trace-success.json';

/**
 * Canvas metadata list
 */
export const canvasMetadataList: CanvasMetadata[] = [
  {
    id: 'checkout-flow',
    path: '.principal-views/checkout-flow.otel.canvas',
    name: 'Checkout Flow',
    type: 'otel.canvas',
    parent: null,
    lastModified: '2026-01-18T10:30:00Z',
  },
  {
    id: 'user-registration',
    path: '.principal-views/user-registration.otel.canvas',
    name: 'User Registration',
    type: 'otel.canvas',
    parent: null,
    lastModified: '2026-01-17T14:20:00Z',
  },
  {
    id: 'payment-processing',
    path: '.principal-views/payment-processing.otel.canvas',
    name: 'Payment Processing',
    type: 'otel.canvas',
    parent: null,
    lastModified: '2026-01-16T09:15:00Z',
  },
];

/**
 * Canvases by ID
 */
export const canvases: Record<string, Canvas> = {
  'checkout-flow': checkoutFlowCanvas as Canvas,
};

/**
 * Trace metadata list
 */
export const traceMetadataList: TraceMetadata[] = [
  {
    traceId: '5b8efff798038103d269b633813fc60c',
    timestamp: '2026-01-18T10:23:15.000Z',
    duration: 8000,
    status: 'failed',
    serviceName: 'checkout-service',
    rootSpan: 'handleCheckout',
    spanCount: 3,
  },
  {
    traceId: '7c9dfff798038103d269b633813fc72e',
    timestamp: '2026-01-18T10:25:30.000Z',
    duration: 1200,
    status: 'success',
    serviceName: 'checkout-service',
    rootSpan: 'handleCheckout',
    spanCount: 5,
  },
];

/**
 * Traces by ID
 */
export const traces: Record<string, OTELTrace> = {
  '5b8efff798038103d269b633813fc60c': traceFailedInventory as OTELTrace,
  '7c9dfff798038103d269b633813fc72e': traceSuccess as OTELTrace,
};

/**
 * Mock coverage data
 */
export const mockCoverageData: CoverageData = {
  overall: {
    expected: 150,
    actual: 123,
    percentage: 82,
  },
  byComponent: [
    {
      type: 'rest-api',
      expected: 45,
      actual: 42,
      percentage: 93,
      missingFiles: ['src/api/legacy.ts', 'src/api/deprecated.ts', 'src/api/internal.ts'],
    },
    {
      type: 'business-logic',
      expected: 60,
      actual: 18,
      percentage: 30,
      missingFiles: [
        'src/business/shipping.ts',
        'src/business/notifications.ts',
        'src/business/analytics.ts',
        'src/business/reporting.ts',
        'src/business/validation.ts',
      ],
    },
    {
      type: 'database',
      expected: 30,
      actual: 21,
      percentage: 70,
      missingFiles: ['src/db/migrations.ts', 'src/db/seeds.ts'],
    },
    {
      type: 'external-api',
      expected: 15,
      actual: 12,
      percentage: 80,
      missingFiles: ['src/integrations/legacy-api.ts', 'src/integrations/webhook.ts'],
    },
  ],
};

/**
 * Mock impact analysis data
 */
export const mockImpactAnalysis: Record<string, ImpactAnalysis> = {
  'inventory-check': {
    nodeId: 'inventory-check',
    canvasId: 'checkout-flow',
    analysis: {
      downstream: [
        {
          component: 'checkout',
          traffic: '10,000 req/min',
          impact: 'high',
          userFacing: true,
        },
        {
          component: 'orderCreation',
          traffic: '8,000 req/min',
          impact: 'high',
          userFacing: true,
        },
      ],
      upstream: [
        {
          component: 'user-validation',
          required: 'always',
          failureRate: 0.001,
        },
        {
          component: 'database',
          required: 'always',
          failureRate: 0.005,
        },
      ],
      criticalPath: {
        isBottleneck: true,
        percentageOfTotal: 67,
        avgDuration: 800,
      },
      blastRadius: {
        requestsPerMinute: 18000,
        affectedWorkflows: 2,
        revenueAtRisk: 30000,
      },
    },
  },
};

/**
 * Mock file tree
 */
export const mockFileTree: FileTreeNode[] = [
  {
    path: 'src',
    type: 'directory',
    children: [
      {
        path: 'src/api',
        type: 'directory',
        hasTelemetry: true,
        coveragePercentage: 93,
        children: [
          {
            path: 'src/api/auth.ts',
            type: 'file',
            hasTelemetry: true,
            coveragePercentage: 100,
          },
          {
            path: 'src/api/checkout.ts',
            type: 'file',
            hasTelemetry: true,
            coveragePercentage: 100,
          },
          {
            path: 'src/api/legacy.ts',
            type: 'file',
            hasTelemetry: false,
            coveragePercentage: 0,
          },
        ],
      },
      {
        path: 'src/business',
        type: 'directory',
        hasTelemetry: true,
        coveragePercentage: 30,
        children: [
          {
            path: 'src/business/inventory.ts',
            type: 'file',
            hasTelemetry: true,
            coveragePercentage: 100,
          },
          {
            path: 'src/business/payment.ts',
            type: 'file',
            hasTelemetry: true,
            coveragePercentage: 100,
          },
          {
            path: 'src/business/notifications.ts',
            type: 'file',
            hasTelemetry: false,
            coveragePercentage: 0,
          },
          {
            path: 'src/business/shipping.ts',
            type: 'file',
            hasTelemetry: false,
            coveragePercentage: 0,
          },
        ],
      },
      {
        path: 'src/db',
        type: 'directory',
        hasTelemetry: true,
        coveragePercentage: 70,
        children: [
          {
            path: 'src/db/repositories',
            type: 'directory',
            hasTelemetry: true,
            coveragePercentage: 85,
          },
          {
            path: 'src/db/migrations.ts',
            type: 'file',
            hasTelemetry: false,
            coveragePercentage: 0,
          },
        ],
      },
    ],
  },
];
