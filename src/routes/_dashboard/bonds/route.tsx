import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth';
import { PRIV } from '@/lib/rbac';

export const Route = createFileRoute('/_dashboard/bonds')({
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient, { privilege: PRIV.bondList });
  },
  component: Outlet,
  staticData: { crumb: 'Бонд' },
});
