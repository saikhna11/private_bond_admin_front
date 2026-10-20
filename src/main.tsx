import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { setOnUnauthorized } from '@/lib/fetcher';
import { queryClient } from '@/lib/query-client';
import { showToast } from '@/lib/utils';
import { authKeys } from '@/queries/auth/options';
import { router } from '@/router';
import './index.css';

// Registered here so fetcher.ts never imports the router (no import cycle).
setOnUnauthorized(() => {
  const wasSignedIn = queryClient.getQueryData(authKeys.me()) !== undefined;
  queryClient.clear();

  if (router.state.location.pathname === '/login') return;
  if (wasSignedIn) showToast('warning', 'Дахин нэвтэрнэ үү!');
  router.navigate({ to: '/login' });
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster richColors />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
