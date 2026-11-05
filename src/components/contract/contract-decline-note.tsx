import { MessageSquareQuoteIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  type AdminContractDetailType,
  partyTypeLabel,
} from '@/queries/contract/type';

/**
 * Who declined a cancelled contract, and the reason the bond issuer's director gave for it;
 * a client gives none.
 */
export function ContractDeclineNote({ c }: { c: AdminContractDetailType }) {
  if (c.status !== 'cancelled') {
    return null;
  }
  const decliner = c.parties.find((p) => p.declined_at);
  const person = decliner
    ? [decliner.last_name, decliner.first_name].filter(Boolean).join(' ')
    : '';
  const who = decliner
    ? [
        partyTypeLabel[decliner.type],
        decliner.type === 'issuer' ? decliner.organization_name : undefined,
        person,
      ]
        .filter(Boolean)
        .join(' · ')
    : 'Тодорхойгүй';

  return (
    <Alert>
      <MessageSquareQuoteIcon />
      <AlertTitle className="mb-1">Цуцалсан: {who}</AlertTitle>
      {c.decline_reason && (
        <AlertDescription className="whitespace-pre-line break-words text-foreground">
          {c.decline_reason}
        </AlertDescription>
      )}
    </Alert>
  );
}
