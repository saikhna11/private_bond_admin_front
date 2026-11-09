import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { SearchInput } from '@/components/common/list-parts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useCan } from '@/hooks/use-can';
import { toApiError } from '@/lib/fetcher';
import { PRIV } from '@/lib/rbac';
import { showToast } from '@/lib/utils';
import { adminKeys, adminsOptions } from '@/queries/admin/options';
import { assignAdminRole } from '@/queries/admin/query';
import { authKeys } from '@/queries/auth/options';
import { personName } from '@/queries/auth/type';
import {
  privilegesOptions,
  roleKeys,
  rolePrivilegesOptions,
} from '@/queries/role/options';
import {
  createRole,
  deleteRole,
  setRolePrivileges,
  updateRole,
} from '@/queries/role/query';
import type { RoleType } from '@/queries/role/type';
import { PrivilegeMatrix } from './privilege-matrix';

function setsEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

/** Refreshes what a role's change touches: the roles, the admins, and your own access. */
function useRefreshRbac() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: roleKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminKeys.all }),
      queryClient.invalidateQueries({ queryKey: authKeys.me() }),
    ]);
}

/** Toggles ids in a staged set of privileges. */
function toggled(base: Set<string>, ids: string[], on: boolean) {
  const next = new Set(base);
  for (const id of ids) {
    if (on) next.add(id);
    else next.delete(id);
  }
  return next;
}

function MatrixBody({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-2 border-t p-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  return <div className="max-h-[60vh] overflow-y-auto">{children}</div>;
}

/** A new role: its name and privileges, created together on "Үүсгэх". */
export function DraftRoleEditor({
  onCreated,
  onDiscard,
}: {
  onCreated: (role: RoleType) => void;
  onDiscard: () => void;
}) {
  const can = useCan();
  const refresh = useRefreshRbac();
  const catalog = useQuery(privilegesOptions());
  const [name, setName] = useState('');
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  async function create() {
    setSaving(true);
    try {
      const role = await createRole(name.trim());
      if (draft.size > 0) await setRolePrivileges(role.id, [...draft]);
      showToast('success', 'Эрхийн бүлэг үүслээ');
      await refresh();
      onCreated(role);
    } catch (err) {
      showToast('error', toApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="space-y-0.5">
          <Label htmlFor="draft-role-name" className="text-sm font-medium">
            Нэр
          </Label>
          <p className="text-xs text-muted-foreground">
            Жишээ нь: Санхүү, Комплаенс.
          </p>
        </div>
        <Input
          id="draft-role-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full sm:w-64"
          autoFocus
        />
      </div>
      <Separator />
      <div className="space-y-1 p-4">
        <p className="text-sm font-medium">Эрх</p>
        <p className="text-xs text-muted-foreground">
          Аль хэсгийн ямар үйлдлийг зөвшөөрөхийг сонгоно.
        </p>
      </div>
      <MatrixBody loading={catalog.isPending}>
        <PrivilegeMatrix
          privileges={catalog.data ?? []}
          selected={draft}
          disabled={!can(PRIV.rolePrivilegeAssign)}
          onToggle={(ids, on) => setDraft((d) => toggled(d, ids, on))}
        />
      </MatrixBody>
      <div className="flex justify-end gap-2 border-t px-4 py-3">
        <Button variant="outline" onClick={onDiscard} disabled={saving}>
          Болих
        </Button>
        <Button onClick={create} disabled={saving || !name.trim()}>
          {saving && <Loader2Icon className="animate-spin" />}
          Үүсгэх
        </Button>
      </div>
    </div>
  );
}

/** One role: its name and state, its admins, and what it is granted. */
export function RoleEditor({ role }: { role: RoleType }) {
  const can = useCan();
  const refresh = useRefreshRbac();
  const catalog = useQuery(privilegesOptions());
  const granted = useQuery({
    ...rolePrivilegesOptions(role.id),
    enabled: !role.is_system,
  });
  const serverIds = useMemo(() => new Set(granted.data ?? []), [granted.data]);
  // Changes are staged and sent on "Хадгалах"; null is "nothing changed yet".
  const [override, setOverride] = useState<Set<string> | null>(null);
  const draft = override ?? serverIds;
  const dirty = override !== null && !setsEqual(override, serverIds);
  const [saving, setSaving] = useState(false);

  const canUpdate = can(PRIV.roleUpdate) && !role.is_system;
  const canGrant = can(PRIV.rolePrivilegeAssign) && !role.is_system;
  const canDelete = can(PRIV.roleDelete) && !role.is_system;

  const [name, setName] = useState(role.name);
  useEffect(() => setName(role.name), [role.name]);

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      await action();
      showToast('success', done);
    } catch (err) {
      showToast('error', toApiError(err).message);
      throw err;
    } finally {
      await refresh();
    }
  }

  async function save() {
    setSaving(true);
    try {
      await run(
        () => setRolePrivileges(role.id, [...draft]),
        'Эрх хадгалагдлаа',
      );
      setOverride(null);
    } catch {
      // The toast told why.
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="space-y-0.5">
          <Label
            htmlFor={`role-name-${role.id}`}
            className="text-sm font-medium"
          >
            Нэр
          </Label>
          <p className="text-xs text-muted-foreground">
            {role.is_system
              ? 'Супер админы бүлэг бүх эрхтэй бөгөөд өөрчлөгдөхгүй.'
              : 'Бүлгийн нэрийг өөрчлөх.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id={`role-name-${role.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full sm:w-64"
            disabled={!canUpdate}
          />
          {canUpdate && (
            <Button
              size="sm"
              disabled={!name.trim() || name.trim() === role.name}
              onClick={() =>
                void run(
                  () =>
                    updateRole(role.id, {
                      name: name.trim(),
                      is_active: role.is_active,
                    }),
                  'Нэр хадгалагдлаа',
                ).catch(() => {})
              }
            >
              Хадгалах
            </Button>
          )}
        </div>
      </div>
      {!role.is_system && (
        <>
          <Separator />
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="space-y-0.5">
              <Label
                htmlFor={`role-active-${role.id}`}
                className="text-sm font-medium"
              >
                Идэвхтэй
              </Label>
              <p className="text-xs text-muted-foreground">
                Идэвхгүй бүлгийн админууд ямар ч үйлдэл хийж чадахгүй.
              </p>
            </div>
            <Switch
              id={`role-active-${role.id}`}
              checked={role.is_active}
              disabled={!canUpdate}
              onCheckedChange={(on) =>
                void run(
                  () => updateRole(role.id, { name: role.name, is_active: on }),
                  on ? 'Бүлэг идэвхжлээ' : 'Бүлэг идэвхгүй боллоо',
                ).catch(() => {})
              }
            />
          </div>
        </>
      )}
      <Separator />
      <div className="space-y-1 p-4">
        <p className="text-sm font-medium">Гишүүд</p>
        <p className="text-xs text-muted-foreground">
          «{role.name}» бүлгийн админууд. Админ нэг л бүлэгт хамаарна: нэмэхэд
          өмнөх бүлгээсээ шилжинэ.
        </p>
      </div>
      <div className="px-4 pb-4">
        <RoleMembers role={role} />
      </div>
      <Separator />
      <div className="space-y-1 p-4">
        <p className="text-sm font-medium">Эрх</p>
        <p className="text-xs text-muted-foreground">
          {role.is_system
            ? 'Бүх хэсгийн бүх үйлдлийг автоматаар хийнэ.'
            : 'Аль хэсгийн ямар үйлдлийг зөвшөөрөхийг тохируулна.'}
        </p>
      </div>
      {!role.is_system && (
        <MatrixBody loading={catalog.isPending || granted.isPending}>
          <PrivilegeMatrix
            privileges={catalog.data ?? []}
            selected={draft}
            disabled={!canGrant || saving}
            onToggle={(ids, on) => setOverride(toggled(draft, ids, on))}
          />
        </MatrixBody>
      )}
      {(dirty || canDelete) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
          {canDelete ? (
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  className="text-destructive"
                  disabled={role.admin_count > 0}
                  title={
                    role.admin_count > 0
                      ? 'Админтай бүлгийг устгах боломжгүй'
                      : undefined
                  }
                >
                  <Trash2Icon />
                  Бүлэг устгах
                </Button>
              }
              title={`${role.name} бүлгийг устгах уу?`}
              description="Бүлэг бүрмөсөн устана."
              confirmLabel="Устгах"
              onConfirm={() => run(() => deleteRole(role.id), 'Устгагдлаа')}
            />
          ) : (
            <span />
          )}
          {dirty && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOverride(null)}
                disabled={saving}
              >
                Болих
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2Icon className="animate-spin" />}
                Хадгалах
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** The role's admins, and a search to move another admin into it. */
function RoleMembers({ role }: { role: RoleType }) {
  const can = useCan();
  const refresh = useRefreshRbac();
  const members = useQuery(adminsOptions({ role_id: role.id }));
  const canAssign = can(PRIV.adminAssignRole);
  const [q, setQ] = useState('');
  const found = useQuery({
    ...adminsOptions({ q: q || undefined, status: 'active' }),
    enabled: canAssign && q.length > 0,
  });
  const memberIds = new Set(members.data?.items.map((a) => a.id));
  const candidates = (found.data?.items ?? []).filter(
    (a) => !memberIds.has(a.id),
  );

  async function add(id: string, label: string) {
    try {
      await assignAdminRole(id, role.id);
      showToast('success', `${label} «${role.name}» бүлэгт нэмэгдлээ`);
      setQ('');
    } catch (err) {
      showToast('error', toApiError(err).message);
    } finally {
      await refresh();
    }
  }

  return (
    <div className="space-y-3">
      {members.isPending ? (
        <Skeleton className="h-10 w-full" />
      ) : !members.data?.items.length ? (
        <p className="text-xs text-muted-foreground">Гишүүнгүй.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {members.data.items.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="min-w-0">
                <span className="font-medium">{personName(a)}</span>{' '}
                <span className="text-muted-foreground">{a.email}</span>
              </span>
              {!a.is_active && (
                <span className="text-xs text-muted-foreground">Хаагдсан</span>
              )}
            </li>
          ))}
          {members.data.total > members.data.items.length && (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              ...нийт {members.data.total}
            </li>
          )}
        </ul>
      )}
      {canAssign && (
        <div className="space-y-2">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Админ имэйлээр хайж нэмэх"
          />
          {q && (
            <ul className="divide-y rounded-md border">
              {found.isPending ? (
                <li className="px-3 py-2 text-xs text-muted-foreground">
                  Хайж байна...
                </li>
              ) : candidates.length === 0 ? (
                <li className="px-3 py-2 text-xs text-muted-foreground">
                  Олдсонгүй.
                </li>
              ) : (
                candidates.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{personName(a)}</span>{' '}
                      <span className="text-muted-foreground">
                        {a.email} · {a.role?.name ?? 'бүлэггүй'}
                      </span>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void add(a.id, personName(a))}
                    >
                      <PlusIcon />
                      Нэмэх
                    </Button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
