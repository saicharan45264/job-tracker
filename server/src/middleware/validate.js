import { sendError } from '../utils/apiResponse.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, 400, 'Validation failed', formattedErrors);
      }
      return sendError(res, 400, 'Invalid request data');
    }
  };
};

export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return sendError(res, 400, `Invalid ${paramName} parameter format`);
    }
    next();
  };
};
