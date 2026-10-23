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
import { meOptions } from '@/queries/auth/options';
import { personInitials, personName } from '@/queries/auth/type';
import { clientsOptions } from '@/queries/client/options';
import { navGroups } from './nav-items';
import { SidebarUserMenu } from './sidebar-user-menu';

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { data: me } = useSuspenseQuery(meOptions());
  const pathname = useLocation({ select: (location) => location.pathname });
  const logout = useLogout();
  // The number of clients waiting for review, next to the menu item.
  const { data: pending } = useQuery({
    ...clientsOptions({ status: 'pending' }, 1),
    refetchInterval: 60_000,
  });

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

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
          const items = group.items.filter((i) => !i.superOnly || me.is_super);
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
          subtitle={me.is_super ? 'Супер админ' : 'Админ'}
          email={me.email}
          accountTo="/account"
          onLogout={logout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
