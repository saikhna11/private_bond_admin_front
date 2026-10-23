import z from 'zod';
import { brokerApi } from '@/lib/fetcher';
import { SessionsSchema } from '@/queries/session/type';
import { BrokerMeSchema } from './type';

const { fetchAndValidate, scheduleRefresh } = brokerApi;

export const getBrokerMe = () => fetchAndValidate('me', BrokerMeSchema);

export async function brokerLogin(email: string, password: string) {
  const me = await fetchAndValidate('auth/login', BrokerMeSchema, {
    method: 'POST',
    body: { email, password },
  });
  scheduleRefresh();
  return me;
}

export const brokerLogout = () =>
  fetchAndValidate('auth/logout', undefined, { method: 'POST' });

/** Every other session ends; this one gets new cookies. */
export async function brokerChangePassword(
  currentPassword: string,
  newPassword: string,
) {
  const me = await fetchAndValidate('auth/password', BrokerMeSchema, {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword },
  });
  scheduleRefresh();
  return me;
}

export const getBrokerSessions = async () =>
  (await fetchAndValidate('me/sessions', SessionsSchema)).sessions;

export const endBrokerSession = (id: string) =>
  fetchAndValidate(`me/sessions/${id}`, undefined, { method: 'DELETE' });

export const endOtherBrokerSessions = () =>
  fetchAndValidate('me/sessions', z.object({ ended: z.number() }), {
    method: 'DELETE',
  });
