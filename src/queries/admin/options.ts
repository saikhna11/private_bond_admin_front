import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getAdmins } from './query';
import type { AdminFilters } from './type';

export const adminKeys = {
  all: ['admins'] as const,
  list: (f: AdminFilters) => [...adminKeys.all, 'list', f] as const,
};

export function adminsOptions(f: AdminFilters) {
  return queryOptions({
    queryKey: adminKeys.list(f),
    queryFn: () => getAdmins(f),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}
