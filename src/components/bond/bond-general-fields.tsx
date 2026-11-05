import { Controller, type UseFormReturn } from 'react-hook-form';
import { FormField } from '@/components/common/form-field';
import { Input } from '@/components/ui/input';
import { ROW } from './bond-form-row';
import { BondFormSection } from './bond-form-section';
import { BondIssuerCombobox } from './bond-issuer-combobox';
import type { BondFormValues } from './use-bond-form';

/** Who issues the bond and what it is called. */
export function BondGeneralFields({
  form,
}: {
  form: UseFormReturn<BondFormValues>;
}) {
  const { errors } = form.formState;
  return (
    <BondFormSection
      title="Ерөнхий"
      description="Бонд гаргагч, бондын код, нэр. Код гэрээний дугаарын эхэнд орно: MFG-26/001."
    >
      <FormField
        id="bond_issuer_id"
        label="Бонд гаргагч"
        error={errors.bond_issuer_id?.message}
      >
        <Controller
          control={form.control}
          name="bond_issuer_id"
          render={({ field }) => (
            <BondIssuerCombobox
              id="bond_issuer_id"
              value={field.value}
              onChange={field.onChange}
              currency={form.watch('currency')}
              invalid={!!errors.bond_issuer_id}
            />
          )}
        />
      </FormField>
      <div className={ROW}>
        <FormField id="code" label="Код" error={errors.code?.message}>
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
      </div>
    </BondFormSection>
  );
}
