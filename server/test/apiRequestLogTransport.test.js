import assert from 'node:assert/strict';
import test from 'node:test';

test('logger configures a 90-day JSON API request log transport', async () => {
  const previousLogFormat = process.env.LOG_FORMAT;
  process.env.LOG_FORMAT = 'json';

  try {
    const { default: logger } = await import(`../utils/logger.js?api-request-log=${Date.now()}`);
    const apiRequestTransport = logger.transports.find((transport) => {
      return transport.filename === 'api-requests-%DATE%.log';
    });

    assert.ok(apiRequestTransport, 'expected an api-requests daily rotate transport');
    assert.equal(apiRequestTransport.name, 'dailyRotateFile');
    assert.equal(apiRequestTransport.level, 'http');
    assert.equal(apiRequestTransport.options.maxFiles, '90d');
    assert.equal(apiRequestTransport.options.zippedArchive, true);
  } finally {
    if (previousLogFormat === undefined) {
      delete process.env.LOG_FORMAT;
    } else {
      process.env.LOG_FORMAT = previousLogFormat;
    }
  }
});
