# Agent Shell Supervisor Receipt Example

This example responds narrowly to the trust-boundary question in `google/agent-shell-tools#29`.

## Core position

`grpc_execd` is not the trusted observer.

In the `Agent outside the sandbox` composition, the agent may be able to run arbitrary commands through `grpc_execd`, and those commands may affect `grpc_execd` itself. A value returned by `grpc_execd` is therefore self-reported correlation data, not trustworthy third-party evidence.

The environment commitment should be reported by the component that owns or manages the execution environment: `wsb`, a wrapper that launches `wsb`, or a separate trust domain that can observe the request and response from outside `grpc_execd`.

The safer composition is:

1. `grpc_exec` stays minimal and returns execution results.
2. The environment owner computes the environment commitment.
3. A supervisor or observer signs a receipt that binds the command digest, working-directory digest, environment commitment, response digest, exit code, and observer identity.

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
| `environment.commitment` | Commits to an allowlisted environment snapshot created by the environment owner. |
| `environment.context` | States whether the commitment is self-reported, supervisor-attested, or third-party-attested. |
| `environment.owner` | Identifies the component that owns or manages the execution environment. |
| `response.digest` | Commits to stdout, stderr, exit code, and response metadata. |
| `observer.id` | Identifies the supervisor or observer. |
| `signature` | Signs the receipt from outside the controlled process. |

## Why not put this directly in `ExecuteResponse`

A raw `environment_commitment` in `ExecuteResponse` is easy to misread as proof. In the `Agent outside the sandbox` composition, it is only a statement from the process being controlled.

That does not make the value useless. It can still be useful for local correlation. It just should not be represented as evidence unless the receipt also says who observed it and which trust boundary produced it.

For Google Agent Shell, the cleanest design appears to be a sidecar receipt emitted by `wsb`, a `wsb` launcher wrapper, or another supervisor. The receipt can live beside the `grpc_exec` response without expanding the `grpc_exec` response shape.

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
