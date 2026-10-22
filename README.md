# Acta public record

**A reference application using Veritas Acta signed records.**

This repository implements the public-record application and hosts the protocol
website. The receipt format, verifier and application are related, but distinct.

- [Veritas Acta](https://www.veritasacta.com): open receipt format, verification tools and interoperability.
- [Acta public record](https://www.veritasacta.com/record): typed contributions, challenges, public history and exports.
- [ScopeBlind](https://scopeblind.com): commercial applications and enforcement products.

## Start in the right place

| Goal | Destination |
| --- | --- |
| Check an existing decision receipt | [Browser verifier](https://www.veritasacta.com/verify?sample=current) or [offline CLI](https://github.com/VeritasActa/verify) |
| Read the Charter and ten permanent invariants | [Charter](https://www.veritasacta.com/about) |
| Implement the receipt format | [Signed Receipts Internet-Draft](https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/) |
| Inspect interoperability evidence | [Conformance corpus and runs](https://www.veritasacta.com/conformance) |
| Use this application's APIs | [Application guide](https://www.veritasacta.com/docs) |
| Understand contribution/state transitions | [Application specification](docs/protocol-spec.md), [charter](CHARTER.md), [policy](docs/policy.md) |

`docs/protocol-spec.md` describes this application's contribution and response state
machine. **It is not the signed receipt format specification.**

## What the application does

Questions, claims, predictions and evidence have explicit types. Participants can
respond, challenge and supersede contributions. The implementation uses hash-chained
entries, exports and signed checkpoints to make retained records checkable. Its
moderation and identity policies remain application-specific.

A signature or internally consistent chain does not establish claim truth, complete
history or freedom from censorship. Recipients must evaluate sources, independently
pinned keys and retained checkpoints. Operator-served checks are conveniences, not
independent witnesses.

## Verifier Sigil

`npx @veritasacta/verify --self-check` compares installed bytes with the verifier's
bundled integrity commitment. It **does not independently authenticate the publisher**
or establish a canonical release. Replacing both code and commitment can produce an
internally consistent fork. Authenticate a reference separately and inspect release
provenance. No private-key possession is implied by a matching self-check.

## Release and standards status

<!-- release-manifest:start -->
Verifier: **[0.10.27](https://github.com/VeritasActa/verify/releases/tag/v0.10.27)**. Status reviewed 2026-10-21.

- [draft-farley-acta-signed-receipts-03](https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/): active individual Internet-Draft.
- [draft-farley-acta-knowledge-units-00](https://datatracker.ietf.org/doc/draft-farley-acta-knowledge-units/): expired individual Internet-Draft (expired 2026-10-08).

Internet-Drafts are proposals, not adopted IETF standards or endorsements.
<!-- release-manifest:end -->

The source of version/status metadata is
[`VeritasActa/verify/release-manifest.json`](https://github.com/VeritasActa/verify/blob/main/release-manifest.json).
This repo retains the synchronized copy in `public/`, together with the browser
bundle and fingerprint. Run the verifier repo's `scripts/sync-public-metadata.mjs`
with sibling `Acta`, `.github` and `drafts` checkouts, then review and commit the changes.

## Develop

```bash
npm ci
npm test -- --run
npm run dev:local
```

Open `http://127.0.0.1:8787`. The local contributor configuration uses local KV and
Durable Objects without a Cloudflare account, production routes, remote AI or a
remote identity service. Use synthetic records: development identity and moderation
behavior differ from production. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup,
test commands and the source map.

The Cloudflare Worker serves the site and application API. `wrangler.toml` remains
the production configuration, including scheduled checkpoint publication.
`npm run deploy` publishes to Cloudflare and is a separate maintainer action, not
part of the local contributor workflow.

The browser verifier uses the same receipt engine as the CLI. It accepts an explicit
external key and does not fetch or upload receipt content: its route uses
`connect-src 'none'` and no form submission. Loading the page still contacts the host;
local computation does not make the hosting service an independent trust authority.

## Maintainers and contributions

Maintained by Tom Farley / ScopeBlind. Open verification is not a claim of independent
foundation governance. For receipt bugs, use [verify issues](https://github.com/VeritasActa/verify/issues);
for application bugs, [open an issue here](https://github.com/VeritasActa/Acta/issues).
Include a reproducible example without confidential records.

See [CONTRIBUTING.md](CONTRIBUTING.md), [GOVERNANCE.md](GOVERNANCE.md),
[SECURITY.md](SECURITY.md) and [LICENSE](LICENSE) for contribution, reporting and
licensing terms.
