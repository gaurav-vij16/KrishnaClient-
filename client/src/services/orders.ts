import type { CatalogItem, Order, OrderInput, OrderType } from '@/types/order';
import { apiRequest } from '@/lib/api';

export function fetchItems(category?: string): Promise<CatalogItem[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiRequest(`/api/items${query}`);
}

export type OrdersPage = {
  data: Order[];
  page: number;
  limit: number;
  total: number;
};
export function fetchOrders(
  date: string,
  options: { page: number; search?: string; orderType?: '' | OrderType },
): Promise<OrdersPage> {
  const query = new URLSearchParams({
    date,
    page: String(options.page),
    limit: '50',
  });
  if (options.search) query.set('search', options.search);
  if (options.orderType) query.set('orderType', options.orderType);
  return apiRequest(`/api/orders?${query.toString()}`);
}

export function createOrder(input: OrderInput): Promise<Order> {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateOrder(id: string, input: OrderInput): Promise<Order> {
  return apiRequest(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function removeOrder(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/api/orders/${id}`, { method: 'DELETE' });
}
