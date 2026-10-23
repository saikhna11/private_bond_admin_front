import { createFileRoute, redirect } from '@tanstack/react-router';
import { BriefcaseIcon, KeyRoundIcon, ShieldCheckIcon } from 'lucide-react';
import {
  type Highlight,
  PublicLayout,
} from '@/components/layout/public-layout';
import { brokerPanelKeys } from '@/queries/broker-panel/options';

const highlights: Highlight[] = [
  {
    Icon: BriefcaseIcon,
    title: 'Өөрийн харилцагчид',
    text: 'Танд хуваарилагдсан харилцагчдыг нэг дороос харах.',
  },
  {
    Icon: KeyRoundIcon,
    title: 'Бүртгэлийн удирдлага',
    text: 'Нууц үгээ солих, хувийн мэдээллээ харах.',
  },
  {
    Icon: ShieldCheckIcon,
    title: 'Хяналттай нэвтрэлт',
    text: 'Нэвтрэлт бүр бүртгэгдэж, хүссэн үедээ дуусгах боломжтой.',
  },
];

export const Route = createFileRoute('/broker/_public')({
  beforeLoad: ({ context }) => {
    // Cache only: no /me request from the login page.
    if (context.queryClient.getQueryData(brokerPanelKeys.me())) {
      throw redirect({ to: '/broker' });
    }
  },
  component: () => (
    <PublicLayout
      eyebrow="Зөвхөн брокерт"
      heading="Хувийн бондын платформын брокерын самбар"
      highlights={highlights}
    />
  ),
});
