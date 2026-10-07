export const ORDER_CATEGORIES = [
  {
    id: 'MP ATTA',
    chartColor: '#d97706',
    label: 'MP Atta',
    classes: 'bg-amber-100 text-amber-950 border-amber-300',
    activeClasses: 'bg-amber-700 text-white border-amber-700',
  },
  {
    id: 'NORMAL ATTA',
    chartColor: '#ca8a04',
    label: 'Normal Atta',
    classes: 'bg-yellow-100 text-yellow-950 border-yellow-300',
    activeClasses: 'bg-yellow-700 text-white border-yellow-700',
  },
  {
    id: 'SABUT',
    chartColor: '#059669',
    label: 'Sabut (Whole Grains)',
    classes: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    activeClasses: 'bg-emerald-700 text-white border-emerald-700',
  },
  {
    id: 'PULSE',
    chartColor: '#e11d48',
    label: 'Pulses',
    classes: 'bg-rose-100 text-rose-950 border-rose-300',
    activeClasses: 'bg-rose-700 text-white border-rose-700',
  },
  {
    id: 'GROCERY',
    chartColor: '#0284c7',
    label: 'Grocery',
    classes: 'bg-sky-100 text-sky-950 border-sky-300',
    activeClasses: 'bg-sky-700 text-white border-sky-700',
  },
  {
    id: 'RICE',
    chartColor: '#7c3aed',
    label: 'Rice',
    classes: 'bg-violet-100 text-violet-950 border-violet-300',
    activeClasses: 'bg-violet-700 text-white border-violet-700',
  },
] as const;

export type OrderCategoryId = (typeof ORDER_CATEGORIES)[number]['id'];

export function getCategoryLabel(category: string): string {
  return (
    ORDER_CATEGORIES.find((item) => item.id === category)?.label ?? category
  );
}
