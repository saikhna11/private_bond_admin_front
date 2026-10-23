import { ThemeToggle } from '@/components/common/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbNav } from './breadcrumb-nav';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 rounded-t-xl border-b bg-background/85 px-4 backdrop-blur-md lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-4"
      />
      <BreadcrumbNav />
      <ThemeToggle className="ml-auto" />
    </header>
  );
}
