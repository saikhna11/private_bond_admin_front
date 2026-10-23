import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import type { StaffFilters } from '@/queries/broker/type';
import { getAdmins } from './query';

export const adminKeys = {
  all: ['admins'] as const,
  list: (f: StaffFilters) => [...adminKeys.all, 'list', f] as const,
};

export function adminsOptions(f: StaffFilters) {
  return queryOptions({
    queryKey: adminKeys.list(f),
    queryFn: () => getAdmins(f),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}
