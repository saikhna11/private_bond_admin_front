import z from 'zod';
import fetchAndValidate from '@/lib/fetcher';
import { SessionsSchema } from './type';

export const getSessions = async () =>
  (await fetchAndValidate('me/sessions', SessionsSchema)).sessions;

export const endSession = (id: string) =>
  fetchAndValidate(`me/sessions/${id}`, undefined, { method: 'DELETE' });

export const endOtherSessions = () =>
  fetchAndValidate('me/sessions', z.object({ ended: z.number() }), {
    method: 'DELETE',
  });
