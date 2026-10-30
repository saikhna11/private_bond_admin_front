import { queryOptions } from '@tanstack/react-query';
import { getCustomVariables } from './query';

export const variableKeys = {
  all: ['custom-variables'] as const,
};

export function customVariablesOptions() {
  return queryOptions({
    queryKey: variableKeys.all,
    queryFn: getCustomVariables,
  });
}
