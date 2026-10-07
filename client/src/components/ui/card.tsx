import type { HTMLAttributes } from 'react';
export function Card({
  className = '',
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...props}
      className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}
    />
  );
}
