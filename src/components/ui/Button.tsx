import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { LoaderCircle } from 'lucide-react';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'lime' | 'white';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-white hover:bg-forest-2 shadow-[0_1px_0_rgb(255_255_255/0.15)_inset,0_6px_16px_-6px_rgb(31_70_52/0.6)]',
  dark: 'bg-ink text-white hover:bg-ink-2',
  outline: 'border border-stone bg-white/60 text-ink hover:bg-white hover:border-ink/30',
  ghost: 'text-ink-2 hover:bg-sand hover:text-ink',
  lime: 'bg-lime text-ink hover:brightness-95',
  white: 'bg-white text-ink hover:bg-paper shadow-sm',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-13 px-7 text-base',
};

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', extra = '') =>
  `${base} ${variants[variant]} ${sizes[size]} ${extra}`;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant, size, loading, icon, className = '', children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function ButtonLink({ variant, size, icon, iconRight, className = '', children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, `group ${className}`)} {...rest}>
      {icon}
      {children as ReactNode}
      {iconRight && <span className="transition-transform duration-200 group-hover:translate-x-0.5">{iconRight}</span>}
    </Link>
  );
}
