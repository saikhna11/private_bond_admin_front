import { Controller, type UseFormReturn } from 'react-hook-form';
import { FormField } from '@/components/common/form-field';
import { SegmentedControl } from '@/components/common/segmented-control';
import {
  type Currency,
  CurrencySchema,
  PURCHASE_UNITS,
} from '@/queries/bond/type';
import { AmountInput } from './amount-input';
import { ROW } from './bond-form-row';
import { BondFormSection } from './bond-form-section';
import type { BondFormValues } from './use-bond-form';

const money = (n: bigint) => n.toLocaleString('en-US');

const currencies = CurrencySchema.options.map((c) => ({ value: c, label: c }));
const units = PURCHASE_UNITS.map((u) => ({
  value: u,
  label: money(BigInt(u)),
}));

/** The bond's currency, its purchase unit and the amounts, all whole units. */
export function BondAmountFields({
  form,
}: {
  form: UseFormReturn<BondFormValues>;
}) {
  const { errors } = form.formState;
  const currency = form.watch('currency');
  const unit = form.watch('purchase_unit');
  const u = BigInt(unit);

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
            unit={unit}
            currency={currency}
            placeholder={name === 'investor_cap' ? 'Хязгааргүй' : undefined}
            aria-invalid={!!errors[name]}
          />
        )}
      />
    </FormField>
  );

  return (
    <BondFormSection
      title={`Дүн (${currency})`}
      description={`Худалдан авалт нэгжийн үржвэр байна: ${money(u)} нэгжтэй бол ${money(2n * u)}, ${money(3n * u)} болно, ${money((5n * u) / 2n)} болохгүй. Нийт босгох дүн хамгийн бага дүнгээс багагүй.`}
    >
      <div className={ROW}>
        <FormField id="currency" label="Валют">
          <Controller
            control={form.control}
            name="currency"
            render={({ field }) => (
              <SegmentedControl<Currency>
                id="currency"
                label="Валют"
                value={field.value}
                onChange={field.onChange}
                options={currencies}
              />
            )}
          />
        </FormField>
        <FormField id="purchase_unit" label="Худалдан авах нэгж">
          <Controller
            control={form.control}
            name="purchase_unit"
            render={({ field }) => (
              <SegmentedControl
                id="purchase_unit"
                label="Худалдан авах нэгж"
                value={field.value}
                onChange={field.onChange}
                options={units}
              />
            )}
          />
        </FormField>
        {amountField('min_purchase', 'Хамгийн бага худалдан авалт')}
        {amountField('total_amount', 'Нийт босгох дүн')}
        {amountField('investor_cap', 'Нэг хөрөнгө оруулагчийн дээд дүн')}
      </div>
    </BondFormSection>
  );
}
