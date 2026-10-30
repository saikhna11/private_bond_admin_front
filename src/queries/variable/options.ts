import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getVariableGroups, getVariables } from './query';
import type { VariableFilters } from './type';

export const variableKeys = {
  all: ['variables'] as const,
  list: (f: VariableFilters) => [...variableKeys.all, 'list', f] as const,
  groups: ['variables', 'groups'] as const,
};

export function variablesOptions(f: VariableFilters) {
  return queryOptions({
    queryKey: variableKeys.list(f),
    queryFn: () => getVariables(f),
    placeholderData: keepPreviousData,
  });
}

export function variableGroupsOptions() {
  return queryOptions({
    queryKey: variableKeys.groups,
    queryFn: getVariableGroups,
  });
}
