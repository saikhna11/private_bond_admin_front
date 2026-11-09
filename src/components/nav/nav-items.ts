import type { LinkProps } from '@tanstack/react-router';
import {
  ArrowLeftRightIcon,
  BanknoteIcon,
  BracesIcon,
  BriefcaseIcon,
  Building2Icon,
  CalendarDaysIcon,
  FileSignatureIcon,
  FileTextIcon,
  HandCoinsIcon,
  KeyRoundIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  ReceiptTextIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';
import { PRIV, type PrivilegeKey } from '@/lib/rbac';

export interface NavItem {
  title: string;
  to: LinkProps['to'];
  icon: LucideIcon;
  /**
   * The privilege the page reads with, as goomnet's SIDEBAR_ITEMS: the item shows only to
   * an admin whose role is granted it. Keep in sync with the route's requireAuth.
   */
  privilege?: PrivilegeKey;
}

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Ерөнхий',
    items: [{ title: 'Хянах самбар', to: '/', icon: LayoutDashboardIcon }],
  },
  {
    label: 'Удирдлага',
    items: [
      {
        title: 'Харилцагчид',
        to: '/clients',
        icon: UsersIcon,
        privilege: PRIV.clientList,
      },
      {
        title: 'Брокерууд',
        to: '/brokers',
        icon: BriefcaseIcon,
        privilege: PRIV.brokerList,
      },
      {
        title: 'Бонд гаргагчид',
        to: '/issuers',
        icon: Building2Icon,
        privilege: PRIV.issuerList,
      },
      {
        title: 'Бонд',
        to: '/bonds',
        icon: LandmarkIcon,
        privilege: PRIV.bondList,
      },
      {
        title: 'Гэрээ',
        to: '/contracts',
        icon: FileSignatureIcon,
        privilege: PRIV.contractList,
      },
      {
        title: 'Гэрээний загвар',
        to: '/templates',
        icon: FileTextIcon,
        privilege: PRIV.templateList,
      },
      {
        title: 'Хувьсагч',
        to: '/variables',
        icon: BracesIcon,
        privilege: PRIV.variableList,
      },
      {
        title: 'Админууд',
        to: '/admins',
        icon: ShieldIcon,
        privilege: PRIV.adminList,
      },
      {
        title: 'Эрх',
        to: '/rbac',
        icon: KeyRoundIcon,
        privilege: PRIV.roleList,
      },
    ],
  },
  {
    label: 'Банк',
    items: [
      {
        title: 'Анхаарах төлбөр',
        to: '/bank/payments',
        icon: BanknoteIcon,
        privilege: PRIV.paymentList,
      },
      {
        title: 'Эргэн төлөлт',
        to: '/bank/repayments',
        icon: HandCoinsIcon,
        privilege: PRIV.scheduleList,
      },
      {
        title: 'Хуулга',
        to: '/bank/statement',
        icon: ReceiptTextIcon,
        privilege: PRIV.statementList,
      },
      {
        title: 'Шилжүүлэг',
        to: '/bank/transfers',
        icon: ArrowLeftRightIcon,
        privilege: PRIV.transferList,
      },
      { title: 'Компанийн данс', to: '/bank/accounts', icon: LandmarkIcon },
      { title: 'Баярын өдөр', to: '/bank/holidays', icon: CalendarDaysIcon },
    ],
  },
];
