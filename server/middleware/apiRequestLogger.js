import logger from '../utils/logger.js';

function normalizePath(path) {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

function joinPaths(basePath, routePath) {
  if (routePath === '/') {
    return normalizePath(basePath || '/');
  }

  if (!basePath || routePath.startsWith(`${basePath}/`) || routePath === basePath) {
    return normalizePath(routePath);
  }

  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const route = routePath.startsWith('/') ? routePath : `/${routePath}`;

  return normalizePath(`${base}${route}`);
}

function routePathToTemplate(routePath) {
  if (typeof routePath === 'string') {
    return routePath;
  }

  if (Array.isArray(routePath) && routePath.every((path) => typeof path === 'string')) {
    return routePath.join('|');
  }

  return null;
}

function buildRouteTemplate(req, mountPath) {
  const routePath = routePathToTemplate(req.route?.path);

  if (!routePath) {
    return null;
  }

  return joinPaths(req.baseUrl || mountPath, routePath);
}

function buildFallbackPath(mountPath) {
  const apiPath = normalizePath(mountPath || '/api');

  return apiPath === '/' ? '/*' : `${apiPath}/*`;
}

function buildApiPath(req, mountPath) {
  return buildRouteTemplate(req, mountPath) || buildFallbackPath(mountPath);
}

function getMountPath(req) {
  const baseUrl = req.baseUrl || '';
  const path = req.path || '/';
  const fullPath = `${baseUrl}${path}`;

  return baseUrl || fullPath.split('/').slice(0, 2).join('/') || '/api';
}

function getRequestId(req) {
  const headerReqId = req.headers?.['x-request-id'];
  return req.reqId || (Array.isArray(headerReqId) ? headerReqId[0] : headerReqId) || null;
}

export function apiRequestLogger({ logger: requestLogger = logger } = {}) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    const method = req.method;
    const mountPath = normalizePath(getMountPath(req));
    const reqId = getRequestId(req);

    res.on('finish', () => {
      const responseTimeMs = Number(process.hrtime.bigint() - start) / 1e6;

      requestLogger.http('API request', {
        event: 'api_request',
        method,
        path: buildApiPath(req, mountPath),
        status: res.statusCode,
        responseTimeMs: Math.round(responseTimeMs * 1000) / 1000,
        reqId,
      });
    });

    next();
  };
}

export default apiRequestLogger;
