import { Controller, type UseFormReturn } from 'react-hook-form';
import { FormField } from '@/components/common/form-field';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  CurrencySchema,
  InterestMethodSchema,
  interestMethodHint,
  interestMethodLabel,
  PURCHASE_UNITS,
} from '@/queries/bond/type';
import { AmountInput } from './amount-input';
import { BondIssuerPicker } from './bond-issuer-picker';
import type { BondFormValues } from './use-bond-form';

/** Two columns once the form is 36rem wide, whatever the screen: a page or a dialog. */
const ROW = 'grid gap-4 @xl/field-group:grid-cols-2';

/** "= 4 нэгж" for an amount that is a whole number of units, else nothing. */
function unitsOf(amount: string, unit: string): string | undefined {
  if (!/^\d+$/.test(amount) || amount === '0') return undefined;
  const a = BigInt(amount);
  const u = BigInt(unit);
  return a % u === 0n ? `= ${(a / u).toLocaleString('en-US')} нэгж` : undefined;
}

/** A bond's terms (bond.md 3.2): its issuer, what it is, its amounts, its dates and the rest. */
export function BondFormFields({
  form,
}: {
  form: UseFormReturn<BondFormValues>;
}) {
  const { errors } = form.formState;
  const currency = form.watch('currency');
  const unit = form.watch('purchase_unit');
  const amountField = (
    name: 'total_amount' | 'min_purchase' | 'investor_cap',
    label: string,
    hint?: string,
  ) => {
    const units = unitsOf(form.watch(name), unit);
    return (
      <FormField
        id={name}
        label={label}
        error={errors[name]?.message}
        hint={units && hint ? `${units} · ${hint}` : (units ?? hint)}
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
              aria-invalid={!!errors[name]}
            />
          )}
        />
      </FormField>
    );
  };

  return (
    <FieldGroup className="gap-8">
      <FieldSet>
        <FieldLegend>Бонд</FieldLegend>
        <FormField
          id="bond_issuer_id"
          label="Бонд гаргагч"
          error={errors.bond_issuer_id?.message}
        >
          <Controller
            control={form.control}
            name="bond_issuer_id"
            render={({ field }) => (
              <BondIssuerPicker
                id="bond_issuer_id"
                value={field.value}
                onChange={field.onChange}
                currency={currency}
                invalid={!!errors.bond_issuer_id}
              />
            )}
          />
        </FormField>
        <div className={ROW}>
          <FormField
            id="code"
            label="Код"
            error={errors.code?.message}
            hint="Гэрээний дугаарт орно: MFG-26/001"
          >
            <Input
              id="code"
              className="h-10 font-mono uppercase"
              aria-invalid={!!errors.code}
              {...form.register('code')}
            />
          </FormField>
          <FormField id="name" label="Нэр" error={errors.name?.message}>
            <Input
              id="name"
              className="h-10"
              aria-invalid={!!errors.name}
              {...form.register('name')}
            />
          </FormField>
          <FormField id="currency" label="Валют">
            <Controller
              control={form.control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="currency" className="h-10! w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CurrencySchema.options.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField
            id="interest_method"
            label="Хүү тооцох арга"
            hint={interestMethodHint[form.watch('interest_method')]}
          >
            <Controller
              control={form.control}
              name="interest_method"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="interest_method" className="h-10! w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {InterestMethodSchema.options.map((m) => (
                      <SelectItem key={m} value={m}>
                        {interestMethodLabel[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Дүн ({currency})</FieldLegend>
        <div className={ROW}>
          <FormField
            id="purchase_unit"
            label="Худалдан авах нэгж"
            hint="Нэг нэгжийн үнэ: худалдан авалт бүхэл нэгжээр. 500,000 бол 1,000,000, 1,500,000 болно, 1,250,000 болохгүй."
          >
            <Controller
              control={form.control}
              name="purchase_unit"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="purchase_unit" className="h-10! w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURCHASE_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {BigInt(u).toLocaleString('en-US')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          {amountField('min_purchase', 'Хамгийн бага худалдан авалт')}
          {amountField(
            'total_amount',
            'Нийт босгох дүн',
            'хамгийн бага дүнгээс багагүй',
          )}
          {amountField(
            'investor_cap',
            'Нэг хөрөнгө оруулагчийн дээд дүн',
            'хоосон бол хязгааргүй',
          )}
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Борлуулалт</FieldLegend>
        <div className={ROW}>
          <FormField
            id="sale_start"
            label="Эхлэх огноо"
            error={errors.sale_start?.message}
          >
            <Input
              id="sale_start"
              type="date"
              className="h-10"
              aria-invalid={!!errors.sale_start}
              {...form.register('sale_start')}
            />
          </FormField>
          <FormField
            id="sale_end"
            label="Дуусах огноо"
            optional
            error={errors.sale_end?.message}
            hint="Хоосон бол дүүрэх эсвэл хаах хүртэл"
          >
            <Input
              id="sale_end"
              type="date"
              className="h-10"
              aria-invalid={!!errors.sale_end}
              {...form.register('sale_end')}
            />
          </FormField>
        </div>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Нэмэлт нөхцөл</FieldLegend>
        <div className={ROW}>
          <FormField
            id="issuer_cutoff"
            label="Бонд гаргагчийн төлбөрийн цаг"
            error={errors.issuer_cutoff?.message}
            hint="Төлөх өдрөө энэ цагаас өмнө шилжүүлнэ"
          >
            <Input
              id="issuer_cutoff"
              type="time"
              className="h-10"
              aria-invalid={!!errors.issuer_cutoff}
              {...form.register('issuer_cutoff')}
            />
          </FormField>
          <FormField
            id="exit_fee_rate"
            label="Хугацаанаас өмнө гарах шимтгэл (%)"
            error={errors.exit_fee_rate?.message}
          >
            <Input
              id="exit_fee_rate"
              inputMode="decimal"
              className="tabular h-10"
              aria-invalid={!!errors.exit_fee_rate}
              {...form.register('exit_fee_rate')}
            />
          </FormField>
          <FormField
            id="penalty_rate"
            label="Алданги, хоногт (%)"
            error={errors.penalty_rate?.message}
          >
            <Input
              id="penalty_rate"
              inputMode="decimal"
              className="tabular h-10"
              aria-invalid={!!errors.penalty_rate}
              {...form.register('penalty_rate')}
            />
          </FormField>
          <Controller
            control={form.control}
            name="has_guarantee"
            render={({ field }) => (
              <label
                htmlFor="has_guarantee"
                className="flex h-10 cursor-pointer items-center gap-2 self-end rounded-md border border-input px-2.5 text-sm shadow-xs transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary/60 has-data-[state=checked]:bg-primary/5 dark:bg-input/30"
              >
                <Checkbox
                  id="has_guarantee"
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                />
                Батлан даалт, барьцаатай
              </label>
            )}
          />
        </div>
        <FormField
          id="prospectus"
          label="Танилцуулга"
          optional
          error={errors.prospectus?.message}
          hint="Харилцагчид харагдах текст. Файлыг бонд бүртгэсний дараа оруулна."
        >
          <Textarea
            id="prospectus"
            rows={5}
            aria-invalid={!!errors.prospectus}
            {...form.register('prospectus')}
          />
        </FormField>
      </FieldSet>
    </FieldGroup>
  );
}
