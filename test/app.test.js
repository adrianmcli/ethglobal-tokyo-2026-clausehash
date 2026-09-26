import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('web app exposes creation, wallet, export, and verification controls', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of [
    'document-title', 'jurisdiction', 'document-text', 'prepare-button',
    'connect-button', 'sign-button', 'export-button', 'receipt-file',
    'verification-text', 'verify-button', 'verification-result'
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  assert.match(html, /<script type="module" src="\.\/src\/app\.js"><\/script>/);
});
