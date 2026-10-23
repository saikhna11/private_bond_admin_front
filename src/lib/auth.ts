import type { QueryClient } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';
import { meOptions } from '@/queries/auth/options';
import type { MeType } from '@/queries/auth/type';
import { brokerMeOptions } from '@/queries/broker-panel/options';
import type { BrokerMeType } from '@/queries/broker-panel/type';

/**
 * For a route's beforeLoad. Redirects to /login without a session, and to / when the
 * page is for super admins only (so / must stay open to every admin).
 */
export async function requireAuth(
  queryClient: QueryClient,
  options?: { superOnly?: boolean },
): Promise<MeType> {
  let me: MeType;
  try {
    me = await queryClient.ensureQueryData(meOptions());
  } catch {
    throw redirect({ to: '/login' });
  }

  if (options?.superOnly && !me.is_super) {
    throw redirect({ to: '/' });
  }

  return me;
}

/** requireAuth for the broker panel: redirects to /broker/login without a session. */
export async function requireBrokerAuth(
  queryClient: QueryClient,
): Promise<BrokerMeType> {
  try {
    return await queryClient.ensureQueryData(brokerMeOptions());
  } catch {
    throw redirect({ to: '/broker/login' });
  }
}
