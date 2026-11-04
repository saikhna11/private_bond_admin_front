import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { downloadBondFile, getBond, getBonds } from './query';
import type { BondFilters } from './type';

export const bondKeys = {
  all: ['bonds'] as const,
  list: (f: BondFilters) => [...bondKeys.all, 'list', f] as const,
  detail: (id: string) => [...bondKeys.all, 'detail', id] as const,
  file: (id: string, fileId: string) =>
    [...bondKeys.all, 'file', id, fileId] as const,
};

export function bondsOptions(f: BondFilters) {
  return queryOptions({
    queryKey: bondKeys.list(f),
    queryFn: () => getBonds(f),
    placeholderData: keepPreviousData,
  });
}

export function bondOptions(id: string) {
  return queryOptions({
    queryKey: bondKeys.detail(id),
    queryFn: () => getBond(id),
  });
}

/** A file's bytes, which never change once uploaded. */
export function bondFileOptions(id: string, fileId: string) {
  return queryOptions({
    queryKey: bondKeys.file(id, fileId),
    queryFn: () => downloadBondFile(id, fileId),
    staleTime: Number.POSITIVE_INFINITY,
  });
}
