import logger from '../utils/logger.js';
import { captureException } from '../utils/sentry.js';
import { sendSlackAlert } from '../utils/slack.js';

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const errorLog = {
    status,
    message,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.adminSession?.username || req.user?.id,
    timestamp: new Date().toISOString(),
    stack: err.stack,
  };

  logger.error('Global Error Handler', errorLog);

  captureException(err, {
    userId: req.adminSession?.username || req.user?.id,
    requestPath: req.originalUrl,
    method: req.method,
    tags: { errorType: err.name, status },
    extra: { errorLog },
  });

  if (status >= 500 || (status === 401 && !req.user && !req.adminSession)) {
    sendSlackAlert({
      title: `${status} Error Detected`,
      message,
      url: req.originalUrl,
      method: req.method,
      userId: req.adminSession?.username || req.user?.id,
      timestamp: errorLog.timestamp,
      stack: err.stack?.substring(0, 500),
    });
  }

  res.status(status).json({
    success: false,
    error: {
      status,
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
  });
};

const notFoundHandler = (req, res) => {
  const status = 404;
  const message = `Route ${req.originalUrl} not found`;

  logger.warn('404 Not Found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
    },
  });
};

const validationErrorHandler = (errors) => {
  const formattedErrors = errors.map((err) => ({
    field: err.param,
    message: err.msg,
    value: err.value,
  }));

  logger.warn('Validation Error', { errors: formattedErrors });

  return {
    status: 400,
    message: 'Validation failed',
    errors: formattedErrors,
  };
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    logger.error('Async handler error', { error: err.message, stack: err.stack });
    next(err);
  });
};

export {
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
  asyncHandler,
};
