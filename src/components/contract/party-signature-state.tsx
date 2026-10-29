import { formatDateTime } from '@/lib/format';
import type { ContractPartyType } from '@/queries/contract/type';

/** Where a party stands on signing: signed, declined, not a signer, or still waited for. */
export function PartySignatureState({ p }: { p: ContractPartyType }) {
  if (p.signed_at) {
    return (
      <span className="text-success">Зурсан {formatDateTime(p.signed_at)}</span>
    );
  }
  if (p.declined_at) {
    return (
      <span className="text-destructive">
        Татгалзсан {formatDateTime(p.declined_at)}
      </span>
    );
  }
  if (!p.signs) {
    return <span className="text-muted-foreground">Зурахгүй</span>;
  }
  return (
    <span className="text-warning-foreground dark:text-warning">
      Хүлээж буй
    </span>
  );
}
