import type { ContractPartyType } from '@/queries/contract/type';

/** Where a party stands on signing: signed, declined, not a signer, or still waited for. */
export function PartySignatureState({ p }: { p: ContractPartyType }) {
  if (p.signed_at) {
    return <span className="font-medium text-success">Зурсан</span>;
  }
  if (p.declined_at) {
    return <span className="font-medium text-destructive">Татгалзсан</span>;
  }
  if (!p.signs) {
    return <span className="text-muted-foreground">Зурахгүй</span>;
  }
  return (
    <span className="font-medium text-warning-foreground dark:text-warning">
      Хүлээж буй
    </span>
  );
}
