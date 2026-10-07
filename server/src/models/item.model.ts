import { Schema, model, type InferSchemaType } from 'mongoose';

const itemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    unit: { type: String, required: true, default: 'kg', trim: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

itemSchema.index({ name: 1, category: 1 }, { unique: true });

export type ItemRecord = InferSchemaType<typeof itemSchema>;
export const Item = model('Item', itemSchema);
