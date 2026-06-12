import { AsyncLocalStorage } from 'node:async_hooks';
import pg from 'pg';
import { propagation, context as otelContext } from '@opentelemetry/api';

export const appContext = new AsyncLocalStorage();

/**
 * Sanitize a reqId value for safe injection into SQL comments.
 * Strips closing comment sequences, newlines, and non-printable characters.
 */
function sanitizeReqId(reqId) {
  return String(reqId)
    .replace(/\*\/|[\r\n\u0085\u2028\u2029]/g, '')
    .trim();
}

/**
 * Determine if a URL targets an internal service based on configurable patterns.
 * Internal requests include relative URLs and configured internal origins.
 */
const INTERNAL_HOSTS = (process.env.INTERNAL_HOSTS || 'localhost,127.0.0.1,::1')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function isInternalUrl(url) {
  if (typeof url === 'string' && url.startsWith('/')) return true;
  try {
    const parsed = typeof url === 'string' ? new URL(url) : url;
    const host = parsed.hostname.toLowerCase();
    return INTERNAL_HOSTS.some((internal) => host === internal || host.endsWith('.' + internal));
  } catch {
    return false;
  }
}

// Instance-level decorator for pg.Client.query — avoids global prototype pollution.
// Use decoratePgClient(client) when obtaining a new client or pool connection.
const originalClientQuery = pg.Client.prototype.query;
pg.Client.prototype.query = function (config, values, callback) {
  const store = appContext.getStore();
  let c = config;
  if (store?.reqId) {
    const safeId = sanitizeReqId(store.reqId);
    if (typeof c === 'string') {
      c = `/* reqId: ${safeId} */ ${c}`;
    } else if (c && typeof c.text === 'string') {
      c = { ...c, text: `/* reqId: ${safeId} */ ${c.text}` };
    }
  }

  // Handle 2-argument form: query(config, callback) — values is omitted
  if (typeof values === 'function') {
    callback = values;
    values = undefined;
  }

  return originalClientQuery.call(this, c, values, callback);
};

// Wrapped fetch that only injects OpenTelemetry headers into internal requests.
// External (third-party) calls still get X-Request-ID for correlation, but NOT
// internal trace context (traceparent/tracestate), preventing context leakage.
const originalFetch = global.fetch;
global.fetch = function (url, options) {
  const store = appContext.getStore();
  options = options || {};

  const headers = {};
  if (options.headers instanceof Headers) {
    options.headers.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (store?.reqId) {
    headers['X-Request-ID'] = store.reqId;
  }

  // Only inject OpenTelemetry trace propagation headers for internal calls
  if (isInternalUrl(url)) {
    propagation.inject(otelContext.active(), headers);
  }

  return originalFetch.call(this, url, { ...options, headers });
};

/**
 * Wrap a pg Client instance so its query method appends the correlation ID
 * from async context without depending on the global prototype patch.
 *
 * @param {import('pg').Client} client
 * @returns {import('pg').Client}
 */
export function decoratePgClient(client) {
  const originalQuery = client.query.bind(client);

  client.query = function (config, values, callback) {
    const store = appContext.getStore();
    let c = config;
    if (store?.reqId) {
      const safeId = sanitizeReqId(store.reqId);
      if (typeof c === 'string') {
        c = `/* reqId: ${safeId} */ ${c}`;
      } else if (c && typeof c.text === 'string') {
        c = { ...c, text: `/* reqId: ${safeId} */ ${c.text}` };
      }
    }

    if (typeof values === 'function') {
      callback = values;
      values = undefined;
    }

    return originalQuery(c, values, callback);
  };

  return client;
}

/**
 * Perform an internal HTTP request with correlation ID and OpenTelemetry headers.
 * Use this function instead of raw fetch() for internal service-to-service calls.
 *
 * @param {string | URL} url
 * @param {object} [options]
 * @returns {Promise<Response>}
 */
export function internalFetch(url, options = {}) {
  const store = appContext.getStore();
  const headers = { ...options.headers };

  if (store?.reqId) {
    headers['X-Request-ID'] = store.reqId;
  }

  propagation.inject(otelContext.active(), headers);

  return fetch(url, { ...options, headers });
}
