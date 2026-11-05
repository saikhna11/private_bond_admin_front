import { Controller, type UseFormReturn } from 'react-hook-form';
import { FormField } from '@/components/common/form-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BondFormSection } from './bond-form-section';
import { PercentInput } from './percent-input';
import type { BondFormValues } from './use-bond-form';

export function BondExtraFields({
  form,
}: {
  form: UseFormReturn<BondFormValues>;
}) {
  const { errors } = form.formState;

  return (
    <BondFormSection>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <FormField
          id="exit_fee_rate"
          label="Хугацаанаас өмнө гарах шимтгэл"
          error={errors.exit_fee_rate?.message}
        >
          <PercentInput
            id="exit_fee_rate"
            aria-invalid={!!errors.exit_fee_rate}
            {...form.register('exit_fee_rate')}
          />
        </FormField>

        <FormField
          id="penalty_rate"
          label="Алданги, хоногт"
          error={errors.penalty_rate?.message}
        >
          <PercentInput
            id="penalty_rate"
            aria-invalid={!!errors.penalty_rate}
            {...form.register('penalty_rate')}
          />
        </FormField>

        <FormField
          id="issuer_cutoff"
          label="Бонд гаргагчийн төлбөрийн цаг"
          error={errors.issuer_cutoff?.message}
        >
          <Input
            id="issuer_cutoff"
            type="time"
            className="h-10"
            aria-invalid={!!errors.issuer_cutoff}
            {...form.register('issuer_cutoff')}
          />
        </FormField>

        <FormField id="has_guarantee" label="Барьцаа">
          <Controller
            control={form.control}
            name="has_guarantee"
            render={({ field }) => (
              <label
                htmlFor="has_guarantee"
                className="flex h-10 cursor-pointer items-center gap-2.5 rounded-md border border-input px-3 text-sm shadow-xs transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary/60 has-data-[state=checked]:bg-primary/5 dark:bg-input/30 dark:has-data-[state=checked]:bg-primary/10"
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
        </FormField>
      </div>

      <FormField
        id="prospectus"
        label="Танилцуулга"
        optional
        error={errors.prospectus?.message}
      >
        <Textarea
          id="prospectus"
          rows={5}
          aria-invalid={!!errors.prospectus}
          {...form.register('prospectus')}
        />
      </FormField>
    </BondFormSection>
  );
}
