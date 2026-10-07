import { CircleAlert, PackageOpen } from 'lucide-react';
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
      <PackageOpen
        className="mx-auto h-8 w-8 text-stone-400"
        aria-hidden="true"
      />
      <p className="mt-3 text-base font-bold text-stone-800">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-stone-500">{description}</p>
      )}
    </div>
  );
}
export function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
    >
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
      {message}
    </div>
  );
}
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-stone-200 ${className}`}
    />
  );
}
