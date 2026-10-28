import { CircleCheckIcon, CircleXIcon, DownloadIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toApiError } from '@/lib/fetcher';
import { saveBlob } from '@/lib/file';
import { formatDateTime } from '@/lib/format';
import { showToast } from '@/lib/utils';
import { downloadTemplate } from '@/queries/template/query';
import {
  languageLabel,
  ownershipLabel,
  type TemplateDetailType,
} from '@/queries/template/type';
import { TemplateStatusBadge } from './template-status-badge';

const partyLabel: Record<string, string> = {
  holder: 'Эзэмшигч',
  co_holder: 'Хамтран эзэмшигч',
};

/** The template's name, product, status and signature pictures, with its actions. */
export function TemplateInfoCard({
  t,
  actions,
}: {
  t: TemplateDetailType;
  actions: ReactNode;
}) {
  async function download() {
    try {
      const blob = await downloadTemplate(t.id);
      saveBlob(
        blob,
        t.name.toLowerCase().endsWith('.docx') ? t.name : `${t.name}.docx`,
      );
    } catch (err) {
      showToast('error', toApiError(err).message);
    }
  }

  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {t.name}
              </h1>
              <TemplateStatusBadge status={t.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono">{t.product}</span> ·{' '}
              {ownershipLabel[t.ownership_type]} · {languageLabel[t.language]} ·
              оруулсан {formatDateTime(t.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void download()}>
              <DownloadIcon />
              Татах
            </Button>
            {actions}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {t.pictures.map((p) => (
            <span
              key={p.alt_text}
              className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs"
            >
              {p.found ? (
                <CircleCheckIcon className="size-3.5 text-success" />
              ) : (
                <CircleXIcon className="size-3.5 text-destructive" />
              )}
              {partyLabel[p.party_type] ?? p.party_type}-ийн гарын үсгийн зураг
              <code className="font-mono text-muted-foreground">
                {p.alt_text}
              </code>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
