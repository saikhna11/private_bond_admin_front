import type { ReactNode } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { BondFormSection } from './bond-form-section';
import { InterestMethodCards } from './interest-method-cards';
import type { BondFormValues } from './use-bond-form';

export function BondInterestFields({
  form,
  rateOptions,
}: {
  form: UseFormReturn<BondFormValues>;
  rateOptions?: ReactNode;
}) {
  return (
    <BondFormSection>
      <Controller
        control={form.control}
        name="interest_method"
        render={({ field }) => (
          <InterestMethodCards value={field.value} onChange={field.onChange} />
        )}
      />
      {rateOptions && <div className="mt-4">{rateOptions}</div>}
    </BondFormSection>
  );
}
