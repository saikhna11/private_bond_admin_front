import * as z from 'zod';
import fetchAndValidate, { adminApi, toApiError } from '@/lib/fetcher';
import { listQuery, PAGE_SIZE, pageSchema } from '@/lib/types';
import {
  ContractProductSchema,
  ContractVariableSchema,
  type FieldMappingBody,
  TemplateDetailSchema,
  type TemplateFilters,
  TemplateSummarySchema,
  type UploadTemplateBody,
} from './type';

// An upload carries a .docx of up to 5 MB, base64-encoded.
const uploadTimeout = 60_000;

export const getContractProducts = () =>
  fetchAndValidate('contract-products', z.array(ContractProductSchema));

export const getContractVariables = () =>
  fetchAndValidate('contract-variables', z.array(ContractVariableSchema));

export const getTemplates = (f: TemplateFilters) =>
  fetchAndValidate(
    `contract-templates${listQuery({ page: f.page, size: PAGE_SIZE, status: f.status, product: f.product })}`,
    pageSchema(TemplateSummarySchema),
  );

export const getTemplate = (id: string) =>
  fetchAndValidate(`contract-templates/${id}`, TemplateDetailSchema);

export const uploadTemplate = (body: UploadTemplateBody) =>
  fetchAndValidate('contract-templates', TemplateDetailSchema, {
    method: 'POST',
    body,
    timeout: uploadTimeout,
  });

export const replaceTemplateFile = (id: string, file: string) =>
  fetchAndValidate(`contract-templates/${id}/file`, TemplateDetailSchema, {
    method: 'PUT',
    body: { file },
    timeout: uploadTimeout,
  });

export const mapTemplateFields = (id: string, fields: FieldMappingBody[]) =>
  fetchAndValidate(`contract-templates/${id}/fields`, TemplateDetailSchema, {
    method: 'PUT',
    body: { fields },
  });

export const activateTemplate = (id: string) =>
  fetchAndValidate(`contract-templates/${id}/activate`, TemplateDetailSchema, {
    method: 'POST',
  });

export const deactivateTemplate = (id: string) =>
  fetchAndValidate(
    `contract-templates/${id}/deactivate`,
    TemplateDetailSchema,
    { method: 'POST' },
  );

export const deleteTemplate = (id: string) =>
  fetchAndValidate(`contract-templates/${id}`, undefined, { method: 'DELETE' });

/** The template's .docx, as stored after the upload. */
export async function downloadTemplate(id: string): Promise<Blob> {
  try {
    const res = await adminApi.client.get<Blob>(
      `contract-templates/${id}/file`,
      { responseType: 'blob' },
    );
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}
