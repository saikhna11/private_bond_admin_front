import { Link } from '@tanstack/react-router';
import { CheckIcon } from 'lucide-react';
import { TableEmpty, TableSkeletonRows } from '@/components/common/list-parts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toApiError } from '@/lib/fetcher';
import { formatAmount, formatDate } from '@/lib/format';
import type { AdminContractType } from '@/queries/contract/type';
import { ownershipLabel } from '@/queries/template/type';
import { ContractStatusBadge } from './contract-status-badge';

const COLS = 6;

/** The contracts of one page, each with its holder and the template it was drafted from. */
export function ContractListTable({
  items,
  isPending,
  error,
  dimmed,
}: {
  items?: AdminContractType[];
  isPending: boolean;
  error: unknown;
  dimmed: boolean;
}) {
  return (
    <Table className={dimmed ? 'opacity-60' : undefined}>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="pl-4">Дугаар</TableHead>
          <TableHead>Эзэмшигч</TableHead>
          <TableHead>Загвар</TableHead>
          <TableHead className="text-right">Дүн</TableHead>
          <TableHead>Төлөв</TableHead>
          <TableHead className="pr-4 text-right">Огноо</TableHead>
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
            title="Гэрээ олдсонгүй"
            text="Харилцагч гэрээ байгуулахад энд харагдана."
          />
        ) : (
          items.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="pl-4 font-medium tabular">
                {c.contract_no ?? (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <p className="font-medium">
                  {[c.holder.last_name, c.holder.first_name]
                    .filter(Boolean)
                    .join(' ')}
                </p>
                <p className="text-xs text-muted-foreground tabular">
                  {c.holder.register_no}
                </p>
              </TableCell>
              <TableCell>
                <Link
                  to="/templates/$templateId"
                  params={{ templateId: c.template.id }}
                  className="font-medium hover:underline"
                >
                  {c.template.name}
                </Link>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {ownershipLabel[c.ownership_type]}
                  {c.template.ttd && (
                    <>
                      {' · ТТД'}
                      <CheckIcon className="size-3 text-primary" />
                    </>
                  )}
                </p>
              </TableCell>
              <TableCell className="text-right tabular">
                {formatAmount(c.principal_amount, c.currency)}
              </TableCell>
              <TableCell>
                <ContractStatusBadge status={c.status} />
              </TableCell>
              <TableCell className="pr-4 text-right text-muted-foreground tabular">
                {formatDate(c.created_at)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
