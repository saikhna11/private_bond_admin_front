import { Loader2Icon, UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fileToBase64, MAX_BOND_FILE_BYTES } from '@/lib/file';
import { showToast } from '@/lib/utils';
import { uploadBondFile } from '@/queries/bond/query';
import type { BondFileKind } from '@/queries/bond/type';
import { useBondAction } from './use-bond-action';

const accept: Record<BondFileKind, string> = {
  prospectus: 'application/pdf,image/png,image/jpeg',
  cover: 'image/png,image/jpeg',
};

/** Picks a file and uploads it to bond bondId as kind. */
export function BondFileUploadButton({
  bondId,
  kind,
  label,
  disabled,
}: {
  bondId: string;
  kind: BondFileKind;
  label: string;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const run = useBondAction();

  async function upload(file: File) {
    if (file.size > MAX_BOND_FILE_BYTES) {
      showToast('error', 'Файл 20 MB-аас ихгүй байна.');
      return;
    }
    setBusy(true);
    try {
      const content = await fileToBase64(file);
      await run(
        () => uploadBondFile(bondId, { kind, file_name: file.name, content }),
        'Файл орлоо',
      );
    } catch {
      // useBondAction reported it.
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={accept[kind]}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void upload(file);
        }}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || busy}
        onClick={() => input.current?.click()}
      >
        {busy ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
        {label}
      </Button>
    </>
  );
}
