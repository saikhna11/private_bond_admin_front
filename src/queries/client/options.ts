import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getClient, getClients, getMembers } from './query';
import type { ClientFilters } from './type';

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (f: ClientFilters, size?: number) =>
    [...clientKeys.lists(), f, size] as const,
  detail: (id: string) => [...clientKeys.all, 'detail', id] as const,
  members: (id: string, page: number) =>
    [...clientKeys.all, 'members', id, page] as const,
};

export function clientsOptions(f: ClientFilters, size?: number) {
  return queryOptions({
    queryKey: clientKeys.list(f, size),
    queryFn: () => getClients(f, size),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}

export function clientOptions(id: string) {
  return queryOptions({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClient(id),
  });
}

export function membersOptions(id: string, page: number) {
  return queryOptions({
    queryKey: clientKeys.members(id, page),
    queryFn: () => getMembers(id, page),
    placeholderData: keepPreviousData,
  });
}
