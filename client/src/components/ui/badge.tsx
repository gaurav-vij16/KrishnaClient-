export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'amber' | 'green' | 'red' | 'blue' | 'violet';
}) {
  const colors = {
    neutral: 'bg-stone-100 text-stone-700',
    amber: 'bg-amber-100 text-amber-900',
    green: 'bg-emerald-100 text-emerald-900',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-sky-100 text-sky-900',
    violet: 'bg-violet-100 text-violet-900',
  };
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-bold ${colors[tone]}`}
    >
      {children}
    </span>
  );
}
