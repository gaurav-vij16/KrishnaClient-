import { ItemCard } from '@/components/item-card';
import type { CatalogItem } from '@/types/order';

type Props = {
  items: CatalogItem[];
  searching: boolean;
  loading: boolean;
  error?: string;
  quantities: Map<string, number>;
  onSelect: (item: CatalogItem) => void;
};

export function ItemGrid({
  items,
  searching,
  loading,
  error,
  quantities,
  onSelect,
}: Props) {
  if (loading) {
    return (
      <p className="rounded-xl bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
        Loading catalog...
      </p>
    );
  }
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl bg-red-50 px-4 py-5 text-sm text-red-800"
      >
        {error}
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
        {searching
          ? 'No items match that search.'
          : 'No items in this category yet.'}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard
          key={item._id}
          item={item}
          searching={searching}
          quantity={quantities.get(item._id) ?? 0}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
