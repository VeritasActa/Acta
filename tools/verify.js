#!/usr/bin/env node
/**
 * acta-verify — Independent verification of Acta topic exports
 *
 * Verifies hash chain integrity without trusting the operator.
 *
 * Dependencies:
 *   Chain verification: zero — uses only Node.js built-ins (crypto, fs).
 *   Anchor signature verification: requires @noble/curves (optional, graceful fallback).
 *
 * Charter invariant #6:  "independently verifiable without relying on any single operator"
 * Charter invariant #10: "verify... without relying on any single operator"
 *
 * Usage:
 *   node tools/verify.js <url-or-file>                  Verify a topic export
 *   node tools/verify.js --anchor <url-or-file>         Verify a signed anchor
 *   node tools/verify.js --anchor <url> --key <hex>     Verify against specific public key
 *
 * @license MIT
 */

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

// ── JCS Serialization (RFC 8785) ────────────────────────────────────
// Identical to the implementation in src/durable-objects/ledger-chain.js.
// Inlined here so the verifier has zero dependency on the operator's code.

function sortKeysDeep(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = sortKeysDeep(obj[key]);
    return acc;
  }, {});
}

function jcsSerialize(obj) {
  return JSON.stringify(sortKeysDeep(obj));
}

// ── Hashing ─────────────────────────────────────────────────────────

function sha256(str) {
  return createHash('sha256').update(str, 'utf8').digest('hex');
}

function jcsSha256(obj) {
  return sha256(jcsSerialize(obj));
}

// ── Hex utilities ───────────────────────────────────────────────────

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Export Verification ─────────────────────────────────────────────
// Recomputes every hash in the chain and verifies linkage.
// This is the core independent verification — no trust required.

function verifyExport(data) {
  const { topic, entries, chain_head } = data;

  if (!entries || !Array.isArray(entries)) {
    return { valid: false, error: 'No entries array in export' };
  }

  if (entries.length === 0) {
    return {
      valid: true,
      topic,
      total_entries: 0,
      chain_head: null,
      tombstones: [],
      errors: [],
    };
  }

  const errors = [];
  const tombstones = [];
  let expectedPrevHash = '0'.repeat(64);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // 1. Verify chain linkage: prev_hash must match previous entry_hash
    if (entry.prev_hash !== expectedPrevHash) {
      errors.push({
        index: i,
        entry_id: entry.entry_id,
        type: 'prev_hash_mismatch',
        expected: expectedPrevHash,
        actual: entry.prev_hash,
      });
    }

    // 2. Verify payload_hash (skip tombstoned entries — payload purged but hash preserved)
    if (entry.tombstone) {
      tombstones.push({
        index: i,
        entry_id: entry.entry_id,
        category: entry.tombstone.category,
        authority_reference: entry.tombstone.authority_reference,
        tombstoned_at: entry.tombstone.tombstoned_at,
      });
    } else if (entry.payload !== null && entry.payload !== undefined) {
      const recomputedPayloadHash = jcsSha256(entry.payload);
      if (recomputedPayloadHash !== entry.payload_hash) {
        errors.push({
          index: i,
          entry_id: entry.entry_id,
          type: 'payload_hash_mismatch',
          expected: recomputedPayloadHash,
          actual: entry.payload_hash,
        });
      }
    }

    // 3. Recompute entry_hash from envelope
    //    The envelope uses payload_hash (not payload), so this works for tombstones too.
    const authorHash = jcsSha256(entry.author || {});
    const envelope = {
      author_hash: authorHash,
      payload_hash: entry.payload_hash,
      prev_hash: entry.prev_hash,
      subtype: entry.subtype,
      timestamp: entry.timestamp,
      topic: entry.topic,
      type: entry.type,
    };

    const recomputedEntryHash = jcsSha256(envelope);
    if (recomputedEntryHash !== entry.entry_hash) {
      errors.push({
        index: i,
        entry_id: entry.entry_id,
        type: 'entry_hash_mismatch',
        expected: recomputedEntryHash,
        actual: entry.entry_hash,
      });
    }

    expectedPrevHash = entry.entry_hash;
  }

  // 4. Verify chain head matches the last entry
  if (chain_head) {
    const lastEntry = entries[entries.length - 1];
    if (chain_head.chain_head_hash !== lastEntry.entry_hash) {
      errors.push({
        type: 'chain_head_mismatch',
        expected: lastEntry.entry_hash,
        actual: chain_head.chain_head_hash,
      });
    }
    if (chain_head.chain_length !== entries.length) {
      errors.push({
        type: 'chain_length_mismatch',
        expected: entries.length,
        actual: chain_head.chain_length,
      });
    }
  }

  const lastEntry = entries[entries.length - 1];
  return {
    valid: errors.length === 0,
    topic,
    total_entries: entries.length,
    chain_head: lastEntry.entry_hash,
    tombstones,
    errors,
  };
}

// ── Merkle Root Recomputation ───────────────────────────────────────
// Replicates the Merkle tree from chain-publication.js.

function computeMerkleRoot(chainHeads) {
  const sorted = [...chainHeads].sort((a, b) => a.topic.localeCompare(b.topic));

  const leaves = sorted.map(head => sha256(jcsSerialize(head)));

  if (leaves.length === 0) return '0'.repeat(64);
  if (leaves.length === 1) return leaves[0];

  let layer = leaves;
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        next.push(sha256(layer[i] + layer[i + 1]));
      } else {
        next.push(layer[i]);
      }
    }
    layer = next;
  }

  return layer[0];
}

// ── Anchor Verification ─────────────────────────────────────────────
// Verifies the Ed25519 signature on a daily anchor checkpoint.

async function verifyAnchor(anchor, expectedPublicKeyHex) {
  const { signature, public_key, ...payload } = anchor;

  if (!signature || !public_key) {
    return { valid: false, error: 'Anchor missing signature or public_key' };
  }

  if (expectedPublicKeyHex && public_key !== expectedPublicKeyHex) {
    return {
      valid: false,
      error: `Public key mismatch — expected ${expectedPublicKeyHex.slice(0, 16)}..., got ${public_key.slice(0, 16)}...`,
    };
  }

  // Recompute Merkle root from chain heads
  if (payload.chain_heads) {
    const recomputed = computeMerkleRoot(payload.chain_heads);
    if (recomputed !== payload.merkle_root) {
      return {
        valid: false,
        error: `Merkle root mismatch — recomputed ${recomputed.slice(0, 16)}..., anchor claims ${payload.merkle_root.slice(0, 16)}...`,
      };
    }
  }

  // Try to load @noble/curves for Ed25519
  let ed25519;
  try {
    const noble = await import('@noble/curves/ed25519');
    ed25519 = noble.ed25519;
  } catch {
    return {
      merkle_valid: true,
      signature_valid: null,
      warning: 'Ed25519 verification requires @noble/curves. Install with: npm install @noble/curves',
      merkle_root: payload.merkle_root,
      topic_count: payload.topic_count,
      timestamp: payload.timestamp,
    };
  }

  const message = new TextEncoder().encode(jcsSerialize(payload));
  const sigBytes = hexToBytes(signature);
  const pubBytes = hexToBytes(public_key);

  try {
    const valid = ed25519.verify(sigBytes, message, pubBytes);
    return {
      valid,
      merkle_valid: true,
      signature_valid: valid,
      merkle_root: payload.merkle_root,
      topic_count: payload.topic_count,
      timestamp: payload.timestamp,
      public_key: public_key,
    };
  } catch (err) {
    return { valid: false, error: `Signature verification failed: ${err.message}` };
  }
}

// ── Data Loading ────────────────────────────────────────────────────

async function loadData(source) {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const resp = await fetch(source);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    return resp.json();
  }
  const raw = await readFile(source, 'utf8');
  return JSON.parse(raw);
}

// ── CLI Output ──────────────────────────────────────────────────────

function printExportResult(result, source) {
  console.log(`\n  acta-verify\n  Source: ${source}\n`);

  if (result.valid) {
    console.log(`  \x1b[32m\u2713\x1b[0m  Chain intact`);
    console.log(`     Topic:      ${result.topic}`);
    console.log(`     Entries:    ${result.total_entries}`);
    console.log(`     Chain head: ${result.chain_head}`);
    if (result.tombstones.length > 0) {
      console.log(`     Tombstones: ${result.tombstones.length}`);
      for (const t of result.tombstones) {
        console.log(`       [${t.index}] ${t.entry_id} \u2014 ${t.category} (${t.tombstoned_at})`);
      }
    }
  } else {
    console.log(`  \x1b[31m\u2717\x1b[0m  Verification FAILED`);
    console.log(`     Topic:      ${result.topic}`);
    console.log(`     Entries:    ${result.total_entries}`);
    console.log(`     Errors:     ${result.errors.length}`);
    for (const err of result.errors) {
      const idx = err.index !== undefined ? `[${err.index}]` : '[-]';
      const exp = typeof err.expected === 'string' ? err.expected.slice(0, 16) + '...' : err.expected;
      const act = typeof err.actual === 'string' ? err.actual.slice(0, 16) + '...' : err.actual;
      console.log(`       ${idx} ${err.type}: expected ${exp}, got ${act}`);
    }
  }
  console.log('');
}

function printAnchorResult(result, source) {
  console.log(`\n  acta-verify --anchor\n  Source: ${source}\n`);

  if (result.valid === false) {
    console.log(`  \x1b[31m\u2717\x1b[0m  ${result.error}`);
  } else if (result.signature_valid === null) {
    console.log(`  \x1b[32m\u2713\x1b[0m  Merkle root verified (recomputed from chain heads)`);
    console.log(`  \x1b[33m\u26a0\x1b[0m  ${result.warning}`);
    console.log(`     Merkle root: ${result.merkle_root}`);
    console.log(`     Topics:      ${result.topic_count}`);
    console.log(`     Timestamp:   ${result.timestamp}`);
  } else if (result.valid) {
    console.log(`  \x1b[32m\u2713\x1b[0m  Anchor signature valid`);
    console.log(`  \x1b[32m\u2713\x1b[0m  Merkle root verified`);
    console.log(`     Merkle root: ${result.merkle_root}`);
    console.log(`     Topics:      ${result.topic_count}`);
    console.log(`     Timestamp:   ${result.timestamp}`);
    console.log(`     Public key:  ${result.public_key}`);
  }
  console.log('');
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
  acta-verify \u2014 Independent verification of Acta topic exports

  Verifies hash chain integrity without trusting the operator.
  Charter invariants #6 and #10.

  Usage:
    node tools/verify.js <url-or-file>                  Verify a topic export
    node tools/verify.js --anchor <url-or-file>         Verify a signed anchor
    node tools/verify.js --anchor <url> --key <hex>     Verify against known key

  Examples:
    node tools/verify.js https://hall.example.com/api/export/climate
    node tools/verify.js export.json
    node tools/verify.js --anchor https://hall.example.com/api/anchor/latest
`);
    process.exit(0);
  }

  const isAnchor = args.includes('--anchor');
  const keyIdx = args.indexOf('--key');
  const publicKeyHex = keyIdx !== -1 ? args[keyIdx + 1] : null;
  const source = args.find(a => !a.startsWith('--') && a !== publicKeyHex);

  if (!source) {
    console.error('Error: no source URL or file specified');
    process.exit(1);
  }

  try {
    const data = await loadData(source);

    if (isAnchor) {
      const result = await verifyAnchor(data, publicKeyHex);
      printAnchorResult(result, source);
      process.exit(result.valid === false ? 1 : 0);
    } else {
      const result = verifyExport(data);
      printExportResult(result, source);
      process.exit(result.valid ? 0 : 1);
    }
  } catch (err) {
    console.error(`\n  Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();
