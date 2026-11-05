import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { BondAmountFields } from './bond-amount-fields';
import { BondExtraFields } from './bond-extra-fields';
import { BondGeneralFields } from './bond-general-fields';
import { BondInterestFields } from './bond-interest-fields';
import { BondSaleFields } from './bond-sale-fields';
import type { BondFormValues } from './use-bond-form';

export function BondFormFields({
  form,
  rateOptions,
}: {
  form: UseFormReturn<BondFormValues>;
  rateOptions?: ReactNode;
}) {
  return (
    <div className="flex flex-col divide-y divide-border">
      <BondGeneralFields form={form} />
      <BondAmountFields form={form} />
      <BondInterestFields form={form} rateOptions={rateOptions} />
      <BondSaleFields form={form} />
      <BondExtraFields form={form} />
    </div>
  );
}
