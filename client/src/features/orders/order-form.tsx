'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BillSummary } from '@/components/bill-summary';
import { CategoryTabs, ItemGrid } from '@/features/items';
import { OrderStep } from '@/components/order-step';
import { OrderTypeToggle } from '@/components/order-type-toggle';
import { ORDER_CATEGORIES, type OrderCategoryId } from '@/lib/order-categories';
import { formatCurrency } from '@/lib/format';
import { createOrder, fetchItems, updateOrder } from '@/services/orders';
import type {
  BillDraftLine,
  CatalogItem,
  Order,
  OrderInput,
  OrderType,
} from '@/types/order';
import { useToast } from '@/components/ui/toast';
import { roundMoney } from '@krishna-atta-chakki/shared/money';
import { useUnsavedChanges } from '@/components/ui/unsaved-changes';

type Props = { initialOrder?: Order | null; onSaved?: (order: Order) => void };

function toDraft(order?: Order | null): BillDraftLine[] {
  return (
    order?.items.map((item, index) => ({
      key: order._id + '-' + index,
      itemName: item.itemName,
      category: item.category,
      unit: item.unit,
      quantity: String(item.quantity),
      pricePerUnit: String(item.pricePerUnit),
    })) ?? []
  );
}

function createLineKey(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

export function OrderForm({ initialOrder = null, onSaved }: Props) {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(
    initialOrder?.orderType ?? 'DELIVERY',
  );
  const [customerName, setCustomerName] = useState(
    initialOrder?.customerName ?? '',
  );
  const [address, setAddress] = useState(initialOrder?.address ?? '');
  const [lines, setLines] = useState<BillDraftLine[]>(toDraft(initialOrder));
  const [selectedCategory, setSelectedCategory] =
    useState<OrderCategoryId>('MP ATTA');
  const [search, setSearch] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const firstField = useRef<HTMLInputElement>(null);
  const searchField = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const quantityInputs = useRef(new Map<string, HTMLInputElement>());
  const [dirty, setDirty] = useState(false);
  const toast = useToast();
  const unsavedChanges = useUnsavedChanges();
  const editing = Boolean(initialOrder);
  const searching = search.trim().length > 0;

  useEffect(() => {
    let active = true;
    fetchItems()
      .then((items) => {
        if (active) setCatalog(items);
      })
      .catch((reason: unknown) => {
        if (active)
          setCatalogError(
            reason instanceof Error
              ? reason.message
              : 'Could not load the catalog.',
          );
      })
      .finally(() => {
        if (active) setLoadingItems(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(
      'krishna-attachakki:last-category',
    );
    if (ORDER_CATEGORIES.some((category) => category.id === saved)) {
      const timer = window.setTimeout(
        () => setSelectedCategory(saved as OrderCategoryId),
        0,
      );
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const shortcuts = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        searchField.current?.focus();
      }
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!dirty || lines.length === 0) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('keydown', shortcuts);
    window.addEventListener('beforeunload', warnBeforeLeave);
    return () => {
      window.removeEventListener('keydown', shortcuts);
      window.removeEventListener('beforeunload', warnBeforeLeave);
    };
  }, [dirty, lines.length]);

  useEffect(() => {
    const setUnsaved = unsavedChanges.setUnsaved;
    setUnsaved(dirty && lines.length > 0);
    return () => setUnsaved(false);
  }, [dirty, lines.length, unsavedChanges.setUnsaved]);

  function selectCategory(category: OrderCategoryId) {
    setSelectedCategory(category);
    window.localStorage.setItem('krishna-attachakki:last-category', category);
  }

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<OrderCategoryId, number>> = {};
    for (const item of catalog) {
      const category = item.category as OrderCategoryId;
      counts[category] = (counts[category] ?? 0) + 1;
    }
    return counts;
  }, [catalog]);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return catalog.filter((item) => {
      if (term)
        return (item.name + ' ' + item.category)
          .toLocaleLowerCase()
          .includes(term);
      return item.category === selectedCategory;
    });
  }, [catalog, search, selectedCategory]);

  const quantitiesByItemId = useMemo(() => {
    const quantities = new Map<string, number>();
    for (const item of catalog) {
      const line = lines.find(
        (entry) =>
          entry.itemId === item._id ||
          (entry.itemName === item.name && entry.unit === item.unit),
      );
      if (line) quantities.set(item._id, Number(line.quantity) || 0);
    }
    return quantities;
  }, [catalog, lines]);

  const total = roundMoney(
    lines.reduce((sum, line) => {
      const quantity = Number(line.quantity) || 0;
      const price = Number(line.pricePerUnit) || 0;
      return sum + roundMoney(quantity * price);
    }, 0),
  );

  function focusQuantity(key: string) {
    window.setTimeout(() => {
      const input = quantityInputs.current.get(key);
      input?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      input?.focus();
      input?.select();
    }, 0);
  }

  function addItem(item: CatalogItem) {
    const existing = lines.find(
      (line) =>
        line.itemId === item._id ||
        (!line.itemId &&
          line.itemName === item.name &&
          line.unit === item.unit),
    );
    if (existing) {
      focusQuantity(existing.key);
      return;
    }

    const key = createLineKey();
    setLines((current) => [
      ...current,
      {
        key,
        itemId: item._id,
        itemName: item.name,
        category: item.category,
        unit: item.unit,
        quantity: '1',
        pricePerUnit: String(item.price),
      },
    ]);
    setDirty(true);
    focusQuantity(key);
  }

  function updateLine(
    key: string,
    field: 'quantity' | 'pricePerUnit',
    value: string,
  ) {
    setLines((current) =>
      current.map((line) =>
        line.key === key ? { ...line, [field]: value } : line,
      ),
    );
    setDirty(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (orderType === 'DELIVERY' && !address.trim()) {
      setError('Please enter the delivery address.');
      toast('Please enter the delivery address.', 'error');
      return;
    }
    if (lines.length === 0) {
      setError('Add at least one item before saving.');
      toast('Add at least one item before saving.', 'error');
      return;
    }

    const input: OrderInput = {
      orderType,
      customerName: customerName.trim(),
      address: orderType === 'DELIVERY' ? address.trim() : '',
      items: lines.map(
        ({ itemName, category, unit, quantity, pricePerUnit }) => ({
          itemName,
          category,
          unit,
          quantity: Number(quantity),
          pricePerUnit: Number(pricePerUnit),
        }),
      ),
    };

    setSaving(true);
    try {
      const saved =
        editing && initialOrder
          ? await updateOrder(initialOrder._id, input)
          : await createOrder(input);
      if (editing) {
        setSuccess('Order ' + saved.billNumber + ' updated.');
        toast('Order ' + saved.billNumber + ' updated.');
        setDirty(false);
        onSaved?.(saved);
      } else {
        setSuccess('Saved successfully. Bill number: ' + saved.billNumber);
        toast('Saved successfully. Bill number: ' + saved.billNumber);
        setCustomerName('');
        setAddress('');
        setLines([]);
        setSearch('');
        setOrderType('DELIVERY');
        setDirty(false);
        window.setTimeout(() => firstField.current?.focus(), 0);
      }
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Could not save the order.',
      );
      toast(
        reason instanceof Error ? reason.message : 'Could not save the order.',
        'error',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="pb-28 lg:pb-0">
      {(error || success) && (
        <div className="mb-4 space-y-2" aria-live="polite">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900"
            >
              {success}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-6">
        <div className="min-w-0 space-y-4">
          <OrderStep
            number={1}
            title="Order Type"
            description="Choose how this order is being placed."
          >
            <OrderTypeToggle
              value={orderType}
              onChange={(value) => {
                setOrderType(value);
                setDirty(true);
              }}
            />
          </OrderStep>

          <OrderStep
            number={2}
            title="Customer"
            description="Add a name if you would like it on the bill."
          >
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-stone-700">
                Customer name{' '}
                <span className="font-normal text-stone-500">(optional)</span>
                <input
                  ref={firstField}
                  value={customerName}
                  onChange={(event) => {
                    setCustomerName(event.target.value);
                    setDirty(true);
                  }}
                  autoComplete="name"
                  placeholder="Enter customer name"
                  className="mt-1.5 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-base font-normal outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-4 focus:ring-amber-100"
                />
              </label>
              {orderType === 'DELIVERY' && (
                <label className="block text-sm font-semibold text-stone-700">
                  Delivery address <span className="text-red-700">*</span>
                  <textarea
                    required
                    value={address}
                    onChange={(event) => {
                      setAddress(event.target.value);
                      setDirty(true);
                    }}
                    autoComplete="street-address"
                    placeholder="House number, street, area"
                    rows={2}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base font-normal outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-4 focus:ring-amber-100"
                  />
                </label>
              )}
            </div>
          </OrderStep>

          <OrderStep
            number={3}
            title="Add Items"
            description="Choose a category or search the full catalog."
          >
            <div className="space-y-3">
              <label className="sr-only" htmlFor="item-search">
                Search all items
              </label>
              <div className="relative">
                <input
                  id="item-search"
                  ref={searchField}
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.preventDefault();
                  }}
                  placeholder="Search all items..."
                  className="min-h-12 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 pr-12 text-base outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-1 top-1 min-h-11 min-w-11 rounded-lg text-lg font-bold text-stone-500 hover:bg-stone-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
                  >
                    ×
                  </button>
                )}
              </div>

              <CategoryTabs
                selected={selectedCategory}
                counts={categoryCounts}
                onSelect={selectCategory}
              />

              <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                <span>
                  {searching
                    ? 'Search results across all categories'
                    : ORDER_CATEGORIES.find(
                        (category) => category.id === selectedCategory,
                      )?.label}
                </span>
                <span>{visibleItems.length} items</span>
              </div>
              <ItemGrid
                items={visibleItems}
                searching={searching}
                loading={loadingItems}
                error={catalogError}
                quantities={quantitiesByItemId}
                onSelect={addItem}
              />
            </div>
          </OrderStep>
        </div>

        <aside className="min-w-0 md:sticky md:top-[84px]">
          <BillSummary
            lines={lines}
            total={total}
            saving={saving}
            editing={editing}
            error=""
            success=""
            onRemove={(key) => {
              setLines((current) => current.filter((line) => line.key !== key));
              setDirty(true);
            }}
            onQuantityChange={(key, value) =>
              updateLine(key, 'quantity', value)
            }
            onPriceChange={(key, value) =>
              updateLine(key, 'pricePerUnit', value)
            }
            onQuantityRef={(key, element) => {
              if (element) quantityInputs.current.set(key, element);
              else quantityInputs.current.delete(key);
            }}
          />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-[68px] z-40 border-t border-stone-200 bg-white/95 px-4 pb-3 pt-3 shadow-[0_-8px_24px_rgba(41,37,36,0.10)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-[1fr_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
              Grand total
            </p>
            <p className="truncate text-2xl font-black tabular-nums text-stone-950">
              {formatCurrency(total)}
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="min-h-14 min-w-[132px] rounded-xl bg-amber-800 px-5 text-base font-extrabold text-white shadow-sm transition hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? 'Saving...' : editing ? 'Update Order' : 'Save Order'}
          </button>
        </div>
      </div>
    </form>
  );
}
