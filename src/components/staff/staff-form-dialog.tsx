import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import { generatePassword, passwordSchema } from '@/lib/password';
import { SharedPasswordInput } from './password-field';

export interface StaffValues {
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  position: string;
  password: string;
}

const base = {
  last_name: z.string().trim().min(1, 'Овгоо оруулна уу').max(100),
  first_name: z.string().trim().min(1, 'Нэрээ оруулна уу').max(100),
  position: z.string().trim().max(100),
};

const createSchema = z.object({
  ...base,
  email: z.email('Имэйл хаяг буруу байна').max(254),
  phone: z
    .string()
    .trim()
    .regex(/^\d{8}$/, 'Утасны дугаар 8 оронтой байна'),
  password: passwordSchema,
});

const editSchema = z.object({
  ...base,
  email: z.string(),
  phone: z.string(),
  password: z.string(),
});

/** Create a broker or an admin, or change their names (and a broker's position). */
export function StaffFormDialog({
  mode,
  noun,
  withPosition,
  initial,
  trigger,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  /** "брокер" or "админ". */
  noun: string;
  withPosition: boolean;
  initial?: Partial<StaffValues>;
  trigger: ReactNode;
  onSubmit: (values: StaffValues) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const defaults = (): StaffValues => ({
    last_name: initial?.last_name ?? '',
    first_name: initial?.first_name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    position: initial?.position ?? '',
    password: mode === 'create' ? generatePassword() : '',
  });
  const form = useForm<StaffValues>({
    resolver: zodResolver(mode === 'create' ? createSchema : editSchema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(values: StaffValues) {
    setError(null);
    try {
      await onSubmit(values);
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (e.code === 'user.email_taken') {
        form.setError('email', { message: e.message });
        return;
      }
      if (e.code === 'user.phone_taken') {
        form.setError('phone', { message: e.message });
        return;
      }
      if (
        applyFieldErrors(e, form.setError, {
          last_name: 'last_name',
          first_name: 'first_name',
          email: 'email',
          phone: 'phone',
          position: 'position',
          password: 'password',
        })
      ) {
        return;
      }
      setError(e);
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
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? `Шинэ ${noun} нэмэх`
                : `${noun[0].toUpperCase()}${noun.slice(1)} засах`}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Анхны нууц үгийг өөрөө дамжуулна. Систем имэйл илгээхгүй.'
                : 'Имэйл, утсыг өөрчлөх боломжгүй.'}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="last_name"
                label="Овог"
                error={errors.last_name?.message}
              >
                <Input
                  id="last_name"
                  className="h-10"
                  aria-invalid={!!errors.last_name}
                  {...form.register('last_name')}
                />
              </FormField>
              <FormField
                id="first_name"
                label="Нэр"
                error={errors.first_name?.message}
              >
                <Input
                  id="first_name"
                  className="h-10"
                  aria-invalid={!!errors.first_name}
                  {...form.register('first_name')}
                />
              </FormField>
            </div>
            {mode === 'create' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="email"
                  label="Имэйл"
                  error={errors.email?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    autoComplete="off"
                    className="h-10"
                    aria-invalid={!!errors.email}
                    {...form.register('email')}
                  />
                </FormField>
                <FormField
                  id="phone"
                  label="Утас"
                  error={errors.phone?.message}
                >
                  <Input
                    id="phone"
                    inputMode="numeric"
                    maxLength={8}
                    className="tabular h-10"
                    aria-invalid={!!errors.phone}
                    {...form.register('phone')}
                  />
                </FormField>
              </div>
            )}
            {withPosition && (
              <FormField
                id="position"
                label="Албан тушаал"
                optional
                error={errors.position?.message}
              >
                <Input
                  id="position"
                  className="h-10"
                  aria-invalid={!!errors.position}
                  {...form.register('position')}
                />
              </FormField>
            )}
            {mode === 'create' && (
              <FormField
                id="password"
                label="Анхны нууц үг"
                error={errors.password?.message}
                hint="Хуулж аваад аюулгүй сувгаар дамжуулна уу."
              >
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <SharedPasswordInput
                      id="password"
                      aria-invalid={!!errors.password}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      onGenerate={(v) =>
                        form.setValue('password', v, { shouldValidate: true })
                      }
                    />
                  )}
                />
              </FormField>
            )}
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
              {mode === 'create' ? 'Нэмэх' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
