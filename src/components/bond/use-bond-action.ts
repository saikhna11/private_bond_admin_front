import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toApiError } from '@/lib/fetcher';
import { showToast } from '@/lib/utils';
import { bondKeys } from '@/queries/bond/options';

/** Runs a bond action, reports it, and reloads the bonds either way. */
export function useBondAction() {
  const queryClient = useQueryClient();
  return useCallback(
    async (action: () => Promise<unknown>, done: string) => {
      try {
        await action();
        showToast('success', done);
      } catch (err) {
        showToast('error', toApiError(err).message);
        throw err;
      } finally {
        await queryClient.invalidateQueries({ queryKey: bondKeys.all });
      }
    },
    [queryClient],
  );
}
