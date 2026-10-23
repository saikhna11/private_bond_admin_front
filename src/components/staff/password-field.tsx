import { CopyIcon, WandSparklesIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generatePassword } from '@/lib/password';
import { showToast } from '@/lib/utils';

/**
 * An initial or reset password the admin shares out of band: shown in clear, with
 * generate and copy.
 */
export function SharedPasswordInput({
  value,
  onGenerate,
  ...props
}: ComponentProps<typeof Input> & {
  value: string;
  onGenerate: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        autoComplete="off"
        spellCheck={false}
        className="tabular h-10 font-mono"
        value={value}
        {...props}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 shrink-0"
        onClick={() => onGenerate(generatePassword())}
        aria-label="Нууц үг үүсгэх"
        title="Нууц үг үүсгэх"
      >
        <WandSparklesIcon />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 shrink-0"
        disabled={!value}
        onClick={() =>
          void navigator.clipboard
            .writeText(value)
            .then(() => showToast('success', 'Хуулагдлаа'))
            .catch(() => showToast('error', 'Хуулж чадсангүй'))
        }
        aria-label="Хуулах"
        title="Хуулах"
      >
        <CopyIcon />
      </Button>
    </div>
  );
}
