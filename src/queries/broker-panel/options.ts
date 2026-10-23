import { queryOptions } from '@tanstack/react-query';
import { getBrokerMe, getBrokerSessions } from './query';

/** The broker panel's keys, apart from the admin panel's. */
export const brokerPanelKeys = {
  all: ['broker-panel'] as const,
  me: () => [...brokerPanelKeys.all, 'me'] as const,
  sessions: () => [...brokerPanelKeys.all, 'sessions'] as const,
};

export function brokerMeOptions() {
  return queryOptions({
    queryKey: brokerPanelKeys.me(),
    queryFn: getBrokerMe,
    staleTime: 1000 * 60 * 5,
  });
}

export function brokerSessionsOptions() {
  return queryOptions({
    queryKey: brokerPanelKeys.sessions(),
    queryFn: getBrokerSessions,
    staleTime: 1000 * 30,
  });
}
