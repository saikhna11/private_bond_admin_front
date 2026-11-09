import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import * as z from 'zod';
import { PageTitle } from '@/components/common/page-title';
import { PaymentContractsTable } from '@/components/payment/payment-contracts-table';
import { UnknownCreditsTable } from '@/components/payment/unknown-credits-table';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireAuth } from '@/lib/auth';
import { PRIV } from '@/lib/rbac';
import { paymentCountsOptions } from '@/queries/payment/options';
import {
  type PaymentTab,
  PaymentTabSchema,
  paymentTabLabel,
} from '@/queries/payment/type';

const searchSchema = z.object({
  tab: PaymentTabSchema.optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
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
 * money to give back.
 */
function PaymentsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab: PaymentTab = search.tab ?? 'unknown';
  const page = search.page ?? 1;
  const { data: counts } = useQuery(paymentCountsOptions());
  const onPage = (p: number) =>
    navigate({ search: (prev) => ({ ...prev, page: p }) });

  return (
    <>
      <PageTitle
        title="Анхаарах төлбөр"
        description="Захиалгатай автоматаар тулгагдаагүй орлого, дутуу төлсөн захиалга, буцаах мөнгө."
      />
      <Card className="gap-0 py-0">
        <div className="border-b p-4">
          <Tabs
            value={tab}
            onValueChange={(v) =>
              navigate({ search: { tab: v as PaymentTab, page: undefined } })
            }
          >
            <TabsList className="w-full sm:w-fit">
              {PaymentTabSchema.options.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {paymentTabLabel[t]}
                  {counts && counts[t] > 0 && (
                    <span className="tabular ml-1 rounded-full bg-primary/12 px-1.5 text-xs text-primary">
                      {counts[t]}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        {tab === 'unknown' ? (
          <UnknownCreditsTable page={page} onPage={onPage} />
        ) : (
          <PaymentContractsTable tab={tab} page={page} onPage={onPage} />
        )}
      </Card>
    </>
  );
}
