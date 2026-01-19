/**
 * MSW (Mock Service Worker) handlers for the demo API
 *
 * To use MSW, install it with: npm install msw --save-dev
 * Then run: npx msw init public/ --save
 */

import { http, HttpResponse } from 'msw';
import {
  canvasMetadataList,
  canvases,
  traceMetadataList,
  traces,
  mockCoverageData,
  mockImpactAnalysis,
  mockFileTree,
} from '../data/mockData';
import type { ImpactAnalysis } from '../data/types';

const BASE_URL = '/api/v1';

export const handlers = [
  // GET /canvases - List all canvases
  http.get(`${BASE_URL}/canvases`, () => {
    return HttpResponse.json({
      canvases: canvasMetadataList,
    });
  }),

  // GET /canvases/:id - Get canvas by ID
  http.get(`${BASE_URL}/canvases/:id`, ({ params }) => {
    const { id } = params;
    const canvas = canvases[id as string];

    if (!canvas) {
      return HttpResponse.json(
        { error: 'Canvas not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      canvas,
    });
  }),

  // GET /traces - List all traces with pagination
  http.get(`${BASE_URL}/traces`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedTraces = traceMetadataList.slice(start, end);

    return HttpResponse.json({
      traces: paginatedTraces,
      pagination: {
        total: traceMetadataList.length,
        page,
        pageSize,
      },
    });
  }),

  // GET /traces/:traceId - Get trace by ID
  http.get(`${BASE_URL}/traces/:traceId`, ({ params }) => {
    const { traceId } = params;
    const trace = traces[traceId as string];

    if (!trace) {
      return HttpResponse.json(
        { error: 'Trace not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      trace,
    });
  }),

  // GET /coverage - Get telemetry coverage data
  http.get(`${BASE_URL}/coverage`, () => {
    return HttpResponse.json(mockCoverageData);
  }),

  // POST /analysis/impact - Analyze impact for a node
  http.post(`${BASE_URL}/analysis/impact`, async ({ request }) => {
    const body = await request.json() as { nodeId: string; canvasId: string };
    const { nodeId, canvasId } = body;

    const key = nodeId as keyof typeof mockImpactAnalysis;
    const analysis = mockImpactAnalysis[key];

    if (!analysis) {
      // Return a default analysis if not found
      const defaultAnalysis: ImpactAnalysis = {
        nodeId,
        canvasId,
        analysis: {
          downstream: [],
          upstream: [],
          criticalPath: {
            isBottleneck: false,
            percentageOfTotal: 0,
            avgDuration: 0,
          },
          blastRadius: {
            requestsPerMinute: 0,
            affectedWorkflows: 0,
            revenueAtRisk: 0,
          },
        },
      };

      return HttpResponse.json(defaultAnalysis);
    }

    return HttpResponse.json(analysis);
  }),

  // GET /library - Get library definition
  http.get(`${BASE_URL}/library`, () => {
    // In a real implementation, this would parse library.yaml
    // For now, we'll return a hardcoded structure
    return HttpResponse.json({
      library: {
        version: '1.0',
        nodeComponents: {
          'rest-api': {
            label: 'REST API',
            description: 'HTTP REST endpoints',
            sources: ['src/api/**/*.ts', 'src/routes/**/*.ts'],
            visual: {
              shape: 'rectangle',
              color: '#1976D2',
              icon: '🌐',
            },
          },
          'business-logic': {
            label: 'Business Logic',
            description: 'Core domain logic',
            sources: ['src/business/**/*.ts', 'src/domain/**/*.ts'],
            visual: {
              shape: 'rounded-rectangle',
              color: '#388E3C',
              icon: '⚙️',
            },
          },
          'database': {
            label: 'Database',
            description: 'Data persistence layer',
            sources: ['src/db/**/*.ts', 'src/repositories/**/*.ts'],
            visual: {
              shape: 'cylinder',
              color: '#7B1FA2',
              icon: '🗄️',
            },
          },
          'external-api': {
            label: 'External API',
            description: 'Third-party API calls',
            sources: ['src/integrations/**/*.ts', 'src/external/**/*.ts'],
            visual: {
              shape: 'rounded-rectangle',
              color: '#E65100',
              icon: '🔌',
            },
          },
        },
        edgeComponents: {
          'http-call': {
            label: 'HTTP Call',
            style: 'solid',
            color: '#424242',
          },
          'event-emit': {
            label: 'Event',
            style: 'dashed',
            color: '#FF6F00',
          },
        },
      },
    });
  }),

  // GET /files/tree - Get file tree
  http.get(`${BASE_URL}/files/tree`, () => {
    return HttpResponse.json({
      tree: mockFileTree,
    });
  }),
];
