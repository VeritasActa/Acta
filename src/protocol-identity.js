/**
 * Protocol Identity — Single source of truth for Acta protocol and instance hashes.
 *
 * Both the manifest (index.js) and anchor signing (chain-publication.js) import from here.
 * This prevents hash drift between published identity and signed anchors.
 *
 * Conceptual separation:
 *   - PROTOCOL_IDENTITY: Charter + Protocol Spec — defines the protocol itself
 *   - INSTANCE_POLICY: Policy — operator-tunable, expected to change per instance
 *
 * @license MIT
 */

// ── Protocol Identity ────────────────────────────────────────────────
// These define what the protocol IS. Changing these means a new protocol version.

export const PROTOCOL_IDENTITY = {
    charter_hash: '3a0f734d87d5d156e550df1361988c398190e72eea40144af8c28379ab5727d9',
    protocol_spec_hash: 'd1f90577539dcc127a154f65e9777641499437c1e483ee3729a0eb23d182d82f',
    protocol_version: '1.0.0',
};

// ── Instance Policy ──────────────────────────────────────────────────
// Operator-level configuration. Can change without changing protocol identity.

export const INSTANCE_POLICY = {
    policy_hash: '3f1e0734c11413a16251572270c9a2d726f82e080cbbf094109a8cbd2011a293',
};

// ── Document URLs ────────────────────────────────────────────────────
// Where to find the source documents for independent hash verification.

export const DOCUMENT_URLS = {
    charter: 'https://github.com/VeritasActa/Acta/blob/main/CHARTER.md',
    protocol_spec: 'https://github.com/VeritasActa/Acta/blob/main/docs/protocol-spec.md',
    policy: 'https://github.com/VeritasActa/Acta/blob/main/docs/policy.md',
};
