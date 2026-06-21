import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'api-requests.log');

const SENSITIVE_FIELDS = new Set([
  'password', 'passkey', 'token', 'secret', 'authorization',
  'cookie', 'session', 'key', 'apiKey', 'apikey', 'accessToken',
  'refreshToken', 'jwt', 'auth',
]);

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

const logStream = (() => {
  ensureLogDir();
  return fs.createWriteStream(LOG_FILE, { flags: 'a' });
})();

export function apiLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      responseTimeMs: duration,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      query: Object.keys(req.query || {}).length ? sanitize(req.query) : undefined,
    };

    logStream.write(JSON.stringify(entry) + '\n');
  });

  next();
}
