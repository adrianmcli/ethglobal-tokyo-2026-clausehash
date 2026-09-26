import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalizeText,
  createAttestationMessage,
  hashText
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
