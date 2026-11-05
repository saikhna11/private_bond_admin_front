import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
import { FormField } from '@/components/common/form-field';
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
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import type {
  IssuerBankAccountBody,
  IssuerBankAccountType,
} from '@/queries/issuer/type';
import {
  BankAccountFields,
  bankAccountSchema,
  emptyBankAccount,
} from './bank-account-fields';

const schema = bankAccountSchema.extend({
  currency: z.enum(['MNT', 'USD']),
  is_default: z.boolean(),
});
type Values = z.input<typeof schema>;

/**
 * Adds one of an issuer's accounts (any number per currency), or replaces one by its id.
 * A changed field puts the account back to unverified.
 */
export function BankAccountDialog({
  account,
  trigger,
  onSubmit,
}: {
  /** The account to change; leave out to add one. */
  account?: IssuerBankAccountType;
  trigger: ReactNode;
  onSubmit: (body: IssuerBankAccountBody) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const defaults = (): Values =>
    account
      ? {
          currency: account.currency,
          bank_name: account.bank_name,
          account_number: account.account_number,
          iban: account.iban,
          account_name: account.account_name,
          is_default: account.is_default,
        }
      : { currency: 'MNT', is_default: false, ...emptyBankAccount };
  const form = useForm<Values, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(v: z.output<typeof schema>) {
    setError(null);
    try {
      const { is_default, ...body } = v;
      // is_default is ignored on a replace; the default is changed on its own.
      await onSubmit(account ? body : { ...body, is_default });
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (e.code === 'issuer.bank_account_exists') {
        form.setError('iban', { message: e.message });
        return;
      }
      if (
        applyFieldErrors(e, form.setError, {
          bank_name: 'bank_name',
          account_number: 'account_number',
          iban: 'iban',
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
            <DialogTitle>
              {account ? 'Банкны данс засах' : 'Банкны данс нэмэх'}
            </DialogTitle>
            <DialogDescription>
              Бондоор босгосон хөрөнгө энэ дансанд шилжинэ. Валют бүрд хэдэн ч
              данс бүртгэж болох ба нэг нь үндсэн данс байна. Мэдээлэл
              өөрчлөгдвөл данс дахин баталгаажаагүй төлөвт орно.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <FormField
              id="currency"
              label="Валют"
              hint={
                account?.is_default
                  ? 'Валют солибол энэ данс үндсэн данс байхаа болино.'
                  : undefined
              }
            >
              <Controller
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <Tabs value={field.value} onValueChange={field.onChange}>
                    <TabsList>
                      {(['MNT', 'USD'] as const).map((c) => (
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
              prefix="account_"
            />
            {!account && (
              <div className="flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <Checkbox
                      id="account_is_default"
                      checked={field.value}
                      onCheckedChange={(c) => field.onChange(c === true)}
                    />
                  )}
                />
                <Label htmlFor="account_is_default" className="text-sm">
                  Энэ валютын үндсэн данс болгох
                </Label>
              </div>
            )}
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
