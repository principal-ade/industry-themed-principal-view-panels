/**
 * Type definitions for the demo UI
 */

export interface OTELAttribute {
  key: string;
  value: {
    stringValue?: string;
    intValue?: string | number;
    doubleValue?: number;
    boolValue?: boolean;
  };
}

export interface OTELEvent {
  timeUnixNano: string;
  name: string;
  attributes: OTELAttribute[];
}

export interface OTELStatus {
  code: 'STATUS_CODE_OK' | 'STATUS_CODE_ERROR' | 'STATUS_CODE_UNSET';
  message?: string;
}

export interface OTELSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: string;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: OTELAttribute[];
  events?: OTELEvent[];
  status: OTELStatus;
}

export interface OTELScopeSpan {
  scope: {
    name: string;
    version: string;
  };
  spans: OTELSpan[];
}

export interface OTELResourceSpan {
  resource: {
    attributes: OTELAttribute[];
  };
  scopeSpans: OTELScopeSpan[];
}

export interface OTELTrace {
  resourceSpans: OTELResourceSpan[];
}

export interface CanvasNode {
  id: string;
  nodeType: string;
  label: string;
  position: { x: number; y: number };
  pv: {
    eventRef?: string;
    otel: {
      resourceMatch: Record<string, string>;
      spanMatch: Record<string, string>;
    };
  };
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface Canvas {
  name?: string;
  description?: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export interface CanvasMetadata {
  id: string;
  path: string;
  name: string;
  type: 'otel.canvas' | 'canvas';
  parent: string | null;
  lastModified: string;
}

export interface TraceMetadata {
  traceId: string;
  timestamp: string;
  duration: number;
  status: 'success' | 'failed' | 'slow';
  serviceName: string;
  rootSpan: string;
  spanCount: number;
}

export interface LibraryNodeComponent {
  label: string;
  description: string;
  sources: string[];
  visual: {
    shape: string;
    color: string;
    icon: string;
  };
}

export interface LibraryEdgeComponent {
  label: string;
  style: string;
  color: string;
}

export interface Library {
  version: string;
  nodeComponents: Record<string, LibraryNodeComponent>;
  edgeComponents: Record<string, LibraryEdgeComponent>;
}

export interface CoverageData {
  overall: {
    expected: number;
    actual: number;
    percentage: number;
  };
  byComponent: Array<{
    type: string;
    expected: number;
    actual: number;
    percentage: number;
    missingFiles: string[];
  }>;
}

export interface ImpactAnalysis {
  nodeId: string;
  canvasId: string;
  analysis: {
    downstream: Array<{
      component: string;
      traffic: string;
      impact: 'low' | 'medium' | 'high';
      userFacing: boolean;
    }>;
    upstream: Array<{
      component: string;
      required: 'always' | 'conditional' | 'optional';
      failureRate: number;
    }>;
    criticalPath: {
      isBottleneck: boolean;
      percentageOfTotal: number;
      avgDuration: number;
    };
    blastRadius: {
      requestsPerMinute: number;
      affectedWorkflows: number;
      revenueAtRisk: number;
    };
  };
}

export interface FileTreeNode {
  path: string;
  type: 'directory' | 'file';
  hasTelemetry?: boolean;
  coveragePercentage?: number;
  children?: FileTreeNode[];
}
