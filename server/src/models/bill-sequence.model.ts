import { Schema, model } from 'mongoose';

const billSequenceSchema = new Schema({
  dateKey: { type: String, required: true, unique: true },
  sequence: { type: Number, required: true, default: 0 },
});

export const BillSequence = model('BillSequence', billSequenceSchema);
