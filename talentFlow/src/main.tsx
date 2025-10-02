// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();

async function bootstrap() {
  try {

    // Start MSW worker (unconditional here — change if you want dev-only)
    const { startWorker } = await import('./mock/browser');
    await startWorker();
    // eslint-disable-next-line no-console
    console.log('[bootstrap] MSW worker started');

    // Seed DB (your seedIfEmpty should be in src/db/seed.ts)
    const { seedIfEmpty } = await import('./db/seed');
    await seedIfEmpty();
    // eslint-disable-next-line no-console
    console.log('[bootstrap] DB seeded (if empty)');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[bootstrap] initialization error', err);
  } finally {
    // Mount the app whether bootstrap succeeded or not
    const root = document.getElementById('root');
    if (!root) throw new Error('Root element not found');
    createRoot(root).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </React.StrictMode>
    );
  }
}

bootstrap();
