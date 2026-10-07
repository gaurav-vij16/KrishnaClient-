import type { ReactNode } from 'react';
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold text-amber-800">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-stone-600">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
