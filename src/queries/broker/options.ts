import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getBrokers } from './query';
import type { StaffFilters } from './type';

export const brokerKeys = {
  all: ['brokers'] as const,
  list: (f: StaffFilters) => [...brokerKeys.all, 'list', f] as const,
};

export function brokersOptions(f: StaffFilters) {
  return queryOptions({
    queryKey: brokerKeys.list(f),
    queryFn: () => getBrokers(f),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}
