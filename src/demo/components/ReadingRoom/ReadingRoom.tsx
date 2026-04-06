import React from 'react';
import type { Canvas, OTELTrace } from '../../data/types';
import './ReadingRoom.css';

interface ReadingRoomProps {
  canvas: Canvas | null;
  trace: OTELTrace | null;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string | null;
}

/**
 * Reading Room Component
 * Main canvas view with aged paper background
 * Displays canvas diagram with optional trace overlay
 */
export const ReadingRoom: React.FC<ReadingRoomProps> = ({
  canvas,
  trace,
  onSelectNode,
  selectedNodeId,
}) => {
  if (!canvas) {
    return (
      <div className="reading-room graph-paper">
        <div className="demo-empty-state">
          <div className="demo-empty-state-icon">📖</div>
          <h2 className="demo-empty-state-title">No Canvas Selected</h2>
          <p className="demo-empty-state-description">
            Select a canvas from the Card Catalog to begin exploring your system's runtime behavior.
          </p>
        </div>
      </div>
    );
  }

  // Get trace spans if trace is available
  const spans = trace?.resourceSpans?.[0]?.scopeSpans?.[0]?.spans || [];

  // Create a map of span names to their status for highlighting
  const spanStatusMap = new Map<string, 'ok' | 'error'>();
  spans.forEach((span) => {
    const status = span.status.code === 'STATUS_CODE_OK' ? 'ok' : 'error';
    spanStatusMap.set(span.name, status);
  });

  return (
    <div className="reading-room graph-paper">
      {/* Toolbar */}
      <div className="reading-room-toolbar texture-leather">
        <div className="toolbar-section">
          <span className="toolbar-label text-gold">{canvas.name}</span>
        </div>
        <div className="toolbar-section">
          {trace && (
            <>
              <span className="toolbar-label text-gold">Trace Overlay</span>
              <span className="toolbar-info text-cream">
                {spans.length} spans
              </span>
            </>
          )}
        </div>
      </div>

      {/* Canvas Rendering Area */}
      <div className="canvas-container">
        <svg className="canvas-svg" viewBox="0 0 1000 400">
          {/* Render Edges */}
          {canvas.edges.map((edge) => {
            const fromNode = canvas.nodes.find((n) => n.id === edge.from);
            const toNode = canvas.nodes.find((n) => n.id === edge.to);

            if (!fromNode || !toNode) return null;

            const x1 = fromNode.position.x + 100; // Node width/2
            const y1 = fromNode.position.y + 30; // Node height/2
            const x2 = toNode.position.x + 100;
            const y2 = toNode.position.y + 30;

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#5D4037"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 5}
                  fontSize="10"
                  fill="#8D6E63"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {canvas.nodes.map((node) => {
            const spanStatus = spanStatusMap.get(node.pv.otel.spanMatch.name);
            const isSelected = selectedNodeId === node.id;

            let nodeClass = 'canvas-node';
            if (isSelected) nodeClass += ' selected';
            if (spanStatus === 'ok') nodeClass += ' status-success';
            if (spanStatus === 'error') nodeClass += ' status-error';

            return (
              <g
                key={node.id}
                className={nodeClass}
                onClick={() => onSelectNode(node.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Node background */}
                <rect
                  x={node.position.x}
                  y={node.position.y}
                  width="200"
                  height="60"
                  rx="8"
                  fill={isSelected ? '#8D6E63' : '#FFF8E1'}
                  stroke={spanStatus === 'error' ? '#C62828' : spanStatus === 'ok' ? '#2E7D32' : '#5D4037'}
                  strokeWidth={isSelected ? '3' : '2'}
                />

                {/* Node header */}
                <rect
                  x={node.position.x}
                  y={node.position.y}
                  width="200"
                  height="24"
                  rx="8"
                  fill={spanStatus === 'error' ? '#C62828' : spanStatus === 'ok' ? '#2E7D32' : '#5D4037'}
                />

                {/* Node type label */}
                <text
                  x={node.position.x + 10}
                  y={node.position.y + 17}
                  fontSize="11"
                  fill="#FFF8E1"
                  fontFamily="'Lato', sans-serif"
                >
                  {node.nodeType}
                </text>

                {/* Status indicator */}
                {spanStatus && (
                  <circle
                    cx={node.position.x + 185}
                    cy={node.position.y + 12}
                    r="4"
                    fill={spanStatus === 'ok' ? '#4CAF50' : '#F44336'}
                  />
                )}

                {/* Node name */}
                <text
                  x={node.position.x + 100}
                  y={node.position.y + 45}
                  fontSize="14"
                  fill="#424242"
                  fontFamily="'Source Serif Pro', serif"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#5D4037" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      {trace && (
        <div className="canvas-legend">
          <div className="legend-item">
            <div className="legend-indicator status-success"></div>
            <span>Success</span>
          </div>
          <div className="legend-item">
            <div className="legend-indicator status-error"></div>
            <span>Failed</span>
          </div>
          <div className="legend-item">
            <div className="legend-indicator"></div>
            <span>No Data</span>
          </div>
        </div>
      )}
    </div>
  );
};
