import { Router } from 'express';
import { listItems } from '../controllers/items.controller';
import { asyncHandler } from '../utils/async-handler';

const itemsRouter = Router();
itemsRouter.get('/', asyncHandler(listItems));
export default itemsRouter;
