import { useMemo, useState } from 'react';
import { Copy, Search } from 'lucide-react';
import { useAsync } from '../lib/useAsync';
import { content } from '../api/client';
import type { Term } from '../api/types';
import { Accordion, Reveal, Skeleton, Tabs } from '../components/ui/misc';
import { useToast } from '../lib/toast';

type Cat = 'All' | Term['category'];
const CATS: Cat[] = ['All', 'Records', 'Process', 'Measurement', 'Offices', 'Building'];

const API_SAMPLE = `GET https://api.saar.gov.in/v1/properties/10CH0220010401

{
  "id": "10CH0220010401",
  "plotNo": "House 104-B",
  "verdict": "caution",
  "owners": [{ "name": "Harpreet Singh Sandhu", "sharePercent": 100 }],
  "checks": [
    { "id": "loans", "status": "warn", "detail": "₹1.2 Cr active loan…" }
  ]
}`;

export default function HelpPage() {
  const { data: faqs } = useAsync(() => content.faqs(), []);
  const { data: terms } = useAsync(() => content.terms(), []);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Cat>('All');
  const notify = useToast();

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return (terms ?? []).filter((t) => (cat === 'All' || t.category === cat) && (!s || [t.term, t.alsoCalled, t.meaning].join(' ').toLowerCase().includes(s)));
  }, [terms, q, cat]);

  return (
    <div className="pb-24">
      <section className="container-x pt-10 lg:pt-14">
        <p className="eyebrow">Help</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1] sm:text-7xl">
          Land records, <span className="serif-accent">in words you know.</span>
        </h1>
      </section>

      <section className="container-x mt-16 grid gap-14 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">Common questions</h2>
          <p className="mt-3 text-mute">Can’t find your answer? Call 1800-11-2026 — it’s free.</p>
        </div>
        <div>{faqs ? <Accordion items={faqs.map((f) => ({ title: f.q, body: f.a }))} /> : <Skeleton className="h-96" />}</div>
      </section>

      <section id="words" className="container-x mt-28 scroll-mt-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-4xl font-semibold sm:text-5xl">Land words, explained</h2>
            <p className="mt-3 max-w-xl text-mute">The same thing has different names in different states. Here’s what they all mean.</p>
          </div>
          <div className="flex w-full items-center gap-3 rounded-full border border-line bg-white px-5 lg:w-80">
            <Search className="size-4 text-mute" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a word, e.g. Khasra" className="h-11 flex-1 bg-transparent text-[15px] focus:outline-none" />
          </div>
        </div>
        <Tabs value={cat} onChange={setCat} className="mt-8 w-fit max-w-full" tabs={CATS.map((c) => ({ id: c, label: c }))} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <Reveal key={t.term} delay={(i % 3) * 50}>
              <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-2xl font-semibold">{t.term}</h3>
                  <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-xs text-ink-2">{t.category}</span>
                </div>
                {t.alsoCalled && <p className="mt-1 text-sm text-faint">Also called: {t.alsoCalled}</p>}
                <p className="mt-4 flex-1 text-ink-2">{t.meaning}</p>
                <p className="mt-4 rounded-2xl bg-paper p-4 text-sm text-mute"><span className="serif-accent text-base text-ink">e.g.</span> {t.example}</p>
              </article>
            </Reveal>
          ))}
          {terms && filtered.length === 0 && <p className="text-mute">No words match “{q}”.</p>}
        </div>
      </section>

      <section id="api" className="container-x mt-28 scroll-mt-24">
        <div className="grid overflow-hidden rounded-[2rem] bg-forest text-white lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-white/50">For banks, builders & apps</p>
            <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Use Saar in your own software.</h2>
            <p className="mt-4 max-w-md text-white/70">Banks check loans before approving, builders check plots before buying. One API, the same report you see here, with the owner’s consent.</p>
            <ul className="mt-8 space-y-2 text-white/80">
              <li>· Works with QGIS and ArcGIS map tools</li>
              <li>· Every response is signed and can be verified</li>
              <li>· Free for government; fair-use pricing for others</li>
            </ul>
          </div>
          <div className="relative bg-[#16362a] p-6 sm:p-10">
            <button
              onClick={() => navigator.clipboard?.writeText(API_SAMPLE).then(() => notify('Copied'))}
              className="absolute right-6 top-6 flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20"
            >
              <Copy className="size-3.5" /> Copy
            </button>
            <pre className="overflow-x-auto pt-8 font-mono text-[13px] leading-relaxed text-lime/90">{API_SAMPLE}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}
