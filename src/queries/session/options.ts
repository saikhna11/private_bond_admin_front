import { queryOptions } from '@tanstack/react-query';
import { getSessions } from './query';

export const sessionKeys = {
  all: ['sessions'] as const,
  list: () => [...sessionKeys.all, 'list'] as const,
};

export function sessionsOptions() {
  return queryOptions({
    queryKey: sessionKeys.list(),
    queryFn: getSessions,
    staleTime: 1000 * 30,
  });
}
