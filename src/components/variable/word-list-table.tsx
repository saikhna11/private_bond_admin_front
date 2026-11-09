import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon } from 'lucide-react';
import { TableEmpty, TableSkeletonRows } from '@/components/common/list-parts';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCan } from '@/hooks/use-can';
import { toApiError } from '@/lib/fetcher';
import { PRIV } from '@/lib/rbac';
import { showToast } from '@/lib/utils';
import { wordKeys, wordsOptions } from '@/queries/word/options';
import { deleteWord, updateWord } from '@/queries/word/query';
import {
  type ContractWordType,
  type WordCategory,
  wordCategoryLabel,
} from '@/queries/word/type';
import { DeleteWordButton } from './delete-word-button';
import { WordFormDialog } from './word-form-dialog';

const COLS = 4;

/** What a word stands for: a bank by its stored name, any other by its Mongolian word. */
function wordName(w: ContractWordType) {
  return w.category === 'bank' ? w.code : w.value_mn;
}

/** The words of one category, each with what the Mongolian and English templates print. */
export function WordListTable({ category }: { category: WordCategory }) {
  const can = useCan();
  const canUpdate = can(PRIV.variableUpdate);
  const canDelete = can(PRIV.variableDelete);
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery(wordsOptions(category));

  async function save(
    w: ContractWordType,
    body: { value_mn: string; value_en: string },
  ) {
    await updateWord(w.category, w.code, body);
    await queryClient.invalidateQueries({ queryKey: wordKeys.all });
    showToast('success', 'Үг хадгалагдлаа');
  }

  async function remove(w: ContractWordType) {
    await deleteWord(w.category, w.code);
    await queryClient.invalidateQueries({ queryKey: wordKeys.all });
    showToast('success', 'Үг устлаа');
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--color-border)]">
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="pl-4">{wordCategoryLabel[category]}</TableHead>
          <TableHead>Монгол загварт</TableHead>
          <TableHead>Англи загварт</TableHead>
          <TableHead className="w-24 pr-4" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isPending ? (
          <TableSkeletonRows cols={COLS} />
        ) : error ? (
          <TableEmpty
            cols={COLS}
            title="Ачаалж чадсангүй"
            text={toApiError(error).message}
          />
        ) : !data.length ? (
          <TableEmpty cols={COLS} title="Үг алга" />
        ) : (
          data.map((w) => (
            <TableRow key={w.code}>
              <TableCell className="pl-4 font-medium whitespace-normal">
                {wordName(w)}
              </TableCell>
              <TableCell className="whitespace-normal">{w.value_mn}</TableCell>
              <TableCell className="whitespace-normal">{w.value_en}</TableCell>
              <TableCell className="pr-4">
                <div className="flex justify-end gap-1">
                  {canUpdate && (
                    <WordFormDialog
                      word={w}
                      category={w.category}
                      title={wordName(w)}
                      onSubmit={(body) => save(w, body)}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Засах">
                          <PencilIcon />
                        </Button>
                      }
                    />
                  )}
                  {canDelete && !w.builtin && (
                    <DeleteWordButton
                      word={w}
                      name={wordName(w)}
                      onDelete={remove}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
