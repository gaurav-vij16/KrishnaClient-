import { Router } from 'express';
import { exportReport, getReport } from '../controllers/reports.controller';
import { asyncHandler } from '../utils/async-handler';

const reportsRouter = Router();
reportsRouter.get('/export', asyncHandler(exportReport));
reportsRouter.get('/:period', asyncHandler(getReport));
export default reportsRouter;
