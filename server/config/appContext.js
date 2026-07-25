import { AsyncLocalStorage } from 'node:async_hooks';
import pg from 'pg';
import { propagation, context as otelContext } from '@opentelemetry/api';

export const appContext = new AsyncLocalStorage();

// Idempotency guard — prevent double-patching if this module is re-imported
const PG_PATCH_APPLIED = Symbol.for('appContext.pg.patched');
// Idempotency guards — prevent double-patching if this module is re-imported
const PG_PATCH_APPLIED = Symbol.for('appContext.pg.patched');
const FETCH_PATCH_APPLIED = Symbol.for('appContext.fetch.patched');

// Strip */ and newlines from reqId before embedding in a SQL comment
// to prevent comment-injection attacks
function sanitizeReqId(reqId) {
  return String(reqId)
    .replace(/\*\//g, '')
    .replace(/[\r\n]/g, '');
}

function isInternalUrl(url) {
  try {
    const { hostname } = new URL(url, 'http://localhost');
    if (['localhost', '127.0.0.1', '::1'].includes(hostname)) return true;
    const dev_domain = process.env.DEV_DOMAIN;
    const prod = process.env.PROD_DOMAINS?.split(',').map((d) => d.trim()) ?? [];
    if (dev_domain && hostname.endsWith(dev_domain)) return true;
    if (prod.some((d) => hostname === d || hostname.endsWith('.' + d))) return true;
    return false;
  } catch {
    return true; // treat unparseable / relative URLs as internal
  }
}

function getUrlString(input) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  if (typeof Request !== 'undefined' && input instanceof Request) return input.url;
function isInternalUrl(url)
  { try { 
    const { hostname } = new URL(url, 'http://localhost'); 
  if (['localhost', '127.0.0.1', '::1'].includes(hostname)) return true; 
    const dev_domain = process.env.DEV_DOMAIN; 
    const prod = process.env.PROD_DOMAINS?.split(',').map((d) => d.trim()) ?? []; if (dev_domain && hostname.endsWith(dev_domain)) return true; 
    if (prod.some((d) => hostname === d || hostname.endsWith('.' + d))) return  true; return false; } 
  catch { return true; // treat unparseable / relative URLs as internal 
        } 
          
  }

function getUrlString(input) {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.url;
  }

  return String(input);
}

// Patch pg.Client.prototype.query to prepend /* reqId */ to every SQL query.
// Uses ...args so all pg call signatures work correctly (query(sql, callback),
// query(sql, values), query(sql, values, callback), query(config), etc.)
if (!pg.Client.prototype.query[PG_PATCH_APPLIED]) {
  const originalClientQuery = pg.Client.prototype.query;

  pg.Client.prototype.query = function (...args) {
    const store = appContext.getStore();
    console.log('PG query patch. store:', store);

  if (!pg.Client.prototype.query[PG_PATCH_APPLIED]) {
  const originalClientQuery = pg.Client.prototype.query;

    // TODO:
    // Replace pg.Client.prototype patching with a
    // client wrapper/factory (e.g. instrumentClient())
    // to avoid global prototype mutation.
    // Prototype patching is retained for compatibility.
  pg.Client.prototype.query = function (...args) {
    const store = appContext.getStore();

    if (store?.reqId) {
      const safeId = sanitizeReqId(store.reqId);
      const firstArg = args[0];
      const secondArgIsCallback = typeof args[1] === 'function';
      console.log('Inside patch: firstArg:', firstArg, 'secondArgIsCallback:', secondArgIsCallback);

      if (typeof firstArg === 'string') {
        args[0] = `/* reqId: ${safeId} */ ${firstArg}`;
      } else if (firstArg?.text && !secondArgIsCallback) {
        args[0] = { ...firstArg, text: `/* reqId: ${safeId} */ ${firstArg.text}` };
        console.log('Modified args[0]:', args[0]);
      }
    }

    return originalClientQuery.apply(this, args);
  };

  pg.Client.prototype.query[PG_PATCH_APPLIED] = true;
}

// Export a wrapped fetch for call sites to use explicitly, instead of
// patching global.fetch. This avoids import-order races with OTel/undici
// patching the global fetch themselves.
// Forwards X-Correlation-ID whenever called inside an appContext.run(...) scope
// (e.g. during request handling, after tracingMiddleware has populated the
// store).
export async function tracedFetch(url, options = {}) {
  const store = appContext.getStore();
  const headers = new Headers();

  if (options.headers instanceof Headers) {
    options.headers.forEach((v, k) => headers.set(k, v));
  } else if (options.headers) {
    Object.entries(options.headers).forEach(([k, v]) => headers.set(k, v));
  }

  if (store?.reqId) headers.set('X-Correlation-ID', store.reqId);

  const urlString = getUrlString(url);
  if (isInternalUrl(urlString)) {
    propagation.inject(otelContext.active(), headers, {
      set(carrier, key, value) {
        carrier.set(key, value);
      },
    });
  }

  return globalThis.fetch(url, { ...options, headers });
}
// Global patch for fetch to automatically append the Correlation ID header to downstream requests
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

      if (typeof firstArg === 'string') {
        args[0] = `/* reqId: ${safeId} */ ${firstArg}`;
      } else if (firstArg?.text) {
        args[0] = { ...firstArg, text: `/* reqId: ${safeId} */ ${firstArg.text}` };
      }
    }

    return originalClientQuery.apply(this, args);
  };

  pg.Client.prototype.query[PG_PATCH_APPLIED] = true;
}

// Patch global.fetch to forward X-Request-ID on all outgoing calls.
// OTel trace headers are only injected for internal URLs — never for
// external APIs (Stripe, GitHub, OpenAI, etc.)
if (!global.fetch?.[FETCH_PATCH_APPLIED]) {
  const originalFetch = global.fetch;

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
  // TODO:
  // Replace global fetch monkey-patching with an explicit
  // internalFetch() wrapper in a future refactor.
  // Global patching is kept for backward compatibility
  // with existing fetch() call sites.
  global.fetch = function (url, options = {}) {
    const store = appContext.getStore();

    const headers = {};
    if (options.headers instanceof Headers) {
      options.headers.forEach((v, k) => {
        headers[k] = v;
      });
    } else if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (store?.reqId) headers['X-Request-ID'] = store.reqId;

   const urlstring =getUrlString(url);
    if (isInternalUrl(urlstring)) {
      propagation.inject(otelContext.active(), headers);
    }
    return originalFetch.call(this, url, { ...options, headers });
  };

  global.fetch[FETCH_PATCH_APPLIED] = true;
}
