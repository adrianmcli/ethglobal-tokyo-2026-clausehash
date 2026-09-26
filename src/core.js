export function canonicalizeText(text) {
  return String(text)
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

export async function hashText(text) {
  const canonicalText = canonicalizeText(text);
  const bytes = new TextEncoder().encode(canonicalText);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createAttestationMessage({ title, jurisdiction, hash, createdAt }) {
  return [
    'ClauseHash Document Attestation',
    '',
    `Title: ${title}`,
    `Jurisdiction: ${jurisdiction}`,
    `SHA-256: ${hash}`,
    `Created: ${createdAt}`,
    '',
    'I attest that I reviewed the document represented by this hash.'
  ].join('\n');
}

export function buildReceipt({ title, jurisdiction, hash, createdAt, account, signature, message }) {
  return {
    format: 'clausehash-receipt',
    version: 1,
    title,
    jurisdiction,
    algorithm: 'SHA-256',
    canonicalization: 'line-endings-lf; trailing-whitespace-trimmed; outer-whitespace-trimmed',
    documentHash: hash,
    createdAt,
    signer: account,
    signature,
    message
  };
}
