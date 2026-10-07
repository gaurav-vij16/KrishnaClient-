import 'dotenv/config';
import mongoose from 'mongoose';
import { Item } from './models/item.model';

const catalog = [
  { category: 'MP ATTA', name: 'MP Atta - 45', price: 45 },
  { category: 'MP ATTA', name: 'MP Atta - 48', price: 48 },
  { category: 'MP ATTA', name: 'MP Atta - 52', price: 52 },
  { category: 'MP ATTA', name: 'MP Atta - 57', price: 57 },
  { category: 'MP ATTA', name: 'MP Atta - 65', price: 65 },
  { category: 'NORMAL ATTA', name: 'Normal Atta', price: 40 },
  { category: 'NORMAL ATTA', name: 'Ragi Atta', price: 100 },
  { category: 'NORMAL ATTA', name: 'Chana Atta', price: 100 },
  { category: 'NORMAL ATTA', name: 'Jowar Atta', price: 60 },
  { category: 'NORMAL ATTA', name: 'Jau Atta', price: 60 },
  { category: 'NORMAL ATTA', name: 'Besan', price: 120 },
  { category: 'NORMAL ATTA', name: 'Rajgira Atta', price: 200 },
  { category: 'NORMAL ATTA', name: 'Oats Atta', price: 200 },
  { category: 'NORMAL ATTA', name: 'Khapli Atta', price: 150 },
  { category: 'NORMAL ATTA', name: 'Diabetes Control Atta', price: 110 },
  { category: 'NORMAL ATTA', name: 'Multigrain Atta', price: 90 },
  { category: 'NORMAL ATTA', name: 'Makki Ka Atta', price: 50 },
  { category: 'NORMAL ATTA', name: 'Bajra Ka Atta', price: 50 },
  { category: 'NORMAL ATTA', name: 'Black Wheat Atta', price: 150 },
  { category: 'NORMAL ATTA', name: 'Soya Atta', price: 150 },
  { category: 'SABUT', name: 'Ragi', price: 100 },
  { category: 'SABUT', name: 'Chana', price: 100 },
  { category: 'SABUT', name: 'Jau', price: 50 },
  { category: 'SABUT', name: 'Jowar', price: 50 },
  { category: 'SABUT', name: 'Makka', price: 40 },
  { category: 'SABUT', name: 'Bajra', price: 40 },
  { category: 'SABUT', name: 'Ghaat', price: 60 },
  { category: 'SABUT', name: 'Oats', price: 190 },
  { category: 'SABUT', name: 'Soya Bean', price: 140 },
  { category: 'PULSE', name: 'Desi Chana Dal', price: 110 },
  { category: 'PULSE', name: 'Desi Kala Chana', price: 100 },
  { category: 'PULSE', name: 'Kabuli Chana', price: 140 },
  { category: 'PULSE', name: 'Dollar Kabuli Chana', price: 160 },
  { category: 'PULSE', name: 'Chitra Rajma', price: 160 },
  { category: 'PULSE', name: 'Unpolished Arhar Dal', price: 180 },
  { category: 'PULSE', name: 'Unpolished Moong Dhulli', price: 140 },
  { category: 'PULSE', name: 'Desi Moong', price: 130 },
  { category: 'PULSE', name: 'Desi Moong Chilka', price: 130 },
  { category: 'PULSE', name: 'Urad Sabut Desi', price: 140 },
  { category: 'PULSE', name: 'Unpolished Urad Dhulli', price: 160 },
  { category: 'PULSE', name: 'Unpolished Urad Chilka', price: 140 },
  { category: 'PULSE', name: 'Unpolished Lal Masoor', price: 100 },
  { category: 'PULSE', name: 'Desi Kali Masoor', price: 110 },
  { category: 'GROCERY', name: 'Alsi', price: 180 },
  { category: 'GROCERY', name: 'Gur', price: 80 },
  { category: 'GROCERY', name: 'Tata Salt', price: 30, unit: 'pack' },
  { category: 'GROCERY', name: 'Oil', price: 190, unit: 'litre' },
  { category: 'GROCERY', name: 'Rock Salt', price: 60 },
  { category: 'GROCERY', name: 'Desi Khand A1', price: 75 },
  { category: 'GROCERY', name: 'Desi Khand (Brown)', price: 90 },
  { category: 'RICE', name: 'Rice Full - 110', price: 110 },
  { category: 'RICE', name: 'Rice Full - 130', price: 130 },
  { category: 'RICE', name: 'Pona', price: 100 },
  { category: 'RICE', name: 'Kinki', price: 60 },
  { category: 'RICE', name: 'Parmal', price: 50 },
];

async function seed(): Promise<void> {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/krishna-atta-chakki';
  await mongoose.connect(uri);
  try {
    await Item.bulkWrite(
      catalog.map(({ name, category, price, unit = 'kg' }) => ({
        updateOne: {
          filter: { name, category },
          update: { $set: { price, unit, isActive: true, name, category } },
          upsert: true,
        },
      })),
      { ordered: true },
    );
    console.info(`Seeded ${catalog.length} catalog items.`);
  } finally {
    await mongoose.disconnect();
  }
}

void seed().catch((error: unknown) => {
  console.error('Catalog seed failed:', error);
  process.exitCode = 1;
});
