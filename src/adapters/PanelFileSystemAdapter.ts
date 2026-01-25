/**
 * Panel FileSystem Adapter
 *
 * Implements FileSystemAdapter using the panel's fileTree slice for directory operations
 * and a file content cache that can be populated via the panel's readFile action.
 *
 * This adapter bridges the synchronous FileSystemAdapter interface used by
 * ConfigurationLoader and LibraryLoader with the async panel context.
 */

import type { FileSystemAdapter } from '@principal-ai/repository-abstraction';

/**
 * File entry from the fileTree slice
 */
export interface FileTreeEntry {
  path?: string;
  relativePath?: string;
  name?: string;
  type?: 'file' | 'directory';
}

/**
 * Options for creating the adapter
 */
export interface PanelFileSystemAdapterOptions {
  /** Files from the fileTree slice */
  fileTreeFiles: FileTreeEntry[];
  /** Base path for the repository */
  basePath: string;
}

/**
 * FileSystemAdapter implementation for panel context.
 *
 * Uses fileTree slice data for directory listing and existence checks.
 * File content must be pre-loaded into the cache via `setFileContent()`.
 */
export class PanelFileSystemAdapter implements FileSystemAdapter {
  private fileTreeFiles: FileTreeEntry[];
  private basePath: string;
  private fileContentCache: Map<string, string> = new Map();

  constructor(options: PanelFileSystemAdapterOptions) {
    this.fileTreeFiles = options.fileTreeFiles;
    this.basePath = options.basePath;
  }

  /**
   * Set file content in the cache.
   * Call this after loading file content via the panel's readFile action.
   */
  setFileContent(path: string, content: string): void {
    this.fileContentCache.set(this.normalizePath(path), content);
  }

  /**
   * Check if file content is cached
   */
  hasFileContent(path: string): boolean {
    return this.fileContentCache.has(this.normalizePath(path));
  }

  /**
   * Clear the file content cache
   */
  clearCache(): void {
    this.fileContentCache.clear();
  }

  // ============================================================================
  // FileSystemAdapter Implementation
  // ============================================================================

  exists(path: string): boolean {
    const normalized = this.normalizePath(path);
    const relativePath = this.toRelativePath(normalized);

    // Check if it's a file in the tree
    const fileExists = this.fileTreeFiles.some(f => {
      const fPath = f.relativePath || f.path || '';
      return fPath === relativePath || fPath === normalized;
    });

    if (fileExists) return true;

    // Check if it's a directory (any file starts with this path)
    return this.isDirectory(path);
  }

  readFile(path: string): string {
    const normalized = this.normalizePath(path);
    const content = this.fileContentCache.get(normalized);

    if (content === undefined) {
      throw new Error(
        `File content not cached: ${path}. ` +
        `Call setFileContent() after loading via panel's readFile action.`
      );
    }

    return content;
  }

  writeFile(_path: string, _content: string): void {
    throw new Error('PanelFileSystemAdapter does not support writeFile. Use panel actions instead.');
  }

  deleteFile(_path: string): void {
    throw new Error('PanelFileSystemAdapter does not support deleteFile. Use panel actions instead.');
  }

  readBinaryFile(_path: string): Uint8Array {
    throw new Error('PanelFileSystemAdapter does not support readBinaryFile.');
  }

  writeBinaryFile(_path: string, _content: Uint8Array): void {
    throw new Error('PanelFileSystemAdapter does not support writeBinaryFile.');
  }

  createDir(_path: string): void {
    throw new Error('PanelFileSystemAdapter does not support createDir. Use panel actions instead.');
  }

  readDir(path: string): string[] {
    const normalized = this.normalizePath(path);
    const relativePath = this.toRelativePath(normalized);
    const prefix = relativePath ? `${relativePath}/` : '';

    const items = new Set<string>();

    for (const file of this.fileTreeFiles) {
      const filePath = file.relativePath || file.path || '';

      // Check if file is in this directory
      if (filePath.startsWith(prefix)) {
        const remaining = filePath.slice(prefix.length);
        if (remaining) {
          // Get the first path segment (file or subdirectory name)
          const firstSegment = remaining.split('/')[0];
          if (firstSegment) {
            items.add(firstSegment);
          }
        }
      }
    }

    return Array.from(items);
  }

  deleteDir(_path: string): void {
    throw new Error('PanelFileSystemAdapter does not support deleteDir. Use panel actions instead.');
  }

  isDirectory(path: string): boolean {
    const normalized = this.normalizePath(path);
    const relativePath = this.toRelativePath(normalized);
    const prefix = relativePath ? `${relativePath}/` : '';

    // A path is a directory if any file starts with it as a prefix
    return this.fileTreeFiles.some(f => {
      const fPath = f.relativePath || f.path || '';
      return fPath.startsWith(prefix);
    });
  }

  join(...paths: string[]): string {
    return paths
      .join('/')
      .replace(/\/+/g, '/')
      .replace(/\/$/, '') || '/';
  }

  relative(from: string, to: string): string {
    const normalizedFrom = this.normalizePath(from);
    const normalizedTo = this.normalizePath(to);

    if (normalizedTo.startsWith(normalizedFrom + '/')) {
      return normalizedTo.slice(normalizedFrom.length + 1);
    }
    if (normalizedTo.startsWith(normalizedFrom)) {
      return normalizedTo.slice(normalizedFrom.length);
    }

    return normalizedTo;
  }

  dirname(path: string): string {
    const lastSlash = path.lastIndexOf('/');
    return lastSlash <= 0 ? '/' : path.slice(0, lastSlash);
  }

  isAbsolute(path: string): boolean {
    return path.startsWith('/');
  }

  normalizeRepositoryPath(_inputPath: string): string {
    // In panel context, we use the basePath as the repository root
    return this.basePath;
  }

  findProjectRoot(_inputPath: string): string {
    return this.basePath;
  }

  getRepositoryName(repositoryPath: string): string {
    const segments = repositoryPath.split('/').filter(s => s);
    return segments[segments.length - 1] || 'root';
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private normalizePath(path: string): string {
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  private toRelativePath(absolutePath: string): string {
    const normalized = this.normalizePath(absolutePath);
    const baseNormalized = this.normalizePath(this.basePath);

    if (normalized.startsWith(baseNormalized + '/')) {
      return normalized.slice(baseNormalized.length + 1);
    }
    if (normalized === baseNormalized) {
      return '';
    }

    // Already a relative path
    return normalized;
  }

  // ============================================================================
  // Utility Methods for Panel Integration
  // ============================================================================

  /**
   * Get list of files that need to be loaded for a directory.
   * Use this to pre-fetch file contents before using the loaders.
   */
  getFilesInDirectory(dirPath: string): string[] {
    const relativePath = this.toRelativePath(dirPath);
    const prefix = relativePath ? `${relativePath}/` : '';

    return this.fileTreeFiles
      .filter(f => {
        const fPath = f.relativePath || f.path || '';
        return fPath.startsWith(prefix);
      })
      .map(f => f.relativePath || f.path || '');
  }

  /**
   * Get the full path for a relative path
   */
  getFullPath(relativePath: string): string {
    return this.join(this.basePath, relativePath);
  }
}
