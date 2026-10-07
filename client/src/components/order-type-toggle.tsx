import type { OrderType } from '@/types/order';

type Props = {
  value: OrderType;
  onChange: (value: OrderType) => void;
};

const OPTIONS = [
  { value: 'DELIVERY', label: 'Delivery', hint: 'Address required' },
  { value: 'WALK_IN', label: 'Walk-in', hint: 'Customer at shop' },
] as const;

export function OrderTypeToggle({ value, onChange }: Props) {
  return (
    <div
      className="grid grid-cols-2 gap-3"
      role="group"
      aria-label="Order type"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        const stateClasses = selected
          ? 'border-amber-700 bg-amber-50 shadow-sm'
          : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/50';
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={
              'min-h-[76px] rounded-xl border-2 px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 ' +
              stateClasses
            }
          >
            <span
              className={
                'block text-base font-extrabold sm:text-lg ' +
                (selected ? 'text-amber-950' : 'text-stone-800')
              }
            >
              {option.label}
            </span>
            <span className="mt-1 block text-xs font-medium text-stone-500">
              {option.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
