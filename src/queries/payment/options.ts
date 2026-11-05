import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  getPaymentContracts,
  getPaymentCounts,
  getUnknownCredits,
} from './query';

export const paymentKeys = {
  all: ['payments'] as const,
  counts: () => [...paymentKeys.all, 'counts'] as const,
  unknown: (page?: number) =>
    [...paymentKeys.all, 'unknown', { page }] as const,
  contracts: (tab: 'short' | 'refund', page?: number) =>
    [...paymentKeys.all, 'contracts', { tab, page }] as const,
};

/** The tabs' counts, read again every minute for the sidebar's badge. */
export function paymentCountsOptions() {
  return queryOptions({
    queryKey: paymentKeys.counts(),
    queryFn: getPaymentCounts,
    refetchInterval: 60_000,
    staleTime: 1000 * 20,
  });
}

export function unknownCreditsOptions(page?: number) {
  return queryOptions({
    queryKey: paymentKeys.unknown(page),
    queryFn: () => getUnknownCredits(page),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}

export function paymentContractsOptions(
  tab: 'short' | 'refund',
  page?: number,
) {
  return queryOptions({
    queryKey: paymentKeys.contracts(tab, page),
    queryFn: () => getPaymentContracts(tab, page),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}
