# Published identity documents

The files in `v1.0.0/` preserve the exact bytes committed to by the existing
protocol identity and signed anchors. They were recovered from Acta commit
[`73b1815c81d527b7ef4d5d1eb775ec1cc80b4e23`](https://github.com/VeritasActa/Acta/tree/73b1815c81d527b7ef4d5d1eb775ec1cc80b4e23).

The September 10, 2026 editorial revision replaced em dashes with colons in
the working documents. That changed all three byte fingerprints, without
changing the published identity. The manifest now links directly to immutable
raw files at the historical commit so each document can be independently hashed.
No identity hashes or historical anchors have been rewritten.

| Document | SHA-256 |
| --- | --- |
| Charter | `3a0f734d87d5d156e550df1361988c398190e72eea40144af8c28379ab5727d9` |
| Protocol specification | `d1f90577539dcc127a154f65e9777641499437c1e483ee3729a0eb23d182d82f` |
| Instance policy | `3f1e0734c11413a16251572270c9a2d726f82e080cbbf094109a8cbd2011a293` |

Run `npm run check:identity` for the local archive check. Run
`npm run check:identity -- --remote` to also check the bytes at all three
published source URLs. CI runs the remote check before testing and building.
Both commands run without publishing or changing anything.

Do not edit the archived files or regenerate hashes to pass a failing check.
Changes to protocol identity require an explicit version transition; a future
policy revision must likewise be identified separately from historical policy
bytes. Current editorial documents remain at the repository's top-level paths.
