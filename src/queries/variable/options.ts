import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getVariableFields, getVariableGroups, getVariables } from './query';
import type { VariableFilters, VariableKind } from './type';

export const variableKeys = {
  all: ['variables'] as const,
  list: (f: VariableFilters) => [...variableKeys.all, 'list', f] as const,
  groups: (kinds: VariableKind[]) =>
    [...variableKeys.all, 'groups', kinds] as const,
  fields: ['variable-fields'] as const,
};

export function variablesOptions(f: VariableFilters) {
  return queryOptions({
    queryKey: variableKeys.list(f),
    queryFn: () => getVariables(f),
    placeholderData: keepPreviousData,
  });
}

/** The groups of the variables of kinds. */
export function variableGroupsOptions(kinds: VariableKind[]) {
  return queryOptions({
    queryKey: variableKeys.groups(kinds),
    queryFn: () => getVariableGroups(kinds),
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
