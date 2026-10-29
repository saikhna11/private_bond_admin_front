import { CircleCheckIcon, TriangleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { TemplateDetailType } from '@/queries/template/type';
import { ProblemPlaceholderChips } from './problem-placeholder-chips';
import type { FieldMapping } from './use-field-mapping';

const fieldsIncomplete = 'contract.template_fields_incomplete';

/**
 * What keeps a draft from being activated, as numbered steps, or that nothing does. The
 * unmapped placeholders count the unsaved changes, so the step shrinks as they are mapped.
 */
export function TemplateProblems({
  t,
  mapping,
  onFocusField,
}: {
  t: TemplateDetailType;
  mapping: FieldMapping;
  onFocusField: (placeholder: string) => void;
}) {
  if (t.status !== 'draft') return null;

  const steps: { key: string; body: ReactNode }[] = [];
  const { unmapped } = mapping;
  if (unmapped.length > 0) {
    steps.push({
      key: fieldsIncomplete,
      body: (
        <>
          <p className="font-medium text-foreground">
            {unmapped.length} хоосон зай холбоогүй байна
          </p>
          <p>
            Доорх хүснэгтэд шараар тэмдэглэсэн мөр бүрийн «Эх сурвалж»-аас
            Хувьсагч эсвэл Тогтмол текст сонгоод хадгална. Нэр дээр дарж тухайн
            мөр рүү очно.
          </p>
          <ProblemPlaceholderChips
            placeholders={unmapped}
            onFocus={onFocusField}
          />
        </>
      ),
    });
  } else if (t.problems.some((p) => p.code === fieldsIncomplete)) {
    steps.push({
      key: fieldsIncomplete,
      body: (
        <>
          <p className="font-medium text-foreground">
            Бүх хоосон зай холбогдсон
          </p>
          <p>Өөрчлөлтөө хадгалаад идэвхжүүлнэ үү.</p>
        </>
      ),
    });
  }
  for (const p of t.problems) {
    if (p.code !== fieldsIncomplete) {
      steps.push({
        key: p.code,
        body: <p className="break-words">{p.message}</p>,
      });
    }
  }

  if (steps.length === 0) {
    return (
      <Alert className="border-success/25 bg-success/5">
        <CircleCheckIcon className="text-success" />
        <AlertTitle>Идэвхжүүлэхэд бэлэн</AlertTitle>
        <AlertDescription>
          Идэвхжүүлсний дараа энэ бүтээгдэхүүний шинэ гэрээ энэ загвараар үүснэ.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert className="border-warning/50 bg-warning/8">
      <TriangleAlertIcon className="text-warning-foreground dark:text-warning" />
      <AlertTitle>Идэвхжүүлэхийн өмнө {steps.length} зүйл засна уу</AlertTitle>
      <AlertDescription>
        <ol className="mt-2 w-full space-y-3">
          {steps.map((s, i) => (
            <li key={s.key} className="flex gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-warning text-[11px] font-semibold text-warning-foreground tabular">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">{s.body}</div>
            </li>
          ))}
        </ol>
      </AlertDescription>
    </Alert>
  );
}
