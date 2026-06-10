import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';

process.env.NODE_ENV = 'test';
process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = 'StrongPassword123!';
process.env.ADMIN_EVENT_PASSWORD = 'StrongEventPassword123!';
process.env.CORS_ORIGIN = 'http://localhost:3000,http://localhost:5173';
process.env.JWT_SECRET = 'secret_super_long_secret_key_that_is_safe_and_long_enough_for_256bit';
process.env.PORT = '0';

test('Helmet CSP & Security Headers Configuration', async (t) => {
  const { default: app } = await import('../index.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  const sendRequest = (path = '/health') => {
    return new Promise((resolve) => {
      const req = http.request(
        { hostname: 'localhost', port, path, method: 'GET' },
        (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: Buffer.concat(chunks).toString(),
            });
          });
        }
      );
      req.end();
    });
  };

  try {
    await t.test('1. X-Content-Type-Options: nosniff header is present', async () => {
      const res = await sendRequest();
      assert.equal(res.headers['x-content-type-options'], 'nosniff');
    });

    await t.test('2. X-Frame-Options header prevents clickjacking', async () => {
      const res = await sendRequest();
      assert.equal(res.headers['x-frame-options'], 'DENY');
    });

    await t.test('3. X-Powered-By header is hidden', async () => {
      const res = await sendRequest();
      assert.equal(res.headers['x-powered-by'], undefined);
    });

    await t.test('4. Referrer-Policy is set', async () => {
      const res = await sendRequest();
      assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
    });

    await t.test('5. Content-Security-Policy header is present', async () => {
      const res = await sendRequest();
      assert.ok(res.headers['content-security-policy']);
    });

    await t.test('6. CSP includes default-src self', async () => {
      const res = await sendRequest();
      const csp = res.headers['content-security-policy'];
      assert.ok(csp.includes("default-src 'self'"));
    });

    await t.test('7. CSP restricts formAction to self', async () => {
      const res = await sendRequest();
      const csp = res.headers['content-security-policy'];
      assert.ok(csp.includes("form-action 'self'"), 'formAction missing from CSP');
    });

    await t.test('8. CSP prevents clickjacking via frame-ancestors', async () => {
      const res = await sendRequest();
      const csp = res.headers['content-security-policy'];
      assert.ok(csp.includes("frame-ancestors 'none'"), 'frameAncestors missing from CSP');
    });

    await t.test('9. CSP prevents base tag hijacking', async () => {
      const res = await sendRequest();
      const csp = res.headers['content-security-policy'];
      assert.ok(csp.includes("base-uri 'self'"), 'baseUri missing from CSP');
    });

    await t.test('10. CSP restricts object/embed to none', async () => {
      const res = await sendRequest();
      const csp = res.headers['content-security-policy'];
      assert.ok(csp.includes("object-src 'none'"), 'objectSrc missing from CSP');
    });

    await t.test('11. CSP includes upgrade-insecure-requests', async () => {
      const res = await sendRequest();
      const csp = res.headers['content-security-policy'];
      assert.ok(csp.includes('upgrade-insecure-requests'), 'upgradeInsecureRequests missing from CSP');
    });

    await t.test('12. Strict-Transport-Security is skipped in test (non-production) environment', async () => {
      const res = await sendRequest();
      assert.equal(res.headers['strict-transport-security'], undefined);
    });
  } finally {
    server.close();
  }
});
