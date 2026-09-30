import { Link } from 'react-router';

export function LogoMark({ className = 'size-9', light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill={light ? '#DDF08A' : '#1F4634'} />
      <path
        d="M8 20.5 16 25l8-4.5M8 15.5 16 20l8-4.5L16 11z"
        fill="none"
        stroke={light ? '#1F4634' : '#DDF08A'}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Saar home">
      <LogoMark light={light} />
      <span className={`font-display text-[26px] font-semibold tracking-[-0.05em] ${light ? 'text-white' : 'text-ink'}`}>saar</span>
    </Link>
  );
}
