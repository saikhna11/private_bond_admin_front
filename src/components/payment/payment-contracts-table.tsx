import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { BanknoteIcon } from 'lucide-react';
import { TransferDialog } from '@/components/bank/transfer-dialog';
import {
  Pagination,
  TableEmpty,
  TableSkeletonRows,
} from '@/components/common/list-parts';
import { ContractStatusBadge } from '@/components/contract/contract-status-badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime, formatMoney } from '@/lib/format';
import { PAGE_SIZE } from '@/lib/types';
import { paymentContractsOptions } from '@/queries/payment/options';
import type { PaymentFilter } from '@/queries/payment/type';

const COLS = 6;

/**
 * The orders paid short (short), or the money contracts received and must give back
 * (refund), which the admin refunds to the holder in a prefilled transfer.
 */
export function PaymentContractsTable({
  tab,
  filter,
  page,
  onPage,
}: {
  tab: 'short' | 'refund';
  filter: PaymentFilter;
  page: number;
  onPage: (page: number) => void;
}) {
  const { data, isPending, isPlaceholderData } = useQuery(
    paymentContractsOptions(tab, filter, page),
  );
  const refund = tab === 'refund';
  return (
    <>
      <Table className={isPlaceholderData ? 'opacity-60' : undefined}>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Гэрээ</TableHead>
            <TableHead>Эзэмшигч</TableHead>
            <TableHead className="text-right">Гэрээний дүн</TableHead>
            <TableHead className="text-right">Орсон</TableHead>
            <TableHead className="text-right">
              {refund ? 'Буцаах' : 'Дутуу'}
            </TableHead>
            <TableHead className="text-right">
              {refund ? 'Үйлдэл' : 'Төлөх хугацаа'}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows cols={COLS} />
          ) : !data?.items.length ? (
            <TableEmpty
              cols={COLS}
              title={
                refund ? 'Буцаах мөнгө алга' : 'Дутуу төлсөн захиалга алга'
              }
            />
          ) : (
            data.items.map((c) => {
              const holder =
                `${c.holder_last_name} ${c.holder_first_name}`.trim();
              return (
                <TableRow key={`${c.contract_id}-${c.currency}`}>
                  <TableCell>
                    <Link
                      to="/contracts/$contractId"
                      params={{ contractId: c.contract_id }}
                      className="tabular font-medium hover:underline"
                    >
                      {c.contract_no ?? c.payment_reference}
                    </Link>
                    <div className="mt-1">
                      <ContractStatusBadge status={c.status} />
                    </div>
                  </TableCell>
                  <TableCell>{holder || '-'}</TableCell>
                  <TableCell className="tabular text-right">
                    {formatMoney(c.amount)}
                  </TableCell>
                  <TableCell className="tabular text-right">
                    {formatMoney(c.received, c.currency)}
                  </TableCell>
                  <TableCell className="tabular text-right font-medium">
                    {refund
                      ? formatMoney(c.refundable, c.currency)
                      : formatMoney(
                          String(Number(c.amount) - Number(c.received)),
                          c.currency,
                        )}
                  </TableCell>
                  <TableCell className="text-right">
                    {refund ? (
                      <TransferDialog
                        refund={{
                          contractId: c.contract_id,
                          userId: c.holder_id,
                          currency: c.currency,
                          amount: c.refundable,
                          description: c.payment_reference,
                        }}
                        trigger={
                          <Button size="sm">
                            <BanknoteIcon />
                            Буцаах
                          </Button>
                        }
                      />
                    ) : (
                      <span className="tabular text-sm">
                        {formatDateTime(c.payment_deadline)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
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
