# Contributing to Acta

This repository contains the Acta public-record application and the Veritas Acta
website. Small bug fixes, clearer documentation, accessible interfaces and
reproducible tests are welcome. You do not need a Cloudflare account to develop
locally.

## Choose the right repository

| Contribution | Repository |
| --- | --- |
| Public-record application, protocol website or browser-verifier presentation | [Acta](https://github.com/VeritasActa/Acta/issues) |
| Receipt parsing, signature verification or verifier CLI | [verify](https://github.com/VeritasActa/verify/issues) |
| Receipt-format proposal or Internet-Draft feedback | [drafts](https://github.com/VeritasActa/drafts/issues) |
| Cross-implementation fixtures or a new receipt-producer/verifier adapter | [agent-governance-testvectors](https://github.com/ScopeBlind/agent-governance-testvectors) |
| MCP enforcement or Cedar policy templates | [scopeblind-gateway](https://github.com/ScopeBlind/scopeblind-gateway) |

The shared suite records its current results and limitations. See the
[project evidence page](https://github.com/ScopeBlind/agent-governance-testvectors/blob/main/docs/project-evidence.md)
for linked maintenance and interoperability evidence. Passing fixtures is not a
claim that a whole implementation has been audited or that an independent verifier
checked every supported format.

## Run locally

Use Node.js 22 LTS and npm. CI pins its exact Node version in
[the site workflow](.github/workflows/site.yml).

```bash
git clone https://github.com/VeritasActa/Acta.git
cd Acta
npm ci
npm run check:identity
npm test -- --run
npm run dev:local
```

Open `http://127.0.0.1:8787`. `dev:local` uses
[`wrangler.local.toml`](wrangler.local.toml): local KV and Durable Objects, no
production routes, no Workers AI binding and no remote identity endpoint. Local
state persists in `.wrangler/state/acta-local/`; stop the process with Ctrl-C.
Dependency installation downloads packages, but the local preview requires no
Cloudflare login or deployment credentials.

Use synthetic records only. Local development permits anonymous identities and
skips AI classification; it does not reproduce production authentication or
moderation. Do not load production secrets into `.dev.vars` or `.env` for this
workflow. The local config is for development, never public deployment.

`wrangler.toml` is the existing deployment configuration. `npm run deploy` publishes
to Cloudflare and is not part of the contributor workflow. Do not change production
bindings, routes, migrations or secrets in a documentation or UI-only contribution.

## Find the code

- `src/index.js`: Worker routes and application request flow.
- `src/protocol-ui.js` and `src/ui.js`: protocol-site and public-record presentation.
- `src/validators/` and `src/durable-objects/`: contribution rules and stored history.
- `public/`: synchronized verifier bundle, example receipt and release metadata.
- `tools/verify.js`: topic-export and anchor verification for this application.
  It is distinct from the receipt CLI in `VeritasActa/verify`.
- `tests/`: Vitest coverage, including route behavior, document identity and
  runnable documentation examples.

## Make a focused change

Open an issue before a large change so scope and compatibility can be discussed.
For a bug, include the commit, Node version, exact command or route, expected and
actual result, and a minimal synthetic example. For a UI change, include a screenshot
at desktop and narrow-phone widths and check keyboard use.

Add a regression test when changing validation, verification, stored records or
request behavior. Fixtures should contain synthetic identities and records, state
the expected result and explain what boundary the example tests. Include a rejected
or tampered case when introducing a new acceptance path. Never commit real customer
records, access tokens, private signing keys or production exports.

Before opening a pull request, run:

```bash
npm run check:identity
npm test -- --run
git diff --check
```

For identity-related work, `npm run check:identity -- --remote` also fetches the
immutable published document URLs and checks their bytes. CI runs this remote
check and a Worker build dry run; neither command deploys the website.

## Preserve published records and generated assets

The [Charter](CHARTER.md) and application rules are part of the public record's
identity. Follow [the identity archive guide](docs/identity/README.md). Do not edit
`docs/identity/v1.0.0/` or regenerate committed hashes to silence a failing test.
Changes to a published identity require an explicit, reviewed version transition.

The browser receipt engine and release metadata in `public/` come from
`VeritasActa/verify`. Fix the source there, run its documented build/synchronization
tools and review the generated diff. Do not hand-patch the bundled engine or claim
a release is current by editing its version string alone.

## Review, conduct and security

Tom Farley (`@tomjwxf`) maintains this repository and reviews merges and releases.
See [GOVERNANCE.md](GOVERNANCE.md) for the decision process. Keep discussion
respectful, specific and supported by reproducible evidence. Contributors may use
AI tools, but remain responsible for reviewing their changes and reporting checks
they actually ran.

Report vulnerabilities privately using [SECURITY.md](SECURITY.md), rather than
posting exploit details or sensitive records in a public issue.

Contributions follow the repository's [Apache-2.0 licence](LICENSE). Preserve
existing attribution and any file-specific notices. Other linked projects publish
their own licences; contributing here does not change their terms.
