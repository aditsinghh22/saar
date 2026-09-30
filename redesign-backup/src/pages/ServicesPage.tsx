import { Link } from 'react-router';
import { ArrowUpRight, Clock, IndianRupee, Phone, MessageCircle, MapPin } from 'lucide-react';
import { useAsync } from '../lib/useAsync';
import { content } from '../api/client';
import { Reveal, Skeleton } from '../components/ui/misc';

export default function ServicesPage() {
  const { data, loading } = useAsync(() => content.services(), []);

  return (
    <div className="pb-24">
      <section className="container-x pb-14 pt-10 lg:pt-14">
        <p className="eyebrow">Services</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <h1 className="text-5xl font-semibold leading-[1] sm:text-7xl">
            Land office work, <span className="serif-accent">done from home.</span>
          </h1>
          <p className="text-lg text-mute">
            Apply online, upload documents from your phone and follow every step. Fees and timelines are fixed and shown before you start.
          </p>
        </div>
      </section>

      <section className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading || !data
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[420px] !rounded-[2rem]" />)
          : data.map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 70}>
                <Link to={s.href} className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgb(27_26_22/0.25)]">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={s.image} alt="" loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-mono text-xs backdrop-blur">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-2xl font-semibold leading-tight">{s.title}</h2>
                    <p className="mt-3 flex-1 text-mute">{s.summary}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                      <div className="flex gap-4 text-sm text-ink-2">
                        <span className="flex items-center gap-1.5"><IndianRupee className="size-3.5 text-mute" />{s.fee.replace('₹', '')}</span>
                        <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-mute" />{s.time}</span>
                      </div>
                      <span className="grid size-10 place-items-center rounded-full bg-paper transition group-hover:bg-forest group-hover:text-white">
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
      </section>

      <section className="container-x mt-24">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { icon: Phone, title: 'Call the helpline', body: '1800-11-2026 · Mon–Sat, 9 AM to 7 PM · Hindi, English, Tamil, Punjabi' },
            { icon: MessageCircle, title: 'WhatsApp us', body: 'Send “Hi” to +91 90000 12026 to check application status or get a record.' },
            { icon: MapPin, title: 'Visit a help desk', body: 'Every tehsil and taluk office has a Saar desk that can apply on your behalf.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[2rem] bg-sand/70 p-8">
              <span className="grid size-12 place-items-center rounded-2xl bg-white"><Icon className="size-5" /></span>
              <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
              <p className="mt-2 text-mute">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
