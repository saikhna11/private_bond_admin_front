import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
import { FormField } from '@/components/common/form-field';
import { SharedPasswordInput } from '@/components/staff/password-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { applyFieldErrors } from '@/lib/form-errors';
import { generatePassword, passwordSchema } from '@/lib/password';
import type { CreateIssuerBody, IssuerType } from '@/queries/issuer/type';
import {
  BankAccountFields,
  bankAccountSchema,
  emptyBankAccount,
} from './bank-account-fields';

const company = {
  name: z.string().trim().min(1, 'Компанийн нэрийг оруулна уу').max(200),
  register_number: z
    .string()
    .trim()
    .regex(/^\d{7}$/, 'Регистрийн дугаар 7 оронтой тоо байна'),
  state_register_number: z
    .string()
    .trim()
    .regex(/^\d{20}$/, 'Улсын бүртгэлийн дугаар 20 оронтой тоо байна'),
};

const createSchema = z
  .object({
    ...company,
    director: z.object({
      last_name: z.string().trim().min(1, 'Овгийг оруулна уу').max(100),
      first_name: z.string().trim().min(1, 'Нэрийг оруулна уу').max(100),
      position: z.string().trim().max(100),
      email: z.email('Имэйл хаяг буруу байна').max(248),
      phone: z
        .string()
        .trim()
        .regex(/^(\d{8})?$/, 'Утасны дугаар 8 оронтой байна'),
      password: passwordSchema,
    }),
    with_bank: z.boolean(),
    bank: z.unknown(),
  })
  .superRefine((v, ctx) => {
    if (!v.with_bank) return;
    const r = bankAccountSchema.safeParse(v.bank);
    if (!r.success) {
      for (const issue of r.error.issues) {
        ctx.addIssue({ ...issue, path: ['bank', ...issue.path] } as never);
      }
    }
  });

type CreateValues = z.input<typeof createSchema> & {
  bank: z.input<typeof bankAccountSchema>;
};

const editSchema = z.object(company);
type EditValues = z.input<typeof editSchema>;

const createDefaults = (): CreateValues => ({
  name: '',
  register_number: '',
  state_register_number: '',
  director: {
    last_name: '',
    first_name: '',
    position: 'Гүйцэтгэх захирал',
    email: '',
    phone: '',
    password: generatePassword(),
  },
  with_bank: true,
  bank: { ...emptyBankAccount },
});

/** Registers a bond issuer with its director and, optionally, its MNT account. */
export function CreateIssuerDialog({
  trigger,
  onSubmit,
}: {
  trigger: ReactNode;
  onSubmit: (body: CreateIssuerBody) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema) as never,
    defaultValues: createDefaults(),
  });
  const { errors, isSubmitting } = form.formState;
  const withBank = form.watch('with_bank');

  async function submit(v: CreateValues) {
    setError(null);
    const d = v.director;
    const bank = v.with_bank ? bankAccountSchema.parse(v.bank) : undefined;
    try {
      await onSubmit({
        name: v.name.trim(),
        register_number: v.register_number.trim(),
        state_register_number: v.state_register_number.trim(),
        director: {
          email: d.email.trim(),
          phone: d.phone.trim() || undefined,
          last_name: d.last_name.trim(),
          first_name: d.first_name.trim(),
          position: d.position.trim() || undefined,
          password: d.password,
        },
        bank_accounts: bank ? [{ currency: 'MNT', ...bank }] : undefined,
      });
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (e.code === 'issuer.register_taken') {
        form.setError('register_number', { message: e.message });
        return;
      }
      if (e.code === 'issuer.name_taken') {
        form.setError('name', { message: e.message });
        return;
      }
      if (e.code === 'user.email_taken') {
        form.setError('director.email', { message: e.message });
        return;
      }
      if (e.code === 'user.phone_taken') {
        form.setError('director.phone', { message: e.message });
        return;
      }
      if (
        applyFieldErrors(e, form.setError, {
          name: 'name',
          register_number: 'register_number',
          state_register_number: 'state_register_number',
          'director.email': 'director.email',
          'director.phone': 'director.phone',
          'director.last_name': 'director.last_name',
          'director.first_name': 'director.first_name',
          'director.password': 'director.password',
        })
      ) {
        return;
      }
      setError(e);
    }
  }

  const de = errors.director;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          form.reset(createDefaults());
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={form.handleSubmit(submit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>Бонд гаргагч бүртгэх</DialogTitle>
            <DialogDescription>
              Компани, түүний захирлыг бүртгэнэ. Захирал харилцагчийн вэбийн
              "Бонд гаргагчаар нэвтрэх" хуудсаар өөрийн имэйл, анхны нууц үгээр
              нэвтэрнэ.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <p className="text-sm font-semibold">Компани</p>
            <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
              <FormField
                id="name"
                label="Компанийн нэр"
                error={errors.name?.message}
              >
                <Input
                  id="name"
                  className="h-10"
                  placeholder='"Монголын финтек групп" ХК'
                  aria-invalid={!!errors.name}
                  {...form.register('name')}
                />
              </FormField>
              <FormField
                id="register_number"
                label="Регистрийн дугаар"
                error={errors.register_number?.message}
              >
                <Input
                  id="register_number"
                  inputMode="numeric"
                  maxLength={7}
                  className="tabular h-10"
                  aria-invalid={!!errors.register_number}
                  {...form.register('register_number')}
                />
              </FormField>
            </div>
            <FormField
              id="state_register_number"
              label="Улсын бүртгэлийн дугаар"
              error={errors.state_register_number?.message}
            >
              <Input
                id="state_register_number"
                inputMode="numeric"
                maxLength={20}
                className="tabular h-10"
                aria-invalid={!!errors.state_register_number}
                {...form.register('state_register_number')}
              />
            </FormField>

            <Separator />
            <p className="text-sm font-semibold">Захирал</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="director_last_name"
                label="Овог"
                error={de?.last_name?.message}
              >
                <Input
                  id="director_last_name"
                  className="h-10"
                  aria-invalid={!!de?.last_name}
                  {...form.register('director.last_name')}
                />
              </FormField>
              <FormField
                id="director_first_name"
                label="Нэр"
                error={de?.first_name?.message}
              >
                <Input
                  id="director_first_name"
                  className="h-10"
                  aria-invalid={!!de?.first_name}
                  {...form.register('director.first_name')}
                />
              </FormField>
              <FormField
                id="director_email"
                label="Имэйл"
                error={de?.email?.message}
                hint="Нэвтрэх нэр болно"
              >
                <Input
                  id="director_email"
                  type="email"
                  autoComplete="off"
                  className="h-10"
                  aria-invalid={!!de?.email}
                  {...form.register('director.email')}
                />
              </FormField>
              <FormField
                id="director_phone"
                label="Утас"
                optional
                error={de?.phone?.message}
              >
                <Input
                  id="director_phone"
                  inputMode="numeric"
                  maxLength={8}
                  className="tabular h-10"
                  aria-invalid={!!de?.phone}
                  {...form.register('director.phone')}
                />
              </FormField>
              <FormField
                id="director_position"
                label="Албан тушаал"
                optional
                error={de?.position?.message}
              >
                <Input
                  id="director_position"
                  className="h-10"
                  {...form.register('director.position')}
                />
              </FormField>
              <FormField
                id="director_password"
                label="Анхны нууц үг"
                error={de?.password?.message}
                hint="Хуулж аваад аюулгүй сувгаар дамжуулна уу."
              >
                <Controller
                  control={form.control}
                  name="director.password"
                  render={({ field }) => (
                    <SharedPasswordInput
                      id="director_password"
                      aria-invalid={!!de?.password}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      onGenerate={(v) =>
                        form.setValue('director.password', v, {
                          shouldValidate: true,
                        })
                      }
                    />
                  )}
                />
              </FormField>
            </div>

            <Separator />
            <div className="flex items-center gap-2">
              <Controller
                control={form.control}
                name="with_bank"
                render={({ field }) => (
                  <Checkbox
                    id="with_bank"
                    checked={field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                )}
              />
              <Label htmlFor="with_bank" className="text-sm font-semibold">
                MNT данс одоо бүртгэх
              </Label>
            </div>
            {withBank && (
              <BankAccountFields
                register={(n) => form.register(`bank.${n}`)}
                bankName={form.watch('bank.bank_name')}
                onBankName={(v) =>
                  form.setValue('bank.bank_name', v, { shouldValidate: true })
                }
                errors={
                  errors.bank as Parameters<
                    typeof BankAccountFields
                  >[0]['errors']
                }
                prefix="bank_"
              />
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
              Бүртгэх
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Changes an issuer's name or register number. */
export function EditIssuerDialog({
  issuer,
  trigger,
  onSubmit,
}: {
  issuer: IssuerType;
  trigger: ReactNode;
  onSubmit: (v: EditValues) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const defaults = () => ({
    name: issuer.name,
    register_number: issuer.register_number,
    state_register_number: issuer.state_register_number,
  });
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: defaults(),
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(v: EditValues) {
    setError(null);
    try {
      await onSubmit({
        name: v.name.trim(),
        register_number: v.register_number.trim(),
        state_register_number: v.state_register_number.trim(),
      });
      setOpen(false);
    } catch (err) {
      const e = toApiError(err);
      if (e.code === 'issuer.register_taken') {
        form.setError('register_number', { message: e.message });
        return;
      }
      if (e.code === 'issuer.name_taken') {
        form.setError('name', { message: e.message });
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
            <DialogTitle>Компанийн мэдээлэл засах</DialogTitle>
            <DialogDescription>
              Нэр, регистрийн дугаар, улсын бүртгэлийн дугаар.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <FormField
              id="edit_name"
              label="Компанийн нэр"
              error={errors.name?.message}
            >
              <Input
                id="edit_name"
                className="h-10"
                aria-invalid={!!errors.name}
                {...form.register('name')}
              />
            </FormField>
            <FormField
              id="edit_register_number"
              label="Регистрийн дугаар"
              error={errors.register_number?.message}
            >
              <Input
                id="edit_register_number"
                inputMode="numeric"
                maxLength={7}
                className="tabular h-10"
                aria-invalid={!!errors.register_number}
                {...form.register('register_number')}
              />
            </FormField>
            <FormField
              id="edit_state_register_number"
              label="Улсын бүртгэлийн дугаар"
              error={errors.state_register_number?.message}
            >
              <Input
                id="edit_state_register_number"
                inputMode="numeric"
                maxLength={20}
                className="tabular h-10"
                aria-invalid={!!errors.state_register_number}
                {...form.register('state_register_number')}
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
              Хадгалах
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
