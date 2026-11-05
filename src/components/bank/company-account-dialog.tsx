import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
import { FormField } from '@/components/common/form-field';
import {
  BankAccountFields,
  bankAccountSchema,
  emptyBankAccount,
} from '@/components/issuer/bank-account-fields';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bankNames } from '@/lib/banks';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import type {
  CompanyBankAccountType,
  CreateCompanyAccountBody,
  UpdateCompanyAccountBody,
} from '@/queries/bank/type';
import { CurrencySchema } from '@/queries/issuer/type';

const createSchema = bankAccountSchema.extend({
  currency: CurrencySchema,
  is_default: z.boolean(),
});
type CreateValues = z.input<typeof createSchema>;
type CreateOutput = z.output<typeof createSchema>;

/** Registers one of Ulzii&Co's own accounts. Super admins only. */
export function CreateCompanyAccountDialog({
  trigger,
  onSubmit,
}: {
  trigger: ReactNode;
  onSubmit: (body: CreateCompanyAccountBody) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const defaults = (): CreateValues => ({
    currency: 'MNT',
    is_default: false,
    ...emptyBankAccount,
  });
  const form = useForm<CreateValues, unknown, CreateOutput>({
    resolver: zodResolver(createSchema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(v: CreateOutput) {
    setError(null);
    try {
      await onSubmit({ ...v, is_default: v.is_default || undefined });
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (e.code === 'bank.company_account_exists') {
        form.setError('account_number', { message: e.message });
        return;
      }
      if (
        e.code === 'client.iban_invalid' ||
        e.code === 'client.iban_mismatch'
      ) {
        form.setError('iban', { message: e.message });
        return;
      }
      if (
        applyFieldErrors(e, form.setError, {
          bank_name: 'bank_name',
          account_number: 'account_number',
          iban: 'iban',
          account_name: 'account_name',
          currency: 'currency',
        })
      ) {
        return;
      }
      setError(e);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          form.reset(defaults());
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>Компанийн данс нэмэх</DialogTitle>
            <DialogDescription>
              Банкны корпорацийн шлюзээр үйлчилдэг данс байна. Дансны дугаар,
              IBAN, валютыг дараа нь өөрчлөх боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <FormField id="company_currency" label="Валют">
              <Controller
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <Tabs value={field.value} onValueChange={field.onChange}>
                    <TabsList id="company_currency">
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
            <BankAccountFields
              register={(n) => form.register(n)}
              bankName={form.watch('bank_name')}
              onBankName={(v) =>
                form.setValue('bank_name', v, { shouldValidate: true })
              }
              errors={errors}
              prefix="company_"
            />
            <div className="flex items-center gap-2">
              <Controller
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <Checkbox
                    id="company_is_default"
                    checked={field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                )}
              />
              <Label htmlFor="company_is_default" className="text-sm">
                Энэ валютын үндсэн данс болгох
              </Label>
            </div>
          </FieldGroup>
          <ApiErrorAlert error={error} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Болих
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Нэмэх
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const editSchema = z.object({
  bank_name: bankAccountSchema.shape.bank_name,
  account_name: bankAccountSchema.shape.account_name,
  is_active: z.boolean(),
});
type EditValues = z.infer<typeof editSchema>;

/** Changes a company account's names or turns it off. Super admins only. */
export function EditCompanyAccountDialog({
  account,
  open,
  onOpenChange,
  onSubmit,
}: {
  account: CompanyBankAccountType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: UpdateCompanyAccountBody) => Promise<unknown>;
}) {
  const [error, setError] = useState<ApiError | null>(null);
  const defaults = (): EditValues => ({
    bank_name: account.bank_name,
    account_name: account.account_name,
    is_active: account.is_active,
  });
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;
  const bankName = form.watch('bank_name');
  // A name saved before the list of banks changed stays selectable.
  const banks: readonly string[] = bankNames.includes(
    account.bank_name as (typeof bankNames)[number],
  )
    ? bankNames
    : [account.bank_name, ...bankNames];

  async function submit(v: EditValues) {
    setError(null);
    try {
      await onSubmit(v);
      onOpenChange(false);
    } catch (err) {
      const e = toApiError(err);
      if (
        applyFieldErrors(e, form.setError, {
          bank_name: 'bank_name',
          account_name: 'account_name',
        })
      ) {
        return;
      }
      setError(e);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) {
          form.reset(defaults());
          setError(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>Компанийн данс засах</DialogTitle>
            <DialogDescription>
              {account.account_number} ({account.currency}). Дансны дугаар,
              IBAN, валют өөрчлөгдөхгүй.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <FormField
              id="edit_company_bank_name"
              label="Банк"
              error={errors.bank_name?.message}
            >
              <Select
                value={bankName}
                onValueChange={(v) =>
                  form.setValue('bank_name', v, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  id="edit_company_bank_name"
                  className="h-10! w-full"
                  aria-invalid={!!errors.bank_name}
                >
                  <SelectValue placeholder="Банк сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              id="edit_company_account_name"
              label="Данс эзэмшигч"
              error={errors.account_name?.message}
              hint="Банкны бүртгэл дэх нэрээр"
            >
              <Input
                id="edit_company_account_name"
                className="h-10"
                aria-invalid={!!errors.account_name}
                {...form.register('account_name')}
              />
            </FormField>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <Checkbox
                      id="edit_company_is_active"
                      checked={field.value}
                      onCheckedChange={(c) => field.onChange(c === true)}
                    />
                  )}
                />
                <Label htmlFor="edit_company_is_active" className="text-sm">
                  Идэвхтэй
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Идэвхгүй данснаас шилжүүлэг илгээхгүй, хуулгыг нь уншихгүй.
                Үндсэн дансыг идэвхгүй болговол үндсэн эрх нь тухайн валютын өөр
                дансанд шилжинэ.
              </p>
            </div>
          </FieldGroup>
          <ApiErrorAlert error={error} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Болих
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Хадгалах
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
