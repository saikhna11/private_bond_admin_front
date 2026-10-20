import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './fetcher';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      // 4xx will not change on retry (401, 403, 404, validation).
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
