import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import path from 'path';

export default defineConfig(({ mode: _mode }) => ({
  plugins: [
    react({
      // Force production JSX runtime to avoid jsxDEV in output
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
    }),
    // Inline CSS into JS bundle - consumers don't need to import CSS separately
    cssInjectedByJsPlugin(),
  ],
  define: {
    // Ensure NODE_ENV is production for React
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: './src/index.tsx',
      name: 'PanelExtension',
      fileName: 'panels.bundle',
      formats: ['es'],
    },
    rollupOptions: {
      // Externalize peer dependencies - these come from the host application
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@opentelemetry/api',
        // Externalize codebase-composition which contains quality lenses with Node executors
        '@principal-ai/codebase-composition',
        // Externalize principal-view-core - host app provides it (browser-safe as of v0.12.0)
        '@principal-ai/principal-view-core',
        /^@principal-ai\/principal-view-core\//,
        // CRITICAL: Externalize react-dnd to prevent "Cannot have two HTML5 backends" error
        // These must be provided by the host app to ensure a single instance
        'react-dnd',
        'react-dnd-html5-backend',
        'react-arborist',
        '@principal-ade/dynamic-file-tree',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@opentelemetry/api': 'OpenTelemetryAPI',
        },
      },
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Ensure production mode build
    minify: false,
  },
  // Force production mode for consistent JSX runtime
  mode: 'production',
}));
