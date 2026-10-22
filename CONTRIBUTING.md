# Contributing to Veritas Acta

Thank you for your interest in contributing to the Veritas Acta protocol.

## Ways to Contribute

### Protocol Feedback
- Open an issue on [VeritasActa/Acta](https://github.com/VeritasActa/Acta/issues) for protocol-level discussion
- Comment on the IETF Internet-Drafts via the [drafts repo](https://github.com/VeritasActa/drafts)

### Implementation
- The reference implementation (protect-mcp) is at [ScopeBlind/scopeblind-gateway](https://github.com/scopeblind/scopeblind-gateway)
- The verifier (@veritasacta/verify) is at [VeritasActa/verify](https://github.com/VeritasActa/verify)
- Integration examples are at [ScopeBlind/examples](https://github.com/ScopeBlind/examples)

### Interoperability
We welcome new implementations of the IETF draft receipt format. The shared conformance suite, [ScopeBlind/agent-governance-testvectors](https://github.com/ScopeBlind/agent-governance-testvectors), runs each implementation's driver in CI. Four implementations pass it, as its README's status table records: protect-mcp (TypeScript), maintained by the draft's author, and three independent ones, nobulex (Python), the APS governance hook (Python) and cryptovalid-opencore (Python). asqav's own Internet-Draft, draft-marques-asqav-compliance-receipts, draws on this one.

To check your receipts, verify each at exit 0 with the reference verifier and the issuer's public key, then add a driver to the suite so it runs in CI:
```bash
npx @veritasacta/verify your-receipt.json --key <public-key-hex>
```

### Cedar Policies
Cedar policy templates for agent governance are welcome. See the [policies directory](https://github.com/scopeblind/scopeblind-gateway/tree/main/policies/cedar).

## Code of Conduct

Be respectful, constructive, and focused on improving the protocol for the security community.

## License

- Protocol and verifier: Apache-2.0 (with patent grant)
- Reference implementation: MIT
- IETF drafts: IETF Trust Legal Provisions
