import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, ShieldAlertIcon } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import { cn, showToast } from '@/lib/utils';
import { bankKeys, companyAccountsOptions } from '@/queries/bank/options';
import { createTransfer } from '@/queries/bank/query';
import {
  RecipientTypeSchema,
  recipientTypeLabel,
  TransferPurposeSchema,
  transferPurposeLabel,
  transferStatusLabel,
} from '@/queries/bank/type';
import { clientKeys, clientOptions } from '@/queries/client/options';
import { issuerKeys, issuerOptions } from '@/queries/issuer/options';
import { CurrencySchema } from '@/queries/issuer/type';
import { BankStatusBadge, DefaultBadge } from './account-badges';
import { ClientPicker } from './client-picker';
import { IssuerPicker } from './issuer-picker';

const schema = z
  .object({
    recipient_type: RecipientTypeSchema,
    user_id: z.string(),
    bond_issuer_id: z.string(),
    currency: CurrencySchema,
    to_account_id: z.string().min(1, 'Хүлээн авах данс сонгоно уу'),
    from_account_id: z.string().min(1, 'Илгээх компанийн данс сонгоно уу'),
    purpose: TransferPurposeSchema,
    amount: z
      .string()
      .trim()
      .min(1, 'Дүн оруулна уу')
      .refine(
        (v) => /^\d{1,14}(\.\d{1,2})?$/.test(v) && Number(v) > 0,
        'Дүн 0-ээс их, хамгийн ихдээ 2 аравтын оронтой байна',
      ),
    description: z.string().trim().max(200, 'Тайлбар 200 тэмдэгтээс хэтрэхгүй'),
  })
  .superRefine((v, ctx) => {
    if (v.recipient_type === 'client' && !v.user_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['user_id'],
        message: 'Харилцагч сонгоно уу',
      });
    }
    if (v.recipient_type === 'issuer' && !v.bond_issuer_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['bond_issuer_id'],
        message: 'Бонд гаргагч сонгоно уу',
      });
    }
  });

type Values = z.infer<typeof schema>;

/** One account the money can go to, from the client's or the issuer's record. */
interface RecipientAccount {
  id: string;
  currency: string;
  bank_name: string;
  account_number: string;
  iban: string;
  holder: string;
  status?: string;
  is_default: boolean;
}

/**
 * POST /bank/transfers: sends money from one of the company accounts to one of the
 * recipient's registered accounts (a client's, or a bond issuer's). The API verifies the
 * account with the bank first when it never was.
 */
/** A contract's money to give back to its holder. */
export interface TransferRefund {
  contractId: string;
  userId: string;
  currency: string;
  amount: string;
  description: string;
}

export function TransferDialog({
  trigger,
  initialUserId,
  issuerId,
  refund,
}: {
  trigger: ReactNode;
  /** Preselects this client. */
  initialUserId?: string;
  /** Fixes the recipient to this bond issuer. */
  issuerId?: string;
  /** Gives back a contract's money: its holder, currency, amount and reference, prefilled. */
  refund?: TransferRefund;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [conflict, setConflict] = useState(false);
  // Stable while the dialog is open: a retry after a lost answer cannot pay twice.
  const [key, setKey] = useState(() => crypto.randomUUID());

  const defaults = (): Values => ({
    recipient_type: issuerId ? 'issuer' : 'client',
    user_id: refund?.userId ?? initialUserId ?? '',
    bond_issuer_id: issuerId ?? '',
    currency: refund?.currency === 'USD' ? 'USD' : 'MNT',
    to_account_id: '',
    from_account_id: '',
    purpose: refund ? 'refund' : issuerId ? 'payout' : 'other',
    amount: refund?.amount ?? '',
    description: refund?.description ?? '',
  });
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;
  const recipientType = form.watch('recipient_type');
  const userId = form.watch('user_id');
  const bondIssuerId = form.watch('bond_issuer_id');
  const currency = form.watch('currency');
  const toAccountId = form.watch('to_account_id');
  const fromAccountId = form.watch('from_account_id');
  const isClient = recipientType === 'client';

  const client = useQuery({
    ...clientOptions(userId),
    enabled: open && isClient && !!userId,
  });
  const issuer = useQuery({
    ...issuerOptions(bondIssuerId),
    enabled: open && !isClient && !!bondIssuerId,
  });
  const company = useQuery({
    ...companyAccountsOptions(true),
    enabled: open,
  });

  const recipientId = isClient ? userId : bondIssuerId;
  const recipientLoading =
    !!recipientId && (isClient ? client : issuer).isPending;
  const allAccounts: RecipientAccount[] = isClient
    ? (client.data?.bank_accounts ?? []).map((a) => ({
        id: a.id,
        currency: a.currency ?? 'MNT',
        bank_name: a.bank_name,
        account_number: a.account_number,
        iban: a.iban,
        holder: a.holder_account_name,
        status: a.status,
        is_default: a.is_default,
      }))
    : (issuer.data?.bank_accounts ?? []).map((a) => ({
        id: a.id,
        currency: a.currency,
        bank_name: a.bank_name,
        account_number: a.account_number,
        iban: a.iban,
        holder: a.account_name,
        status: a.status,
        is_default: a.is_default,
      }));
  const accounts = allAccounts.filter((a) => a.currency === currency);
  const fromAccounts = (company.data ?? []).filter(
    (a) => a.is_active && a.currency === currency,
  );
  const toAccount = accounts.find((a) => a.id === toAccountId);

  // Keeps the picks valid: a new recipient or currency preselects its default.
  const accountIds = accounts.map((a) => a.id).join(',');
  const preferredTo = (accounts.find((a) => a.is_default) ?? accounts[0])?.id;
  useEffect(() => {
    if (!accountIds.split(',').includes(toAccountId)) {
      form.setValue('to_account_id', preferredTo ?? '');
    }
  }, [accountIds, preferredTo, toAccountId, form]);

  const fromIds = fromAccounts.map((a) => a.id).join(',');
  const preferredFrom = (
    fromAccounts.find((a) => a.is_default) ?? fromAccounts[0]
  )?.id;
  useEffect(() => {
    if (!fromIds.split(',').includes(fromAccountId)) {
      form.setValue('from_account_id', preferredFrom ?? '');
    }
  }, [fromIds, preferredFrom, fromAccountId, form]);

  // bond_purchase is a client's inbound payment, never one an admin sends.
  const purposes = TransferPurposeSchema.options.filter(
    (p) => p !== 'bond_purchase' && (p !== 'payout' || !isClient),
  );

  async function submit(values: Values) {
    setError(null);
    setConflict(false);
    try {
      const transfer = await createTransfer(
        {
          user_id:
            values.recipient_type === 'client' ? values.user_id : undefined,
          bond_issuer_id:
            values.recipient_type === 'issuer'
              ? values.bond_issuer_id
              : undefined,
          to_account_id: values.to_account_id,
          from_account_id: values.from_account_id,
          currency: values.currency,
          purpose: values.purpose,
          amount: values.amount,
          description: values.description || undefined,
          contract_id: refund?.contractId,
        },
        key,
      );
      await invalidate();
      setOpen(false);
      if (transfer.status === 'sent') {
        showToast('success', 'Шилжүүлэг илгээгдлээ.');
      } else {
        showToast(
          'warning',
          `Шилжүүлгийн төлөв: ${transferStatusLabel[transfer.status]}. Хуулгаар шалгана уу.`,
          8000,
        );
      }
    } catch (err) {
      const e = toApiError(err);
      if (e.code === 'bank.transfer_unknown') {
        // The bank may have sent it: the statement decides, never a retry.
        await invalidate();
        setOpen(false);
        showToast(
          'warning',
          'Шилжүүлгийн үр дүн тодорхойгүй байна. Хуулгаар шалгана уу; дахин илгээхгүй.',
          8000,
        );
        return;
      }
      if (e.code === 'bank.idempotency_conflict') {
        setConflict(true);
        setError(e);
        return;
      }
      if (
        e.code === 'bank.account_not_found' ||
        e.code === 'issuer.bank_account_not_found'
      ) {
        form.setError('to_account_id', { message: e.message });
        await invalidate();
        return;
      }
      if (
        e.code === 'bank.company_account_missing' ||
        e.code === 'bank.company_account_inactive'
      ) {
        form.setError('from_account_id', { message: e.message });
        await invalidate();
        return;
      }
      if (
        applyFieldErrors(e, form.setError, {
          user_id: 'user_id',
          bond_issuer_id: 'bond_issuer_id',
          to_account_id: 'to_account_id',
          from_account_id: 'from_account_id',
          currency: 'currency',
          purpose: 'purpose',
          amount: 'amount',
          description: 'description',
        })
      ) {
        return;
      }
      setError(e);
    }
  }

  // A transfer may verify the account, so the recipient's record changes too.
  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: bankKeys.all }),
      queryClient.invalidateQueries({ queryKey: clientKeys.all }),
      queryClient.invalidateQueries({ queryKey: issuerKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['payments'] }),
      queryClient.invalidateQueries({ queryKey: ['contracts'] }),
    ]);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          form.reset(defaults());
          setKey(crypto.randomUUID());
          setError(null);
          setConflict(false);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>Шилжүүлэг илгээх</DialogTitle>
            <DialogDescription>
              Мөнгө компанийн данснаас хүлээн авагчийн бүртгэлтэй данс руу
              шилжинэ. Данс баталгаажаагүй бол банкнаас эхлээд шалгана.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            {!issuerId && (
              <FormField id="recipient_type" label="Хүлээн авагч">
                <Controller
                  control={form.control}
                  name="recipient_type"
                  render={({ field }) => (
                    <Tabs
                      value={field.value}
                      onValueChange={(v) => {
                        const type = v as Values['recipient_type'];
                        field.onChange(type);
                        form.setValue(
                          'purpose',
                          type === 'issuer' ? 'payout' : 'other',
                        );
                        form.clearErrors();
                      }}
                    >
                      <TabsList>
                        {RecipientTypeSchema.options.map((t) => (
                          <TabsTrigger key={t} value={t}>
                            {recipientTypeLabel[t]}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  )}
                />
              </FormField>
            )}

            {isClient ? (
              <FormField
                id="user_id"
                label="Харилцагч"
                error={errors.user_id?.message}
              >
                <Controller
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <ClientPicker
                      id="user_id"
                      value={field.value}
                      onChange={(id) => field.onChange(id ?? '')}
                    />
                  )}
                />
              </FormField>
            ) : issuerId ? (
              <FormField id="bond_issuer_id" label="Бонд гаргагч">
                <p
                  id="bond_issuer_id"
                  className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium"
                >
                  {issuer.data
                    ? `${issuer.data.name} · ${issuer.data.register_number}`
                    : 'Уншиж байна…'}
                </p>
              </FormField>
            ) : (
              <FormField
                id="bond_issuer_id"
                label="Бонд гаргагч"
                error={errors.bond_issuer_id?.message}
              >
                <Controller
                  control={form.control}
                  name="bond_issuer_id"
                  render={({ field }) => (
                    <IssuerPicker
                      id="bond_issuer_id"
                      value={field.value || undefined}
                      onChange={(id) => field.onChange(id ?? '')}
                    />
                  )}
                />
              </FormField>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="currency" label="Валют">
                <Controller
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <Tabs value={field.value} onValueChange={field.onChange}>
                      <TabsList>
                        {CurrencySchema.options.map((c) => (
                          <TabsTrigger key={c} value={c}>
                            {c}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  )}
                />
              </FormField>
              <FormField
                id="purpose"
                label="Зориулалт"
                error={errors.purpose?.message}
              >
                <Controller
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="purpose" className="h-10! w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {purposes.map((p) => (
                          <SelectItem key={p} value={p}>
                            {transferPurposeLabel[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            {recipientId && (
              <FormField
                id="to_account_id"
                label="Хүлээн авах данс"
                error={errors.to_account_id?.message}
              >
                {recipientLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Дансны мэдээллийг уншиж байна…
                  </p>
                ) : accounts.length === 0 ? (
                  <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    <ShieldAlertIcon className="size-4 shrink-0" />
                    {currency} валютаар бүртгэлтэй данс алга.
                  </p>
                ) : (
                  <Controller
                    control={form.control}
                    name="to_account_id"
                    render={({ field }) => (
                      <div
                        id="to_account_id"
                        role="radiogroup"
                        aria-label="Хүлээн авах данс"
                        className="grid gap-2"
                      >
                        {accounts.map((a) => (
                          <AccountOption
                            key={a.id}
                            account={a}
                            name={field.name}
                            selected={field.value === a.id}
                            onSelect={() => field.onChange(a.id)}
                          />
                        ))}
                      </div>
                    )}
                  />
                )}
                {toAccount && toAccount.status !== 'verified' && (
                  <p className="text-xs text-muted-foreground">
                    Шилжүүлэхээс өмнө банкны CAM-аар автоматаар баталгаажуулна.
                  </p>
                )}
              </FormField>
            )}

            <FormField
              id="from_account_id"
              label="Илгээх компанийн данс"
              error={errors.from_account_id?.message}
            >
              {company.isPending ? (
                <p className="text-sm text-muted-foreground">
                  Компанийн дансыг уншиж байна…
                </p>
              ) : fromAccounts.length === 0 ? (
                <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <ShieldAlertIcon className="size-4 shrink-0" />
                  {currency} валютын идэвхтэй компанийн данс бүртгэгдээгүй.
                </p>
              ) : (
                <Controller
                  control={form.control}
                  name="from_account_id"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="from_account_id"
                        className="h-10! w-full"
                        aria-invalid={!!errors.from_account_id}
                      >
                        <SelectValue placeholder="Данс сонгох" />
                      </SelectTrigger>
                      <SelectContent>
                        {fromAccounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.bank_name} · {a.account_number}
                            {a.is_default ? ' (үндсэн)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="amount"
                label={`Дүн (${currency})`}
                error={errors.amount?.message}
              >
                <Input
                  id="amount"
                  inputMode="decimal"
                  placeholder="1000.00"
                  className="tabular h-10"
                  aria-invalid={!!errors.amount}
                  {...form.register('amount')}
                />
              </FormField>
              <FormField
                id="description"
                label="Тайлбар"
                optional
                error={errors.description?.message}
              >
                <Input
                  id="description"
                  maxLength={200}
                  placeholder="Жишээ нь: Бондын төлбөр"
                  className="h-10"
                  aria-invalid={!!errors.description}
                  {...form.register('description')}
                />
              </FormField>
            </div>
          </FieldGroup>

          <ApiErrorAlert error={error} />
          {conflict && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setKey(crypto.randomUUID());
                  setConflict(false);
                  setError(null);
                }}
              >
                Шинэ түлхүүрээр үргэлжлүүлэх
              </Button>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Болих
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || !toAccount || fromAccounts.length === 0}
              className="h-10 px-5"
            >
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Илгээх
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** One of the recipient's accounts as a choice: bank, number, holder, status. */
function AccountOption({
  account: a,
  name,
  selected,
  onSelect,
}: {
  account: RecipientAccount;
  name: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        'flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/40 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
        selected && 'border-primary bg-primary/5 hover:bg-primary/5',
      )}
    >
      <input
        type="radio"
        name={name}
        value={a.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border',
          selected && 'border-primary',
        )}
      >
        {selected && <span className="size-2 rounded-full bg-primary" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5 font-medium">
          {a.bank_name} · {a.account_number}
          {a.is_default && <DefaultBadge />}
          <BankStatusBadge status={a.status} />
        </span>
        <span className="mt-1 block truncate text-muted-foreground">
          {a.holder} · {a.iban.toUpperCase()}
        </span>
      </span>
    </label>
  );
}
