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
