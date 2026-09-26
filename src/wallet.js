function requireProvider(provider) {
  if (!provider?.request) {
    throw new Error('No injected Ethereum wallet found. Install or enable a compatible wallet.');
  }
  return provider;
}

export async function connectWallet(provider) {
  const accounts = await requireProvider(provider).request({ method: 'eth_requestAccounts' });
  if (!accounts?.[0]) throw new Error('The wallet did not return an account.');
  return accounts[0];
}

export async function signAttestation(provider, message, account) {
  const hexMessage = `0x${Array.from(new TextEncoder().encode(message), (byte) =>
    byte.toString(16).padStart(2, '0')).join('')}`;
  return requireProvider(provider).request({
    method: 'personal_sign',
    params: [hexMessage, account]
  });
}
