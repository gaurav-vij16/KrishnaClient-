import ExcelJS from 'exceljs';
import type { Request, Response } from 'express';
import type { ReportPeriodType } from '@krishna-atta-chakki/shared/reports';
import { shopConfig } from '../config/shop';
import {
  createReport,
  getReportOrdersForExport,
} from '../services/reports.service';
import { ApiError } from '../utils/api-error';
import { getKolkataDateKey } from '../utils/dates';

function validType(value: unknown): value is ReportPeriodType {
  return value === 'daily' || value === 'weekly' || value === 'monthly';
}

function requestedPeriod(type: ReportPeriodType, request: Request): string {
  if (type === 'monthly') {
    if (typeof request.query.month === 'string') return request.query.month;
    if (typeof request.query.date === 'string')
      return request.query.date.slice(0, 7);
    return getKolkataDateKey(new Date()).slice(0, 7);
  }
  return typeof request.query.date === 'string'
    ? request.query.date
    : getKolkataDateKey(new Date());
}

function validatePeriod(type: ReportPeriodType, period: string): void {
  const valid =
    type === 'monthly'
      ? /^\d{4}-(0[1-9]|1[0-2])$/.test(period)
      : /^\d{4}-\d{2}-\d{2}$/.test(period);
  if (!valid)
    throw new ApiError(
      400,
      type === 'monthly'
        ? 'Month must be a valid YYYY-MM value.'
        : 'Date must be a valid YYYY-MM-DD date.',
    );
}

export async function getReport(
  request: Request,
  response: Response,
): Promise<void> {
  if (!validType(request.params.period))
    throw new ApiError(404, 'Report period not found.');
  const type = request.params.period;
  const period = requestedPeriod(type, request);
  validatePeriod(type, period);
  const report = await createReport(type, period);
  if (!report) throw new ApiError(400, 'Choose a valid report period.');
  response.json(report);
}

const currencyFormat = '₹#,##,##0.00';
const quantityFormat = '0.00';
const headerFill: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFE8B6' },
};

function setHeader(sheet: ExcelJS.Worksheet): void {
  const row = sheet.getRow(1);
  row.font = { bold: true, color: { argb: 'FF3A2412' } };
  row.fill = headerFill;
  row.alignment = { vertical: 'middle' };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

function setFilter(sheet: ExcelJS.Worksheet): void {
  if (sheet.columnCount > 0)
    sheet.autoFilter = {
      from: 'A1',
      to: `${sheet.getColumn(sheet.columnCount).letter}${Math.max(sheet.rowCount, 1)}`,
    };
}

function wallClockDate(value: Date, options: Intl.DateTimeFormatOptions): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: shopConfig.timezone,
    ...options,
  }).formatToParts(value);
  const values = Object.fromEntries(
    parts.map(({ type, value: part }) => [type, part]),
  );
  return new Date(
    Date.UTC(
      Number(values.year ?? 1970),
      Number(values.month ?? 1) - 1,
      Number(values.day ?? 1),
      Number(values.hour ?? 0),
      Number(values.minute ?? 0),
      Number(values.second ?? 0),
    ),
  );
}

export async function exportReport(
  request: Request,
  response: Response,
): Promise<void> {
  const type = request.query.type;
  if (!validType(type))
    throw new ApiError(400, 'Type must be daily, weekly, or monthly.');
  const period = requestedPeriod(type, request);
  validatePeriod(type, period);

  const [report, orders] = await Promise.all([
    createReport(type, period, false),
    getReportOrdersForExport(type, period),
  ]);
  if (!report || !orders)
    throw new ApiError(400, 'Choose a valid report period.');

  const workbook = new ExcelJS.Workbook();
  workbook.creator = shopConfig.shopName;
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['Metric', 'Value']);
  summarySheet.addRows([
    ['Shop name', shopConfig.shopName],
    ['Report type', type[0].toUpperCase() + type.slice(1)],
    ['Period', report.period.label],
    [
      'Downloaded (IST)',
      wallClockDate(new Date(), { dateStyle: 'short', timeStyle: 'short' }),
    ],
    ['Total orders', report.summary.totalOrders],
    ['Total sales', report.summary.totalSales],
    ['Walk-in orders', report.summary.walkInOrders],
    ['Walk-in sales', report.summary.walkInSales],
    ['Delivery orders', report.summary.deliveryOrders],
    ['Delivery sales', report.summary.deliverySales],
  ]);
  summarySheet.getColumn(1).width = 26;
  summarySheet.getColumn(2).width = 32;
  setHeader(summarySheet);
  summarySheet.getCell('B5').numFmt = 'dd-mmm-yyyy hh:mm AM/PM';
  for (const cell of ['B7', 'B9', 'B11'])
    summarySheet.getCell(cell).numFmt = currencyFormat;

  const itemsSheet = workbook.addWorksheet('Items Sold');
  itemsSheet.columns = [
    { width: 18 },
    { width: 32 },
    { width: 12 },
    { width: 16, style: { numFmt: quantityFormat } },
    { width: 18, style: { numFmt: currencyFormat } },
    { width: 16 },
  ];
  itemsSheet.addRow([
    'Category',
    'Item',
    'Unit',
    'Quantity sold',
    'Sales',
    'Orders count',
  ]);
  const subtotalRows: number[] = [];
  let index = 0;
  while (index < report.itemsSold.length) {
    const category = report.itemsSold[index].category;
    const startRow = itemsSheet.rowCount + 1;
    while (
      index < report.itemsSold.length &&
      report.itemsSold[index].category === category
    ) {
      const item = report.itemsSold[index];
      itemsSheet.addRow([
        item.category,
        item.itemName,
        item.unit,
        item.totalQuantity,
        item.totalSales,
        item.ordersCount,
      ]);
      index += 1;
    }
    const endRow = itemsSheet.rowCount;
    const subtotal = itemsSheet.addRow([
      `${category} subtotal`,
      '',
      '',
      { formula: `SUM(D${startRow}:D${endRow})` },
      { formula: `SUM(E${startRow}:E${endRow})` },
      '',
    ]);
    subtotal.font = { bold: true };
    subtotal.fill = headerFill;
    subtotalRows.push(subtotal.number);
  }
  const grandTotal = itemsSheet.addRow([
    'Grand total',
    '',
    '',
    subtotalRows.length
      ? { formula: subtotalRows.map((row) => `D${row}`).join('+') }
      : 0,
    subtotalRows.length
      ? { formula: subtotalRows.map((row) => `E${row}`).join('+') }
      : 0,
    '',
  ]);
  grandTotal.font = { bold: true };
  grandTotal.fill = headerFill;
  setHeader(itemsSheet);
  setFilter(itemsSheet);

  const ordersSheet = workbook.addWorksheet('Orders');
  ordersSheet.columns = [
    { width: 20 },
    { width: 15, style: { numFmt: 'dd-mmm-yyyy' } },
    { width: 14, style: { numFmt: 'hh:mm AM/PM' } },
    { width: 15 },
    { width: 24 },
    { width: 34 },
    { width: 30 },
    { width: 13, style: { numFmt: quantityFormat } },
    { width: 12 },
    { width: 16, style: { numFmt: currencyFormat } },
    { width: 16, style: { numFmt: currencyFormat } },
    { width: 16, style: { numFmt: currencyFormat } },
  ];
  ordersSheet.addRow([
    'Bill no.',
    'Date',
    'Time (IST)',
    'Order type',
    'Customer name',
    'Address',
    'Item',
    'Quantity',
    'Unit',
    'Price',
    'Line total',
    'Order total',
  ]);
  for (const order of orders) {
    const createdAt = new Date(order.createdAt);
    for (const item of order.items) {
      ordersSheet.addRow([
        order.billNumber,
        wallClockDate(createdAt, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        wallClockDate(createdAt, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23',
        }),
        order.orderType === 'DELIVERY' ? 'Delivery' : 'Walk-in',
        order.customerName,
        order.address,
        item.itemName,
        item.quantity,
        item.unit,
        item.pricePerUnit,
        item.lineTotal,
        order.totalAmount,
      ]);
    }
  }
  setHeader(ordersSheet);
  setFilter(ordersSheet);
  ordersSheet.getColumn(6).alignment = { wrapText: true, vertical: 'top' };

  const filenamePeriod =
    type === 'monthly'
      ? report.period.start.slice(0, 7)
      : type === 'weekly'
        ? `${report.period.start}-to-${report.period.end}`
        : report.period.start;
  const filename = `krishna-atta-chakki-${type}-report-${filenamePeriod}.xlsx`;
  response.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  response.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"`,
  );
  await workbook.xlsx.write(response);
  response.end();
}
