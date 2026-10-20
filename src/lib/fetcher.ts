import axios from 'axios';
import type * as z from 'zod';

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
  // Session lives in an httpOnly cookie set by the backend.
  withCredentials: true,
});

let onUnauthorized: (() => void) | undefined;

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default async function fetchAndValidate<T>(
  url: string,
  schema: z.ZodType<T> | undefined,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    /** Per-request timeout in ms; overrides the client default (20s). */
    timeout?: number;
  },
): Promise<T> {
  try {
    const res = await apiClient.request({
      url,
      method: options?.method ?? 'GET',
      headers: options?.headers,
      data: options?.body,
      timeout: options?.timeout,
    });

    if (!schema) {
      return res.data as T;
    }

    const result = schema.safeParse(res.data);
    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data;
      // TODO: align with backend error body.
      const message =
        (data as { error?: string } | undefined)?.error ?? err.message;
      throw new ApiError(message, err.response?.status ?? 0, data);
    }
    throw err;
  }
}
