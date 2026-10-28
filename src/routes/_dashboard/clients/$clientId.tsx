import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  BanIcon,
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  LockOpenIcon,
  PercentIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { RejectDialog } from '@/components/client/reject-dialog';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Pagination } from '@/components/common/list-parts';
import { ActiveBadge, StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { countryName } from '@/lib/countries';
import { toApiError } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';
import { PAGE_SIZE } from '@/lib/types';
import { showToast } from '@/lib/utils';
import {
  clientKeys,
  clientOptions,
  membersOptions,
} from '@/queries/client/options';
import {
  approveClient,
  approveTaxExempt,
  blockClient,
  deleteClient,
  rejectClient,
  rejectTaxExempt,
  unblockClient,
} from '@/queries/client/query';
import {
  type ClientDetailType,
  clientTypeLabel,
  type TaxExemptStatus,
} from '@/queries/client/type';

export const Route = createFileRoute('/_dashboard/clients/$clientId')({
  component: ClientPage,
  staticData: { crumb: 'Дэлгэрэнгүй' },
});

function ClientPage() {
  const { clientId } = Route.useParams();
  const { data: c, isPending, error } = useQuery(clientOptions(clientId));

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (error || !c) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">{toApiError(error).message}</p>
          <Button asChild variant="link">
            <Link to="/clients">Жагсаалт руу буцах</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return <ClientDetail c={c} />;
}

function name(c: ClientDetailType) {
  // An organization gives its name after sign-in; until then its register number stands in.
  return c.type === 'organization'
    ? c.name || c.register_number || 'Нэр оруулаагүй'
    : [c.last_name, c.first_name].filter(Boolean).join(' ');
}

function ClientDetail({ c }: { c: ClientDetailType }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const individual = c.type === 'customer' || c.type === 'foreign';
  const reviewable = c.status === 'pending' && c.type !== 'org_member';
  // Approval waits for a complete profile; members follow their organization.
  const canApprove = reviewable && c.profile_complete;

  async function act(action: () => Promise<unknown>, done: string) {
    try {
      await action();
      showToast('success', done);
    } catch (err) {
      showToast('error', toApiError(err).message);
      throw err;
    } finally {
      await queryClient.invalidateQueries({ queryKey: clientKeys.all });
    }
  }

  return (
    <>
      <Link
        to="/clients"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Харилцагчид
      </Link>

      <Card className="py-0">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
            {name(c).slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {name(c)}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{clientTypeLabel[c.type]}</span>
              <span aria-hidden="true">·</span>
              <StatusBadge status={c.status} />
              <ActiveBadge active={c.is_active} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {reviewable && (
              <>
                <RejectDialog
                  trigger={
                    <Button variant="outline" className="text-destructive">
                      <CircleXIcon />
                      Татгалзах
                    </Button>
                  }
                  onReject={(reason) =>
                    act(
                      () => rejectClient(c.id, reason),
                      'Хүсэлтээс татгалзлаа',
                    )
                  }
                />
                <ConfirmDialog
                  trigger={
                    <Button
                      className="bg-success text-success-foreground hover:bg-success/90"
                      disabled={!canApprove}
                    >
                      <CircleCheckIcon />
                      Баталгаажуулах
                    </Button>
                  }
                  title="Харилцагчийг баталгаажуулах уу?"
                  description="Баталгаажуулалт эцсийнх: дараа нь буцаах боломжгүй, зөвхөн хааж болно."
                  confirmLabel="Баталгаажуулах"
                  tone="success"
                  onConfirm={() =>
                    act(() => approveClient(c.id), 'Харилцагч баталгаажлаа')
                  }
                />
              </>
            )}
            {c.is_active ? (
              <ConfirmDialog
                trigger={
                  <Button variant="outline">
                    <BanIcon />
                    Хаах
                  </Button>
                }
                title="Харилцагчийг хаах уу?"
                description={
                  c.type === 'organization'
                    ? 'Байгууллага болон бүх хариуцагч ажилтан нэвтрэлт шууд дуусна.'
                    : 'Бүх нэвтрэлт нь шууд дуусч, дахин нэвтрэх боломжгүй болно.'
                }
                confirmLabel="Хаах"
                onConfirm={() =>
                  act(() => blockClient(c.id), 'Харилцагчийг хаалаа')
                }
              />
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  void act(
                    () => unblockClient(c.id),
                    'Харилцагчийг нээлээ',
                  ).catch(() => {})
                }
              >
                <LockOpenIcon />
                Нээх
              </Button>
            )}
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Устгах"
                  title="Устгах"
                >
                  <Trash2Icon />
                </Button>
              }
              title="Харилцагчийг устгах уу?"
              description={
                c.type === 'organization'
                  ? 'Байгууллага болон бүх албан тушаалтнуудын мэдээлэл бүрмөсөн устана. Энэ үйлдлийг буцаах боломжгүй.'
                  : 'Бүх мэдээлэл нь бүрмөсөн устана. Энэ үйлдлийг буцаах боломжгүй.'
              }
              confirmLabel="Устгах"
              onConfirm={async () => {
                await act(() => deleteClient(c.id), 'Харилцагчийг устгалаа');
                await navigate({ to: '/clients' });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {reviewable && !canApprove && (
        <Notice tone="info">
          {c.type === 'organization'
            ? 'Байгууллага мэдээллээ бүрэн бөглөөгүй байна (нэр, үйл ажиллагаа, хаяг, албан тушаалтай албан тушаалтан).'
            : c.type === 'customer'
              ? 'Харилцагч мэдээллээ бүрэн бөглөөгүй байна (РД, утас, банкны данс).'
              : 'Харилцагч мэдээллээ бүрэн бөглөөгүй байна (иргэншил, паспорт, утас).'}{' '}
          Бөглөсний дараа баталгаажуулах боломжтой.
        </Notice>
      )}
      {c.type === 'org_member' && (
        <Notice tone="info">
          Албан тушаалтны KYC төлөв нь байгууллагынх нь төлвөөр тодорхойлогдоно.
          {c.org_id && (
            <>
              {' '}
              <Link
                to="/clients/$clientId"
                params={{ clientId: c.org_id }}
                className="font-medium text-primary hover:underline"
              >
                {c.org_name ?? 'Байгууллага'} руу очих
              </Link>
            </>
          )}
        </Notice>
      )}
      {c.status === 'rejected' && c.reject_reason && (
        <Notice tone="destructive">
          <span className="font-medium">Татгалзсан шалтгаан:</span>{' '}
          {c.reject_reason}
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Мэдээлэл</CardTitle>
            <CardDescription>
              Харилцагч өөрөө оруулсан мэдээлэл.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {c.type === 'organization' ? (
                <>
                  <Info label="Байгууллагын нэр" value={c.name} />
                  <Info
                    label="Регистрийн дугаар"
                    value={c.register_number}
                    mono
                  />
                </>
              ) : (
                <>
                  <Info label="Овог" value={c.last_name} />
                  <Info label="Нэр" value={c.first_name} />
                </>
              )}
              {c.type === 'customer' && (
                <Info
                  label="Регистрийн дугаар"
                  value={c.register_number}
                  mono
                />
              )}
              {c.type === 'foreign' && (
                <>
                  <Info
                    label="Иргэншил"
                    value={
                      c.nationality &&
                      `${countryName(c.nationality)} (${c.nationality})`
                    }
                  />
                  <Info
                    label="Паспортын дугаар"
                    value={c.passport_number}
                    mono
                  />
                </>
              )}
              {c.type === 'org_member' && (
                <>
                  <Info label="Байгууллага" value={c.org_name} />
                  <Info label="Албан тушаал" value={c.position} />
                </>
              )}
              <Info
                label="Имэйл"
                value={c.email}
                verified={c.email ? c.email_verified : undefined}
              />
              <Info
                label="Утас"
                value={c.phone}
                mono
                verified={c.phone ? c.phone_verified : undefined}
              />
              {individual && (
                <>
                  <Info label="Нэмэлт утас" value={c.phone_secondary} mono />
                  <div className="sm:col-span-2">
                    <Info label="Гэрийн хаяг" value={c.address} />
                  </div>
                </>
              )}
              {c.type === 'organization' && (
                <>
                  <div className="sm:col-span-2">
                    <Info label="Үйл ажиллагааны чиглэл" value={c.activity} />
                  </div>
                  <div className="sm:col-span-2">
                    <Info label="Хаяг" value={c.address} />
                  </div>
                </>
              )}
            </dl>
            {c.type === 'customer' && <BankAccount c={c} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Бүртгэл</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <Info label="Бүртгүүлсэн" value={formatDateTime(c.created_at)} />
              <Info
                label="Сүүлд шинэчилсэн"
                value={formatDateTime(c.updated_at)}
              />
              <Info
                label="Шалгасан"
                value={
                  c.reviewed_at ? formatDateTime(c.reviewed_at) : 'Шалгаагүй'
                }
              />
              <Info
                label="Мэдээлэл"
                value={c.profile_complete ? 'Бүрэн' : 'Дутуу'}
              />
              <Info
                label="Нууц үг"
                value={c.has_password ? 'Тохируулсан' : 'Тохируулаагүй'}
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      {c.type === 'customer' && c.tax_exempt_status && (
        <TaxExemption c={c} act={act} />
      )}

      {c.type === 'organization' && <Members orgId={c.id} />}
    </>
  );
}

/** A customer's account for bond payments. */
function BankAccount({ c }: { c: ClientDetailType }) {
  const b = c.bank_account;
  const holder = b ? `${b.holder_last_name} ${b.holder_first_name}` : '';
  const owner = [c.last_name, c.first_name].filter(Boolean).join(' ');
  // Worth a look in review: payments to someone else's account.
  const differs =
    !!b &&
    (b.holder_last_name.toLowerCase() !== (c.last_name ?? '').toLowerCase() ||
      b.holder_first_name.toLowerCase() !== (c.first_name ?? '').toLowerCase());

  return (
    <>
      <h3 className="mt-8 mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Банкны данс
      </h3>
      {b ? (
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Info label="Банк" value={b.bank_name} />
          <Info label="Дансны дугаар" value={b.account_number} mono />
          <Info label="IBAN" value={b.iban.toUpperCase()} mono />
          <div className="space-y-1">
            <Info label="Эзэмшигч" value={holder} />
            {differs && (
              <p className="flex items-center gap-1 text-xs text-warning-foreground dark:text-warning">
                <TriangleAlertIcon className="size-3.5" />
                Харилцагчийн нэртэй ({owner}) таарахгүй байна
              </p>
            )}
          </div>
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">Банкны данс оруулаагүй.</p>
      )}
    </>
  );
}

const taxLabels: Record<TaxExemptStatus, { label: string; className: string }> =
  {
    requested: {
      label: 'Хүсэлт ирсэн',
      className: 'bg-warning/15 text-warning-foreground dark:text-warning',
    },
    approved: { label: 'Зөвшөөрсөн', className: 'bg-success/12 text-success' },
    rejected: {
      label: 'Татгалзсан',
      className: 'bg-destructive/10 text-destructive',
    },
  };

/** The customer's request to be exempt from the interest tax: decided apart from KYC. */
function TaxExemption({
  c,
  act,
}: {
  c: ClientDetailType;
  act: (action: () => Promise<unknown>, done: string) => Promise<void>;
}) {
  const status = c.tax_exempt_status as TaxExemptStatus;
  const s = taxLabels[status];

  return (
    <Card className={status === 'requested' ? 'border-warning/50' : undefined}>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <PercentIcon className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            Хүүгийн орлогын албан татварын хөнгөлөлт
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.className}`}
            >
              {s.label}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            {status === 'requested'
              ? 'Харилцагч хөнгөлөлт хүссэн. KYC шалгалтаас тусдаа шийднэ.'
              : `Шийдсэн: ${formatDateTime(c.tax_exempt_reviewed_at)}`}
          </p>
        </div>
        {status === 'requested' && (
          <div className="flex gap-2">
            <ConfirmDialog
              trigger={
                <Button variant="outline" className="text-destructive">
                  Татгалзах
                </Button>
              }
              title="Татварын хөнгөлөлтөөс татгалзах уу?"
              description="Харилцагч дараа нь дахин хүсэлт гаргаж болно."
              confirmLabel="Татгалзах"
              onConfirm={() =>
                act(() => rejectTaxExempt(c.id), 'Хөнгөлөлтөөс татгалзлаа')
              }
            />
            <ConfirmDialog
              trigger={
                <Button className="bg-success text-success-foreground hover:bg-success/90">
                  Зөвшөөрөх
                </Button>
              }
              title="Татварын хөнгөлөлтийг зөвшөөрөх үү?"
              description="Харилцагчийн хүүгийн орлогоос албан татвар суутгахгүй."
              confirmLabel="Зөвшөөрөх"
              tone="success"
              onConfirm={() =>
                act(() => approveTaxExempt(c.id), 'Хөнгөлөлтийг зөвшөөрлөө')
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: 'info' | 'destructive';
  children: ReactNode;
}) {
  return (
    <div
      className={
        tone === 'info'
          ? 'flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm'
          : 'flex gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm'
      }
    >
      {tone === 'info' ? (
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
      ) : (
        <CircleXIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
      )}
      <p>{children}</p>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
  verified,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  verified?: boolean;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={mono ? 'tabular font-mono text-sm' : 'text-sm font-medium'}
      >
        {value || (
          <span className="font-sans font-normal text-muted-foreground">
            Оруулаагүй
          </span>
        )}
        {verified !== undefined && (
          <span
            className={
              verified
                ? 'ml-2 font-sans text-xs font-normal text-success'
                : 'ml-2 font-sans text-xs font-normal text-muted-foreground'
            }
          >
            {verified ? 'Баталгаажсан' : 'Баталгаажаагүй'}
          </span>
        )}
      </dd>
    </div>
  );
}

function Members({ orgId }: { orgId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending } = useQuery(membersOptions(orgId, page));
  const navigate = useNavigate();

  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="pb-4">
        <CardTitle>Хариуцагч ажилчид</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-6">Нэр</TableHead>
            <TableHead>Албан тушаал</TableHead>
            <TableHead>Имэйл</TableHead>
            <TableHead>Утас</TableHead>
            <TableHead className="pr-6">Төлөв</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableRow>
              <TableCell colSpan={5} className="pl-6">
                <Skeleton className="h-4 w-40" />
              </TableCell>
            </TableRow>
          ) : !data?.items.length ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={5}
                className="py-8 text-center text-muted-foreground"
              >
                Хариуцагч ажилтан алга
              </TableCell>
            </TableRow>
          ) : (
            data.items.map((m) => (
              <TableRow
                key={m.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate({
                    to: '/clients/$clientId',
                    params: { clientId: m.id },
                  })
                }
              >
                <TableCell className="pl-6 font-medium">
                  {m.last_name} {m.first_name}
                </TableCell>
                <TableCell>
                  {m.position || (
                    <span className="text-muted-foreground">Тодорхойгүй</span>
                  )}
                </TableCell>
                <TableCell>
                  {m.email || <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="tabular">{m.phone}</TableCell>
                <TableCell className="pr-6">
                  <ActiveBadge active={m.is_active} />
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
          onPage={setPage}
        />
      )}
    </Card>
  );
}
