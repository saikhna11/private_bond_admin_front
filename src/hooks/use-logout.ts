import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { adminApi, brokerApi } from '@/lib/fetcher';
import { logout } from '@/queries/auth/query';
import { brokerLogout } from '@/queries/broker-panel/query';

const panels = {
  admin: { api: adminApi, logout, login: '/login' },
  broker: { api: brokerApi, logout: brokerLogout, login: '/broker/login' },
} as const;

export function useLogout(panel: keyof typeof panels = 'admin') {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCallback(async () => {
    const p = panels[panel];
    p.api.cancelRefresh();
    try {
      await p.logout();
    } catch {
      // 204 even without a session; a network error still leaves locally.
    }
    queryClient.clear();
    await navigate({ to: p.login });
  }, [panel, queryClient, navigate]);
}
