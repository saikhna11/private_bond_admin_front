import { Outlet } from '@tanstack/react-router';
import {
  BriefcaseIcon,
  type LucideIcon,
  ShieldCheckIcon,
  UserCheckIcon,
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/common/theme-toggle';

export interface Highlight {
  Icon: LucideIcon;
  title: string;
  text: string;
}

const adminHighlights: Highlight[] = [
  {
    Icon: UserCheckIcon,
    title: 'Харилцагчийн шалгалт',
    text: 'Бүртгэлийн хүсэлтийг шалгаж, баталгаажуулах эсвэл татгалзах.',
  },
  {
    Icon: BriefcaseIcon,
    title: 'Брокер, ажилтны удирдлага',
    text: 'Брокер, админы бүртгэл, эрх, нууц үгийг нэг дороос удирдах.',
  },
  {
    Icon: ShieldCheckIcon,
    title: 'Хяналттай нэвтрэлт',
    text: 'Нэвтрэлт бүр бүртгэгдэж, хүссэн үедээ дуусгах боломжтой.',
  },
];

/** The sign-in screen; the admin panel's texts unless props give another panel's. */
export function PublicLayout({
  eyebrow = 'Зөвхөн ажилтанд',
  heading = 'Хувийн бондын платформын удирдлага',
  highlights = adminHighlights,
}: {
  eyebrow?: string;
  heading?: string;
  highlights?: Highlight[];
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-brand-panel to-brand-panel-2 text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
        <div className="absolute -right-32 -bottom-32 size-[28rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-14">
          <Logo inverted />
          <div className="max-w-md space-y-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                {eyebrow}
              </p>
              <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance xl:text-[2.75rem]">
                {heading}
              </h1>
            </div>
            <ul className="space-y-5">
              {highlights.map(({ Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Icon className="size-5 text-gold" />
                  </span>
                  <span>
                    <span className="block font-medium">{title}</span>
                    <span className="block text-sm text-white/65">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Ulzii &amp; Co. Бүх эрх хуулиар
            хамгаалагдсан.
          </p>
        </div>
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-start justify-center px-4 pt-4 pb-12 sm:items-center sm:px-8">
          <div className="w-full max-w-[26rem]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
