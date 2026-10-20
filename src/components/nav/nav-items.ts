import type { LinkProps } from '@tanstack/react-router';
import { LayoutDashboardIcon, type LucideIcon } from 'lucide-react';
import type { Role } from '@/queries/auth/type';

export interface NavItem {
  title: string;
  to: LinkProps['to'];
  icon: LucideIcon;
  /** Roles that see this item; keep in sync with the route's requireAuth. */
  roles: Role[];
}

export const navItems: NavItem[] = [
  {
    title: 'Нүүр',
    to: '/',
    icon: LayoutDashboardIcon,
    roles: ['admin', 'broker'],
  },
];
