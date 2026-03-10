# Verification

How to independently verify the Acta record without trusting the operator.

## Chain Verification

Every entry in the Acta ledger is hash-chained using JCS-SHA256 ([RFC 8785](https://datatracker.ietf.org/doc/rfc8785/) canonicalization + SHA-256). The chain is independently verifiable:

```bash
# Verify a topic export
node tools/verify.js https://hall.example.com/api/export/climate

# Verify from a saved file
node tools/verify.js export.json
```

The verifier recomputes every hash from scratch — payload hashes, author hashes, entry hashes, and chain linkage. It uses only Node.js built-ins. No trust in the operator's code is required.

**What it checks:**
- Payload integrity (content matches its hash)
- Entry integrity (envelope matches its hash)
- Chain linkage (each entry links to the previous)
- Chain head consistency (reported head matches actual last entry)
- Tombstone transparency (removed content preserves hashes; chain integrity survives)

## Signed Anchors

The operator publishes a daily Ed25519-signed checkpoint (anchor) containing a Merkle root of all topic chain heads. This proves the ledger existed in a specific state at a specific time.

```bash
# Verify a signed anchor
node tools/verify.js --anchor https://hall.example.com/api/anchor/latest

# Verify against a known public key
node tools/verify.js --anchor anchor.json --key <public-key-hex>
```

Anchor signature verification requires `@noble/curves` (install with `npm install @noble/curves`). Chain verification does not.

**Anchor format:**
```json
{
  "version": 1,
  "type": "acta:anchor",
  "timestamp": "2026-03-10T00:00:00.000Z",
  "merkle_root": "hex...",
  "chain_heads": [
    { "topic": "...", "chain_head_hash": "hex...", "chain_length": 42 }
  ],
  "topic_count": 2,
  "public_key": "hex...",
  "signature": "hex..."
}
```

## Public Key Trust Root

The anchor signing key is an Ed25519 key pair. The public key is served at:

```
GET /.well-known/acta-anchor-key
```

**Key pinning commitment:** When the system is deployed, the public key fingerprint (SHA-256 of the raw 32-byte public key) will be pinned in:

1. This file (below, under "Pinned Keys")
2. The GitHub release notes for the deployment version
3. The `VeritasActa/acta-witness` repository (external witness)

This ensures the public key is discoverable without trusting the operator's API alone. Git commit history provides independent timestamping of when the key was first published.

**Key rotation procedure:**
- A new key pair is generated
- The new public key fingerprint is committed to this file and the witness repo
- Both old and new keys are listed during a transition period
- Anchors signed with the old key remain verifiable using the old public key
- The transition is public, versioned, and auditable

## External Witnessing

> **Status: not yet implemented.** Signed checkpoints are currently stored in operator-controlled KV storage and served via the operator's API. This section describes the planned external witness architecture.

The signed anchor will be published to at least one location the operator does not control:

1. **Public GitHub repository** (`VeritasActa/acta-witness`) — date-stamped checkpoint files, append-only. Git history provides third-party timestamping.
2. **Additional witnesses** (planned) — Bluesky post, RSS feed, or independent third-party mirror.

Until external witnessing is implemented, the operator can theoretically rewrite history and republish a new "latest" anchor. The signed checkpoint is a prerequisite for external witnessing but does not replace it.

## Pinned Keys

> No keys pinned yet. This section will be updated on first deployment.

| Key ID | Algorithm | Public Key Fingerprint | Pinned At | Status |
|--------|-----------|----------------------|-----------|--------|
| — | Ed25519 | — | — | Pending deployment |

## What This Does Not Guarantee

- This verification proves **record integrity** (the chain has not been tampered with). It does not prove the content is true.
- Signed anchors prove **the operator committed to a specific state at a specific time**. They do not prevent the operator from refusing to serve data.
- External witnesses reduce the operator's ability to rewrite history. They do not eliminate it entirely — a sufficiently determined operator with control of all witness endpoints could theoretically coordinate a rewrite.

The Charter's design is defense in depth: hash chains make tampering detectable, signed anchors make it attributable, external witnesses make it durable, and the challenge mechanism (invariant #3) ensures contested alterations are publicly visible.
