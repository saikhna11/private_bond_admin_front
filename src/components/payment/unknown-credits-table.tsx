import { useQuery } from '@tanstack/react-query';
import {
  Pagination,
  TableEmpty,
  TableSkeletonRows,
} from '@/components/common/list-parts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatMoney } from '@/lib/format';
import { PAGE_SIZE } from '@/lib/types';
import { unknownCreditsOptions } from '@/queries/payment/options';
import type { PaymentFilter } from '@/queries/payment/type';
import { UnknownCreditActions } from './unknown-credit-actions';

const COLS = 5;

/**
 * The statement credits no order's reference matched: the admin links one to the order the
 * payer meant, or dismisses one that pays no order.
 */
export function UnknownCreditsTable({
  filter,
  page,
  onPage,
}: {
  filter: PaymentFilter;
  page: number;
  onPage: (page: number) => void;
}) {
  const { data, isPending, isPlaceholderData } = useQuery(
    unknownCreditsOptions(filter, page),
  );
  return (
    <>
      <Table className={isPlaceholderData ? 'opacity-60' : undefined}>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Огноо</TableHead>
            <TableHead>Гүйлгээний утга</TableHead>
            <TableHead>Илгээсэн данс</TableHead>
            <TableHead className="text-right">Дүн</TableHead>
            <TableHead className="text-right">Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows cols={COLS} />
          ) : !data?.items.length ? (
            <TableEmpty cols={COLS} title="Танигдаагүй орлого алга" />
          ) : (
            data.items.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="tabular whitespace-nowrap">
                  {formatDate(c.tran_date)} {c.tran_time}
                </TableCell>
                <TableCell className="max-w-72 [overflow-wrap:anywhere]">
                  {c.description || '-'}
                </TableCell>
                <TableCell className="tabular">
                  {c.related_account || '-'}
                </TableCell>
                <TableCell className="tabular text-right font-medium text-success">
                  {formatMoney(c.amount, c.currency)}
                </TableCell>
                <TableCell>
                  <UnknownCreditActions id={c.id} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {data && data.total > 0 && (
        <Pagination
          page={page}
          size={PAGE_SIZE}
          total={data.total}
          onPage={onPage}
        />
      )}
    </>
  );
}
