export type OrderType = 'DELIVERY' | 'WALK_IN';

export type CatalogItem = {
  _id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  isActive: boolean;
};

export type OrderLine = {
  itemName: string;
  category?: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  lineTotal: number;
};

export type BillDraftLine = {
  key: string;
  itemId?: string;
  itemName: string;
  category?: string;
  unit: string;
  quantity: string;
  pricePerUnit: string;
};

export type Order = {
  _id: string;
  orderType: OrderType;
  customerName: string;
  address: string;
  items: OrderLine[];
  totalAmount: number;
  billNumber: string;
  createdAt: string;
};

export type OrderInput = Pick<
  Order,
  'orderType' | 'customerName' | 'address'
> & {
  items: Pick<
    OrderLine,
    'itemName' | 'category' | 'unit' | 'quantity' | 'pricePerUnit'
  >[];
};
