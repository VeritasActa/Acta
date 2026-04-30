# Agent Governance Examples

These examples show the same pattern across three surfaces:

1. A project declares whether AI agents are used in production or security-relevant work.
2. A governed runtime emits signed receipts for specific actions or decisions.
3. A verifier checks the receipt outside the runtime that created it.

The goal is not to make every project use one vendor. The goal is to give projects a small, inspectable disclosure and evidence layer that existing security tools can consume.

## Files

| Path | Purpose |
| --- | --- |
| `schemas/agent-governance-declaration.schema.json` | JSON Schema for a `.well-known/agent-governance` declaration. |
| `examples/agent-governance-declaration.json` | Example declaration for an agent-governed project. |
| `examples/security-insights-agent-assisted-production.yml` | Example Security Insights extension using the declaration URI. |
| `examples/agent-shell-supervisor/` | Supervisor-attested execution receipt for the Google Agent Shell trust-boundary discussion. |
| `examples/defenseclaw-decision-receipt/` | Decision receipt fixture for DefenseClaw style policy enforcement. |
| `tools/verify-examples.js` | Independent verifier for the signed example receipts. |

## Run the verifier

```bash
npm ci
npm run verify:examples
```

Expected output:

```text
ok examples/agent-shell-supervisor/sample-execute-receipt.json
ok examples/defenseclaw-decision-receipt/sample-decision-receipt.json
ok all example receipts verified
```

## Declaration endpoint

A project can publish a declaration at:

```text
https://example.com/.well-known/agent-governance
```

The declaration answers practical questions:

- Are AI agents used in production or security-relevant workflows?
- Which classes of operations are agent-assisted?
- Is human review required?
- Are signed receipts emitted?
- Where can auditors find receipt examples?

## Why this composition matters

Security metadata is useful when it is short, stable, and machine-readable. Receipts are useful when they are signed, portable, and independently verifiable. Combining both gives maintainers a clear path:

- disclose agent usage in Security Insights;
- link to a `.well-known/agent-governance` declaration;
- publish signed examples for the critical control points;
- let downstream users verify the evidence without trusting the project website.
