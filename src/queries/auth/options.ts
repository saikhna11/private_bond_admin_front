import { queryOptions } from '@tanstack/react-query';
import { getMe } from './query';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function meOptions() {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });
}
