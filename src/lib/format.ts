import type { Verdict } from '../api/types';

/** ₹2.45 Cr, ₹45 L, ₹48,000 */
export function formatMoney(n: number): string {
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

const trim = (n: number) => n.toFixed(2).replace(/\.?0+$/, '');

export function formatDate(iso?: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', opts);
}

export function timeAgo(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.round(days / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

/** 10CH0220010401 → 10CH-0220-0104-01 */
export function formatPropertyId(id: string) {
  return `${id.slice(0, 4)}-${id.slice(4, 8)}-${id.slice(8, 12)}-${id.slice(12)}`;
}

export const sqmToSqft = (m: number) => Math.round(m * 10.7639);

export const VERDICT_COPY: Record<Verdict, { label: string; short: string; tone: 'ok' | 'warn' | 'bad' }> = {
  safe: { label: 'Clean record', short: 'Clean', tone: 'ok' },
  caution: { label: 'Check before you buy', short: 'Check', tone: 'warn' },
  risky: { label: 'Problems found', short: 'Problems', tone: 'bad' },
};

export const LAND_USE_COLOR: Record<string, string> = {
  Residential: '#F4C95D',
  Commercial: '#E8845C',
  Farming: '#9CC37A',
  'Mixed use': '#C79BD8',
  Public: '#7FB3D5',
};
