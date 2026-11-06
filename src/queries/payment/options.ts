import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  getPaymentContracts,
  getPaymentCounts,
  getPaymentIssues,
  getUnknownCredits,
} from './query';
import type { PaymentFilter } from './type';

export const paymentKeys = {
  all: ['payments'] as const,
  counts: () => [...paymentKeys.all, 'counts'] as const,
  issues: (filter: PaymentFilter, page?: number) =>
    [...paymentKeys.all, 'all', { ...filter, page }] as const,
  unknown: (filter: PaymentFilter, page?: number) =>
    [...paymentKeys.all, 'unknown', { ...filter, page }] as const,
  contracts: (tab: 'short' | 'refund', filter: PaymentFilter, page?: number) =>
    [...paymentKeys.all, 'contracts', { tab, ...filter, page }] as const,
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

export function unknownCreditsOptions(filter: PaymentFilter, page?: number) {
  return queryOptions({
    queryKey: paymentKeys.unknown(filter, page),
    queryFn: () => getUnknownCredits(filter, page),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}

export function paymentContractsOptions(
  tab: 'short' | 'refund',
  filter: PaymentFilter,
  page?: number,
) {
  return queryOptions({
    queryKey: paymentKeys.contracts(tab, filter, page),
    queryFn: () => getPaymentContracts(tab, filter, page),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}

export function paymentIssuesOptions(filter: PaymentFilter, page?: number) {
  return queryOptions({
    queryKey: paymentKeys.issues(filter, page),
    queryFn: () => getPaymentIssues(filter, page),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}
