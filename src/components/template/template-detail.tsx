import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import type { TemplateDetailType } from '@/queries/template/type';
import { FieldMappingTable } from './field-mapping-table';
import { TemplateActions } from './template-actions';
import { TemplateInfoCard } from './template-info-card';
import { TemplateProblems } from './template-problems';
import { useFieldMapping } from './use-field-mapping';

/** A template as an admin maps and activates it. */
export function TemplateDetail({ t }: { t: TemplateDetailType }) {
  const mapping = useFieldMapping(t);
  return (
    <>
      <Link
        to="/templates"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Гэрээний загвар
      </Link>
      <TemplateInfoCard
        t={t}
        actions={<TemplateActions t={t} dirty={mapping.dirty} />}
      />
      <TemplateProblems t={t} />
      <FieldMappingTable t={t} mapping={mapping} />
    </>
  );
}
