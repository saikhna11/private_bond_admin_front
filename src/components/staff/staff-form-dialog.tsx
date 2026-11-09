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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  /** The role a new admin holds, when the dialog has access. */
  role_id: string;
}

/** The roles an admin may be given, for the admin dialogs. */
export interface StaffAccess {
  roles: { id: string; name: string; is_active: boolean }[];
  rolesLoading?: boolean;
}

const base = {
  last_name: z.string().trim().min(1, 'Овгоо оруулна уу').max(100),
  first_name: z.string().trim().min(1, 'Нэрээ оруулна уу').max(100),
  position: z.string().trim().max(100),
  role_id: z.string(),
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

/** A bond issuer's member: the phone may be left out. */
const createOptionalPhoneSchema = createSchema.extend({
  phone: z
    .string()
    .trim()
    .regex(/^(\d{8})?$/, 'Утасны дугаар 8 оронтой байна'),
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
  phoneOptional,
  description,
  initial,
  trigger,
  onSubmit,
  access,
}: {
  mode: 'create' | 'edit';
  /** "брокер" or "админ". */
  noun: string;
  withPosition: boolean;
  /** Lets the phone be left empty when creating (a bond issuer's member). */
  phoneOptional?: boolean;
  /** Replaces the create dialog's description. */
  description?: string;
  initial?: Partial<StaffValues>;
  trigger: ReactNode;
  onSubmit: (values: StaffValues) => Promise<unknown>;
  /** Shows the super flag and the role (the admin dialogs). */
  access?: StaffAccess;
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
    role_id: initial?.role_id ?? '',
  });
  const form = useForm<StaffValues>({
    resolver: zodResolver(
      mode === 'edit'
        ? editSchema
        : phoneOptional
          ? createOptionalPhoneSchema
          : createSchema,
    ),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(values: StaffValues) {
    setError(null);
    if (access && mode === 'create' && !values.role_id) {
      form.setError('role_id', { message: 'Эрхийн бүлэг сонгоно уу' });
      return;
    }
    try {
      await onSubmit(values);
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (e.code === 'user.email_taken' || e.code === 'admin.email_taken') {
        form.setError('email', { message: e.message });
        return;
      }
      if (e.code === 'user.phone_taken') {
        form.setError('phone', { message: e.message });
        return;
      }
      if (e.code === 'admin.role_required' || e.code.startsWith('role.')) {
        form.setError('role_id', { message: e.message });
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
          role_id: 'role_id',
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
                ? (description ??
                  'Анхны нууц үгийг өөрөө дамжуулна. Систем имэйл илгээхгүй.')
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
                  optional={phoneOptional}
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
            {access && mode === 'create' && (
              <RoleSelect
                id="role_id"
                roles={access.roles}
                loading={access.rolesLoading}
                value={form.watch('role_id')}
                error={errors.role_id?.message}
                onChange={(v) =>
                  form.setValue('role_id', v, { shouldValidate: true })
                }
              />
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

/** The role select of the admin dialogs: the system role first, as the API lists them. */
export function RoleSelect({
  id,
  roles,
  loading,
  value,
  error,
  onChange,
}: {
  id: string;
  roles: StaffAccess['roles'];
  loading?: boolean;
  value: string;
  error?: string;
  onChange: (id: string) => void;
}) {
  return (
    <FormField
      id={id}
      label="Эрхийн бүлэг"
      error={error}
      hint="Админ зөвхөн бүлгийнхээ эрхээр ажиллана. Супер админ бүх эрхтэй."
    >
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="h-10! w-full"
          aria-invalid={!!error}
          disabled={loading}
        >
          <SelectValue placeholder={loading ? 'Ачаалж байна...' : 'Сонгох'} />
        </SelectTrigger>
        <SelectContent>
          {roles.map((r) => (
            <SelectItem key={r.id} value={r.id} disabled={!r.is_active}>
              {r.name}
              {!r.is_active && ' (идэвхгүй)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
