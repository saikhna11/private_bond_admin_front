import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { ApiErrorAlert } from '@/components/common/api-error-alert';
import { RoleSelect } from '@/components/staff/staff-form-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { type ApiError, toApiError } from '@/lib/fetcher';
import { showToast } from '@/lib/utils';
import { adminKeys } from '@/queries/admin/options';
import { assignAdminRole } from '@/queries/admin/query';
import type { AdminType } from '@/queries/admin/type';
import { personName } from '@/queries/auth/type';

/** Gives an admin another role (PUT /admins/{id}/role). */
export function AssignRoleDialog({
  admin,
  roles,
  trigger,
  onAssigned,
}: {
  admin: AdminType;
  roles: { id: string; name: string; is_active: boolean }[];
  trigger: ReactNode;
  onAssigned?: () => Promise<unknown>;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState(admin.role?.id ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await assignAdminRole(admin.id, roleId);
      showToast('success', 'Эрхийн бүлэг солигдлоо');
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
      await onAssigned?.();
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setRoleId(admin.role?.id ?? '');
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Эрхийн бүлэг солих</DialogTitle>
          <DialogDescription>
            {personName(admin)} шинэ бүлгийнхээ эрхээр шууд ажиллана.
          </DialogDescription>
        </DialogHeader>
        <RoleSelect
          id={`assign-role-${admin.id}`}
          roles={roles}
          value={roleId}
          onChange={setRoleId}
        />
        <ApiErrorAlert error={error} />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Болих
            </Button>
          </DialogClose>
          <Button
            onClick={save}
            disabled={saving || !roleId || roleId === admin.role?.id}
          >
            {saving && <Loader2Icon className="animate-spin" />}
            Хадгалах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
