import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ApiError } from './fetcher';

/**
 * Puts the API's field errors (`body.<field>`) on the form. Answers whether any landed,
 * so the caller shows the rest as a general error.
 */
export function applyFieldErrors<T extends FieldValues>(
  err: ApiError,
  setError: UseFormSetError<T>,
  fields: Partial<Record<string, Path<T>>>,
): boolean {
  let applied = false;
  for (const e of err.errors) {
    const name = fields[e.location.replace(/^body\./, '')];
    if (name) {
      setError(name, { type: 'server', message: e.message });
      applied = true;
    }
  }
  return applied;
}
