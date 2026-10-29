import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getContract, getContracts } from './query';
import type { ContractFilters } from './type';

export const contractKeys = {
  all: ['contracts'] as const,
  list: (f: ContractFilters) => [...contractKeys.all, 'list', f] as const,
  detail: (id: string) => [...contractKeys.all, 'detail', id] as const,
};

export function contractsOptions(f: ContractFilters) {
  return queryOptions({
    queryKey: contractKeys.list(f),
    queryFn: () => getContracts(f),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}

export function contractOptions(id: string) {
  return queryOptions({
    queryKey: contractKeys.detail(id),
    queryFn: () => getContract(id),
  });
}
