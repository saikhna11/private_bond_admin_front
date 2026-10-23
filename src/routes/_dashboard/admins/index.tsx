import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import * as z from 'zod';
import { StaffManager } from '@/components/staff/staff-manager';
import { requireAuth } from '@/lib/auth';
import { adminKeys, adminsOptions } from '@/queries/admin/options';
import {
  blockAdmin,
  createAdmin,
  deleteAdmin,
  resetAdminPassword,
  unblockAdmin,
  updateAdmin,
} from '@/queries/admin/query';
import { meOptions } from '@/queries/auth/options';
import type { StaffFilters } from '@/queries/broker/type';

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  status: z.enum(['active', 'inactive']).optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/admins/')({
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient, { superOnly: true });
  },
  validateSearch: searchSchema,
  component: AdminsPage,
  staticData: { crumb: 'Админууд' },
});

function AdminsPage() {
  const { data: me } = useSuspenseQuery(meOptions());
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useQuery(adminsOptions(search));
  const onFilters = useCallback(
    (patch: Partial<StaffFilters>) =>
      navigate({
        search: (prev) => ({
          ...prev,
          ...patch,
          page: 'page' in patch ? patch.page : undefined,
        }),
      }),
    [navigate],
  );

  return (
    <StaffManager
      title="Админууд"
      description="Одоогоор бүх админ бүх хэсгийг ашиглана. Эрхийн түвшин удахгүй нэмэгдэнэ."
      noun="админ"
      withPosition={false}
      filters={search}
      onFilters={onFilters}
      query={query}
      queryKey={adminKeys.all}
      selfId={me.id}
      deleteNote="Админы бүртгэл бүрмөсөн устана. Түүний шалгасан харилцагчдын шалгалт хэвээр үлдэнэ."
      badge={(a) =>
        a.is_super ? (
          <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground dark:text-gold">
            Супер
          </span>
        ) : null
      }
      actions={{
        create: (v) =>
          createAdmin({
            email: v.email,
            phone: v.phone,
            last_name: v.last_name,
            first_name: v.first_name,
            password: v.password,
          }),
        update: (id, v) =>
          updateAdmin(id, { last_name: v.last_name, first_name: v.first_name }),
        block: blockAdmin,
        unblock: unblockAdmin,
        resetPassword: resetAdminPassword,
        remove: deleteAdmin,
      }}
    />
  );
}
