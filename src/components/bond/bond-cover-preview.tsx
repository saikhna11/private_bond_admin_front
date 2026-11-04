import { useQuery } from '@tanstack/react-query';
import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { bondFileOptions } from '@/queries/bond/options';
import type { BondFileType } from '@/queries/bond/type';

/** The bond's cover as customers will see it, or a placeholder while it has none. */
export function BondCoverPreview({
  bondId,
  cover,
}: {
  bondId: string;
  cover?: BondFileType;
}) {
  const { data, isPending } = useQuery({
    ...bondFileOptions(bondId, cover?.id ?? ''),
    enabled: !!cover,
  });
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!data) return;
    const u = URL.createObjectURL(data);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [data]);

  if (!cover) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        <ImageIcon className="size-8" />
      </div>
    );
  }
  if (isPending || !url) {
    return <Skeleton className="aspect-video w-full rounded-lg" />;
  }
  return (
    <img
      src={url}
      alt={cover.file_name}
      className="aspect-video w-full rounded-lg border object-cover"
    />
  );
}
