import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronRight, FilePlus2, Inbox } from 'lucide-react';
import { useAsync } from '../lib/useAsync';
import { applications } from '../api/client';
import type { Application } from '../api/types';
import { StatusBadge } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import { EmptyState, Skeleton, Tabs } from '../components/ui/misc';
import { formatDate } from '../lib/format';

type Filter = 'all' | 'active' | 'action' | 'closed';

const isActive = (a: Application) => !['Approved', 'Rejected'].includes(a.status);

export default function ApplicationsPage() {
  const { data, loading } = useAsync(() => applications.list(), []);
  const [filter, setFilter] = useState<Filter>('all');

  const list = useMemo(() => {
    if (!data) return [];
    if (filter === 'active') return data.filter(isActive);
    if (filter === 'action') return data.filter((a) => a.status === 'Needs info');
    if (filter === 'closed') return data.filter((a) => !isActive(a));
    return data;
  }, [data, filter]);

  const needsAction = data?.filter((a) => a.status === 'Needs info') ?? [];

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">My applications</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1] sm:text-6xl">
            Where your files <span className="serif-accent">are right now.</span>
          </h1>
        </div>
        <ButtonLink to="/applications/new" icon={<FilePlus2 className="size-4" />}>New application</ButtonLink>
      </div>

      {needsAction.length > 0 && (
        <Link to={`/applications/${needsAction[0].id}`} className="group mt-10 flex flex-col gap-3 rounded-3xl bg-warn-soft p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-warn">Action needed</p>
            <p className="mt-1 text-ink-2">{needsAction[0].steps.find((s) => s.state === 'current')?.note}</p>
          </div>
          <span className="flex items-center gap-2 font-medium">
            Respond <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      <div className="mt-10">
        <Tabs<Filter>
          value={filter}
          onChange={setFilter}
          className="w-fit"
          tabs={[
            { id: 'all', label: 'All', count: data?.length },
            { id: 'active', label: 'In progress', count: data?.filter(isActive).length },
            { id: 'action', label: 'Needs my action', count: needsAction.length },
            { id: 'closed', label: 'Closed' },
          ]}
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28" />)}</div>
        ) : list.length === 0 ? (
          <EmptyState icon={<Inbox className="size-6" />} title="Nothing here" body="No applications match this filter." />
        ) : (
          <ul className="space-y-3">
            {list.map((a) => {
              const done = a.steps.filter((s) => s.state === 'done').length;
              const current = a.steps.find((s) => s.state === 'current');
              return (
                <li key={a.id}>
                  <Link to={`/applications/${a.id}`} className="group grid gap-5 rounded-3xl border border-line bg-white p-6 transition hover:border-stone hover:shadow-sm md:grid-cols-[1.4fr_1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs text-mute">{a.id}</span>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="mt-2 font-display text-xl font-semibold tracking-tight">{a.type}</p>
                      <p className="mt-1 text-sm text-mute">Submitted {formatDate(a.submitted)} · by {a.applicant}</p>
                    </div>
                    <div>
                      <div className="flex gap-1">
                        {a.steps.map((s, i) => (
                          <span key={i} className={`h-1.5 flex-1 rounded-full ${s.state === 'done' ? (a.status === 'Rejected' ? 'bg-bad' : 'bg-forest') : s.state === 'current' ? (a.status === 'Needs info' ? 'bg-warn' : 'bg-forest/35') : 'bg-sand'}`} />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-ink-2">{current ? current.label : a.status === 'Approved' ? 'Completed' : 'Closed'}</p>
                      <p className="text-xs text-faint">{isActive(a) ? `Step ${done + 1} of ${a.steps.length} · expected by ${formatDate(a.expectedBy)}` : `Closed ${formatDate(a.steps[a.steps.length - 1].date)}`}</p>
                    </div>
                    <ChevronRight className="hidden size-5 text-mute transition group-hover:translate-x-0.5 md:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
