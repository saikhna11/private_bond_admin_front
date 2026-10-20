import fetchAndValidate from '@/lib/fetcher';
import { MeSchema, type MeType } from './type';

// TODO: align with backend route.
export const getMe = async (): Promise<MeType> => {
  const res = await fetchAndValidate('auth/me', MeSchema);
  return res;
};
