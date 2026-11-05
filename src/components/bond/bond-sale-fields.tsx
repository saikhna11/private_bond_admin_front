import type { UseFormReturn } from 'react-hook-form';
import { FormField } from '@/components/common/form-field';
import { Input } from '@/components/ui/input';
import { ROW } from './bond-form-row';
import { BondFormSection } from './bond-form-section';
import type { BondFormValues } from './use-bond-form';

/** When customers may buy the bond. */
export function BondSaleFields({
  form,
}: {
  form: UseFormReturn<BondFormValues>;
}) {
  const { errors } = form.formState;
  return (
    <BondFormSection
      title="Борлуулалт"
      description="Харилцагч худалдан авч болох хугацаа. Дуусах огноо хоосон бол дүүрэх эсвэл хаах хүртэл үргэлжилнэ."
    >
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
    </BondFormSection>
  );
}
