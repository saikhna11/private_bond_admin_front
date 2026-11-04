import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BondDetail } from '@/components/bond/bond-detail';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toApiError } from '@/lib/fetcher';
import { bondOptions } from '@/queries/bond/options';

export const Route = createFileRoute('/_dashboard/bonds/$bondId')({
  component: BondPage,
  staticData: { crumb: 'Дэлгэрэнгүй' },
});

function BondPage() {
  const { bondId } = Route.useParams();
  const { data, isPending, error } = useQuery(bondOptions(bondId));

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">{toApiError(error).message}</p>
          <Button asChild variant="link">
            <Link to="/bonds">Жагсаалт руу буцах</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return <BondDetail key={data.id} b={data} />;
}
