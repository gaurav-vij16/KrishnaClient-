import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/order.model';
import { nextBillNumber } from '../services/bill-number.service';
import { ApiError } from '../utils/api-error';
import { getKolkataDateKey, getKolkataDayRange } from '../utils/dates';
import { createRequire } from 'node:module';
const { roundMoney } = createRequire(__filename)(
  '../../../shared/utils/money.js',
) as typeof import('../../../shared/utils/money.js');

type SubmittedItem = {
  itemName?: unknown;
  category?: unknown;
  unit?: unknown;
  quantity?: unknown;
  pricePerUnit?: unknown;
};

type OrderInput = {
  orderType?: unknown;
  customerName?: unknown;
  address?: unknown;
  items?: unknown;
};

function prepareOrder(input: OrderInput) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ApiError(400, 'Order details must be provided as an object.');
  }
  if (input.orderType !== 'DELIVERY' && input.orderType !== 'WALK_IN') {
    throw new ApiError(400, 'Choose Delivery or Walk-in.');
  }

  const address = typeof input.address === 'string' ? input.address.trim() : '';
  if (input.orderType === 'DELIVERY' && !address) {
    throw new ApiError(400, 'Address is required for delivery orders.');
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new ApiError(400, 'Add at least one item.');
  }

  const items = input.items.map((rawItem: SubmittedItem) => {
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
      throw new ApiError(400, 'Each item must be a valid object.');
    }
    const itemName =
      typeof rawItem.itemName === 'string' ? rawItem.itemName.trim() : '';
    const unit = typeof rawItem.unit === 'string' ? rawItem.unit.trim() : '';
    const quantity = rawItem.quantity;
    const pricePerUnit = rawItem.pricePerUnit;

    if (!itemName || !unit)
      throw new ApiError(400, 'Each item needs a name and unit.');
    if (
      typeof quantity !== 'number' ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      throw new ApiError(400, 'Quantity must be greater than zero.');
    }
    if (
      typeof pricePerUnit !== 'number' ||
      !Number.isFinite(pricePerUnit) ||
      pricePerUnit < 0
    ) {
      throw new ApiError(400, 'Price must be zero or greater.');
    }

    const lineTotal = roundMoney(quantity * pricePerUnit);
    if (!Number.isFinite(lineTotal))
      throw new ApiError(400, 'Item total is too large.');
    const category =
      typeof rawItem.category === 'string' ? rawItem.category.trim() : '';
    return {
      itemName,
      ...(category ? { category } : {}),
      unit,
      quantity,
      pricePerUnit,
      lineTotal,
    };
  });

  const totalAmount = roundMoney(
    items.reduce((total, item) => total + item.lineTotal, 0),
  );
  if (!Number.isFinite(totalAmount))
    throw new ApiError(400, 'Order total is too large.');
  return {
    orderType: input.orderType,
    customerName:
      typeof input.customerName === 'string' ? input.customerName.trim() : '',
    address: input.orderType === 'DELIVERY' ? address : '',
    items,
    totalAmount,
  };
}

export async function createOrder(
  request: Request,
  response: Response,
): Promise<void> {
  const orderData = prepareOrder(request.body as OrderInput);
  const createdAt = new Date();
  const billNumber = await nextBillNumber(createdAt);
  const order = await Order.create({ ...orderData, billNumber, createdAt });
  response.status(201).json(order);
}

export async function listOrders(
  request: Request,
  response: Response,
): Promise<void> {
  const requestedDate =
    typeof request.query.date === 'string'
      ? request.query.date
      : getKolkataDateKey(new Date());
  const range = getKolkataDayRange(requestedDate);
  if (!range) throw new ApiError(400, 'Date must be a valid YYYY-MM-DD date.');

  const filter: Record<string, unknown> = {
    createdAt: { $gte: range.start, $lt: range.end },
  };
  const paginated = ['page', 'limit', 'search', 'orderType'].some(
    (key) => request.query[key] !== undefined,
  );
  if (
    request.query.orderType === 'DELIVERY' ||
    request.query.orderType === 'WALK_IN'
  )
    filter.orderType = request.query.orderType;
  const search =
    typeof request.query.search === 'string' ? request.query.search.trim() : '';
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { billNumber: { $regex: escaped, $options: 'i' } },
      { customerName: { $regex: escaped, $options: 'i' } },
    ];
  }
  const page = Math.max(
    1,
    Number.parseInt(String(request.query.page ?? '1'), 10) || 1,
  );
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(String(request.query.limit ?? '50'), 10) || 50),
  );
  if (paginated) {
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);
    response.json({ data: orders, page, limit, total });
    return;
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  response.json(orders);
}

export async function updateOrder(
  request: Request,
  response: Response,
): Promise<void> {
  if (!mongoose.isValidObjectId(request.params.id))
    throw new ApiError(400, 'Invalid order ID.');
  const orderData = prepareOrder(request.body as OrderInput);
  const order = await Order.findByIdAndUpdate(request.params.id, orderData, {
    new: true,
    runValidators: true,
  });
  if (!order) throw new ApiError(404, 'Order not found.');
  response.json(order);
}

export async function deleteOrder(
  request: Request,
  response: Response,
): Promise<void> {
  if (!mongoose.isValidObjectId(request.params.id))
    throw new ApiError(400, 'Invalid order ID.');
  const order = await Order.findByIdAndDelete(request.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');
  response.json({ success: true });
}
