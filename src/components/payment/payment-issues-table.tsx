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
import { formatDate, formatDateTime, formatMoney } from '@/lib/format';
import { PAGE_SIZE } from '@/lib/types';
import { cn } from '@/lib/utils';
import { paymentIssuesOptions } from '@/queries/payment/options';
import {
  type PaymentFilter,
  type PaymentIssueType,
  type PaymentTab,
  paymentTabLabel,
} from '@/queries/payment/type';
import { UnknownCreditActions } from './unknown-credit-actions';

const COLS = 6;

const kindTone: Record<PaymentTab, string> = {
  unknown: 'bg-warning/15 text-warning-foreground dark:text-warning',
  short: 'bg-primary/10 text-primary',
  refund: 'bg-destructive/10 text-destructive',
};

/** A row's action: link or dismiss a credit, refund the money, or when a short order expires. */
function IssueAction({ r }: { r: PaymentIssueType }) {
  if (r.kind === 'unknown') return <UnknownCreditActions id={r.id} />;
  if (r.kind === 'short') {
    return (
      <span className="tabular text-sm text-muted-foreground">
        {r.payment_deadline
          ? `${formatDateTime(r.payment_deadline)} хүртэл`
          : '-'}
      </span>
    );
  }
  return (
    <TransferDialog
      refund={{
        contractId: r.contract_id ?? r.id,
        userId: r.holder_id ?? '',
        currency: r.currency,
        amount: r.amount,
        description: r.payment_reference ?? '',
      }}
      trigger={
        <Button size="sm">
          <BanknoteIcon />
          Буцаах
        </Button>
      }
    />
  );
}

/**
 * Every payment to look at in one table, newest day first: a credit nothing matched, an order
 * paid short, money to give back, each marked by its kind and with its own action.
 */
export function PaymentIssuesTable({
  filter,
  page,
  onPage,
}: {
  filter: PaymentFilter;
  page: number;
  onPage: (page: number) => void;
}) {
  const { data, isPending, isPlaceholderData } = useQuery(
    paymentIssuesOptions(filter, page),
  );
  return (
    <>
      <Table className={isPlaceholderData ? 'opacity-60' : undefined}>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Төрөл</TableHead>
            <TableHead>Огноо</TableHead>
            <TableHead>Гэрээ, гүйлгээний утга</TableHead>
            <TableHead>Эзэмшигч, илгээсэн данс</TableHead>
            <TableHead className="text-right">Дүн</TableHead>
            <TableHead className="text-right">Үйлдэл</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows cols={COLS} />
          ) : !data?.items.length ? (
            <TableEmpty cols={COLS} title="Анхаарах төлбөр алга" />
          ) : (
            data.items.map((r) => (
              <TableRow key={`${r.kind}-${r.id}-${r.currency}`}>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                      kindTone[r.kind],
                    )}
                  >
                    {paymentTabLabel[r.kind]}
                  </span>
                </TableCell>
                <TableCell className="tabular whitespace-nowrap">
                  {formatDate(r.day)} {r.tran_time}
                </TableCell>
                <TableCell className="max-w-72 [overflow-wrap:anywhere]">
                  {r.contract_id ? (
                    <>
                      <Link
                        to="/contracts/$contractId"
                        params={{ contractId: r.contract_id }}
                        className="tabular font-medium hover:underline"
                      >
                        {r.contract_no || r.payment_reference}
                      </Link>
                      {r.contract_status && (
                        <div className="mt-1">
                          <ContractStatusBadge status={r.contract_status} />
                        </div>
                      )}
                    </>
                  ) : (
                    r.description || '-'
                  )}
                </TableCell>
                <TableCell className="tabular">
                  {r.counterparty || '-'}
                </TableCell>
                <TableCell className="tabular text-right font-medium">
                  {formatMoney(r.amount, r.currency)}
                </TableCell>
                <TableCell className="text-right">
                  <IssueAction r={r} />
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
