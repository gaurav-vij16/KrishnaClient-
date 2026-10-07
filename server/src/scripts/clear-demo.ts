import 'dotenv/config';
import mongoose from 'mongoose';
import { Order } from '../models/order.model';

async function clearDemo() {
  await mongoose.connect(
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/krishna-atta-chakki',
  );
  try {
    const result = await Order.deleteMany({ isDemo: true });
    console.info(
      `Removed ${result.deletedCount} demo orders. Existing shop orders were preserved.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}
void clearDemo().catch((error: unknown) => {
  console.error('Demo cleanup failed:', error);
  process.exitCode = 1;
});
