import { shopConfig } from '@/lib/shop';

export function todayInKolkata(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: shopConfig.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value);
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: shopConfig.timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: shopConfig.timezone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: shopConfig.timezone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
