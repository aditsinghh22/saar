import { useSearchParams } from 'react-router';
import { ArrowRight, Layers, MapPin, X } from 'lucide-react';
import { useAsync } from '../lib/useAsync';
import { maps } from '../api/client';
import { AreaMap, MapLegend, type ColorMode } from '../components/property/AreaMap';
import { VerdictBadge } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import { Skeleton, Tabs } from '../components/ui/misc';
import { formatMoney } from '../lib/format';

export default function MapPage() {
  const [params, setParams] = useSearchParams();
  const areaId = params.get('area') ?? 'sector-22';
  const plotId = params.get('plot') ?? undefined;
  const mode = (params.get('view') ?? 'use') as ColorMode;

  const { data: areas } = useAsync(() => maps.areas(), []);
  const { data, loading } = useAsync(() => maps.area(areaId), [areaId]);
  const selected = data?.plots.find((p) => p.id === plotId);

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Land map</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1] sm:text-6xl">
            Every plot, <span className="serif-accent">at a glance.</span>
          </h1>
        </div>
        <Tabs
          value={areaId}
          onChange={(id) => update({ area: id, plot: undefined })}
          tabs={(areas ?? []).map((a) => ({ id: a.id, label: `${a.name}, ${a.city}` }))}
        />
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-[#F1EDE3]">
          <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-full bg-white/95 p-1 shadow-sm backdrop-blur">
              <Layers className="ml-2 mr-1 size-4 text-mute" />
              {(['use', 'status'] as ColorMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => update({ view: m === 'use' ? undefined : m })}
                  className={`h-8 cursor-pointer rounded-full px-3.5 text-sm transition ${mode === m ? 'bg-ink text-white' : 'text-ink-2 hover:bg-sand'}`}
                >
                  {m === 'use' ? 'Land use' : 'Record status'}
                </button>
              ))}
            </div>
            <div className="rounded-full bg-white/95 px-4 py-2 shadow-sm backdrop-blur">
              <MapLegend mode={mode} />
            </div>
          </div>

          {loading || !data ? (
            <Skeleton className="aspect-[800/520] !rounded-none" />
          ) : (
            <AreaMap
              area={data.area}
              plots={data.plots}
              selectedId={plotId}
              colorBy={mode}
              onSelect={(p) => update({ plot: p.id === plotId ? undefined : p.id })}
              className="aspect-[800/520] pt-12"
            />
          )}

          {selected && (
            <div className="absolute bottom-4 left-4 right-4 z-10 flex animate-rise flex-col gap-4 rounded-3xl border border-line bg-white p-4 shadow-xl sm:right-auto sm:w-[420px] sm:flex-row">
              <img src={selected.image.replace('w=1200', 'w=400')} alt="" className="h-32 w-full rounded-2xl object-cover sm:h-auto sm:w-32" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-xl font-semibold">{selected.plotNo}</p>
                    <p className="text-sm text-mute">{selected.type} · {selected.areaLocal}</p>
                  </div>
                  <button onClick={() => update({ plot: undefined })} className="grid size-8 cursor-pointer place-items-center rounded-full hover:bg-sand" aria-label="Close">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="mt-3"><VerdictBadge verdict={selected.verdict} /></div>
                <ButtonLink to={`/property/${selected.id}`} size="sm" variant="dark" className="mt-4" iconRight={<ArrowRight className="size-3.5" />}>
                  Open report
                </ButtonLink>
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-[2rem] border border-line bg-white p-5">
          <div className="flex items-center justify-between px-2 pb-4">
            <p className="font-display text-lg font-semibold">{data?.area.name ?? '…'}</p>
            <span className="text-sm text-mute">{data?.plots.length ?? 0} plots on Saar</span>
          </div>
          <ul className="space-y-1">
            {loading
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16" />)
              : data?.plots.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => update({ plot: p.id })}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3 text-left transition ${p.id === plotId ? 'bg-mint' : 'hover:bg-paper'}`}
                    >
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${p.id === plotId ? 'bg-forest text-lime' : 'bg-sand text-ink-2'}`}>
                        <MapPin className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{p.plotNo}</span>
                        <span className="block truncate text-sm text-mute">{p.owners[0].name}</span>
                      </span>
                      <span className="text-right">
                        <span className="block text-sm font-medium">{formatMoney(p.valueEstimate)}</span>
                        <span className={`ml-auto mt-1 block size-2 rounded-full ${p.verdict === 'safe' ? 'bg-ok' : p.verdict === 'caution' ? 'bg-warn' : 'bg-bad'}`} />
                      </span>
                    </button>
                  </li>
                ))}
          </ul>
          <p className="mt-4 rounded-2xl bg-paper p-4 text-sm text-mute">
            Grey plots are in the survey map but not yet linked to other records.
          </p>
        </aside>
      </div>
    </div>
  );
}
