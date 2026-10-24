import { useId } from 'react';
import logoDark from '@/assets/brand/ucc-logo-dark.webp';
import logoLight from '@/assets/brand/ucc-logo-light.webp';
import { cn } from '@/lib/utils';

/** The two copper "II" pillars from the Ulzii & Co Capital wordmark. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="-117.5 0 500 500"
      aria-hidden="true"
      className={cn('size-8 shrink-0', className)}
    >
      <defs>
        <linearGradient
          id={id}
          x1="0"
          y1="500"
          x2="265"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#a84028" />
          <stop offset="0.3" stopColor="#c05828" />
          <stop offset="0.5" stopColor="#f19670" />
          <stop offset="0.75" stopColor="#c05828" />
          <stop offset="1" stopColor="#e8875f" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        fillRule="evenodd"
        d="M0 75 103 45v455H5ZM35 100l33-9v376H39ZM165 28 265 0v500H165ZM198 52l33-7v422h-33Z"
      />
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
    <span className={cn('inline-flex items-center', className)}>
      {/* Only shown when the sidebar collapses to icons. */}
      <LogoMark className="hidden group-data-[collapsible=icon]:block" />
      <span className="inline-flex items-center gap-3">
        <img
          src={logoLight}
          alt="Ulzii & Co Capital"
          className={cn('h-8 w-auto dark:hidden', inverted && 'hidden')}
        />
        <img
          src={logoDark}
          alt="Ulzii & Co Capital"
          className={cn('h-8 w-auto', inverted ? 'h-11' : 'hidden dark:block')}
        />
        <span
          className={cn(
            'border-l pl-3 text-[11px] leading-tight font-medium uppercase tracking-[0.14em]',
            inverted
              ? 'border-white/20 text-white/60'
              : 'border-border text-muted-foreground',
          )}
        >
          {subtitle}
        </span>
      </span>
    </span>
  );
}
