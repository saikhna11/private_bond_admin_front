const UB = 'Asia/Ulaanbaatar';

// mn-MN is missing from many browsers' locale data: build the parts by hand.
const parts = new Intl.DateTimeFormat('en-GB', {
  timeZone: UB,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function pieces(value: string) {
  const p = Object.fromEntries(
    parts.formatToParts(new Date(value)).map((x) => [x.type, x.value]),
  );
  return p as Record<'year' | 'month' | 'day' | 'hour' | 'minute', string>;
}

/** RFC 3339 UTC from the API, shown in Ulaanbaatar time: 2026.10.22 14:05. */
export function formatDateTime(value?: string | null): string {
  if (!value) return '';
  const p = pieces(value);
  return `${p.year}.${p.month}.${p.day} ${p.hour}:${p.minute}`;
}

/** 2026.10.22 in Ulaanbaatar time. */
export function formatDate(value?: string | null): string {
  if (!value) return '';
  const p = pieces(value);
  return `${p.year}.${p.month}.${p.day}`;
}

/** "4:59" for a countdown in seconds. */
export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.ceil(total));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** What the session list calls this browser, such as "Chrome, Windows". */
export function deviceName(): string {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Хөтөч';
  const os = /Windows/.test(ua)
    ? 'Windows'
    : /Android/.test(ua)
      ? 'Android'
      : /iPhone|iPad|iPod/.test(ua)
        ? 'iOS'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : '';
  return os ? `${browser}, ${os}` : browser;
}
