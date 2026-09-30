import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Plus, X } from 'lucide-react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-white ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  action,
  className = '',
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-6xl">{title}</h2>
        {body && <p className="mt-5 max-w-xl text-lg leading-relaxed text-mute">{body}</p>}
      </div>
      {action}
    </div>
  );
}

/** Fades children in when they scroll into view. */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Accordion({ items, defaultOpen = 0 }: { items: { title: ReactNode; body: ReactNode; meta?: ReactNode }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full cursor-pointer items-center gap-6 py-6 text-left"
              aria-expanded={isOpen}
            >
              {item.meta}
              <span className="flex-1 font-display text-xl font-medium tracking-tight sm:text-2xl">{item.title}</span>
              <span className={`grid size-10 shrink-0 place-items-center rounded-full border border-stone transition-all duration-300 ${isOpen ? 'rotate-45 bg-ink text-white border-ink' : ''}`}>
                <Plus className="size-4" />
              </span>
            </button>
            <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="pb-7 pr-16 text-[17px] leading-relaxed text-mute">{item.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className = '',
}: {
  tabs: { id: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={`no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-sand p-1 ${className}`} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium transition-all ${
            value === t.id ? 'bg-white text-ink shadow-sm' : 'text-mute hover:text-ink'
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={`rounded-full px-1.5 text-[11px] ${value === t.id ? 'bg-ink text-white' : 'bg-stone/70 text-ink-2'}`}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} animate-rise rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8`}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <button onClick={onClose} className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-sand hover:bg-stone" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone bg-white/50 px-6 py-16 text-center">
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-sand text-ink-2">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-mute">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Field({ label, hint, children, error }: { label: string; hint?: string; children: ReactNode; error?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-2">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-sm text-bad">{error}</span> : hint && <span className="mt-1.5 block text-sm text-faint">{hint}</span>}
    </label>
  );
}

export const inputClass =
  'h-12 w-full rounded-xl border border-stone bg-white px-4 text-[15px] text-ink placeholder:text-faint transition focus:border-forest focus:outline-none focus:ring-4 focus:ring-forest/10';

export function Stat({ value, label, className = '' }: { value: ReactNode; label: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{value}</div>
      <div className="mt-2 text-sm text-mute">{label}</div>
    </div>
  );
}
