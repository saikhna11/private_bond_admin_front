import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback } from 'react';
import * as z from 'zod';
import { PageTitle } from '@/components/common/page-title';
import { PaymentContractsTable } from '@/components/payment/payment-contracts-table';
import { PaymentFilters } from '@/components/payment/payment-filters';
import { PaymentIssuesTable } from '@/components/payment/payment-issues-table';
import { UnknownCreditsTable } from '@/components/payment/unknown-credits-table';
import { Card } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth';
import { PRIV } from '@/lib/rbac';
import { paymentCountsOptions } from '@/queries/payment/options';
import {
  type PaymentFilter,
  type PaymentView,
  PaymentViewSchema,
} from '@/queries/payment/type';

const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

const searchSchema = z.object({
  tab: PaymentViewSchema.optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
  from: day,
  to: day,
  q: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/bank/payments')({
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient, { privilege: PRIV.paymentList });
  },
  validateSearch: searchSchema,
  component: PaymentsPage,
  staticData: { crumb: 'Анхаарах төлбөр' },
});

/**
 * The payments to look at: credits no order's reference matched, orders paid short, and the
 * money to give back, all of them (the default) or one, picked from a select and narrowed by days and a search, all kept in the
 * address.
 */
function PaymentsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab: PaymentView = search.tab ?? 'all';
  const page = search.page ?? 1;
  const filter: PaymentFilter = {
    from: search.from,
    to: search.to,
    q: search.q,
  };
  const { data: counts } = useQuery(paymentCountsOptions());
  const onPage = (p: number) =>
    navigate({ search: (prev) => ({ ...prev, page: p }) });
  const onTab = (t: PaymentView) =>
    navigate({ search: (prev) => ({ ...prev, tab: t, page: undefined }) });
  const onFilter = useCallback(
    (patch: PaymentFilter) =>
      navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) }),
    [navigate],
  );

  return (
    <>
      <PageTitle
        title="Анхаарах төлбөр"
        description="Захиалгатай автоматаар тулгагдаагүй орлого, дутуу төлсөн захиалга, буцаах мөнгө."
      />
      <Card className="gap-0 py-0">
        <PaymentFilters
          tab={tab}
          filter={filter}
          counts={counts}
          onTab={onTab}
          onFilter={onFilter}
        />
        {tab === 'all' ? (
          <PaymentIssuesTable filter={filter} page={page} onPage={onPage} />
        ) : tab === 'unknown' ? (
          <UnknownCreditsTable filter={filter} page={page} onPage={onPage} />
        ) : (
          <PaymentContractsTable
            tab={tab}
            filter={filter}
            page={page}
            onPage={onPage}
          />
        )}
      </Card>
    </>
  );
}
