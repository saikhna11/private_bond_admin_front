import { zodResolver } from '@hookform/resolvers/zod';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PasswordInput } from '@/components/auth/password-input';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCountdown } from '@/hooks/use-countdown';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { formatSeconds } from '@/lib/format';
import { authKeys } from '@/queries/auth/options';
import { login } from '@/queries/auth/query';

const schema = z.object({
  email: z.email('Имэйл хаяг буруу байна'),
  password: z.string().min(1, 'Нууц үгээ оруулна уу'),
});

type Values = z.infer<typeof schema>;

export function LoginForm({
  signIn = login,
  meKey = authKeys.me(),
  home = '/',
  hint = 'Нууц үгээ мартсан бол супер админд хандана уу.',
}: {
  signIn?: (email: string, password: string) => Promise<unknown>;
  meKey?: QueryKey;
  home?: '/' | '/broker';
  hint?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<ApiError | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const lockedFor = useCountdown(lockedUntil);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: Values) {
    setError(null);
    try {
      const me = await signIn(values.email, values.password);
      queryClient.setQueryData(meKey, me);
      await navigate({ to: home });
    } catch (err) {
      const e = toApiError(err);
      if (e.retryAfter) setLockedUntil(Date.now() + e.retryAfter * 1000);
      form.resetField('password');
      setError(e);
    }
  }

  const locked = lockedFor > 0;
  const lockMessage =
    error && locked
      ? error.code === 'auth.account_locked'
        ? `Олон удаа буруу оролдсон тул бүртгэл түр түгжигдлээ. ${formatSeconds(lockedFor)} дараа дахин оролдоно уу.`
        : `Хэт олон оролдлого хийлээ. ${formatSeconds(lockedFor)} дараа дахин оролдоно уу.`
      : undefined;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-5">
        <FormField id="email" label="Имэйл" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="name@ulzii.mn"
            className="h-11"
            autoFocus
            aria-invalid={!!errors.email}
            {...form.register('email')}
          />
        </FormField>
        <FormField
          id="password"
          label="Нууц үг"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11"
            aria-invalid={!!errors.password}
            {...form.register('password')}
          />
        </FormField>
        <ApiErrorAlert error={error} message={lockMessage} />
        <Button
          type="submit"
          size="lg"
          className="h-11"
          disabled={isSubmitting || locked}
        >
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          {locked ? `Түр хүлээнэ үү (${formatSeconds(lockedFor)})` : 'Нэвтрэх'}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{hint}</p>
      </FieldGroup>
    </form>
  );
}
