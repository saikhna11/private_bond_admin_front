import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboardIcon,
  type LucideIcon,
  UserRoundCogIcon,
} from 'lucide-react';
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
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useLogout } from '@/hooks/use-logout';
import { personInitials, personName } from '@/queries/auth/type';
import { brokerMeOptions } from '@/queries/broker-panel/options';
import { SidebarUserMenu } from './sidebar-user-menu';

const items: {
  title: string;
  to: '/broker' | '/broker/account';
  icon: LucideIcon;
}[] = [
  { title: 'Хянах самбар', to: '/broker', icon: LayoutDashboardIcon },
  { title: 'Миний бүртгэл', to: '/broker/account', icon: UserRoundCogIcon },
];

/** The broker panel's sidebar: only the broker's own sections, never the admin's. */
export function BrokerSidebar(props: ComponentProps<typeof Sidebar>) {
  const { data: me } = useSuspenseQuery(brokerMeOptions());
  const pathname = useLocation({ select: (location) => location.pathname });
  const logout = useLogout('broker');

  const isActive = (to: string) =>
    to === '/broker'
      ? pathname === '/broker' || pathname === '/broker/'
      : pathname.startsWith(to);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-14 justify-center">
        <Link
          to="/broker"
          className="flex items-center px-1 group-data-[collapsible=icon]:px-0"
        >
          <Logo className="group-data-[collapsible=icon]:[&>span:last-child]:hidden" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Брокер</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.to)}
                    tooltip={item.title}
                  >
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserMenu
          name={personName(me)}
          initials={personInitials(me)}
          subtitle={me.position || 'Брокер'}
          email={me.email}
          accountTo="/broker/account"
          onLogout={logout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
