import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toApiError } from '@/lib/fetcher';
import { showToast } from '@/lib/utils';
import { templateKeys } from '@/queries/template/options';

/** Runs a template action, reports it, and reloads the templates either way. */
export function useTemplateAction() {
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
        await queryClient.invalidateQueries({ queryKey: templateKeys.all });
      }
    },
    [queryClient],
  );
}
