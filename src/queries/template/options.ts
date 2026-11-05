import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getContractVariables, getTemplate, getTemplates } from './query';
import type { TemplateFilters } from './type';

export const templateKeys = {
  all: ['templates'] as const,
  list: (f: TemplateFilters) => [...templateKeys.all, 'list', f] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
  variables: ['contract-variables'] as const,
};

export function templatesOptions(f: TemplateFilters) {
  return queryOptions({
    queryKey: templateKeys.list(f),
    queryFn: () => getTemplates(f),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 20,
  });
}

export function templateOptions(id: string) {
  return queryOptions({
    queryKey: templateKeys.detail(id),
    queryFn: () => getTemplate(id),
  });
}

// The catalog changes with a backend release and when an admin's variable does, which
// invalidates it.
export function contractVariablesOptions() {
  return queryOptions({
    queryKey: templateKeys.variables,
    queryFn: getContractVariables,
    staleTime: 1000 * 60,
  });
}
