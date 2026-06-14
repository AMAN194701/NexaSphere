import { AsyncLocalStorage } from 'node:async_hooks';
import pg from 'pg';
import { propagation, context as otelContext } from '@opentelemetry/api';

export const appContext = new AsyncLocalStorage();

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
