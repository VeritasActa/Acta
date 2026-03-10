/**
 * Round-trip tests for Ed25519 anchor signing and verification.
 *
 * Proves the complete path:
 *   1. Generate key pair
 *   2. Sign an anchor
 *   3. Verify the signature independently
 *   4. Detect tampering
 *
 * Uses @noble/curves/ed25519 directly — same library as the Worker.
 *
 * @license MIT
 */

import { describe, it, expect } from 'vitest';
import { ed25519 } from '@noble/curves/ed25519';
import { signAnchor, verifyAnchorSignature, getAnchorPublicKey } from '../src/chain-publication.js';

// ── Hex utilities (same as chain-publication.js) ────────────────────

function bytesToHex(bytes) {
    return [...new Uint8Array(bytes)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

// ── Test key pair ───────────────────────────────────────────────────
// Fixed test key — DO NOT use in production.

const TEST_PRIVATE_KEY = 'a'.repeat(64); // 32 bytes of 0xAA
const TEST_PUBLIC_KEY = bytesToHex(ed25519.getPublicKey(hexToBytes(TEST_PRIVATE_KEY)));

// ── Test anchor payload ─────────────────────────────────────────────

function makeTestPayload() {
    return {
        version: 1,
        type: 'acta:anchor',
        timestamp: '2026-03-10T00:00:00.000Z',
        merkle_root: 'f'.repeat(64),
        chain_heads: [
            { topic: 'climate', chain_head_hash: 'a'.repeat(64), chain_length: 42 },
            { topic: 'ai-safety', chain_head_hash: 'b'.repeat(64), chain_length: 17 },
        ],
        topic_count: 2,
    };
}

// ── Tests ───────────────────────────────────────────────────────────

describe('Ed25519 Key Derivation', () => {
    it('derives a 32-byte public key from a 32-byte private key', () => {
        const pubBytes = ed25519.getPublicKey(hexToBytes(TEST_PRIVATE_KEY));
        expect(pubBytes.length).toBe(32);
        expect(TEST_PUBLIC_KEY.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('getAnchorPublicKey returns the correct public key', () => {
        const env = { ANCHOR_SIGNING_KEY: TEST_PRIVATE_KEY };
        const pubKey = getAnchorPublicKey(env);
        expect(pubKey).toBe(TEST_PUBLIC_KEY);
    });

    it('getAnchorPublicKey returns null when no key configured', () => {
        expect(getAnchorPublicKey({})).toBeNull();
    });
});

describe('Anchor Signing — Round Trip', () => {
    it('signs an anchor and includes public_key and signature', () => {
        const payload = makeTestPayload();
        const signed = signAnchor(payload, TEST_PRIVATE_KEY);

        expect(signed.public_key).toBe(TEST_PUBLIC_KEY);
        expect(signed.signature).toBeDefined();
        expect(signed.signature.length).toBe(128); // 64 bytes = 128 hex chars
        expect(signed.merkle_root).toBe(payload.merkle_root);
        expect(signed.topic_count).toBe(2);
    });

    it('verifies a correctly signed anchor', () => {
        const payload = makeTestPayload();
        const signed = signAnchor(payload, TEST_PRIVATE_KEY);
        const valid = verifyAnchorSignature(signed);
        expect(valid).toBe(true);
    });

    it('signature is deterministic for the same payload and key', () => {
        const payload = makeTestPayload();
        const signed1 = signAnchor(payload, TEST_PRIVATE_KEY);
        const signed2 = signAnchor(payload, TEST_PRIVATE_KEY);
        expect(signed1.signature).toBe(signed2.signature);
    });

    it('different payloads produce different signatures', () => {
        const payload1 = makeTestPayload();
        const payload2 = { ...makeTestPayload(), timestamp: '2026-03-11T00:00:00.000Z' };
        const signed1 = signAnchor(payload1, TEST_PRIVATE_KEY);
        const signed2 = signAnchor(payload2, TEST_PRIVATE_KEY);
        expect(signed1.signature).not.toBe(signed2.signature);
    });

    it('different keys produce different signatures', () => {
        const payload = makeTestPayload();
        const key2 = 'b'.repeat(64);
        const signed1 = signAnchor(payload, TEST_PRIVATE_KEY);
        const signed2 = signAnchor(payload, key2);
        expect(signed1.signature).not.toBe(signed2.signature);
    });
});

describe('Anchor Verification — Tamper Detection', () => {
    it('detects merkle_root tampering', () => {
        const payload = makeTestPayload();
        const signed = signAnchor(payload, TEST_PRIVATE_KEY);

        signed.merkle_root = 'c'.repeat(64);
        expect(verifyAnchorSignature(signed)).toBe(false);
    });

    it('detects chain_heads tampering', () => {
        const payload = makeTestPayload();
        const signed = signAnchor(payload, TEST_PRIVATE_KEY);

        signed.chain_heads[0].chain_length = 999;
        expect(verifyAnchorSignature(signed)).toBe(false);
    });

    it('detects timestamp tampering', () => {
        const payload = makeTestPayload();
        const signed = signAnchor(payload, TEST_PRIVATE_KEY);

        signed.timestamp = '2020-01-01T00:00:00.000Z';
        expect(verifyAnchorSignature(signed)).toBe(false);
    });

    it('detects signature replacement', () => {
        const payload = makeTestPayload();
        const signed = signAnchor(payload, TEST_PRIVATE_KEY);

        signed.signature = '0'.repeat(128);
        expect(verifyAnchorSignature(signed)).toBe(false);
    });

    it('detects public_key swap (wrong key verification)', () => {
        const payload = makeTestPayload();
        const signed = signAnchor(payload, TEST_PRIVATE_KEY);

        // Replace public_key with a different key
        const otherKey = 'b'.repeat(64);
        const otherPub = bytesToHex(ed25519.getPublicKey(hexToBytes(otherKey)));
        signed.public_key = otherPub;
        expect(verifyAnchorSignature(signed)).toBe(false);
    });

    it('rejects anchor without signature', () => {
        const payload = makeTestPayload();
        payload.public_key = TEST_PUBLIC_KEY;
        expect(verifyAnchorSignature(payload)).toBe(false);
    });

    it('rejects anchor without public_key', () => {
        const payload = makeTestPayload();
        const signed = signAnchor(payload, TEST_PRIVATE_KEY);
        delete signed.public_key;
        expect(verifyAnchorSignature(signed)).toBe(false);
    });
});

describe('Cross-Verification — CLI verifier compatibility', () => {
    it('signed anchor can be verified with raw @noble/curves calls', () => {
        // This simulates what the CLI verifier does
        const payload = makeTestPayload();
        const signed = signAnchor(payload, TEST_PRIVATE_KEY);

        // Extract and verify manually (as the CLI would)
        const { signature, public_key, ...rest } = signed;
        const payloadWithKey = { ...rest, public_key };

        // JCS serialize (sort keys recursively)
        function sortKeysDeep(obj) {
            if (obj === null || obj === undefined) return obj;
            if (typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(sortKeysDeep);
            return Object.keys(obj).sort().reduce((acc, key) => {
                acc[key] = sortKeysDeep(obj[key]);
                return acc;
            }, {});
        }
        const message = new TextEncoder().encode(JSON.stringify(sortKeysDeep(payloadWithKey)));
        const sigBytes = hexToBytes(signature);
        const pubBytes = hexToBytes(public_key);

        const valid = ed25519.verify(sigBytes, message, pubBytes);
        expect(valid).toBe(true);
    });
});
