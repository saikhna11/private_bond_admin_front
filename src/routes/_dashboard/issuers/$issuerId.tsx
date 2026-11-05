import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  BanIcon,
  Building2Icon,
  CrownIcon,
  KeyRoundIcon,
  LandmarkIcon,
  Loader2Icon,
  LockOpenIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  ShieldCheckIcon,
  StarIcon,
  Trash2Icon,
  UserPlusIcon,
} from 'lucide-react';
import { useState } from 'react';
import {
  BankStatusBadge,
  CurrencyTag,
  DefaultBadge,
} from '@/components/bank/account-badges';
import { TransferDialog } from '@/components/bank/transfer-dialog';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ActiveBadge } from '@/components/common/status-badge';
import { InfoItem } from '@/components/contract/info-item';
import { BankAccountDialog } from '@/components/issuer/bank-account-dialog';
import { EditIssuerDialog } from '@/components/issuer/issuer-form-dialog';
import { ResetPasswordDialog } from '@/components/staff/reset-password-dialog';
import { StaffFormDialog } from '@/components/staff/staff-form-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { formatDate, formatDateTime } from '@/lib/format';
import { cn, showToast } from '@/lib/utils';
import { personInitials, personName } from '@/queries/auth/type';
import { issuerKeys, issuerOptions } from '@/queries/issuer/options';
import {
  addIssuerBankAccount,
  addIssuerMember,
  blockIssuerMember,
  deleteIssuer,
  deleteIssuerBankAccount,
  removeIssuerMember,
  resetIssuerMemberPassword,
  setDefaultIssuerBankAccount,
  setIssuerDirector,
  unblockIssuerMember,
  updateIssuer,
  updateIssuerBankAccount,
  updateIssuerMember,
  verifyIssuerBankAccount,
} from '@/queries/issuer/query';
import {
  bankStatusLabel,
  type IssuerBankAccountType,
  type IssuerMemberType,
  type IssuerType,
  memberRoleLabel,
} from '@/queries/issuer/type';

export const Route = createFileRoute('/_dashboard/issuers/$issuerId')({
  component: IssuerPage,
  staticData: { crumb: 'Дэлгэрэнгүй' },
});

type Act = (action: () => Promise<unknown>, done: string) => Promise<void>;

function IssuerPage() {
  const { issuerId } = Route.useParams();
  const { data, isPending, error } = useQuery(issuerOptions(issuerId));

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">{toApiError(error).message}</p>
          <Button asChild variant="link">
            <Link to="/issuers">Жагсаалт руу буцах</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return <IssuerDetail issuer={data} />;
}

function IssuerDetail({ issuer }: { issuer: IssuerType }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const id = issuer.id;

  const act: Act = async (action, done) => {
    try {
      await action();
      showToast('success', done);
    } catch (err) {
      showToast('error', toApiError(err).message);
      throw err;
    } finally {
      await queryClient.invalidateQueries({ queryKey: issuerKeys.all });
    }
  };

  return (
    <>
      <Link
        to="/issuers"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Бонд гаргагчид
      </Link>

      <Card className="py-0">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Building2Icon className="size-6" />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {issuer.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Бонд гаргагч · РД{' '}
              <span className="tabular font-mono">
                {issuer.register_number}
              </span>{' '}
              · Улсын бүртгэл{' '}
              <span className="tabular font-mono">
                {issuer.state_register_number}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <EditIssuerDialog
              issuer={issuer}
              trigger={
                <Button variant="outline">
                  <PencilIcon />
                  Засах
                </Button>
              }
              onSubmit={(v) => act(() => updateIssuer(id, v), 'Хадгалагдлаа')}
            />
            <ConfirmDialog
              trigger={
                <Button variant="outline" className="text-destructive">
                  <Trash2Icon />
                  Устгах
                </Button>
              }
              title={`${issuer.name}-г устгах уу?`}
              description="Компани, түүний бүх ажилтны бүртгэл, банкны данс бүрмөсөн устана. Ажилтнууд дахин нэвтрэх боломжгүй болно. Шилжүүлэг хийгдсэн бонд гаргагчийг устгах боломжгүй."
              confirmLabel="Устгах"
              onConfirm={async () => {
                await act(() => deleteIssuer(id), 'Устгагдлаа');
                await navigate({ to: '/issuers' });
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ажилтнууд</CardTitle>
            <CardDescription>
              Харилцагчийн вэбийн "Бонд гаргагчаар нэвтрэх" хуудсаар өөрийн
              имэйлээр нэвтэрнэ. Захирал нэг байх ба гэрээнд түүний нэр орж,
              компанийн өмнөөс гарын үсэг зурна.
            </CardDescription>
            <CardAction>
              <StaffFormDialog
                mode="create"
                noun="ажилтан"
                withPosition
                phoneOptional
                description="Ажилтан болж нэмэгдэнэ. Анхны нууц үгийг өөрөө дамжуулна; систем имэйл илгээхгүй."
                trigger={
                  <Button size="sm">
                    <UserPlusIcon />
                    Ажилтан нэмэх
                  </Button>
                }
                onSubmit={(v) =>
                  act(
                    () =>
                      addIssuerMember(id, {
                        email: v.email,
                        phone: v.phone || undefined,
                        last_name: v.last_name,
                        first_name: v.first_name,
                        position: v.position || undefined,
                        password: v.password,
                      }),
                    'Ажилтан нэмэгдлээ',
                  )
                }
              />
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-6">Нэр</TableHead>
                  <TableHead>Утас</TableHead>
                  <TableHead>Албан тушаал</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead>Нэмсэн</TableHead>
                  <TableHead className="w-12 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {issuer.members.map((m) => (
                  <MemberRow key={m.id} issuerId={id} member={m} act={act} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <BankAccountsCard issuer={issuer} act={act} />
      </div>

      <p className="text-xs text-muted-foreground">
        Бүртгэсэн: {formatDateTime(issuer.created_at)} · Шинэчилсэн:{' '}
        {formatDateTime(issuer.updated_at)}
      </p>
    </>
  );
}

function MemberRow({
  issuerId,
  member: m,
  act,
}: {
  issuerId: string;
  member: IssuerMemberType;
  act: Act;
}) {
  const [dialog, setDialog] = useState<
    'reset' | 'block' | 'delete' | 'director' | null
  >(null);
  const name = personName(m);
  const director = m.role === 'director';

  return (
    <TableRow>
      <TableCell className="pl-6">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
            {personInitials(m)}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-medium">
              <span className="max-w-48 truncate">{name}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  director
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {memberRoleLabel[m.role]}
              </span>
            </p>
            <p className="max-w-56 truncate text-xs text-muted-foreground">
              {m.email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="tabular">{m.phone || '-'}</TableCell>
      <TableCell className="text-muted-foreground">
        {m.position || '-'}
      </TableCell>
      <TableCell>
        <ActiveBadge active={m.is_active} />
      </TableCell>
      <TableCell className="tabular text-muted-foreground">
        {formatDate(m.created_at)}
      </TableCell>
      <TableCell className="pr-6 text-right">
        <div className="flex justify-end gap-1">
          <StaffFormDialog
            mode="edit"
            noun="ажилтан"
            withPosition
            initial={{
              last_name: m.last_name,
              first_name: m.first_name,
              position: m.position,
            }}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Засах"
                title="Засах"
              >
                <PencilIcon />
              </Button>
            }
            onSubmit={(v) =>
              act(
                () =>
                  updateIssuerMember(issuerId, m.id, {
                    last_name: v.last_name,
                    first_name: v.first_name,
                    position: v.position,
                  }),
                'Хадгалагдлаа',
              )
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Бусад үйлдэл">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {!director && m.is_active && (
                <DropdownMenuItem onSelect={() => setDialog('director')}>
                  <CrownIcon />
                  Захирал болгох
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => setDialog('reset')}>
                <KeyRoundIcon />
                Нууц үг шинэчлэх
              </DropdownMenuItem>
              {m.is_active ? (
                <DropdownMenuItem onSelect={() => setDialog('block')}>
                  <BanIcon />
                  Хаах
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() =>
                    void act(
                      () => unblockIssuerMember(issuerId, m.id),
                      'Нээгдлээ',
                    ).catch(() => {})
                  }
                >
                  <LockOpenIcon />
                  Нээх
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={director}
                onSelect={() => setDialog('delete')}
              >
                <Trash2Icon />
                {director ? 'Захирлыг хасах боломжгүй' : 'Хасах'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ConfirmDialog
          open={dialog === 'director'}
          onOpenChange={(o) => setDialog(o ? 'director' : null)}
          title={`${name}-г захирал болгох уу?`}
          description="Одоогийн захирал ажилтан болно. Цаашид компанийн гэрээнд энэ хүний нэр орж, гарын үсэг зурна."
          confirmLabel="Захирал болгох"
          tone="default"
          onConfirm={() =>
            act(() => setIssuerDirector(issuerId, m.id), 'Захирал солигдлоо')
          }
        />
        <ResetPasswordDialog
          open={dialog === 'reset'}
          onOpenChange={(o) => setDialog(o ? 'reset' : null)}
          name={name}
          onReset={(password) =>
            act(
              () => resetIssuerMemberPassword(issuerId, m.id, password),
              'Нууц үг шинэчлэгдлээ',
            )
          }
        />
        <ConfirmDialog
          open={dialog === 'block'}
          onOpenChange={(o) => setDialog(o ? 'block' : null)}
          title={`${name}-г хаах уу?`}
          description="Бүх нэвтрэлт нь шууд дуусч, дахин нэвтрэх боломжгүй болно."
          confirmLabel="Хаах"
          onConfirm={() =>
            act(() => blockIssuerMember(issuerId, m.id), 'Хаагдлаа')
          }
        />
        <ConfirmDialog
          open={dialog === 'delete'}
          onOpenChange={(o) => setDialog(o ? 'delete' : null)}
          title={`${name}-г хасах уу?`}
          description="Ажилтны бүртгэл бүрмөсөн устана."
          confirmLabel="Хасах"
          onConfirm={() =>
            act(() => removeIssuerMember(issuerId, m.id), 'Хасагдлаа')
          }
        />
      </TableCell>
    </TableRow>
  );
}

function BankAccountsCard({ issuer, act }: { issuer: IssuerType; act: Act }) {
  // Each currency's default first, then the oldest.
  const accounts = [...issuer.bank_accounts].sort(
    (a, b) =>
      a.currency.localeCompare(b.currency) ||
      Number(b.is_default) - Number(a.is_default) ||
      a.created_at.localeCompare(b.created_at),
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Банкны данс</CardTitle>
        <CardDescription>
          Бондоор босгосон хөрөнгө шилжих данс. Валют бүрд хэдэн ч данс байж
          болох ба шилжүүлэг өөр данс сонгоогүй бол үндсэн данс руу очно.
        </CardDescription>
        <CardAction className="flex flex-wrap justify-end gap-2">
          <TransferDialog
            issuerId={issuer.id}
            trigger={
              <Button size="sm" disabled={accounts.length === 0}>
                <SendIcon />
                Шилжүүлэг
              </Button>
            }
          />
          <Button size="sm" variant="outline" asChild>
            <Link to="/bank/transfers" search={{ bond_issuer_id: issuer.id }}>
              Шилжүүлгүүд
            </Link>
          </Button>
          <BankAccountDialog
            trigger={
              <Button size="sm" variant="outline">
                <PlusIcon />
                Нэмэх
              </Button>
            }
            onSubmit={(body) =>
              act(() => addIssuerBankAccount(issuer.id, body), 'Данс нэмэгдлээ')
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center lg:col-span-2">
            <LandmarkIcon className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Банкны данс бүртгээгүй.
            </p>
          </div>
        ) : (
          accounts.map((a) => (
            <BankAccountItem
              key={a.id}
              issuerId={issuer.id}
              account={a}
              act={act}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

function BankAccountItem({
  issuerId,
  account: a,
  act,
}: {
  issuerId: string;
  account: IssuerBankAccountType;
  act: Act;
}) {
  const queryClient = useQueryClient();
  const [verifying, setVerifying] = useState(false);

  async function verify() {
    setVerifying(true);
    try {
      const checked = await verifyIssuerBankAccount(issuerId, a.id);
      const label = bankStatusLabel[checked.status].label;
      showToast(
        checked.status === 'verified' ? 'success' : 'warning',
        `Шалгалтын үр дүн: ${label}`,
      );
    } catch (err) {
      showToast('error', toApiError(err).message);
    } finally {
      setVerifying(false);
      await queryClient.invalidateQueries({ queryKey: issuerKeys.all });
    }
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-medium">
          <CurrencyTag currency={a.currency} />
          {a.bank_name}
        </p>
        <div className="flex items-center gap-1.5">
          {a.is_default && <DefaultBadge />}
          <BankStatusBadge status={a.status} />
        </div>
      </div>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <InfoItem label="Данс эзэмшигч" value={a.account_name} />
        <InfoItem label="Дансны дугаар" value={a.account_number} mono />
        <InfoItem label="IBAN" value={a.iban} mono />
      </dl>
      <div className="mt-3 flex flex-wrap justify-end gap-1">
        {!a.is_default && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              void act(
                () => setDefaultIssuerBankAccount(issuerId, a.id),
                'Үндсэн данс солигдлоо',
              ).catch(() => {})
            }
          >
            <StarIcon />
            Үндсэн болгох
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={verifying}
          onClick={() => void verify()}
        >
          {verifying ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <ShieldCheckIcon />
          )}
          Банкаар шалгах
        </Button>
        <BankAccountDialog
          account={a}
          trigger={
            <Button variant="ghost" size="sm">
              <PencilIcon />
              Засах
            </Button>
          }
          onSubmit={(body) =>
            act(
              () => updateIssuerBankAccount(issuerId, a.id, body),
              'Данс хадгалагдлаа',
            )
          }
        />
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="sm" className="text-destructive">
              <Trash2Icon />
              Устгах
            </Button>
          }
          title={`${a.currency} дансыг устгах уу?`}
          description={
            a.is_default
              ? `${a.bank_name} ${a.account_number} данс бүртгэлээс хасагдана. Энэ валютын өөр данс байвал түүнийг үндсэн болгоно.`
              : `${a.bank_name} ${a.account_number} данс бүртгэлээс хасагдана.`
          }
          confirmLabel="Устгах"
          onConfirm={() =>
            act(
              () => deleteIssuerBankAccount(issuerId, a.id),
              'Данс устгагдлаа',
            )
          }
        />
      </div>
    </div>
  );
}
