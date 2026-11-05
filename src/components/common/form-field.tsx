import type { ReactNode } from 'react';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';

/** A label, the control, a hint and the field's error, laid out the same everywhere. */
export function FormField({
  id,
  label,
  error,
  hint,
  action,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Shown at the label's right, such as a "forgot password" link. */
  action?: ReactNode;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <Field data-invalid={!!error || undefined} className="gap-2">
      <div className="flex items-center justify-between gap-2">
        {/* Optional: one run of text, so a long label wraps with its note. */}
        <FieldLabel htmlFor={id} className={optional ? 'block' : undefined}>
          {label}
          {optional && (
            <>
              {' '}
              <span className="ml-1 font-normal text-muted-foreground">
                (заавал биш)
              </span>
            </>
          )}
        </FieldLabel>
        {action}
      </div>
      {children}
      {hint && !error && <FieldDescription>{hint}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
