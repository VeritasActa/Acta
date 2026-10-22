# Governance

Acta is maintained by Tom Farley ([`@tomjwxf`](https://github.com/tomjwxf)), who
also works on ScopeBlind. This is an open-source project with a named maintainer,
not an independent foundation or a standards body's adopted specification.

## Decisions and review

Use issues for application proposals and pull requests for changes. Describe the
problem, compatibility impact and evidence behind a proposal. The maintainer makes
merge and release decisions after reviewing the implementation and relevant checks.
Contributions are welcome without becoming a customer or joining an organisation.

Protocol-format proposals belong in
[VeritasActa/drafts](https://github.com/VeritasActa/drafts); verifier changes belong
in [VeritasActa/verify](https://github.com/VeritasActa/verify). This repository owns
the public-record application and protocol website. Its published Charter and
historical identity documents must be preserved as described in
[the identity guide](docs/identity/README.md).

## Releases and deployment

A merged pull request is not a production deployment. Publishing the website and
changing production bindings or migrations are separate maintainer actions.
Contributors use the local workflow in [CONTRIBUTING.md](CONTRIBUTING.md).

Release metadata and bundled receipt-verifier assets are synchronized from the
verifier repository. A change should name its source version and retain the checks
needed to reproduce it. Security reports use the private route in
[SECURITY.md](SECURITY.md).

## Participation

Discuss disagreements in the relevant issue with concrete alternatives and evidence.
There is currently no elected council, independent arbitration body or guaranteed
review turnaround. Additional maintainers can be proposed publicly as ongoing
contribution and review needs develop; any change of ownership or release access
should be documented here.
