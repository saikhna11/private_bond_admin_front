import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BrokerSidebar } from '@/components/nav/broker-sidebar';
import { requireBrokerAuth } from '@/lib/auth';

export const Route = createFileRoute('/broker/_panel')({
  beforeLoad: async ({ context }) => {
    await requireBrokerAuth(context.queryClient);
  },
  component: () => (
    <DashboardLayout sidebar={<BrokerSidebar variant="inset" />} />
  ),
  staticData: { crumb: 'Брокерын самбар' },
});
