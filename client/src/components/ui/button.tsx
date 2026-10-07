import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};
const variants = {
  primary:
    'bg-amber-800 text-white shadow-sm hover:bg-amber-900 focus-visible:ring-amber-300',
  secondary:
    'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 focus-visible:ring-amber-200',
  ghost: 'text-stone-700 hover:bg-stone-100 focus-visible:ring-amber-200',
  danger: 'text-red-700 hover:bg-red-50 focus-visible:ring-red-200',
};
export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  );
}
