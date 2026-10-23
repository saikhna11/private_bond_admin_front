import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
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
} from '@/components/ui/dialog';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { generatePassword, passwordSchema } from '@/lib/password';
import { SharedPasswordInput } from './password-field';

/** Opened from a row menu, so it is controlled rather than triggered. */
export function ResetPasswordDialog({
  open,
  onOpenChange,
  name,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onReset: (password: string) => Promise<unknown>;
}) {
  const [password, setPassword] = useState(generatePassword);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const invalid = !passwordSchema.safeParse(password).success;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await onReset(password);
      onOpenChange(false);
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) {
          setPassword(generatePassword());
          setError(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Нууц үг шинэчлэх</DialogTitle>
          <DialogDescription>
            {name}-н бүх нэвтрэлт шууд дуусч, түгжээ нь гарна. Шинэ нууц үгийг
            аюулгүй сувгаар дамжуулна уу.
          </DialogDescription>
        </DialogHeader>
        <FormField
          id="reset_password"
          label="Шинэ нууц үг"
          error={
            password && invalid
              ? 'Нууц үг шаардлага хангахгүй байна'
              : undefined
          }
        >
          <SharedPasswordInput
            id="reset_password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onGenerate={setPassword}
          />
        </FormField>
        <ApiErrorAlert error={error} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Болих</Button>
          </DialogClose>
          <Button onClick={() => void submit()} disabled={busy || invalid}>
            {busy && <Loader2Icon className="animate-spin" />}
            Шинэчлэх
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
