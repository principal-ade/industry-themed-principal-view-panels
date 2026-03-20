/**
 * Hook for loading and managing trace patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import yaml from 'js-yaml';
import type { TracePattern, TracePatternsFile } from '../types/tracePatterns';

interface UseTracePatternsParams {
  /** Repository path for locating trace-patterns.yaml */
  repositoryPath?: string;
  /** Function to read files */
  readFile?: (path: string) => Promise<string>;
  /** Function to write files */
  writeFile?: (path: string, content: string) => Promise<void>;
}

interface UseTracePatternsReturn {
  /** Loaded trace patterns */
  patterns: TracePattern[];
  /** Whether patterns are currently loading */
  isLoading: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Reload patterns from file */
  reload: () => Promise<void>;
  /** Save a new pattern to the catalog */
  savePattern: (pattern: TracePattern) => Promise<void>;
  /** Remove a pattern from the catalog */
  removePattern: (patternId: string) => Promise<void>;
  /** Path to the trace patterns file */
  patternsFilePath: string | null;
}

const PATTERNS_FILENAME = 'trace-patterns.yaml';
const PATTERNS_DIR = '.principal-views';

/**
 * Hook to load and manage trace patterns from trace-patterns.yaml
 */
export function useTracePatterns({
  repositoryPath,
  readFile,
  writeFile,
}: UseTracePatternsParams): UseTracePatternsReturn {
  const [patterns, setPatterns] = useState<TracePattern[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patternsFilePath, setPatternsFilePath] = useState<string | null>(null);

  // Track if we've already loaded to prevent duplicate loads
  const hasLoaded = useRef(false);

  const loadPatterns = useCallback(async () => {
    if (!repositoryPath || !readFile) {
      setPatterns([]);
      return;
    }

    const filePath = `${repositoryPath}/${PATTERNS_DIR}/${PATTERNS_FILENAME}`;
    setPatternsFilePath(filePath);

    setIsLoading(true);
    setError(null);

    try {
      const content = await readFile(filePath);
      const parsed = yaml.load(content) as TracePatternsFile | null;

      if (parsed?.patterns && Array.isArray(parsed.patterns)) {
        setPatterns(parsed.patterns);
      } else {
        setPatterns([]);
      }
    } catch (err) {
      // File doesn't exist or is invalid - that's okay, start with empty patterns
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT' ||
          (err instanceof Error && err.message.includes('ENOENT'))) {
        setPatterns([]);
      } else {
        console.warn('[useTracePatterns] Error loading patterns:', err);
        setError(err instanceof Error ? err.message : 'Failed to load patterns');
        setPatterns([]);
      }
    } finally {
      setIsLoading(false);
      hasLoaded.current = true;
    }
  }, [repositoryPath, readFile]);

  const savePattern = useCallback(
    async (pattern: TracePattern) => {
      if (!repositoryPath || !writeFile || !readFile) {
        throw new Error('File system not available');
      }

      const filePath = `${repositoryPath}/${PATTERNS_DIR}/${PATTERNS_FILENAME}`;

      // Load current file (if exists)
      let currentFile: TracePatternsFile = {
        version: '1.0.0',
        patterns: [],
      };

      try {
        const content = await readFile(filePath);
        const parsed = yaml.load(content) as TracePatternsFile | null;
        if (parsed) {
          currentFile = parsed;
        }
      } catch {
        // File doesn't exist - use defaults
      }

      // Check for duplicate ID
      const existingIndex = currentFile.patterns.findIndex((p) => p.id === pattern.id);
      if (existingIndex >= 0) {
        // Update existing pattern
        currentFile.patterns[existingIndex] = pattern;
      } else {
        // Add new pattern
        currentFile.patterns.push(pattern);
      }

      // Write back
      const newContent = yaml.dump(currentFile, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });

      await writeFile(filePath, newContent);

      // Update local state
      setPatterns(currentFile.patterns);
      setPatternsFilePath(filePath);
    },
    [repositoryPath, readFile, writeFile]
  );

  const removePattern = useCallback(
    async (patternId: string) => {
      if (!repositoryPath || !writeFile || !readFile) {
        throw new Error('File system not available');
      }

      const filePath = `${repositoryPath}/${PATTERNS_DIR}/${PATTERNS_FILENAME}`;

      // Load current file
      let currentFile: TracePatternsFile = {
        version: '1.0.0',
        patterns: [],
      };

      try {
        const content = await readFile(filePath);
        const parsed = yaml.load(content) as TracePatternsFile | null;
        if (parsed) {
          currentFile = parsed;
        }
      } catch {
        // File doesn't exist - nothing to remove
        return;
      }

      // Remove pattern
      currentFile.patterns = currentFile.patterns.filter((p) => p.id !== patternId);

      // Write back
      const newContent = yaml.dump(currentFile, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });

      await writeFile(filePath, newContent);

      // Update local state
      setPatterns(currentFile.patterns);
    },
    [repositoryPath, readFile, writeFile]
  );

  const reload = useCallback(async () => {
    hasLoaded.current = false;
    await loadPatterns();
  }, [loadPatterns]);

  // Load on mount and when repositoryPath changes
  useEffect(() => {
    if (!hasLoaded.current) {
      loadPatterns();
    }
  }, [loadPatterns]);

  return {
    patterns,
    isLoading,
    error,
    reload,
    savePattern,
    removePattern,
    patternsFilePath,
  };
}
