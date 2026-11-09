import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  getContractSchedule,
  getDuePayouts,
  getIssuerSchedules,
  getScheduleEdits,
} from './query';

export const scheduleKeys = {
  all: ['schedule'] as const,
  contract: (id: string) => [...scheduleKeys.all, 'contract', id] as const,
  edits: (id: string) => [...scheduleKeys.all, 'edits', id] as const,
  payouts: (page?: number, asOf?: string) =>
    [...scheduleKeys.all, 'payouts', { page, asOf }] as const,
  issuer: (from: string, to: string) =>
    [...scheduleKeys.all, 'issuer', { from, to }] as const,
};

export function contractScheduleOptions(id: string) {
  return queryOptions({
    queryKey: scheduleKeys.contract(id),
    queryFn: () => getContractSchedule(id),
    staleTime: 1000 * 20,
  });
}

export function scheduleEditsOptions(id: string) {
  return queryOptions({
    queryKey: scheduleKeys.edits(id),
    queryFn: () => getScheduleEdits(id),
    select: (d) => d.items,
    staleTime: 1000 * 20,
  });
}

/** The payouts due, read again every minute for the sidebar's badge. */
export function duePayoutsOptions(page?: number, asOf?: string) {
  return queryOptions({
    queryKey: scheduleKeys.payouts(page, asOf),
    queryFn: () => getDuePayouts(page, asOf),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    staleTime: 1000 * 20,
  });
}

export function issuerSchedulesOptions(from: string, to: string) {
  return queryOptions({
    queryKey: scheduleKeys.issuer(from, to),
    queryFn: () => getIssuerSchedules(from, to),
    select: (d) => d.items,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}
