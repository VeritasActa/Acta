# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in any Veritas Acta project, please report it responsibly.

**Email:** tjf@veritasacta.com
**PGP:** Available on request

Please include:
- Description of the vulnerability
- Steps to reproduce
- Affected versions
- Potential impact

We will acknowledge receipt within 48 hours and provide an initial assessment within 7 days.

## Supported Versions

| Package | Version | Supported |
|---------|---------|-----------|
| @veritasacta/verify | 0.2.x | Yes |
| @veritasacta/artifacts | 0.2.x | Yes |
| @veritasacta/protocol | 0.1.x | Yes |
| protect-mcp | 0.5.x | Yes |
| protect-mcp-adk | 0.1.x | Yes |

## Security Model

The Veritas Acta protocol is designed so that security does not depend on trusting the operator:

- **Ed25519 signatures** (RFC 8032) provide tamper-evidence
- **JCS canonicalization** (RFC 8785) ensures deterministic serialization
- **Chain linking** (previousReceiptHash) provides ordering integrity
- **Offline verification** requires zero network calls and zero trust in the issuer

The verifier (@veritasacta/verify) is Apache-2.0 and can be audited by any party.

## Coordinated Disclosure

We follow coordinated vulnerability disclosure:
1. Report received and acknowledged (48 hours)
2. Vulnerability confirmed and assessed (7 days)
3. Fix developed and tested (30 days)
4. Fix released with advisory (90 days max)
5. Public disclosure after patch is available

Every step in our disclosure process produces a receipt-signed artifact following our own IETF draft (draft-farley-acta-signed-receipts).
