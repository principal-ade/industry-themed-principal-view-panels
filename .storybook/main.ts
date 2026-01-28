import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stubPath = path.resolve(__dirname, 'node-stub.js');

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@chromatic-com/storybook',
    '@storybook/addon-docs'
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  typescript: {
    check: false,
    reactDocgen: false, // Disable to avoid glob dependency in browser
  },

  async viteFinal(config) {
    return {
      ...config,
      cacheDir: 'node_modules/.vite-storybook', // Use separate cache to avoid conflicts
      resolve: {
        ...config.resolve,
        conditions: ['browser', 'import', 'module', 'default'],
        alias: {
          ...config.resolve?.alias,
          // Redirect Node.js packages to stub module
          'glob': stubPath,
          'minipass': stubPath,
          'path-scurry': stubPath,
          'minimatch': stubPath,
          'brace-expansion': stubPath,
          'balanced-match': stubPath,
          'concat-map': stubPath,
        },
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        force: true, // Force re-optimization of dependencies
        include: [
          ...(config.optimizeDeps?.include || []),
          // Removed '@principal-ade/dynamic-file-tree' to avoid caching issues
          '@principal-ai/principal-view-core',
        ],
        exclude: [
          ...(config.optimizeDeps?.exclude || []),
          '@opentelemetry/api',
          '@principal-ai/codebase-composition',
          'glob',
          'minipass',
          'path-scurry',
          'minimatch',
          'brace-expansion',
        ],
        esbuildOptions: {
          ...config.optimizeDeps?.esbuildOptions,
          conditions: ['browser', 'import', 'module', 'default'],
        },
      },
    };
  },
};

export default config;
