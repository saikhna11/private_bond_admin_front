import * as z from 'zod';
import fetchAndValidate from '@/lib/fetcher';
import { type CustomVariableBody, CustomVariableSchema } from './type';

export const getCustomVariables = () =>
  fetchAndValidate('contract-custom-variables', z.array(CustomVariableSchema));

export const createCustomVariable = (body: CustomVariableBody) =>
  fetchAndValidate('contract-custom-variables', CustomVariableSchema, {
    method: 'POST',
    body,
  });

export const updateCustomVariable = (id: string, body: CustomVariableBody) =>
  fetchAndValidate(`contract-custom-variables/${id}`, CustomVariableSchema, {
    method: 'PUT',
    body,
  });

export const deleteCustomVariable = (id: string) =>
  fetchAndValidate(`contract-custom-variables/${id}`, undefined, {
    method: 'DELETE',
  });
