import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import type { TemplateDetailType } from '@/queries/template/type';
import { FieldMappingTable } from './field-mapping-table';
import { TemplateActions } from './template-actions';
import { TemplateInfoCard } from './template-info-card';
import { TemplateProblems } from './template-problems';
import { useFieldMapping } from './use-field-mapping';

/**
 * A template as an admin maps and activates it. From md up the page fits the screen below
 * the app header (the inset's margin and the layout's padding taken off), and only the
 * placeholder table scrolls.
 */
export function TemplateDetail({ t }: { t: TemplateDetailType }) {
  const mapping = useFieldMapping(t);
  return (
    <div className="flex flex-col gap-6 md:h-[calc(100svh-var(--header-height)-4rem)] lg:h-[calc(100svh-var(--header-height)-5rem)]">
      <Link
        to="/templates"
        className="inline-flex w-fit shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Гэрээний загвар
      </Link>
      <TemplateInfoCard
        t={t}
        actions={<TemplateActions t={t} dirty={mapping.dirty} />}
      />
      <TemplateProblems t={t} mapping={mapping} />
      <FieldMappingTable t={t} mapping={mapping} />
    </div>
  );
}
