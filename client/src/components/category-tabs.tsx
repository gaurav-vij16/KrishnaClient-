import { ORDER_CATEGORIES, type OrderCategoryId } from '@/lib/order-categories';

type Props = {
  selected: OrderCategoryId;
  counts: Partial<Record<OrderCategoryId, number>>;
  onSelect: (category: OrderCategoryId) => void;
};

export function CategoryTabs({ selected, counts, onSelect }: Props) {
  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
      role="tablist"
      aria-label="Catalog category"
    >
      {ORDER_CATEGORIES.map((category) => {
        const active = selected === category.id;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(category.id)}
            className={
              'min-h-12 shrink-0 whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 ' +
              (active
                ? category.activeClasses
                : category.classes + ' opacity-75 hover:opacity-100')
            }
          >
            {category.label}
            <span className="ml-1.5 text-xs opacity-75">
              {counts[category.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
