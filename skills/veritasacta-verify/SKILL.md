---
name: veritasacta-verify
description: >
  Offline Ed25519 receipt verifier. Checks signed decision receipts,
  agent manifests, and audit bundles without contacting any server.
  Pure cryptographic math — does not know or contact the issuer.
version: 0.2.4
trigger: when the user mentions verify, verification, receipt, audit, or integrity check
allowed-tools:
  - Bash
  - Read
---

# Veritas Acta Verify — Offline Receipt Verification

## What This Does

Verifies Ed25519-signed receipts and artifacts without contacting any server.
The verifier checks the cryptographic signature over JCS-canonicalized JSON
(RFC 8785). If the record was modified after signing, verification fails.

## Quick Start

```bash
# Self-test: verify a built-in sample receipt
npx @veritasacta/verify@0.2.4 --self-test

# Verify a specific receipt file
npx @veritasacta/verify@0.2.4 receipt.json

# Verify with a specific issuer public key
npx @veritasacta/verify@0.2.4 receipt.json --key issuer-public.json

# Verify an audit bundle
npx @veritasacta/verify@0.2.4 bundle.json
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All receipts verified — signatures valid |
| 1 | One or more signatures invalid |
| 2 | Malformed input |

## Links

- npm: https://npmjs.com/package/@veritasacta/verify
- Source: https://github.com/VeritasActa/Acta
- IETF Draft: https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/
