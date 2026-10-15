import { sendError } from '../utils/apiResponse.js';
import { config } from '../config/config.js';

export const errorHandler = (err, req, res, next) => {
  // Log error in development
  if (config.nodeEnv !== 'test') {
    console.error(`[Error Handler] ${req.method} ${req.url}:`, err);
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 400, `Resource not found with invalid id format: ${err.value}`);
  }

  // Handle Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, 409, `A record with this ${field} already exists`, [
      { field, message: `${field} must be unique` },
    ]);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const formattedErrors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 400, 'Database validation failed', formattedErrors);
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, statusCode, message);
};
