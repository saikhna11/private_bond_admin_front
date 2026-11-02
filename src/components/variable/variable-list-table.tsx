import { PencilIcon } from 'lucide-react';
import { TableEmpty, TableSkeletonRows } from '@/components/common/list-parts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toApiError } from '@/lib/fetcher';
import {
  type AdminVariableType,
  type VariableBody,
  variableKindLabel,
} from '@/queries/variable/type';
import { DeleteVariableButton } from './delete-variable-button';
import { VariableFormDialog } from './variable-form-dialog';
import { VariableValue } from './variable-value';

const COLS = 5;

/** One page of the variables, each with its value, the templates mapping it and its actions. */
export function VariableListTable({
  items,
  isPending,
  error,
  dimmed,
  onUpdate,
  onDelete,
}: {
  items?: AdminVariableType[];
  isPending: boolean;
  error: unknown;
  dimmed: boolean;
  onUpdate: (id: string, body: VariableBody) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
  return (
    <Table className={dimmed ? 'opacity-60' : undefined}>
      <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--color-border)]">
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="pl-4">Хувьсагч</TableHead>
          <TableHead>Бүлэг</TableHead>
          <TableHead>Утга</TableHead>
          <TableHead className="text-right">Загвар</TableHead>
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
        ) : !items?.length ? (
          <TableEmpty
            cols={COLS}
            title="Хувьсагч олдсонгүй"
            text="Шүүлтүүрээ өөрчилж үзнэ үү."
          />
        ) : (
          items.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="pl-4">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{v.label}</p>
                  {!v.builtin && (
                    <Badge variant="secondary" className="font-normal">
                      {variableKindLabel[v.kind]}
                    </Badge>
                  )}
                </div>
                {v.hint && (
                  <p className="max-w-96 truncate text-xs text-muted-foreground">
                    {v.hint}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {v.group || '-'}
              </TableCell>
              <TableCell>
                <VariableValue variable={v} />
              </TableCell>
              <TableCell className="tabular text-right text-muted-foreground">
                {v.templates}
              </TableCell>
              <TableCell className="pr-4">
                <div className="flex justify-end gap-1">
                  <VariableFormDialog
                    variable={v}
                    onSubmit={(body) => onUpdate(v.id, body)}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Засах">
                        <PencilIcon />
                      </Button>
                    }
                  />
                  {!v.builtin && (
                    <DeleteVariableButton variable={v} onDelete={onDelete} />
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
