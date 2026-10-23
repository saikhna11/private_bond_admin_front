import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('size-8 shrink-0', className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M9 21.5 14 16l3.5 3.2L23 12"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      />
      <circle cx="23" cy="12" r="2.2" className="fill-gold" />
    </svg>
  );
}

export function Logo({
  className,
  inverted = false,
  subtitle = 'Удирдлагын самбар',
}: {
  className?: string;
  inverted?: boolean;
  subtitle?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'text-[15px] font-semibold tracking-tight',
            inverted ? 'text-white' : 'text-foreground',
          )}
        >
          Ulzii &amp; Co
        </span>
        <span
          className={cn(
            'mt-1 text-[11px] font-medium uppercase tracking-[0.14em]',
            inverted ? 'text-white/60' : 'text-muted-foreground',
          )}
        >
          {subtitle}
        </span>
      </span>
    </span>
  );
}
