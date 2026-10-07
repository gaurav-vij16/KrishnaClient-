'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppNavigation } from '@/components/app-navigation';
import { OrderForm } from '@/features/orders/order-form';
import { formatCurrency, formatTime, todayInKolkata } from '@/lib/format';
import { fetchOrders, removeOrder } from '@/services/orders';
import { fetchReport } from '@/services/reports';
import type { Order, OrderType } from '@/types/order';
import type { ReportResponse } from '@krishna-atta-chakki/shared/reports';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { useToast } from '@/components/ui/toast';
import { useUnsavedChanges } from '@/components/ui/unsaved-changes';

function itemsSummary(order: Order): string {
  return order.items
    .map((item) => item.itemName + ' - ' + item.quantity + ' ' + item.unit)
    .join(', ');
}

function customerDisplayName(order: Order): string {
  if (order.customerName) return order.customerName;
  return order.orderType === 'WALK_IN'
    ? 'Walk-in customer'
    : 'Customer not named';
}

function TypeBadge({ orderType }: { orderType: Order['orderType'] }) {
  const delivery = orderType === 'DELIVERY';
  return (
    <span
      className={
        'inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-bold ' +
        (delivery
          ? 'bg-sky-100 text-sky-900'
          : 'bg-emerald-100 text-emerald-900')
      }
    >
      {delivery ? 'Delivery' : 'Walk-in'}
    </span>
  );
}

export default function OrdersPage() {
  const [date, setDate] = useState(todayInKolkata);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadedDate, setLoadedDate] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [orderType, setOrderType] = useState<'' | OrderType>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dailySummary, setDailySummary] = useState<
    ReportResponse['summary'] | null
  >(null);
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const toast = useToast();
  const unsavedChanges = useUnsavedChanges();
  const requestKey = `${date}:${page}:${appliedSearch}:${orderType}`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedDate = params.get('date');
    const requestedSearch = params.get('search');
    if (!requestedDate && !requestedSearch) return;
    const timer = window.setTimeout(() => {
      if (requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate))
        setDate(requestedDate);
      if (requestedSearch) setSearch(requestedSearch);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchOrders(date, { page, search: appliedSearch, orderType }),
      fetchReport('daily', date, true),
    ])
      .then(([result, report]) => {
        if (active) {
          setOrders(result.data);
          setTotal(result.total);
          setDailySummary(report.summary);
          setError('');
        }
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error ? reason.message : 'Could not load orders.',
          );
      })
      .finally(() => {
        if (active) setLoadedDate(requestKey);
      });
    return () => {
      active = false;
    };
  }, [date, refreshVersion, page, appliedSearch, orderType, requestKey]);

  const loading = loadedDate !== requestKey;
  const editingOrder = orders.find((order) => order._id === editingId) ?? null;

  async function deleteEntry(order: Order) {
    try {
      await removeOrder(order._id);
      setConfirmOrder(null);
      if (editingId === order._id) setEditingId(null);
      setRefreshVersion((version) => version + 1);
      toast('Bill ' + order.billNumber + ' deleted.');
    } catch (reason) {
      toast(
        reason instanceof Error
          ? reason.message
          : 'Could not delete the order.',
        'error',
      );
    }
  }

  function toggleEdit(order: Order) {
    setEditingId((current) => (current === order._id ? null : order._id));
  }

  return (
    <>
      <AppNavigation current="orders" />
      <main className="mx-auto min-h-screen max-w-[1440px] px-4 py-5 pb-24 sm:px-6 lg:ml-64 lg:py-7">
        <PageHeader
          eyebrow="Daily bill book"
          title="Orders"
          description="Find, review, and update saved bills."
          actions={
            <Link
              href="/"
              onClick={(event) => {
                if (
                  unsavedChanges.unsaved &&
                  !window.confirm(
                    'You have an unsaved order. Leave this page and discard it?',
                  )
                )
                  event.preventDefault();
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-800 px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-amber-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
            >
              + New Order
            </Link>
          }
        />

        <section className="mb-5 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(220px,0.7fr)_1.3fr] sm:items-end sm:p-5">
          <label className="block text-sm font-bold text-stone-700">
            Select date
            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setPage(1);
              }}
              className="mt-1.5 min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base font-medium text-stone-900 outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-100"
            />
          </label>
          <div className="flex min-h-12 flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-stone-50 px-4 py-2">
            <p className="text-sm text-stone-700">
              <span className="font-bold text-stone-950">
                {dailySummary?.totalOrders ?? '—'}
              </span>{' '}
              {(dailySummary?.totalOrders ?? 0) === 1 ? 'order' : 'orders'} for
              this day
            </p>
            <span
              className="hidden h-6 w-px bg-stone-300 sm:block"
              aria-hidden="true"
            />
            <p className="text-sm text-stone-700">
              Total amount{' '}
              <span className="ml-1 text-lg font-extrabold tabular-nums text-stone-950">
                {formatCurrency(dailySummary?.totalSales ?? 0)}
              </span>
            </p>
          </div>
        </section>

        <section
          aria-label="Search and filter orders"
          className="mb-4 grid gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr_200px] sm:p-4"
        >
          <label className="relative block">
            <span className="sr-only">Search by bill number or customer</span>
            <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-stone-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bill number or customer"
              className="pl-10"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-600">
            <span className="sr-only">Filter by order type</span>
            <Select
              value={orderType}
              onChange={(event) => {
                setOrderType(event.target.value as '' | OrderType);
                setPage(1);
              }}
              className="w-full"
            >
              <option value="">All order types</option>
              <option value="DELIVERY">Delivery</option>
              <option value="WALK_IN">Walk-in</option>
            </Select>
          </label>
        </section>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
          >
            {error}
          </p>
        )}

        {editingOrder && (
          <section className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Correct order
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-stone-950">
                  {editingOrder.billNumber}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="min-h-11 rounded-lg px-3 text-sm font-bold text-stone-600 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
              >
                Close
              </button>
            </div>
            <OrderForm
              key={editingOrder._id}
              initialOrder={editingOrder}
              onSaved={() => {
                setEditingId(null);
                setRefreshVersion((version) => version + 1);
              }}
            />
          </section>
        )}

        {loading ? (
          <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
            <p className="text-lg font-bold text-stone-800">
              {search || orderType
                ? 'No matching orders'
                : 'No orders for this date'}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {search || orderType
                ? 'Try a different search or filter.'
                : 'New bills will appear here after they are saved.'}
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-amber-100 px-4 text-sm font-bold text-amber-950 hover:bg-amber-200"
            >
              Create an order
            </Link>
          </section>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="hidden w-full min-w-[900px] table-fixed text-left lg:table">
                  <thead className="bg-stone-100 text-xs font-bold uppercase tracking-wide text-stone-600">
                    <tr>
                      <th className="w-[150px] px-4 py-3">Bill / Time</th>
                      <th className="w-[110px] px-3 py-3">Type</th>
                      <th className="w-[190px] px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Items</th>
                      <th className="w-[130px] px-3 py-3 text-right">Total</th>
                      <th className="w-[150px] px-4 py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="align-top hover:bg-amber-50/30"
                      >
                        <td className="px-4 py-4">
                          <p className="font-extrabold text-stone-950">
                            {order.billNumber}
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            {formatTime(order.createdAt)}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <TypeBadge orderType={order.orderType} />
                        </td>
                        <td className="px-3 py-4">
                          <p className="break-words text-sm font-semibold text-stone-800">
                            {customerDisplayName(order)}
                          </p>
                          {order.address && (
                            <p className="mt-1 break-words text-xs leading-5 text-stone-500">
                              {order.address}
                            </p>
                          )}
                        </td>
                        <td className="break-words px-3 py-4 text-sm leading-6 text-stone-700">
                          {itemsSummary(order)}
                        </td>
                        <td className="px-3 py-4 text-right font-extrabold tabular-nums text-stone-950">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => toggleEdit(order)}
                              className="min-h-11 rounded-lg px-3 text-sm font-bold text-amber-900 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmOrder(order)}
                              className="min-h-11 rounded-lg px-3 text-sm font-bold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="space-y-3 p-3 lg:hidden">
                  {orders.map((order) => (
                    <article
                      key={order._id}
                      className="rounded-xl border border-stone-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-base font-extrabold text-stone-950">
                            {order.billNumber}
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            {formatTime(order.createdAt)}
                          </p>
                        </div>
                        <TypeBadge orderType={order.orderType} />
                      </div>
                      <div className="mt-3 border-t border-stone-100 pt-3">
                        <p className="text-sm font-semibold text-stone-800">
                          {customerDisplayName(order)}
                        </p>
                        {order.address && (
                          <p className="mt-0.5 break-words text-sm text-stone-500">
                            {order.address}
                          </p>
                        )}
                        <p className="mt-2 break-words text-sm leading-6 text-stone-700">
                          {itemsSummary(order)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
                        <p className="text-xl font-extrabold tabular-nums text-stone-950">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleEdit(order)}
                            className="min-h-11 rounded-lg px-3 text-sm font-bold text-amber-900 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmOrder(order)}
                            className="min-h-11 rounded-lg px-3 text-sm font-bold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        {!loading && total > 0 && (
          <div className="mt-3 rounded-2xl border border-stone-200 bg-white">
            <Pagination
              page={page}
              limit={50}
              total={total}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>
      <ConfirmDialog
        open={Boolean(confirmOrder)}
        title="Delete this bill?"
        description={
          confirmOrder
            ? `Bill ${confirmOrder.billNumber} will be permanently removed.`
            : ''
        }
        onCancel={() => setConfirmOrder(null)}
        onConfirm={() => confirmOrder && void deleteEntry(confirmOrder)}
      />
    </>
  );
}
