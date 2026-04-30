#!/usr/bin/env node
/**
 * Verify repository examples without trusting the generator code.
 */

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { ed25519 } from '@noble/curves/ed25519';

function sortKeysDeep(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  return Object.keys(value).sort().reduce((acc, key) => {
    acc[key] = sortKeysDeep(value[key]);
    return acc;
  }, {});
}

function canonical(value) {
  return JSON.stringify(sortKeysDeep(value));
}

function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function digest(value) {
  return `sha256:${sha256(canonical(value))}`;
}

function withoutFields(value, fields) {
  const omit = new Set(fields);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !omit.has(key)));
}

function stripSha256(value) {
  return value.startsWith('sha256:') ? value.slice('sha256:'.length) : value;
}

function hexToBytes(hex) {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
    throw new Error(`invalid hex string: ${hex}`);
  }
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function verifySignature({ message, signatureHex, publicKeyHex, label }) {
  const ok = ed25519.verify(hexToBytes(signatureHex), new TextEncoder().encode(message), hexToBytes(publicKeyHex));
  assert(ok, `${label}: signature verification failed`);
}

async function verifyAgentShellSupervisor() {
  const path = 'examples/agent-shell-supervisor/sample-execute-receipt.json';
  const receipt = await readJson(path);

  const idPayload = withoutFields(receipt, ['receipt_id', 'signature']);
  assert(receipt.receipt_id === digest(idPayload), `${path}: receipt_id mismatch`);

  const signable = withoutFields(receipt, ['signature']);
  verifySignature({
    message: canonical(signable),
    signatureHex: receipt.signature.sig,
    publicKeyHex: receipt.signature.public_key,
    label: path,
  });

  console.log(`ok ${path}`);
}

async function verifyDefenseClawDecisionReceipt() {
  const path = 'examples/defenseclaw-decision-receipt/sample-decision-receipt.json';
  const receipt = await readJson(path);
  const expectedHash = (await readFile('examples/defenseclaw-decision-receipt/expected-full-receipt-hash.txt', 'utf8')).trim();

  const signable = withoutFields(receipt, ['signature', 'public_key']);
  verifySignature({
    message: canonical(signable),
    signatureHex: receipt.signature,
    publicKeyHex: receipt.public_key,
    label: path,
  });

  assert(expectedHash === digest(receipt), `${path}: full receipt hash mismatch`);
  assert(stripSha256(expectedHash).length === 64, `${path}: expected hash is not sha256 length`);

  console.log(`ok ${path}`);
}

async function main() {
  await verifyAgentShellSupervisor();
  await verifyDefenseClawDecisionReceipt();
  console.log('ok all example receipts verified');
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
