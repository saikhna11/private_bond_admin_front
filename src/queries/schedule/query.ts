import fetchAndValidate from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  ContractScheduleSchema,
  DuePayoutSchema,
  type EditScheduleRowBody,
  IssuerScheduleListSchema,
  ScheduleEditListSchema,
} from './type';

const DuePayoutPageSchema = pageSchema(DuePayoutSchema);

export const getContractSchedule = (id: string) =>
  fetchAndValidate(`contracts/${id}/schedule`, ContractScheduleSchema);

/** Edits an unpaid row (bond.md 9.4); a paid or paying one answers schedule.row_paid. */
export const editScheduleRow = (
  id: string,
  row: number,
  body: EditScheduleRowBody,
) =>
  fetchAndValidate(`contracts/${id}/schedule/${row}`, ContractScheduleSchema, {
    method: 'PUT',
    body,
  });

export const getScheduleEdits = (id: string) =>
  fetchAndValidate(`contracts/${id}/schedule/edits`, ScheduleEditListSchema);

/** The rows due on or before asOf (today when left out) that no payout pays yet. */
export const getDuePayouts = (page?: number, asOf?: string) =>
  fetchAndValidate(
    `payouts${listQuery({ page, size: PAGE_SIZE, as_of: asOf })}`,
    DuePayoutPageSchema,
  );

export const getIssuerSchedules = (from: string, to: string) =>
  fetchAndValidate(
    `issuer-schedules${listQuery({ from, to })}`,
    IssuerScheduleListSchema,
  );
