/**
 * Chain Head Publication — Signed Anchoring
 *
 * Scheduled handler (cron trigger) that computes a Merkle root
 * of all topic chain heads, signs it with Ed25519, and stores
 * the signed anchor.
 *
 * Architecture (from adversarial analysis):
 *   Without external anchoring, the operator can rewrite the chain.
 *   This produces a signed cryptographic proof that the ledger existed
 *   in a specific state at a specific time.
 *
 *   The Ed25519 signature means anyone can verify the anchor offline
 *   using only the public key — no trust in the operator required.
 *
 *   NOTE: This produces signed checkpoints. External witnessing
 *   (publishing to an operator-independent location) is a separate
 *   concern — see Phase 2 below.
 *
 *   Charter invariant #6:  independently verifiable
 *   Charter invariant #10: verify without relying on any single operator
 *
 * Secrets required:
 *   ANCHOR_SIGNING_KEY — Ed25519 private key (64 hex chars = 32 bytes)
 *
 * @license MIT
 */

import { ed25519 } from '@noble/curves/ed25519';
import { jcsSerialize } from './durable-objects/ledger-chain.js';

// ── Hex utilities ───────────────────────────────────────────────────

function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

function bytesToHex(bytes) {
    return [...new Uint8Array(bytes)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ── Ed25519 via @noble/curves ───────────────────────────────────────
// Proven, audited, portable. Same library used by @veritasacta/verify.

/**
 * Sign a message string with Ed25519.
 * Returns the signature as a hex string.
 */
function ed25519Sign(message, privateKeyHex) {
    const privateKeyBytes = hexToBytes(privateKeyHex);
    const messageBytes = new TextEncoder().encode(message);
    const signature = ed25519.sign(messageBytes, privateKeyBytes);
    return bytesToHex(signature);
}

/**
 * Derive the Ed25519 public key from a private key.
 * Returns the public key as a hex string.
 */
function ed25519GetPublicKey(privateKeyHex) {
    const privateKeyBytes = hexToBytes(privateKeyHex);
    const publicKeyBytes = ed25519.getPublicKey(privateKeyBytes);
    return bytesToHex(publicKeyBytes);
}

/**
 * Get the public verification key for anchors.
 * Called by the /api endpoint.
 */
export function getAnchorPublicKey(env) {
    if (!env.ANCHOR_SIGNING_KEY) return null;
    try {
        return ed25519GetPublicKey(env.ANCHOR_SIGNING_KEY);
    } catch (err) {
        console.error('[ANCHOR] Failed to derive public key:', err.message);
        return null;
    }
}

/**
 * Sign an anchor payload and return the complete signed anchor.
 * Exported for testing.
 */
export function signAnchor(payload, privateKeyHex) {
    const publicKey = ed25519GetPublicKey(privateKeyHex);
    const payloadWithKey = { ...payload, public_key: publicKey };
    const message = jcsSerialize(payloadWithKey);
    const signature = ed25519Sign(message, privateKeyHex);
    return { ...payloadWithKey, signature };
}

/**
 * Verify an anchor signature. Exported for testing.
 */
export function verifyAnchorSignature(anchor) {
    const { signature, public_key, ...payload } = anchor;
    if (!signature || !public_key) return false;

    const payloadWithKey = { ...payload, public_key };
    const message = new TextEncoder().encode(jcsSerialize(payloadWithKey));
    const sigBytes = hexToBytes(signature);
    const pubBytes = hexToBytes(public_key);

    return ed25519.verify(sigBytes, message, pubBytes);
}

/**
 * Scheduled handler — called by cron trigger.
 * Computes, signs, and stores a Merkle root of all topic chain heads.
 */
export async function handleScheduled(env) {
    const kv = env.ACTA_KV;
    if (!kv) return;

    // 1. List all topics
    let topics = [];
    const rawTopics = await kv.get('topics:list', { type: 'json' });
    if (rawTopics) topics = rawTopics;

    if (topics.length === 0) {
        console.log('[ANCHOR] No topics to anchor.');
        return;
    }

    // 2. Fetch chain heads for each topic
    const chainHeads = [];
    for (const topic of topics) {
        const topicName = typeof topic === 'string' ? topic : topic.topic;
        try {
            const id = env.LEDGER_CHAIN.idFromName(topicName);
            const stub = env.LEDGER_CHAIN.get(id);
            const resp = await stub.fetch(new Request('http://internal/chain-head'));
            const head = await resp.json();
            chainHeads.push({
                topic: topicName,
                chain_head_hash: head.chain_head_hash,
                chain_length: head.chain_length,
            });
        } catch (err) {
            console.error(`[ANCHOR] Failed to get chain head for ${topicName}:`, err.message);
        }
    }

    if (chainHeads.length === 0) return;

    // 3. Compute Merkle root
    const merkleRoot = await computeMerkleRoot(chainHeads);

    // 4. Build anchor payload
    const payload = {
        version: 1,
        type: 'acta:anchor',
        timestamp: new Date().toISOString(),
        merkle_root: merkleRoot,
        chain_heads: chainHeads,
        topic_count: chainHeads.length,
    };

    // 5. Sign with Ed25519 if key is configured
    let anchor;
    if (env.ANCHOR_SIGNING_KEY) {
        try {
            anchor = signAnchor(payload, env.ANCHOR_SIGNING_KEY);
            console.log(`[ANCHOR] Signed anchor. Merkle root: ${merkleRoot}`);
        } catch (err) {
            console.error('[ANCHOR] Signing failed, storing unsigned:', err.message);
            anchor = payload;
        }
    } else {
        console.log('[ANCHOR] No signing key configured. Storing unsigned anchor.');
        anchor = payload;
    }

    // 6. Store anchor record
    const anchorKey = `anchor:${payload.timestamp}`;
    await kv.put(anchorKey, JSON.stringify(anchor), { expirationTtl: 86400 * 365 * 5 }); // 5 year retention
    await kv.put('anchor:latest', JSON.stringify(anchor));

    console.log(`[ANCHOR] Anchored ${chainHeads.length} topics. Merkle root: ${merkleRoot}`);

    // Phase 2 (not yet implemented): Publish to external witness
    // External witnessing requires publishing the signed anchor to a location
    // the operator does not control (public git repo, Bluesky, blockchain).
    // The signed checkpoint above is a prerequisite; external publication is separate.

    return anchor;
}

/**
 * Compute a simple Merkle root from chain heads.
 * Sorted by topic name for determinism.
 */
async function computeMerkleRoot(chainHeads) {
    const sorted = [...chainHeads].sort((a, b) => a.topic.localeCompare(b.topic));

    const leaves = [];
    for (const head of sorted) {
        const leaf = await sha256(jcsSerialize(head));
        leaves.push(leaf);
    }

    if (leaves.length === 0) return '0'.repeat(64);
    if (leaves.length === 1) return leaves[0];

    let layer = leaves;
    while (layer.length > 1) {
        const nextLayer = [];
        for (let i = 0; i < layer.length; i += 2) {
            if (i + 1 < layer.length) {
                nextLayer.push(await sha256(layer[i] + layer[i + 1]));
            } else {
                nextLayer.push(layer[i]);
            }
        }
        layer = nextLayer;
    }

    return layer[0];
}

async function sha256(str) {
    const buffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(str)
    );
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
