import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  AlertTriangleIcon,
  CircleCheckIcon,
  ClockIcon,
  RefreshCwIcon,
  WifiOffIcon,
} from 'lucide-react';
import { CurrencyTag, DefaultBadge } from '@/components/bank/account-badges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCan } from '@/hooks/use-can';
import { toApiError } from '@/lib/fetcher';
import { formatAmount, formatDateTime, formatDay } from '@/lib/format';
import { PRIV } from '@/lib/rbac';
import { cn, showToast } from '@/lib/utils';
import { bankKeys, companyBalancesOptions } from '@/queries/bank/options';
import { syncStatement } from '@/queries/bank/query';
import type { BalanceState, CompanyBalanceType } from '@/queries/bank/type';

const states: Record<
  BalanceState,
  { label: string; className: string; Icon: typeof ClockIcon }
> = {
  matched: {
    label: 'Хуулгатай тохирч байна',
    className: 'bg-success/12 text-success',
    Icon: CircleCheckIcon,
  },
  awaiting_statement: {
    label: 'Шилжүүлэг хуулгад орохыг хүлээж байна',
    className: 'bg-warning/15 text-warning-foreground dark:text-warning',
    Icon: ClockIcon,
  },
  statement_behind: {
    label: 'Хуулгатай зөрүүтэй',
    className: 'bg-warning/15 text-warning-foreground dark:text-warning',
    Icon: AlertTriangleIcon,
  },
  bank_unavailable: {
    label: 'Банк хариу өгсөнгүй',
    className: 'bg-destructive/10 text-destructive',
    Icon: WifiOffIcon,
  },
};

/** Each active company account's balance, checked against the statement and the transfers. */
export function CompanyBalanceCards() {
  const can = useCan();
  const queryClient = useQueryClient();
  const { data, isPending, isFetching, error, refetch } = useQuery(
    companyBalancesOptions(),
  );
  const sync = useMutation({
    mutationFn: syncStatement,
    onSuccess: async ({ stored }) => {
      await queryClient.invalidateQueries({ queryKey: bankKeys.all });
      showToast(
        'success',
        stored
          ? `Хуулгаас ${stored} шинэ мөр хадгалагдлаа.`
          : 'Шинэ гүйлгээ олдсонгүй.',
      );
    },
    onError: (e) => showToast('error', toApiError(e).message),
  });

  // Each currency's default first, as the table below orders them.
  const items = [...(data ?? [])].sort(
    (a, b) =>
      a.account.currency.localeCompare(b.account.currency) ||
      Number(b.account.is_default) - Number(a.account.is_default),
  );

  return (
    <section className="mb-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Дансны үлдэгдэл</h2>
          <p className="text-sm text-muted-foreground">
            Банкны одоогийн үлдэгдлийг хуулгын сүүлийн мөр болон хуулгад ороогүй
            шилжүүлэгтэй тулгана.
          </p>
        </div>
        <div className="flex gap-2">
          {can(PRIV.statementSync) && (
            <Button
              variant="outline"
              size="sm"
              disabled={sync.isPending}
              onClick={() => sync.mutate()}
            >
              <RefreshCwIcon className={cn(sync.isPending && 'animate-spin')} />
              Хуулга татах
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCwIcon className={cn(isFetching && 'animate-spin')} />
            Шинэчлэх
          </Button>
        </div>
      </div>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : error ? (
        <Card className="p-4 text-sm text-destructive">
          Үлдэгдлийг ачаалж чадсангүй: {toApiError(error).message}
        </Card>
      ) : !items.length ? (
        <Card className="p-4 text-sm text-muted-foreground">
          Идэвхтэй компанийн данс алга.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((b) => (
            <BalanceCard key={b.account.id} balance={b} />
          ))}
        </div>
      )}
    </section>
  );
}

function BalanceCard({ balance: b }: { balance: CompanyBalanceType }) {
  const can = useCan();
  const cur = b.account.currency;
  const state = states[b.state];
  const differs = Number(b.difference) !== 0;

  return (
    <Card className="gap-0 p-0">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b p-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium">
            {b.account.bank_name}
            <span className="tabular font-mono text-sm text-muted-foreground">
              {b.account.account_number}
            </span>
            {b.account.is_default && <DefaultBadge />}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {b.account.account_name}
          </p>
        </div>
        <CurrencyTag currency={cur} />
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground">Банкны үлдэгдэл</p>
        {b.bank ? (
          <>
            <p className="tabular text-2xl font-semibold">
              {formatAmount(b.bank.balance, cur)}
            </p>
            <p className="tabular text-xs text-muted-foreground">
              Боломжит {formatAmount(b.bank.available, cur)}
              {Number(b.bank.hold) !== 0 &&
                ` · Хаалттай ${formatAmount(b.bank.hold, cur)}`}
            </p>
          </>
        ) : (
          <p className="text-sm text-destructive">
            Банкнаас уншиж чадсангүй ({b.bank_error})
          </p>
        )}

        <span
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
            state.className,
          )}
        >
          <state.Icon className="size-3.5" />
          {state.label}
        </span>

        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Хуулгын үлдэгдэл</dt>
          <dd className="tabular text-right">
            {b.statement ? (
              <>
                {formatAmount(b.statement.balance, cur)}
                <span className="block text-xs text-muted-foreground">
                  №{b.statement.record_no} · {formatDay(b.statement.tran_date)}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Хуулга татаагүй</span>
            )}
          </dd>

          {b.bank && (
            <>
              <dt className="text-muted-foreground">Зөрүү (банк − хуулга)</dt>
              <dd
                className={cn(
                  'tabular text-right',
                  differs && 'font-medium text-destructive',
                )}
              >
                {formatAmount(b.difference, cur)}
              </dd>
            </>
          )}

          <dt className="text-muted-foreground">Хуулгад ороогүй шилжүүлэг</dt>
          <dd className="tabular text-right">
            {b.unreconciled_count ? (
              can(PRIV.transferList) ? (
                <Link
                  to="/bank/transfers"
                  className="underline-offset-4 hover:underline"
                >
                  {b.unreconciled_count} ·{' '}
                  {formatAmount(b.unreconciled_amount, cur)}
                </Link>
              ) : (
                `${b.unreconciled_count} · ${formatAmount(b.unreconciled_amount, cur)}`
              )
            ) : (
              <span className="text-muted-foreground">Байхгүй</span>
            )}
          </dd>

          {b.statement?.synced_at && (
            <>
              <dt className="text-muted-foreground">Хуулга сүүлд татсан</dt>
              <dd className="tabular text-right">
                {formatDateTime(b.statement.synced_at)}
              </dd>
            </>
          )}
        </dl>
      </div>
    </Card>
  );
}
