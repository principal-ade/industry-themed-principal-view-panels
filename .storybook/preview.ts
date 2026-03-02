import type { Preview } from '@storybook/react-vite';
import type { OtelExportConfig } from '@principal-ai/storybook-addon-otel';
import '@xyflow/react/dist/style.css';

// Track if MSW has been initialized
let mswInitialized = false;

// Initialize MSW for demo mocks
const initializeMSW = async () => {
  if (mswInitialized) return;

  if (typeof window !== 'undefined') {
    try {
      const { worker } = await import('../src/demo/api/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        quiet: false,
      });
      mswInitialized = true;
      console.log('🎭 MSW ready - mock APIs available');
    } catch (err) {
      console.warn('MSW initialization failed:', err);
    }
  }
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Introduction', 'Panels', 'Demo', '*'],
      },
    },
    otelExport: {
      enabled: true,
      endpoint: 'http://localhost:4318/v1/traces',
      serviceName: 'industry-themed-principal-view-panels-storybook',
      resourceAttributes: {
        environment: 'development',
        project: 'principal-view-panels',
      },
    } as OtelExportConfig,
  },
  loaders: [
    async () => {
      // Ensure MSW is ready before rendering any story
      await initializeMSW();
      return {};
    },
  ],
};

export default preview;
