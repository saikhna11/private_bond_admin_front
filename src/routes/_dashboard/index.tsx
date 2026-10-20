import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { meOptions } from '@/queries/auth/options';

export const Route = createFileRoute('/_dashboard/')({
  component: DashboardHome,
});

function DashboardHome() {
  const { data: me } = useSuspenseQuery(meOptions());

  return <h1 className="text-xl font-semibold">Сайн байна уу, {me.name}</h1>;
}
