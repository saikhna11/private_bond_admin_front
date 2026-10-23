import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { LaptopIcon, LogOutIcon } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toApiError } from '@/lib/fetcher';
import { formatDateTime } from '@/lib/format';
import { showToast } from '@/lib/utils';
import type { SessionType } from '@/queries/session/type';

function browserName(ua?: string) {
  if (!ua) return 'Тодорхойгүй хөтөч';
  const b = /Edg\//.test(ua)
    ? 'Edge'
    : /Firefox\//.test(ua)
      ? 'Firefox'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Safari\//.test(ua)
          ? 'Safari'
          : 'Хөтөч';
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad/.test(ua)
        ? 'iOS'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : '';
  return os ? `${b}, ${os}` : b;
}

/** The signed-in staff member's live sessions, on whichever panel's API. */
export function SessionsCard<K extends QueryKey>({
  options,
  invalidateKey,
  endSession,
  endOthers,
  onLogout,
}: {
  options: UseQueryOptions<SessionType[], Error, SessionType[], K>;
  invalidateKey: QueryKey;
  endSession: (id: string) => Promise<unknown>;
  endOthers: () => Promise<unknown>;
  onLogout: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { data: sessions, isPending } = useQuery(options);
  const others = sessions?.filter((s) => !s.current) ?? [];
  const ordered = [...(sessions?.filter((s) => s.current) ?? []), ...others];

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      await action();
      showToast('success', done);
    } catch (err) {
      showToast('error', toApiError(err).message);
      throw err;
    } finally {
      await queryClient.invalidateQueries({ queryKey: invalidateKey });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>Идэвхтэй нэвтрэлтүүд</CardTitle>
          <CardDescription>
            {sessions ? `${sessions.length} идэвхтэй нэвтрэлт` : 'Ачаалж байна'}
          </CardDescription>
        </div>
        {others.length > 0 && (
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm">
                <LogOutIcon />
                Бусдаас гарах
              </Button>
            }
            title="Бусад бүх нэвтрэлтийг дуусгах уу?"
            description="Энэ төхөөрөмжөөс бусад бүх нэвтрэлт шууд дуусна."
            confirmLabel="Дуусгах"
            onConfirm={() => run(endOthers, 'Бусад нэвтрэлтийг дуусгалаа')}
          />
        )}
      </CardHeader>
      <CardContent className="px-0">
        {isPending ? (
          <div className="px-6">
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <ul className="divide-y">
            {ordered.map((s: SessionType) => (
              <li key={s.id} className="flex items-center gap-4 px-6 py-3.5">
                <span
                  className={
                    s.current
                      ? 'flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'
                      : 'flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground'
                  }
                >
                  <LaptopIcon className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {browserName(s.user_agent)}
                    {s.current && (
                      <span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] text-success">
                        Энэ төхөөрөмж
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.ip && <span className="font-mono">{s.ip}</span>}
                    {s.ip && ' · '}
                    {formatDateTime(s.last_used_at ?? s.created_at)}
                  </p>
                </div>
                {s.current ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void onLogout()}
                  >
                    Гарах
                  </Button>
                ) : (
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="sm">
                        Дуусгах
                      </Button>
                    }
                    title="Энэ нэвтрэлтийг дуусгах уу?"
                    description="Тухайн төхөөрөмж шууд гарна."
                    confirmLabel="Дуусгах"
                    onConfirm={() =>
                      run(() => endSession(s.id), 'Нэвтрэлтийг дуусгалаа')
                    }
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
