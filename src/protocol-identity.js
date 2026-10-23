/**
 * Protocol Identity: Single source of truth for Acta protocol and instance hashes.
 *
 * Both the manifest (index.js) and anchor signing (chain-publication.js) import from here.
 * This prevents hash drift between published identity and signed anchors.
 *
 * Conceptual separation:
 *   - PROTOCOL_IDENTITY: Charter + Protocol Spec: defines the protocol itself
 *   - INSTANCE_POLICY: Policy: operator-tunable, expected to change per instance
 *
 * SPDX-License-Identifier: Apache-2.0
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
// Exact document bytes used by the existing identity and signed anchors.
// Never point these URLs at a mutable branch: even an editorial punctuation
// change produces different bytes. Local archival copies are checked in CI.

export const DOCUMENT_REVISION = '73b1815c81d527b7ef4d5d1eb775ec1cc80b4e23';

const documentPaths = {
    charter: 'CHARTER.md',
    protocol_spec: 'docs/protocol-spec.md',
    policy: 'docs/policy.md',
};

// The manifest links to raw bytes, not GitHub's rendered HTML wrapper.
export const DOCUMENT_URLS = Object.fromEntries(Object.entries(documentPaths).map(
    ([name, path]) => [name, `https://raw.githubusercontent.com/VeritasActa/Acta/${DOCUMENT_REVISION}/${path}`],
));

export const DOCUMENT_SOURCE_URLS = Object.fromEntries(Object.entries(documentPaths).map(
    ([name, path]) => [name, `https://github.com/VeritasActa/Acta/blob/${DOCUMENT_REVISION}/${path}`],
));

export const IDENTITY_DOCUMENTS = {
    charter: { sha256: PROTOCOL_IDENTITY.charter_hash, archive: 'docs/identity/v1.0.0/CHARTER.md' },
    protocol_spec: { sha256: PROTOCOL_IDENTITY.protocol_spec_hash, archive: 'docs/identity/v1.0.0/protocol-spec.md' },
    policy: { sha256: INSTANCE_POLICY.policy_hash, archive: 'docs/identity/v1.0.0/policy.md' },
};
