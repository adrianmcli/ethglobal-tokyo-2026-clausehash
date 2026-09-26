import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalizeText,
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
