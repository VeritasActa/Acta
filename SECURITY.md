# Security Policy

## Reporting vulnerabilities

For security issues in the Acta public-record application or the Veritas Acta
website, email **tjf@veritasacta.com**. PGP details are available on request.
Do not post private records, credentials or exploit details in a public issue.

Include the affected commit or deployed route, a minimal reproduction using
synthetic data, expected and actual behavior, and the potential impact. Do not
probe other people's records or production infrastructure to demonstrate an issue.

Tom Farley maintains this repository. Reports are reviewed privately and fixes,
release notes and disclosure timing are coordinated with the reporter. Response
and remediation times depend on the issue; this project does not offer a paid
incident-response SLA. Do not assume that a report or its acknowledgement has a
cryptographically signed receipt.

## Repository and support scope

This policy covers the application Worker in `src/`, its stored-record and
identity handling, the website, and the topic-export/anchor verification tool in
`tools/verify.js`. Report problems affecting the current `main` branch or deployed
site; include the older commit if that is where you reproduced the issue. There
is no separately maintained long-term-support branch.

Other projects maintain their own security policies:

- [Receipt verifier and CLI](https://github.com/VeritasActa/verify/blob/main/SECURITY.md),
  including the receipt engine bundled into this website.
- [protect-mcp gateway](https://github.com/ScopeBlind/scopeblind-gateway/blob/main/SECURITY.md).

If the component is unclear, use the email above and describe where the issue
appears. This repository's package version is not the version of either project.

## Security boundaries and verification limits

Public requests, uploaded receipt data and imported exports are untrusted inputs.
Identity checks, contribution validation, storage and publication are separate
application boundaries. Report a reproducible failure to preserve those boundaries,
including unauthorized mutation, disclosure of private identity material, or
acceptance of an invalid record or signature.

Signatures and hash links can establish integrity relative to a key or retained
checkpoint. They do not establish claim truth, complete history, signer authority
or absence of censorship. An embedded key is not an independent trust anchor;
recipients must establish which issuer key and retained checkpoints they rely on.
An operator-served status page is not an independent witness.

The browser receipt verifier performs its receipt checks locally. Loading its
page still contacts the host. The public-record application and the standalone
anchor tool have their own storage and network behavior; they must not be described
as universally offline or as removing all trust in the issuer.

The local contributor configuration in `wrangler.local.toml` uses synthetic data,
local storage and development identities with AI classification disabled. It is
not a production security configuration. See [CONTRIBUTING.md](CONTRIBUTING.md).

These statements describe the intended boundaries and limits; they are not a
security audit, certification or exclusion of other reproducible findings.
