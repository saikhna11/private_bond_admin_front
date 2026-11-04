import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/bonds')({
  component: Outlet,
  staticData: { crumb: 'Бонд' },
});
