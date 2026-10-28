import { useNavigate } from '@tanstack/react-router';
import { CircleCheckIcon, CircleOffIcon, Trash2Icon } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  activateTemplate,
  deactivateTemplate,
  deleteTemplate,
} from '@/queries/template/query';
import type { TemplateDetailType } from '@/queries/template/type';
import { ReplaceFileButton } from './replace-file-button';
import { useTemplateAction } from './use-template-action';

/** What a template's status allows: a draft is changed, then activated or deleted. */
export function TemplateActions({
  t,
  dirty,
}: {
  t: TemplateDetailType;
  /** Unsaved mapping changes, which an activation would leave out. */
  dirty: boolean;
}) {
  const act = useTemplateAction();
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-2">
      {t.status === 'draft' && <ReplaceFileButton id={t.id} />}
      {t.status !== 'active' && (
        <ConfirmDialog
          trigger={
            <Button disabled={dirty || t.problems.length > 0}>
              <CircleCheckIcon />
              Идэвхжүүлэх
            </Button>
          }
          title="Загварыг идэвхжүүлэх үү?"
          description={`${t.product} бүтээгдэхүүний шинэ гэрээ энэ загвараар үүснэ. Өмнөх идэвхтэй загвар идэвхгүй болно. Идэвхжүүлсэн загварыг өөрчлөх боломжгүй.`}
          confirmLabel="Идэвхжүүлэх"
          tone="success"
          onConfirm={() =>
            act(() => activateTemplate(t.id), 'Загвар идэвхжлээ')
          }
        />
      )}
      {t.status === 'active' && (
        <ConfirmDialog
          trigger={
            <Button variant="outline">
              <CircleOffIcon />
              Идэвхгүй болгох
            </Button>
          }
          title="Загварыг идэвхгүй болгох уу?"
          description={`Өөр загвар идэвхжүүлэх хүртэл ${t.product} бүтээгдэхүүнийг энэ хэлээр худалдан авах боломжгүй болно.`}
          confirmLabel="Идэвхгүй болгох"
          onConfirm={() =>
            act(() => deactivateTemplate(t.id), 'Загвар идэвхгүй боллоо')
          }
        />
      )}
      {t.status === 'draft' && (
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="text-destructive">
              <Trash2Icon />
              Устгах
            </Button>
          }
          title="Ноорог загварыг устгах уу?"
          description="Загвар болон түүний холболтууд бүрмөсөн устана."
          confirmLabel="Устгах"
          onConfirm={async () => {
            await act(() => deleteTemplate(t.id), 'Загвар устлаа');
            await navigate({ to: '/templates' });
          }}
        />
      )}
    </div>
  );
}
