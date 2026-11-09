import { useQuery } from '@tanstack/react-query';
import { CalendarClockIcon, PencilIcon } from 'lucide-react';
import { EditScheduleRowDialog } from '@/components/schedule/edit-schedule-row-dialog';
import { ScheduleTable } from '@/components/schedule/schedule-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCan } from '@/hooks/use-can';
import { formatDateTime, formatDay, formatMoney } from '@/lib/format';
import { PRIV } from '@/lib/rbac';
import {
  contractScheduleOptions,
  scheduleEditsOptions,
} from '@/queries/schedule/options';

const editLabel: Record<string, string> = {
  pay_date: 'Төлөх өдөр',
  gross_interest: 'Татварын өмнөх',
  net_interest: 'Хүү',
  principal: 'Үндсэн',
  total: 'Нийт',
};

/**
 * The contract's repayment schedule (bond.md 7): stored once it is paid, each unpaid row
 * editable with a reason (9.4); before, what it would be if paid today. Below it, the edits
 * the audit log kept.
 */
export function ContractScheduleCard({ contractId }: { contractId: string }) {
  const can = useCan();
  const { data, isPending } = useQuery(contractScheduleOptions(contractId));
  const { data: edits } = useQuery(scheduleEditsOptions(contractId));
  if (isPending || !data || data.rows.length === 0) return null;
  const editable = !data.projected && can(PRIV.scheduleUpdate);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Эргэн төлөлтийн хуваарь</CardTitle>
        {data.projected && (
          <p className="text-sm text-muted-foreground">
            Төлбөр ороогүй тул өнөөдөр төлөгдвөл ямар байхыг харуулж байна.
            Хуваарь төлбөр орсон өдрөөс эхэлнэ.
          </p>
        )}
        {data.missing_years.length > 0 && (
          <p className="flex items-center gap-2 text-sm text-warning-foreground dark:text-warning">
            <CalendarClockIcon className="size-4 shrink-0" />
            {data.missing_years.join(', ')} оны баярын өдрүүд бүртгэгдээгүй тул
            зөвхөн бямба, ням гарагийг тооцсон. Бүртгэхэд дахин тооцогдоно.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 px-0 sm:px-6">
        <div className="overflow-x-auto">
          <ScheduleTable
            rows={data.rows}
            currency={data.currency}
            action={
              editable
                ? (row) =>
                    row.state === 'unpaid' ? (
                      <EditScheduleRowDialog
                        contractId={contractId}
                        currency={data.currency}
                        row={row}
                        trigger={
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`${row.no}-р мөр засах`}
                          >
                            <PencilIcon />
                          </Button>
                        }
                      />
                    ) : null
                : undefined
            }
          />
        </div>
        {edits && edits.length > 0 && (
          <div className="space-y-2 px-4 sm:px-0">
            <p className="text-sm font-medium">Засварын түүх</p>
            <ul className="space-y-2 text-sm">
              {edits.map((e) => (
                <li
                  key={`${e.row_no}-${e.created_at}`}
                  className="rounded-lg border p-3"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium">
                      {e.row_no}-р мөр · {e.actor_name || 'Устгагдсан ажилтан'}
                    </span>
                    <span className="tabular text-muted-foreground">
                      {formatDateTime(e.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{e.reason}</p>
                  <ul className="mt-1 space-y-0.5 text-xs">
                    {Object.keys(editLabel)
                      .filter((k) => e.before[k] !== e.after[k])
                      .map((k) => (
                        <li key={k} className="tabular">
                          {editLabel[k]}:{' '}
                          {k === 'pay_date'
                            ? `${formatDay(e.before[k])} → ${formatDay(e.after[k])}`
                            : `${formatMoney(e.before[k] ?? '0', data.currency)} → ${formatMoney(e.after[k] ?? '0', data.currency)}`}
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
