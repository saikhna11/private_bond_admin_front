import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  getBusinessDay,
  getCompanyAccounts,
  getCompanyBalances,
  getHolidays,
  getStatement,
  getTransfer,
  getTransfers,
} from './query';
import type { StatementFilters, TransferFilters } from './type';

export const bankKeys = {
  all: ['bank'] as const,
  companyAccounts: (activeOnly?: boolean) =>
    [
      ...bankKeys.all,
      'company-accounts',
      { activeOnly: !!activeOnly },
    ] as const,
  balances: () => [...bankKeys.all, 'balances'] as const,
  statements: () => [...bankKeys.all, 'statement'] as const,
  statement: (f: StatementFilters) => [...bankKeys.statements(), f] as const,
  transfers: () => [...bankKeys.all, 'transfer'] as const,
  transferList: (f: TransferFilters) =>
    [...bankKeys.transfers(), 'list', f] as const,
  transfer: (id: string) => [...bankKeys.transfers(), 'detail', id] as const,
  holidays: () => [...bankKeys.all, 'holiday'] as const,
  holidayYear: (year: number) => [...bankKeys.holidays(), year] as const,
  businessDay: () => [...bankKeys.holidays(), 'business-day'] as const,
};

export function companyAccountsOptions(activeOnly?: boolean) {
  return queryOptions({
    queryKey: bankKeys.companyAccounts(activeOnly),
    queryFn: () => getCompanyAccounts(activeOnly),
    select: (d) => d.items,
    staleTime: 1000 * 60,
  });
}

export function companyBalancesOptions() {
  return queryOptions({
    queryKey: bankKeys.balances(),
    queryFn: getCompanyBalances,
    select: (d) => d.items,
    staleTime: 1000 * 30,
  });
}

export function statementOptions(f: StatementFilters) {
  return queryOptions({
    queryKey: bankKeys.statement(f),
    queryFn: () => getStatement(f),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}

export function transfersOptions(f: TransferFilters) {
  return queryOptions({
    queryKey: bankKeys.transferList(f),
    queryFn: () => getTransfers(f),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}

export function transferOptions(id: string) {
  return queryOptions({
    queryKey: bankKeys.transfer(id),
    queryFn: () => getTransfer(id),
    enabled: !!id,
  });
}

export function holidaysOptions(year: number) {
  return queryOptions({
    queryKey: bankKeys.holidayYear(year),
    queryFn: () => getHolidays(year),
    select: (d) => d.items,
    staleTime: 1000 * 60,
  });
}

/** Whether today is a working day for the bank, read again every few minutes. */
export function businessDayOptions() {
  return queryOptions({
    queryKey: bankKeys.businessDay(),
    queryFn: () => getBusinessDay(),
    staleTime: 1000 * 60 * 5,
  });
}
