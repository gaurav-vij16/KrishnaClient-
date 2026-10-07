import { Router } from 'express';
import {
  createOrder,
  deleteOrder,
  listOrders,
  updateOrder,
} from '../controllers/orders.controller';
import { asyncHandler } from '../utils/async-handler';

const ordersRouter = Router();
ordersRouter.get('/', asyncHandler(listOrders));
ordersRouter.post('/', asyncHandler(createOrder));
ordersRouter.put('/:id', asyncHandler(updateOrder));
ordersRouter.delete('/:id', asyncHandler(deleteOrder));
export default ordersRouter;
