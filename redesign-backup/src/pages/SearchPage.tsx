import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { SearchX } from 'lucide-react';
import { SearchBox } from '../components/property/SearchBox';
import { PropertyCard, PropertyCardSkeleton } from '../components/property/PropertyCard';
import { EmptyState, Tabs } from '../components/ui/misc';
import { Button } from '../components/ui/Button';
import { useAsync } from '../lib/useAsync';
import { properties, type PropertyReport } from '../api/client';
import type { PropertyType, StateCode } from '../api/types';

const TYPES: (PropertyType | 'all')[] = ['all', 'House', 'Plot', 'Farm land', 'Shop', 'Office'];
const STATES: { id: StateCode | 'all'; label: string }[] = [
  { id: 'all', label: 'All states' },
  { id: 'CH', label: 'Chandigarh' },
  { id: 'TN', label: 'Tamil Nadu' },
  { id: 'BR', label: 'Bihar' },
];
type Sort = 'relevant' | 'value' | 'problems';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const state = (params.get('state') ?? 'all') as StateCode | 'all';
  const type = (params.get('type') ?? 'all') as PropertyType | 'all';
  const sort = (params.get('sort') ?? 'relevant') as Sort;

  const { data, loading } = useAsync(() => properties.search(q, { state, type }), [q, state, type]);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'all' || value === 'relevant' || !value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const sorted = useMemo(() => {
    if (!data) return [];
    const rank = { risky: 0, caution: 1, safe: 2 };
    const list = [...data];
    if (sort === 'value') list.sort((a, b) => b.valueEstimate - a.valueEstimate);
    if (sort === 'problems') list.sort((a, b) => rank[a.verdict] - rank[b.verdict]);
    return list;
  }, [data, sort]);

  const counts = useMemo(() => countVerdicts(data), [data]);

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <div className="max-w-3xl">
        <p className="eyebrow">Check a property</p>
        <h1 className="mt-4 text-5xl font-semibold leading-[1] sm:text-6xl">
          {q ? <>Results for <span className="serif-accent">“{q}”</span></> : <>Find any property.</>}
        </h1>
        <div className="mt-8">
          <SearchBox key={q} initial={q} size="md" showExamples={!q} />
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={TYPES.map((t) => ({ id: t, label: t === 'all' ? 'All types' : t }))} value={type} onChange={(v) => set('type', v)} />
        <div className="flex flex-wrap items-center gap-3">
          <select value={state} onChange={(e) => set('state', e.target.value)} className="h-10 cursor-pointer rounded-full border border-line bg-white px-4 text-sm focus:outline-none" aria-label="State">
            {STATES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => set('sort', e.target.value)} className="h-10 cursor-pointer rounded-full border border-line bg-white px-4 text-sm focus:outline-none" aria-label="Sort">
            <option value="relevant">Most relevant</option>
            <option value="value">Highest value</option>
            <option value="problems">Problems first</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mute">
        {loading ? <span className="skeleton h-4 w-40" /> : (
          <>
            <span><strong className="font-medium text-ink">{data?.length ?? 0}</strong> {data?.length === 1 ? 'property' : 'properties'}</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-ok" />{counts.safe} clean</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warn" />{counts.caution} to check</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-bad" />{counts.risky} with problems</span>
          </>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <PropertyCardSkeleton key={i} />)}</div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-6" />}
            title="No properties found"
            body="Check the spelling, or try a plot number like “104-B”, a survey number like “341/1”, or an owner’s name."
            action={<Button variant="outline" onClick={() => setParams({})}>Clear search</Button>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p, i) => (
              <div key={p.id} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                <PropertyCard p={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function countVerdicts(list?: PropertyReport[]) {
  const c = { safe: 0, caution: 0, risky: 0 };
  list?.forEach((p) => c[p.verdict]++);
  return c;
}
