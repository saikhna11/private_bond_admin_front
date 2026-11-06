import { useQuery } from '@tanstack/react-query';
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  SendIcon,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { setBondState } from '@/queries/bond/query';
import type { BondDetailType } from '@/queries/bond/type';
import { templatesOptions } from '@/queries/template/options';
import { useBondAction } from './use-bond-action';

/**
 * Publishes a draft bond, after showing what it has: a missing cover, prospectus file or text
 * is a warning, never a bar, since bond.md 3.2 makes none of them required. An active
 * contract template is required (bond.template_missing): without one no client could buy it.
 */
export function BondPublishDialog({ b }: { b: BondDetailType }) {
  const run = useBondAction();
  const templates = useQuery(
    templatesOptions({ status: 'active', bond_id: b.id }),
  );
  const templateCount = templates.data?.total ?? 0;
  const templateMissing = !templates.isPending && templateCount === 0;
  const checks: { ok: boolean; label: string; required?: boolean }[] = [
    {
      ok: templateCount > 0,
      label: `Идэвхтэй гэрээний загвар (${templateCount})`,
      required: true,
    },
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
                    : c.required
                      ? 'flex items-center gap-2 text-destructive'
                      : 'flex items-center gap-2 text-warning-foreground dark:text-warning'
                }
              >
                {c.ok ? (
                  <CircleCheckIcon className="size-4 text-success" />
                ) : c.required ? (
                  <CircleXIcon className="size-4" />
                ) : (
                  <CircleAlertIcon className="size-4" />
                )}
                {c.label}
                {!c.ok && ' алга'}
              </span>
            ))}
          </span>
          {templateMissing && (
            <span className="text-destructive">
              Гэрээний загвар хуудаснаас энэ бондод загвар холбож идэвхжүүлсний
              дараа нийтэлнэ.
            </span>
          )}
        </span>
      }
      confirmDisabled={templates.isPending || templateMissing}
      confirmLabel="Нийтлэх"
      tone="success"
      onConfirm={() =>
        run(() => setBondState(b.id, 'active'), 'Бонд нийтлэгдлээ')
      }
    />
  );
}
