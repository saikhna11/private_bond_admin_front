import { Controller, type UseFormReturn } from 'react-hook-form';
import { FormField } from '@/components/common/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencySchema } from '@/queries/bond/type';
import { AmountInput } from './amount-input';
import { BondFormSection } from './bond-form-section';
import type { BondFormValues } from './use-bond-form';

const currencies = CurrencySchema.options.map((c) => ({ value: c, label: c }));

export function BondAmountFields({
  form,
}: {
  form: UseFormReturn<BondFormValues>;
}) {
  const { errors } = form.formState;
  const currency = form.watch('currency');

  const amountField = (
    name: 'total_amount' | 'min_purchase' | 'investor_cap',
    label: string,
  ) => (
    <FormField
      id={name}
      label={label}
      error={errors[name]?.message}
      optional={name === 'investor_cap'}
    >
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <AmountInput
            id={name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            currency={currency}
            placeholder={name === 'investor_cap' ? 'Хязгааргүй' : undefined}
            aria-invalid={!!errors[name]}
          />
        )}
      />
    </FormField>
  );

  return (
    <BondFormSection>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField id="currency" label="Валют" error={errors.currency?.message}>
          <Controller
            control={form.control}
            name="currency"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="currency"
                  className="h-10"
                  aria-invalid={!!errors.currency}
                >
                  <SelectValue placeholder="Валют сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          id="purchase_unit"
          label="Нэгж үнэ"
          error={errors.purchase_unit?.message}
          hint="1 ширхэг нэгжын үнэ"
        >
          <Controller
            control={form.control}
            name="purchase_unit"
            render={({ field }) => (
              <AmountInput
                id="purchase_unit"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                currency={currency}
                aria-invalid={!!errors.purchase_unit}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {amountField('min_purchase', 'Хамгийн бага худалдан авалтын дүн')}
        <FormField
          id="investor_cap"
          label="Хамгийн их худалдан авалтын дүн"
          error={errors.investor_cap?.message}
          hint="Утга оруулахгүй бол хязгааргүй гэж тооцогдоно"
        >
          <Controller
            control={form.control}
            name="investor_cap"
            render={({ field }) => (
              <AmountInput
                id="investor_cap"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                currency={currency}
                aria-invalid={!!errors.investor_cap}
              />
            )}
          />
        </FormField>
      </div>
      {amountField('total_amount', 'Нийт босгох дүн')}
    </BondFormSection>
  );
}
