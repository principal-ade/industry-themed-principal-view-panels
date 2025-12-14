import type { ExtendedCanvas } from '@principal-ai/principal-view-core';

/**
 * Mock canvas configurations for Storybook stories
 */

export const mockSimpleCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'api-handler',
      type: 'text',
      x: 100,
      y: 150,
      width: 140,
      height: 80,
      text: 'API Handler',
      color: '#3b82f6',
      pv: {
        nodeType: 'api-handler',
        description: 'Handles incoming API requests',
        shape: 'rectangle',
        icon: 'Server',
        sources: ['src/api/**/*.ts'],
      },
    },
    {
      id: 'database',
      type: 'text',
      x: 350,
      y: 150,
      width: 120,
      height: 100,
      text: 'Database',
      color: '#8b5cf6',
      pv: {
        nodeType: 'database',
        description: 'Database storage layer',
        shape: 'hexagon',
        icon: 'Database',
        sources: ['src/db/**/*.ts'],
      },
    },
    {
      id: 'logger',
      type: 'text',
      x: 225,
      y: 320,
      width: 100,
      height: 100,
      text: 'Logger',
      color: '#06b6d4',
      pv: {
        nodeType: 'logger',
        description: 'Logging service',
        shape: 'circle',
        icon: 'FileText',
        sources: ['src/logger.ts'],
      },
    },
  ],
  edges: [
    {
      id: 'edge-api-db',
      fromNode: 'api-handler',
      toNode: 'database',
      pv: { edgeType: 'query' },
    },
    {
      id: 'edge-api-logger',
      fromNode: 'api-handler',
      toNode: 'logger',
      pv: { edgeType: 'log' },
    },
    {
      id: 'edge-db-logger',
      fromNode: 'database',
      toNode: 'logger',
      pv: { edgeType: 'log' },
    },
  ],
  pv: {
    name: 'Simple Service',
    version: '1.0.0',
    description: 'Basic service with API and database',
    edgeTypes: {
      query: {
        style: 'solid',
        color: '#64748b',
        width: 2,
        directed: true,
      },
      log: {
        style: 'dashed',
        color: '#9ca3af',
        width: 1,
        directed: true,
      },
    },
  },
};

export const mockControlTowerCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'server',
      type: 'text',
      x: 500,
      y: 300,
      width: 200,
      height: 120,
      text: 'Server',
      color: '#8b5cf6',
      pv: {
        nodeType: 'server',
        description: 'Central server component',
        shape: 'rectangle',
        icon: 'Server',
        sources: ['src/server/BaseServer.ts', 'src/server/ServerBuilder.ts'],
      },
    },
    {
      id: 'client-a',
      type: 'text',
      x: 50,
      y: 100,
      width: 120,
      height: 120,
      text: 'Client A',
      color: '#3b82f6',
      pv: {
        nodeType: 'client',
        description: 'Client connection',
        shape: 'circle',
        icon: 'User',
        sources: ['src/client/BaseClient.ts'],
      },
    },
    {
      id: 'transport',
      type: 'text',
      x: 250,
      y: 300,
      width: 140,
      height: 140,
      text: 'Transport',
      color: '#06b6d4',
      pv: {
        nodeType: 'transport',
        description: 'Transport layer adapter',
        shape: 'diamond',
        icon: 'Radio',
        sources: ['src/adapters/websocket/WebSocketServerTransportAdapter.ts'],
      },
    },
    {
      id: 'room-manager',
      type: 'text',
      x: 800,
      y: 50,
      width: 150,
      height: 130,
      text: 'Room Manager',
      color: '#22c55e',
      pv: {
        nodeType: 'room-manager',
        description: 'Manages room subscriptions',
        shape: 'hexagon',
        icon: 'Users',
        sources: ['src/abstractions/DefaultRoomManager.ts'],
      },
    },
    {
      id: 'lock-manager',
      type: 'text',
      x: 800,
      y: 300,
      width: 150,
      height: 130,
      text: 'Lock Manager',
      color: '#f59e0b',
      pv: {
        nodeType: 'lock-manager',
        description: 'Manages distributed locks',
        shape: 'hexagon',
        icon: 'Lock',
        sources: ['src/abstractions/DefaultLockManager.ts'],
      },
    },
    {
      id: 'presence-manager',
      type: 'text',
      x: 800,
      y: 550,
      width: 150,
      height: 130,
      text: 'Presence Manager',
      color: '#ec4899',
      pv: {
        nodeType: 'presence-manager',
        description: 'Tracks user presence',
        shape: 'hexagon',
        icon: 'Activity',
        sources: ['src/abstractions/DefaultPresenceManager.ts'],
      },
    },
    {
      id: 'auth',
      type: 'text',
      x: 500,
      y: 550,
      width: 130,
      height: 90,
      text: 'Auth',
      color: '#ef4444',
      pv: {
        nodeType: 'auth',
        description: 'Authentication adapter',
        shape: 'rectangle',
        icon: 'Shield',
        sources: ['src/abstractions/AuthAdapter.ts'],
      },
    },
  ],
  edges: [
    { id: 'edge-client-transport', fromNode: 'client-a', toNode: 'transport', pv: { edgeType: 'websocket-connection' } },
    { id: 'edge-transport-server', fromNode: 'transport', toNode: 'server', pv: { edgeType: 'websocket-connection' } },
    { id: 'edge-server-auth', fromNode: 'server', toNode: 'auth', pv: { edgeType: 'auth-flow' } },
    { id: 'edge-server-room', fromNode: 'server', toNode: 'room-manager', pv: { edgeType: 'service-call' } },
    { id: 'edge-server-lock', fromNode: 'server', toNode: 'lock-manager', pv: { edgeType: 'service-call' } },
    { id: 'edge-server-presence', fromNode: 'server', toNode: 'presence-manager', pv: { edgeType: 'service-call' } },
    { id: 'edge-client-room', fromNode: 'client-a', toNode: 'room-manager', pv: { edgeType: 'room-flow' } },
    { id: 'edge-client-lock', fromNode: 'client-a', toNode: 'lock-manager', pv: { edgeType: 'lock-flow' } },
    { id: 'edge-client-presence', fromNode: 'client-a', toNode: 'presence-manager', pv: { edgeType: 'presence-flow' } },
  ],
  pv: {
    name: 'Control Tower Core - Client-Server Demo',
    version: '0.1.19',
    description: 'Alpha testing: Server with two client connections',
    edgeTypes: {
      'websocket-connection': {
        style: 'solid',
        color: '#3b82f6',
        width: 3,
        directed: true,
        animation: { type: 'flow', duration: 1500, color: '#60a5fa' },
      },
      'auth-flow': {
        style: 'dotted',
        color: '#ef4444',
        width: 2,
        directed: true,
        animation: { type: 'particle', duration: 1000, color: '#f87171' },
      },
      'room-flow': {
        style: 'solid',
        color: '#22c55e',
        width: 2,
        directed: true,
        animation: { type: 'particle', duration: 2000, color: '#4ade80' },
      },
      'lock-flow': {
        style: 'dashed',
        color: '#f59e0b',
        width: 2,
        directed: true,
        animation: { type: 'flow', duration: 2000, color: '#fbbf24' },
      },
      'presence-flow': {
        style: 'dotted',
        color: '#ec4899',
        width: 2,
        directed: true,
        animation: { type: 'pulse', duration: 1500, color: '#f472b6' },
      },
      'service-call': {
        style: 'solid',
        color: '#64748b',
        width: 2,
        directed: true,
      },
    },
  },
};

export const mockComplexCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'request-handler',
      type: 'text',
      x: 100,
      y: 200,
      width: 160,
      height: 80,
      text: 'Request Handler',
      color: '#3b82f6',
      pv: {
        nodeType: 'request-handler',
        description: 'Handles incoming requests',
        shape: 'rectangle',
        icon: 'Server',
        sources: ['app/handlers/**/*.ts'],
      },
    },
    {
      id: 'lock-manager',
      type: 'text',
      x: 350,
      y: 100,
      width: 150,
      height: 80,
      text: 'Lock Manager',
      color: '#8b5cf6',
      pv: {
        nodeType: 'lock-manager',
        description: 'Manages repository locks',
        shape: 'rectangle',
        icon: 'Lock',
        sources: ['lib/lock-manager.ts', 'lib/branch-aware-lock-manager.ts'],
        states: {
          idle: { color: '#94a3b8', icon: 'Unlock', label: 'Idle' },
          acquired: { color: '#22c55e', icon: 'Lock', label: 'Lock Held' },
          waiting: { color: '#eab308', icon: 'Clock', label: 'Waiting' },
          error: { color: '#ef4444', icon: 'AlertCircle', label: 'Error' },
        },
      },
    },
    {
      id: 'github-api',
      type: 'text',
      x: 600,
      y: 200,
      width: 140,
      height: 100,
      text: 'GitHub API',
      color: '#22c55e',
      pv: {
        nodeType: 'github-api',
        description: 'GitHub API client',
        shape: 'hexagon',
        icon: 'Github',
        sources: ['lib/github-api-client.ts', 'services/github/**/*.ts'],
      },
    },
    {
      id: 'database',
      type: 'text',
      x: 350,
      y: 350,
      width: 140,
      height: 100,
      text: 'Database',
      color: '#64748b',
      pv: {
        nodeType: 'database',
        description: 'Database storage',
        shape: 'hexagon',
        icon: 'Database',
        sources: ['lib/db/**/*.ts'],
      },
    },
  ],
  edges: [
    { id: 'edge-handler-lock', fromNode: 'request-handler', toNode: 'lock-manager', pv: { edgeType: 'lock-request' } },
    { id: 'edge-lock-github', fromNode: 'lock-manager', toNode: 'github-api', pv: { edgeType: 'api-call' } },
    { id: 'edge-handler-github', fromNode: 'request-handler', toNode: 'github-api', pv: { edgeType: 'webhook-flow' } },
    { id: 'edge-lock-db', fromNode: 'lock-manager', toNode: 'database', pv: { edgeType: 'db-query' } },
  ],
  pv: {
    name: 'Repository Traffic Controller',
    version: '2.1.0',
    description: 'GitHub webhook processing with lock management',
    edgeTypes: {
      'webhook-flow': {
        style: 'solid',
        color: '#3b82f6',
        width: 3,
        directed: true,
        animation: { type: 'flow', duration: 1500 },
      },
      'lock-request': {
        style: 'dashed',
        color: '#8b5cf6',
        width: 2,
        directed: true,
      },
      'api-call': {
        style: 'solid',
        color: '#22c55e',
        width: 2,
        directed: true,
      },
      'db-query': {
        style: 'dashed',
        color: '#64748b',
        width: 2,
        directed: true,
      },
    },
  },
};

/**
 * Mock canvas demonstrating pv.fill and pv.stroke color properties
 * This shows the new color system where each node can have distinct fill and stroke colors
 */
export const mockNodeColorsCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'pkg-core',
      type: 'text',
      x: 100,
      y: 100,
      width: 180,
      height: 80,
      text: '@app/core',
      pv: {
        nodeType: 'package',
        description: 'Core package',
        shape: 'rectangle',
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        icon: 'Package',
      },
    },
    {
      id: 'pkg-api',
      type: 'text',
      x: 350,
      y: 100,
      width: 180,
      height: 80,
      text: '@app/api',
      pv: {
        nodeType: 'package',
        description: 'API package',
        shape: 'rectangle',
        fill: '#8b5cf6',
        stroke: '#6d28d9',
        icon: 'Package',
      },
    },
    {
      id: 'component-button',
      type: 'text',
      x: 100,
      y: 250,
      width: 150,
      height: 80,
      text: 'Button',
      pv: {
        nodeType: 'component',
        description: 'React component',
        shape: 'rectangle',
        fill: '#10b981',
        stroke: '#047857',
        icon: 'Component',
      },
    },
    {
      id: 'hook-auth',
      type: 'text',
      x: 300,
      y: 250,
      width: 150,
      height: 80,
      text: 'useAuth',
      pv: {
        nodeType: 'hook',
        description: 'React hook',
        shape: 'circle',
        fill: '#06b6d4',
        stroke: '#0891b2',
        icon: 'Anchor',
      },
    },
    {
      id: 'util-format',
      type: 'text',
      x: 500,
      y: 250,
      width: 150,
      height: 80,
      text: 'formatDate',
      pv: {
        nodeType: 'utility',
        description: 'Utility function',
        shape: 'diamond',
        fill: '#f59e0b',
        stroke: '#d97706',
        icon: 'Wrench',
      },
    },
    {
      id: 'type-user',
      type: 'text',
      x: 200,
      y: 400,
      width: 150,
      height: 80,
      text: 'User',
      pv: {
        nodeType: 'type-def',
        description: 'Type definition',
        shape: 'hexagon',
        fill: '#ec4899',
        stroke: '#db2777',
        icon: 'FileType',
      },
    },
    {
      id: 'ext-lodash',
      type: 'text',
      x: 400,
      y: 400,
      width: 150,
      height: 80,
      text: 'lodash',
      pv: {
        nodeType: 'external-dep',
        description: 'External dependency',
        shape: 'rectangle',
        fill: '#6b7280',
        stroke: '#4b5563',
        icon: 'ExternalLink',
      },
    },
  ],
  edges: [
    { id: 'edge-core-api', fromNode: 'pkg-core', toNode: 'pkg-api', pv: { edgeType: 'dependency' } },
    { id: 'edge-core-button', fromNode: 'pkg-core', toNode: 'component-button', pv: { edgeType: 'exports' } },
    { id: 'edge-api-auth', fromNode: 'pkg-api', toNode: 'hook-auth', pv: { edgeType: 'exports' } },
    { id: 'edge-api-format', fromNode: 'pkg-api', toNode: 'util-format', pv: { edgeType: 'exports' } },
    { id: 'edge-auth-user', fromNode: 'hook-auth', toNode: 'type-user', pv: { edgeType: 'uses-type' } },
    { id: 'edge-format-lodash', fromNode: 'util-format', toNode: 'ext-lodash', pv: { edgeType: 'imports' } },
  ],
  pv: {
    name: 'Code City - Node Colors Demo',
    version: '1.0.0',
    description: 'Demonstrates pv.fill and pv.stroke color properties for different node types',
    edgeTypes: {
      dependency: {
        style: 'solid',
        color: '#64748b',
        width: 2,
        directed: true,
      },
      exports: {
        style: 'solid',
        color: '#22c55e',
        width: 2,
        directed: true,
      },
      imports: {
        style: 'dashed',
        color: '#f59e0b',
        width: 2,
        directed: true,
      },
      'uses-type': {
        style: 'dotted',
        color: '#ec4899',
        width: 1,
        directed: true,
      },
    },
  },
};

/**
 * Mock canvas with mixed color sources for testing priority
 * Tests: pv.fill > node.color > default
 * Each node uses a unique nodeType to ensure independent color testing
 */
export const mockColorPriorityCanvas: ExtendedCanvas = {
  nodes: [
    {
      id: 'node-pv-fill',
      type: 'text',
      x: 100,
      y: 100,
      width: 180,
      height: 80,
      text: 'pv.fill + pv.stroke',
      color: '#ff0000', // This should be ignored because pv.fill is set
      pv: {
        nodeType: 'service-with-fill',
        description: 'Service with pv.fill',
        shape: 'rectangle',
        fill: '#3b82f6', // Blue - should be used
        stroke: '#1d4ed8', // Darker blue
        icon: 'Server',
      },
    },
    {
      id: 'node-canvas-color',
      type: 'text',
      x: 350,
      y: 100,
      width: 180,
      height: 80,
      text: 'node.color only',
      color: '#22c55e', // Green - should be used as fill
      pv: {
        nodeType: 'service-canvas-color',
        description: 'Service with canvas color',
        shape: 'rectangle',
        // No fill/stroke - uses node.color
        icon: 'Server',
      },
    },
    {
      id: 'node-no-color',
      type: 'text',
      x: 600,
      y: 100,
      width: 180,
      height: 80,
      text: 'No color (gray)',
      // No color property - should show default gray #888
      pv: {
        nodeType: 'service-no-color',
        description: 'Service with no color',
        shape: 'rectangle',
        // No fill/stroke - uses default gray
        icon: 'Server',
      },
    },
    {
      id: 'node-stroke-only',
      type: 'text',
      x: 100,
      y: 250,
      width: 180,
      height: 80,
      text: 'pv.stroke only',
      pv: {
        nodeType: 'database',
        description: 'Database with stroke only',
        shape: 'hexagon',
        // No fill - stroke will be used for both
        stroke: '#8b5cf6',
        icon: 'Database',
      },
    },
    {
      id: 'node-shapes-circle',
      type: 'text',
      x: 350,
      y: 250,
      width: 100,
      height: 100,
      text: 'Circle',
      pv: {
        nodeType: 'endpoint',
        description: 'Circle-shaped endpoint',
        shape: 'circle',
        fill: '#06b6d4',
        stroke: '#0891b2',
        icon: 'Circle',
      },
    },
    {
      id: 'node-shapes-diamond',
      type: 'text',
      x: 520,
      y: 250,
      width: 100,
      height: 100,
      text: 'Diamond',
      pv: {
        nodeType: 'decision',
        description: 'Diamond-shaped decision',
        shape: 'diamond',
        fill: '#f59e0b',
        stroke: '#d97706',
        icon: 'HelpCircle',
      },
    },
  ],
  edges: [
    { id: 'e1', fromNode: 'node-pv-fill', toNode: 'node-canvas-color', pv: { edgeType: 'flow' } },
    { id: 'e2', fromNode: 'node-canvas-color', toNode: 'node-no-color', pv: { edgeType: 'flow' } },
    { id: 'e3', fromNode: 'node-pv-fill', toNode: 'node-stroke-only', pv: { edgeType: 'flow' } },
    { id: 'e4', fromNode: 'node-stroke-only', toNode: 'node-shapes-circle', pv: { edgeType: 'flow' } },
    { id: 'e5', fromNode: 'node-shapes-circle', toNode: 'node-shapes-diamond', pv: { edgeType: 'flow' } },
  ],
  pv: {
    name: 'Color Priority Test',
    version: '1.0.0',
    description: 'Tests color priority: pv.fill > node.color > default',
    edgeTypes: {
      flow: {
        style: 'solid',
        color: '#64748b',
        width: 2,
        directed: true,
      },
    },
  },
};

// Convert canvas to JSON strings for mock file content
export const mockSimpleCanvasJSON = JSON.stringify(mockSimpleCanvas, null, 2);
export const mockComplexCanvasJSON = JSON.stringify(mockComplexCanvas, null, 2);
export const mockControlTowerCanvasJSON = JSON.stringify(mockControlTowerCanvas, null, 2);
export const mockNodeColorsCanvasJSON = JSON.stringify(mockNodeColorsCanvas, null, 2);
export const mockColorPriorityCanvasJSON = JSON.stringify(mockColorPriorityCanvas, null, 2);

// Mock file tree with canvas files using .principal-views/ folder structure
export const createMockFileTree = (config: 'simple' | 'complex' | 'control-tower' | 'node-colors' | 'color-priority' | 'none') => {
  const files: Array<{ path: string; relativePath: string; name: string; content?: string }> = [];

  if (config === 'simple') {
    files.push({
      path: '.principal-views/simple-service.canvas',
      relativePath: '.principal-views/simple-service.canvas',
      name: 'simple-service.canvas',
      content: mockSimpleCanvasJSON,
    });
  } else if (config === 'complex') {
    files.push({
      path: '.principal-views/traffic-controller.canvas',
      relativePath: '.principal-views/traffic-controller.canvas',
      name: 'traffic-controller.canvas',
      content: mockComplexCanvasJSON,
    });
  } else if (config === 'control-tower') {
    files.push({
      path: '.principal-views/control-tower.canvas',
      relativePath: '.principal-views/control-tower.canvas',
      name: 'control-tower.canvas',
      content: mockControlTowerCanvasJSON,
    });
  } else if (config === 'node-colors') {
    files.push({
      path: '.principal-views/node-colors.canvas',
      relativePath: '.principal-views/node-colors.canvas',
      name: 'node-colors.canvas',
      content: mockNodeColorsCanvasJSON,
    });
  } else if (config === 'color-priority') {
    files.push({
      path: '.principal-views/color-priority.canvas',
      relativePath: '.principal-views/color-priority.canvas',
      name: 'color-priority.canvas',
      content: mockColorPriorityCanvasJSON,
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
