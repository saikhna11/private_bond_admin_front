import type { MeType } from '@/queries/auth/type';

/**
 * The privilege keys the panel gates on, as the API names them: "module:action". A
 * privilege's full name is "module:action|Тайлбар"; several API operations may share a key
 * (bond:update covers a bond's terms, rate options and files). The system role may call
 * everything.
 */
export const PRIV = {
  adminList: 'admin:list',
  adminCreate: 'admin:create',
  adminUpdate: 'admin:update',
  adminAssignRole: 'admin:assign-role',
  adminBlock: 'admin:block',
  adminResetPassword: 'admin:reset-password',
  adminDelete: 'admin:delete',
  roleList: 'role:list',
  roleCreate: 'role:create',
  roleUpdate: 'role:update',
  roleDelete: 'role:delete',
  rolePrivilegeAssign: 'role:privilege-assign',
  privilegeList: 'privilege:list',
  brokerList: 'broker:list',
  brokerCreate: 'broker:create',
  brokerUpdate: 'broker:update',
  brokerBlock: 'broker:block',
  brokerResetPassword: 'broker:reset-password',
  brokerDelete: 'broker:delete',
  clientList: 'client:list',
  clientReview: 'client:review',
  clientTaxExempt: 'client:tax-exempt',
  clientBlock: 'client:block',
  clientDelete: 'client:delete',
  issuerList: 'issuer:list',
  issuerCreate: 'issuer:create',
  issuerUpdate: 'issuer:update',
  issuerDelete: 'issuer:delete',
  issuerMember: 'issuer:member',
  issuerAccount: 'issuer:account',
  bondList: 'bond:list',
  bondCreate: 'bond:create',
  bondUpdate: 'bond:update',
  bondState: 'bond:state',
  contractList: 'contract:list',
  scheduleList: 'schedule:list',
  scheduleUpdate: 'schedule:update',
  templateList: 'template:list',
  templateCreate: 'template:create',
  templateUpdate: 'template:update',
  templateActivate: 'template:activate',
  templateDelete: 'template:delete',
  variableList: 'variable:list',
  variableCreate: 'variable:create',
  variableUpdate: 'variable:update',
  variableDelete: 'variable:delete',
  paymentList: 'payment:list',
  paymentLink: 'payment:link',
  paymentDismiss: 'payment:dismiss',
  paymentReturn: 'payment:return',
  statementList: 'statement:list',
  statementSync: 'statement:sync',
  statementBalance: 'statement:balance',
  transferList: 'transfer:list',
  transferCreate: 'transfer:create',
  holidayCreate: 'holiday:create',
  holidayDelete: 'holiday:delete',
  companyAccountCreate: 'company-account:create',
  companyAccountUpdate: 'company-account:update',
  companyAccountDelete: 'company-account:delete',
} as const;

export type PrivilegeKey = (typeof PRIV)[keyof typeof PRIV];

/** Whether the signed-in admin may call what key names: deny by default. */
export function can(
  me: Pick<MeType, 'is_system_role' | 'privileges'>,
  key: PrivilegeKey,
) {
  return me.is_system_role || me.privileges.includes(key);
}

/** "module:action" of a privilege's full name. */
export function privilegeKey(name: string): string {
  return name.split('|')[0]?.trim() ?? name;
}

/** The Mongolian description of a privilege's full name. */
export function privilegeLabel(name: string): string {
  const parts = name.split('|');
  return (parts[1] ?? parts[0])?.trim() ?? name;
}

export function privilegeModule(name: string): string {
  return privilegeKey(name).split(':')[0] ?? name;
}

function privilegeAction(name: string): string {
  return privilegeKey(name).split(':')[1] ?? '';
}

/** The modules in the menu's order, each with its Mongolian name. */
export const PRIVILEGE_MODULES: { module: string; label: string }[] = [
  { module: 'client', label: 'Харилцагч' },
  { module: 'broker', label: 'Брокер' },
  { module: 'issuer', label: 'Бонд гаргагч' },
  { module: 'bond', label: 'Бонд' },
  { module: 'contract', label: 'Гэрээ' },
  { module: 'template', label: 'Гэрээний загвар' },
  { module: 'variable', label: 'Хувьсагч' },
  { module: 'payment', label: 'Төлбөр' },
  { module: 'schedule', label: 'Эргэн төлөлт' },
  { module: 'statement', label: 'Дансны хуулга' },
  { module: 'transfer', label: 'Шилжүүлэг' },
  { module: 'company-account', label: 'Компанийн данс' },
  { module: 'holiday', label: 'Баярын өдөр' },
  { module: 'admin', label: 'Админ' },
  { module: 'role', label: 'Эрхийн бүлэг' },
  { module: 'privilege', label: 'Эрх' },
];

export function privilegeModuleLabel(module: string): string {
  return PRIVILEGE_MODULES.find((m) => m.module === module)?.label ?? module;
}

export type PrivilegeActionCategory =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'assign'
  | 'other';

export const ACTION_CATEGORY_ORDER: PrivilegeActionCategory[] = [
  'view',
  'create',
  'update',
  'assign',
  'delete',
  'other',
];

export const ACTION_CATEGORY_LABELS: Record<PrivilegeActionCategory, string> = {
  view: 'Харах',
  create: 'Үүсгэх',
  update: 'Шинэчлэх',
  assign: 'Шийдвэрлэх, оноох',
  delete: 'Устгах',
  other: 'Бусад',
};

/** What kind of action a privilege is, by its action, to group the matrix by. */
export function privilegeActionCategory(name: string): PrivilegeActionCategory {
  const action = privilegeAction(name);
  if (/delete|remove/.test(action)) return 'delete';
  if (/create|add/.test(action)) return 'create';
  if (/assign|review|tax-exempt|link|dismiss|return/.test(action)) {
    return 'assign';
  }
  if (
    /update|state|activate|block|reset-password|member|account|sync/.test(
      action,
    )
  ) {
    return 'update';
  }
  if (/list|get|search/.test(action)) return 'view';
  return 'other';
}
