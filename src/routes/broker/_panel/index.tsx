import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { UserRoundCogIcon, UsersIcon } from 'lucide-react';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { brokerMeOptions } from '@/queries/broker-panel/options';

export const Route = createFileRoute('/broker/_panel/')({
  component: BrokerHome,
});

function BrokerHome() {
  const { data: me } = useSuspenseQuery(brokerMeOptions());

  return (
    <>
      <PageTitle
        title={`Сайн байна уу, ${me.first_name}`}
        description="Брокерын самбар."
      />

      <Card>
        <CardHeader>
          <CardTitle>Миний харилцагчид</CardTitle>
          <CardDescription>
            Админ танд харилцагч хуваарилахад энд харагдана.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UsersIcon className="size-5" />
            </span>
            <p className="font-medium">Харилцагч хуваарилагдаагүй байна</p>
            <p className="text-sm text-muted-foreground">
              Харилцагч хуваарилах боломж удахгүй нэмэгдэнэ.
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <Button asChild variant="outline">
          <Link to="/broker/account">
            <UserRoundCogIcon />
            Миний бүртгэл
          </Link>
        </Button>
      </div>
    </>
  );
}
