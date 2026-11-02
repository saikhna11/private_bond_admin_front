import { Trash2Icon } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { toApiError } from '@/lib/fetcher';
import { showToast } from '@/lib/utils';
import type { ContractWordType } from '@/queries/word/type';

/** Deletes an admin's word after asking; contracts then print its code as it is stored. */
export function DeleteWordButton({
  word,
  name,
  onDelete,
}: {
  word: ContractWordType;
  /** What the word is, as the table names it. */
  name: string;
  onDelete: (word: ContractWordType) => Promise<unknown>;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" aria-label="Устгах">
          <Trash2Icon />
        </Button>
      }
      title="Үг устгах уу?"
      description={`«${name}» устна. Дараагийн гэрээнд код нь байгаагаараа хэвлэгдэнэ, үүссэн гэрээ хуучин үгээ хадгална.`}
      confirmLabel="Устгах"
      onConfirm={async () => {
        try {
          await onDelete(word);
        } catch (err) {
          showToast('error', toApiError(err).message);
          throw err;
        }
      }}
    />
  );
}
