import { useNavigate } from '@tanstack/react-router';
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
import { languageLabel, ownershipLabel } from '@/queries/template/type';
import { ContractStatusBadge } from './contract-status-badge';

const COLS = 7;

/**
 * The contracts of one page, each with its holder, kind and the language of its template; a
 * row opens the contract.
 */
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
  const navigate = useNavigate();
  return (
    <Table className={dimmed ? 'opacity-60' : undefined}>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="pl-4">Дугаар</TableHead>
          <TableHead>Эзэмшигч</TableHead>
          <TableHead>Төрөл</TableHead>
          <TableHead>Хэл</TableHead>
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
            <TableRow
              key={c.id}
              className="cursor-pointer"
              onClick={() =>
                navigate({
                  to: '/contracts/$contractId',
                  params: { contractId: c.id },
                })
              }
            >
              <TableCell className="pl-4 font-medium tabular">
                {c.contract_no ?? (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="font-medium">
                {[c.holder.last_name, c.holder.first_name]
                  .filter(Boolean)
                  .join(' ')}
              </TableCell>
              <TableCell>{ownershipLabel[c.ownership_type]}</TableCell>
              <TableCell className="text-muted-foreground">
                {languageLabel[c.template.language]}
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
