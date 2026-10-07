import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';
import healthRouter from './routes/health.routes';
import itemsRouter from './routes/items.routes';
import ordersRouter from './routes/orders.routes';
import reportsRouter from './routes/reports.routes';

export function createApp(clientUrl: string): express.Express {
  const app = express();
  app.use(cors({ origin: clientUrl }));
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use('/api/health', healthRouter);
  app.use('/api/items', itemsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/reports', reportsRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
