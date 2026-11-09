import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth';
import { PRIV } from '@/lib/rbac';

export const Route = createFileRoute('/_dashboard/clients')({
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient, { privilege: PRIV.clientList });
  },
  component: Outlet,
  staticData: { crumb: 'Харилцагчид' },
});
