import fetchAndValidate, { adminApi, toApiError } from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  type BondBody,
  BondDetailSchema,
  type BondFileKind,
  BondFileSchema,
  type BondFilters,
  BondSchema,
  type ManualState,
  type RateOptionBody,
} from './type';

// An upload carries a file of up to 20 MB, base64-encoded.
const uploadTimeout = 120_000;

export const getBonds = (f: BondFilters) =>
  fetchAndValidate(
    `bonds${listQuery({ page: f.page, size: PAGE_SIZE, q: f.q, issuer: f.issuer, status: f.status, from: f.from, to: f.to })}`,
    pageSchema(BondSchema),
  );

export const getBond = (id: string) =>
  fetchAndValidate(`bonds/${id}`, BondDetailSchema);

export const createBond = (
  body: BondBody & { rate_options: RateOptionBody[] },
) => fetchAndValidate('bonds', BondDetailSchema, { method: 'POST', body });

export const updateBond = (id: string, body: BondBody) =>
  fetchAndValidate(`bonds/${id}`, BondDetailSchema, { method: 'PUT', body });

export const setBondState = (id: string, state: ManualState) =>
  fetchAndValidate(`bonds/${id}/state`, BondDetailSchema, {
    method: 'POST',
    body: { state },
  });

/** Turns down an issuer's request with reason, which the issuer reads. */
export const rejectBond = (id: string, reason: string) =>
  fetchAndValidate(`bonds/${id}/reject`, BondDetailSchema, {
    method: 'POST',
    body: { reason },
  });

export const addRateOption = (id: string, body: RateOptionBody) =>
  fetchAndValidate(`bonds/${id}/rate-options`, BondDetailSchema, {
    method: 'POST',
    body,
  });

export const updateRateOption = (
  id: string,
  optionId: string,
  body: RateOptionBody,
) =>
  fetchAndValidate(`bonds/${id}/rate-options/${optionId}`, BondDetailSchema, {
    method: 'PUT',
    body,
  });

export const deleteRateOption = (id: string, optionId: string) =>
  fetchAndValidate(`bonds/${id}/rate-options/${optionId}`, BondDetailSchema, {
    method: 'DELETE',
  });

export const uploadBondFile = (
  id: string,
  body: { kind: BondFileKind; file_name: string; content: string },
) =>
  fetchAndValidate(`bonds/${id}/files`, BondFileSchema, {
    method: 'POST',
    body,
    timeout: uploadTimeout,
  });

export const deleteBondFile = (id: string, fileId: string) =>
  fetchAndValidate(`bonds/${id}/files/${fileId}`, undefined, {
    method: 'DELETE',
  });

/** A bond's file, as it was uploaded. */
export async function downloadBondFile(
  id: string,
  fileId: string,
): Promise<Blob> {
  try {
    const res = await adminApi.client.get<Blob>(`bonds/${id}/files/${fileId}`, {
      responseType: 'blob',
    });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}
