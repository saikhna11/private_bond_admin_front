import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import type { AdminContractDetailType } from '@/queries/contract/type';
import { ContractInfoCard } from './contract-info-card';
import { ContractPartiesCard } from './contract-parties-card';
import { ContractTermsCard } from './contract-terms-card';

/** A contract as an admin reads it: its state, parties and terms. */
export function ContractDetail({ c }: { c: AdminContractDetailType }) {
  return (
    <>
      <Link
        to="/contracts"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Гэрээ
      </Link>
      <ContractInfoCard c={c} />
      <ContractPartiesCard parties={c.parties} />
      <ContractTermsCard c={c} />
    </>
  );
}
