import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowRight, CircleCheck, CircleX, Info } from 'lucide-react';
import { useAsync } from '../lib/useAsync';
import { properties, type PropertyReport } from '../api/client';
import { BuildingViewer } from '../components/property/BuildingViewer';
import { ButtonLink } from '../components/ui/Button';
import { Skeleton } from '../components/ui/misc';

const DEFAULT_ID = '10CH0220010805';

function Slider({ label, value, min, max, step = 0.5, unit, limit, limitKind, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  limit: number;
  limitKind: 'min' | 'max';
  onChange: (v: number) => void;
}) {
  const ok = limitKind === 'min' ? value >= limit : value <= limit;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm text-ink-2">{label}</label>
        <span className={`font-display text-lg font-semibold ${ok ? '' : 'text-clay'}`}>
          {value}
          <span className="ml-0.5 text-sm font-normal text-mute">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-forest"
        style={{ background: `linear-gradient(90deg, ${ok ? '#1F4634' : '#E4623A'} ${pct}%, #ECE6DA ${pct}%)` }}
      />
      <p className={`mt-1.5 text-xs ${ok ? 'text-faint' : 'text-clay'}`}>
        {limitKind === 'min' ? `At least ${limit} ${unit}` : `Up to ${limit} ${unit}`} allowed
      </p>
    </div>
  );
}

export default function BuildPage() {
  const { id = DEFAULT_ID } = useParams();
  const navigate = useNavigate();
  const { data: all } = useAsync(() => properties.search('', {}), []);
  const { data: p, loading } = useAsync(() => properties.get(id), [id]);

  const buildable = useMemo(() => (all ?? []).filter((x) => x.landUse !== 'Farming'), [all]);

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">Building planner</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1] sm:text-6xl">
            See what you can build — <span className="serif-accent">before you hire anyone.</span>
          </h1>
        </div>
        <label className="flex items-center gap-3">
          <span className="text-sm text-mute">Plot</span>
          <select
            value={id}
            onChange={(e) => navigate(`/build/${e.target.value}`)}
            className="h-11 min-w-64 cursor-pointer rounded-full border border-line bg-white px-4 text-[15px] focus:outline-none"
          >
            {(buildable.length ? buildable : p ? [p] : []).map((x) => (
              <option key={x.id} value={x.id}>{x.plotNo} — {x.locality}</option>
            ))}
          </select>
        </label>
      </div>

      {loading || !p ? (
        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-[620px] !rounded-[2rem]" />
          <Skeleton className="h-[620px] !rounded-[2rem]" />
        </div>
      ) : (
        <Planner key={p.id} p={p} />
      )}
    </div>
  );
}

function Planner({ p }: { p: PropertyReport }) {
  const r = p.rules;
  const [floors, setFloors] = useState(Math.min(r.maxFloors, p.building?.floors ?? 2));
  const [front, setFront] = useState(r.frontGapM);
  const [side, setSide] = useState(r.sideGapM);
  const [rear, setRear] = useState(r.rearGapM);
  const [coverage, setCoverage] = useState(Math.min(r.maxCoveragePercent, 60));

  useEffect(() => {
    document.title = `Plan ${p.plotNo} — Saar`;
    return () => void (document.title = 'Saar — Know your land before you buy, build or borrow');
  }, [p.plotNo]);

  // Approximate plot as a rectangle 1 : 1.3 (typical Indian plotted housing).
  const plotW = Math.sqrt(p.areaSqm / 1.3);
  const plotD = plotW * 1.3;
  const envArea = Math.max(0, (plotW - side * 2) * (plotD - front - rear));
  const footprint = Math.min(envArea, (coverage / 100) * p.areaSqm);
  const totalFloor = Math.round(footprint * floors);
  const allowedFloor = Math.round(p.areaSqm * r.floorAreaRatio);
  const height = +(floors * 3.2 + 0.6).toFixed(1);

  const checks = [
    { label: 'Number of floors', ok: floors <= r.maxFloors, detail: `${floors} of ${r.maxFloors} allowed` },
    { label: 'Building height', ok: height <= r.maxHeightM, detail: `${height} m of ${r.maxHeightM} m` },
    { label: 'Total floor space', ok: totalFloor <= allowedFloor, detail: `${totalFloor.toLocaleString('en-IN')} of ${allowedFloor.toLocaleString('en-IN')} m²` },
    { label: 'Ground covered', ok: coverage <= r.maxCoveragePercent, detail: `${coverage}% of ${r.maxCoveragePercent}%` },
    { label: 'Open space around', ok: front >= r.frontGapM && side >= r.sideGapM && rear >= r.rearGapM, detail: `Front ${front} · sides ${side} · back ${rear} m` },
  ];
  const allOk = checks.every((c) => c.ok);

  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col overflow-hidden rounded-[2rem] border border-line bg-[#F1EDE3]">
        <div className="relative h-[440px] sm:h-[560px]">
          <BuildingViewer plotW={plotW} plotD={plotD} front={front} side={side} rear={rear} floors={floors} maxFloors={r.maxFloors} footprintScale={envArea ? footprint / envArea : 1} />
          <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
            <p className="font-display text-lg font-semibold">{p.plotNo}</p>
            <p className="text-xs text-mute">{p.areaSqm.toLocaleString('en-IN')} m² · {r.zone}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
          {[
            ['Footprint', `${Math.round(footprint)} m²`],
            ['Total floor space', `${totalFloor.toLocaleString('en-IN')} m²`],
            ['Height', `${height} m`],
            ['Rough build cost', `₹${((totalFloor * 10.76 * 2400) / 1e5).toFixed(0)} L`],
          ].map(([k, v]) => (
            <div key={k} className="bg-white p-5">
              <p className="text-xs text-mute">{k}</p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <aside className="flex flex-col gap-5">
        <div className="rounded-[2rem] border border-line bg-white p-6">
          <p className="font-display text-lg font-semibold">Adjust your design</p>
          <div className="mt-6 space-y-6">
            <Slider label="Floors" value={floors} min={1} max={Math.max(6, r.maxFloors + 2)} step={1} unit="" limit={r.maxFloors} limitKind="max" onChange={setFloors} />
            <Slider label="Ground covered" value={coverage} min={5} max={100} step={5} unit="%" limit={r.maxCoveragePercent} limitKind="max" onChange={setCoverage} />
            <Slider label="Gap at front" value={front} min={0} max={10} unit="m" limit={r.frontGapM} limitKind="min" onChange={setFront} />
            <Slider label="Gap at each side" value={side} min={0} max={6} unit="m" limit={r.sideGapM} limitKind="min" onChange={setSide} />
            <Slider label="Gap at back" value={rear} min={0} max={8} unit="m" limit={r.rearGapM} limitKind="min" onChange={setRear} />
          </div>
        </div>

        <div className={`rounded-[2rem] p-6 ${allOk ? 'bg-mint' : 'bg-clay-soft'}`}>
          <p className={`font-display text-lg font-semibold ${allOk ? 'text-forest' : 'text-clay'}`}>
            {allOk ? 'This design follows the rules' : 'Some limits are crossed'}
          </p>
          <ul className="mt-4 space-y-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-3 text-sm">
                {c.ok ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-clay" />}
                <span className="flex-1">{c.label}</span>
                <span className="text-right text-ink-2">{c.detail}</span>
              </li>
            ))}
          </ul>
          <ButtonLink
            to={`/applications/new?type=permit&property=${p.id}`}
            className="mt-6 w-full"
            variant={allOk ? 'primary' : 'outline'}
            iconRight={<ArrowRight className="size-4" />}
          >
            Apply for building permission
          </ButtonLink>
        </div>

        <p className="flex gap-2 px-2 text-xs text-mute">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            A guide, not an approval. Rules come from the {r.zone.toLowerCase()} zone. <Link to="/help#words" className="underline">What do these words mean?</Link>
          </span>
        </p>
      </aside>
    </div>
  );
}
