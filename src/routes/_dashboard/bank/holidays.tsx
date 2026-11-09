import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { TableEmpty, TableSkeletonRows } from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCan } from '@/hooks/use-can';
import { toApiError } from '@/lib/fetcher';
import { formatDay } from '@/lib/format';
import { PRIV } from '@/lib/rbac';
import { showToast } from '@/lib/utils';
import { bankKeys, holidaysOptions } from '@/queries/bank/options';
import { createHoliday, deleteHoliday } from '@/queries/bank/query';
import type { HolidayChangeType } from '@/queries/bank/type';
import { scheduleKeys } from '@/queries/schedule/options';

/** What a holiday change did to the schedules (bond.md 9.2, 9.5). */
function recalcText(c: HolidayChangeType): string {
  const moved =
    c.recalculated > 0
      ? `Төлөгдөөгүй ${c.recalculated} мөрийг дахин тооцлоо.`
      : 'Хуваарьт өөрчлөлт ороогүй.';
  if (c.skipped.length === 0) return moved;
  const rows = c.skipped
    .map((s) => `${s.contract_no} ${s.row_no}-р мөр`)
    .join(', ');
  return `${moved} Гараар засагдсан мөрийг тооцоогүй, шаардлагатай бол засна уу: ${rows}.`;
}

const searchSchema = z.object({
  year: z.number().int().min(2000).max(2100).optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/bank/holidays')({
  validateSearch: searchSchema,
  component: HolidaysPage,
  staticData: { crumb: 'Баярын өдөр' },
});

const weekday = [
  'Ням',
  'Даваа',
  'Мягмар',
  'Лхагва',
  'Пүрэв',
  'Баасан',
  'Бямба',
];

/** The weekday of a YYYY-MM-DD day. */
function weekdayOf(day: string): string {
  return weekday[new Date(`${day}T00:00:00Z`).getUTCDay()];
}

/**
 * The public holidays of one year (bond.md 10): the finance office enters next year's each
 * year. Saturdays and Sundays never work and are not listed.
 */
function HolidaysPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const year = search.year ?? new Date().getFullYear();
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(holidaysOptions(year));
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const can = useCan();
  const canCreate = can(PRIV.holidayCreate);
  const canDelete = can(PRIV.holidayDelete);
  const cols = canDelete ? 4 : 3;

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: bankKeys.holidays() });

  async function add() {
    setError('');
    setSaving(true);
    try {
      const change = await createHoliday(date, name.trim());
      showToast(
        change.skipped.length > 0 ? 'warning' : 'success',
        `${formatDay(date)} баярын өдөр боллоо. ${recalcText(change)}`,
        change.skipped.length > 0 ? 10000 : undefined,
      );
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      setDate('');
      setName('');
      await refresh();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageTitle
        title="Баярын өдөр"
        description="Банк болон эргэн төлөлт ажиллахгүй өдрүүд. Бямба, ням гараг үргэлж амралтын өдөр тул энд бүртгэхгүй."
      />
      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Өмнөх он"
              onClick={() => navigate({ search: { year: year - 1 } })}
            >
              <ChevronLeftIcon />
            </Button>
            <span className="tabular w-14 text-center text-lg font-semibold">
              {year}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Дараагийн он"
              onClick={() => navigate({ search: { year: year + 1 } })}
            >
              <ChevronRightIcon />
            </Button>
          </div>
          {canCreate && (
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void add();
              }}
            >
              <Input
                type="date"
                aria-label="Огноо"
                className="h-9 w-40"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                aria-label="Нэр"
                placeholder="Нэр (заавал биш)"
                maxLength={100}
                className="h-9 w-56"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button type="submit" disabled={!date || saving}>
                {saving ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <PlusIcon />
                )}
                Нэмэх
              </Button>
            </form>
          )}
          {error && <p className="w-full text-sm text-destructive">{error}</p>}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Огноо</TableHead>
              <TableHead>Гараг</TableHead>
              <TableHead>Нэр</TableHead>
              {canDelete && (
                <TableHead className="text-right">Үйлдэл</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeletonRows cols={cols} />
            ) : !data?.length ? (
              <TableEmpty
                cols={cols}
                title={`${year} оны баярын өдөр бүртгэгдээгүй`}
              />
            ) : (
              data.map((h) => (
                <TableRow key={h.date}>
                  <TableCell className="tabular">{formatDay(h.date)}</TableCell>
                  <TableCell>{weekdayOf(h.date)}</TableCell>
                  <TableCell>{h.name || '-'}</TableCell>
                  {canDelete && (
                    <TableCell className="text-right">
                      <ConfirmDialog
                        trigger={
                          <Button size="sm" variant="ghost">
                            <Trash2Icon />
                            Устгах
                          </Button>
                        }
                        title="Баярын өдрийг устгах уу?"
                        description={`${formatDay(h.date)} ажлын өдөр болно.`}
                        confirmLabel="Устгах"
                        tone="destructive"
                        onConfirm={async () => {
                          const change = await deleteHoliday(h.date);
                          showToast(
                            change.skipped.length > 0 ? 'warning' : 'success',
                            `Устгалаа. ${recalcText(change)}`,
                            change.skipped.length > 0 ? 10000 : undefined,
                          );
                          await queryClient.invalidateQueries({
                            queryKey: scheduleKeys.all,
                          });
                          await refresh();
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
