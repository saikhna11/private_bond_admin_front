import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowRightIcon, PlusIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import * as z from 'zod';
import { ClientPicker } from '@/components/bank/client-picker';
import { IssuerPicker } from '@/components/bank/issuer-picker';
import { TransferDialog } from '@/components/bank/transfer-dialog';
import { TransferStatusBadge } from '@/components/bank/transfer-status-badge';
import {
  FilterSelect,
  Pagination,
  TableEmpty,
  TableSkeletonRows,
} from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toApiError } from '@/lib/fetcher';
import { formatDateTime, formatMoney } from '@/lib/format';
import { PAGE_SIZE } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  companyAccountsOptions,
  transferOptions,
  transfersOptions,
} from '@/queries/bank/options';
import {
  type BankTransferType,
  recipientTypeLabel,
  TransferStatusSchema,
  transferPurposeLabel,
  transferStatusLabel,
} from '@/queries/bank/type';
import { clientOptions } from '@/queries/client/options';
import { issuerOptions } from '@/queries/issuer/options';

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  user_id: z.string().optional().catch(undefined),
  bond_issuer_id: z.string().optional().catch(undefined),
  from_account: z.string().optional().catch(undefined),
  status: TransferStatusSchema.optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/bank/transfers')({
  validateSearch: searchSchema,
  component: TransfersPage,
  staticData: { crumb: 'Шилжүүлэг' },
});

const COLS = 8;

/** The client behind a transfer's user id, once their record is read. */
function ClientName({
  id,
  fallback = true,
}: {
  id: string;
  fallback?: boolean;
}) {
  const { data } = useQuery({ ...clientOptions(id), staleTime: 60_000 });
  const name = data
    ? data.name ||
      [data.last_name, data.first_name].filter(Boolean).join(' ') ||
      data.email ||
      data.phone
    : undefined;
  if (name) return <>{name}</>;
  return fallback ? (
    <span className="tabular font-mono text-xs text-muted-foreground">
      {id.slice(0, 8)}…
    </span>
  ) : null;
}

/** The bond issuer behind a transfer's issuer id, once its record is read. */
function IssuerName({ id }: { id: string }) {
  const { data } = useQuery({ ...issuerOptions(id), staleTime: 60_000 });
  if (data) return <>{data.name}</>;
  return (
    <span className="tabular font-mono text-xs text-muted-foreground">
      {id.slice(0, 8)}…
    </span>
  );
}

/** Who a transfer paid: a client or a bond issuer, with the id. */
function Recipient({ t }: { t: BankTransferType }) {
  const id = t.recipient_type === 'issuer' ? t.bond_issuer_id : t.user_id;
  return (
    <>
      <p className="flex max-w-56 items-center gap-1.5 font-medium">
        <span className="truncate">
          {!id ? (
            '-'
          ) : t.recipient_type === 'issuer' ? (
            <IssuerName id={id} />
          ) : (
            <ClientName id={id} />
          )}
        </span>
      </p>
      <p className="text-xs text-muted-foreground">
        {recipientTypeLabel[t.recipient_type]}
      </p>
    </>
  );
}

function TransfersPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const page = search.page ?? 1;
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isPending, error, isPlaceholderData } = useQuery(
    transfersOptions(search),
  );

  const setFilter = useCallback(
    (patch: Partial<z.infer<typeof searchSchema>>) =>
      navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) }),
    [navigate],
  );

  const { data: companyAccounts } = useQuery(companyAccountsOptions());
  const filtered =
    !!search.user_id ||
    !!search.bond_issuer_id ||
    !!search.from_account ||
    !!search.status;

  return (
    <>
      <PageTitle
        title="Шилжүүлэг"
        description="Компанийн данснаас харилцагч эсвэл бонд гаргагчийн бүртгэлтэй данс руу хийсэн төлбөр."
        action={
          <TransferDialog
            initialUserId={search.user_id}
            trigger={
              <Button>
                <PlusIcon />
                Шинэ шилжүүлэг
              </Button>
            }
          />
        }
      />

      <Card className="gap-0 py-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="space-y-1">
            <span className="block text-xs text-muted-foreground">
              Харилцагч
            </span>
            <ClientPicker
              clearable
              value={search.user_id}
              onChange={(id) => setFilter({ user_id: id })}
            />
          </div>
          <div className="space-y-1">
            <span className="block text-xs text-muted-foreground">
              Бонд гаргагч
            </span>
            <IssuerPicker
              clearable
              value={search.bond_issuer_id}
              onChange={(id) => setFilter({ bond_issuer_id: id })}
            />
          </div>
          <div className="space-y-1">
            <span className="block text-xs text-muted-foreground">
              Илгээгч данс
            </span>
            <FilterSelect
              value={search.from_account}
              onChange={(from_account) => setFilter({ from_account })}
              allLabel="Бүх данс"
              options={(companyAccounts ?? []).map((a) => ({
                value: a.account_number,
                label: `${a.bank_name} · ${a.account_number} (${a.currency})`,
              }))}
            />
          </div>
          <div className="space-y-1">
            <span className="block text-xs text-muted-foreground">Төлөв</span>
            <FilterSelect
              value={search.status}
              onChange={(status) => setFilter({ status })}
              allLabel="Бүх төлөв"
              options={TransferStatusSchema.options.map((s) => ({
                value: s,
                label: transferStatusLabel[s],
              }))}
            />
          </div>
          {filtered && (
            <Button
              variant="ghost"
              className="h-9"
              onClick={() => navigate({ search: { page: undefined } })}
            >
              Шүүлтүүр цэвэрлэх
            </Button>
          )}
        </div>

        <Table className={isPlaceholderData ? 'opacity-60' : undefined}>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Огноо</TableHead>
              <TableHead>Хүлээн авагч</TableHead>
              <TableHead>Хүлээн авах данс</TableHead>
              <TableHead>Илгээгч данс</TableHead>
              <TableHead className="text-right">Дүн</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead>Тайлбар</TableHead>
              <TableHead className="pr-4 text-right">Гүйлгээ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeletonRows cols={COLS} />
            ) : error ? (
              <TableEmpty
                cols={COLS}
                title="Шилжүүлгийг ачаалж чадсангүй"
                text={toApiError(error).message}
              />
            ) : !data?.items.length ? (
              <TableEmpty
                cols={COLS}
                title="Шилжүүлэг олдсонгүй"
                text="Шинэ шилжүүлэг илгээх эсвэл шүүлтүүрээ өөрчилж үзнэ үү."
              />
            ) : (
              data.items.map((t) => (
                <TableRow
                  key={t.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(t.id)}
                >
                  <TableCell className="tabular pl-4 whitespace-nowrap">
                    {formatDateTime(t.created_at)}
                  </TableCell>
                  <TableCell>
                    <Recipient t={t} />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {t.to_bank_name || t.to_bank_code} · {t.to_account}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.to_holder_name}
                    </p>
                  </TableCell>
                  <TableCell className="tabular font-mono text-xs whitespace-nowrap">
                    {t.from_account}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'tabular text-right font-medium whitespace-nowrap',
                      t.direction === 'inbound' && 'text-success',
                    )}
                  >
                    {t.direction === 'inbound' ? '+' : ''}
                    {formatMoney(t.amount, t.currency)}
                    <p className="text-xs font-normal text-muted-foreground">
                      {t.direction === 'inbound' ? 'Орлого' : 'Зарлага'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <TransferStatusBadge status={t.status} />
                  </TableCell>
                  <TableCell>
                    <p className="max-w-56 truncate text-muted-foreground">
                      {t.description || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="tabular pr-4 text-right font-mono text-xs whitespace-nowrap text-muted-foreground">
                    {t.transaction_number}
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

      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <TransferDetail
              id={selected}
              onClose={() => setSelected(null)}
              onRecipient={(t) => {
                setSelected(null);
                setFilter(
                  t.recipient_type === 'issuer'
                    ? {
                        bond_issuer_id: t.bond_issuer_id,
                        user_id: undefined,
                        status: undefined,
                      }
                    : {
                        user_id: t.user_id,
                        bond_issuer_id: undefined,
                        status: undefined,
                      },
                );
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function TransferDetail({
  id,
  onClose,
  onRecipient,
}: {
  id: string;
  onClose: () => void;
  onRecipient: (t: BankTransferType) => void;
}) {
  const { data: t, isPending, error } = useQuery(transferOptions(id));

  if (isPending) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (error || !t) {
    return (
      <div className="p-4">
        <SheetHeader>
          <SheetTitle>Шилжүүлэг</SheetTitle>
        </SheetHeader>
        <p className="mt-6 text-sm text-muted-foreground">
          {error ? toApiError(error).message : 'Олдсонгүй.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <SheetHeader className="border-b p-4 pr-12">
        <div className="flex items-center gap-2">
          <TransferStatusBadge status={t.status} />
        </div>
        <SheetTitle className="tabular text-xl">
          {formatMoney(t.amount, t.currency)}
        </SheetTitle>
        <SheetDescription>
          {formatDateTime(t.created_at)} · {t.transaction_number}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 p-4">
        <section className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {recipientTypeLabel[t.recipient_type]}
          </h3>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
            onClick={() => onRecipient(t)}
          >
            <span>
              <span className="block font-medium">
                {t.recipient_type === 'issuer' && t.bond_issuer_id ? (
                  <IssuerName id={t.bond_issuer_id} />
                ) : t.user_id ? (
                  <ClientName id={t.user_id} />
                ) : (
                  '-'
                )}
              </span>
              <span className="tabular font-mono text-xs text-muted-foreground">
                {t.recipient_type === 'issuer' ? t.bond_issuer_id : t.user_id}
              </span>
            </span>
            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Шилжүүлэг
          </h3>
          <dl className="space-y-3">
            <Detail label="Зориулалт" value={transferPurposeLabel[t.purpose]} />
            <Detail label="Илгээгч данс" value={t.from_account} mono />
            <Detail
              label="Хүлээн авагч банк"
              value={`${t.to_bank_name || t.to_bank_code} (${t.to_bank_code})`}
            />
            <Detail label="Хүлээн авагч данс" value={t.to_account} mono />
            {t.to_iban && (
              <Detail label="IBAN" value={t.to_iban.toUpperCase()} mono />
            )}
            <Detail label="Эзэмшигч" value={t.to_holder_name} />
            {t.description && <Detail label="Тайлбар" value={t.description} />}
          </dl>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Банкны хариу
          </h3>
          <dl className="space-y-3">
            <Detail
              label="Банкны баримт"
              value={t.provider_uuid}
              mono
              empty="Хүлээгдэж буй"
            />
            <Detail label="Алдааны код" value={t.error_code} empty="Байхгүй" />
            <Detail
              label="Хуулгын мөр"
              value={t.statement_entry_id}
              mono
              empty="Холбогдоогүй"
            />
            <Detail
              label="Тохируулсан"
              value={formatDateTime(t.reconciled_at)}
              empty="Тохируулаагүй"
            />
            <Detail label="Шинэчлэгдсэн" value={formatDateTime(t.updated_at)} />
          </dl>
        </section>

        {t.status === 'unknown' && (
          <p className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm text-warning-foreground dark:text-warning">
            Банкны хариу тодорхойгүй. Дахин илгээхгүй; хуулгаар тулгаж
            тохируулна.
          </p>
        )}

        <Button variant="outline" className="w-full" onClick={onClose}>
          Хаах
        </Button>
      </div>
    </>
  );
}

function Detail({
  label,
  value,
  mono,
  empty = 'Оруулаагүй',
}: {
  label: string;
  value?: string;
  mono?: boolean;
  empty?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd
        className={
          mono
            ? 'tabular min-w-0 text-right font-mono text-xs break-all'
            : 'min-w-0 text-right text-sm font-medium break-words'
        }
      >
        {value || (
          <span className="font-sans font-normal text-muted-foreground">
            {empty}
          </span>
        )}
      </dd>
    </div>
  );
}
