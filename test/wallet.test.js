import test from 'node:test';
import assert from 'node:assert/strict';
import { connectWallet } from '../src/wallet.js';

test('connectWallet requests an injected Ethereum account', async () => {
  const calls = [];
  const provider = {
    async request(payload) {
      calls.push(payload);
      return ['0x1234'];
    }
  };

  assert.equal(await connectWallet(provider), '0x1234');
  assert.deepEqual(calls, [{ method: 'eth_requestAccounts' }]);
});
