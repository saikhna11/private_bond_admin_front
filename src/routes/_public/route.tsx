import { createFileRoute, redirect } from '@tanstack/react-router';
import { PublicLayout } from '@/components/layout/public-layout';
import { authKeys } from '@/queries/auth/options';

export const Route = createFileRoute('/_public')({
  beforeLoad: ({ context }) => {
    // Cache only: no /me request from the login page.
    if (context.queryClient.getQueryData(authKeys.me())) {
      throw redirect({ to: '/' });
    }
  },
  component: PublicLayout,
});
