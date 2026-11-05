import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Controller, type UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type Frequency,
  FrequencySchema,
  frequencyLabel,
} from '@/queries/bond/type';
import { PercentInput } from './percent-input';
import { snapTerm } from './rate-option-rules';
import { TermSelect } from './term-select';
import { type BondFormValues, emptyRateOption } from './use-bond-form';

/**
 * A new bond's rate matrix: one row per option, at least one (bond.md 4). The frequency comes
 * first, since it decides which terms a row may start and end on.
 */
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
  const options = form.watch('rate_options');

  /** Moves row i's terms onto the ones frequency takes, keeping the range in order. */
  function setFrequency(i: number, frequency: Frequency) {
    const o = form.getValues(`rate_options.${i}`);
    const min = snapTerm(o.term_min_months, frequency);
    const max = Math.max(snapTerm(o.term_max_months, frequency), min);
    form.setValue(`rate_options.${i}.interest_frequency`, frequency);
    form.setValue(`rate_options.${i}.term_min_months`, min);
    form.setValue(`rate_options.${i}.term_max_months`, max, {
      shouldValidate: form.formState.isSubmitted,
    });
  }

  return (
    <div className="@container flex flex-col gap-3">
      <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_2.5rem] gap-2 text-sm font-medium @xl:grid">
        <span>Хүү төлөх давтамж</span>
        <span>Доод хугацаа</span>
        <span>Дээд хугацаа</span>
        <span>Жилийн хүү</span>
        <span />
      </div>
      {fields.map((f, i) => {
        const e = errors?.[i];
        const message =
          e?.term_min_months?.message ??
          e?.term_max_months?.message ??
          e?.annual_rate?.message;
        const frequency = options[i]?.interest_frequency ?? 'monthly';
        return (
          <div
            key={f.id}
            className="flex flex-col gap-1 rounded-lg border p-2 @xl:rounded-none @xl:border-0 @xl:p-0"
          >
            <div className="grid grid-cols-2 gap-2 @xl:grid-cols-[1.5fr_1fr_1fr_1fr_2.5rem]">
              <div className="col-span-2 @xl:col-span-1">
                <Select
                  value={frequency}
                  onValueChange={(v) => setFrequency(i, v as Frequency)}
                >
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
              </div>
              <Controller
                control={form.control}
                name={`rate_options.${i}.term_min_months`}
                render={({ field }) => (
                  <TermSelect
                    label="Доод хугацаа"
                    frequency={frequency}
                    value={field.value}
                    invalid={!!e?.term_min_months}
                    onChange={(t) => {
                      field.onChange(t);
                      if (
                        form.getValues(`rate_options.${i}.term_max_months`) < t
                      ) {
                        form.setValue(`rate_options.${i}.term_max_months`, t);
                      }
                    }}
                  />
                )}
              />
              <Controller
                control={form.control}
                name={`rate_options.${i}.term_max_months`}
                render={({ field }) => (
                  <TermSelect
                    label="Дээд хугацаа"
                    frequency={frequency}
                    from={options[i]?.term_min_months}
                    value={field.value}
                    invalid={!!e?.term_max_months}
                    onChange={field.onChange}
                  />
                )}
              />
              <PercentInput
                placeholder="20.50"
                aria-label="Жилийн хүү (%)"
                aria-invalid={!!e?.annual_rate}
                {...form.register(`rate_options.${i}.annual_rate`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 justify-self-end @xl:justify-self-auto"
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
