import type { UseFormReturn } from "react-hook-form";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { BondFormSection } from "./bond-form-section";
import type { BondFormValues } from "./use-bond-form";

export function BondSaleFields({
  form,
}: {
  form: UseFormReturn<BondFormValues>;
}) {
  const { errors } = form.formState;

  return (
    <BondFormSection>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
            {...form.register("sale_start")}
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
            {...form.register("sale_end")}
          />
        </FormField>
      </div>
    </BondFormSection>
  );
}
