# Agent Shell Tools Supervisor Receipt Example

This example responds to the trust-boundary concern in `google/agent-shell-tools#29`.

## Core position

If the agent can control `grpc_execd`, a value returned by `grpc_execd` is not trustworthy third-party evidence. It is self-reported correlation data.

The safer composition is to keep `grpc_exec` minimal and place evidence generation in a separate supervisor or observer. The supervisor observes the request and response, computes an environment commitment, and signs a receipt from a different trust domain.

## Useful trust states

| Context | Meaning |
| --- | --- |
| `self-reported` | The process that returned the value also reports the commitment. Useful for local correlation only. |
| `supervisor-attested` | A separate local supervisor observed the request and response and signed the receipt. Useful for stronger local audit. |
| `third-party-attested` | A separate trust domain observed or verified the event and signed the receipt. Useful for external verification. |

## Receipt boundary

The supervisor receipt binds:

| Field | Purpose |
| --- | --- |
| `command.digest` | Commits to the command and arguments. |
| `working_directory.digest` | Commits to the execution directory identity without exporting the full tree. |
| `environment.commitment` | Commits to an allowlisted environment snapshot. |
| `response.digest` | Commits to stdout, stderr, exit code, and response metadata. |
| `observer.id` | Identifies the supervisor or observer. |
| `signature` | Signs the receipt from outside the controlled process. |

## Why not put this directly in `ExecuteResponse`

A raw `environment_commitment` in `ExecuteResponse` is easy to misread as proof. In the `Agent outside the sandbox` composition, it is only a statement from the process being controlled.

If `ExecuteResponse` grows this field, it should carry context such as `self-reported` or `supervisor-attested`. Otherwise the cleaner design is a wrapper that emits the receipt beside the response.

## Files

- `receipt.schema.json`: JSON schema for the supervisor receipt shape.
- `make_sample.go`: deterministic sample generator using Go stdlib Ed25519.
- `sample-execute-receipt.json`: generated receipt with a real signature over deterministic canonical JSON.
- `REPLY-agent-shell-tools-29.md`: concise reply text for the GitHub issue.

## Regenerate sample

```bash
go run make_sample.go
```

Then run the repository-level example verifier:

```bash
npm run verify:examples
```
