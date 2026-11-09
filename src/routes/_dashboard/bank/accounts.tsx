import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  BanIcon,
  CircleCheckIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  ReceiptTextIcon,
  StarIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { CurrencyTag, DefaultBadge } from '@/components/bank/account-badges';
import {
  CreateCompanyAccountDialog,
  EditCompanyAccountDialog,
} from '@/components/bank/company-account-dialog';
import { CompanyBalanceCards } from '@/components/bank/company-balance-cards';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { TableEmpty, TableSkeletonRows } from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { PRIV } from '@/lib/rbac';
import { cn, showToast } from '@/lib/utils';
import { bankKeys, companyAccountsOptions } from '@/queries/bank/options';
import {
  createCompanyAccount,
  deleteCompanyAccount,
  setDefaultCompanyAccount,
  updateCompanyAccount,
} from '@/queries/bank/query';
import type { CompanyBankAccountType } from '@/queries/bank/type';

export const Route = createFileRoute('/_dashboard/bank/accounts')({
  component: CompanyAccountsPage,
  staticData: { crumb: 'Компанийн данс' },
});

type Act = (action: () => Promise<unknown>, done: string) => Promise<void>;

function CompanyAccountsPage() {
  const can = useCan();
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery(companyAccountsOptions());
  // Changing the company's accounts takes a permission; the API answers 403 otherwise.
  const canCreate = can(PRIV.companyAccountCreate);
  const canEdit =
    can(PRIV.companyAccountUpdate) || can(PRIV.companyAccountDelete);
  const cols = canEdit ? 7 : 6;

  const act: Act = async (action, done) => {
    try {
      await action();
      showToast('success', done);
    } catch (err) {
      showToast('error', toApiError(err).message, 8000);
      throw err;
    } finally {
      await queryClient.invalidateQueries({ queryKey: bankKeys.all });
    }
  };

  // Each currency's accounts together, the default first.
  const accounts = [...(data ?? [])].sort(
    (a, b) =>
      a.currency.localeCompare(b.currency) ||
      Number(b.is_default) - Number(a.is_default) ||
      Number(b.is_active) - Number(a.is_active) ||
      a.created_at.localeCompare(b.created_at),
  );

  return (
    <>
      <PageTitle
        title="Компанийн данс"
        description={
          canCreate || canEdit
            ? 'Шилжүүлэг илгээж, хуулга уншдаг Улзий ХХК-ийн дансууд. Валют бүрд нэг үндсэн данс байна.'
            : 'Шилжүүлэг илгээж, хуулга уншдаг Улзий ХХК-ийн дансууд. Өөрчлөх эрх танд алга.'
        }
        action={
          canCreate && (
            <CreateCompanyAccountDialog
              trigger={
                <Button>
                  <PlusIcon />
                  Данс нэмэх
                </Button>
              }
              onSubmit={(body) =>
                act(() => createCompanyAccount(body), 'Данс нэмэгдлээ')
              }
            />
          )
        }
      />

      {can(PRIV.statementBalance) && <CompanyBalanceCards />}

      <Card className="gap-0 py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Банк</TableHead>
              <TableHead>Дансны дугаар</TableHead>
              <TableHead>IBAN</TableHead>
              <TableHead>Валют</TableHead>
              <TableHead>Данс эзэмшигч</TableHead>
              <TableHead className={cn(!canEdit && 'pr-4')}>Төлөв</TableHead>
              {canEdit && <TableHead className="w-12 pr-4" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeletonRows cols={cols} />
            ) : error ? (
              <TableEmpty
                cols={cols}
                title="Дансыг ачаалж чадсангүй"
                text={toApiError(error).message}
              />
            ) : !accounts.length ? (
              <TableEmpty
                cols={cols}
                title="Компанийн данс бүртгэгдээгүй"
                text={
                  canEdit
                    ? 'Шилжүүлэг илгээхийн өмнө данс нэмнэ үү.'
                    : 'Супер админд хандаж данс бүртгүүлнэ үү.'
                }
              />
            ) : (
              accounts.map((a) => (
                <AccountRow
                  key={a.id}
                  account={a}
                  canEdit={canEdit}
                  act={act}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

function AccountRow({
  account: a,
  canEdit,
  act,
}: {
  account: CompanyBankAccountType;
  canEdit: boolean;
  act: Act;
}) {
  const can = useCan();
  const canUpdate = can(PRIV.companyAccountUpdate);
  const [dialog, setDialog] = useState<'edit' | 'delete' | null>(null);
  const label = `${a.bank_name} ${a.account_number}`;

  return (
    <TableRow className={cn(!a.is_active && 'text-muted-foreground')}>
      <TableCell className="pl-4">
        <p className="flex items-center gap-2 font-medium">
          {a.bank_name}
          {a.is_default && <DefaultBadge />}
        </p>
      </TableCell>
      <TableCell className="tabular font-mono text-sm">
        {a.account_number}
      </TableCell>
      <TableCell className="tabular font-mono text-xs">
        {a.iban.toUpperCase()}
      </TableCell>
      <TableCell>
        <CurrencyTag currency={a.currency} />
      </TableCell>
      <TableCell>
        <p className="max-w-56 truncate">{a.account_name}</p>
      </TableCell>
      <TableCell className={cn(!canEdit && 'pr-4')}>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
            a.is_active
              ? 'text-muted-foreground'
              : 'bg-destructive/10 text-destructive',
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              a.is_active ? 'bg-success' : 'bg-destructive',
            )}
          />
          {a.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
        </span>
      </TableCell>
      {canEdit && (
        <TableCell className="pr-4 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Бусад үйлдэл">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {canUpdate && (
                <DropdownMenuItem onSelect={() => setDialog('edit')}>
                  <PencilIcon />
                  Засах
                </DropdownMenuItem>
              )}
              {canUpdate && a.is_active && !a.is_default && (
                <DropdownMenuItem
                  onSelect={() =>
                    void act(
                      () => setDefaultCompanyAccount(a.id),
                      `${a.currency} үндсэн данс солигдлоо`,
                    ).catch(() => {})
                  }
                >
                  <StarIcon />
                  Үндсэн болгох
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <DropdownMenuItem
                  onSelect={() =>
                    void act(
                      () =>
                        updateCompanyAccount(a.id, { is_active: !a.is_active }),
                      a.is_active ? 'Идэвхгүй болголоо' : 'Идэвхжүүллээ',
                    ).catch(() => {})
                  }
                >
                  {a.is_active ? <BanIcon /> : <CircleCheckIcon />}
                  {a.is_active ? 'Идэвхгүй болгох' : 'Идэвхжүүлэх'}
                </DropdownMenuItem>
              )}
              {can(PRIV.statementList) && (
                <DropdownMenuItem asChild>
                  <Link to="/bank/statement" search={{ account_id: a.id }}>
                    <ReceiptTextIcon />
                    Хуулга харах
                  </Link>
                </DropdownMenuItem>
              )}
              {can(PRIV.companyAccountDelete) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setDialog('delete')}
                  >
                    <Trash2Icon />
                    Устгах
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {dialog === 'edit' && (
            <EditCompanyAccountDialog
              account={a}
              open
              onOpenChange={(o) => setDialog(o ? 'edit' : null)}
              onSubmit={(body) =>
                act(() => updateCompanyAccount(a.id, body), 'Хадгалагдлаа')
              }
            />
          )}
          <ConfirmDialog
            open={dialog === 'delete'}
            onOpenChange={(o) => setDialog(o ? 'delete' : null)}
            title={`${label} дансыг устгах уу?`}
            description="Хуулга эсвэл шилжүүлэгтэй болсон дансыг устгах боломжгүй: оронд нь идэвхгүй болгоно уу."
            confirmLabel="Устгах"
            onConfirm={() =>
              act(() => deleteCompanyAccount(a.id), 'Данс устгагдлаа')
            }
          />
        </TableCell>
      )}
    </TableRow>
  );
}
