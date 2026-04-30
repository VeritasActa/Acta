# DefenseClaw Decision Receipt Example

This example gives `cisco-ai-defense/defenseclaw#136` a verifier-visible receipt fixture that can be checked outside the DefenseClaw process.

## Boundary

DefenseClaw makes a policy decision before a tool action runs. The receipt signs the decision facts:

| Field | Purpose |
| --- | --- |
| `tool_name` | Tool or action under governance. |
| `decision` | `allow` or `deny`. |
| `policy_id` | Human-readable policy identifier. |
| `policy_digest` | Stable digest of the policy material used for the decision. |
| `previous_receipt_hash` | Optional chain link to the prior receipt. |
| `signature` | Ed25519 signature over canonical receipt data excluding `signature` and `public_key`. |
| `public_key` | Hex encoded Ed25519 public key for independent verification. |

## Files

- `make_sample.go`: deterministic sample generator using Go stdlib Ed25519.
- `sample-decision-receipt.json`: generated signed decision receipt.
- `expected-full-receipt-hash.txt`: SHA-256 digest over the full canonical receipt, including signature and public key.

## Regenerate sample

```bash
go run make_sample.go
```

Then run the repository-level example verifier:

```bash
npm run verify:examples
```
