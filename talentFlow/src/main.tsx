
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom'

const queryClient = new QueryClient();

async function bootstrap() {
  
    const { worker } = await import('../public/api/browser.ts');
    if (import.meta.env.DEV) {
    await worker.start({
      serviceWorker: {
        url: '/mockServiceWorker.js', 
      },
    });
  }
    console.log('MSW worker started');
  

  const { seedIfEmpty } = await import('../public/db/seed.ts');
  await seedIfEmpty();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <App />
        </BrowserRouter>
      </QueryClientProvider>
  </React.StrictMode>
)
}
bootstrap();