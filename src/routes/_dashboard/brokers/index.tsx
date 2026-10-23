import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import * as z from 'zod';
import { StaffManager } from '@/components/staff/staff-manager';
import { brokerKeys, brokersOptions } from '@/queries/broker/options';
import {
  blockBroker,
  createBroker,
  deleteBroker,
  resetBrokerPassword,
  unblockBroker,
  updateBroker,
} from '@/queries/broker/query';
import type { StaffFilters } from '@/queries/broker/type';

const staffSearchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  status: z.enum(['active', 'inactive']).optional().catch(undefined),
});

export const Route = createFileRoute('/_dashboard/brokers/')({
  validateSearch: staffSearchSchema,
  component: BrokersPage,
  staticData: { crumb: 'Брокерууд' },
});

function BrokersPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useQuery(brokersOptions(search));
  const onFilters = useCallback(
    (patch: Partial<StaffFilters>) =>
      navigate({
        search: (prev) => ({
          ...prev,
          ...patch,
          page: 'page' in patch ? patch.page : undefined,
        }),
      }),
    [navigate],
  );

  return (
    <StaffManager
      title="Брокерууд"
      description="Брокерууд өөрийн самбараар нэвтэрнэ. Харилцагч хуваарилах нь удахгүй нэмэгдэнэ."
      noun="брокер"
      withPosition
      filters={search}
      onFilters={onFilters}
      query={query}
      queryKey={brokerKeys.all}
      deleteNote="Брокерын бүртгэл бүрмөсөн устана. Харилцагч хуваарилагдсан брокерыг устгах боломжгүй."
      actions={{
        create: (v) =>
          createBroker({
            email: v.email,
            phone: v.phone,
            last_name: v.last_name,
            first_name: v.first_name,
            position: v.position || undefined,
            password: v.password,
          }),
        update: (id, v) =>
          updateBroker(id, {
            last_name: v.last_name,
            first_name: v.first_name,
            position: v.position || undefined,
          }),
        block: blockBroker,
        unblock: unblockBroker,
        resetPassword: resetBrokerPassword,
        remove: deleteBroker,
      }}
    />
  );
}
