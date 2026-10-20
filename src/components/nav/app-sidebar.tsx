import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useLocation } from '@tanstack/react-router';
import type { ComponentProps } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { meOptions } from '@/queries/auth/options';
import { navItems } from './nav-items';

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { data: me } = useSuspenseQuery(meOptions());
  const pathname = useLocation({ select: (location) => location.pathname });
  const items = navItems.filter((item) => item.roles.includes(me.role));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <span className="truncate px-2 font-semibold">Private Bond</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.to}
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
        <div className="flex items-center gap-2 px-2 py-1">
          <Avatar className="size-8">
            <AvatarFallback>{me.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid text-sm leading-tight">
            <span className="truncate font-medium">{me.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {me.role}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
