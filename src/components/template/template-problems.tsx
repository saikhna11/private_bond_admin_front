import { CircleCheckIcon, TriangleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { TemplateDetailType } from '@/queries/template/type';

/** What keeps a draft from being activated, or that nothing does. */
export function TemplateProblems({ t }: { t: TemplateDetailType }) {
  if (t.status !== 'draft') return null;
  if (t.problems.length === 0) {
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
    <Alert className="border-warning/30 bg-warning/5">
      <TriangleAlertIcon className="text-warning-foreground dark:text-warning" />
      <AlertTitle>Идэвхжүүлэхээс өмнө засна уу</AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-1 pl-4">
          {t.problems.map((p) => (
            <li key={p.code} className="break-words">
              {p.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
