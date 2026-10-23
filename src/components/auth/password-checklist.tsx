import { CheckIcon, XIcon } from 'lucide-react';
import { passwordRules } from '@/lib/password';
import { cn } from '@/lib/utils';

/** Live checks of the password rule and, once typed, whether the two match. */
export function PasswordChecklist({
  password,
  confirm,
}: {
  password: string;
  confirm?: string;
}) {
  const passed = passwordRules.filter((r) => r.test(password)).length;
  const strength = passed / passwordRules.length;

  return (
    <div className="@container space-y-2.5 rounded-lg border bg-muted/40 p-3">
      <div className="flex gap-1" aria-hidden="true">
        {passwordRules.map((r, i) => (
          <span
            key={r.key}
            className={cn(
              'h-1 flex-1 rounded-full bg-border transition-colors',
              i < passed &&
                (strength < 0.6
                  ? 'bg-destructive'
                  : strength < 1
                    ? 'bg-warning'
                    : 'bg-success'),
            )}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs @xs:grid-cols-2">
        {passwordRules.map((r) => (
          <Rule key={r.key} ok={r.test(password)} label={r.label} />
        ))}
        {confirm !== undefined && confirm.length > 0 && (
          <Rule
            ok={confirm === password}
            label={
              confirm === password
                ? 'Нууц үг таарч байна'
                : 'Нууц үг таарахгүй байна'
            }
            showFail
          />
        )}
      </ul>
    </div>
  );
}

function Rule({
  ok,
  label,
  showFail,
}: {
  ok: boolean;
  label: string;
  showFail?: boolean;
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-1.5 transition-colors',
        ok
          ? 'text-success'
          : showFail
            ? 'text-destructive'
            : 'text-muted-foreground',
      )}
    >
      {ok || !showFail ? (
        <CheckIcon className={cn('size-3.5', !ok && 'opacity-40')} />
      ) : (
        <XIcon className="size-3.5" />
      )}
      {label}
    </li>
  );
}
