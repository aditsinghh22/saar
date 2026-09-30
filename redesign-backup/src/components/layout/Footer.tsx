import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { LogoMark } from './Logo';
import { useToast } from '../../lib/toast';

const COLUMNS = [
  {
    title: 'For citizens',
    links: [
      ['Check a property', '/search'],
      ['Plan a building', '/build'],
      ['Transfer owner name', '/applications/new?type=transfer'],
      ['Download land record', '/applications/new?type=copy'],
      ['Track my application', '/applications'],
    ],
  },
  {
    title: 'Explore',
    links: [
      ['Land map', '/map'],
      ['All services', '/services'],
      ['Land words explained', '/help#words'],
      ['Questions & answers', '/help'],
    ],
  },
  {
    title: 'For offices',
    links: [
      ['Officer sign in', '/login?role=officer'],
      ['Office dashboard', '/office'],
      ['Developer API', '/help#api'],
    ],
  },
];

export function Footer() {
  const notify = useToast();
  const [email, setEmail] = useState('');

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return notify('Enter a valid email', { tone: 'error' });
    setEmail('');
    notify('You’re on the list', { body: 'We’ll email you when your state goes live.' });
  };

  return (
    <footer className="mt-auto overflow-hidden bg-forest text-white">
      <div className="container-x pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <h3 className="max-w-sm text-4xl font-semibold leading-[1.05] text-white sm:text-5xl">
              Every land record. <span className="serif-accent text-lime">One place.</span>
            </h3>
            <p className="mt-5 max-w-sm text-white/65">Get an email when new states, services or rule changes go live.</p>
            <form onSubmit={subscribe} className="mt-7 flex max-w-md items-center rounded-full bg-white/10 p-1.5 ring-1 ring-white/15 focus-within:ring-lime/60">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@email.com"
                className="h-10 flex-1 bg-transparent px-4 text-white placeholder:text-white/40 focus:outline-none"
              />
              <button className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-lime px-5 text-sm font-medium text-ink transition hover:brightness-95">
                Notify me <ArrowRight className="size-4" />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="mb-5 font-mono text-xs uppercase tracking-[0.08em] text-white/45">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map(([label, to]) => (
                    <li key={label}>
                      <Link to={to} className="group inline-flex items-center gap-1 text-white/85 transition hover:text-lime">
                        {label}
                        <ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/15 py-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark className="size-6" light />
            <span>© 2026 Saar. Land records made simple.</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/help" className="hover:text-white">Privacy</Link>
            <Link to="/help" className="hover:text-white">Terms of use</Link>
            <Link to="/help" className="hover:text-white">Accessibility</Link>
            <span>Helpline 1800-11-2026</span>
          </div>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none -mb-[4.5vw] select-none text-center font-display text-[31vw] font-bold leading-[0.8] tracking-[-0.07em] text-white/[0.06]">
        saar
      </div>
    </footer>
  );
}
