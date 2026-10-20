import type { QueryClient } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';
import { meOptions } from '@/queries/auth/options';
import type { MeType, Role } from '@/queries/auth/type';

/**
 * For a route's beforeLoad. Redirects to /login without a session, and to /
 * when the role is not allowed (so / must stay open to every role).
 */
export async function requireAuth(
  queryClient: QueryClient,
  roles?: Role[],
): Promise<MeType> {
  let me: MeType;
  try {
    me = await queryClient.ensureQueryData(meOptions());
  } catch {
    throw redirect({ to: '/login' });
  }

  if (roles && !roles.includes(me.role)) {
    throw redirect({ to: '/' });
  }

  return me;
}
