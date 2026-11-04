import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/issuers')({
  component: Outlet,
  staticData: { crumb: 'Бонд гаргагчид' },
});
