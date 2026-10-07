import { shopConfig } from '../config/shop';
import { shopLocalToUtc } from './timezone';

export function getKolkataDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: shopConfig.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
}

export function getKolkataDayRange(
  dateKey: string,
): { start: Date; end: Date } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const start = shopLocalToUtc(dateKey);
  const nextDate = new Date(`${dateKey}T00:00:00.000Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const end = shopLocalToUtc(nextDate.toISOString().slice(0, 10));
  if (Number.isNaN(start.getTime()) || getKolkataDateKey(start) !== dateKey)
    return null;
  return { start, end };
}
