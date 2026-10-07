'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Printer,
  Search,
} from 'lucide-react';
import type {
  ReportPeriodType,
  ReportResponse,
} from '@krishna-atta-chakki/shared/reports';
import { AppNavigation } from '@/components/app-navigation';
import {
  Badge,
  Button,
  Card,
  DatePicker,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Tabs,
  useToast,
} from '@/components/ui';
import { ORDER_CATEGORIES, getCategoryLabel } from '@/lib/order-categories';
import {
  formatCurrency,
  formatDateTime,
  formatTime,
  todayInKolkata,
} from '@/lib/format';
import { shopConfig } from '@/lib/shop';
import { downloadReport, fetchReport } from '@/services/reports';

const periodOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

type SortBy = 'quantity' | 'sales';

function shiftDay(value: string, amount: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function shiftMonth(value: string, amount: number): string {
  const date = new Date(`${value}-01T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 7);
}

function startOfWeek(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(
    date.getUTCDate() - ((weekday - shopConfig.weekStartsOn + 7) % 7),
  );
  return date.toISOString().slice(0, 10);
}

function categoryRank(category: string): number {
  const rank = ORDER_CATEGORIES.findIndex((item) => item.id === category);
  return rank < 0 ? ORDER_CATEGORIES.length : rank;
}

function categoryColor(category: string): string {
  return (
    ORDER_CATEGORIES.find((item) => item.id === category)?.chartColor ??
    '#78716c'
  );
}

export function ReportsPage() {
  const today = todayInKolkata();
  const [type, setType] = useState<ReportPeriodType>('daily');
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('quantity');
  const toast = useToast();
  const requested = type === 'monthly' ? month : date;
  const reportKey = `${type}:${requested}`;
  const loading = loadedKey !== reportKey;

  useEffect(() => {
    let active = true;
    fetchReport(type, requested)
      .then((result) => {
        if (active) {
          setReport(result);
          setError('');
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setReport(null);
          setError(
            reason instanceof Error
              ? reason.message
              : 'Could not load this report.',
          );
        }
      })
      .finally(() => {
        if (active) setLoadedKey(reportKey);
      });
    return () => {
      active = false;
    };
  }, [type, requested, reportKey]);

  const visibleItems = useMemo(() => {
    const term = itemSearch.trim().toLocaleLowerCase();
    return [...(report?.itemsSold ?? [])]
      .filter((item) =>
        `${item.itemName} ${item.category}`.toLocaleLowerCase().includes(term),
      )
      .sort(
        (left, right) =>
          categoryRank(left.category) - categoryRank(right.category) ||
          (sortBy === 'quantity'
            ? right.totalQuantity - left.totalQuantity
            : right.totalSales - left.totalSales) ||
          left.itemName.localeCompare(right.itemName),
      );
  }, [report, itemSearch, sortBy]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, typeof visibleItems>();
    visibleItems.forEach((item) => {
      const group = groups.get(item.category) ?? [];
      group.push(item);
      groups.set(item.category, group);
    });
    return [...groups.entries()];
  }, [visibleItems]);

  function quickPeriod(
    kind:
      | 'today'
      | 'yesterday'
      | 'this-week'
      | 'last-week'
      | 'this-month'
      | 'last-month',
  ) {
    if (kind === 'today' || kind === 'yesterday') {
      setType('daily');
      setDate(kind === 'today' ? today : shiftDay(today, -1));
    } else if (kind === 'this-week' || kind === 'last-week') {
      setType('weekly');
      setDate(shiftDay(startOfWeek(today), kind === 'this-week' ? 0 : -7));
    } else {
      setType('monthly');
      setMonth(shiftMonth(today.slice(0, 7), kind === 'this-month' ? 0 : -1));
    }
  }

  function movePeriod(amount: number) {
    if (type === 'monthly') setMonth((value) => shiftMonth(value, amount));
    else
      setDate((value) => shiftDay(value, amount * (type === 'weekly' ? 7 : 1)));
  }

  async function exportExcel() {
    setExporting(true);
    try {
      await downloadReport(type, requested);
      toast('Excel report downloaded.');
    } catch (reason) {
      toast(
        reason instanceof Error
          ? reason.message
          : 'Could not download the report.',
        'error',
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <AppNavigation current="reports" />
      <main className="mx-auto min-h-screen max-w-[1440px] space-y-4 px-4 py-5 pb-24 sm:px-6 lg:ml-64 lg:space-y-5 lg:py-7">
        <div className="print-header hidden">
          <h1 className="text-2xl font-bold">{shopConfig.shopName}</h1>
          <p className="mt-1">
            {report?.period.label} · {type[0].toUpperCase() + type.slice(1)}{' '}
            report
          </p>
          <p className="mt-1 text-xs">
            Printed {formatDateTime(new Date().toISOString())}
          </p>
        </div>
        <PageHeader
          eyebrow="Daily bill book"
          title="Reports"
          description="See exactly what was sold by day, week, or month."
          actions={
            <div className="no-print flex flex-wrap justify-end gap-2">
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button
                variant="primary"
                disabled={exporting || loading || Boolean(error)}
                onClick={() => void exportExcel()}
              >
                <ArrowDownToLine className="h-4 w-4" />
                {exporting ? 'Preparing…' : 'Download Excel'}
              </Button>
            </div>
          }
        />

        <Card className="no-print flex flex-col gap-3 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              value={type}
              options={periodOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(value) => setType(value as ReportPeriodType)}
            />
            <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
              <Button
                className="shrink-0"
                aria-label="Previous period"
                onClick={() => movePeriod(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {type === 'monthly' ? (
                <DatePicker
                  label="Choose month"
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  containerClassName="min-w-0 flex-1 sm:max-w-48 sm:flex-none"
                  className="min-w-0"
                />
              ) : (
                <DatePicker
                  label={type === 'daily' ? 'Choose date' : 'Choose week'}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  containerClassName="min-w-0 flex-1 sm:max-w-52 sm:flex-none"
                  className="min-w-0"
                />
              )}
              <Button
                className="shrink-0"
                aria-label="Next period"
                onClick={() => movePeriod(1)}
                disabled={
                  requested >= (type === 'monthly' ? today.slice(0, 7) : today)
                }
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-3">
            {(
              [
                ['Today', 'today'],
                ['Yesterday', 'yesterday'],
                ['This Week', 'this-week'],
                ['Last Week', 'last-week'],
                ['This Month', 'this-month'],
                ['Last Month', 'last-month'],
              ] as const
            ).map(([label, key]) => (
              <Button
                key={key}
                className="min-h-9 px-3 text-xs"
                onClick={() => quickPeriod(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </Card>

        {error && (
          <div className="print:hidden">
            <ErrorState message={error} />
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-72" />
          </div>
        ) : report ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: 'Walk-in',
                  orders: report.summary.walkInOrders,
                  sales: report.summary.walkInSales,
                  tone: 'green' as const,
                },
                {
                  label: 'Delivery',
                  orders: report.summary.deliveryOrders,
                  sales: report.summary.deliverySales,
                  tone: 'blue' as const,
                },
                {
                  label: 'Total',
                  orders: report.summary.totalOrders,
                  sales: report.summary.totalSales,
                  tone: 'amber' as const,
                },
              ].map((stat) => (
                <Card key={stat.label} className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-stone-600">
                      {stat.label}
                    </h2>
                    <Badge tone={stat.tone}>{stat.label}</Badge>
                  </div>
                  <p className="mt-2 text-2xl font-black tracking-tight text-stone-950">
                    {stat.orders.toLocaleString('en-IN')}{' '}
                    <span className="text-base font-semibold">orders</span>
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-amber-900">
                    {formatCurrency(stat.sales)}
                  </p>
                </Card>
              ))}
            </div>

            {report.summary.totalOrders === 0 ? (
              <EmptyState
                title="No orders for this period"
                description="Orders saved during this period will appear here."
              />
            ) : (
              <Card className="overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-stone-100 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
                  <div>
                    <h2 className="text-lg font-extrabold text-stone-950">
                      Items Sold
                    </h2>
                    <p className="mt-0.5 text-sm text-stone-500">
                      {report.period.label}
                    </p>
                  </div>
                  <div className="no-print flex flex-wrap gap-2">
                    <label className="relative">
                      <span className="sr-only">Search sold items</span>
                      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
                      <Input
                        value={itemSearch}
                        onChange={(event) => setItemSearch(event.target.value)}
                        placeholder="Search items"
                        className="pl-9 sm:w-52"
                      />
                    </label>
                    <label className="sr-only" htmlFor="sort-sold-items">
                      Sort sold items
                    </label>
                    <Select
                      id="sort-sold-items"
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(event.target.value as SortBy)
                      }
                    >
                      <option value="quantity">Sort by quantity</option>
                      <option value="sales">Sort by sales</option>
                    </Select>
                  </div>
                </div>
                {groupedItems.length === 0 ? (
                  <p className="p-8 text-center text-sm text-stone-500">
                    No items match this search.
                  </p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {groupedItems.map(([category, items]) => {
                      const categoryTotal =
                        report.categoryTotals.find(
                          (total) => total.category === category,
                        )?.totalSales ?? 0;
                      return (
                        <section
                          key={category}
                          aria-label={`${getCategoryLabel(category)} items sold`}
                        >
                          <h3
                            className="border-l-4 px-4 py-2.5 text-sm font-extrabold text-stone-900 sm:px-5"
                            style={{
                              borderColor: categoryColor(category),
                              backgroundColor: `${categoryColor(category)}12`,
                            }}
                          >
                            {getCategoryLabel(category)}
                          </h3>
                          <div className="hidden sm:block">
                            <table className="w-full text-left">
                              <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
                                <tr>
                                  <th className="px-5 py-2.5">Item</th>
                                  <th className="px-5 py-2.5 text-right">
                                    Quantity
                                  </th>
                                  <th className="px-5 py-2.5 text-right">
                                    Sales
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                {items.map((item) => (
                                  <tr key={`${item.itemName}-${item.unit}`}>
                                    <td className="px-5 py-3 font-semibold text-stone-900">
                                      {item.itemName}
                                    </td>
                                    <td className="px-5 py-3 text-right tabular-nums text-stone-700">
                                      {item.totalQuantity.toLocaleString(
                                        'en-IN',
                                        { maximumFractionDigits: 2 },
                                      )}{' '}
                                      {item.unit}
                                    </td>
                                    <td className="px-5 py-3 text-right font-bold tabular-nums text-stone-950">
                                      {formatCurrency(item.totalSales)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-amber-50/70">
                                <tr>
                                  <th className="px-5 py-3 text-left text-sm font-extrabold text-stone-800">
                                    Category subtotal
                                  </th>
                                  <td />
                                  <td className="px-5 py-3 text-right font-extrabold tabular-nums text-amber-950">
                                    {formatCurrency(categoryTotal)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                          <div className="divide-y divide-stone-100 sm:hidden">
                            {items.map((item) => (
                              <article
                                key={`${item.itemName}-${item.unit}`}
                                className="flex items-center justify-between gap-3 px-4 py-3"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-stone-900">
                                    {item.itemName}
                                  </p>
                                  <p className="mt-0.5 text-sm tabular-nums text-stone-600">
                                    {item.totalQuantity.toLocaleString(
                                      'en-IN',
                                      { maximumFractionDigits: 2 },
                                    )}{' '}
                                    {item.unit}
                                  </p>
                                </div>
                                <strong className="shrink-0 text-sm tabular-nums text-stone-950">
                                  {formatCurrency(item.totalSales)}
                                </strong>
                              </article>
                            ))}
                            <div className="flex justify-between gap-3 bg-amber-50/70 px-4 py-3 text-sm">
                              <strong>Category subtotal</strong>
                              <strong className="tabular-nums">
                                {formatCurrency(categoryTotal)}
                              </strong>
                            </div>
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}

            {type === 'daily' && (
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-stone-100 p-4">
                  <div>
                    <h2 className="text-base font-extrabold text-stone-950">
                      Today&apos;s Orders
                    </h2>
                    <p className="text-sm text-stone-500">
                      {report.orders?.length ?? 0} orders ·{' '}
                      {formatCurrency(report.summary.totalSales)}
                    </p>
                  </div>
                  <Link
                    className="no-print text-sm font-bold text-amber-900 hover:underline"
                    href={`/orders?date=${date}`}
                  >
                    Open Orders
                  </Link>
                </div>
                {!report.orders?.length ? (
                  <p className="p-6 text-center text-sm text-stone-500">
                    No orders for this day.
                  </p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {report.orders.map((order) => (
                      <article
                        key={order._id}
                        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-stone-950">
                              {order.billNumber}
                            </span>
                            <Badge
                              tone={
                                order.orderType === 'DELIVERY'
                                  ? 'blue'
                                  : 'green'
                              }
                            >
                              {order.orderType === 'DELIVERY'
                                ? 'Delivery'
                                : 'Walk-in'}
                            </Badge>
                            <span className="text-sm text-stone-500">
                              {formatTime(order.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-stone-600">
                            {order.customerName || 'Walk-in customer'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <strong className="tabular-nums">
                            {formatCurrency(order.totalAmount)}
                          </strong>
                          <Link
                            aria-label={`Edit bill ${order.billNumber}`}
                            className="no-print inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold text-amber-900 hover:bg-amber-50"
                            href={`/orders?date=${date}&search=${encodeURIComponent(order.billNumber)}`}
                          >
                            Edit
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </>
        ) : null}
      </main>
    </>
  );
}
