import axios, { type AxiosRequestConfig } from 'axios';
import type * as z from 'zod';

/** One field error of the API's problem body. */
export interface FieldProblem {
  location: string;
  message: string;
}

/** Every API error, parsed from application/problem+json. Branch on `code`. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly errors: FieldProblem[];
  /** Seconds from Retry-After (429, a locked account). */
  readonly retryAfter?: number;

  constructor(init: {
    message: string;
    status: number;
    code: string;
    requestId?: string;
    errors?: FieldProblem[];
    retryAfter?: number;
  }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.requestId = init.requestId;
    this.errors = init.errors ?? [];
    this.retryAfter = init.retryAfter;
  }
}

interface ProblemBody {
  status?: number;
  title?: string;
  code?: string;
  detail?: string;
  request_id?: string;
  errors?: FieldProblem[];
}

// Calls that must never trigger a refresh: they either sign in or are the refresh.
const NO_REFRESH = ['auth/login', 'auth/refresh', 'auth/logout'];

// The access cookie lives 15 minutes (JWT_ACCESS_TTL); the API does not say when it
// expires, so refresh a minute early.
const REFRESH_EVERY_MS = 14 * 60_000;

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** Per-request timeout in ms; overrides the client default (20s). */
  timeout?: number;
};

/**
 * One panel's API: its base URL and its own refresh. The admin and broker panels have
 * separate cookies, so each refreshes on its own, under its own Web Lock.
 */
function createApi(baseURL: string, lockName: string) {
  const client = axios.create({
    baseURL,
    timeout: 20000,
    // Access and refresh cookies are HttpOnly and set by the API.
    withCredentials: true,
  });

  let onUnauthorized: (() => void) | undefined;
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;
  let refreshing: Promise<boolean> | undefined;

  /** Refreshes shortly before the access cookie expires. */
  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      void refreshSession();
    }, REFRESH_EVERY_MS);
  }

  function cancelRefresh() {
    clearTimeout(refreshTimer);
  }

  async function doRefresh(): Promise<boolean> {
    try {
      await client.post('auth/refresh');
      scheduleRefresh();
      return true;
    } catch {
      cancelRefresh();
      return false;
    }
  }

  /**
   * Trades the refresh cookie for new cookies. One refresh at a time per tab (a shared
   * promise) and across tabs (a Web Lock): two refreshes with the same cookie end the
   * session.
   */
  function refreshSession(): Promise<boolean> {
    if (!refreshing) {
      const run =
        typeof navigator !== 'undefined' && navigator.locks
          ? navigator.locks.request(lockName, doRefresh)
          : doRefresh();
      refreshing = run.finally(() => {
        refreshing = undefined;
      });
    }
    return refreshing;
  }

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        return Promise.reject(error);
      }
      const config = error.config as RetriableConfig | undefined;
      const url = config?.url ?? '';
      const code = (error.response.data as ProblemBody | undefined)?.code;

      if (
        config &&
        code === 'auth.unauthenticated' &&
        !config._retried &&
        !NO_REFRESH.some((p) => url.startsWith(p))
      ) {
        config._retried = true;
        if (await refreshSession()) {
          return client.request(config);
        }
        onUnauthorized?.();
      }
      return Promise.reject(error);
    },
  );

  async function fetchAndValidate<T>(
    url: string,
    schema: z.ZodType<T> | undefined,
    options?: FetchOptions,
  ): Promise<T> {
    try {
      const res = await client.request({
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
      throw toApiError(err);
    }
  }

  return {
    client,
    fetchAndValidate,
    scheduleRefresh,
    cancelRefresh,
    refreshSession,
    setOnUnauthorized(handler: () => void) {
      onUnauthorized = handler;
    },
  };
}

export type PanelApi = ReturnType<typeof createApi>;

/** The admin panel's API (`/api/admin`). */
export const adminApi = createApi(
  import.meta.env.VITE_API_URL,
  'admin-refresh',
);

/** The broker panel's API (`/api/broker`), at /broker in this app. */
export const brokerApi = createApi(
  import.meta.env.VITE_BROKER_API_URL,
  'broker-refresh',
);

export const {
  scheduleRefresh,
  cancelRefresh,
  refreshSession,
  setOnUnauthorized,
} = adminApi;

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (axios.isAxiosError(err)) {
    const data = (err.response?.data ?? {}) as ProblemBody;
    const retry = Number(err.response?.headers?.['retry-after']);
    if (!err.response) {
      return new ApiError({
        message:
          'Сервертэй холбогдож чадсангүй. Сүлжээгээ шалгаад дахин оролдоно уу.',
        status: 0,
        code: 'network.unreachable',
      });
    }
    return new ApiError({
      message: data.detail ?? data.title ?? 'Алдаа гарлаа. Дахин оролдоно уу.',
      status: err.response.status,
      code: data.code ?? 'unknown',
      requestId:
        data.request_id ?? err.response.headers?.['x-request-id'] ?? undefined,
      errors: data.errors,
      retryAfter: Number.isFinite(retry) && retry > 0 ? retry : undefined,
    });
  }
  return new ApiError({
    message: err instanceof Error ? err.message : 'Алдаа гарлаа.',
    status: 0,
    code: 'unknown',
  });
}

export default adminApi.fetchAndValidate;
