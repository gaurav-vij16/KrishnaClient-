import { formatCurrency } from '@/lib/format';
import { getCategoryLabel } from '@/lib/order-categories';
import type { CatalogItem } from '@/types/order';

type Props = {
  item: CatalogItem;
  searching: boolean;
  quantity: number;
  onSelect: (item: CatalogItem) => void;
};

export function ItemCard({ item, searching, quantity, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex min-h-[112px] flex-col justify-between rounded-xl border border-stone-200 bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 sm:min-h-[120px]"
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span className="text-sm font-bold leading-snug text-stone-900 sm:text-base">
          {item.name}
        </span>
        {quantity > 0 && (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">
            {quantity} in bill
          </span>
        )}
      </span>
      {searching && (
        <span className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
          {getCategoryLabel(item.category)}
        </span>
      )}
      <span className="mt-3 text-sm font-extrabold text-amber-900">
        {formatCurrency(item.price)}
        <span className="font-semibold text-stone-500"> / {item.unit}</span>
      </span>
    </button>
  );
}
