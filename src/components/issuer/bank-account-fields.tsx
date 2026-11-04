import type { FieldErrors, UseFormRegisterReturn } from 'react-hook-form';
import * as z from 'zod';
import { FormField } from '@/components/common/form-field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bankNames } from '@/lib/banks';

export const bankAccountSchema = z.object({
  bank_name: z.string().min(1, 'Банкаа сонгоно уу'),
  account_number: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, 'Дансны дугаар 6-20 оронтой тоо байна'),
  iban: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase().replace(/\s/g, ''))
    .pipe(z.string().regex(/^MN\d{18}$/, 'IBAN нь MN ба 18 оронтой тоо байна')),
  account_name: z
    .string()
    .trim()
    .min(1, 'Данс эзэмшигчийн нэрийг оруулна уу')
    .max(200),
});

export type BankAccountValues = z.input<typeof bankAccountSchema>;

export const emptyBankAccount: BankAccountValues = {
  bank_name: '',
  account_number: '',
  iban: '',
  account_name: '',
};

type TextField = 'account_number' | 'iban' | 'account_name';

/** The four fields of an issuer's bank account, inside a bigger form. */
export function BankAccountFields({
  register,
  bankName,
  onBankName,
  errors,
  prefix,
}: {
  register: (name: TextField) => UseFormRegisterReturn;
  bankName: string;
  onBankName: (value: string) => void;
  errors?: FieldErrors<BankAccountValues>;
  /** Keeps the input ids unique on the page. */
  prefix: string;
}) {
  const id = (f: string) => `${prefix}${f}`;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        id={id('bank_name')}
        label="Банк"
        error={errors?.bank_name?.message}
      >
        <Select value={bankName} onValueChange={onBankName}>
          <SelectTrigger
            id={id('bank_name')}
            className="h-10! w-full"
            aria-invalid={!!errors?.bank_name}
          >
            <SelectValue placeholder="Банк сонгох" />
          </SelectTrigger>
          <SelectContent>
            {bankNames.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField
        id={id('account_number')}
        label="Дансны дугаар"
        error={errors?.account_number?.message}
      >
        <Input
          id={id('account_number')}
          inputMode="numeric"
          className="tabular h-10"
          aria-invalid={!!errors?.account_number}
          {...register('account_number')}
        />
      </FormField>
      <FormField id={id('iban')} label="IBAN" error={errors?.iban?.message}>
        <Input
          id={id('iban')}
          placeholder="MN000000000000000000"
          className="tabular h-10 font-mono"
          aria-invalid={!!errors?.iban}
          {...register('iban')}
        />
      </FormField>
      <FormField
        id={id('account_name')}
        label="Данс эзэмшигч"
        error={errors?.account_name?.message}
        hint="Банкны бүртгэл дэх нэрээр"
      >
        <Input
          id={id('account_name')}
          className="h-10"
          aria-invalid={!!errors?.account_name}
          {...register('account_name')}
        />
      </FormField>
    </div>
  );
}
