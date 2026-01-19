/**
 * MSW browser setup for the demo
 *
 * This worker is automatically initialized in .storybook/preview.ts for Storybook.
 * For standalone usage:
 * 1. Install: npm install msw --save-dev
 * 2. Run: npx msw init public/ --save
 * 3. Import worker and call: worker.start()
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * Create the MSW worker with our handlers
 * This is exported and started globally in Storybook's preview.ts
 */
export const worker = setupWorker(...handlers);
