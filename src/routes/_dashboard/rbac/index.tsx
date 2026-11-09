import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon, SearchIcon, ShieldIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageTitle } from '@/components/common/page-title';
import { DraftRoleEditor, RoleEditor } from '@/components/rbac/role-editor';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCan } from '@/hooks/use-can';
import { requireAuth } from '@/lib/auth';
import { toApiError } from '@/lib/fetcher';
import { PRIV } from '@/lib/rbac';
import { rolesOptions } from '@/queries/role/options';

export const Route = createFileRoute('/_dashboard/rbac/')({
  beforeLoad: async ({ context }) => {
    await requireAuth(context.queryClient, { privilege: PRIV.roleList });
  },
  component: RbacPage,
  staticData: { crumb: 'Эрх' },
});

const DRAFT = '__draft__';

/**
 * The roles and what each may call, as goomnet's Эрх page: one accordion item per role
 * with its name, admins and privilege switches.
 */
function RbacPage() {
  const can = useCan();
  const { data: roles, isPending, error } = useQuery(rolesOptions());
  const [filter, setFilter] = useState('');
  const [draft, setDraft] = useState(false);
  const [open, setOpen] = useState<string[]>([]);

  const shown = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return term
      ? (roles ?? []).filter((r) => r.name.toLowerCase().includes(term))
      : (roles ?? []);
  }, [roles, filter]);

  return (
    <>
      <PageTitle
        title="Эрх"
        description="Админ бүр нэг эрхийн бүлэгт хамаарч, бүлгийнхээ эрхээр ажиллана. Супер админы бүлэг бүх эрхийг автоматаар авна."
        action={
          can(PRIV.roleCreate) && (
            <Button
              disabled={draft}
              onClick={() => {
                setDraft(true);
                setOpen((o) => (o.includes(DRAFT) ? o : [...o, DRAFT]));
              }}
            >
              <PlusIcon />
              Шинэ бүлэг
            </Button>
          )
        }
      />

      {roles && roles.length > 4 && (
        <div className="relative max-w-xs">
          <SearchIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Бүлэг хайх"
            className="h-9 pl-8"
          />
        </div>
      )}

      <Card className="gap-0 py-0">
        {isPending ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {toApiError(error).message}
          </p>
        ) : (
          <Accordion type="multiple" value={open} onValueChange={setOpen}>
            {draft && (
              <AccordionItem value={DRAFT}>
                <AccordionTrigger className="px-4 hover:no-underline">
                  <span className="flex items-center gap-3">
                    <ShieldIcon className="size-4 text-muted-foreground" />
                    <span className="italic">Шинэ бүлэг</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <DraftRoleEditor
                    onCreated={(role) => {
                      setDraft(false);
                      setOpen((o) => [
                        ...o.filter((v) => v !== DRAFT),
                        role.id,
                      ]);
                    }}
                    onDiscard={() => {
                      setDraft(false);
                      setOpen((o) => o.filter((v) => v !== DRAFT));
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            )}
            {shown.map((role) => (
              <AccordionItem key={role.id} value={role.id}>
                <AccordionTrigger className="px-4 hover:no-underline">
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-4">
                    <span className="flex min-w-0 items-center gap-3">
                      <ShieldIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {role.name}
                          </span>
                          {role.is_system && (
                            <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground dark:text-gold">
                              Систем
                            </span>
                          )}
                          {!role.is_active && (
                            <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                              Идэвхгүй
                            </span>
                          )}
                        </span>
                        <span className="block text-xs font-normal text-muted-foreground">
                          {role.admin_count} админ
                        </span>
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-xs font-normal text-muted-foreground">
                      {role.is_system
                        ? 'Бүх эрх'
                        : `${role.privilege_count} эрх`}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <RoleEditor role={role} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Card>
    </>
  );
}
