import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BanknoteIcon } from 'lucide-react';
import * as z from 'zod';
import { TransferDialog } from '@/components/bank/transfer-dialog';
import {
  Pagination,
  TableEmpty,
  TableSkeletonRows,
} from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCan } from '@/hooks/use-can';
import { requireAuth } from '@/lib/auth';
import { formatDay, formatMoney } from '@/lib/format';
import { PRIV } from '@/lib/rbac';
import { PAGE_SIZE } from '@/lib/types';
import {
  duePayoutsOptions,
  issuerSchedulesOptions,
} from '@/queries/schedule/options';

const TabSchema = z.enum(['payouts', 'issuers']);
type Tab = z.infer<typeof TabSchema>;

const searchSchema = z.object({
  tab: TabSchema.optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
  from: z.string().optional().catch(undefined),
  to: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/bank/repayments')({
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient, { privilege: PRIV.scheduleList });
  },
  validateSearch: searchSchema,
  component: RepaymentsPage,
  staticData: { crumb: 'Эргэн төлөлт' },
});

/** A day as the API writes it, YYYY-MM-DD, in local time. */
function isoDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * The repayments (bond.md 8): the schedule rows due that the admins pay out to the holders,
 * one transfer each, and the issuers' schedules, what each issuer transfers per pay date.
 */
function RepaymentsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab: Tab = search.tab ?? 'payouts';
  return (
    <>
      <PageTitle
        title="Эргэн төлөлт"
        description="Хөрөнгө оруулагчдад олгох хүү, үндсэн төлбөр ба бонд гаргагчийн төлөх хуваарь."
      />
      <Tabs
        value={tab}
        onValueChange={(v) => navigate({ search: { tab: v as Tab } })}
      >
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="payouts">Олгох төлбөр</TabsTrigger>
          <TabsTrigger value="issuers">Бонд гаргагчийн хуваарь</TabsTrigger>
        </TabsList>
      </Tabs>
      {tab === 'payouts' ? (
        <PayoutsTable
          page={search.page ?? 1}
          onPage={(p) => navigate({ search: (prev) => ({ ...prev, page: p }) })}
        />
      ) : (
        <IssuerSchedules
          from={search.from}
          to={search.to}
          onRange={(from, to) =>
            navigate({ search: (prev) => ({ ...prev, from, to }) })
          }
        />
      )}
    </>
  );
}

/** The rows due today or before that no payout pays yet, each paid with its own transfer. */
function PayoutsTable({
  page,
  onPage,
}: {
  page: number;
  onPage: (page: number) => void;
}) {
  const { data, isPending, isPlaceholderData } = useQuery(
    duePayoutsOptions(page),
  );
  const can = useCan();
  const pay = can(PRIV.transferCreate);
  const cols = pay ? 7 : 6;
  return (
    <Card className="gap-0 py-0">
      <div className="overflow-x-auto">
        <Table className={isPlaceholderData ? 'opacity-60' : undefined}>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Төлөх өдөр</TableHead>
              <TableHead>Гэрээ</TableHead>
              <TableHead>Төлбөр</TableHead>
              <TableHead>Хүлээн авах данс</TableHead>
              <TableHead className="text-right">Хүү</TableHead>
              <TableHead className="text-right">Нийт олгох</TableHead>
              {pay && <TableHead className="text-right">Үйлдэл</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeletonRows cols={cols} />
            ) : !data?.items.length ? (
              <TableEmpty
                cols={cols}
                title="Өнөөдрийн байдлаар олгох төлбөр алга"
              />
            ) : (
              data.items.map((p) => {
                const last = p.row_no === p.row_count;
                return (
                  <TableRow key={`${p.contract_id}-${p.row_no}`}>
                    <TableCell className="tabular whitespace-nowrap">
                      {formatDay(p.pay_date)}
                      {p.failed_before && (
                        <span className="block text-xs text-destructive">
                          Өмнөх шилжүүлэг амжилтгүй
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {can(PRIV.contractList) ? (
                        <Link
                          to="/contracts/$contractId"
                          params={{ contractId: p.contract_id }}
                          className="tabular font-medium hover:underline"
                        >
                          {p.contract_no}
                        </Link>
                      ) : (
                        <span className="tabular font-medium">
                          {p.contract_no}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {p.row_no}/{p.row_count}
                      {last && (
                        <span className="block text-xs text-muted-foreground">
                          Үндсэн төлбөртэй
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.repayment_bank_name} · {p.repayment_account_no}
                      <span className="block text-xs text-muted-foreground">
                        {p.repayment_owner}
                      </span>
                    </TableCell>
                    <TableCell className="tabular text-right">
                      {formatMoney(p.net_interest, p.currency)}
                    </TableCell>
                    <TableCell className="tabular text-right font-medium">
                      {formatMoney(p.total, p.currency)}
                    </TableCell>
                    {pay && (
                      <TableCell className="text-right">
                        <TransferDialog
                          payout={{
                            contractId: p.contract_id,
                            contractLabel: p.contract_no,
                            rowNo: p.row_no,
                            rowCount: p.row_count,
                            userId: p.holder_id,
                            currency: p.currency,
                            amount: p.total,
                            iban: p.repayment_iban,
                            purpose: last ? 'principal' : 'coupon',
                            description: `${p.contract_no} ${p.row_no}-р ${last ? 'хүү, үндсэн төлбөр' : 'хүү'}`,
                          }}
                          trigger={
                            <Button size="sm">
                              <BanknoteIcon />
                              Олгох
                            </Button>
                          }
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {data && data.total > 0 && (
        <Pagination
          page={page}
          size={PAGE_SIZE}
          total={data.total}
          onPage={onPage}
        />
      )}
    </Card>
  );
}

/** Each bond's issuer schedule between two days: per pay date, what its issuer transfers. */
function IssuerSchedules({
  from,
  to,
  onRange,
}: {
  from?: string;
  to?: string;
  onRange: (from: string, to: string) => void;
}) {
  const today = new Date();
  const start =
    from ?? isoDay(new Date(today.getFullYear(), today.getMonth(), 1));
  const end =
    to ?? isoDay(new Date(today.getFullYear(), today.getMonth() + 3, 0));
  const { data, isPending } = useQuery(issuerSchedulesOptions(start, end));
  return (
    <>
      <div className="flex flex-wrap items-end gap-2">
        <Input
          type="date"
          aria-label="Эхлэх өдөр"
          className="h-9 w-40"
          value={start}
          onChange={(e) => e.target.value && onRange(e.target.value, end)}
        />
        <span className="pb-2 text-muted-foreground">–</span>
        <Input
          type="date"
          aria-label="Дуусах өдөр"
          className="h-9 w-40"
          value={end}
          onChange={(e) => e.target.value && onRange(start, e.target.value)}
        />
      </div>
      {isPending ? (
        <p className="text-sm text-muted-foreground">Уншиж байна…</p>
      ) : !data?.length ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Хуваарьтай бонд алга.
          </CardContent>
        </Card>
      ) : (
        data.map((b) => (
          <Card key={b.bond_id} className="gap-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-wrap items-baseline gap-2">
                <span className="tabular">{b.bond_code}</span>
                <span className="text-base font-normal text-muted-foreground">
                  {b.bond_name} · төлөх өдөр {b.issuer_cutoff}-аас өмнө
                </span>
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Төлөх өдөр</TableHead>
                    <TableHead className="text-right">
                      Хөрөнгө оруулагч
                    </TableHead>
                    <TableHead className="text-right">Татварын өмнөх</TableHead>
                    <TableHead className="text-right">Татвар</TableHead>
                    <TableHead className="text-right">
                      Хөрөнгө оруулагчдад хүү
                    </TableHead>
                    <TableHead className="text-right">Үндсэн төлбөр</TableHead>
                    <TableHead className="text-right">Шилжүүлэх нийт</TableHead>
                    <TableHead className="text-right">Олгосон</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {b.days.length === 0 ? (
                    <TableEmpty cols={8} title="Энэ хугацаанд төлбөр алга" />
                  ) : (
                    b.days.map((d) => (
                      <TableRow key={d.pay_date}>
                        <TableCell className="tabular">
                          {formatDay(d.pay_date)}
                        </TableCell>
                        <TableCell className="tabular text-right">
                          {d.investors}
                        </TableCell>
                        <TableCell className="tabular text-right">
                          {formatMoney(d.gross_interest, b.currency)}
                        </TableCell>
                        <TableCell className="tabular text-right text-muted-foreground">
                          {formatMoney(d.tax, b.currency)}
                        </TableCell>
                        <TableCell className="tabular text-right">
                          {formatMoney(d.net_interest, b.currency)}
                        </TableCell>
                        <TableCell className="tabular text-right">
                          {Number(d.principal) > 0
                            ? formatMoney(d.principal, b.currency)
                            : '-'}
                        </TableCell>
                        <TableCell className="tabular text-right font-medium">
                          {formatMoney(d.total, b.currency)}
                        </TableCell>
                        <TableCell className="tabular text-right">
                          <span
                            className={
                              d.paid === d.investors
                                ? 'text-success'
                                : 'text-muted-foreground'
                            }
                          >
                            {d.paid}/{d.investors}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        ))
      )}
    </>
  );
}
