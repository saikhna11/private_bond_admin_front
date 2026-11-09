import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useLocation } from '@tanstack/react-router';
import type { ComponentProps } from 'react';
import { Logo } from '@/components/brand/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useLogout } from '@/hooks/use-logout';
import { can, PRIV } from '@/lib/rbac';
import { meOptions } from '@/queries/auth/options';
import { personInitials, personName } from '@/queries/auth/type';
import { clientsOptions } from '@/queries/client/options';
import { paymentCountsOptions } from '@/queries/payment/options';
import { duePayoutsOptions } from '@/queries/schedule/options';
import { navGroups } from './nav-items';
import { SidebarUserMenu } from './sidebar-user-menu';

const allPaths = navGroups.flatMap((g) => g.items.map((i) => i.to as string));

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { data: me } = useSuspenseQuery(meOptions());
  const pathname = useLocation({ select: (location) => location.pathname });
  const logout = useLogout();
  // The number of clients waiting for review, next to the menu item.
  const { data: pending } = useQuery({
    ...clientsOptions({ status: 'pending' }, 1),
    refetchInterval: 60_000,
    enabled: can(me, PRIV.clientList),
  });

  // The payments to look at, next to their menu item.
  const { data: payments } = useQuery({
    ...paymentCountsOptions(),
    enabled: can(me, PRIV.paymentList),
  });
  const paymentIssues = payments
    ? payments.unknown + payments.short + payments.refund
    : 0;

  // The payouts due today or before, next to their menu item.
  const { data: payouts } = useQuery({
    ...duePayoutsOptions(1),
    enabled: can(me, PRIV.scheduleList),
  });

  // The longest item the path is under, when one item's path starts another's.
  const isActive = (to: string) =>
    to === '/'
      ? pathname === '/'
      : pathname.startsWith(to) &&
        !allPaths.some(
          (o) =>
            o.length > to.length && o.startsWith(to) && pathname.startsWith(o),
        );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-14 justify-center">
        <Link
          to="/"
          className="flex items-center px-1 group-data-[collapsible=icon]:px-0"
        >
          <Logo className="group-data-[collapsible=icon]:[&>span:last-child]:hidden" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => {
          const items = group.items.filter(
            (i) => !i.privilege || can(me, i.privilege),
          );
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.to as string)}
                        tooltip={item.title}
                      >
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.to === '/bank/payments' && paymentIssues > 0 && (
                        <SidebarMenuBadge className="rounded-full bg-warning/20 px-1.5 text-warning-foreground dark:text-warning">
                          {paymentIssues}
                        </SidebarMenuBadge>
                      )}
                      {item.to === '/bank/repayments' && !!payouts?.total && (
                        <SidebarMenuBadge className="rounded-full bg-warning/20 px-1.5 text-warning-foreground dark:text-warning">
                          {payouts.total}
                        </SidebarMenuBadge>
                      )}
                      {item.to === '/clients' && !!pending?.total && (
                        <SidebarMenuBadge className="rounded-full bg-warning/20 px-1.5 text-warning-foreground dark:text-warning">
                          {pending.total}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserMenu
          name={personName(me)}
          initials={personInitials(me)}
          subtitle={me.role?.name ?? 'Админ'}
          email={me.email}
          accountTo="/account"
          onLogout={logout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
