import { Outlet } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { AppHeader } from '@/components/nav/app-header';
import { AppSidebar } from '@/components/nav/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUiStore } from '@/stores/ui-store';

export function DashboardLayout() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
