import type { LinkProps } from '@tanstack/react-router';
import {
  ArrowLeftRightIcon,
  BracesIcon,
  BriefcaseIcon,
  Building2Icon,
  FileSignatureIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  ReceiptTextIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  to: LinkProps['to'];
  icon: LucideIcon;
  /** Super admins only; keep in sync with the route's requireAuth. */
  superOnly?: boolean;
}

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Ерөнхий',
    items: [{ title: 'Хянах самбар', to: '/', icon: LayoutDashboardIcon }],
  },
  {
    label: 'Удирдлага',
    items: [
      { title: 'Харилцагчид', to: '/clients', icon: UsersIcon },
      { title: 'Брокерууд', to: '/brokers', icon: BriefcaseIcon },
      { title: 'Бонд гаргагчид', to: '/issuers', icon: Building2Icon },
      { title: 'Гэрээ', to: '/contracts', icon: FileSignatureIcon },
      { title: 'Гэрээний загвар', to: '/templates', icon: FileTextIcon },
      { title: 'Хувьсагч', to: '/variables', icon: BracesIcon },
      { title: 'Админууд', to: '/admins', icon: ShieldIcon, superOnly: true },
    ],
  },
  {
    label: 'Банк',
    items: [
      { title: 'Хуулга', to: '/bank/statement', icon: ReceiptTextIcon },
      {
        title: 'Шилжүүлэг',
        to: '/bank/transfers',
        icon: ArrowLeftRightIcon,
      },
    ],
  },
];
