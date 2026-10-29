import { DownloadIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toApiError } from '@/lib/fetcher';
import { saveBlob } from '@/lib/file';
import { showToast } from '@/lib/utils';
import { downloadContractDocument } from '@/queries/contract/query';
import type { AdminContractDetailType } from '@/queries/contract/type';

/** Downloads the signed PDF; disabled until the contract is signed and its PDF made. */
export function ContractDocumentButton({ c }: { c: AdminContractDetailType }) {
  const [busy, setBusy] = useState(false);
  const ready = c.status === 'signed';

  async function download() {
    setBusy(true);
    try {
      const blob = await downloadContractDocument(c.id);
      saveBlob(blob, `${(c.contract_no ?? c.id).replaceAll('/', '-')}.pdf`);
    } catch (err) {
      showToast('error', toApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span title={ready ? undefined : 'PDF бэлэн болоогүй'}>
      <Button onClick={() => void download()} disabled={!ready || busy}>
        {busy ? <Loader2Icon className="animate-spin" /> : <DownloadIcon />}
        PDF татах
      </Button>
    </span>
  );
}
