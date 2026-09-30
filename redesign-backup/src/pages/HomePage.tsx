import { Link } from 'react-router';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CircleCheck,
  CircleAlert,
  FileSearch,
  Landmark,
  MapPinned,
  Quote,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { SearchBox } from '../components/property/SearchBox';
import { PropertyCard, PropertyCardSkeleton } from '../components/property/PropertyCard';
import { AreaMap } from '../components/property/AreaMap';
import { ButtonLink } from '../components/ui/Button';
import { Accordion, Reveal, SectionHeading } from '../components/ui/misc';
import { useAsync } from '../lib/useAsync';
import { content, maps, properties } from '../api/client';
import { photos } from '../lib/images';
import { STATES } from '../data/content';

const SOURCES = ['Revenue Department', 'Sub-Registrar offices', 'Municipal Corporations', 'Central loan registry', 'eCourts', 'Survey Department', 'Town Planning', 'Satellite imagery'];

const STEPS = [
  { n: '01', title: 'Search the property', body: 'Type a plot number, survey number, owner’s name or locality. No login needed.' },
  { n: '02', title: 'We gather every record', body: 'Saar asks eight government offices at once — ownership, sale deeds, loans, court cases, tax and building permits.' },
  { n: '03', title: 'Read one simple report', body: 'Green, amber or red — with plain-language reasons. Every line shows which office it came from.' },
  { n: '04', title: 'Act on it online', body: 'Transfer the name, download a signed copy, pay tax or apply for building permission — without visiting an office.' },
];

const QUOTES = [
  { quote: 'We were about to pay the advance when Saar showed the shop had a court order on it. That one report saved us ₹40 lakh.', name: 'Neha & Arjun Kapoor', role: 'First-time buyers, Chandigarh' },
  { quote: 'My name transfer used to mean six visits to the tehsil. This time I tracked it on my phone and it was done in 19 days.', name: 'S. Meenakshi', role: 'Farmer, Alangudi' },
  { quote: 'The dashboard tells my team exactly which records don’t match. We recovered more tax in one quarter than the whole of last year.', name: 'Kavita Rana', role: 'Tehsildar, Chandigarh' },
];

function HeroCard() {
  return (
    <div className="absolute -bottom-8 left-4 right-4 animate-rise rounded-3xl border border-white/60 bg-white/95 p-5 shadow-[0_30px_60px_-30px_rgb(27_26_22/0.45)] backdrop-blur sm:left-auto sm:right-6 sm:w-[340px] [animation-delay:250ms]">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow !text-[10px]">Property report</p>
          <p className="mt-1 font-display text-lg font-semibold">House 104-B, Sector 22</p>
        </div>
        <span className="rounded-full bg-ok-soft px-2.5 py-1 text-xs font-medium text-ok">98% match</span>
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {[
          ['Owner name is up to date', true],
          ['No court cases', true],
          ['Tax paid till Mar 2027', true],
          ['Home loan with HDFC — recorded', false],
        ].map(([label, ok]) => (
          <li key={label as string} className="flex items-center gap-2.5">
            {ok ? <CircleCheck className="size-4 text-ok" /> : <CircleAlert className="size-4 text-warn" />}
            <span className="text-ink-2">{label}</span>
          </li>
        ))}
      </ul>
      <Link to="/property/10CH0220010401" className="mt-4 flex items-center justify-between rounded-2xl bg-paper px-4 py-3 text-sm font-medium transition hover:bg-sand">
        See full report <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function Hero() {
  return (
    <section className="container-x grid gap-12 pb-24 pt-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-32 lg:pt-16">
      <div className="animate-rise">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 text-sm">
          <span className="rounded-full bg-lime px-2.5 py-0.5 text-xs font-medium">New</span>
          <span className="text-ink-2">Bihar records are now live</span>
        </div>
        <h1 className="text-[3.25rem] font-semibold leading-[0.95] sm:text-7xl xl:text-[5.5rem]">
          Know your land <span className="serif-accent text-forest">before</span> you buy, build or borrow.
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-mute sm:text-xl">
          Saar brings every government record about a property into one simple report — owners, loans, court cases, tax and what you’re allowed to build.
        </p>
        <div className="mt-10 max-w-xl">
          <SearchBox />
        </div>
      </div>

      <div className="relative animate-rise [animation-delay:120ms]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand sm:aspect-[5/5] lg:aspect-[4/5]">
          <img src={photos.modernHouse(1400)} alt="A modern home at dusk" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
              <span className="relative size-2 rounded-full bg-ok" />
            </span>
            Records updated today, 9:40 AM
          </div>
        </div>
        <HeroCard />
      </div>
    </section>
  );
}

function SourceMarquee() {
  const row = [...SOURCES, ...SOURCES];
  return (
    <section className="border-y border-line bg-white py-6">
      <div className="container-x flex items-center gap-8">
        <p className="hidden shrink-0 text-sm text-mute md:block">Records come directly from</p>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-12">
            {row.map((s, i) => (
              <span key={i} className="flex items-center gap-3 whitespace-nowrap font-display text-xl font-medium tracking-tight text-ink-2">
                <Landmark className="size-5 text-faint" /> {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { data } = useAsync(() => maps.area('sector-22'), []);
  return (
    <section className="container-x py-24 lg:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="What you can do"
          title={<>Everything about a property, <span className="serif-accent">in one place.</span></>}
          body="No more running between the tehsil, the registry office and the municipality. Saar connects them so you don’t have to."
        />
      </Reveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-6">
        <Reveal className="lg:col-span-4">
          <Link to="/search" className="group relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-[2rem] bg-forest p-8 text-white sm:p-10">
            <img src={photos.keys(1200)} alt="" className="absolute inset-0 size-full object-cover opacity-25 mix-blend-luminosity transition duration-700 group-hover:scale-105" />
            <div className="relative flex items-center justify-between">
              <span className="grid size-12 place-items-center rounded-2xl bg-lime text-forest"><FileSearch className="size-6" /></span>
              <span className="grid size-11 place-items-center rounded-full border border-white/25 transition group-hover:bg-white group-hover:text-ink"><ArrowUpRight className="size-5" /></span>
            </div>
            <div className="relative max-w-md">
              <h3 className="text-4xl font-semibold text-white sm:text-5xl">Check before you buy</h3>
              <p className="mt-4 text-lg text-white/75">Six checks in seconds: owner, loans, court cases, area, tax and building approval. Free for everyone.</p>
            </div>
          </Link>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={80}>
          <Link to="/map" className="group flex h-full min-h-[420px] flex-col overflow-hidden rounded-[2rem] border border-line bg-white">
            <div className="flex-1 overflow-hidden bg-[#F1EDE3]">
              {data && <AreaMap area={data.area} plots={data.plots} interactive={false} className="h-full scale-[1.35] transition duration-700 group-hover:scale-[1.45]" />}
            </div>
            <div className="p-7">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Explore the land map</h3>
                <MapPinned className="size-5 text-mute" />
              </div>
              <p className="mt-2 text-mute">See every plot, what it’s used for and whether its records are clean.</p>
            </div>
          </Link>
        </Reveal>

        <Reveal className="lg:col-span-3" delay={80}>
          <Link to="/build" className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-line bg-white sm:flex-row">
            <div className="p-7 sm:w-1/2 sm:p-8">
              <span className="grid size-11 place-items-center rounded-2xl bg-clay-soft text-clay"><Building2 className="size-5" /></span>
              <h3 className="mt-6 text-2xl font-semibold">Plan your building</h3>
              <p className="mt-2 text-mute">See in 3D how many floors you can build and how much space to leave on each side.</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-forest">Open planner <ArrowRight className="size-4 transition group-hover:translate-x-0.5" /></span>
            </div>
            <div className="min-h-56 overflow-hidden sm:w-1/2">
              <img src={photos.blueprint(900)} alt="" className="size-full object-cover transition duration-700 group-hover:scale-105" />
            </div>
          </Link>
        </Reveal>

        <Reveal className="lg:col-span-3" delay={160}>
          <Link to="/applications" className="group flex h-full flex-col justify-between rounded-[2rem] border border-line bg-lime p-7 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Track every application</h3>
                <p className="mt-2 max-w-sm text-ink-2">Know exactly which desk your file is on — and when it will move.</p>
              </div>
              <ArrowUpRight className="size-5 shrink-0" />
            </div>
            <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Name transfer · SR-26-04812</span>
                <span className="text-mute">Day 18 of 30</span>
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                {['done', 'done', 'current', 'up', 'up'].map((s, i) => (
                  <span key={i} className={`h-2 flex-1 rounded-full ${s === 'done' ? 'bg-forest' : s === 'current' ? 'bg-forest/40' : 'bg-sand'}`} />
                ))}
              </div>
              <p className="mt-3 text-sm text-mute">Site visit by revenue officer · 2 Oct, 11:00 AM</p>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <SectionHeading eyebrow="How it works" title={<>From search to <span className="serif-accent">sorted</span> in four steps.</>} />
            <div className="mt-10 overflow-hidden rounded-[2rem]">
              <img src={photos.siteTeam(1000)} alt="Surveyors on a plot" className="aspect-[4/3] w-full object-cover" />
            </div>
          </div>
        </Reveal>
        <div>
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 60}>
              <div className="group grid grid-cols-[auto_1fr] gap-6 border-t border-line py-10 sm:gap-10">
                <span className="font-mono text-sm text-faint">{s.n}</span>
                <div>
                  <h3 className="text-3xl font-semibold sm:text-4xl">{s.title}</h3>
                  <p className="mt-4 max-w-lg text-lg leading-relaxed text-mute">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Numbers() {
  return (
    <section className="container-x py-24 lg:py-28">
      <Reveal>
        <div className="grid gap-px overflow-hidden rounded-[2rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['1,28,430', 'properties with linked records'],
            ['11 days', 'average name transfer — down from 45'],
            ['₹4.86 Cr', 'unpaid tax found and recovered'],
            ['8 offices', 'connected, updated every night'],
          ].map(([v, l]) => (
            <div key={l} className="bg-paper p-8 sm:p-10">
              <div className="font-display text-5xl font-semibold tracking-tight lg:text-6xl">{v}</div>
              <p className="mt-3 max-w-[16rem] text-mute">{l}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Recent() {
  const { data, loading } = useAsync(() => properties.list(['10CH0220010805', '33TN0140034101', '10CH0220010704']), []);
  return (
    <section className="container-x pb-24 lg:pb-32">
      <Reveal>
        <SectionHeading
          eyebrow="Recently checked"
          title={<>See what a report <span className="serif-accent">looks like.</span></>}
          action={<ButtonLink to="/search" variant="outline" iconRight={<ArrowRight className="size-4" />}>Browse all properties</ButtonLink>}
        />
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading || !data
          ? Array.from({ length: 3 }, (_, i) => <PropertyCardSkeleton key={i} />)
          : data.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <PropertyCard p={p} />
              </Reveal>
            ))}
      </div>
    </section>
  );
}

function ServicesList() {
  const { data } = useAsync(() => content.services(), []);
  return (
    <section className="bg-sand/60 py-24 lg:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <Reveal>
          <SectionHeading
            eyebrow="Online services"
            title={<>Skip the queue. <span className="serif-accent">Apply online.</span></>}
            body="Every service shows the fee and how long it usually takes — up front."
          />
          <ButtonLink to="/services" className="mt-10" iconRight={<ArrowRight className="size-4" />}>All services</ButtonLink>
        </Reveal>
        <Reveal delay={80}>
          {data && (
            <Accordion
              items={data.map((s, i) => ({
                meta: <span className="hidden w-8 font-mono text-sm text-faint sm:block">{String(i + 1).padStart(2, '0')}</span>,
                title: s.title,
                body: (
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p>{s.summary}</p>
                      <div className="mt-3 flex gap-5 text-sm text-ink-2">
                        <span>Fee: <strong className="font-medium">{s.fee}</strong></span>
                        <span>Usually: <strong className="font-medium">{s.time}</strong></span>
                      </div>
                    </div>
                    <ButtonLink to={s.href} size="sm" variant="dark" iconRight={<ArrowRight className="size-3.5" />}>Start</ButtonLink>
                  </div>
                ),
              }))}
            />
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Voices() {
  return (
    <section className="container-x py-24 lg:py-32">
      <Reveal>
        <SectionHeading eyebrow="People using Saar" title={<>Less running around. <span className="serif-accent">More certainty.</span></>} />
      </Reveal>
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.name} delay={i * 80}>
            <figure className={`flex h-full flex-col justify-between rounded-[2rem] p-8 ${i === 1 ? 'bg-forest text-white' : 'border border-line bg-white'}`}>
              <Quote className={`size-8 ${i === 1 ? 'text-lime' : 'text-clay'}`} />
              <blockquote className={`mt-8 font-display text-2xl font-medium leading-snug tracking-tight ${i === 1 ? 'text-white' : ''}`}>“{q.quote}”</blockquote>
              <figcaption className="mt-10">
                <p className="font-medium">{q.name}</p>
                <p className={`text-sm ${i === 1 ? 'text-white/60' : 'text-mute'}`}>{q.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Coverage() {
  return (
    <section className="container-x pb-24 lg:pb-32">
      <Reveal>
        <div className="grid overflow-hidden rounded-[2rem] border border-line bg-white lg:grid-cols-2">
          <div className="relative min-h-80">
            <img src={photos.jaipur(1200)} alt="Hawa Mahal, Jaipur" className="absolute inset-0 size-full object-cover" />
          </div>
          <div className="p-8 sm:p-12">
            <p className="eyebrow">Where Saar works</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">3 states live. <span className="serif-accent">More every quarter.</span></h2>
            <p className="mt-4 text-mute">Each state keeps its own records and local terms. Saar reads them as they are — Kanal, Cent or Katha.</p>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {STATES.map((s) => (
                <li key={s.code} className="flex items-center justify-between gap-4 py-3.5">
                  <span className="flex items-center gap-3">
                    <span className={`size-2 rounded-full ${s.live ? 'bg-ok' : 'bg-stone'}`} />
                    <span className="font-medium">{s.name}</span>
                    <span className="hidden text-sm text-faint sm:inline">{s.units}</span>
                  </span>
                  <span className={`text-sm ${s.live ? 'text-ink-2' : 'text-faint'}`}>{s.live ? `${s.records} records` : s.records}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="container-x pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-lime px-8 py-16 sm:px-14 sm:py-20">
          <div className="absolute -right-10 -top-10 hidden size-80 rounded-full border-[40px] border-forest/10 lg:block" />
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-semibold leading-[1.02] sm:text-6xl">Buying a property? Start with a free report.</h2>
              <p className="mt-5 text-lg text-ink-2">It takes less than a minute and could save you years in court.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink to="/search" size="lg" iconRight={<ArrowRight className="size-4" />}>Check a property</ButtonLink>
              <ButtonLink to="/help" size="lg" variant="white" icon={<ShieldCheck className="size-4" />}>How we keep it safe</ButtonLink>
            </div>
          </div>
          <div className="relative mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-2">
            <span className="flex items-center gap-2"><Scale className="size-4" /> Data from official sources only</span>
            <span className="flex items-center gap-2"><ShieldCheck className="size-4" /> Aadhaar and phone numbers never shown</span>
            <span className="flex items-center gap-2"><CircleCheck className="size-4" /> Every change is logged</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <SourceMarquee />
      <Features />
      <HowItWorks />
      <Numbers />
      <Recent />
      <ServicesList />
      <Voices />
      <Coverage />
      <FinalCta />
    </>
  );
}
