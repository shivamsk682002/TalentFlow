// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handler'; // adjust path if needed

export const worker = setupWorker(...handlers);

export async function startWorker() {
  try {
    await worker.start({
      onUnhandledRequest: 'bypass', // allow real requests through if no handler
      serviceWorker: {
        url: '/mockServiceWorker.js', // ensure public/mockServiceWorker.js exists
      },
    });
    // helpful for debugging in prod/demo
    // eslint-disable-next-line no-console
    console.log('[MSW] worker started (prod/demo mode)');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[MSW] failed to start', err);
  }
}
