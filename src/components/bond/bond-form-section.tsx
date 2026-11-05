import type { ReactNode } from 'react';
import { FieldGroup } from '@/components/ui/field';

/**
 * One part of the bond form: its title and what it rules on the left, its fields on the right
 * once the form is wide (a page), the title above the fields when it is not (a dialog).
 */
export function BondFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-5 py-6 first:pt-0 last:pb-0 @4xl/bond-form:grid-cols-[13rem_minmax(0,1fr)] @4xl/bond-form:gap-10 @6xl/bond-form:grid-cols-[16rem_minmax(0,1fr)]">
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <FieldGroup className="gap-5">{children}</FieldGroup>
    </section>
  );
}
