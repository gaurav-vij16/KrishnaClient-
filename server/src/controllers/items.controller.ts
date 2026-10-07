import type { Request, Response } from 'express';
import { Item } from '../models/item.model';

export async function listItems(
  request: Request,
  response: Response,
): Promise<void> {
  const filter: { isActive: boolean; category?: string } = { isActive: true };
  if (
    typeof request.query.category === 'string' &&
    request.query.category.trim()
  ) {
    filter.category = request.query.category.trim();
  }

  const categoryOrder = [
    'MP ATTA',
    'NORMAL ATTA',
    'SABUT',
    'PULSE',
    'GROCERY',
    'RICE',
  ];
  const items = await Item.find(filter).lean();
  items.sort((left, right) => {
    const groupDifference =
      categoryOrder.indexOf(left.category) -
      categoryOrder.indexOf(right.category);
    return groupDifference || left.name.localeCompare(right.name);
  });
  response.json(items);
}
