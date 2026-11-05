import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { RefreshCwIcon } from 'lucide-react';
import { useCallback } from 'react';
import * as z from 'zod';
import {
  Pagination,
  SearchInput,
  TableEmpty,
  TableSkeletonRows,
} from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toApiError } from '@/lib/fetcher';
import { formatDateTime, formatDay, formatMoney } from '@/lib/format';
import { PAGE_SIZE } from '@/lib/types';
import { cn, showToast } from '@/lib/utils';
import {
  bankKeys,
  companyAccountsOptions,
  statementOptions,
} from '@/queries/bank/options';
import { syncStatement } from '@/queries/bank/query';

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  account_id: z.string().optional().catch(undefined),
  from: z.string().optional().catch(undefined),
  to: z.string().optional().catch(undefined),
  related_account: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/bank/statement')({
  validateSearch: searchSchema,
  component: StatementPage,
  staticData: { crumb: 'Хуулга' },
});

const COLS = 6;

function StatementPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const page = search.page ?? 1;
  const { data, isPending, error, isPlaceholderData } = useQuery(
    statementOptions(search),
  );

  const { data: accounts } = useQuery(companyAccountsOptions());
  // Left out, the API reads the default MNT account.
  const accountId =
    search.account_id ??
    accounts?.find((a) => a.currency === 'MNT' && a.is_default)?.id;

  const setFilter = useCallback(
    (patch: Partial<z.infer<typeof searchSchema>>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) }),
    [navigate],
  );
  const setQ = useCallback(
    (q: string) => setFilter({ q: q || undefined }),
    [setFilter],
  );

  const sync = useMutation({
    mutationFn: syncStatement,
    onSuccess: async ({ stored }) => {
      await queryClient.invalidateQueries({ queryKey: bankKeys.statements() });
      showToast(
        'success',
        stored
          ? `Идэвхтэй бүх данснаас ${stored} мөр хадгалагдлаа.`
          : 'Шинэ гүйлгээ олдсонгүй.',
      );
    },
    onError: (e) => showToast('error', toApiError(e).message),
  });

  const filtered =
    !!search.from || !!search.to || !!search.related_account || !!search.q;

  return (
    <>
      <PageTitle
        title="Банкны хуулга"
        description="Улзий ХХК-ийн корпорацийн дансны хөдөлгөөн."
        action={
          <Button
            variant="outline"
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
          >
            <RefreshCwIcon className={cn(sync.isPending && 'animate-spin')} />
            {sync.isPending ? 'Уншиж байна…' : 'Банкнаас шинэчлэх'}
          </Button>
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-3 border-b p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="space-y-1">
              <span className="block text-xs text-muted-foreground">
                Компанийн данс
              </span>
              <Select
                value={accountId ?? ''}
                onValueChange={(v) => setFilter({ account_id: v })}
                disabled={!accounts?.length}
              >
                <SelectTrigger
                  aria-label="Компанийн данс"
                  className="h-9! w-full sm:w-72"
                >
                  <SelectValue placeholder="Үндсэн MNT данс" />
                </SelectTrigger>
                <SelectContent>
                  {(accounts ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.bank_name} · {a.account_number} ({a.currency})
                      {a.is_default ? ' · үндсэн' : ''}
                      {a.is_active ? '' : ' · идэвхгүй'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label
              htmlFor="statement-from"
              className="space-y-1 text-xs text-muted-foreground"
            >
              <span>Эхлэх өдөр</span>
              <Input
                id="statement-from"
                type="date"
                value={search.from ?? ''}
                onChange={(e) =>
                  setFilter({ from: e.target.value || undefined })
                }
                className="h-9 w-full sm:w-40"
              />
            </label>
            <label
              htmlFor="statement-to"
              className="space-y-1 text-xs text-muted-foreground"
            >
              <span>Дуусах өдөр</span>
              <Input
                id="statement-to"
                type="date"
                value={search.to ?? ''}
                onChange={(e) => setFilter({ to: e.target.value || undefined })}
                className="h-9 w-full sm:w-40"
              />
            </label>
            <label
              htmlFor="statement-account"
              className="space-y-1 text-xs text-muted-foreground"
            >
              <span>Хамаарах данс</span>
              <Input
                id="statement-account"
                value={search.related_account ?? ''}
                onChange={(e) =>
                  setFilter({
                    related_account: e.target.value.trim() || undefined,
                  })
                }
                placeholder="Дансны дугаар"
                className="tabular h-9 w-full sm:w-44"
              />
            </label>
            <div className="space-y-1">
              <span className="block text-xs text-muted-foreground">
                Тайлбар
              </span>
              <SearchInput
                value={search.q ?? ''}
                onChange={setQ}
                placeholder="Тайлбараас хайх"
              />
            </div>
            {filtered && (
              <Button
                variant="ghost"
                className="h-9"
                onClick={() =>
                  navigate({
                    search: { page: undefined, account_id: search.account_id },
                  })
                }
              >
                Шүүлтүүр цэвэрлэх
              </Button>
            )}
          </div>
        </div>

        <Table className={isPlaceholderData ? 'opacity-60' : undefined}>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Огноо</TableHead>
              <TableHead>Тайлбар</TableHead>
              <TableHead>Хамаарах данс</TableHead>
              <TableHead className="text-right">Дүн</TableHead>
              <TableHead className="text-right">Үлдэгдэл</TableHead>
              <TableHead className="pr-4 text-right">Бүртгэгдсэн</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeletonRows cols={COLS} />
            ) : error ? (
              <TableEmpty
                cols={COLS}
                title="Хуулгыг ачаалж чадсангүй"
                text={toApiError(error).message}
              />
            ) : !data?.items.length ? (
              <TableEmpty
                cols={COLS}
                title="Хуулга хоосон байна"
                text="Банкнаас шинэчлэх товчоор хамгийн сүүлийн гүйлгээг уншина уу."
              />
            ) : (
              data.items.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="tabular pl-4 whitespace-nowrap">
                    {formatDay(e.tran_date)}
                    {e.tran_time && (
                      <span className="ml-1.5 text-muted-foreground">
                        {e.tran_time}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-72 truncate">
                      {e.description || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </p>
                  </TableCell>
                  <TableCell className="tabular font-mono text-xs">
                    {e.related_account || (
                      <span className="font-sans text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'tabular text-right font-medium whitespace-nowrap',
                      Number(e.amount) > 0 && 'text-success',
                    )}
                  >
                    {formatMoney(e.amount, e.currency)}
                  </TableCell>
                  <TableCell className="tabular text-right whitespace-nowrap text-muted-foreground">
                    {formatMoney(e.balance, e.currency)}
                  </TableCell>
                  <TableCell className="tabular pr-4 text-right text-xs whitespace-nowrap text-muted-foreground">
                    {formatDateTime(e.created_at)}
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
            onPage={(p) =>
              navigate({ search: (prev) => ({ ...prev, page: p }) })
            }
          />
        )}
      </Card>
    </>
  );
}
