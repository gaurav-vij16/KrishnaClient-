import { Schema, model, type InferSchemaType } from 'mongoose';

const orderItemSchema = new Schema(
  {
    itemName: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    unit: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    pricePerUnit: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderType: { type: String, enum: ['DELIVERY', 'WALK_IN'], required: true },
    customerName: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (items: unknown[]) => items.length > 0,
        'Add at least one item',
      ],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    billNumber: { type: String, required: true, unique: true },
    isDemo: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

orderSchema.index({ createdAt: 1 });
orderSchema.index({ createdAt: 1, orderType: 1 });

export type OrderRecord = InferSchemaType<typeof orderSchema>;
export const Order = model('Order', orderSchema);
