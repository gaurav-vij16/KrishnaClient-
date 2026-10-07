import { ClipboardList, PlusCircle, ChartNoAxesCombined } from 'lucide-react';

export const navigationItems = [
  { label: 'New Order', href: '/', id: 'new', icon: PlusCircle },
  { label: 'Orders', href: '/orders', id: 'orders', icon: ClipboardList },
  {
    label: 'Reports',
    href: '/reports',
    id: 'reports',
    icon: ChartNoAxesCombined,
  },
] as const;
