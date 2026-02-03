import React, { useState, useRef, useEffect } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { TraceList } from '../components/TraceList';
import type { TraceInfo } from '../types/otel';
import yaml from 'js-yaml';

type TabView = 'traces' | 'configuration';

/**
 * TraceListPanel - Panel for displaying OpenTelemetry traces
 *
 * This panel shows:
 * - Traces tab: List of traces with metadata, search/filter, click to select
 * - Configuration tab: Edit library.yaml resources (service.name, etc.) for OTEL setup
 *
 * Events emitted:
 * - 'trace:selected' when a trace is clicked
 * - 'library:resources-updated' when resources are saved
 */
export const TraceListPanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  usePanelFocusListener('trace-list', events, () => panelRef.current?.focus());
  const [selectedTraceId, setSelectedTraceId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<TabView>('traces');

  // Get traces from telemetry slice
  const telemetrySlice = context.getSlice<TraceInfo[]>('telemetry');
  const traces = telemetrySlice?.data || [];

  // Configuration tab state
  const [resources, setResources] = useState<Record<string, string>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load resources when switching to configuration tab
  useEffect(() => {
    if (activeTab === 'configuration') {
      loadResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadResources = async () => {
    try {
      setConfigLoading(true);
      setConfigError(null);

      const repositoryPath = context.currentScope.repository?.path;
      if (!repositoryPath) {
        setConfigError('No repository path available');
        setConfigLoading(false);
        return;
      }

      if (!context.adapters?.fileSystem || !context.adapters.fileSystem.join) {
        setConfigError('File system adapter not available');
        setConfigLoading(false);
        return;
      }

      const libraryPath = context.adapters.fileSystem.join(
        repositoryPath,
        '.principal-views',
        'library.yaml'
      );

      if (!context.adapters.fileSystem.exists(libraryPath)) {
        setResources({});
        setConfigLoading(false);
        return;
      }

      const content = await Promise.resolve(context.adapters.fileSystem.readFile(libraryPath));
      const library = yaml.load(content) as { resources?: Record<string, string> } | null;

      setResources(library?.resources || {});
      setConfigLoading(false);
    } catch (err) {
      console.error('[TraceListPanel] Failed to load resources:', err);
      setConfigError(err instanceof Error ? err.message : 'Failed to load resources');
      setConfigLoading(false);
    }
  };

  const handleSaveResources = async () => {
    try {
      setSaving(true);
      setConfigError(null);
      setSuccessMessage(null);

      const repositoryPath = context.currentScope.repository?.path;
      if (!repositoryPath || !context.adapters?.fileSystem || !context.adapters.fileSystem.join) {
        setConfigError('Cannot save: file system not available');
        setSaving(false);
        return;
      }

      const libraryPath = context.adapters.fileSystem.join(
        repositoryPath,
        '.principal-views',
        'library.yaml'
      );

      let library: { resources?: Record<string, string>; [key: string]: unknown } = {};
      if (context.adapters.fileSystem.exists(libraryPath)) {
        const content = await Promise.resolve(context.adapters.fileSystem.readFile(libraryPath));
        library = (yaml.load(content) as { resources?: Record<string, string>; [key: string]: unknown }) || {};
      }

      library.resources = resources;

      const newContent = yaml.dump(library, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });

      context.adapters.fileSystem.writeFile(libraryPath, newContent);

      setSuccessMessage('Resources saved successfully!');
      setSaving(false);

      if (events) {
        events.emit({
          type: 'library:resources-updated',
          source: 'trace-list-panel',
          timestamp: Date.now(),
          payload: { resources },
        });
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('[TraceListPanel] Failed to save resources:', err);
      setConfigError(err instanceof Error ? err.message : 'Failed to save resources');
      setSaving(false);
    }
  };

  const handleResourceChange = (key: string, value: string) => {
    setResources(prev => ({ ...prev, [key]: value }));
  };

  const handleRemoveResource = (key: string) => {
    setResources(prev => {
      const newResources = { ...prev };
      delete newResources[key];
      return newResources;
    });
  };

  const handleAddResource = () => {
    const key = prompt('Enter resource key (e.g., "service.name"):');
    if (key && key.trim()) {
      setResources(prev => ({ ...prev, [key.trim()]: '' }));
    }
  };

  const handleTraceClick = (trace: TraceInfo) => {
    setSelectedTraceId(trace.traceId);

    // Emit trace:selected event for tab manager to handle
    if (events) {
      events.emit({
        type: 'trace:selected',
        source: 'trace-list-panel',
        timestamp: Date.now(),
        payload: {
          trace,
          traceId: trace.traceId,
        },
      });
    }
  };

  const handleClearAll = () => {
    // Clear selected trace
    setSelectedTraceId(undefined);

    // Call clearTelemetry action if available
    if (actions && 'clearTelemetry' in actions && typeof actions.clearTelemetry === 'function') {
      (actions as { clearTelemetry: () => void }).clearTelemetry();
    }
  };

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      style={{
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        outline: 'none',
      }}
    >
      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundSecondary,
        }}
      >
        <button
          onClick={() => setActiveTab('traces')}
          style={{
            padding: '12px 24px',
            fontSize: '13px',
            fontWeight: 500,
            backgroundColor: activeTab === 'traces' ? theme.colors.background : 'transparent',
            color: activeTab === 'traces' ? theme.colors.text : theme.colors.textSecondary,
            border: 'none',
            borderBottom: activeTab === 'traces' ? `2px solid #3b82f6` : '2px solid transparent',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          Traces
        </button>
        <button
          onClick={() => setActiveTab('configuration')}
          style={{
            padding: '12px 24px',
            fontSize: '13px',
            fontWeight: 500,
            backgroundColor: activeTab === 'configuration' ? theme.colors.background : 'transparent',
            color: activeTab === 'configuration' ? theme.colors.text : theme.colors.textSecondary,
            border: 'none',
            borderBottom: activeTab === 'configuration' ? `2px solid #3b82f6` : '2px solid transparent',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          Configuration
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'traces' ? (
        <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          <TraceList
            traces={traces}
            theme={theme}
            onTraceClick={handleTraceClick}
            onClearAll={handleClearAll}
            selectedTraceId={selectedTraceId}
            emptyMessage={traces.length === 0 ? 'No traces received yet. Waiting for telemetry data...' : undefined}
          />
        </div>
      ) : (
        <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          {configLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                Loading resources...
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
                  Library Resources
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: theme.colors.textSecondary }}>
                  Configure OpenTelemetry and other resources in library.yaml
                </p>
              </div>

              {/* Error message */}
              {configError && (
                <div
                  style={{
                    padding: '12px',
                    marginBottom: '16px',
                    backgroundColor: '#ef444433',
                    border: '1px solid #ef4444',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#fca5a5',
                  }}
                >
                  {configError}
                </div>
              )}

              {/* Success message */}
              {successMessage && (
                <div
                  style={{
                    padding: '12px',
                    marginBottom: '16px',
                    backgroundColor: '#10b98133',
                    border: '1px solid #10b981',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#6ee7b7',
                  }}
                >
                  {successMessage}
                </div>
              )}

              {/* OTEL Configuration */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600 }}>
                  OpenTelemetry Configuration
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label
                      htmlFor="service-name"
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '13px',
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Service Name <span style={{ color: '#f59e0b' }}>*</span>
                    </label>
                    <input
                      id="service-name"
                      type="text"
                      value={resources['service.name'] || ''}
                      onChange={(e) => handleResourceChange('service.name', e.target.value)}
                      placeholder="e.g., my-service"
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '13px',
                        backgroundColor: theme.colors.backgroundSecondary,
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ marginTop: '4px', fontSize: '12px', color: theme.colors.textSecondary }}>
                      Used for trace routing in dev tools
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="service-version"
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '13px',
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Service Version
                    </label>
                    <input
                      id="service-version"
                      type="text"
                      value={resources['service.version'] || ''}
                      onChange={(e) => handleResourceChange('service.version', e.target.value)}
                      placeholder="e.g., 1.0.0"
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '13px',
                        backgroundColor: theme.colors.backgroundSecondary,
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="deployment-environment"
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '13px',
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Deployment Environment
                    </label>
                    <input
                      id="deployment-environment"
                      type="text"
                      value={resources['deployment.environment'] || ''}
                      onChange={(e) => handleResourceChange('deployment.environment', e.target.value)}
                      placeholder="e.g., development, staging, production"
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '13px',
                        backgroundColor: theme.colors.backgroundSecondary,
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Other Resources */}
              {Object.keys(resources).filter(
                key => !['service.name', 'service.version', 'deployment.environment'].includes(key)
              ).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600 }}>
                    Other Resources
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(resources)
                      .filter(([key]) => !['service.name', 'service.version', 'deployment.environment'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <label
                              style={{
                                display: 'block',
                                marginBottom: '4px',
                                fontSize: '13px',
                                color: theme.colors.textSecondary,
                              }}
                            >
                              {key}
                            </label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleResourceChange(key, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '13px',
                                backgroundColor: theme.colors.backgroundSecondary,
                                color: theme.colors.text,
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: '4px',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveResource(key)}
                            style={{
                              marginTop: '24px',
                              padding: '8px 12px',
                              fontSize: '13px',
                              backgroundColor: '#ef444433',
                              color: '#fca5a5',
                              border: '1px solid #ef4444',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={handleAddResource}
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: theme.colors.backgroundSecondary,
                    color: theme.colors.text,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '4px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  Add Resource
                </button>
                <button
                  onClick={handleSaveResources}
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={loadResources}
                  disabled={saving || configLoading}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: theme.colors.backgroundSecondary,
                    color: theme.colors.text,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '4px',
                    cursor: saving || configLoading ? 'not-allowed' : 'pointer',
                    opacity: saving || configLoading ? 0.5 : 1,
                  }}
                >
                  Reload
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
