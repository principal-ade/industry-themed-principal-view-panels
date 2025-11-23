import type { PathBasedGraphConfiguration } from '@principal-ai/visual-validation-core';
import YAML from 'js-yaml';

/**
 * Mock VVF configurations for Storybook stories
 */

export const mockSimpleConfig: PathBasedGraphConfiguration = {
  metadata: {
    name: 'Simple Service',
    version: '1.0.0',
    description: 'Basic service with API and database'
  },
  nodeTypes: {
    'api-handler': {
      shape: 'rectangle',
      icon: 'server',
      color: '#3b82f6',
      dataSchema: {},
      sources: ['src/api/**/*.ts']
    },
    'database': {
      shape: 'hexagon',
      icon: 'database',
      color: '#8b5cf6',
      dataSchema: {},
      sources: ['src/db/**/*.ts']
    },
    'logger': {
      shape: 'circle',
      icon: 'file-text',
      color: '#06b6d4',
      dataSchema: {},
      sources: ['src/logger.ts']
    }
  },
  edgeTypes: {
    'query': {
      style: 'solid',
      color: '#64748b',
      width: 2,
      directed: true
    },
    'log': {
      style: 'dashed',
      color: '#9ca3af',
      width: 1,
      directed: true
    }
  },
  allowedConnections: [
    {
      from: 'api-handler',
      to: 'database',
      via: 'query'
    },
    {
      from: 'api-handler',
      to: 'logger',
      via: 'log'
    },
    {
      from: 'database',
      to: 'logger',
      via: 'log'
    }
  ]
};

export const mockComplexConfig: PathBasedGraphConfiguration = {
  metadata: {
    name: 'Repository Traffic Controller',
    version: '2.1.0',
    description: 'GitHub webhook processing with lock management'
  },
  nodeTypes: {
    'request-handler': {
      shape: 'rectangle',
      icon: 'server',
      color: '#3b82f6',
      dataSchema: {},
      sources: ['app/handlers/**/*.ts']
    },
    'lock-manager': {
      shape: 'rectangle',
      icon: 'lock',
      color: '#8b5cf6',
      dataSchema: {},
      sources: ['lib/lock-manager.ts', 'lib/branch-aware-lock-manager.ts'],
      states: {
        idle: { color: '#94a3b8', icon: 'unlock', label: 'Idle' },
        acquired: { color: '#22c55e', icon: 'lock', label: 'Lock Held' },
        waiting: { color: '#eab308', icon: 'clock', label: 'Waiting' },
        error: { color: '#ef4444', icon: 'alert-circle', label: 'Error' }
      }
    },
    'github-api': {
      shape: 'hexagon',
      icon: 'github',
      color: '#22c55e',
      dataSchema: {},
      sources: ['lib/github-api-client.ts', 'services/github/**/*.ts']
    },
    'database': {
      shape: 'hexagon',
      icon: 'database',
      color: '#64748b',
      dataSchema: {},
      sources: ['lib/db/**/*.ts']
    }
  },
  edgeTypes: {
    'webhook-flow': {
      style: 'solid',
      color: '#3b82f6',
      width: 3,
      directed: true,
      animation: {
        type: 'flow',
        duration: 1500
      }
    },
    'lock-request': {
      style: 'dashed',
      color: '#8b5cf6',
      width: 2,
      directed: true
    },
    'api-call': {
      style: 'solid',
      color: '#22c55e',
      width: 2,
      directed: true
    },
    'db-query': {
      style: 'dashed',
      color: '#64748b',
      width: 2,
      directed: true
    }
  },
  allowedConnections: [
    {
      from: 'request-handler',
      to: 'lock-manager',
      via: 'lock-request'
    },
    {
      from: 'lock-manager',
      to: 'github-api',
      via: 'api-call'
    },
    {
      from: 'request-handler',
      to: 'github-api',
      via: 'webhook-flow'
    },
    {
      from: 'lock-manager',
      to: 'database',
      via: 'db-query'
    }
  ]
};

// Convert configs to YAML strings for mock file content
export const mockSimpleConfigYAML = YAML.dump(mockSimpleConfig);
export const mockComplexConfigYAML = YAML.dump(mockComplexConfig);

// Mock file tree with config
export const createMockFileTree = (config: 'simple' | 'complex' | 'none') => {
  const files: Array<{ path: string; relativePath: string; name: string; content?: string }> = [];

  if (config === 'simple') {
    files.push({
      path: 'vvf.config.yaml',
      relativePath: 'vvf.config.yaml',
      name: 'vvf.config.yaml',
      content: mockSimpleConfigYAML
    });
  } else if (config === 'complex') {
    files.push({
      path: 'vvf.config.yaml',
      relativePath: 'vvf.config.yaml',
      name: 'vvf.config.yaml',
      content: mockComplexConfigYAML
    });
  }

  // Add some other files for realism
  files.push(
    { path: 'src/api/index.ts', relativePath: 'src/api/index.ts', name: 'index.ts', content: '// API code' },
    { path: 'src/db/client.ts', relativePath: 'src/db/client.ts', name: 'client.ts', content: '// DB code' },
    { path: 'README.md', relativePath: 'README.md', name: 'README.md', content: '# Project' }
  );

  // Return in the expected structure with allFiles property
  return { allFiles: files };
};
