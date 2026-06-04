import assert from 'node:assert/strict';
import test from 'node:test';
import {
  logError,
  getErrorStats,
  clearErrors,
  __errorTrackingServiceInternals,
} from '../services/errorTrackingService.js';
import logger from '../utils/logger.js';

// Silence logging during tests to keep console output clean
logger.error = () => {};
logger.info = () => {};

test('error tracking service caps the errorsByEndpoint map to 1000 items to prevent OOM', async () => {
  clearErrors();
  
  const { errorStore } = __errorTrackingServiceInternals;

  // Log errors for 1050 unique endpoints
  for (let i = 0; i < 1050; i++) {
    const error = new Error(`Fuzz error ${i}`);
    await logError(error, {
      method: 'GET',
      url: `/api/fuzz-${i}`,
      status: 404,
    });
  }

  // The size of errorsByEndpoint should be capped at 1000
  const uniqueEndpointsCount = Object.keys(errorStore.errorsByEndpoint).length;
  assert.equal(uniqueEndpointsCount, 1000, 'Unique endpoints count should be capped at 1000');

  // Verify that active/frequent endpoints are preserved
  // If we log the same endpoint multiple times, its count increases
  const frequentEndpoint = '/api/frequent';
  for (let i = 0; i < 5; i++) {
    await logError(new Error('Frequent error'), {
      method: 'POST',
      url: frequentEndpoint,
      status: 500,
    });
  }

  // The frequent endpoint should exist in errorsByEndpoint and have a count of 5
  assert.equal(errorStore.errorsByEndpoint[`POST ${frequentEndpoint}`], 5);

  // The size should still be exactly 1000
  const postUniqueCount = Object.keys(errorStore.errorsByEndpoint).length;
  assert.equal(postUniqueCount, 1000);
});
