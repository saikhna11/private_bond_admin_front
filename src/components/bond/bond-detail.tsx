import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import type { BondDetailType } from '@/queries/bond/type';
import { BondFilesCard } from './bond-files-card';
import { BondInfoCard } from './bond-info-card';
import { RateOptionTable } from './rate-option-table';

/** A bond as staff manage it: its terms and state, its rate matrix and its files. */
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
      <BondInfoCard b={b} />
      <RateOptionTable b={b} />
      <BondFilesCard b={b} />
    </div>
  );
}
