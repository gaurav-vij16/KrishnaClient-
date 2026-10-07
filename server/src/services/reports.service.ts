import type {
  ReportPeriodType,
  ReportResponse,
} from '@krishna-atta-chakki/shared/reports';
import { createRequire } from 'node:module';
import { Order } from '../models/order.model';
import { shopConfig } from '../config/shop';
import { shopLocalToUtc } from '../utils/timezone';

const { roundMoney } = createRequire(__filename)(
  '../../../shared/utils/money.js',
) as typeof import('../../../shared/utils/money.js');

type ReportRange = {
  startKey: string;
  endKey: string;
  start: Date;
  end: Date;
};

const categoryOrder = [
  'MP ATTA',
  'NORMAL ATTA',
  'SABUT',
  'PULSE',
  'GROCERY',
  'RICE',
];

function addDays(key: string, days: number): string {
  const date = new Date(`${key}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateLabel(key: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${key}T00:00:00.000Z`));
}

function resolveRange(
  type: ReportPeriodType,
  requested: string,
): ReportRange | null {
  let startKey: string;
  if (type === 'monthly') {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(requested)) return null;
    startKey = `${requested}-01`;
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(requested)) return null;
    const parsed = new Date(`${requested}T00:00:00.000Z`);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== requested
    )
      return null;
    startKey = requested;
    if (type === 'weekly') {
      const weekday = parsed.getUTCDay() || 7;
      const offset = (weekday - shopConfig.weekStartsOn + 7) % 7;
      startKey = addDays(startKey, -offset);
    }
  }

  let endKey: string;
  if (type === 'daily') endKey = addDays(startKey, 1);
  else if (type === 'weekly') endKey = addDays(startKey, 7);
  else {
    const [year, month] = startKey.split('-').map(Number);
    endKey = `${month === 12 ? year + 1 : year}-${String((month % 12) + 1).padStart(2, '0')}-01`;
  }

  return {
    startKey,
    endKey,
    start: shopLocalToUtc(startKey),
    end: shopLocalToUtc(endKey),
  };
}

function periodLabel(type: ReportPeriodType, range: ReportRange): string {
  if (type === 'daily') return dateLabel(range.startKey);
  if (type === 'weekly')
    return `${dateLabel(range.startKey)} – ${dateLabel(addDays(range.endKey, -1))}`;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${range.startKey}T00:00:00.000Z`));
}

function categoryRank(category: string): number {
  const index = categoryOrder.indexOf(category);
  return index < 0 ? categoryOrder.length : index;
}

function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function createReport(
  type: ReportPeriodType,
  requested: string,
  includeOrders = type === 'daily',
): Promise<ReportResponse | null> {
  const range = resolveRange(type, requested);
  if (!range) return null;
  const match = { createdAt: { $gte: range.start, $lt: range.end } };

  const [summaryRows, itemRows, categoryRows, orderRows] = await Promise.all([
    Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$createdAt',
              unit: 'day',
              timezone: shopConfig.timezone,
            },
          },
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$totalAmount' },
          walkInOrders: {
            $sum: { $cond: [{ $eq: ['$orderType', 'WALK_IN'] }, 1, 0] },
          },
          walkInSales: {
            $sum: {
              $cond: [{ $eq: ['$orderType', 'WALK_IN'] }, '$totalAmount', 0],
            },
          },
          deliveryOrders: {
            $sum: { $cond: [{ $eq: ['$orderType', 'DELIVERY'] }, 1, 0] },
          },
          deliverySales: {
            $sum: {
              $cond: [{ $eq: ['$orderType', 'DELIVERY'] }, '$totalAmount', 0],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: '$totalOrders' },
          totalSales: { $sum: '$totalSales' },
          walkInOrders: { $sum: '$walkInOrders' },
          walkInSales: { $sum: '$walkInSales' },
          deliveryOrders: { $sum: '$deliveryOrders' },
          deliverySales: { $sum: '$deliverySales' },
        },
      },
    ]),
    Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            itemName: '$items.itemName',
            unit: '$items.unit',
            category: { $ifNull: ['$items.category', 'Uncategorized'] },
          },
          ordersCount: { $addToSet: '$_id' },
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: { $sum: '$items.lineTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          itemName: '$_id.itemName',
          unit: '$_id.unit',
          category: '$_id.category',
          ordersCount: { $size: '$ordersCount' },
          totalQuantity: 1,
          totalSales: 1,
        },
      },
    ]),
    Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $ifNull: ['$items.category', 'Uncategorized'] },
          totalSales: { $sum: '$items.lineTotal' },
        },
      },
      { $project: { _id: 0, category: '$_id', totalSales: 1 } },
    ]),
    includeOrders
      ? Order.aggregate([
          { $match: match },
          { $sort: { createdAt: 1, _id: 1 } },
          {
            $project: {
              _id: { $toString: '$_id' },
              billNumber: 1,
              createdAt: 1,
              orderType: 1,
              customerName: 1,
              totalAmount: 1,
            },
          },
        ])
      : Promise.resolve([]),
  ]);

  const summary = summaryRows[0] ?? {};
  const itemsSold = itemRows
    .map((row: ReportResponse['itemsSold'][number]) => ({
      ...row,
      totalQuantity: roundQuantity(row.totalQuantity),
      totalSales: roundMoney(row.totalSales),
    }))
    .sort(
      (left, right) =>
        categoryRank(left.category) - categoryRank(right.category) ||
        right.totalQuantity - left.totalQuantity ||
        left.itemName.localeCompare(right.itemName),
    );
  const categoryTotals = categoryRows
    .map((row: ReportResponse['categoryTotals'][number]) => ({
      category: row.category,
      totalSales: roundMoney(row.totalSales),
    }))
    .sort(
      (left, right) =>
        categoryRank(left.category) - categoryRank(right.category) ||
        left.category.localeCompare(right.category),
    );

  return {
    period: {
      type,
      start: range.startKey,
      end: addDays(range.endKey, -1),
      label: periodLabel(type, range),
    },
    summary: {
      totalOrders: summary.totalOrders ?? 0,
      totalSales: roundMoney(summary.totalSales ?? 0),
      walkInOrders: summary.walkInOrders ?? 0,
      walkInSales: roundMoney(summary.walkInSales ?? 0),
      deliveryOrders: summary.deliveryOrders ?? 0,
      deliverySales: roundMoney(summary.deliverySales ?? 0),
    },
    itemsSold,
    categoryTotals,
    ...(type === 'daily' && includeOrders
      ? {
          orders: orderRows.map(
            (order: {
              _id: string;
              billNumber: string;
              createdAt: Date;
              orderType: 'DELIVERY' | 'WALK_IN';
              customerName: string;
              totalAmount: number;
            }) => ({
              _id: order._id,
              billNumber: order.billNumber,
              createdAt: order.createdAt.toISOString(),
              orderType: order.orderType,
              customerName: order.customerName,
              totalAmount: roundMoney(order.totalAmount),
            }),
          ),
        }
      : {}),
  };
}

export async function getReportOrdersForExport(
  type: ReportPeriodType,
  requested: string,
) {
  const range = resolveRange(type, requested);
  if (!range) return null;
  return Order.aggregate([
    { $match: { createdAt: { $gte: range.start, $lt: range.end } } },
    { $sort: { createdAt: 1, _id: 1 } },
    {
      $project: {
        billNumber: 1,
        createdAt: 1,
        orderType: 1,
        customerName: 1,
        address: 1,
        items: 1,
        totalAmount: 1,
      },
    },
  ]);
}
