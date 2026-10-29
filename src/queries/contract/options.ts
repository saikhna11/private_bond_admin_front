import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getContracts } from './query';
import type { ContractFilters } from './type';

export const contractKeys = {
  all: ['contracts'] as const,
  list: (f: ContractFilters) => [...contractKeys.all, 'list', f] as const,
};

export function contractsOptions(f: ContractFilters) {
  return queryOptions({
    queryKey: contractKeys.list(f),
    queryFn: () => getContracts(f),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}
