# ClauseHash

**Private, wallet-signed document attestations — without uploading the document.**

ClauseHash is a small, local-first web app built for ETHGlobal Tokyo 2026. It turns legal or policy text into a deterministic SHA-256 fingerprint, creates a readable attestation, asks an injected Ethereum wallet to sign it with `personal_sign`, and exports a portable JSON receipt. A recipient can import that receipt and independently check whether a supplied document has the same canonical hash.

> ClauseHash does not deploy a contract, write onchain, upload documents, or claim to prove legal validity. It is a compact proof-of-concept for private document integrity workflows.

## Motivation

Legal and policy documents are sensitive, but collaborators often need to prove that they reviewed or approved the same version. Sending the full text to a third-party service creates avoidable confidentiality risk. ClauseHash keeps hashing and verification in the browser: the receipt contains the document fingerprint and limited metadata, not the source text.

## Features

- Accepts a document title, jurisdiction, and full text
- Canonicalizes line endings and whitespace before hashing
- Computes SHA-256 with the browser-native Web Crypto API
- Generates a human-readable attestation message
- Connects to an EIP-1193 injected wallet (`window.ethereum`)
- Requests an explicit `personal_sign` signature
- Exports a versioned JSON receipt with no document text
- Imports a receipt and recomputes the hash locally for match/mismatch verification
- Runs as a static site with no build step and no runtime dependencies
- Includes a Node-native automated test suite

## Run locally

Requirements: a modern browser, Node.js 20+ for tests, and an injected Ethereum wallet (such as MetaMask) for signing.

```bash
git clone <repository-url>
cd ethglobal-tokyo-2026-clausehash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080). A local HTTP server is required because browser security rules may limit ES modules and Web Crypto on `file://` URLs.

No install is needed. To run the suite:

```bash
npm test
```

## How it works

1. ClauseHash converts CRLF/CR line endings to LF, trims trailing whitespace on each line, then trims outer whitespace.
2. The canonical UTF-8 text is hashed with SHA-256.
3. The title, jurisdiction, hash, and ISO timestamp are assembled into a readable attestation.
4. The connected wallet signs the UTF-8 message through `personal_sign`.
5. ClauseHash exports the metadata, message, signer address, and signature as JSON.
6. During verification, the app canonicalizes and hashes the supplied text again, then compares it with `documentHash` in the imported receipt.

## Receipt shape

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

The document body is deliberately excluded.

## Security and privacy

- **Local processing:** document text is handled only in browser memory by the app. There is no backend, analytics, storage, or upload endpoint.
- **Metadata remains sensitive:** exported receipts reveal title, jurisdiction, timestamp, signer address, and a stable document fingerprint. Store and share them appropriately.
- **Dictionary attacks:** hashes do not conceal low-entropy or predictable text. Someone who can guess a document can hash the guess and compare it with the receipt.
- **Wallet consent:** inspect the complete attestation shown in the UI before signing. ClauseHash never requests a transaction or private key.
- **Verification scope:** the built-in verifier checks document/hash consistency only. It does not recover the signer, validate the Ethereum signature, establish authority, timestamp onchain, or determine legal effect.
- **No legal advice:** ClauseHash is an experimental hackathon project, not a legal-signature product or substitute for legal advice.
- **Static integrity:** for serious use, serve reviewed source over trusted infrastructure and pin/audit the exact version.

## Hackathon disclosure

All project-specific code in this repository was created during ETHGlobal Tokyo 2026. Development was AI-assisted using Hermes/OpenAI. The human participant directed the concept, requirements, product scope, and acceptance criteria. The project makes no claim of a blockchain deployment; its Ethereum integration is an injected-wallet `personal_sign` flow.

## ETHGlobal submission copy

### Exact submission title

**ClauseHash — Private, Wallet-Signed Document Attestations**

### One-paragraph description

ClauseHash is a local-first document integrity tool for legal and policy workflows. Users paste sensitive text, canonicalize and SHA-256 hash it entirely in the browser, then ask an injected Ethereum wallet to sign a clear attestation containing the document title, jurisdiction, fingerprint, and timestamp. ClauseHash exports a portable JSON receipt that excludes the source text, and anyone can import the receipt alongside a document to verify hash consistency locally. It uses browser-native APIs, vanilla JavaScript, and no backend or smart-contract deployment.

### Short description

Hash sensitive documents locally, sign a readable attestation with an Ethereum wallet, and export a privacy-preserving receipt anyone can verify.

## Project structure

```text
index.html          Static application shell
styles.css          Responsive visual design
src/app.js          Browser workflow and UI state
src/core.js         Canonicalization, hashing, receipt, and verification logic
src/wallet.js       EIP-1193 connection and personal_sign adapter
test/               Node-native automated tests
```
