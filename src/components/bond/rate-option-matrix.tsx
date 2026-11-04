import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Controller, type UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FrequencySchema, frequencyLabel } from '@/queries/bond/type';
import { type BondFormValues, emptyRateOption } from './use-bond-form';

/** A new bond's rate matrix: one row per option, at least one (bond.md 4). */
export function RateOptionMatrix({
  form,
}: {
  form: UseFormReturn<BondFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rate_options',
  });
  const errors = form.formState.errors.rate_options;

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden grid-cols-[1fr_1fr_1.5fr_1fr_2.25rem] gap-2 px-1 text-xs font-medium text-muted-foreground sm:grid">
        <span>Доод хугацаа (сар)</span>
        <span>Дээд хугацаа (сар)</span>
        <span>Хүү төлөх давтамж</span>
        <span>Жилийн хүү (%)</span>
        <span />
      </div>
      {fields.map((f, i) => {
        const e = errors?.[i];
        const message =
          e?.term_min_months?.message ??
          e?.term_max_months?.message ??
          e?.annual_rate?.message;
        return (
          <div key={f.id} className="flex flex-col gap-1">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1.5fr_1fr_2.25rem]">
              <Input
                type="number"
                min={1}
                aria-label="Доод хугацаа (сар)"
                className="tabular h-10"
                aria-invalid={!!e?.term_min_months}
                {...form.register(`rate_options.${i}.term_min_months`, {
                  valueAsNumber: true,
                })}
              />
              <Input
                type="number"
                min={1}
                aria-label="Дээд хугацаа (сар)"
                className="tabular h-10"
                aria-invalid={!!e?.term_max_months}
                {...form.register(`rate_options.${i}.term_max_months`, {
                  valueAsNumber: true,
                })}
              />
              <Controller
                control={form.control}
                name={`rate_options.${i}.interest_frequency`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-label="Хүү төлөх давтамж"
                      className="h-10! w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FrequencySchema.options.map((o) => (
                        <SelectItem key={o} value={o}>
                          {frequencyLabel[o]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Input
                inputMode="decimal"
                placeholder="20.50"
                aria-label="Жилийн хүү (%)"
                className="tabular h-10"
                aria-invalid={!!e?.annual_rate}
                {...form.register(`rate_options.${i}.annual_rate`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10"
                aria-label="Нөхцөл хасах"
                disabled={fields.length === 1}
                onClick={() => remove(i)}
              >
                <Trash2Icon />
              </Button>
            </div>
            {message && <p className="text-sm text-destructive">{message}</p>}
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() => append(emptyRateOption())}
      >
        <PlusIcon />
        Нөхцөл нэмэх
      </Button>
    </div>
  );
}
