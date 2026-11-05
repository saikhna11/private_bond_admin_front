import type { ReactNode } from 'react';

export function BondFormSection({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 py-8 first:pt-0 last:pb-0">
      {children}
    </div>
  );
}
