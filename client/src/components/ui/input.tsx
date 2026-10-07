import type { InputHTMLAttributes } from 'react';
export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-4 focus:ring-amber-100 ${className}`}
    />
  );
}
