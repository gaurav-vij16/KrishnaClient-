export type ReportPeriodType = 'daily' | 'weekly' | 'monthly';

export type ReportOrder = {
  _id: string;
  billNumber: string;
  createdAt: string;
  orderType: 'DELIVERY' | 'WALK_IN';
  customerName: string;
  totalAmount: number;
};

export type ReportResponse = {
  period: { type: ReportPeriodType; start: string; end: string; label: string };
  summary: {
    totalOrders: number;
    totalSales: number;
    walkInOrders: number;
    walkInSales: number;
    deliveryOrders: number;
    deliverySales: number;
  };
  itemsSold: Array<{
    itemName: string;
    category: string;
    unit: string;
    totalQuantity: number;
    totalSales: number;
    ordersCount: number;
  }>;
  categoryTotals: Array<{ category: string; totalSales: number }>;
  orders?: ReportOrder[];
};
