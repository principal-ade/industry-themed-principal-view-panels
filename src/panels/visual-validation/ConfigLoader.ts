import type { ExtendedCanvas, ComponentLibrary } from '@principal-ai/visual-validation-core';
import yaml from 'js-yaml';

export interface ConfigFile {
  /** Unique identifier for this config (derived from filename) */
  id: string;
  /** Display name for this config */
  name: string;
  /** Full file path */
  path: string;
  /** Whether this is from a config folder or standalone */
  source: 'folder' | 'standalone';
}

/**
 * Check if a filename is a canvas file
 */
function isCanvasFile(filename: string): boolean {
  return filename.endsWith('.canvas');
}

/**
 * Extract config name from canvas filename
 */
function getConfigNameFromFilename(filename: string): string {
  return filename.replace(/\.canvas$/, '');
}

/**
 * Utility for loading and parsing .canvas configuration files from .vgc/ folder
 */
export class ConfigLoader {
  /**
   * Parse JSON canvas content
   */
  static parseCanvas(content: string): ExtendedCanvas {
    try {
      return JSON.parse(content) as ExtendedCanvas;
    } catch (error) {
      throw new Error(`Failed to parse canvas JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Parse YAML library content
   */
  static parseLibrary(content: string): ComponentLibrary {
    try {
      return yaml.load(content) as ComponentLibrary;
    } catch (error) {
      throw new Error(`Failed to parse library YAML: ${(error as Error).message}`);
    }
  }

  /**
   * Find the library.yaml file in the .vgc/ folder
   * Returns the relative path if found, null otherwise
   */
  static findLibraryPath(files: Array<{ path?: string; relativePath?: string; name?: string }>): string | null {
    const VGC_FOLDER = '.vgc';

    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || '';

      if (filePath === `${VGC_FOLDER}/library.yaml` ||
          (filePath.startsWith(`${VGC_FOLDER}/`) && fileName === 'library.yaml')) {
        return filePath;
      }
    }

    return null;
  }

  /**
   * Find all .canvas files in the .vgc/ folder
   * Returns array of config files with metadata
   */
  static findConfigs(files: Array<{ path?: string; relativePath?: string; name?: string }>): ConfigFile[] {
    const configs: ConfigFile[] = [];
    const VGC_FOLDER = '.vgc';

    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || '';

      // Check for .canvas files in .vgc/ folder
      if (filePath.startsWith(`${VGC_FOLDER}/`) && isCanvasFile(fileName)) {
        const configName = getConfigNameFromFilename(fileName);

        // Convert kebab-case to Title Case for display
        const displayName = configName
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        configs.push({
          id: configName,
          name: displayName,
          path: filePath,
          source: 'folder'
        });
      }
    }

    return configs;
  }
}
