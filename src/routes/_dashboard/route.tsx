import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { requireAuth } from '@/lib/auth';

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient);
  },
  component: DashboardLayout,
  staticData: { crumb: 'Нүүр' },
});
