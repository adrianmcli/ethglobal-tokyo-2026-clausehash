# ClauseHash

A small local-first web app for private document attestations, built for ETHGlobal Tokyo 2026.

You paste in a legal or policy document, it hashes it in the browser (SHA-256), your wallet signs a readable attestation, and you export a JSON receipt. Someone else can import that receipt plus the document and check locally that the hashes match. The document text never leaves the browser and is never in the receipt.

## How it works

1. Text gets canonicalized (LF line endings, trailing whitespace trimmed) so trivial diffs don't change the hash.
2. The canonical text is hashed with SHA-256 via the Web Crypto API.
3. An attestation message is built from the title, jurisdiction, hash, and timestamp.
4. Your wallet (`window.ethereum`) signs it with `personal_sign`.
5. Everything except the document text goes into an exported JSON receipt.
6. Verification re-hashes the supplied text and compares it against the receipt.

No backend, no contract deployment, no build step. Just static files.

## Setup

Nothing to install. Serve the folder over HTTP (modules and Web Crypto don't like `file://`):

```shell
python3 -m http.server 8080
```

Then open http://localhost:8080. You need a browser wallet (e.g. MetaMask) for the signing part.

## Tests

Node 20+:

```shell
npm test
```

## Receipt format

```json
{
  "format": "clausehash-receipt",
  "version": 1,
  "title": "Mutual NDA",
  "jurisdiction": "Japan",
  "algorithm": "SHA-256",
  "canonicalization": "line-endings-lf; trailing-whitespace-trimmed; outer-whitespace-trimmed",
  "documentHash": "…",
  "createdAt": "2026-09-26T15:00:00.000Z",
  "signer": "0x…",
  "signature": "0x…",
  "message": "ClauseHash Document Attestation\n…"
}
```

## Caveats

- The receipt still leaks metadata: title, jurisdiction, timestamp, signer, and a stable fingerprint. Don't share it carelessly.
- Hashes don't hide low-entropy text. If someone can guess the document, they can confirm the hash.
- Read the full attestation in your wallet before signing. The app never asks for a transaction or your keys.
- The built-in verifier only checks hash consistency. It doesn't recover the signer or validate the signature, and says nothing about legal effect — this is a hackathon proof of concept, not legal advice or a signing product.

## Project structure

```text
index.html      app shell
styles.css      styling
src/core.js     canonicalization, hashing, receipt, verification
src/wallet.js   EIP-1193 connect + personal_sign
src/app.js      UI wiring
test/           node --test suite
```

## Disclosure

Built during ETHGlobal Tokyo 2026 with AI assistance (Hermes/OpenAI). I directed the concept, scope, and requirements. No blockchain deployment — the Ethereum part is an injected-wallet `personal_sign` flow.

## Submission copy

Title: ClauseHash — Private, Wallet-Signed Document Attestations

Description: ClauseHash is a local-first document integrity tool for legal and policy workflows. You paste sensitive text, it gets canonicalized and SHA-256 hashed entirely in the browser, then your wallet signs a readable attestation with the title, jurisdiction, fingerprint, and timestamp. The exported JSON receipt excludes the source text, and anyone can import it alongside a document to verify hash consistency locally. Vanilla JS, browser-native APIs, no backend, no contract.
