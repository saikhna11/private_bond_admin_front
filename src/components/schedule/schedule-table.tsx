import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDay, formatMoney } from '@/lib/format';
import type { ScheduleRowType } from '@/queries/schedule/type';
import { ScheduleStateBadge } from './schedule-state-badge';

/**
 * A repayment schedule (bond.md 7.10): each row's pay date (the rule's date beneath when a
 * weekend or a holiday moved it), days, interest before tax, tax, interest after it,
 * principal, what the holder receives and its state, with their totals. action renders a
 * row's own button.
 */
export function ScheduleTable({
  rows,
  currency,
  action,
}: {
  rows: ScheduleRowType[];
  currency: string;
  action?: (row: ScheduleRowType) => ReactNode;
}) {
  const sum = (
    key: 'gross_interest' | 'tax' | 'net_interest' | 'principal' | 'total',
  ) => rows.reduce((acc, r) => acc + Number(r[key]), 0);
  const money = (v: string | number) => formatMoney(v, currency);
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="w-10">№</TableHead>
          <TableHead>Төлөх өдөр</TableHead>
          <TableHead className="text-right">Хоног</TableHead>
          <TableHead className="text-right">Татварын өмнөх</TableHead>
          <TableHead className="text-right">Татвар</TableHead>
          <TableHead className="text-right">Хүү</TableHead>
          <TableHead className="text-right">Үндсэн төлбөр</TableHead>
          <TableHead className="text-right">Нийт авах</TableHead>
          <TableHead>Төлөв</TableHead>
          {action && <TableHead className="w-10" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.no}>
            <TableCell className="tabular">{r.no}</TableCell>
            <TableCell className="tabular whitespace-nowrap">
              {formatDay(r.pay_date)}
              {r.scheduled_date !== r.pay_date && (
                <span className="block text-xs text-muted-foreground">
                  {formatDay(r.scheduled_date)}-с шилжсэн
                </span>
              )}
              {r.edited && (
                <span className="block text-xs text-warning-foreground dark:text-warning">
                  Гараар засагдсан
                </span>
              )}
            </TableCell>
            <TableCell className="tabular text-right">{r.days}</TableCell>
            <TableCell className="tabular text-right">
              {money(r.gross_interest)}
            </TableCell>
            <TableCell className="tabular text-right text-muted-foreground">
              {money(r.tax)}
            </TableCell>
            <TableCell className="tabular text-right">
              {money(r.net_interest)}
            </TableCell>
            <TableCell className="tabular text-right">
              {Number(r.principal) > 0 ? money(r.principal) : '-'}
            </TableCell>
            <TableCell className="tabular text-right font-medium">
              {money(r.total)}
            </TableCell>
            <TableCell>
              <ScheduleStateBadge state={r.state} />
            </TableCell>
            {action && (
              <TableCell className="text-right">{action(r)}</TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
      {rows.length > 0 && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Нийт</TableCell>
            <TableCell className="tabular text-right">
              {rows.reduce((acc, r) => acc + r.days, 0)}
            </TableCell>
            <TableCell className="tabular text-right">
              {money(sum('gross_interest'))}
            </TableCell>
            <TableCell className="tabular text-right">
              {money(sum('tax'))}
            </TableCell>
            <TableCell className="tabular text-right">
              {money(sum('net_interest'))}
            </TableCell>
            <TableCell className="tabular text-right">
              {money(sum('principal'))}
            </TableCell>
            <TableCell className="tabular text-right">
              {money(sum('total'))}
            </TableCell>
            <TableCell colSpan={action ? 2 : 1} />
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}
