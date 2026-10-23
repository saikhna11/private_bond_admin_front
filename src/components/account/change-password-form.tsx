import { zodResolver } from '@hookform/resolvers/zod';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { PasswordChecklist } from '@/components/auth/password-checklist';
import { PasswordInput } from '@/components/auth/password-input';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/hooks/use-countdown';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { formatSeconds } from '@/lib/format';
import { passwordSchema } from '@/lib/password';
import { showToast } from '@/lib/utils';
import { authKeys } from '@/queries/auth/options';
import { changePassword } from '@/queries/auth/query';

const schema = z
  .object({
    current: z.string().min(1, 'Одоогийн нууц үгээ оруулна уу'),
    password: passwordSchema,
    confirm: z.string().min(1, 'Нууц үгээ давтан оруулна уу'),
  })
  .refine((v) => v.password === v.confirm, {
    path: ['confirm'],
    message: 'Нууц үг таарахгүй байна',
  })
  .refine((v) => v.password !== v.current, {
    path: ['password'],
    message: 'Шинэ нууц үг одоогийнхоос өөр байх ёстой',
  });

type Values = z.infer<typeof schema>;

/** The admin's own password unless props name another panel's (the broker panel's). */
export function ChangePasswordForm({
  change = changePassword,
  meKey = authKeys.me(),
}: {
  change?: (current: string, next: string) => Promise<unknown>;
  meKey?: QueryKey;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<ApiError | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const lockedFor = useCountdown(lockedUntil);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { current: '', password: '', confirm: '' },
  });
  const { errors, isSubmitting } = form.formState;
  const [password, confirm] = useWatch({
    control: form.control,
    name: ['password', 'confirm'],
  });

  async function onSubmit(values: Values) {
    setError(null);
    try {
      const me = await change(values.current, values.password);
      queryClient.setQueryData(meKey, me);
      form.reset();
      showToast('success', 'Нууц үг солигдлоо. Бусад төхөөрөмжөөс гаргалаа.');
    } catch (err) {
      const e = toApiError(err);
      if (e.code === 'user.wrong_password') {
        // resetField clears errors too: reset first, then mark the field.
        form.resetField('current');
        form.setError('current', { message: e.message }, { shouldFocus: true });
        return;
      }
      if (e.retryAfter) setLockedUntil(Date.now() + e.retryAfter * 1000);
      setError(e);
    }
  }

  const locked = lockedFor > 0;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormField
        id="current_password"
        label="Одоогийн нууц үг"
        error={errors.current?.message}
      >
        <PasswordInput
          id="current_password"
          autoComplete="current-password"
          className="h-10"
          aria-invalid={!!errors.current}
          {...form.register('current')}
        />
      </FormField>
      <FormField
        id="new_password"
        label="Шинэ нууц үг"
        error={errors.password?.message}
      >
        <PasswordInput
          id="new_password"
          autoComplete="new-password"
          className="h-10"
          aria-invalid={!!errors.password}
          {...form.register('password')}
        />
      </FormField>
      <FormField
        id="confirm_password"
        label="Шинэ нууц үг давтах"
        error={errors.confirm?.message}
      >
        <PasswordInput
          id="confirm_password"
          autoComplete="new-password"
          className="h-10"
          aria-invalid={!!errors.confirm}
          {...form.register('confirm')}
        />
      </FormField>
      {password && <PasswordChecklist password={password} confirm={confirm} />}
      <ApiErrorAlert
        error={error}
        message={
          locked
            ? `Түр түгжигдлээ. ${formatSeconds(lockedFor)} дараа дахин оролдоно уу.`
            : undefined
        }
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          className="h-10 px-5"
          disabled={isSubmitting || locked}
        >
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Нууц үг солих
        </Button>
      </div>
    </form>
  );
}
