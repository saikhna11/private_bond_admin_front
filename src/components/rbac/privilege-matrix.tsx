import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  ACTION_CATEGORY_LABELS,
  ACTION_CATEGORY_ORDER,
  PRIVILEGE_MODULES,
  type PrivilegeActionCategory,
  privilegeActionCategory,
  privilegeLabel,
  privilegeModule,
  privilegeModuleLabel,
} from '@/lib/rbac';
import type { PrivilegeType } from '@/queries/role/type';

interface CategoryGroup {
  category: PrivilegeActionCategory;
  ids: string[];
  descriptions: string[];
}

interface ModuleGroup {
  module: string;
  label: string;
  ids: string[];
  categories: CategoryGroup[];
}

const moduleOrder = (module: string) => {
  const i = PRIVILEGE_MODULES.findIndex((m) => m.module === module);
  return i === -1 ? PRIVILEGE_MODULES.length : i;
};

/** The catalog by module, then by kind of action, as goomnet's matrix shows it. */
function groupPrivileges(privileges: PrivilegeType[]): ModuleGroup[] {
  const modules = new Map<
    string,
    Map<PrivilegeActionCategory, CategoryGroup>
  >();
  for (const p of privileges) {
    const module = privilegeModule(p.name);
    const category = privilegeActionCategory(p.name);
    let byCategory = modules.get(module);
    if (!byCategory) {
      byCategory = new Map();
      modules.set(module, byCategory);
    }
    let group = byCategory.get(category);
    if (!group) {
      group = { category, ids: [], descriptions: [] };
      byCategory.set(category, group);
    }
    group.ids.push(p.id);
    const label = privilegeLabel(p.name);
    if (!group.descriptions.includes(label)) group.descriptions.push(label);
  }
  return [...modules]
    .map(([module, byCategory]) => {
      const categories = ACTION_CATEGORY_ORDER.map((c) =>
        byCategory.get(c),
      ).filter((g): g is CategoryGroup => g != null);
      return {
        module,
        label: privilegeModuleLabel(module),
        ids: categories.flatMap((c) => c.ids),
        categories,
      };
    })
    .sort(
      (a, b) =>
        moduleOrder(a.module) - moduleOrder(b.module) ||
        a.label.localeCompare(b.label),
    );
}

/**
 * Every privilege a role may be granted: a switch per module and kind of action (Харах,
 * Үүсгэх, ...), which grants every operation of that kind at once.
 */
export function PrivilegeMatrix({
  privileges,
  selected,
  onToggle,
  disabled,
}: {
  privileges: PrivilegeType[];
  selected: Set<string>;
  onToggle: (ids: string[], checked: boolean) => void;
  disabled?: boolean;
}) {
  const groups = useMemo(() => groupPrivileges(privileges), [privileges]);

  return (
    <div className="divide-y border-t">
      {groups.map((group) => {
        const granted = group.ids.filter((id) => selected.has(id)).length;
        return (
          <div key={group.module} className="p-4">
            <div className="mb-3 flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <p className="tabular shrink-0 text-xs font-medium text-muted-foreground">
                {granted}/{group.ids.length}
              </p>
            </div>
            <div className="space-y-3">
              {group.categories.map((cg, i) => {
                const all = cg.ids.every((id) => selected.has(id));
                const id = `privilege-${group.module}-${cg.category}`;
                return (
                  <div key={cg.category}>
                    {i > 0 && <Separator className="mb-3" />}
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Label htmlFor={id} className="text-sm font-medium">
                          {ACTION_CATEGORY_LABELS[cg.category]}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {cg.descriptions.join(' · ')}
                        </p>
                      </div>
                      <Switch
                        id={id}
                        checked={all}
                        disabled={disabled}
                        onCheckedChange={() => onToggle(cg.ids, !all)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
