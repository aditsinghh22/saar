import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Building2, CircleCheck, Clock, FileWarning, Filter, IndianRupee, Link2, Send } from 'lucide-react';
import { useAsync } from '../lib/useAsync';
import { office } from '../api/client';
import type { Issue } from '../api/types';
import { Badge, Dot } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, Skeleton, Tabs } from '../components/ui/misc';
import { formatDate, formatMoney } from '../lib/format';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';

type IssueFilter = 'all' | Issue['status'];

function BarChart({ data, format, label }: { data: { x: string; y: number }[]; format: (n: number) => string; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  // Round the axis up to a clean round value so ticks read nicely.
  const raw = Math.max(...data.map((d) => d.y)) * 1.1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const max = ([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * mag >= raw) ?? 10) * mag;
  const ticks = [0, 0.5, 1].map((t) => max * t);
  return (
    <div className="relative">
      <div className="relative h-52" role="img" aria-label={label}>
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${(t / max) * 100}%` }}>
            <span className="w-10 -translate-y-1/2 text-right font-mono text-[10px] text-faint">{format(t)}</span>
            <span className="h-px flex-1 -translate-y-1/2 bg-line" />
          </div>
        ))}
        <div className="absolute inset-y-0 left-12 right-0 flex items-end gap-[2px]">
          {data.map((d, i) => (
            <div
              key={d.x}
              className="relative flex h-full flex-1 cursor-default items-end justify-center"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className={`w-full max-w-10 rounded-t-[4px] transition-colors ${hover === null || hover === i ? 'bg-forest' : 'bg-forest/35'}`}
                style={{ height: `${(d.y / max) * 100}%` }}
              />
              {hover === i && (
                <div className="absolute z-10 -translate-y-2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white shadow-lg" style={{ bottom: `${(d.y / max) * 100}%` }}>
                  <span className="text-white/60">{d.x}</span> · <span className="font-medium">{format(d.y)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="ml-12 mt-2 flex gap-[2px]">
        {data.map((d, i) => (
          <span key={d.x} className={`flex-1 text-center text-xs ${i === data.length - 1 ? 'font-medium text-ink' : 'text-mute'}`}>{d.x}</span>
        ))}
      </div>
    </div>
  );
}

const PRIORITY_TONE = { High: 'bad', Medium: 'warn', Low: 'neutral' } as const;

export default function OfficePage() {
  const { user } = useSession();
  const notify = useToast();
  const { data: stats, reload: reloadStats } = useAsync(() => office.stats(), []);
  const { data: issues, loading, setData } = useAsync(() => office.issues(), []);
  const [filter, setFilter] = useState<IssueFilter>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const list = useMemo(() => {
    const rank = { High: 0, Medium: 1, Low: 2 };
    return (issues ?? []).filter((i) => filter === 'all' || i.status === filter).sort((a, b) => rank[a.priority] - rank[b.priority]);
  }, [issues, filter]);

  const act = async (issue: Issue, status: Issue['status']) => {
    setBusy(issue.id);
    const updated = await office.updateIssue(issue.id, status);
    setData((prev) => (prev ?? []).map((i) => (i.id === issue.id ? updated : i)));
    reloadStats();
    setBusy(null);
    notify(status === 'Notice sent' ? 'Notice sent to owner' : 'Marked as resolved', { body: `${issue.id} · ${issue.office}` });
  };

  const count = (s: Issue['status']) => issues?.filter((i) => i.status === s).length;

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-2"><Building2 className="size-3.5" /> {user?.office}</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1] sm:text-6xl">
            Good morning, <span className="serif-accent">{user?.name.split(' ')[0]}.</span>
          </h1>
        </div>
        <p className="text-mute">Data as of {formatDate(new Date().toISOString(), { day: 'numeric', month: 'long' })}, 6:00 AM</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Link2, label: 'Properties with linked records', value: stats?.recordsLinked.toLocaleString('en-IN'), tone: 'bg-white' },
          { icon: FileWarning, label: 'Records that don’t match', value: stats?.openIssues, tone: 'bg-white' },
          { icon: IndianRupee, label: 'Unpaid tax that can be recovered', value: stats && formatMoney(stats.moneyRecoverable), tone: 'bg-lime border-lime' },
          { icon: Clock, label: 'Average days to approve', value: stats && `${stats.avgDaysToApprove} days`, tone: 'bg-white' },
        ].map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className={`rounded-[2rem] border border-line p-7 ${tone}`}>
            <Icon className="size-5 text-ink-2" />
            {value === undefined ? <Skeleton className="mt-6 h-11 w-32" /> : <p className="mt-6 font-display text-4xl font-semibold tracking-tight">{value}</p>}
            <p className="mt-2 text-sm text-mute">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-7">
          <p className="font-medium">Applications approved each month</p>
          <p className="mt-1 text-sm text-mute">All offices, last 6 months</p>
          <div className="mt-8">{stats ? <BarChart label="Applications approved per month" data={stats.monthly.map((m) => ({ x: m.month, y: m.approved }))} format={(n) => Math.round(n).toLocaleString('en-IN')} /> : <Skeleton className="h-56" />}</div>
        </Card>
        <Card className="p-7">
          <p className="font-medium">Tax recovered each month</p>
          <p className="mt-1 text-sm text-mute">₹ lakh, from records fixed through Saar</p>
          <div className="mt-8">{stats ? <BarChart label="Tax recovered per month in lakh rupees" data={stats.monthly.map((m) => ({ x: m.month, y: m.recovered }))} format={(n) => `₹${n.toFixed(1)}L`} /> : <Skeleton className="h-56" />}</div>
        </Card>
        <Card className="p-7">
          <p className="font-medium">Pending by office</p>
          <p className="mt-1 text-sm text-mute">Files waiting · past deadline</p>
          <ul className="mt-6 space-y-4">
            {stats?.byOffice.map((o) => {
              const max = Math.max(...stats.byOffice.map((x) => x.pending));
              return (
                <li key={o.office}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate">{o.office}</span>
                    <span className="shrink-0 text-mute">
                      <span className="font-medium text-ink">{o.pending}</span>
                      {o.overdue > 0 && <span className="ml-2 text-bad">{o.overdue} late</span>}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-sand">
                    <div className="h-full rounded-full bg-forest" style={{ width: `${(o.pending / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-col gap-4 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Records to fix</h2>
            <p className="mt-1 text-mute">Found by comparing records across offices every night.</p>
          </div>
          <div className="flex items-center gap-3">
            <Filter className="size-4 text-mute" />
            <Tabs<IssueFilter>
              value={filter}
              onChange={setFilter}
              tabs={[
                { id: 'all', label: 'All', count: issues?.length },
                { id: 'Open', label: 'Open', count: count('Open') },
                { id: 'Notice sent', label: 'Notice sent', count: count('Notice sent') },
                { id: 'Resolved', label: 'Resolved', count: count('Resolved') },
              ]}
            />
          </div>
        </div>
        <div className="border-t border-line">
          {loading ? (
            <div className="space-y-3 p-7">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : (
            <ul className="divide-y divide-line">
              {list.map((i) => (
                <li key={i.id} className="grid gap-5 p-7 sm:px-9 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={PRIORITY_TONE[i.priority]}><Dot tone={PRIORITY_TONE[i.priority]} />{i.priority} priority</Badge>
                      <Badge>{i.kind}</Badge>
                      <span className="font-mono text-xs text-faint">{i.id} · found {formatDate(i.found)}</span>
                    </div>
                    <p className="mt-3 font-display text-xl font-semibold tracking-tight">{i.title}</p>
                    <p className="mt-1 max-w-3xl text-mute">{i.detail}</p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
                      <span>Office: {i.office}</span>
                      {i.lossPerYear > 0 && <span>Tax lost: <strong className="font-medium">{formatMoney(i.lossPerYear)}/year</strong></span>}
                      <Link to={`/property/${i.propertyId}`} className="inline-flex items-center gap-1 text-forest hover:underline">View property <ArrowUpRight className="size-3.5" /></Link>
                    </div>
                  </div>
                  <div className="flex gap-2 lg:flex-col lg:items-stretch">
                    {i.status === 'Resolved' ? (
                      <Badge tone="ok" className="px-3.5 py-2"><CircleCheck className="size-4" /> Resolved</Badge>
                    ) : (
                      <>
                        {i.status === 'Open' && (
                          <Button size="sm" loading={busy === i.id} onClick={() => act(i, 'Notice sent')} icon={<Send className="size-3.5" />}>
                            Send notice
                          </Button>
                        )}
                        {i.status === 'Notice sent' && <Badge tone="info" className="justify-center px-3.5 py-2"><Clock className="size-4" /> Waiting for reply</Badge>}
                        <Button size="sm" variant="outline" disabled={busy === i.id} onClick={() => act(i, 'Resolved')}>Mark resolved</Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
