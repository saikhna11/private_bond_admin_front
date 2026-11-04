import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import type {
  Currency,
  IssuerBankAccountBody,
  IssuerBankAccountType,
} from '@/queries/issuer/type';
import {
  BankAccountFields,
  bankAccountSchema,
  emptyBankAccount,
} from './bank-account-fields';

const schema = bankAccountSchema.extend({ currency: z.enum(['MNT', 'USD']) });
type Values = z.input<typeof schema>;

/** Adds an issuer's account in a currency, or changes the one it has. */
export function BankAccountDialog({
  account,
  takenCurrencies,
  trigger,
  onSubmit,
}: {
  /** The account to change; leave out to add one. */
  account?: IssuerBankAccountType;
  /** Currencies that already have an account, when adding. */
  takenCurrencies?: Currency[];
  trigger: ReactNode;
  onSubmit: (
    currency: Currency,
    body: IssuerBankAccountBody,
  ) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const free = (['MNT', 'USD'] as const).filter(
    (c) => !takenCurrencies?.includes(c),
  );
  const defaults = (): Values =>
    account
      ? {
          currency: account.currency,
          bank_name: account.bank_name,
          account_number: account.account_number,
          iban: account.iban,
          account_name: account.account_name,
        }
      : { currency: free[0] ?? 'MNT', ...emptyBankAccount };
  const form = useForm<Values, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(v: z.output<typeof schema>) {
    setError(null);
    try {
      const { currency, ...body } = v;
      await onSubmit(currency, body);
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
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
              {account ? `${account.currency} данс засах` : 'Банкны данс нэмэх'}
            </DialogTitle>
            <DialogDescription>
              Бондоор босгосон хөрөнгө энэ дансанд шилжинэ. Валют тус бүрд нэг
              данс. Мэдээлэл өөрчлөгдвөл данс дахин баталгаажаагүй төлөвт орно.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            {!account && (
              <FormField id="currency" label="Валют">
                <Controller
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <Tabs value={field.value} onValueChange={field.onChange}>
                      <TabsList>
                        {(['MNT', 'USD'] as const).map((c) => (
                          <TabsTrigger
                            key={c}
                            value={c}
                            disabled={!free.includes(c)}
                          >
                            {c}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  )}
                />
              </FormField>
            )}
            <BankAccountFields
              register={(n) => form.register(n)}
              bankName={form.watch('bank_name')}
              onBankName={(v) =>
                form.setValue('bank_name', v, { shouldValidate: true })
              }
              errors={errors}
              prefix="account_"
            />
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
