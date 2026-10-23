import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { adminApi, brokerApi } from '@/lib/fetcher';
import { queryClient } from '@/lib/query-client';
import { showToast } from '@/lib/utils';
import { authKeys } from '@/queries/auth/options';
import { brokerPanelKeys } from '@/queries/broker-panel/options';
import { router } from '@/router';
import './index.css';

// Registered here so fetcher.ts never imports the router (no import cycle). Runs once a
// refresh failed: the session ended, so sign in again, on that panel's login page.
for (const panel of [
  { api: adminApi, meKey: authKeys.me(), login: '/login' },
  { api: brokerApi, meKey: brokerPanelKeys.me(), login: '/broker/login' },
] as const) {
  panel.api.setOnUnauthorized(() => {
    const wasSignedIn = queryClient.getQueryData(panel.meKey) !== undefined;
    panel.api.cancelRefresh();
    queryClient.clear();

    if (router.state.location.pathname === panel.login) return;
    if (wasSignedIn)
      showToast('warning', 'Нэвтрэлтийн хугацаа дууссан. Дахин нэвтэрнэ үү.');
    router.navigate({ to: panel.login });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster richColors />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
