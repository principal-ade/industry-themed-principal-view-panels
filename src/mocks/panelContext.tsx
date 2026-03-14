import React, { useMemo } from 'react';
import type {
  PanelComponentProps,
  PanelContextValue,
  PanelActions,
  PanelEventEmitter,
  PanelEvent,
  PanelEventType,
  DataSlice,
} from '../types';
import type { GitStatusWithFiles } from '@principal-ai/repository-abstraction';

/**
 * Mock Git Status data for Storybook
 * Matches GitStatusWithFiles from @principal-ai/repository-abstraction
 * This is what electron-app provides to panels in production
 */
const mockGitStatusData: GitStatusWithFiles = {
  // Metadata fields (from GitStatusMetadata)
  repoPath: '/Users/developer/my-project',
  branch: 'main',
  isDirty: true,
  hasUntracked: true,
  hasStaged: true,
  ahead: 0,
  behind: 0,
  watchingEnabled: true,
  lastChangedAt: new Date().toISOString(),

  // File lists (with correct field names from GitStatusWithFiles)
  modifiedFiles: ['README.md', 'package.json'], // was: unstaged
  untrackedFiles: ['src/new-feature.tsx'], // was: untracked
  stagedFiles: ['src/components/Button.tsx', 'src/styles/theme.css'], // was: staged
  createdFiles: ['src/new-feature.tsx'], // new field - subset of untracked
  deletedFiles: [], // was: deleted

  // Hash for React memoization
  hash: 'mock-hash-abc123def456',
};

/**
 * Create a mock DataSlice
 */
const createMockSlice = <T,>(
  name: string,
  data: T,
  scope: 'workspace' | 'repository' | 'global' = 'repository'
): DataSlice<T> => ({
  scope,
  name,
  data,
  loading: false,
  error: null,
  refresh: async () => {
    console.log(`[Mock] Refreshing slice: ${name}`);
  },
});

/**
 * Mock Panel Context for Storybook
 * Provides typed slice properties for direct access
 */
export const createMockContext = <T extends PanelContextValue = PanelContextValue>(
  overrides?: Partial<T>
): T => {
  // Create mock data slices
  const mockSlices = new Map<string, DataSlice>([
    ['git', createMockSlice('git', mockGitStatusData)],
    [
      'markdown',
      createMockSlice('markdown', [
        {
          path: 'README.md',
          title: 'Project README',
          lastModified: Date.now() - 3600000,
        },
        {
          path: 'docs/API.md',
          title: 'API Documentation',
          lastModified: Date.now() - 86400000,
        },
      ]),
    ],
    [
      'fileTree',
      createMockSlice('fileTree', {
        name: 'my-project',
        path: '/Users/developer/my-project',
        type: 'directory',
        children: [
          {
            name: 'src',
            path: '/Users/developer/my-project/src',
            type: 'directory',
          },
          {
            name: 'package.json',
            path: '/Users/developer/my-project/package.json',
            type: 'file',
          },
        ],
        allFiles: [
          '/Users/developer/my-project/package.json',
          '/Users/developer/my-project/src/index.ts',
        ],
      }),
    ],
    [
      'packages',
      createMockSlice('packages', [
        { name: 'react', version: '19.0.0', path: '/node_modules/react' },
        {
          name: 'typescript',
          version: '5.0.4',
          path: '/node_modules/typescript',
        },
      ]),
    ],
    [
      'quality',
      createMockSlice('quality', {
        coverage: 85,
        issues: 3,
        complexity: 12,
      }),
    ],
  ]);

  // Create typed slice properties for direct access (new pattern)
  const fileTreeSlice = mockSlices.get('fileTree')!;
  const gitSlice = mockSlices.get('git')!;
  const markdownSlice = mockSlices.get('markdown')!;
  const packagesSlice = mockSlices.get('packages')!;
  const qualitySlice = mockSlices.get('quality')!;
  const telemetrySlice = createMockSlice('telemetry', []);

  // Build context with typed slice properties
  // Use type intersection to support panel-specific typed contexts
  const defaultContext = {
    currentScope: {
      type: 'repository' as const,
      workspace: {
        name: 'my-workspace',
        path: '/Users/developer/my-workspace',
      },
      repository: {
        name: 'my-project',
        path: '/Users/developer/my-project',
      },
    },
    // Mock adapters for file system operations
    adapters: {
      fileSystem: {
        readFile: async (path: string) => {
          console.log('[Mock] adapters.fileSystem.readFile:', path);
          return '{}';
        },
        writeFile: async (path: string, content: string) => {
          console.log('[Mock] adapters.fileSystem.writeFile:', path);
          console.log('[Mock] Content:', content);
        },
      },
    },
    // Typed slice properties (direct access)
    fileTree: fileTreeSlice,
    git: gitSlice,
    markdown: markdownSlice,
    packages: packagesSlice,
    quality: qualitySlice,
    telemetry: telemetrySlice,
    refresh: async (
      scope?: 'workspace' | 'repository',
      slice?: string
    ): Promise<void> => {
      console.log('[Mock] Context refresh called', { scope, slice });
    },
  };

  // Merge overrides
  const merged = { ...defaultContext, ...overrides };

  return merged as unknown as T;
};

/**
 * Mock Panel Actions for Storybook
 */
export const createMockActions = (
  overrides?: Partial<PanelActions> & {
    readFile?: (path: string) => Promise<string>;
    writeFile?: (path: string, content: string) => Promise<void>;
    clearTelemetry?: () => void;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): PanelActions & Record<string, any> => ({
  openFile: (filePath: string) => {
    console.log('[Mock] Opening file:', filePath);
  },
  openGitDiff: (filePath: string, status) => {
    console.log('[Mock] Opening git diff:', filePath, status);
  },
  navigateToPanel: (panelId: string) => {
    console.log('[Mock] Navigating to panel:', panelId);
  },
  notifyPanels: (event) => {
    console.log('[Mock] Notifying panels:', event);
  },
  // Default mock implementations for file operations
  readFile: async (path: string) => {
    console.log('[Mock] Reading file:', path);
    return '{}';
  },
  writeFile: async (path: string, content: string) => {
    console.log('[Mock] Writing file:', path);
    console.log('[Mock] Content:', content);
  },
  // Default mock implementation for clearing telemetry
  clearTelemetry: () => {
    console.log('[Mock] Clearing telemetry data');
  },
  ...overrides,
});

/**
 * Mock Event Emitter for Storybook
 */
export const createMockEvents = (): PanelEventEmitter => {
  const handlers = new Map<
    PanelEventType,
    Set<(event: PanelEvent<unknown>) => void>
  >();

  return {
    emit: (event) => {
      console.log('[Mock] Emitting event:', event);
      const eventHandlers = handlers.get(event.type);
      if (eventHandlers) {
        eventHandlers.forEach((handler) => handler(event));
      }
    },
    on: (type, handler) => {
      console.log('[Mock] Subscribing to event:', type);
      if (!handlers.has(type)) {
        handlers.set(type, new Set());
      }
      handlers.get(type)!.add(handler as (event: PanelEvent<unknown>) => void);

      // Return cleanup function
      return () => {
        console.log('[Mock] Unsubscribing from event:', type);
        handlers
          .get(type)
          ?.delete(handler as (event: PanelEvent<unknown>) => void);
      };
    },
    off: (type, handler) => {
      console.log('[Mock] Removing event handler:', type);
      handlers
        .get(type)
        ?.delete(handler as (event: PanelEvent<unknown>) => void);
    },
  };
};

/**
 * Mock Panel Props Provider
 * Wraps components with mock context for Storybook
 */
export const MockPanelProvider: React.FC<{
  children: (props: PanelComponentProps) => React.ReactNode;
  contextOverrides?: Partial<PanelContextValue>;
  actionsOverrides?: Partial<PanelActions> & {
    readFile?: (path: string) => Promise<string>;
    writeFile?: (path: string, content: string) => Promise<void>;
  };
  eventsOverride?: PanelEventEmitter;
}> = ({ children, contextOverrides, actionsOverrides, eventsOverride }) => {
  // Memoize context, actions, and events to prevent unnecessary re-renders
  // when parent component re-renders (e.g., when tree nodes are expanded)
  const context = useMemo(
    () => createMockContext(contextOverrides),
    [contextOverrides]
  );
  const actions = useMemo(
    () => createMockActions(actionsOverrides),
    [actionsOverrides]
  );
  const events = useMemo(
    () => eventsOverride || createMockEvents(),
    [eventsOverride]
  );

  return <>{children({ context, actions, events })}</>;
};
