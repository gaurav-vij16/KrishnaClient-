export function Tabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="tablist"
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-stone-100 p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-10 shrink-0 rounded-lg px-3 text-sm font-bold transition ${value === option.value ? 'bg-white text-amber-900 shadow-sm' : 'text-stone-600 hover:text-stone-950'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
