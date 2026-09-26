import test from 'node:test';
import assert from 'node:assert/strict';
import { connectWallet, signAttestation } from '../src/wallet.js';

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

test('signAttestation uses personal_sign with message before account', async () => {
  const calls = [];
  const provider = {
    async request(payload) {
      calls.push(payload);
      return '0xsigned';
    }
  };

  assert.equal(await signAttestation(provider, 'hello', '0x1234'), '0xsigned');
  assert.deepEqual(calls, [{
    method: 'personal_sign',
    params: ['0x68656c6c6f', '0x1234']
  }]);
});
