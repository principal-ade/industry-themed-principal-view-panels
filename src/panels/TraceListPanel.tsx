import React, { useState, useRef, useEffect } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { TraceList } from '../components/TraceList';
import type { TraceInfo } from '../types/otel';
import type { FileTree } from '@principal-ai/repository-abstraction';
import { LibraryDiscovery } from '@principal-ai/principal-view-core';
import { PanelFileSystemAdapter } from '../adapters/PanelFileSystemAdapter';
import yaml from 'js-yaml';

type TabView = 'traces' | 'configuration' | 'schematics';

/**
 * TraceListPanel - Panel for displaying OpenTelemetry traces
 *
 * This panel shows:
 * - Traces tab: List of traces with metadata, search/filter, click to select
 * - Configuration tab: Edit library.yaml resources (service.name, etc.) for OTEL setup
 * - Schematics tab: View workflows/scenarios from version registry
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

  // Get schematics from schematics slice
  const schematicsSlice = context.getSlice<unknown[]>('schematics');
  const schematics = schematicsSlice?.data || [];
  const schematicsLoading = schematicsSlice?.loading || false;

  // Configuration tab state
  const [resources, setResources] = useState<Record<string, string>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Library discovery state
  const [discoveredServices, setDiscoveredServices] = useState<string[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedLibraryPath, setSelectedLibraryPath] = useState<string | null>(null);

  // Load resources when switching to configuration tab
  useEffect(() => {
    if (activeTab === 'configuration') {
      loadResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Reload resources when selected service changes
  useEffect(() => {
    if (activeTab === 'configuration' && selectedServiceId) {
      loadResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceId]);

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

      // Get file tree from context
      const fileTreeSlice = context.getSlice<FileTree>('fileTree');
      const fileTree = fileTreeSlice?.data;

      if (!fileTree) {
        setConfigError('File tree not available');
        setConfigLoading(false);
        return;
      }

      // Create FileSystemAdapter for LibraryDiscovery
      const fsAdapter = new PanelFileSystemAdapter({
        fileTreeFiles: fileTree.allFiles || [],
        basePath: repositoryPath,
        readFile: context.adapters?.fileSystem?.readFile
          ? async (path: string) => {
              const content = await context.adapters!.fileSystem!.readFile(path);
              return typeof content === 'string' ? content : String(content);
            }
          : undefined,
      });

      // Use LibraryDiscovery to find all library.yaml files
      const discovery = new LibraryDiscovery(fsAdapter);
      const result = await discovery.discover(fileTree, { repositoryPath });

      console.info('[TraceListPanel] LibraryDiscovery found:', {
        libraries: result.libraries.length,
        services: result.allServiceNames,
        errors: result.errors,
      });

      // Set discovered services
      setDiscoveredServices(result.allServiceNames);

      // If there are errors, show them
      if (result.errors.length > 0) {
        console.warn('[TraceListPanel] Discovery errors:', result.errors);
      }

      // Auto-select first service if none selected
      if (!selectedServiceId && result.allServiceNames.length > 0) {
        setSelectedServiceId(result.allServiceNames[0]);
      }

      // Load resources for the selected service (or first service)
      const serviceToLoad = selectedServiceId || result.allServiceNames[0];
      if (serviceToLoad && result.libraries.length > 0) {
        // Find the library that contains this service
        const libraryForService = result.libraries.find(lib =>
          lib.serviceNames.includes(serviceToLoad)
        );

        if (libraryForService && libraryForService.library.resources) {
          // Find the service ID in resources (resources is like { "my-service": { "service.name": "my-service", ... } })
          const serviceEntry = Object.entries(libraryForService.library.resources).find(
            ([_, attrs]) => attrs['service.name'] === serviceToLoad
          );

          if (serviceEntry) {
            const [_serviceId, attrs] = serviceEntry;
            setSelectedLibraryPath(libraryForService.path);
            setResources(attrs as Record<string, string>);
            console.info('[TraceListPanel] Loaded service:', serviceToLoad, 'from', libraryForService.path);
          }
        }
      } else if (result.libraries.length === 0) {
        // No libraries found - try fallback to single .principal-views/library.yaml
        const defaultLibraryPath = `${repositoryPath}/.principal-views/library.yaml`;
        try {
          const content = await fsAdapter.readFile(defaultLibraryPath);
          const library = yaml.load(content) as { resources?: Record<string, Record<string, string>> } | null;

          if (library?.resources) {
            const firstService = Object.values(library.resources)[0];
            setResources(firstService || {});
            setSelectedLibraryPath(defaultLibraryPath);
          } else {
            setResources({});
          }
        } catch {
          // No library file exists - that's okay
          setResources({});
          setSelectedLibraryPath(null);
        }
      }

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
      const fileSystemAdapter = context.adapters?.fileSystem;

      if (!repositoryPath || !fileSystemAdapter) {
        setConfigError('Cannot save: file system adapter not available');
        setSaving(false);
        return;
      }

      // Determine which library.yaml to save to
      const libraryPath = selectedLibraryPath || `${repositoryPath}/.principal-views/library.yaml`;

      // Read existing library file
      let library: { resources?: Record<string, Record<string, string>>; [key: string]: unknown } = {
        version: '1.0.0',
        resources: {},
      };

      try {
        const content = await fileSystemAdapter.readFile(libraryPath);
        const contentStr = typeof content === 'string' ? content : String(content);
        library = (yaml.load(contentStr) as typeof library) || library;
      } catch {
        // File doesn't exist yet - use defaults
        console.info('[TraceListPanel] Creating new library.yaml at:', libraryPath);
      }

      // Ensure resources object exists
      if (!library.resources) {
        library.resources = {};
      }

      // Update the resources for the selected service
      // Resources structure: { "service-id": { "service.name": "...", "service.version": "..." } }
      if (selectedServiceId) {
        // Find existing service ID or create new one
        const existingServiceId = Object.keys(library.resources).find(
          id => library.resources![id]['service.name'] === selectedServiceId
        );
        const serviceId = existingServiceId || selectedServiceId;

        library.resources[serviceId] = resources;
      } else {
        // No service selected - use default service ID
        const serviceName = resources['service.name'] || 'default-service';
        library.resources[serviceName] = resources;
      }

      // Serialize and save
      const newContent = yaml.dump(library, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });

      await fileSystemAdapter.writeFile(libraryPath, newContent);

      setSuccessMessage('Resources saved successfully!');
      setSaving(false);

      if (events) {
        events.emit({
          type: 'library:resources-updated',
          source: 'trace-list-panel',
          timestamp: Date.now(),
          payload: { resources, serviceName: selectedServiceId || resources['service.name'] },
        });
      }

      setTimeout(() => setSuccessMessage(null), 3000);

      // Reload to refresh discovered services
      loadResources();
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
        <button
          onClick={() => setActiveTab('schematics')}
          style={{
            padding: '12px 24px',
            fontSize: '13px',
            fontWeight: 500,
            backgroundColor: activeTab === 'schematics' ? theme.colors.background : 'transparent',
            color: activeTab === 'schematics' ? theme.colors.text : theme.colors.textSecondary,
            border: 'none',
            borderBottom: activeTab === 'schematics' ? `2px solid #3b82f6` : '2px solid transparent',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          Schematics
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

              {/* Discovered Services Info */}
              {discoveredServices.length > 0 && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: theme.colors.backgroundSecondary, borderRadius: '4px', border: `1px solid ${theme.colors.border}` }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                    Discovered Services ({discoveredServices.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {discoveredServices.map(serviceName => (
                      <span
                        key={serviceName}
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: serviceName === selectedServiceId ? '#3b82f6' : theme.colors.background,
                          color: serviceName === selectedServiceId ? '#ffffff' : theme.colors.text,
                          border: `1px solid ${serviceName === selectedServiceId ? '#3b82f6' : theme.colors.border}`,
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedServiceId(serviceName)}
                      >
                        {serviceName}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: theme.colors.textSecondary }}>
                    Click a service to edit its configuration
                  </div>
                </div>
              )}

              {/* Service Selector Dropdown (if multiple services) */}
              {discoveredServices.length > 1 && (
                <div style={{ marginBottom: '16px' }}>
                  <label
                    htmlFor="service-selector"
                    style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '13px',
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Editing Service
                  </label>
                  <select
                    id="service-selector"
                    value={selectedServiceId || ''}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
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
                  >
                    {discoveredServices.map(serviceName => (
                      <option key={serviceName} value={serviceName}>
                        {serviceName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
      ) : activeTab === 'schematics' ? (
        <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          {schematicsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                Loading schematics...
              </div>
            </div>
          ) : schematics.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
              <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>
                No schematics found
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textMuted, textAlign: 'center', maxWidth: '400px' }}>
                Schematics are fetched from traces with version information (repositoryUrl + commitSha).
                Make sure traces have version attributes and schematics are registered in the version registry.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {schematics.map((schematic: any, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    backgroundColor: theme.colors.backgroundSecondary,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                      {schematic.repositoryUrl?.replace('https://github.com/', '')}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.colors.textMuted, fontFamily: theme.fonts.monospace }}>
                      {schematic.commitSha}
                    </div>
                  </div>
                  {schematic.workflows && schematic.workflows.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {schematic.workflows.map((workflow: any, wIndex: number) => (
                        <div
                          key={wIndex}
                          style={{
                            padding: '12px',
                            backgroundColor: theme.colors.background,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: '3px',
                          }}
                        >
                          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                            {workflow.name || 'Unnamed Workflow'}
                          </div>
                          {workflow.scenarios && workflow.scenarios.length > 0 && (
                            <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                              <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                                Scenarios ({workflow.scenarios.length}):
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {workflow.scenarios.map((scenario: any, sIndex: number) => (
                                  <li key={sIndex} style={{ marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 500 }}>{scenario.id}</span>
                                    {scenario.condition?.requires && scenario.condition.requires.length > 0 && (
                                      <span style={{ color: theme.colors.textMuted }}>
                                        {' '}
                                        - requires: {scenario.condition.requires.join(', ')}
                                      </span>
                                    )}
                                    {scenario.condition?.default && (
                                      <span style={{ color: theme.colors.textMuted }}> - default fallback</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>
                      No workflows found
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
