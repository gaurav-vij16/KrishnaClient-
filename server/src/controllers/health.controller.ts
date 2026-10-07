import type { Request, Response } from 'express';
import { getDatabaseStatus } from '../config/db';

export function getHealth(_request: Request, response: Response): void {
  const db = getDatabaseStatus();
  response.status(db === 'connected' ? 200 : 503).json({
    status: db === 'connected' ? 'ok' : 'error',
    db,
    timestamp: new Date().toISOString(),
  });
}
