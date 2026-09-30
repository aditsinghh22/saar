import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { Bell, Bookmark, Building2, ChevronDown, FileText, LayoutDashboard, LogOut, Menu, Search, X } from 'lucide-react';
import { Logo } from './Logo';
import { ButtonLink } from '../ui/Button';
import { useSession } from '../../lib/session';
import { useAsync } from '../../lib/useAsync';
import { notifications as notificationsApi } from '../../api/client';

const LINKS = [
  { to: '/search', label: 'Check a property' },
  { to: '/map', label: 'Map' },
  { to: '/build', label: 'Plan a building' },
  { to: '/services', label: 'Services' },
  { to: '/help', label: 'Help' },
];

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onOutside();
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const { data, setData } = useAsync(() => notificationsApi.list(), [open]);
  const ref = useClickOutside(() => setOpen(false));
  const unread = data?.filter((n) => n.unread).length ?? 0;

  const markRead = async () => {
    await notificationsApi.markAllRead();
    setData((prev) => (prev ?? []).map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative grid size-10 cursor-pointer place-items-center rounded-full text-ink-2 transition hover:bg-sand"
        aria-label="Notifications"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-clay ring-2 ring-paper" />}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[22rem] animate-rise overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="font-display text-lg font-semibold">Updates</p>
            {unread > 0 && (
              <button onClick={markRead} className="cursor-pointer text-sm text-forest hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {data?.map((n) => (
              <Link key={n.id} to={n.href} onClick={() => setOpen(false)} className="flex gap-3 border-b border-line/70 px-5 py-4 transition last:border-0 hover:bg-paper">
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.unread ? 'bg-clay' : 'bg-transparent'}`} />
                <span>
                  <span className="block text-sm font-medium">{n.title}</span>
                  <span className="mt-0.5 block text-sm text-mute">{n.body}</span>
                  <span className="mt-1 block text-xs text-faint">{n.time}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const { user, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const navigate = useNavigate();
  if (!user) return null;
  const initials = user.name.split(' ').map((s) => s[0]).join('').slice(0, 2);

  const items = [
    ...(user.role === 'officer' ? [{ to: '/office', label: 'Office dashboard', icon: LayoutDashboard }] : []),
    { to: '/account', label: 'My properties', icon: Bookmark },
    { to: '/applications', label: 'My applications', icon: FileText },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition hover:bg-sand">
        <span className="grid size-8 place-items-center rounded-full bg-forest text-xs font-semibold text-lime">{initials}</span>
        <ChevronDown className="size-4 text-mute" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 animate-rise overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-xl">
          <div className="px-3 py-3">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-mute">{user.office ?? user.phone}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-paper">
              <Icon className="size-4 text-mute" /> {label}
            </Link>
          ))}
          <div className="my-1 h-px bg-line" />
          <button
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate('/');
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-bad transition hover:bg-bad-soft"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { user } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu after navigating.
  const [menuPath, setMenuPath] = useState(location.pathname);
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname);
    setMobileOpen(false);
  }

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'border-b border-line/80 bg-paper/85 backdrop-blur-xl' : 'border-b border-transparent bg-paper'}`}>
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-[15px] transition ${isActive ? 'bg-white font-medium text-ink shadow-sm' : 'text-ink-2 hover:text-ink'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user?.role === 'officer' && (
            <NavLink
              to="/office"
              className={({ isActive }) => `ml-1 flex items-center gap-1.5 rounded-full px-4 py-2 text-[15px] transition ${isActive ? 'bg-forest text-white' : 'bg-mint text-forest hover:bg-forest hover:text-white'}`}
            >
              <Building2 className="size-4" /> Office
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link to="/search" className="grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-sand lg:hidden" aria-label="Search">
            <Search className="size-[18px]" />
          </Link>
          {user ? (
            <>
              <Notifications />
              <AccountMenu />
            </>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-full px-4 py-2 text-[15px] text-ink-2 transition hover:text-ink sm:block">
                Sign in
              </Link>
              <ButtonLink to="/login?next=/applications/new" size="sm" className="max-sm:hidden">
                Apply online
              </ButtonLink>
            </>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="grid size-10 cursor-pointer place-items-center rounded-full transition hover:bg-sand lg:hidden" aria-label="Menu">
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade border-t border-line bg-paper lg:hidden">
          <nav className="container-x flex flex-col py-4">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className="border-b border-line py-4 font-display text-2xl font-medium tracking-tight">
                {l.label}
              </NavLink>
            ))}
            {user?.role === 'officer' && (
              <NavLink to="/office" className="border-b border-line py-4 font-display text-2xl font-medium tracking-tight text-forest">
                Office dashboard
              </NavLink>
            )}
            {!user && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <ButtonLink to="/login" variant="outline">Sign in</ButtonLink>
                <ButtonLink to="/login?next=/applications/new">Apply online</ButtonLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
