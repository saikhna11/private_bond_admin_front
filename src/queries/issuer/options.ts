import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getIssuer, getIssuers } from './query';
import type { IssuerFilters } from './type';

export const issuerKeys = {
  all: ['issuers'] as const,
  list: (f: IssuerFilters) => [...issuerKeys.all, 'list', f] as const,
  detail: (id: string) => [...issuerKeys.all, 'detail', id] as const,
};

export function issuersOptions(f: IssuerFilters) {
  return queryOptions({
    queryKey: issuerKeys.list(f),
    queryFn: () => getIssuers(f),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}

export function issuerOptions(id: string) {
  return queryOptions({
    queryKey: issuerKeys.detail(id),
    queryFn: () => getIssuer(id),
    staleTime: 1000 * 20,
  });
}
