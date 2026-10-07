import type { SelectHTMLAttributes } from 'react';
export function Select({
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`min-h-11 rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-100 ${className}`}
    />
  );
}
