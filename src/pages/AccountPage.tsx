import { Link } from 'react-router';
import { ArrowRight, Bookmark, BookmarkX, FilePlus2, Search } from 'lucide-react';
import { useAsync } from '../lib/useAsync';
import { applications, properties } from '../api/client';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';
import { PropertyRow } from '../components/property/PropertyCard';
import { StatusBadge } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import { Card, EmptyState, Skeleton } from '../components/ui/misc';
import { formatDate } from '../lib/format';

export default function AccountPage() {
  const { user, toggleSaved } = useSession();
  const notify = useToast();
  const saved = user?.savedPropertyIds ?? [];
  const { data: props, loading } = useAsync(() => properties.list(saved), [saved.join()]);
  const { data: apps } = useAsync(() => applications.list(), []);
  const first = user?.name.split(' ')[0];

  const unsave = async (id: string) => {
    await toggleSaved(id);
    notify('Removed from My properties');
  };

  return (
    <div className="container-x pb-24 pt-10 lg:pt-14">
      <p className="eyebrow">My account</p>
      <h1 className="mt-4 text-5xl font-semibold leading-[1] sm:text-6xl">
        Namaste, <span className="serif-accent">{first}.</span>
      </h1>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {[
          ['Saved properties', saved.length],
          ['Applications in progress', apps?.filter((a) => !['Approved', 'Rejected'].includes(a.status)).length ?? '–'],
          ['Need your action', apps?.filter((a) => a.status === 'Needs info').length ?? '–'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[2rem] border border-line bg-white p-7">
            <p className="font-display text-5xl font-semibold tracking-tight">{v}</p>
            <p className="mt-2 text-mute">{k}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card className="p-7 sm:p-9">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Saved properties</h2>
            <Bookmark className="size-5 text-mute" />
          </div>
          <p className="mt-1 text-sm text-mute">We’ll alert you if a loan, court case or sale is recorded on any of these.</p>
          <div className="mt-6 space-y-3">
            {loading ? (
              Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[88px]" />)
            ) : props?.length ? (
              props.map((p) => (
                <PropertyRow
                  key={p.id}
                  p={p}
                  action={
                    <button onClick={() => unsave(p.id)} className="grid size-9 cursor-pointer place-items-center rounded-full text-mute hover:bg-bad-soft hover:text-bad" aria-label="Remove">
                      <BookmarkX className="size-4" />
                    </button>
                  }
                />
              ))
            ) : (
              <EmptyState icon={<Search className="size-6" />} title="No saved properties" body="Save a property from its report to keep an eye on it." action={<ButtonLink to="/search" variant="outline">Find a property</ButtonLink>} />
            )}
          </div>
        </Card>

        <Card className="p-7 sm:p-9">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent applications</h2>
            <Link to="/applications" className="text-sm text-forest hover:underline">See all</Link>
          </div>
          <ul className="mt-6 divide-y divide-line">
            {apps?.slice(0, 4).map((a) => (
              <li key={a.id}>
                <Link to={`/applications/${a.id}`} className="group flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.type}</p>
                    <p className="text-sm text-mute">{formatDate(a.submitted)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink to="/applications/new" variant="outline" className="mt-6 w-full" icon={<FilePlus2 className="size-4" />} iconRight={<ArrowRight className="size-4" />}>
            Start a new application
          </ButtonLink>
        </Card>
      </div>
    </div>
  );
}
