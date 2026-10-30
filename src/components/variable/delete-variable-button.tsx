import { Trash2Icon } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toApiError } from '@/lib/fetcher';
import { showToast } from '@/lib/utils';
import type { AdminVariableType } from '@/queries/variable/type';

/** Deletes an admin's variable after asking; one a template maps cannot be deleted. */
export function DeleteVariableButton({
  variable: v,
  onDelete,
}: {
  variable: AdminVariableType;
  onDelete: (id: string) => Promise<unknown>;
}) {
  if (v.templates > 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {/* A disabled button fires no pointer events: the span carries the tooltip. */}
          <span>
            <Button variant="ghost" size="icon" disabled aria-label="Устгах">
              <Trash2Icon />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {v.templates} загварт холбосон тул устгах боломжгүй
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" aria-label="Устгах">
          <Trash2Icon />
        </Button>
      }
      title="Хувьсагч устгах уу?"
      description={`«${v.label}» бүрмөсөн устна. Үүссэн гэрээ түүний утгыг хадгална.`}
      confirmLabel="Устгах"
      onConfirm={async () => {
        try {
          await onDelete(v.id);
        } catch (err) {
          showToast('error', toApiError(err).message);
          throw err;
        }
      }}
    />
  );
}
