import fetchAndValidate, { scheduleRefresh } from '@/lib/fetcher';
import { MeSchema } from './type';

export const getMe = () => fetchAndValidate('me', MeSchema);

export async function login(email: string, password: string) {
  const me = await fetchAndValidate('auth/login', MeSchema, {
    method: 'POST',
    body: { email, password },
  });
  scheduleRefresh();
  return me;
}

export const logout = () =>
  fetchAndValidate('auth/logout', undefined, { method: 'POST' });

/** Every other session ends; this one gets new cookies. */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const me = await fetchAndValidate('auth/password', MeSchema, {
    method: 'POST',
    body: { current_password: currentPassword, new_password: newPassword },
  });
  scheduleRefresh();
  return me;
}
