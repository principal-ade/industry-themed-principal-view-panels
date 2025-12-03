import type { ExtendedCanvas } from '@principal-ai/visual-validation-core';

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
      vv: {
        nodeType: 'api-handler',
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
      vv: {
        nodeType: 'database',
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
      vv: {
        nodeType: 'logger',
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
      vv: { edgeType: 'query' },
    },
    {
      id: 'edge-api-logger',
      fromNode: 'api-handler',
      toNode: 'logger',
      vv: { edgeType: 'log' },
    },
    {
      id: 'edge-db-logger',
      fromNode: 'database',
      toNode: 'logger',
      vv: { edgeType: 'log' },
    },
  ],
  vv: {
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
      vv: {
        nodeType: 'server',
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
      vv: {
        nodeType: 'client',
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
      vv: {
        nodeType: 'transport',
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
      vv: {
        nodeType: 'room-manager',
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
      vv: {
        nodeType: 'lock-manager',
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
      vv: {
        nodeType: 'presence-manager',
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
      vv: {
        nodeType: 'auth',
        shape: 'rectangle',
        icon: 'Shield',
        sources: ['src/abstractions/AuthAdapter.ts'],
      },
    },
  ],
  edges: [
    { id: 'edge-client-transport', fromNode: 'client-a', toNode: 'transport', vv: { edgeType: 'websocket-connection' } },
    { id: 'edge-transport-server', fromNode: 'transport', toNode: 'server', vv: { edgeType: 'websocket-connection' } },
    { id: 'edge-server-auth', fromNode: 'server', toNode: 'auth', vv: { edgeType: 'auth-flow' } },
    { id: 'edge-server-room', fromNode: 'server', toNode: 'room-manager', vv: { edgeType: 'service-call' } },
    { id: 'edge-server-lock', fromNode: 'server', toNode: 'lock-manager', vv: { edgeType: 'service-call' } },
    { id: 'edge-server-presence', fromNode: 'server', toNode: 'presence-manager', vv: { edgeType: 'service-call' } },
    { id: 'edge-client-room', fromNode: 'client-a', toNode: 'room-manager', vv: { edgeType: 'room-flow' } },
    { id: 'edge-client-lock', fromNode: 'client-a', toNode: 'lock-manager', vv: { edgeType: 'lock-flow' } },
    { id: 'edge-client-presence', fromNode: 'client-a', toNode: 'presence-manager', vv: { edgeType: 'presence-flow' } },
  ],
  vv: {
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
      vv: {
        nodeType: 'request-handler',
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
      vv: {
        nodeType: 'lock-manager',
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
      vv: {
        nodeType: 'github-api',
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
      vv: {
        nodeType: 'database',
        shape: 'hexagon',
        icon: 'Database',
        sources: ['lib/db/**/*.ts'],
      },
    },
  ],
  edges: [
    { id: 'edge-handler-lock', fromNode: 'request-handler', toNode: 'lock-manager', vv: { edgeType: 'lock-request' } },
    { id: 'edge-lock-github', fromNode: 'lock-manager', toNode: 'github-api', vv: { edgeType: 'api-call' } },
    { id: 'edge-handler-github', fromNode: 'request-handler', toNode: 'github-api', vv: { edgeType: 'webhook-flow' } },
    { id: 'edge-lock-db', fromNode: 'lock-manager', toNode: 'database', vv: { edgeType: 'db-query' } },
  ],
  vv: {
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

// Convert canvas to JSON strings for mock file content
export const mockSimpleCanvasJSON = JSON.stringify(mockSimpleCanvas, null, 2);
export const mockComplexCanvasJSON = JSON.stringify(mockComplexCanvas, null, 2);
export const mockControlTowerCanvasJSON = JSON.stringify(mockControlTowerCanvas, null, 2);

// Mock file tree with canvas files using .vgc/ folder structure
export const createMockFileTree = (config: 'simple' | 'complex' | 'control-tower' | 'none') => {
  const files: Array<{ path: string; relativePath: string; name: string; content?: string }> = [];

  if (config === 'simple') {
    files.push({
      path: '.vgc/simple-service.canvas',
      relativePath: '.vgc/simple-service.canvas',
      name: 'simple-service.canvas',
      content: mockSimpleCanvasJSON,
    });
  } else if (config === 'complex') {
    files.push({
      path: '.vgc/traffic-controller.canvas',
      relativePath: '.vgc/traffic-controller.canvas',
      name: 'traffic-controller.canvas',
      content: mockComplexCanvasJSON,
    });
  } else if (config === 'control-tower') {
    files.push({
      path: '.vgc/control-tower.canvas',
      relativePath: '.vgc/control-tower.canvas',
      name: 'control-tower.canvas',
      content: mockControlTowerCanvasJSON,
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
