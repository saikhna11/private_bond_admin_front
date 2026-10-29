import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ContractDetail } from '@/components/contract/contract-detail';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toApiError } from '@/lib/fetcher';
import { contractOptions } from '@/queries/contract/options';

export const Route = createFileRoute('/_dashboard/contracts/$contractId')({
  component: ContractPage,
  staticData: { crumb: 'Дэлгэрэнгүй' },
});

function ContractPage() {
  const { contractId } = Route.useParams();
  const { data, isPending, error } = useQuery(contractOptions(contractId));

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
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
            <Link to="/contracts">Жагсаалт руу буцах</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return <ContractDetail key={data.id} c={data} />;
}
