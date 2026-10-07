import { BillSequence } from '../models/bill-sequence.model';
import { getKolkataDateKey } from '../utils/dates';

export async function nextBillNumber(createdAt: Date): Promise<string> {
  const dateKey = getKolkataDateKey(createdAt);
  let sequence;

  try {
    sequence = await BillSequence.findOneAndUpdate(
      { dateKey },
      { $inc: { sequence: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    sequence = await BillSequence.findOneAndUpdate(
      { dateKey },
      { $inc: { sequence: 1 } },
      { new: true },
    );
  }

  if (!sequence) throw new Error('Could not allocate a bill number');
  return `${dateKey.replaceAll('-', '')}-${String(sequence.sequence).padStart(3, '0')}`;
}
