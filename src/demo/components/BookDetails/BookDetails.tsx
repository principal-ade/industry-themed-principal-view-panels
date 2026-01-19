import React, { useState, useEffect } from 'react';
import type { Canvas, OTELTrace, CoverageData } from '../../data/types';
import './BookDetails.css';

interface BookDetailsProps {
  canvas: Canvas | null;
  trace: OTELTrace | null;
  traceId: string | null;
  selectedNodeId: string | null;
}

type TabType = 'timeline' | 'node' | 'events' | 'coverage';

/**
 * Book Details Component
 * Bottom panel with tabs for trace timeline, node details, events, and coverage
 */
export const BookDetails: React.FC<BookDetailsProps> = ({
  canvas,
  trace,
  traceId,
  selectedNodeId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);

  // Load coverage data
  useEffect(() => {
    fetch('/api/v1/coverage')
      .then((res) => res.json())
      .then((data) => setCoverageData(data))
      .catch((err) => console.error('Failed to load coverage:', err));
  }, []);

  const spans = trace?.resourceSpans?.[0]?.scopeSpans?.[0]?.spans || [];
  const selectedNode = canvas?.nodes.find((n) => n.id === selectedNodeId);

  const renderTimeline = () => {
    if (!trace || spans.length === 0) {
      return (
        <div className="details-empty">
          <p>No trace data available. Select a trace from the Reading Sessions.</p>
        </div>
      );
    }

    // Calculate durations
    const spanDurations = spans.map((span) => {
      const start = parseInt(span.startTimeUnixNano, 10);
      const end = parseInt(span.endTimeUnixNano, 10);
      const duration = (end - start) / 1000000; // Convert to ms
      return {
        name: span.name,
        duration: duration.toFixed(0),
        status: span.status.code,
      };
    });

    const totalDuration = spanDurations.reduce((sum, s) => sum + parseFloat(s.duration), 0);

    return (
      <div className="timeline-content">
        <div className="timeline-header">
          <h3>📖 Reading Session: {traceId?.substring(0, 16)}...</h3>
          <span className="timeline-total">Total: {totalDuration.toFixed(0)}ms</span>
        </div>
        <div className="timeline-list">
          {spanDurations.map((span, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-item-header">
                <span className="timeline-span-name">{span.name}</span>
                <span className="timeline-duration">{span.duration}ms</span>
              </div>
              <div className="timeline-bar">
                <div
                  className={`timeline-fill ${span.status === 'STATUS_CODE_OK' ? 'success' : 'error'}`}
                  style={{ width: `${(parseFloat(span.duration) / totalDuration) * 100}%` }}
                ></div>
              </div>
              {span.status !== 'STATUS_CODE_OK' && (
                <div className="timeline-error">⚠️ FAILED</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNodeDetails = () => {
    if (!selectedNode) {
      return (
        <div className="details-empty">
          <p>No node selected. Click on a node in the canvas to view details.</p>
        </div>
      );
    }

    return (
      <div className="node-details-content">
        <div className="node-details-header">
          <h3>📑 Chapter: {selectedNode.label}</h3>
          <span className="node-type-badge">{selectedNode.nodeType}</span>
        </div>
        <div className="node-details-body">
          <section className="detail-section">
            <h4>Expected Events</h4>
            <ul className="event-list">
              {selectedNode.pv.events.map((event, idx) => (
                <li key={idx}>{event.name}</li>
              ))}
            </ul>
          </section>
          <section className="detail-section">
            <h4>OTEL Matching</h4>
            <div className="otel-match-info">
              <div className="match-item">
                <span className="match-label">Service:</span>
                <code>{selectedNode.pv.otel.resourceMatch['service.name']}</code>
              </div>
              <div className="match-item">
                <span className="match-label">Span:</span>
                <code>{selectedNode.pv.otel.spanMatch.name}</code>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderEvents = () => {
    if (!trace || spans.length === 0) {
      return (
        <div className="details-empty">
          <p>No events available. Select a trace to view its events.</p>
        </div>
      );
    }

    const allEvents = spans.flatMap((span) =>
      (span.events || []).map((event) => ({
        ...event,
        spanName: span.name,
      }))
    );

    if (allEvents.length === 0) {
      return (
        <div className="details-empty">
          <p>No events recorded in this trace.</p>
        </div>
      );
    }

    return (
      <div className="events-content">
        <h3>📝 Annotations & Events</h3>
        <div className="events-list">
          {allEvents.map((event, idx) => (
            <div key={idx} className="event-item">
              <div className="event-header">
                <span className="event-name">{event.name}</span>
                <span className="event-span">in {event.spanName}</span>
              </div>
              {event.attributes && event.attributes.length > 0 && (
                <div className="event-attributes">
                  {event.attributes.map((attr, attrIdx) => (
                    <div key={attrIdx} className="event-attribute">
                      <span className="attr-key">{attr.key}:</span>
                      <span className="attr-value">
                        {JSON.stringify(Object.values(attr.value)[0])}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCoverage = () => {
    if (!coverageData) {
      return (
        <div className="details-empty">
          <p>Loading coverage data...</p>
        </div>
      );
    }

    return (
      <div className="coverage-content">
        <div className="coverage-header">
          <h3>📊 Telemetry Coverage</h3>
          <div className="coverage-overall">
            <span className="coverage-label">Overall:</span>
            <div className="coverage-badge">
              <div className="coverage-bar">
                <div
                  className="coverage-fill"
                  style={{ width: `${coverageData.overall.percentage}%` }}
                ></div>
              </div>
              <span className="coverage-percentage">{coverageData.overall.percentage}%</span>
            </div>
            <span className="coverage-files">
              {coverageData.overall.actual}/{coverageData.overall.expected} files
            </span>
          </div>
        </div>
        <div className="coverage-by-component">
          <h4>By Component:</h4>
          {coverageData.byComponent.map((component, idx) => (
            <div key={idx} className="component-coverage">
              <div className="component-header">
                <span className="component-name">{component.type}</span>
                <span className="component-percentage">{component.percentage}%</span>
              </div>
              <div className="coverage-bar">
                <div
                  className="coverage-fill"
                  style={{ width: `${component.percentage}%` }}
                ></div>
              </div>
              {component.missingFiles.length > 0 && (
                <details className="missing-files">
                  <summary>{component.missingFiles.length} missing files</summary>
                  <ul>
                    {component.missingFiles.map((file, fileIdx) => (
                      <li key={fileIdx}>{file}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="book-details">
      {/* Tabs */}
      <div className="library-tabs">
        <button
          className={`library-tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          📖 Trace Timeline
        </button>
        <button
          className={`library-tab ${activeTab === 'node' ? 'active' : ''}`}
          onClick={() => setActiveTab('node')}
        >
          📑 Node Details
        </button>
        <button
          className={`library-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          📝 Event Log
        </button>
        <button
          className={`library-tab ${activeTab === 'coverage' ? 'active' : ''}`}
          onClick={() => setActiveTab('coverage')}
        >
          📊 Coverage
        </button>
      </div>

      {/* Tab Content */}
      <div className="details-content texture-paper">
        {activeTab === 'timeline' && renderTimeline()}
        {activeTab === 'node' && renderNodeDetails()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'coverage' && renderCoverage()}
      </div>
    </div>
  );
};
