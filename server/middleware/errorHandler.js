import { ZodError } from 'zod';
import { ValidationError, AppError } from '../utils/errors.js';

export default function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ZodError) {
    const issues = err.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
    const ve = new ValidationError('Invalid request', issues);
    return res.status(ve.status).json({ error: { message: ve.message, code: ve.code, details: ve.details } });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { message: err.message, code: err.code, details: err.details } });
  }

  // Unknown error — log and return generic response
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
}
