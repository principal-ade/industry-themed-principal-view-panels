import React, { useState, useEffect } from 'react';
import type { CanvasMetadata, TraceMetadata } from '../../data/types';
import './CardCatalog.css';

interface CardCatalogProps {
  onSelectCanvas: (canvasId: string) => void;
  onSelectTrace: (traceId: string) => void;
  selectedCanvasId: string | null;
  selectedTraceId: string | null;
}

/**
 * Card Catalog Component
 * Left sidebar with file tree navigation for canvases and traces
 * Styled like a wooden card catalog with drawer sections
 */
export const CardCatalog: React.FC<CardCatalogProps> = ({
  onSelectCanvas,
  onSelectTrace,
  selectedCanvasId,
  selectedTraceId,
}) => {
  const [canvases, setCanvases] = useState<CanvasMetadata[]>([]);
  const [traces, setTraces] = useState<TraceMetadata[]>([]);
  const [canvasesExpanded, setCanvasesExpanded] = useState(true);
  const [tracesExpanded, setTracesExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load canvases
    fetch('/api/v1/canvases')
      .then((res) => res.json())
      .then((data) => {
        setCanvases(data.canvases);
      })
      .catch((err) => console.error('Failed to load canvases:', err));

    // Load traces
    fetch('/api/v1/traces')
      .then((res) => res.json())
      .then((data) => {
        setTraces(data.traces);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load traces:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="card-catalog">
        <div className="catalog-loading">
          <div className="demo-loading-spinner"></div>
          <p>Loading library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-catalog">
      {/* Canvases Section */}
      <section className="catalog-section">
        <button
          className="catalog-drawer-header"
          onClick={() => setCanvasesExpanded(!canvasesExpanded)}
        >
          <span className="drawer-icon">{canvasesExpanded ? '📖' : '📕'}</span>
          <span className="drawer-label">Library Canvases</span>
          <span className="drawer-toggle">{canvasesExpanded ? '▼' : '▶'}</span>
        </button>

        {canvasesExpanded && (
          <div className="catalog-drawer-content">
            {canvases.length === 0 ? (
              <div className="catalog-empty">No canvases found</div>
            ) : (
              canvases.map((canvas) => (
                <button
                  key={canvas.id}
                  className={`catalog-item book-card-mini ${
                    selectedCanvasId === canvas.id ? 'selected bookmark-ribbon' : ''
                  }`}
                  onClick={() => onSelectCanvas(canvas.id)}
                >
                  <div className="catalog-item-icon">
                    {canvas.type === 'otel.canvas' ? '📚' : '📄'}
                  </div>
                  <div className="catalog-item-details">
                    <div className="catalog-item-name">{canvas.name}</div>
                    <div className="catalog-item-type">{canvas.type}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      {/* Traces Section */}
      <section className="catalog-section">
        <button
          className="catalog-drawer-header"
          onClick={() => setTracesExpanded(!tracesExpanded)}
        >
          <span className="drawer-icon">{tracesExpanded ? '🔖' : '📑'}</span>
          <span className="drawer-label">Reading Sessions</span>
          <span className="drawer-toggle">{tracesExpanded ? '▼' : '▶'}</span>
        </button>

        {tracesExpanded && (
          <div className="catalog-drawer-content">
            {traces.length === 0 ? (
              <div className="catalog-empty">No traces found</div>
            ) : (
              traces.map((trace) => (
                <button
                  key={trace.traceId}
                  className={`catalog-item trace-card-mini ${
                    selectedTraceId === trace.traceId ? 'selected bookmark-ribbon' : ''
                  }`}
                  onClick={() => onSelectTrace(trace.traceId)}
                >
                  <div className="catalog-item-icon">
                    <span
                      className={`status-dot ${trace.status}`}
                    ></span>
                  </div>
                  <div className="catalog-item-details">
                    <div className="catalog-item-name">
                      {trace.traceId.substring(0, 12)}...
                    </div>
                    <div className="catalog-item-meta">
                      <span className="trace-duration">{trace.duration}ms</span>
                      <span className="trace-status">{trace.status}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      {/* File Tree Section (Future Enhancement) */}
      <section className="catalog-section">
        <button className="catalog-drawer-header" disabled>
          <span className="drawer-icon">📁</span>
          <span className="drawer-label">Source Files</span>
          <span className="drawer-toggle">▶</span>
        </button>
      </section>
    </div>
  );
};
