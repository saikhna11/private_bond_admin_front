import { FileUpIcon, Loader2Icon } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fileToBase64, MAX_TEMPLATE_BYTES } from '@/lib/file';
import { showToast } from '@/lib/utils';
import { replaceTemplateFile } from '@/queries/template/query';
import { useTemplateAction } from './use-template-action';

/** Replaces a draft's .docx; the placeholders it still holds keep their mapping. */
export function ReplaceFileButton({ id }: { id: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const act = useTemplateAction();

  async function replace(file: File) {
    if (!file.name.toLowerCase().endsWith('.docx')) {
      showToast('error', 'Зөвхөн Word (.docx) файл оруулна');
      return;
    }
    if (file.size > MAX_TEMPLATE_BYTES) {
      showToast('error', 'Файл 5 MB-аас ихгүй байна');
      return;
    }
    setBusy(true);
    try {
      const b64 = await fileToBase64(file);
      await act(() => replaceTemplateFile(id, b64), 'Файл солигдлоо');
    } catch {
      // act reported it.
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void replace(file);
        }}
      />
      <Button
        variant="outline"
        onClick={() => input.current?.click()}
        disabled={busy}
      >
        {busy ? <Loader2Icon className="animate-spin" /> : <FileUpIcon />}
        Файл солих
      </Button>
    </>
  );
}
