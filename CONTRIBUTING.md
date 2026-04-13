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
We welcome new implementations of the IETF draft receipt format. Four independent implementations currently produce interoperable receipts:
1. protect-mcp (TypeScript)
2. Agent Passport System (TypeScript)
3. protect-mcp-adk (Python)
4. asqav (Python)

To validate interoperability, your receipts should verify at exit 0 against:
```bash
npx @veritasacta/verify@0.3.0 your-receipt.json --key <public-key-hex>
```

### Cedar Policies
Cedar policy templates for agent governance are welcome. See the [policies directory](https://github.com/scopeblind/scopeblind-gateway/tree/main/policies/cedar).

## Code of Conduct

Be respectful, constructive, and focused on improving the protocol for the security community.

## License

- Protocol and verifier: Apache-2.0 (with patent grant)
- Reference implementation: MIT
- IETF drafts: IETF Trust Legal Provisions
