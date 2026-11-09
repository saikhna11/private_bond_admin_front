import { useSuspenseQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { can, type PrivilegeKey } from '@/lib/rbac';
import { meOptions } from '@/queries/auth/options';

/** can() for the signed-in admin, inside the dashboard (where /me is loaded). */
export function useCan() {
  const { data: me } = useSuspenseQuery(meOptions());
  return useCallback((key: PrivilegeKey) => can(me, key), [me]);
}
