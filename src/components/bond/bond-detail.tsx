import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import type { BondDetailType } from '@/queries/bond/type';
import { BondFilesCard } from './bond-files-card';
import { BondInfoCard } from './bond-info-card';
import { BondTemplateWarning } from './bond-template-warning';
import { BondTemplatesCard } from './bond-templates-card';
import { RateOptionTable } from './rate-option-table';

/**
 * A bond as staff manage it: a warning while no active contract template names it, its terms
 * and state, its rate matrix, its templates and its files.
 */
export function BondDetail({ b }: { b: BondDetailType }) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/bonds"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Бонд
      </Link>
      <BondTemplateWarning b={b} />
      <BondInfoCard b={b} />
      <RateOptionTable b={b} />
      <BondTemplatesCard b={b} />
      <BondFilesCard b={b} />
    </div>
  );
}
