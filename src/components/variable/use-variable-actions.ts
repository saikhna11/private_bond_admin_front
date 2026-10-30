import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/lib/utils';
import { templateKeys } from '@/queries/template/options';
import { variableKeys } from '@/queries/variable/options';
import {
  createCustomVariable,
  deleteCustomVariable,
  updateCustomVariable,
} from '@/queries/variable/query';
import type { CustomVariableBody } from '@/queries/variable/type';

/**
 * Creates, changes and deletes an admin's variable, then refreshes the list and the catalog
 * the template mapping picks from. A failure is thrown for the caller to show.
 */
export function useVariableActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: variableKeys.all }),
      queryClient.invalidateQueries({ queryKey: templateKeys.variables }),
    ]);

  return {
    create: async (body: CustomVariableBody) => {
      await createCustomVariable(body);
      await refresh();
      showToast('success', 'Хувьсагч нэмэгдлээ');
    },
    update: async (id: string, body: CustomVariableBody) => {
      await updateCustomVariable(id, body);
      await refresh();
      showToast('success', 'Хувьсагч хадгалагдлаа');
    },
    remove: async (id: string) => {
      await deleteCustomVariable(id);
      await refresh();
      showToast('success', 'Хувьсагч устлаа');
    },
  };
}
