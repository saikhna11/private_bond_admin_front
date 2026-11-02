import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/lib/utils';
import { templateKeys } from '@/queries/template/options';
import { variableKeys } from '@/queries/variable/options';
import {
  createVariable,
  deleteVariable,
  updateVariable,
} from '@/queries/variable/query';
import type { VariableBody } from '@/queries/variable/type';

/**
 * Creates, changes and deletes a variable, then refreshes the list, its groups and the
 * catalog the template mapping picks from. A failure is thrown for the caller to show.
 */
export function useVariableActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: variableKeys.all }),
      queryClient.invalidateQueries({ queryKey: templateKeys.variables }),
    ]);

  return {
    create: async (body: VariableBody) => {
      await createVariable(body);
      await refresh();
      showToast(
        'success',
        body.kind === 'custom'
          ? 'Тогтмол текст нэмэгдлээ'
          : 'Хувьсагч нэмэгдлээ',
      );
    },
    update: async (id: string, body: VariableBody) => {
      await updateVariable(id, body);
      await refresh();
      showToast('success', 'Хувьсагч хадгалагдлаа');
    },
    remove: async (id: string) => {
      await deleteVariable(id);
      await refresh();
      showToast('success', 'Хувьсагч устлаа');
    },
  };
}
