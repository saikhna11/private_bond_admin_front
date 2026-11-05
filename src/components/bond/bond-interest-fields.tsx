import type { ReactNode } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { BondFormSection } from './bond-form-section';
import { InterestMethodCards } from './interest-method-cards';
import type { BondFormValues } from './use-bond-form';

/** How interest is counted and, for a new bond, its rate options. */
export function BondInterestFields({
  form,
  rateOptions,
}: {
  form: UseFormReturn<BondFormValues>;
  rateOptions?: ReactNode;
}) {
  return (
    <BondFormSection
      title="Хүү"
      description={
        rateOptions
          ? 'Хүү тооцох арга, хугацаа бүрийн жилийн хүү. Давтамж хугацааны алхмыг заана: улирал тутам бол 3, 6, 9 сар. Ижил давтамжийн хугацаа давхцахгүй.'
          : 'Хүү тооцох арга. Хүүгийн нөхцөлүүдийг бондын хуудасны хүснэгтээс засна.'
      }
    >
      <Controller
        control={form.control}
        name="interest_method"
        render={({ field }) => (
          <InterestMethodCards value={field.value} onChange={field.onChange} />
        )}
      />
      {rateOptions}
    </BondFormSection>
  );
}
