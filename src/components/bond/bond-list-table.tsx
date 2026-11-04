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
import type { BondType } from '@/queries/bond/type';
import { BondSalesStatusBadge } from './bond-sales-status-badge';

const COLS = 6;

/** The bonds of one page; a row opens the bond. */
export function BondListTable({
  items,
  isPending,
  error,
  dimmed,
}: {
  items?: BondType[];
  isPending: boolean;
  error: unknown;
  dimmed: boolean;
}) {
  const navigate = useNavigate();
  return (
    <Table className={dimmed ? 'opacity-60' : undefined}>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className="pl-4">Код</TableHead>
          <TableHead>Нэр</TableHead>
          <TableHead className="text-right">Нийт дүн</TableHead>
          <TableHead>Борлуулалт</TableHead>
          <TableHead>Төлөв</TableHead>
          <TableHead className="pr-4 text-right">Бүртгэсэн</TableHead>
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
            title="Бонд олдсонгүй"
            text="Бонд бүртгээд хүүгийн нөхцөл, танилцуулгыг нь оруулна."
          />
        ) : (
          items.map((b) => (
            <TableRow
              key={b.id}
              className="cursor-pointer"
              onClick={() =>
                navigate({ to: '/bonds/$bondId', params: { bondId: b.id } })
              }
            >
              <TableCell className="pl-4">
                <span className="inline-flex rounded-md bg-muted px-2 py-1 font-mono text-sm font-medium">
                  {b.code}
                </span>
              </TableCell>
              <TableCell>
                <p className="max-w-64 truncate font-medium">{b.name}</p>
              </TableCell>
              <TableCell className="tabular text-right">
                {formatAmount(b.total_amount, b.currency)}
              </TableCell>
              <TableCell className="tabular text-muted-foreground">
                {formatDate(b.sale_start)} -{' '}
                {b.sale_end ? formatDate(b.sale_end) : 'хугацаагүй'}
              </TableCell>
              <TableCell>
                <BondSalesStatusBadge status={b.sales_status} />
              </TableCell>
              <TableCell className="tabular pr-4 text-right text-muted-foreground">
                {formatDate(b.created_at)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
