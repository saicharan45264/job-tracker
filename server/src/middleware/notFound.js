import { sendError } from '../utils/apiResponse.js';

export const notFound = (req, res) => {
  return sendError(res, 404, `API route not found: [${req.method}] ${req.originalUrl}`);
};
