import type { LinkProps } from '@tanstack/react-router';
import {
  BriefcaseIcon,
  LayoutDashboardIcon,
  type LucideIcon,
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
      { title: 'Админууд', to: '/admins', icon: ShieldIcon, superOnly: true },
    ],
  },
];
