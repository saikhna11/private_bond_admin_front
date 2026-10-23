import { createRouter } from '@tanstack/react-router';
import { PendingScreen } from '@/components/common/pending-screen';
import { queryClient } from '@/lib/query-client';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPendingComponent: PendingScreen,
  // TanStack Query owns caching; the router always asks it.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  interface StaticDataRouteOption {
    crumb?: string;
  }
}
