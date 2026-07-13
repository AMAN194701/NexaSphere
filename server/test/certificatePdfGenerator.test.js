import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { renderCertificatePdf } from '../services/certificates/certificatePdfGenerator.js';

test('renderCertificatePdf creates a parseable PDF with certificate details', async () => {
  const require = createRequire(import.meta.url);
  const { PDFParse } = require('../node_modules/pdf-parse/dist/pdf-parse/cjs/index.cjs');

  const buffer = await renderCertificatePdf({
    event: {
      name: 'Workshop on React',
      description: 'Hands-on workshop on modern React patterns.',
    },
    attendee: {
      full_name: 'Aman Gupta',
      email: 'aman@example.com',
    },
    code: 'NS-CERT-1234ABCD',
    issuedAt: '2026-07-13T00:00:00.000Z',
    verifyUrl: 'https://nexasphere.com/certificates/verify/NS-CERT-1234ABCD',
  });

  assert.ok(Buffer.isBuffer(buffer), 'Expected a PDF buffer');
  assert.equal(buffer.subarray(0, 4).toString(), '%PDF');

  const parser = new PDFParse({ data: buffer });
  try {
    const parsed = await parser.getText();
    const text = parsed.text;

    assert.match(text, /Certificate of Completion/);
    assert.match(text, /Workshop on React/);
    assert.match(text, /Aman Gupta/);
    assert.match(text, /NS-CERT-1234ABCD/);
    assert.match(
      text,
      /Verify online: https:\/\/nexasphere\.com\/certificates\/verify\/NS-CERT-1234ABCD/
    );
  } finally {
    await parser.destroy();
  }
});
