import { Controller, type UseFormReturn } from 'react-hook-form';
import { FormField } from '@/components/common/form-field';
import { Input } from '@/components/ui/input';
import { BondFormSection } from './bond-form-section';
import { BondIssuerCombobox } from './bond-issuer-combobox';
import type { BondFormValues } from './use-bond-form';

export function BondGeneralFields({
  form,
}: {
  form: UseFormReturn<BondFormValues>;
}) {
  const { errors } = form.formState;

  return (
    <BondFormSection>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-3">
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
        </div>

        <div className="md:col-span-1">
          <FormField id="code" label="Код" error={errors.code?.message}>
            <Input
              id="code"
              className="h-10 font-mono uppercase"
              aria-invalid={!!errors.code}
              {...form.register('code')}
            />
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField id="name" label="Нэр" error={errors.name?.message}>
            <Input
              id="name"
              className="h-10"
              aria-invalid={!!errors.name}
              {...form.register('name')}
            />
          </FormField>
        </div>
      </div>
    </BondFormSection>
  );
}
