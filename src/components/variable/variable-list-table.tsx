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
import { toApiError } from '@/lib/fetcher';
import type {
  CustomVariableBody,
  CustomVariableType,
} from '@/queries/variable/type';
import { DeleteVariableButton } from './delete-variable-button';
import { VariableFormDialog } from './variable-form-dialog';

const COLS = 6;

/** The admins' variables, each with its values, the templates mapping it and its actions. */
export function VariableListTable({
  items,
  isPending,
  error,
  onUpdate,
  onDelete,
}: {
  items?: CustomVariableType[];
  isPending: boolean;
  error: unknown;
  onUpdate: (id: string, body: CustomVariableBody) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="pl-4">Хувьсагч</TableHead>
          <TableHead>Бүлэг</TableHead>
          <TableHead>Монгол утга</TableHead>
          <TableHead>Англи утга</TableHead>
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
            title="Хувьсагч алга"
            text="Гаргагч, андеррайтерын нэр, данс зэрэг олон загварт давтагддаг текстийг энд нэг удаа бичнэ."
          />
        ) : (
          items.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="pl-4">
                <p className="font-medium">{v.label}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {v.key}
                </p>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {v.group || '-'}
              </TableCell>
              <TableCell>
                <p className="max-w-72 truncate" title={v.value_mn}>
                  {v.value_mn || (
                    <span className="text-muted-foreground">(хоосон)</span>
                  )}
                </p>
              </TableCell>
              <TableCell>
                <p className="max-w-72 truncate" title={v.value_en}>
                  {v.value_en || (
                    <span className="text-muted-foreground">Монгол утгаар</span>
                  )}
                </p>
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
                  <DeleteVariableButton variable={v} onDelete={onDelete} />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
