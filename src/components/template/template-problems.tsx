import { CircleCheckIcon, TriangleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { TemplateDetailType } from '@/queries/template/type';
import type { FieldMapping } from './use-field-mapping';

const fieldsIncomplete = 'contract.template_fields_incomplete';
const signatureMissing = 'contract.template_signature_missing';

const partyLabel: Record<string, string> = {
  holder: 'Эзэмшигчийн',
  co_holder: 'Хамтран эзэмшигчийн',
};

/**
 * What keeps a draft from being activated, one line each, or that nothing does. The unmapped
 * placeholders count the unsaved changes.
 */
export function TemplateProblems({
  t,
  mapping,
}: {
  t: TemplateDetailType;
  mapping: FieldMapping;
}) {
  if (t.status !== 'draft') return null;

  const items: { key: string; body: ReactNode }[] = [];
  const left = mapping.unmapped.length;
  if (left > 0) {
    items.push({
      key: fieldsIncomplete,
      body: (
        <>
          <span className="font-medium text-foreground">
            {left} хоосон зай холбоогүй.
          </span>{' '}
          Мөр бүрийн эх сурвалжийг сонгоод хадгална уу.
        </>
      ),
    });
  } else if (t.problems.some((p) => p.code === fieldsIncomplete)) {
    items.push({
      key: fieldsIncomplete,
      body: 'Бүх хоосон зай холбогдсон. Өөрчлөлтөө хадгална уу.',
    });
  }
  for (const p of t.problems) {
    if (p.code === fieldsIncomplete) continue;
    if (p.code === signatureMissing) {
      for (const pic of t.pictures.filter((x) => !x.found)) {
        items.push({
          key: pic.alt_text,
          body: (
            <>
              <span className="font-medium text-foreground">
                {partyLabel[pic.party_type] ?? pic.party_type} гарын үсгийн
                зураг алга.
              </span>{' '}
              Word файлд зураг оруулж, Alt Text-д{' '}
              <code className="rounded bg-muted px-1 font-mono text-xs">
                {pic.alt_text}
              </code>{' '}
              гэж бичээд файлаа солино уу.
            </>
          ),
        });
      }
      continue;
    }
    items.push({ key: p.code, body: p.message });
  }

  if (items.length === 0) {
    return (
      <Alert className="shrink-0 border-success/25 bg-success/5">
        <CircleCheckIcon className="text-success" />
        <AlertTitle>Идэвхжүүлэхэд бэлэн</AlertTitle>
        <AlertDescription>
          Идэвхжүүлсний дараа энэ бүтээгдэхүүний шинэ гэрээ энэ загвараар үүснэ.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert className="shrink-0 border-warning/40 bg-warning/5">
      <TriangleAlertIcon className="text-warning-foreground dark:text-warning" />
      <AlertTitle>Идэвхжүүлэхийн өмнө</AlertTitle>
      <AlertDescription>
        <ul className="w-full space-y-1.5">
          {items.map((i) => (
            <li key={i.key} className="break-words">
              {i.body}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
