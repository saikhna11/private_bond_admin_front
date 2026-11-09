import { type UseQueryResult, useQueryClient } from '@tanstack/react-query';
import {
  BanIcon,
  KeyRoundIcon,
  LockOpenIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import {
  FilterBar,
  FilterSelect,
  Pagination,
  SearchInput,
  TableEmpty,
  TableSkeletonRows,
} from '@/components/common/list-parts';
import { PageTitle } from '@/components/common/page-title';
import { ActiveBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toApiError } from '@/lib/fetcher';
import { formatDate } from '@/lib/format';
import { PAGE_SIZE, type PageType } from '@/lib/types';
import { showToast } from '@/lib/utils';
import { personInitials, personName } from '@/queries/auth/type';
import type { StaffFilters } from '@/queries/broker/type';
import { ResetPasswordDialog } from './reset-password-dialog';
import {
  type StaffAccess,
  StaffFormDialog,
  type StaffValues,
} from './staff-form-dialog';

export interface StaffRow {
  id: string;
  email: string;
  phone: string;
  last_name: string;
  first_name: string;
  position?: string;
  is_active: boolean;
  created_at: string;
}

export interface StaffActions {
  create: (v: StaffValues) => Promise<unknown>;
  update: (id: string, v: StaffValues) => Promise<unknown>;
  block: (id: string) => Promise<unknown>;
  unblock: (id: string) => Promise<unknown>;
  resetPassword: (id: string, password: string) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
}

/** Which changes the admin's role allows; each is allowed when left out. */
export interface StaffAllow {
  create?: boolean;
  update?: boolean;
  block?: boolean;
  resetPassword?: boolean;
  remove?: boolean;
}

/** The broker and admin lists: the same table, filters, dialogs and actions. */
export function StaffManager<T extends StaffRow>({
  title,
  description,
  noun,
  withPosition,
  filters,
  onFilters,
  query,
  queryKey,
  actions,
  selfId,
  badge,
  deleteNote,
  allow = {},
  access,
  toolbar,
}: {
  title: string;
  description: ReactNode;
  noun: string;
  withPosition: boolean;
  filters: StaffFilters;
  onFilters: (patch: Partial<StaffFilters>) => void;
  query: UseQueryResult<PageType<T>>;
  queryKey: readonly unknown[];
  actions: StaffActions;
  /** The signed-in admin: nobody blocks, resets or deletes themselves. */
  selfId?: string;
  badge?: (row: T) => ReactNode;
  deleteNote?: string;
  /** Hides the changes the admin's role does not allow. */
  allow?: StaffAllow;
  /** Lets the create dialog pick the new admin's role (the admin list). */
  access?: StaffAccess;
  /** More filters, after the status one. */
  toolbar?: ReactNode;
}) {
  const queryClient = useQueryClient();
  const { data, isPending, error, isPlaceholderData } = query;
  const cols = withPosition ? 6 : 5;
  const Noun = noun[0].toUpperCase() + noun.slice(1);

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      await action();
      showToast('success', done);
    } catch (err) {
      showToast('error', toApiError(err).message);
      throw err;
    } finally {
      await queryClient.invalidateQueries({ queryKey });
    }
  }

  return (
    <>
      <PageTitle
        title={title}
        description={description}
        action={
          allow.create !== false && (
            <StaffFormDialog
              mode="create"
              noun={noun}
              withPosition={withPosition}
              access={access}
              trigger={
                <Button>
                  <PlusIcon />
                  {Noun} нэмэх
                </Button>
              }
              onSubmit={async (v) => {
                await actions.create(v);
                showToast('success', `${Noun} нэмэгдлээ`);
                await queryClient.invalidateQueries({ queryKey });
              }}
            />
          )
        }
      />

      <Card className="gap-0 py-0">
        <FilterBar
          search={
            <SearchInput
              value={filters.q ?? ''}
              onChange={(q) => onFilters({ q: q || undefined })}
              placeholder="Имэйлээр хайх"
            />
          }
        >
          <FilterSelect
            value={filters.status}
            onChange={(status) => onFilters({ status })}
            allLabel="Бүх төлөв"
            options={[
              { value: 'active', label: 'Идэвхтэй' },
              { value: 'inactive', label: 'Хаагдсан' },
            ]}
          />
          {toolbar}
        </FilterBar>
        <Table className={isPlaceholderData ? 'opacity-60' : undefined}>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Нэр</TableHead>
              <TableHead>Утас</TableHead>
              {withPosition && <TableHead>Албан тушаал</TableHead>}
              <TableHead>Төлөв</TableHead>
              <TableHead>Нэмсэн</TableHead>
              <TableHead className="w-12 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableSkeletonRows cols={cols} />
            ) : error ? (
              <TableEmpty
                cols={cols}
                title="Ачаалж чадсангүй"
                text={toApiError(error).message}
              />
            ) : !data?.items.length ? (
              <TableEmpty
                cols={cols}
                title={isFiltered(filters) ? 'Олдсонгүй' : `${Noun} алга`}
                text={
                  isFiltered(filters) ? 'Хайлтаа өөрчилж үзнэ үү.' : undefined
                }
              />
            ) : (
              data.items.map((row) => (
                <StaffTableRow
                  key={row.id}
                  row={row}
                  noun={noun}
                  withPosition={withPosition}
                  isSelf={row.id === selfId}
                  badge={badge?.(row)}
                  deleteNote={deleteNote}
                  actions={actions}
                  run={run}
                  allow={allow}
                />
              ))
            )}
          </TableBody>
        </Table>
        {data && data.total > 0 && (
          <Pagination
            page={filters.page ?? 1}
            size={PAGE_SIZE}
            total={data.total}
            onPage={(page) => onFilters({ page })}
          />
        )}
      </Card>
    </>
  );
}

function isFiltered(f: StaffFilters) {
  return Object.entries(f).some(([k, v]) => k !== 'page' && v !== undefined);
}

function StaffTableRow<T extends StaffRow>({
  row,
  noun,
  withPosition,
  isSelf,
  badge,
  deleteNote,
  actions,
  run,
  allow,
}: {
  row: T;
  noun: string;
  withPosition: boolean;
  isSelf: boolean;
  badge?: ReactNode;
  deleteNote?: string;
  actions: StaffActions;
  run: (action: () => Promise<unknown>, done: string) => Promise<void>;
  allow: StaffAllow;
}) {
  const [dialog, setDialog] = useState<'reset' | 'block' | 'delete' | null>(
    null,
  );
  const name = personName(row);
  const canReset = allow.resetPassword !== false;
  const canBlock = allow.block !== false;
  const canRemove = allow.remove !== false;
  const hasMenu = canReset || canBlock || canRemove;

  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
            {personInitials(row)}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-medium">
              <span className="max-w-48 truncate">{name}</span>
              {isSelf && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  Та
                </span>
              )}
              {badge}
            </p>
            <p className="max-w-56 truncate text-xs text-muted-foreground">
              {row.email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="tabular">{row.phone}</TableCell>
      {withPosition && (
        <TableCell className="text-muted-foreground">
          {row.position || '-'}
        </TableCell>
      )}
      <TableCell>
        <ActiveBadge active={row.is_active} />
      </TableCell>
      <TableCell className="tabular text-muted-foreground">
        {formatDate(row.created_at)}
      </TableCell>
      <TableCell className="pr-4 text-right">
        <div className="flex justify-end gap-1">
          {allow.update !== false && (
            <StaffFormDialog
              mode="edit"
              noun={noun}
              withPosition={withPosition}
              initial={{
                last_name: row.last_name,
                first_name: row.first_name,
                position: row.position,
              }}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Засах"
                  title="Засах"
                >
                  <PencilIcon />
                </Button>
              }
              onSubmit={(v) =>
                run(() => actions.update(row.id, v), 'Хадгалагдлаа')
              }
            />
          )}
          {hasMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Бусад үйлдэл"
                  disabled={isSelf}
                >
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {canReset && (
                  <DropdownMenuItem onSelect={() => setDialog('reset')}>
                    <KeyRoundIcon />
                    Нууц үг шинэчлэх
                  </DropdownMenuItem>
                )}
                {canBlock &&
                  (row.is_active ? (
                    <DropdownMenuItem onSelect={() => setDialog('block')}>
                      <BanIcon />
                      Хаах
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onSelect={() =>
                        void run(
                          () => actions.unblock(row.id),
                          'Нээгдлээ',
                        ).catch(() => {})
                      }
                    >
                      <LockOpenIcon />
                      Нээх
                    </DropdownMenuItem>
                  ))}
                {canRemove && (
                  <>
                    {(canReset || canBlock) && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDialog('delete')}
                    >
                      <Trash2Icon />
                      Устгах
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <ResetPasswordDialog
          open={dialog === 'reset'}
          onOpenChange={(o) => setDialog(o ? 'reset' : null)}
          name={name}
          onReset={(password) =>
            run(
              () => actions.resetPassword(row.id, password),
              'Нууц үг шинэчлэгдлээ',
            )
          }
        />
        <ConfirmDialog
          open={dialog === 'block'}
          onOpenChange={(o) => setDialog(o ? 'block' : null)}
          title={`${name}-г хаах уу?`}
          description="Бүх нэвтрэлт нь шууд дуусч, дахин нэвтрэх боломжгүй болно."
          confirmLabel="Хаах"
          onConfirm={() => run(() => actions.block(row.id), 'Хаагдлаа')}
        />
        <ConfirmDialog
          open={dialog === 'delete'}
          onOpenChange={(o) => setDialog(o ? 'delete' : null)}
          title={`${name}-г устгах уу?`}
          description={
            deleteNote ??
            `${noun[0].toUpperCase() + noun.slice(1)}ын бүртгэл бүрмөсөн устана.`
          }
          confirmLabel="Устгах"
          onConfirm={() => run(() => actions.remove(row.id), 'Устгагдлаа')}
        />
      </TableCell>
    </TableRow>
  );
}
