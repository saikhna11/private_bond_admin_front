import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getStatement, getTransfer, getTransfers } from './query';
import type { StatementFilters, TransferFilters } from './type';

export const bankKeys = {
  all: ['bank'] as const,
  statements: () => [...bankKeys.all, 'statement'] as const,
  statement: (f: StatementFilters) => [...bankKeys.statements(), f] as const,
  transfers: () => [...bankKeys.all, 'transfer'] as const,
  transferList: (f: TransferFilters) =>
    [...bankKeys.transfers(), 'list', f] as const,
  transfer: (id: string) => [...bankKeys.transfers(), 'detail', id] as const,
};

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
