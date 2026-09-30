import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, CircleX, Clock } from 'lucide-react';
import type { ApplicationStatus, Verdict } from '../../api/types';
import { VERDICT_COPY } from '../../lib/format';

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral' | 'info' | 'dark';

const tones: Record<Tone, string> = {
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  bad: 'bg-bad-soft text-bad',
  neutral: 'bg-sand text-ink-2',
  info: 'bg-sky text-[#2B5B84]',
  dark: 'bg-ink text-white',
};

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

const verdictIcon = { ok: CircleCheck, warn: CircleAlert, bad: CircleX } as const;

export function VerdictBadge({ verdict, size = 'md' }: { verdict: Verdict; size?: 'md' | 'lg' }) {
  const copy = VERDICT_COPY[verdict];
  const Icon = verdictIcon[copy.tone];
  return (
    <Badge tone={copy.tone} className={size === 'lg' ? 'px-3.5 py-1.5 text-sm' : ''}>
      <Icon className={size === 'lg' ? 'size-4' : 'size-3.5'} />
      {copy.label}
    </Badge>
  );
}

const statusTone: Record<ApplicationStatus, Tone> = {
  Submitted: 'info',
  'In review': 'info',
  'Field visit': 'info',
  'Needs info': 'warn',
  Approved: 'ok',
  Rejected: 'bad',
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const tone = statusTone[status];
  return (
    <Badge tone={tone}>
      {tone === 'ok' ? <CircleCheck className="size-3.5" /> : tone === 'bad' ? <CircleX className="size-3.5" /> : tone === 'warn' ? <CircleAlert className="size-3.5" /> : <Clock className="size-3.5" />}
      {status}
    </Badge>
  );
}

export function Dot({ tone }: { tone: Tone }) {
  const c = { ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad', neutral: 'bg-faint', info: 'bg-[#2B5B84]', dark: 'bg-ink' }[tone];
  return <span className={`inline-block size-2 shrink-0 rounded-full ${c}`} />;
}
