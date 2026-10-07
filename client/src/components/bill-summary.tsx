import { formatCurrency } from '@/lib/format';
import { roundMoney } from '@krishna-atta-chakki/shared/money';
import type { BillDraftLine } from '@/types/order';

type Props = {
  lines: BillDraftLine[];
  total: number;
  saving: boolean;
  editing: boolean;
  error: string;
  success: string;
  onRemove: (key: string) => void;
  onQuantityChange: (key: string, value: string) => void;
  onPriceChange: (key: string, value: string) => void;
  onQuantityRef: (key: string, element: HTMLInputElement | null) => void;
};

function calculateLineTotal(line: BillDraftLine): number {
  const amount =
    (Number(line.quantity) || 0) * (Number(line.pricePerUnit) || 0);
  return roundMoney(amount);
}

export function BillSummary({
  lines,
  total,
  saving,
  editing,
  error,
  success,
  onRemove,
  onQuantityChange,
  onPriceChange,
  onQuantityRef,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-lg font-extrabold text-stone-900">
            Bill Summary
          </h2>
          <p className="mt-0.5 text-sm text-stone-500">
            {lines.length} {lines.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <span className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-900">
          Step 4
        </span>
      </div>

      {lines.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-stone-500">
          No items added yet. Pick a category above.
        </p>
      ) : (
        <div className="space-y-3 overflow-y-visible p-3 sm:p-4 lg:max-h-[min(54vh,620px)] lg:overflow-y-auto">
          {lines.map((line) => (
            <article
              key={line.key}
              className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold text-stone-900 sm:text-base">
                    {line.itemName}
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Unit: {line.unit}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(line.key)}
                  aria-label={'Remove ' + line.itemName}
                  className="min-h-11 shrink-0 rounded-lg px-3 text-xs font-bold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <label className="text-xs font-semibold text-stone-600">
                  Quantity ({line.unit})
                  <input
                    ref={(element) => onQuantityRef(line.key, element)}
                    type="number"
                    min="0.001"
                    step="any"
                    inputMode="decimal"
                    required
                    value={line.quantity}
                    onChange={(event) =>
                      onQuantityChange(line.key, event.target.value)
                    }
                    className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base font-semibold text-stone-900 outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-100"
                  />
                </label>
                <label className="text-xs font-semibold text-stone-600">
                  Price / {line.unit}
                  <input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    required
                    value={line.pricePerUnit}
                    onChange={(event) =>
                      onPriceChange(line.key, event.target.value)
                    }
                    className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base font-semibold text-stone-900 outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-100"
                  />
                </label>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-2.5">
                <span className="text-xs font-semibold text-stone-500">
                  Line total
                </span>
                <span className="text-base font-extrabold tabular-nums text-stone-900">
                  {formatCurrency(calculateLineTotal(line))}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="border-t border-stone-200 bg-amber-50/80 p-4 sm:p-5">
        <div className="hidden items-end justify-between gap-3 lg:flex">
          <span className="pb-1 text-sm font-bold uppercase tracking-wide text-stone-600">
            Grand total
          </span>
          <span className="text-3xl font-black tabular-nums text-stone-950">
            {formatCurrency(total)}
          </span>
        </div>
        {error && (
          <p
            role="alert"
            className="mb-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800"
          >
            {error}
          </p>
        )}
        {success && (
          <p
            role="status"
            className="mb-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-800"
          >
            {success}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="hidden min-h-14 w-full rounded-xl bg-amber-800 px-5 text-base font-extrabold text-white shadow-sm transition hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 disabled:cursor-wait disabled:opacity-60 lg:block"
        >
          {saving ? 'Saving...' : editing ? 'Update Order' : 'Save Order'}
        </button>
      </div>
    </section>
  );
}
