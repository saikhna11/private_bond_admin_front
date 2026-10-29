import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/contracts')({
  component: Outlet,
  staticData: { crumb: 'Гэрээ' },
});
