import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { TemplateDetail } from '@/components/template/template-detail';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toApiError } from '@/lib/fetcher';
import { templateOptions } from '@/queries/template/options';

export const Route = createFileRoute('/_dashboard/templates/$templateId')({
  component: TemplatePage,
  staticData: { crumb: 'Дэлгэрэнгүй' },
});

function TemplatePage() {
  const { templateId } = Route.useParams();
  const { data, isPending, error } = useQuery(templateOptions(templateId));

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">{toApiError(error).message}</p>
          <Button asChild variant="link">
            <Link to="/templates">Жагсаалт руу буцах</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return <TemplateDetail key={data.id} t={data} />;
}
