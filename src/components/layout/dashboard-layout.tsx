import { Outlet } from '@tanstack/react-router';
import type { CSSProperties, ReactNode } from 'react';
import { AppHeader } from '@/components/nav/app-header';
import { AppSidebar } from '@/components/nav/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useUiStore } from '@/stores/ui-store';

/** The signed-in shell; the admin sidebar unless another panel gives its own. */
export function DashboardLayout({
  sidebar = <AppSidebar variant="inset" />,
}: {
  sidebar?: ReactNode;
}) {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 64)',
          '--header-height': 'calc(var(--spacing) * 14)',
        } as CSSProperties
      }
    >
      {sidebar}
      <SidebarInset>
        <AppHeader />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
