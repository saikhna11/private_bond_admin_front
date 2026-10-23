import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ChangePasswordForm } from '@/components/account/change-password-form';
import { SessionsCard } from '@/components/account/sessions-card';
import { PageTitle } from '@/components/common/page-title';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLogout } from '@/hooks/use-logout';
import { meOptions } from '@/queries/auth/options';
import { personInitials, personName } from '@/queries/auth/type';
import { sessionKeys, sessionsOptions } from '@/queries/session/options';
import { endOtherSessions, endSession } from '@/queries/session/query';

export const Route = createFileRoute('/_dashboard/account/')({
  component: AccountPage,
  staticData: { crumb: 'Миний бүртгэл' },
});

function AccountPage() {
  const { data: me } = useSuspenseQuery(meOptions());
  const logout = useLogout();

  return (
    <>
      <PageTitle
        title="Миний бүртгэл"
        description="Хувийн мэдээлэл, нууц үг, нэвтрэлтүүд."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex-row items-center gap-4">
              <Avatar className="size-14 rounded-2xl">
                <AvatarFallback className="rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
                  {personInitials(me)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold">
                  {personName(me)}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {me.email}
                </p>
                <p className="tabular text-sm text-muted-foreground">
                  {me.phone}
                </p>
              </div>
              <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-medium text-warning-foreground dark:text-gold">
                {me.is_super ? 'Супер админ' : 'Админ'}
              </span>
            </CardContent>
          </Card>
          <SessionsCard
            options={sessionsOptions()}
            invalidateKey={sessionKeys.all}
            endSession={endSession}
            endOthers={endOtherSessions}
            onLogout={logout}
          />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Нууц үг солих</CardTitle>
            <CardDescription>
              Солисны дараа бусад бүх төхөөрөмжөөс автоматаар гарна.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
