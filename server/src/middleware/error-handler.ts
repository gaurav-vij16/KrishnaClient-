import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/api-error';

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  void _next;
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error?.name === 'ValidationError') {
    response.status(400).json({ error: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
};
