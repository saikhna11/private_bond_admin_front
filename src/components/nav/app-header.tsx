import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbNav } from './breadcrumb-nav';

export function AppHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-4"
      />
      <BreadcrumbNav />
    </header>
  );
}
