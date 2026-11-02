import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getVariableFields, getVariableGroups, getVariables } from './query';
import type { VariableFilters } from './type';

export const variableKeys = {
  all: ['variables'] as const,
  list: (f: VariableFilters) => [...variableKeys.all, 'list', f] as const,
  groups: ['variables', 'groups'] as const,
  fields: ['variable-fields'] as const,
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

/** The fields and formats a field variable picks from, which change only with the service. */
export function variableFieldsOptions() {
  return queryOptions({
    queryKey: variableKeys.fields,
    queryFn: getVariableFields,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
