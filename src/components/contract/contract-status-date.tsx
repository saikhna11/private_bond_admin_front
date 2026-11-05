import { formatDateTime } from '@/lib/format';
import type { AdminContractDetailType } from '@/queries/contract/type';
import { InfoItem } from './info-item';

/**
 * The date the contract's status turns on: its signing deadline, which a paid contract
 * outlives only while its clients sign, or when it ended.
 */
export function ContractStatusDate({ c }: { c: AdminContractDetailType }) {
  switch (c.status) {
    case 'pending_customer_signature':
    case 'pending_issuer_signature':
      if (c.paid_on && c.status === 'pending_customer_signature') return null;
      return (
        <InfoItem
          label="Гарын үсэг зурах хугацаа"
          value={formatDateTime(c.signature_deadline)}
        />
      );
    case 'signed':
      return (
        <InfoItem
          label="Гэрээ байгуулсан огноо"
          value={formatDateTime(c.signed_at)}
        />
      );
    case 'cancelled':
      return (
        <InfoItem
          label="Татгалзсан огноо"
          value={formatDateTime(c.cancelled_at)}
        />
      );
    case 'expired':
      return (
        <InfoItem
          label="Хугацаа хэтэрсэн огноо"
          value={formatDateTime(c.cancelled_at)}
        />
      );
    default:
      return null;
  }
}
