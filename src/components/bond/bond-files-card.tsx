import { DownloadIcon, FileIcon, Trash2Icon } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toApiError } from '@/lib/fetcher';
import { saveBlob } from '@/lib/file';
import { formatDate } from '@/lib/format';
import { showToast } from '@/lib/utils';
import { deleteBondFile, downloadBondFile } from '@/queries/bond/query';
import {
  type BondDetailType,
  type BondFileType,
  MAX_PROSPECTUS_FILES,
} from '@/queries/bond/type';
import { BondCoverPreview } from './bond-cover-preview';
import { BondFileUploadButton } from './bond-file-upload-button';
import { useBondAction } from './use-bond-action';

function sizeLabel(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** A bond's cover image and its up to five prospectus files (bond.md 3.2). */
export function BondFilesCard({ b }: { b: BondDetailType }) {
  const run = useBondAction();
  const cover = b.files.find((f) => f.kind === 'cover');
  const prospectus = b.files.filter((f) => f.kind === 'prospectus');

  async function download(f: BondFileType) {
    try {
      saveBlob(await downloadBondFile(b.id, f.id), f.file_name);
    } catch (err) {
      showToast('error', toApiError(err).message);
    }
  }

  const remove = (f: BondFileType, what: string) => (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" aria-label="Устгах">
          <Trash2Icon />
        </Button>
      }
      title={`${what} устгах уу?`}
      description={f.file_name}
      confirmLabel="Устгах"
      onConfirm={() => run(() => deleteBondFile(b.id, f.id), 'Файл устлаа')}
    />
  );

  return (
    <div className="@container">
      <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Нүүр зураг</CardTitle>
            <CardDescription>
              PNG эсвэл JPEG, шинэ нь хуучныг солино
            </CardDescription>
            <CardAction className="flex gap-1">
              {cover && remove(cover, 'Нүүр зургийг')}
              <BondFileUploadButton
                bondId={b.id}
                kind="cover"
                label={cover ? 'Солих' : 'Оруулах'}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <BondCoverPreview bondId={b.id} cover={cover} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Танилцуулгын файл</CardTitle>
            <CardDescription>
              PDF, PNG, JPEG; {prospectus.length}/{MAX_PROSPECTUS_FILES}
            </CardDescription>
            <CardAction>
              <BondFileUploadButton
                bondId={b.id}
                kind="prospectus"
                label="Файл нэмэх"
                disabled={prospectus.length >= MAX_PROSPECTUS_FILES}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            {prospectus.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Танилцуулгын файл алга.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {prospectus.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 px-3 py-2">
                    <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {f.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sizeLabel(f.size_bytes)} · {formatDate(f.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Татах"
                      onClick={() => void download(f)}
                    >
                      <DownloadIcon />
                    </Button>
                    {remove(f, 'Файлыг')}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
