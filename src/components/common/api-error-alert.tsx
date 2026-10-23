import { CircleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ApiError } from '@/lib/fetcher';

/** A form's general error: the API's Mongolian detail and the request id for support. */
export function ApiErrorAlert({
  error,
  message,
}: {
  error?: ApiError | null;
  /** Overrides the detail, such as a countdown. */
  message?: string;
}) {
  if (!error) return null;
  return (
    <Alert
      variant="destructive"
      className="border-destructive/25 bg-destructive/5"
    >
      <CircleAlertIcon />
      <AlertDescription>
        <p>{message ?? error.message}</p>
        {error.requestId && (
          <p className="mt-1 font-mono text-[11px] opacity-70">
            Лавлах дугаар: {error.requestId}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
