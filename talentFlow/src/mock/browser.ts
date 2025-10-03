import { setupWorker } from 'msw/browser';
import { handlers } from './handler'; 

export const worker = setupWorker(...handlers);

export async function startWorker() {
  try {
    await worker.start({
      onUnhandledRequest: 'bypass', 
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    console.log('[MSW] worker started (prod/demo mode)');
  } catch (err) {
    console.error('[MSW] failed to start', err);
  }
}
