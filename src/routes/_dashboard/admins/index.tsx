import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { KeyRoundIcon } from 'lucide-react';
import { useCallback } from 'react';
import * as z from 'zod';
import { FilterSelect } from '@/components/common/list-parts';
import { AssignRoleDialog } from '@/components/rbac/assign-role-dialog';
import { StaffManager } from '@/components/staff/staff-manager';
import { Button } from '@/components/ui/button';
import { useCan } from '@/hooks/use-can';
import { requireAuth } from '@/lib/auth';
import { PRIV } from '@/lib/rbac';
import { adminKeys, adminsOptions } from '@/queries/admin/options';
import {
  blockAdmin,
  createAdmin,
  deleteAdmin,
  resetAdminPassword,
  unblockAdmin,
  updateAdmin,
} from '@/queries/admin/query';
import type { AdminFilters, AdminType } from '@/queries/admin/type';
import { meOptions } from '@/queries/auth/options';
import { roleKeys, rolesOptions } from '@/queries/role/options';

const searchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  status: z.enum(['active', 'inactive']).optional().catch(undefined),
  role_id: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/admins/')({
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient, { privilege: PRIV.adminList });
  },
  validateSearch: searchSchema,
  component: AdminsPage,
  staticData: { crumb: 'Админууд' },
});

function AdminsPage() {
  const { data: me } = useSuspenseQuery(meOptions());
  const can = useCan();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useQuery(adminsOptions(search));
  const canRoles = can(PRIV.roleList);
  const roles = useQuery({ ...rolesOptions(), enabled: canRoles });
  const queryClient = useQueryClient();
  const onFilters = useCallback(
    (patch: Partial<AdminFilters>) =>
      navigate({
        search: (prev) => ({
          ...prev,
          ...patch,
          page: 'page' in patch ? patch.page : undefined,
        }),
      }),
    [navigate],
  );

  // A role's admin count changes with its admins.
  const refreshRoles = () =>
    queryClient.invalidateQueries({ queryKey: roleKeys.all });

  return (
    <StaffManager
      title="Админууд"
      description="Админ бүр нэг эрхийн бүлэгт хамаарч, бүлгийнхээ эрхээр ажиллана."
      noun="админ"
      withPosition={false}
      filters={search}
      onFilters={onFilters}
      query={query}
      queryKey={adminKeys.all}
      selfId={me.id}
      deleteNote="Админы бүртгэл бүрмөсөн устана. Түүний шалгасан харилцагчдын шалгалт хэвээр үлдэнэ."
      allow={{
        // A new admin needs a role, picked from the roles list.
        create: can(PRIV.adminCreate) && canRoles,
        update: can(PRIV.adminUpdate),
        block: can(PRIV.adminBlock),
        resetPassword: can(PRIV.adminResetPassword),
        remove: can(PRIV.adminDelete),
      }}
      access={{ roles: roles.data ?? [], rolesLoading: roles.isPending }}
      toolbar={
        canRoles && (
          <>
            <FilterSelect
              value={search.role_id}
              onChange={(role_id) => onFilters({ role_id })}
              allLabel="Бүх бүлэг"
              options={(roles.data ?? []).map((r) => ({
                value: r.id,
                label: r.name,
              }))}
            />
            <Button variant="outline" className="sm:ml-auto" asChild>
              <Link to="/rbac">
                <KeyRoundIcon />
                Эрх
              </Link>
            </Button>
          </>
        )
      }
      badge={(a) => (
        <RoleBadge
          admin={a}
          roles={roles.data ?? []}
          canAssign={can(PRIV.adminAssignRole) && canRoles && a.id !== me.id}
          onAssigned={refreshRoles}
        />
      )}
      actions={{
        create: async (v) => {
          await createAdmin({
            email: v.email,
            phone: v.phone,
            last_name: v.last_name,
            first_name: v.first_name,
            password: v.password,
            role_id: v.role_id,
          });
          await refreshRoles();
        },
        update: (id, v) =>
          updateAdmin(id, { last_name: v.last_name, first_name: v.first_name }),
        block: blockAdmin,
        unblock: unblockAdmin,
        resetPassword: resetAdminPassword,
        remove: async (id) => {
          await deleteAdmin(id);
          await refreshRoles();
        },
      }}
    />
  );
}

/** The admin's role; with admin:assign-role, a button that gives them another. */
function RoleBadge({
  admin,
  roles,
  canAssign,
  onAssigned,
}: {
  admin: AdminType;
  roles: { id: string; name: string; is_active: boolean }[];
  canAssign: boolean;
  onAssigned: () => Promise<unknown>;
}) {
  if (!admin.role) return null;
  const className = admin.is_system_role
    ? 'rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground dark:text-gold'
    : 'max-w-32 truncate rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground';
  if (!canAssign) {
    return <span className={className}>{admin.role.name}</span>;
  }
  return (
    <AssignRoleDialog
      admin={admin}
      roles={roles}
      onAssigned={onAssigned}
      trigger={
        <button
          type="button"
          className={`${className} cursor-pointer hover:ring-1 hover:ring-ring`}
          title="Эрхийн бүлэг солих"
        >
          {admin.role.name}
        </button>
      }
    />
  );
}
