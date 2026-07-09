// Complete code for tests/security.test.js
/**
 * Security test suite.
 * 
 * @file tests/security.test.js
 * @author Ayushh Sharma
 * @description Security test suite.
 */

// Import required modules
const request = require('supertest');
const app = require('../server/index');

// Define test suite
describe('Security', () => {
  it('should have a valid Content Security Policy (CSP) header', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('should have a valid CSP directive for script-src', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-security-policy']).toContain('script-src');
  });

  it('should have a valid CSP directive for style-src', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-security-policy']).toContain('style-src');
  });
});