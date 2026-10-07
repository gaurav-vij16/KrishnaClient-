import { formatCurrency } from '@/lib/format';

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-stone-500">{label}</p>
        {Icon && <Icon className="h-5 w-5 text-amber-800" aria-hidden="true" />}
      </div>
      <p className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
        {typeof value === 'number' ? formatCurrency(value) : value}
      </p>
    </section>
  );
}
