import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReceipt,
  canonicalizeText,
  createAttestationMessage,
  hashText,
  verifyReceiptHash
} from '../src/core.js';

test('canonicalizeText normalizes line endings and trims trailing whitespace', () => {
  assert.equal(canonicalizeText('  Clause A  \r\nClause B\t\r\n\r\n'), 'Clause A\nClause B');
});

test('hashText returns the SHA-256 digest of canonical text', async () => {
  assert.equal(
    await hashText('hello'),
    '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
  );
});

test('createAttestationMessage produces a stable human-readable statement', () => {
  const message = createAttestationMessage({
    title: 'Mutual NDA',
    jurisdiction: 'Japan',
    hash: 'abc123',
    createdAt: '2026-09-26T15:00:00.000Z'
  });

  assert.equal(message, [
    'ClauseHash Document Attestation',
    '',
    'Title: Mutual NDA',
    'Jurisdiction: Japan',
    'SHA-256: abc123',
    'Created: 2026-09-26T15:00:00.000Z',
    '',
    'I attest that I reviewed the document represented by this hash.'
  ].join('\n'));
});

test('buildReceipt includes verifiable metadata without document text', () => {
  const receipt = buildReceipt({
    title: 'Mutual NDA',
    jurisdiction: 'Japan',
    hash: 'abc123',
    createdAt: '2026-09-26T15:00:00.000Z',
    account: '0xabc',
    signature: '0xsigned',
    message: 'attestation'
  });

  assert.deepEqual(receipt, {
    format: 'clausehash-receipt',
    version: 1,
    title: 'Mutual NDA',
    jurisdiction: 'Japan',
    algorithm: 'SHA-256',
    canonicalization: 'line-endings-lf; trailing-whitespace-trimmed; outer-whitespace-trimmed',
    documentHash: 'abc123',
    createdAt: '2026-09-26T15:00:00.000Z',
    signer: '0xabc',
    signature: '0xsigned',
    message: 'attestation'
  });
  assert.equal('text' in receipt, false);
});

test('verifyReceiptHash reports whether supplied text matches an imported receipt', async () => {
  const documentHash = await hashText('Confidential terms');
  const receipt = { format: 'clausehash-receipt', version: 1, documentHash };

  assert.deepEqual(await verifyReceiptHash(receipt, 'Confidential terms\r\n'), {
    valid: true,
    expectedHash: documentHash,
    actualHash: documentHash
  });

  const mismatch = await verifyReceiptHash(receipt, 'Changed terms');
  assert.equal(mismatch.valid, false);
  assert.equal(mismatch.expectedHash, documentHash);
  assert.notEqual(mismatch.actualHash, documentHash);
});
