import {
  buildReceipt,
  createAttestationMessage,
  hashText,
  verifyReceiptHash
} from './core.js';
import { connectWallet, signAttestation } from './wallet.js';

const $ = (selector) => document.querySelector(selector);
let prepared = null;
let account = null;
let receipt = null;
let importedReceipt = null;

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item === tab));
    document.querySelectorAll('.panel').forEach((panel) => {
      const active = panel.id === tab.dataset.panel;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  });
}

$('#document-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = $('#document-title').value.trim();
  const jurisdiction = $('#jurisdiction').value.trim();
  const text = $('#document-text').value;
  const createdAt = new Date().toISOString();
  const hash = await hashText(text);
  const message = createAttestationMessage({ title, jurisdiction, hash, createdAt });

  prepared = { title, jurisdiction, text, createdAt, hash, message };
  receipt = null;
  $('#hash-output').textContent = hash;
  $('#message-output').textContent = message;
  $('#attestation-card').classList.remove('hidden');
  $('#sign-button').disabled = !account;
  $('#export-button').disabled = true;
  setCreateStatus(account ? `Wallet connected: ${shortAddress(account)}. Ready to sign.` : 'Hash prepared. Connect a wallet to sign.');
  $('#attestation-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

$('#connect-button').addEventListener('click', async () => {
  try {
    setCreateStatus('Waiting for wallet connection…');
    account = await connectWallet(window.ethereum);
    $('#connect-button').textContent = shortAddress(account);
    $('#sign-button').disabled = !prepared;
    setCreateStatus(`Wallet connected: ${account}`);
  } catch (error) {
    setCreateStatus(error.message, true);
  }
});

$('#sign-button').addEventListener('click', async () => {
  if (!prepared || !account) return;
  try {
    setCreateStatus('Review and approve the attestation in your wallet…');
    const signature = await signAttestation(window.ethereum, prepared.message, account);
    receipt = buildReceipt({ ...prepared, account, signature });
    $('#export-button').disabled = false;
    $('#sign-button').textContent = 'Signed ✓';
    setCreateStatus('Signature received. Your portable receipt is ready to export.');
  } catch (error) {
    setCreateStatus(error.message, true);
  }
});

$('#export-button').addEventListener('click', () => {
  if (!receipt) return;
  const blob = new Blob([`${JSON.stringify(receipt, null, 2)}\n`], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `clausehash-${safeFilename(receipt.title)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  setCreateStatus('Receipt exported. Store it with access controls appropriate for its metadata.');
});

$('#receipt-file').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    importedReceipt = JSON.parse(await file.text());
    $('#file-name').textContent = file.name;
    showVerification('Receipt loaded. Paste the document text, then verify.', '');
  } catch {
    importedReceipt = null;
    showVerification('The selected file is not valid JSON.', 'failure');
  }
});

$('#verify-button').addEventListener('click', async () => {
  if (!importedReceipt) {
    showVerification('Choose a ClauseHash receipt first.', 'failure');
    return;
  }
  try {
    const result = await verifyReceiptHash(importedReceipt, $('#verification-text').value);
    if (result.valid) {
      showVerification(`Hash match — this text is consistent with “${importedReceipt.title || 'Untitled'}”.`, 'success', result.actualHash);
    } else {
      showVerification('Hash mismatch — this is not the same canonical document text.', 'failure', `Expected ${result.expectedHash}\nActual   ${result.actualHash}`);
    }
  } catch (error) {
    showVerification(error.message, 'failure');
  }
});

function setCreateStatus(message, isError = false) {
  $('#create-status').textContent = message;
  $('#create-status').classList.toggle('error', isError);
}

function showVerification(message, className, detail = '') {
  const result = $('#verification-result');
  result.className = `verification-result ${className}`;
  result.replaceChildren(document.createTextNode(message));
  if (detail) {
    const code = document.createElement('code');
    code.textContent = detail;
    result.append(code);
  }
}

function shortAddress(value) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function safeFilename(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'receipt';
}
