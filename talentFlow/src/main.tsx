import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();

async function bootstrap() {
  try {
    const { startWorker } = await import('./mock/browser');
    await startWorker();
    console.log('[bootstrap] MSW worker started');
    const { seedIfEmpty } = await import('./db/seed');
    await seedIfEmpty();
    console.log('[bootstrap] DB seeded (if empty)');
  } catch (err) {
    console.error('[bootstrap] initialization error', err);
  } finally {
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
