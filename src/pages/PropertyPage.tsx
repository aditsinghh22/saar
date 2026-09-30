import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowRight,
  Banknote,
  Bookmark,
  BookmarkCheck,
  Building2,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  Copy,
  Download,
  FileText,
  Gavel,
  Home,
  Landmark,
  MapPin,
  Ruler,
  Satellite,
  Scissors,
  Share2,
  ShoppingBag,
  Wallet,
} from 'lucide-react';
import { useAsync } from '../lib/useAsync';
import { properties, type PropertyReport } from '../api/client';
import type { Check, HistoryEvent } from '../api/types';
import { AreaMap } from '../components/property/AreaMap';
import { PlotOutline } from '../components/property/PlotOutline';
import { Badge, VerdictBadge } from '../components/ui/Badge';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card, EmptyState, Field, Modal, Skeleton, Tabs, inputClass } from '../components/ui/misc';
import { formatDate, formatMoney, formatPropertyId, sqmToSqft, timeAgo, VERDICT_COPY } from '../lib/format';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';
import NotFoundPage from './NotFoundPage';

type Tab = 'overview' | 'owners' | 'loans' | 'tax' | 'building' | 'sources';

export default function PropertyPage() {
  const { id = '' } = useParams();
  const { data: p, loading, error, setData } = useAsync(() => properties.get(id), [id]);
  const [tab, setTab] = useState<Tab>('overview');

  if (error) return <NotFoundPage title="We couldn’t find that property" body={`No property matches the ID “${id}”. Check the number and try again.`} />;
  if (loading || !p) return <PropertySkeleton />;

  const issues = p.checks.filter((c) => c.status !== 'pass').length;

  return (
    <div className="pb-24">
      <div className="container-x pt-8">
        <nav className="flex items-center gap-1.5 text-sm text-mute">
          <Link to="/search" className="hover:text-ink">Properties</Link>
          <ChevronRight className="size-3.5" />
          <Link to={`/search?q=${encodeURIComponent(p.locality)}`} className="hover:text-ink">{p.locality}</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-ink">{p.plotNo}</span>
        </nav>

        <Header p={p} />

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="relative min-h-72 overflow-hidden rounded-[2rem] bg-sand lg:min-h-[440px]">
            <img src={p.image} alt={p.title} className="absolute inset-0 size-full object-cover" />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium backdrop-blur">{p.type}</span>
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium backdrop-blur">{p.landUse}</span>
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium backdrop-blur">{p.areaLocal}</span>
            </div>
          </div>
          <Summary p={p} issues={issues} />
        </div>
      </div>

      <div className="sticky top-[72px] z-30 mt-12 border-b border-line bg-paper/90 backdrop-blur-xl">
        <div className="container-x py-3">
          <Tabs<Tab>
            value={tab}
            onChange={setTab}
            className="w-fit max-w-full"
            tabs={[
              { id: 'overview', label: 'Overview', count: issues || undefined },
              { id: 'owners', label: 'Owners & history' },
              { id: 'loans', label: 'Loans & court cases', count: p.loans.filter((l) => l.status === 'Active').length + p.cases.length || undefined },
              { id: 'tax', label: 'Property tax' },
              { id: 'building', label: 'Building rules' },
              { id: 'sources', label: 'Where this comes from' },
            ]}
          />
        </div>
      </div>

      <div className="container-x mt-10 animate-fade" key={tab}>
        {tab === 'overview' && <Overview p={p} />}
        {tab === 'owners' && <Owners p={p} />}
        {tab === 'loans' && <LoansAndCases p={p} />}
        {tab === 'tax' && <TaxTab p={p} onPaid={(next) => setData(() => next)} />}
        {tab === 'building' && <BuildingTab p={p} />}
        {tab === 'sources' && <Sources p={p} />}
      </div>
    </div>
  );
}

function Header({ p }: { p: PropertyReport }) {
  const { user, isSaved, toggleSaved } = useSession();
  const notify = useToast();
  const navigate = useNavigate();
  const saved = isSaved(p.id);

  const save = async () => {
    if (!user) return navigate(`/login?next=/property/${p.id}`);
    const nowSaved = await toggleSaved(p.id);
    notify(nowSaved ? 'Saved to My properties' : 'Removed from My properties', { body: nowSaved ? 'We’ll tell you if anything changes.' : undefined });
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify('Link copied', { body: 'Anyone with the link can see this public report.' });
    } catch {
      notify('Couldn’t copy the link', { tone: 'error' });
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(p.id);
      notify('Property ID copied');
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <button onClick={copyId} className="group flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-mute hover:text-ink">
          Property ID {formatPropertyId(p.id)} <Copy className="size-3 opacity-0 transition group-hover:opacity-100" />
        </button>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.02] sm:text-6xl">{p.plotNo}</h1>
        <p className="mt-3 flex items-center gap-2 text-lg text-mute">
          <MapPin className="size-4" /> {p.locality}, {p.city}, {p.district}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={save} icon={saved ? <BookmarkCheck className="size-4 text-forest" /> : <Bookmark className="size-4" />}>
          {saved ? 'Saved' : 'Save'}
        </Button>
        <Button variant="outline" onClick={share} icon={<Share2 className="size-4" />}>Share</Button>
        <Button
          variant="dark"
          icon={<Download className="size-4" />}
          onClick={() => notify('Report is being prepared', { body: `Saar-report-${p.plotNo.replace(/\s/g, '-')}.pdf will download shortly.` })}
        >
          Download report
        </Button>
      </div>
    </div>
  );
}

function Summary({ p, issues }: { p: PropertyReport; issues: number }) {
  const copy = VERDICT_COPY[p.verdict];
  const bg = { ok: 'bg-ok-soft', warn: 'bg-warn-soft', bad: 'bg-bad-soft' }[copy.tone];
  const fg = { ok: 'text-ok', warn: 'text-warn', bad: 'text-bad' }[copy.tone];
  const message = {
    safe: 'All six checks passed. Records from every office agree.',
    caution: `${issues} thing${issues > 1 ? 's' : ''} to look into before you pay any money.`,
    risky: `We found ${issues} problem${issues > 1 ? 's' : ''}. Talk to a lawyer before going ahead.`,
  }[p.verdict];

  return (
    <div className="flex flex-col gap-5">
      <div className={`rounded-[2rem] p-7 ${bg}`}>
        <div className="flex items-center justify-between">
          <p className={`eyebrow ${{ ok: '!text-ok', warn: '!text-warn', bad: '!text-bad' }[copy.tone]}`}>Our verdict</p>
          <span className={`font-mono text-xs ${fg}`}>{p.checks.filter((c) => c.status === 'pass').length}/6 checks passed</span>
        </div>
        <p className={`mt-4 font-display text-4xl font-semibold tracking-tight ${fg}`}>{copy.label}</p>
        <p className="mt-2 text-ink-2">{message}</p>
        <div className="mt-5 flex gap-1.5">
          {p.checks.map((c) => (
            <span key={c.id} title={c.label} className={`h-1.5 flex-1 rounded-full ${c.status === 'pass' ? 'bg-ok' : c.status === 'warn' ? 'bg-warn' : 'bg-bad'}`} />
          ))}
        </div>
      </div>
      <Card className="flex-1 p-7">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6">
          <Fact label="Estimated market value" value={formatMoney(p.valueEstimate)} />
          <Fact label="Government rate" value={formatMoney(p.govtRate)} hint="Used for stamp duty" />
          <Fact label="Area" value={`${p.areaSqm.toLocaleString('en-IN')} m²`} hint={`${sqmToSqft(p.areaSqm).toLocaleString('en-IN')} sq ft`} />
          <Fact label="Owner" value={p.owners.length > 1 ? `${p.owners.length} owners` : p.owners[0].name.split(' ').slice(0, 2).join(' ')} hint={`Since ${formatDate(p.owners[0].since, { year: 'numeric', month: 'short' })}`} />
        </dl>
        <p className="mt-6 border-t border-line pt-4 text-xs text-faint">Records last checked {timeAgo(p.lastUpdated)} · Value is an estimate from recent sales nearby</p>
      </Card>
    </div>
  );
}

function Fact({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div>
      <dt className="text-sm text-mute">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold tracking-tight">{value}</dd>
      {hint && <dd className="text-xs text-faint">{hint}</dd>}
    </div>
  );
}

const CHECK_ICON = {
  pass: <CircleCheck className="size-5 text-ok" />,
  warn: <CircleAlert className="size-5 text-warn" />,
  fail: <CircleX className="size-5 text-bad" />,
};

function ChecksList({ checks }: { checks: Check[] }) {
  return (
    <ul className="divide-y divide-line">
      {checks.map((c) => (
        <li key={c.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
          <span className="mt-0.5">{CHECK_ICON[c.status]}</span>
          <div className="flex-1">
            <p className="font-medium">{c.label}</p>
            <p className="mt-1 text-mute">{c.detail}</p>
          </div>
          <Badge tone={c.status === 'pass' ? 'ok' : c.status === 'warn' ? 'warn' : 'bad'} className="h-fit shrink-0">
            {c.status === 'pass' ? 'OK' : c.status === 'warn' ? 'Check' : 'Problem'}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function Overview({ p }: { p: PropertyReport }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card className="p-7 sm:p-9">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Safety checks</h2>
          <VerdictBadge verdict={p.verdict} />
        </div>
        <ChecksList checks={p.checks} />
        {p.verdict !== 'safe' && (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-2">Are you the owner? You can fix most of these online.</p>
            <ButtonLink to={`/applications/new?type=correct&property=${p.id}`} size="sm" variant="dark" iconRight={<ArrowRight className="size-3.5" />}>
              Request a correction
            </ButtonLink>
          </div>
        )}
      </Card>

      <div className="grid gap-5">
        <Card className="p-7">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Plot boundary</h3>
            <span className="font-mono text-xs text-mute">From survey map</span>
          </div>
          <div className="grid-paper mt-4 rounded-2xl bg-paper">
            <PlotOutline shape={p.shape} areaSqm={p.areaSqm} className="mx-auto w-full max-w-[280px]" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="flex items-center gap-2 text-mute"><Ruler className="size-4" /> {p.areaSqm.toLocaleString('en-IN')} m²</span>
            <span className="text-mute">{p.areaLocal}</span>
          </div>
        </Card>
        {p.area && (
          <Link to={`/map?area=${p.areaId}&plot=${p.id}`} className="group overflow-hidden rounded-3xl border border-line bg-white">
            <div className="h-48 overflow-hidden">
              <AreaMap area={p.area} plots={[p]} selectedId={p.id} interactive={false} className="h-full" />
            </div>
            <div className="flex items-center justify-between p-5">
              <span className="font-medium">See it on the map</span>
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

const HISTORY_ICON: Record<HistoryEvent['kind'], ReactNode> = {
  sale: <ShoppingBag className="size-4" />,
  transfer: <FileText className="size-4" />,
  loan: <Banknote className="size-4" />,
  split: <Scissors className="size-4" />,
  court: <Gavel className="size-4" />,
  tax: <Wallet className="size-4" />,
  building: <Building2 className="size-4" />,
  survey: <Satellite className="size-4" />,
};

function Owners({ p }: { p: PropertyReport }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
      <div className="space-y-5">
        <Card className="p-7">
          <h2 className="text-2xl font-semibold">Current owners</h2>
          <p className="mt-1 text-sm text-mute">As written in the land record</p>
          <ul className="mt-6 space-y-5">
            {p.owners.map((o) => (
              <li key={o.name}>
                <div className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-mint font-medium text-forest">
                    {o.name.split(' ').filter((s) => s.length > 2).map((s) => s[0]).join('').slice(0, 2)}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{o.name}</p>
                    <p className="text-sm text-mute">{o.relation ?? 'Owner'} · since {formatDate(o.since)}</p>
                  </div>
                  <span className="font-display text-xl font-semibold">{o.sharePercent}%</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-sand">
                  <div className="h-full rounded-full bg-forest" style={{ width: `${o.sharePercent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        {p.pendingTransfer && (
          <div className="rounded-3xl bg-warn-soft p-7">
            <div className="flex items-center gap-2 text-warn">
              <CircleAlert className="size-5" />
              <p className="font-medium">Sold, but name not changed</p>
            </div>
            <p className="mt-3 text-ink-2">
              This property was sold to <strong className="font-medium">{p.pendingTransfer.buyer}</strong> on {formatDate(p.pendingTransfer.soldOn)} (deed {p.pendingTransfer.deedNo}). Until the name is transferred, tax bills and notices go to the old owner.
            </p>
            <ButtonLink to={`/applications/new?type=transfer&property=${p.id}`} size="sm" variant="dark" className="mt-5" iconRight={<ArrowRight className="size-3.5" />}>
              Apply for name transfer
            </ButtonLink>
          </div>
        )}
      </div>

      <Card className="p-7 sm:p-9">
        <h2 className="text-2xl font-semibold">History</h2>
        <p className="mt-1 text-sm text-mute">Every recorded event, newest first</p>
        <ol className="relative mt-8 space-y-8 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-px before:bg-line">
          {p.history.map((h, i) => (
            <li key={i} className="relative flex gap-5">
              <span className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border ${i === 0 ? 'border-forest bg-forest text-lime' : 'border-line bg-white text-ink-2'}`}>
                {HISTORY_ICON[h.kind]}
              </span>
              <div className="pt-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <p className="font-medium">{h.title}</p>
                  <p className="font-mono text-xs text-faint">{formatDate(h.date)}</p>
                </div>
                <p className="mt-1 text-mute">{h.detail}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-faint"><Landmark className="size-3.5" /> {h.office}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function LoansAndCases({ p }: { p: PropertyReport }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-7 sm:p-9">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Loans</h2>
          <Banknote className="size-5 text-mute" />
        </div>
        <p className="mt-1 text-sm text-mute">From the central loan registry and state records</p>
        {p.loans.length === 0 ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-ok-soft p-5 text-ok"><CircleCheck className="size-5" /> No loans have ever been recorded on this property.</div>
        ) : (
          <ul className="mt-6 space-y-3">
            {p.loans.map((l) => (
              <li key={l.lender} className="rounded-2xl border border-line p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{l.lender}</p>
                    <p className="text-sm text-mute">Since {formatDate(l.since)}</p>
                  </div>
                  <p className="font-display text-2xl font-semibold">{formatMoney(l.amount)}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone={l.status === 'Active' ? 'warn' : 'neutral'}>{l.status === 'Active' ? 'Still being repaid' : 'Fully repaid'}</Badge>
                  {!l.inStateRecords && <Badge tone="bad"><CircleX className="size-3.5" /> Missing from state records</Badge>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-7 sm:p-9">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Court cases</h2>
          <Gavel className="size-5 text-mute" />
        </div>
        <p className="mt-1 text-sm text-mute">Searched across district courts and the High Court</p>
        {p.cases.length === 0 ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-ok-soft p-5 text-ok"><CircleCheck className="size-5" /> No court cases found for this property.</div>
        ) : (
          <ul className="mt-6 space-y-3">
            {p.cases.map((c) => (
              <li key={c.caseNo} className="rounded-2xl border border-line p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-sm">{c.caseNo}</p>
                  <Badge tone={c.status === 'Ongoing' ? 'warn' : 'neutral'}>{c.status}</Badge>
                </div>
                <p className="mt-3 font-medium">{c.court}</p>
                <p className="mt-1 text-mute">{c.summary}</p>
                {c.saleBlocked && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">
                    <CircleX className="size-4" /> Court has ordered that this property must not be sold.
                  </div>
                )}
                <p className="mt-3 text-xs text-faint">Filed {formatDate(c.filed)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function TaxTab({ p, onPaid }: { p: PropertyReport; onPaid: (next: PropertyReport) => void }) {
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('upi');
  const notify = useToast();

  const pay = async () => {
    setPaying(true);
    try {
      const res = await properties.payTax(p.id);
      const next = await properties.get(p.id);
      onPaid(next);
      notify(`${formatMoney(res.paid)} paid`, { body: `Receipt ${res.receiptNo} sent to your email.` });
      setOpen(false);
    } finally {
      setPaying(false);
    }
  };

  const tone = p.tax.status === 'Paid' ? 'ok' : p.tax.status === 'Due' ? 'warn' : 'bad';

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className={`rounded-[2rem] p-8 ${p.tax.due ? 'bg-ink text-white' : 'bg-mint'}`}>
        <p className={`eyebrow ${p.tax.due ? '!text-white/50' : ''}`}>Amount due now</p>
        <p className={`mt-3 font-display text-6xl font-semibold tracking-tight ${p.tax.due ? 'text-white' : 'text-forest'}`}>{formatMoney(p.tax.due)}</p>
        <p className={`mt-3 ${p.tax.due ? 'text-white/65' : 'text-ink-2'}`}>
          {p.tax.due ? `Last paid ${formatDate(p.tax.lastPaid)}.` : `All clear. Last paid ${formatDate(p.tax.lastPaid)}.`}
        </p>
        {p.tax.due > 0 && (
          <Button variant="lime" size="lg" className="mt-8" onClick={() => setOpen(true)} icon={<Wallet className="size-4" />}>
            Pay {formatMoney(p.tax.due)}
          </Button>
        )}
      </div>
      <Card className="p-7 sm:p-9">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Tax details</h2>
          <Badge tone={tone}>{p.tax.status}</Badge>
        </div>
        <dl className="mt-6 divide-y divide-line">
          {[
            ['Tax account number', p.tax.taxId],
            ['Ward', p.tax.ward],
            ['Yearly tax', formatMoney(p.tax.annual)],
            ['Taxed for', p.tax.assessedFor],
            ['Last payment', formatDate(p.tax.lastPaid)],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between gap-4 py-4">
              <dt className="text-mute">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        {p.building && !p.building.approved && (
          <p className="mt-5 rounded-2xl bg-warn-soft p-4 text-sm text-ink-2">
            The tax is charged for <strong className="font-medium">{p.tax.assessedFor}</strong>, but satellite images show {p.building.floors} floors ({p.building.builtAreaSqm} m²). The tax may be revised.
          </p>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Pay property tax">
        <div className="rounded-2xl bg-paper p-5">
          <div className="flex justify-between text-sm text-mute"><span>{p.plotNo}</span><span className="font-mono">{p.tax.taxId}</span></div>
          <p className="mt-2 font-display text-4xl font-semibold">{formatMoney(p.tax.due)}</p>
        </div>
        <div className="mt-6">
          <Field label="Pay with">
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
              <option value="upi">UPI</option>
              <option value="card">Debit / credit card</option>
              <option value="net">Net banking</option>
            </select>
          </Field>
        </div>
        <Button className="mt-6 w-full" size="lg" loading={paying} onClick={pay}>
          Pay now
        </Button>
        <p className="mt-3 text-center text-xs text-faint">Paid directly to the municipality. Receipt emailed instantly.</p>
      </Modal>
    </div>
  );
}

function BuildingTab({ p }: { p: PropertyReport }) {
  const r = p.rules;
  const maxBuilt = Math.round(p.areaSqm * r.floorAreaRatio);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-7 sm:p-9">
        <h2 className="text-2xl font-semibold">What you can build here</h2>
        <p className="mt-1 text-mute">{r.zone}</p>
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {[
            ['Floors allowed', `Up to ${r.maxFloors}`],
            ['Max height', `${r.maxHeightM} m`],
            ['Total floor space', `${maxBuilt.toLocaleString('en-IN')} m²`],
            ['Ground covered', `${r.maxCoveragePercent}% of plot`],
            ['Gap at front', `${r.frontGapM} m`],
            ['Gap at sides / back', `${r.sideGapM} m / ${r.rearGapM} m`],
          ].map(([k, v]) => (
            <div key={k} className="bg-white p-5">
              <p className="text-sm text-mute">{k}</p>
              <p className="mt-1 font-display text-xl font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <ButtonLink to={`/build/${p.id}`} className="mt-8" iconRight={<ArrowRight className="size-4" />} icon={<Building2 className="size-4" />}>
          Open in 3D planner
        </ButtonLink>
      </Card>
      <Card className="p-7 sm:p-9">
        <h2 className="text-2xl font-semibold">What’s there today</h2>
        <p className="mt-1 text-mute">From satellite images and approved plans</p>
        {p.building ? (
          <>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <Fact label="Floors" value={p.building.floors} />
              <Fact label="Height" value={`${p.building.heightM} m`} />
              <Fact label="Built area" value={`${p.building.builtAreaSqm} m²`} />
            </div>
            <div className={`mt-8 flex items-start gap-3 rounded-2xl p-5 ${p.building.approved ? 'bg-ok-soft' : 'bg-bad-soft'}`}>
              {p.building.approved ? <CircleCheck className="mt-0.5 size-5 text-ok" /> : <CircleX className="mt-0.5 size-5 text-bad" />}
              <div>
                <p className={`font-medium ${p.building.approved ? 'text-ok' : 'text-bad'}`}>{p.building.approved ? 'Building is approved' : 'No building permission found'}</p>
                <p className="mt-1 text-sm text-ink-2">
                  {p.building.approved ? `Permit ${p.building.permitNo}. Last seen on satellite ${p.building.seenOnSatellite}.` : `${p.building.floors} floors seen on satellite in ${p.building.seenOnSatellite}. The owner may be asked to regularise it.`}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8">
            <EmptyState icon={<Home className="size-6" />} title="Nothing built yet" body="This is open land. Use the planner to see what you could build." />
          </div>
        )}
      </Card>
    </div>
  );
}

function Sources({ p }: { p: PropertyReport }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-7 sm:p-9">
        <h2 className="text-2xl font-semibold">Where this information comes from</h2>
        <p className="mt-1 max-w-2xl text-mute">Saar doesn’t keep its own copy of your records. It reads them directly from each office, every night.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead className="border-y border-line bg-paper text-sm text-mute">
            <tr>
              <th className="px-7 py-3 font-medium sm:px-9">Record</th>
              <th className="px-4 py-3 font-medium">Office</th>
              <th className="px-7 py-3 text-right font-medium sm:px-9">Last updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {p.sources.map((s) => (
              <tr key={s.record}>
                <td className="px-7 py-4 font-medium sm:px-9">{s.record}</td>
                <td className="px-4 py-4 text-ink-2">{s.office}</td>
                <td className="px-7 py-4 text-right text-mute sm:px-9">{formatDate(s.updated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PropertySkeleton() {
  return (
    <div className="container-x pb-24 pt-8">
      <Skeleton className="h-4 w-60" />
      <Skeleton className="mt-8 h-3 w-48" />
      <Skeleton className="mt-4 h-14 w-80" />
      <Skeleton className="mt-4 h-5 w-72" />
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-[440px] !rounded-[2rem]" />
        <div className="grid gap-5">
          <Skeleton className="h-52 !rounded-[2rem]" />
          <Skeleton className="h-52 !rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
