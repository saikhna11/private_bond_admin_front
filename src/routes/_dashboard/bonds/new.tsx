import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { BondFormFields } from '@/components/bond/bond-form-fields';
import { RateOptionMatrix } from '@/components/bond/rate-option-matrix';
import {
  type BondFormValues,
  bondBody,
  bondFieldNames,
  rateOptionBodies,
  useBondForm,
} from '@/components/bond/use-bond-form';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import { PRIV } from '@/lib/rbac';
import { showToast } from '@/lib/utils';
import { bondKeys } from '@/queries/bond/options';
import { createBond } from '@/queries/bond/query';

export const Route = createFileRoute('/_dashboard/bonds/new')({
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient, { privilege: PRIV.bondCreate });
  },
  component: NewBondPage,
  staticData: { crumb: 'Шинэ бонд' },
});

function NewBondPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useBondForm();
  const [error, setError] = useState<ApiError | null>(null);

  async function submit(v: BondFormValues) {
    setError(null);
    try {
      const d = await createBond({
        ...bondBody(v),
        rate_options: rateOptionBodies(v),
      });
      showToast('success', 'Бонд ноорог болж хадгалагдлаа');
      await queryClient.invalidateQueries({ queryKey: bondKeys.all });
      await navigate({ to: '/bonds/$bondId', params: { bondId: d.id } });
    } catch (err) {
      const e = toApiError(err);
      if (!applyFieldErrors(e, form.setError, bondFieldNames)) setError(e);
    }
  }

  return (
    <>
      <Link
        to="/bonds"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Бонд
      </Link>
      <PageTitle
        title="Бонд бүртгэх"
        description="Бонд ноорог болж хадгалагдана: харилцагчид харагдахгүй. Нүүр зураг, танилцуулгын файлаа оруулж шалгаад нийтэлнэ."
      />
      <form
        onSubmit={form.handleSubmit(submit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <Card className="py-0">
          <CardContent className="p-6">
            <BondFormFields
              form={form}
              rateOptions={<RateOptionMatrix form={form} />}
            />
          </CardContent>
        </Card>
        {/* The error sits in the bar, so it shows wherever the form is scrolled. */}
        <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur supports-backdrop-filter:bg-card/80">
          <ApiErrorAlert error={error} />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Ноорог болж хадгалагдана
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" asChild>
                <Link to="/bonds">Болих</Link>
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2Icon className="animate-spin" />
                )}
                Бүртгэх
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
