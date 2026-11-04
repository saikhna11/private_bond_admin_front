import { CircleAlertIcon, CircleCheckIcon, SendIcon } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { setBondState } from '@/queries/bond/query';
import type { BondDetailType } from '@/queries/bond/type';
import { useBondAction } from './use-bond-action';

/**
 * Publishes a draft bond, after showing what it has: a missing cover, prospectus file or text
 * is a warning, never a bar, since bond.md 3.2 makes none of them required.
 */
export function BondPublishDialog({ b }: { b: BondDetailType }) {
  const run = useBondAction();
  const checks = [
    { ok: b.files.some((f) => f.kind === 'cover'), label: 'Нүүр зураг' },
    {
      ok: b.files.some((f) => f.kind === 'prospectus'),
      label: 'Танилцуулгын файл',
    },
    { ok: b.prospectus !== '', label: 'Танилцуулгын текст' },
    {
      ok: b.rate_options.length > 0,
      label: `Хүүгийн нөхцөл (${b.rate_options.length})`,
    },
  ];
  return (
    <ConfirmDialog
      trigger={
        <Button>
          <SendIcon />
          Нийтлэх
        </Button>
      }
      title="Бондыг нийтлэх үү?"
      description={
        <span className="flex flex-col gap-3">
          <span>
            Нийтэлсний дараа харилцагчид огноогоор нь харагдана. Гэрээгүй бол
            буцааж ноорог болгож болно.
          </span>
          <span className="flex flex-col gap-1.5">
            {checks.map((c) => (
              <span
                key={c.label}
                className={
                  c.ok
                    ? 'flex items-center gap-2 text-foreground'
                    : 'flex items-center gap-2 text-warning-foreground dark:text-warning'
                }
              >
                {c.ok ? (
                  <CircleCheckIcon className="size-4 text-success" />
                ) : (
                  <CircleAlertIcon className="size-4" />
                )}
                {c.label}
                {!c.ok && ' алга'}
              </span>
            ))}
          </span>
        </span>
      }
      confirmLabel="Нийтлэх"
      tone="success"
      onConfirm={() =>
        run(() => setBondState(b.id, 'active'), 'Бонд нийтлэгдлээ')
      }
    />
  );
}
