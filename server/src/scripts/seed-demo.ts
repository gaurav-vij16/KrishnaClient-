import 'dotenv/config';
import mongoose from 'mongoose';
import { shopConfig } from '../config/shop';
import { Item } from '../models/item.model';
import { Order } from '../models/order.model';
import { shopLocalToUtc } from '../utils/timezone';
import { createRequire } from 'node:module';
const { roundMoney } = createRequire(__filename)(
  '../../../shared/utils/money.js',
) as typeof import('../../../shared/utils/money.js');

function localDateKey(date: Date) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: shopConfig.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const v = Object.fromEntries(p.map(({ type, value }) => [type, value]));
  return `${v.year}-${v.month}-${v.day}`;
}
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4_294_967_296;
  };
}

async function seedDemo() {
  await mongoose.connect(
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/krishna-atta-chakki',
  );
  try {
    const catalog = await Item.find({ isActive: true }).lean();
    if (!catalog.length)
      throw new Error('Catalog is empty. Run npm run seed first.');
    const categories = [...new Set(catalog.map((item) => item.category))];
    await Order.deleteMany({ isDemo: true });
    const today = localDateKey(new Date());
    const firstDay = new Date(`${today}T00:00:00Z`);
    firstDay.setUTCDate(firstDay.getUTCDate() - 41);
    const randomNumber = random(20261005);
    const dates = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstDay);
      date.setUTCDate(date.getUTCDate() + index);
      return date.toISOString().slice(0, 10);
    });
    const chosenDays = [...dates];
    for (let i = 0; i < 18; i += 1)
      chosenDays.push(dates[Math.floor(randomNumber() * dates.length)]);
    const byDate = new Map<string, number>();
    const orderRecords = chosenDays.map((dateKey, index) => {
      const sequence = (byDate.get(dateKey) ?? 0) + 1;
      byDate.set(dateKey, sequence);
      const edgeHour = [9, 20, 8, 21, 0][index];
      const hour = edgeHour ?? 9 + Math.floor(randomNumber() * 12);
      const minute =
        index < 5 ? [0, 59, 50, 15, 0][index] : Math.floor(randomNumber() * 60);
      const createdAt = shopLocalToUtc(dateKey, hour, minute);
      const orderType = index % 2 === 0 ? 'DELIVERY' : 'WALK_IN';
      const lineCount = 1 + Math.floor(randomNumber() * 3);
      const shuffled = [...catalog].sort(() => randomNumber() - 0.5);
      const requiredCategory = categories[index];
      const requiredItem = requiredCategory
        ? catalog.find((item) => item.category === requiredCategory)
        : undefined;
      const selectedItems = requiredItem
        ? [
            requiredItem,
            ...shuffled
              .filter(
                (item) => item._id.toString() !== requiredItem._id.toString(),
              )
              .slice(0, lineCount - 1),
          ]
        : shuffled.slice(0, lineCount);
      const items = selectedItems.map((item) => {
        const quantity = roundMoney(0.5 + randomNumber() * 4.5);
        const pricePerUnit = item.price;
        return {
          itemName: item.name,
          category: item.category,
          unit: item.unit,
          quantity,
          pricePerUnit,
          lineTotal: roundMoney(quantity * pricePerUnit),
        };
      });
      return {
        isDemo: true,
        orderType,
        customerName:
          orderType === 'DELIVERY'
            ? ['Amit Sharma', 'Neha Verma', 'Rakesh Gupta', 'Pooja Singh'][
                Math.floor(randomNumber() * 4)
              ]
            : '',
        address:
          orderType === 'DELIVERY'
            ? ['12 Gandhi Road', 'Main Market, Ward 4', 'Near Bus Stand'][
                Math.floor(randomNumber() * 3)
              ]
            : '',
        items,
        totalAmount: roundMoney(
          items.reduce((sum, item) => sum + item.lineTotal, 0),
        ),
        billNumber: `DEMO-${dateKey.replaceAll('-', '')}-${String(sequence).padStart(2, '0')}`,
        createdAt,
      };
    });
    await Order.insertMany(orderRecords);
    console.info(
      `Seeded ${orderRecords.length} demo orders (${dates[0]} to ${today}, ${shopConfig.timezone}).`,
    );
  } finally {
    await mongoose.disconnect();
  }
}
void seedDemo().catch((error: unknown) => {
  console.error('Demo seed failed:', error);
  process.exitCode = 1;
});
