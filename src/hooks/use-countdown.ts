import { useEffect, useState } from 'react';

/** Seconds left until `until` (epoch ms), ticking every second; 0 once past. */
export function useCountdown(until: number | null | undefined): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!until) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [until]);

  if (!until) return 0;
  return Math.max(0, Math.ceil((until - now) / 1000));
}
