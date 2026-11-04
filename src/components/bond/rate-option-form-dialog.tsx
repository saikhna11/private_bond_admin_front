import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type * as z from 'zod';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import {
  FrequencySchema,
  frequencyLabel,
  type RateOptionBody,
  type RateOptionType,
} from '@/queries/bond/type';
import { rateOptionSchema } from './rate-option-rules';

type Values = z.infer<typeof rateOptionSchema>;

/** Adds a rate option to a bond, or changes option when it is given. */
export function RateOptionFormDialog({
  option,
  trigger,
  onSubmit,
}: {
  option?: RateOptionType;
  trigger: ReactNode;
  onSubmit: (body: RateOptionBody) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const defaults = (): Values => ({
    term_min_months: option?.term_min_months ?? 12,
    term_max_months: option?.term_max_months ?? 12,
    interest_frequency: option?.interest_frequency ?? 'monthly',
    annual_rate: option?.annual_rate ?? '',
  });
  const form = useForm<Values>({
    resolver: zodResolver(rateOptionSchema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(v: Values) {
    setError(null);
    try {
      await onSubmit(v);
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (
        !applyFieldErrors(e, form.setError, {
          term_min_months: 'term_min_months',
          term_max_months: 'term_max_months',
          annual_rate: 'annual_rate',
        })
      ) {
        setError(e);
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          form.reset(defaults());
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>
              {option ? 'Нөхцөл засах' : 'Хүүгийн нөхцөл нэмэх'}
            </DialogTitle>
            <DialogDescription>
              Хугацаа нь давтамжид хуваагдана; ижил давтамжтай нөхцлүүдийн муж
              давхцахгүй. Өөрчлөлт зөвхөн шинэ худалдан авалтад үйлчилнэ.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="term_min_months"
                label="Доод хугацаа (сар)"
                error={errors.term_min_months?.message}
              >
                <Input
                  id="term_min_months"
                  type="number"
                  min={1}
                  className="tabular h-10"
                  aria-invalid={!!errors.term_min_months}
                  {...form.register('term_min_months', { valueAsNumber: true })}
                />
              </FormField>
              <FormField
                id="term_max_months"
                label="Дээд хугацаа (сар)"
                error={errors.term_max_months?.message}
              >
                <Input
                  id="term_max_months"
                  type="number"
                  min={1}
                  className="tabular h-10"
                  aria-invalid={!!errors.term_max_months}
                  {...form.register('term_max_months', { valueAsNumber: true })}
                />
              </FormField>
            </div>
            <FormField id="interest_frequency" label="Хүү төлөх давтамж">
              <Controller
                control={form.control}
                name="interest_frequency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="interest_frequency"
                      className="h-10! w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FrequencySchema.options.map((f) => (
                        <SelectItem key={f} value={f}>
                          {frequencyLabel[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              id="annual_rate"
              label="Жилийн хүү (%)"
              error={errors.annual_rate?.message}
            >
              <Input
                id="annual_rate"
                inputMode="decimal"
                placeholder="20.50"
                className="tabular h-10"
                aria-invalid={!!errors.annual_rate}
                {...form.register('annual_rate')}
              />
            </FormField>
          </FieldGroup>
          <ApiErrorAlert error={error} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Болих
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              {option ? 'Хадгалах' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
