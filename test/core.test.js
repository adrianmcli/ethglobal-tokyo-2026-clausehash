import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalizeText
} from '../src/core.js';

test('canonicalizeText normalizes line endings and trims trailing whitespace', () => {
  assert.equal(canonicalizeText('  Clause A  \r\nClause B\t\r\n\r\n'), 'Clause A\nClause B');
});
