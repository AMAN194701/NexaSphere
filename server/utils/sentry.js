import Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

function initializeSentry(app) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const dsn = process.env.SENTRY_DSN;

  if (!dsn && !isDevelopment) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: dsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({
        app: true,
        request: true,
        serverName: true,
      }),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,
    profilesSampleRate: isDevelopment ? 1.0 : 0.1,
    attachStacktrace: true,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  return Sentry;
}

function addSentryErrorHandler(app) {
  app.use(Sentry.Handlers.errorHandler());
}

function captureException(error, context = {}, level = 'error') {
  Sentry.captureException(error, {
    level,
    tags: context.tags || {},
    extra: {
      userId: context.userId,
      requestPath: context.requestPath,
      method: context.method,
      ...context.extra,
    },
  });
}

function captureMessage(message, level = 'info', context = {}) {
  Sentry.captureMessage(message, {
    level,
    tags: context.tags || {},
    extra: context.extra || {},
  });
}

function addBreadcrumb(data) {
  Sentry.addBreadcrumb({
    category: data.category || 'custom',
    message: data.message || '',
    level: data.level || 'info',
    data: data.data || {},
    timestamp: Date.now() / 1000,
  });
}

export {
  Sentry,
  initializeSentry,
  addSentryErrorHandler,
  captureException,
  captureMessage,
  addBreadcrumb,
};
