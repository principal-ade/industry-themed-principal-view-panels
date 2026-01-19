import React, { useState, useEffect } from 'react';
import { CardCatalog } from './components/CardCatalog/CardCatalog';
import { ReadingRoom } from './components/ReadingRoom/ReadingRoom';
import { BookDetails } from './components/BookDetails/BookDetails';
import './styles/library-theme.css';
import './styles/demo-layout.css';
import type { Canvas, OTELTrace } from './data/types';

/**
 * Main Demo Application Component
 * Implements the three-panel library layout:
 * 1. Card Catalog (left sidebar) - File tree navigation
 * 2. Reading Room (center) - Main canvas view
 * 3. Book Details (bottom) - Details panel with tabs
 */
export const DemoApp: React.FC = () => {
  const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null);
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<OTELTrace | null>(null);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load canvas when selected
  useEffect(() => {
    if (selectedCanvasId) {
      fetch(`/api/v1/canvases/${selectedCanvasId}`)
        .then((res) => res.json())
        .then((data) => setSelectedCanvas(data.canvas))
        .catch((err) => console.error('Failed to load canvas:', err));
    }
  }, [selectedCanvasId]);

  // Load trace when selected
  useEffect(() => {
    if (selectedTraceId) {
      fetch(`/api/v1/traces/${selectedTraceId}`)
        .then((res) => res.json())
        .then((data) => setSelectedTrace(data.trace))
        .catch((err) => console.error('Failed to load trace:', err));
    }
  }, [selectedTraceId]);

  return (
    <div className="demo-library demo-app">
      {/* Header */}
      <header className="demo-header texture-leather">
        <div className="demo-header-content">
          <h1 className="demo-title">📚 Principal View Library</h1>
          <div className="demo-header-actions">
            <button
              className="library-button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
            >
              {sidebarCollapsed ? '☰' : '×'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="demo-layout">
        {/* Left Sidebar - Card Catalog */}
        {!sidebarCollapsed && (
          <aside className="demo-sidebar texture-leather">
            <CardCatalog
              onSelectCanvas={(canvasId) => setSelectedCanvasId(canvasId)}
              onSelectTrace={(traceId) => setSelectedTraceId(traceId)}
              selectedCanvasId={selectedCanvasId}
              selectedTraceId={selectedTraceId}
            />
          </aside>
        )}

        {/* Center - Reading Room */}
        <main
          className={`demo-main-content ${sidebarCollapsed ? 'full-width' : ''}`}
        >
          <ReadingRoom
            canvas={selectedCanvas}
            trace={selectedTrace}
            onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
            selectedNodeId={selectedNodeId}
          />
        </main>
      </div>

      {/* Bottom Panel - Book Details */}
      <div className="demo-bottom-panel">
        <BookDetails
          canvas={selectedCanvas}
          canvasId={selectedCanvasId}
          trace={selectedTrace}
          traceId={selectedTraceId}
          selectedNodeId={selectedNodeId}
        />
      </div>
    </div>
  );
};

export default DemoApp;
