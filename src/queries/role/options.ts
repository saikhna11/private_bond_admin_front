import { queryOptions } from '@tanstack/react-query';
import { getPrivileges, getRolePrivileges, getRoles } from './query';

export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  privileges: (id: string) => [...roleKeys.all, 'privileges', id] as const,
  catalog: () => ['privileges'] as const,
};

/** Every role, the system one first. */
export function rolesOptions() {
  return queryOptions({
    queryKey: roleKeys.list(),
    queryFn: getRoles,
    staleTime: 1000 * 30,
  });
}

/** The ids of the privileges a role is granted. */
export function rolePrivilegesOptions(id: string) {
  return queryOptions({
    queryKey: roleKeys.privileges(id),
    queryFn: () => getRolePrivileges(id),
  });
}

/** Every privilege a role may be granted; it changes only with a release. */
export function privilegesOptions() {
  return queryOptions({
    queryKey: roleKeys.catalog(),
    queryFn: getPrivileges,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
