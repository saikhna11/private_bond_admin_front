import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  type LucideIcon,
  UserXIcon,
} from 'lucide-react';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { meOptions } from '@/queries/auth/options';
import { brokersOptions } from '@/queries/broker/options';
import { clientsOptions } from '@/queries/client/options';
import type { ClientFilters } from '@/queries/client/type';
import { clientTypeLabel } from '@/queries/client/type';

export const Route = createFileRoute('/_dashboard/')({
  component: DashboardHome,
});

function DashboardHome() {
  const { data: me } = useSuspenseQuery(meOptions());

  return (
    <>
      <PageTitle
        title={`Сайн байна уу, ${me.first_name}`}
        description="Платформын өнөөдрийн байдал."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <Stat
          label="Шалгах хүлээгдэж буй"
          filters={{ status: 'pending' }}
          Icon={ClockIcon}
          tone="warning"
          highlight
        />
        <Stat
          label="Баталгаажсан"
          filters={{ status: 'approved' }}
          Icon={CircleCheckIcon}
          tone="success"
        />
        <Stat
          label="Цуцлагдсан"
          filters={{ status: 'rejected' }}
          Icon={CircleXIcon}
          tone="destructive"
        />
        <Stat
          label="Хаагдсан харилцагч"
          filters={{ active: 'inactive' }}
          Icon={UserXIcon}
          tone="muted"
        />
        <BrokerStat />
      </div>

      <PendingQueue />
    </>
  );
}

const tones = {
  warning: 'bg-warning/15 text-warning-foreground dark:text-warning',
  success: 'bg-success/12 text-success',
  destructive: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
};

function StatCard({
  label,
  value,
  Icon,
  tone,
  highlight,
  to,
  search,
}: {
  label: string;
  value: number | undefined;
  Icon: LucideIcon;
  tone: keyof typeof tones;
  highlight?: boolean;
  to: '/clients' | '/brokers';
  search?: ClientFilters;
}) {
  return (
    <Link
      to={to}
      search={search}
      className={cn(
        'group rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 sm:p-5',
        highlight && 'border-warning/50 bg-warning/5',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-lg',
            tones[tone],
          )}
        >
          <Icon className="size-4.5" />
        </span>
        <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      {value === undefined ? (
        <Skeleton className="mt-1 h-8 w-16" />
      ) : (
        <p className="tabular mt-0.5 text-3xl font-semibold tracking-tight">
          {value}
        </p>
      )}
    </Link>
  );
}

function Stat({
  filters,
  ...props
}: Omit<Parameters<typeof StatCard>[0], 'value' | 'to' | 'search'> & {
  filters: ClientFilters;
}) {
  const { data } = useQuery(clientsOptions(filters, 1));
  return (
    <StatCard {...props} value={data?.total} to="/clients" search={filters} />
  );
}

function BrokerStat() {
  const { data } = useQuery(brokersOptions({}));
  return (
    <StatCard
      label="Брокер"
      value={data?.total}
      Icon={BriefcaseIcon}
      tone="primary"
      to="/brokers"
    />
  );
}

function PendingQueue() {
  const { data, isPending } = useQuery(
    clientsOptions({ status: 'pending' }, 6),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>Шалгалтын дараалал</CardTitle>
          <CardDescription>
            Ажлын өдөр 24 цагийн дотор хариу өгөх ёстой. Хамгийн сүүлд
            бүртгүүлсэн нь эхэнд.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/clients" search={{ status: 'pending' }}>
            Бүгдийг харах
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        {isPending ? (
          <div className="space-y-3 px-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-success/12 text-success">
              <CircleCheckIcon className="size-5" />
            </span>
            <p className="font-medium">Шалгах хүсэлт алга</p>
            <p className="text-sm text-muted-foreground">
              Бүх хүсэлтийг шалгаж дууссан байна.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {data.items.map((c) => (
              <li key={c.id}>
                <Link
                  to="/clients/$clientId"
                  params={{ clientId: c.id }}
                  className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {c.display_name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {c.display_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {clientTypeLabel[c.type]} · {c.email ?? c.phone}
                    </p>
                  </div>
                  {!c.profile_complete && (
                    <span className="hidden rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground sm:inline">
                      Мэдээлэл дутуу
                    </span>
                  )}
                  <span className="tabular hidden text-xs text-muted-foreground md:inline">
                    {formatDateTime(c.created_at)}
                  </span>
                  <ArrowRightIcon className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
