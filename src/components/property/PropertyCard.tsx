import { Link } from 'react-router';
import { ArrowUpRight, MapPin, Ruler, UserRound } from 'lucide-react';
import type { PropertyReport } from '../../api/client';
import { VerdictBadge } from '../ui/Badge';
import { Skeleton } from '../ui/misc';
import { formatMoney } from '../../lib/format';

export function PropertyCard({ p }: { p: PropertyReport }) {
  const owner = p.owners.length > 1 ? `${p.owners[0].name} +${p.owners.length - 1}` : p.owners[0]?.name;
  return (
    <Link to={`/property/${p.id}`} className="group block overflow-hidden rounded-3xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgb(27_26_22/0.25)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <img src={p.image.replace('w=1200', 'w=700')} alt="" loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute left-3 top-3">
          <VerdictBadge verdict={p.verdict} />
        </div>
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 opacity-0 backdrop-blur transition group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow !text-[11px]">{p.type}</p>
            <h3 className="mt-1.5 text-xl font-semibold leading-tight">{p.plotNo}</h3>
          </div>
          <p className="shrink-0 font-display text-lg font-semibold">{formatMoney(p.valueEstimate)}</p>
        </div>
        <div className="mt-4 space-y-2 text-sm text-mute">
          <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0" />{p.locality}, {p.city}</p>
          <p className="flex items-center gap-2"><Ruler className="size-4 shrink-0" />{p.areaSqm.toLocaleString('en-IN')} m² · {p.areaLocal}</p>
          <p className="flex items-center gap-2"><UserRound className="size-4 shrink-0" />{owner}</p>
        </div>
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white">
      <Skeleton className="aspect-[4/3] !rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

/** Compact horizontal row used in lists and side panels. */
export function PropertyRow({ p, action }: { p: PropertyReport; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-3 pr-4 transition hover:border-stone">
      <Link to={`/property/${p.id}`} className="flex flex-1 items-center gap-4">
        <img src={p.image.replace('w=1200', 'w=240')} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0">
          <p className="truncate font-medium">{p.plotNo}</p>
          <p className="truncate text-sm text-mute">{p.locality}, {p.city}</p>
        </div>
      </Link>
      <div className="hidden sm:block"><VerdictBadge verdict={p.verdict} /></div>
      {action}
    </div>
  );
}
