# Acta — Technical Architecture

> This document describes the technical architecture of the Acta protocol,
> its reference implementation, and key design decisions.

---

## 1. Core Components

The Acta protocol requires the following components in any conformant implementation:

| Component | Purpose |
|---|---|
| **Hash-chained ledger** | Tamper-evident, append-only record of contributions |
| **Typed contribution schema** | Structured validation for question/claim/prediction types |
| **State machine** | Tracks contribution lifecycle (open → contested → superseded) |
| **Device budget enforcement** | Per-device rate limiting for sybil resistance |
| **Identity layer** | Privacy-preserving device attestation (VOPRF, DPoP, or equivalent) |
| **Schema validation (Tier 1)** | Deterministic structural checks |
| **Content classification (Tier 2)** | LLM-assisted tagging (tag only, never gatekeeping) |
| **Human moderation queue (Tier 3)** | Escalation path for appeals and hard-reject cases |

---

## 2. Recommended Architecture

### Separation Principle

The Acta ledger should run as a **separate service** from any commercial implementation that uses it. It shares the identity verification layer but has its own storage, logic, and API surface.

### Architecture Diagram

```mermaid
graph TB
    subgraph "Participants"
        HB[Human - Browser] --> GHW
        AG[Agent - MCP/API] --> GHW
    end

    subgraph "Acta Service"
        GHW[API Gateway]
        GHW --> AUTH[Identity Verification]
        AUTH --> T1[Tier 1: Schema Validator<br/>+ Rate Limiter]
        T1 --> T2[Tier 2: LLM Classifier<br/>tag only, no gatekeeping]
        T2 --> LC[Ledger Commit]
        T2 -->|hard-reject flag| HRQ[Hard-Reject Queue<br/>→ Tier 3 human]
    end

    subgraph "Storage"
        LC --> LCDO[Ledger Chain<br/>per-topic ordering +<br/>hash-chain integrity]
        LCDO --> ARCHIVE[Archive<br/>immutable backup]
        T1 --> RLDO[Rate Limiter<br/>per-device token budget]
        GHW --> IDX[Index Store<br/>indexes, state cache,<br/>feed queries]
    end

    subgraph "Read Layer"
        IDX --> FEED[/api/hall/feed]
        IDX --> AUDIT[/api/hall/audit]
        GHW --> CONST[/api/hall/charter]
    end
```

---

## 3. Key Technical Decisions

### 3.1 The Ledger Chain

This is the most critical component.

**Why a strongly-consistent store (not eventually-consistent KV):**
- Eventually-consistent stores cannot guarantee ordering
- Mutable stores cannot prove integrity
- A strongly-consistent, single-writer store can maintain a strict linear hash chain

**Design:**
- One chain per **topic** (keeps chains manageable, allows parallel writes across topics)
- Each chain maintains the `prev_hash` of its last entry
- Writes are serialized within a topic (guaranteed linear order)
- After writing, the entry is replicated to:
  - An index store (for fast global read access / feed queries)
  - An archive (for immutable backup)

```
WRITE FLOW:
1. Contribution arrives at API gateway
2. Tier 1: Schema validation + device budget check
3. Tier 2: LLM classification (tag, don't gate)
4. Ledger Chain: append entry with prev_hash
5. Async: replicate to index store + archive
6. Return entry_id + entry_hash to participant
```

**Hash-chain implementation** (~30 lines):
```javascript
async appendEntry(entry) {
  const prevHash = await this.storage.get('prev_hash') || '0'.repeat(64);

  const fullEntry = {
    ...entry,
    entry_id: crypto.randomUUID(),
    prev_hash: prevHash,
    timestamp: new Date().toISOString(),
  };

  // Compute entry hash (deterministic serialization)
  const canonical = JSON.stringify(fullEntry, Object.keys(fullEntry).sort());
  const hashBuffer = await crypto.subtle.digest('SHA-256',
    new TextEncoder().encode(canonical));
  const entryHash = [...new Uint8Array(hashBuffer)]
    .map(b => b.toString(16).padStart(2, '0')).join('');

  fullEntry.entry_hash = entryHash;

  // Write entry + update prev_hash atomically
  await this.storage.put(`entry:${fullEntry.entry_id}`, fullEntry);
  await this.storage.put('prev_hash', entryHash);
  await this.storage.put('chain_length',
    ((await this.storage.get('chain_length')) || 0) + 1);

  return fullEntry;
}
```

### 3.2 Schema Validation (Tier 1)

Deterministic, no LLM. Implemented as a pure function:

```javascript
function validateContribution(type, payload) {
  const errors = [];

  // Common required fields
  if (!payload.body || typeof payload.body !== 'string' || payload.body.length < 1) {
    errors.push({ field: 'body', error: 'required' });
  }

  switch (type) {
    case 'claim':
      if (!['factual', 'opinion', 'hypothesis'].includes(payload.category)) {
        errors.push({ field: 'category', error: 'must be factual|opinion|hypothesis' });
      }
      if (payload.category === 'factual' && !payload.source && !payload.reasoning) {
        errors.push({
          field: 'source',
          error: 'Factual claims require source or reasoning. Add one, or change category to opinion/hypothesis.'
        });
      }
      break;

    case 'prediction':
      if (!payload.resolution_criteria) {
        errors.push({ field: 'resolution_criteria', error: 'required' });
      }
      if (!payload.resolution_date || isNaN(Date.parse(payload.resolution_date))) {
        errors.push({ field: 'resolution_date', error: 'required, valid ISO-8601' });
      }
      if (!payload.resolution_source) {
        errors.push({ field: 'resolution_source', error: 'required' });
      }
      break;

    case 'question':
      // No additional burden
      break;
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}

function validateResponse(type, payload) {
  const errors = [];

  if (!payload.target_id) {
    errors.push({ field: 'target_id', error: 'required' });
  }

  switch (type) {
    case 'challenge':
      // ASYMMETRIC FRICTION — stricter schema
      if (!payload.target_assertion) {
        errors.push({
          field: 'target_assertion',
          error: 'Must quote or reference the specific assertion being challenged'
        });
      }
      if (!['counter_evidence', 'logical_error', 'source_unreliable', 'missing_context']
            .includes(payload.basis)) {
        errors.push({ field: 'basis', error: 'required: counter_evidence|logical_error|source_unreliable|missing_context' });
      }
      if (!payload.argument || payload.argument.length < 20) {
        errors.push({ field: 'argument', error: 'Substantive argument required (min 20 chars)' });
      }
      if (['counter_evidence', 'source_unreliable'].includes(payload.basis) && !payload.source) {
        errors.push({ field: 'source', error: 'Source required for this basis type' });
      }
      break;

    case 'evidence':
      if (!payload.source) errors.push({ field: 'source', error: 'required' });
      if (!['supporting', 'refuting', 'contextual'].includes(payload.stance)) {
        errors.push({ field: 'stance', error: 'required: supporting|refuting|contextual' });
      }
      break;

    case 'resolution':
      if (!payload.outcome) errors.push({ field: 'outcome', error: 'required' });
      if (!payload.source) errors.push({ field: 'source', error: 'required' });
      break;

    case 'update':
      if (!['correction', 'additional_context', 'scope_change', 'alternative_source']
            .includes(payload.update_type)) {
        errors.push({ field: 'update_type', error: 'required' });
      }
      break;
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}
```

### 3.3 Device Budget Enforcement

Per-device atomic counters for rate limiting:

- One counter per device attestation hash
- Stores: `{ tokens_remaining: N, last_reset: ISO-8601 }`
- Resets every 24h (midnight UTC)
- Returns remaining balance on every interaction (participant always knows their budget)
- Different costs for contributions (2 tokens) vs. responses (1 token) vs. challenges (2 tokens)

### 3.4 State Machine

Implemented as a function that runs on every new response, computing the current state:

```javascript
function computeClaimState(claim, responses) {
  const challenges = responses.filter(r => r.subtype === 'challenge');
  const addressed = challenges.filter(c =>
    responses.some(r =>
      r.target_id === c.entry_id &&
      (r.subtype === 'evidence' || r.subtype === 'update')
    )
  );

  if (challenges.length > 0 && addressed.length < challenges.length) {
    return 'contested'; // Unaddressed challenges exist
  }

  if (responses.some(r =>
    r.subtype === 'update' && r.update_type === 'scope_change' && r.supersedes === claim.entry_id
  )) {
    return 'superseded';
  }

  const evidence = responses.filter(r => r.subtype === 'evidence' && r.stance === 'supporting');
  return {
    state: 'open',
    display_hint: evidence.length > 0 && challenges.length === 0 ? 'supported' : 'open'
  };
}
```

---

## 4. Privacy-Preserving Identity

Acta requires device attestation that is:
- Privacy-preserving (the system should not know WHO is posting — only that this device has not exceeded its budget)
- Sybil-resistant (one device = one voice = one budget)
- Verifiable without the issuer learning which device is being verified

VOPRF (Verifiable Oblivious Pseudorandom Function) combined with issuer-blind verification provides this. The verifier can confirm "this device has a valid attestation" without the issuer learning which device made which contribution. This is the technical foundation for the Charter's promise that provenance is recorded but anonymity is preserved.

**Comparison with alternatives:**
- **Account-based systems** (Reddit, X) — require PII, not anonymous
- **Fully anonymous systems** (4chan, Nostr) — no sybil resistance
- **Blockchain-based** (Farcaster) — wallet-based identity, expensive, not device-linked
- **VOPRF-based** — device-linked, privacy-preserving, sybil-resistant, no PII

---

## 5. What NOT to Use

| Technology | Why Not |
|---|---|
| **Blockchain / on-chain storage** | Unnecessary complexity and cost. Hash-chaining gives tamper-evidence without gas fees, consensus mechanisms, or scalability limits. Chain hashes can be anchored to a blockchain later as an additional trust layer |
| **Traditional database (Postgres, etc.)** | Edge-native stacks give global distribution without managing servers. A database adds latency, infrastructure, and operational burden |
| **Third-party auth (Auth0, Clerk)** | Device attestation via VOPRF is strictly better for this use case — anonymous, privacy-preserving |
| **Third-party moderation API** | Moderation tiers are custom. Tier 1 is deterministic code. Tier 2 is your own LLM prompt. No need for external moderation services |
| **GraphQL** | Adds complexity without proportional benefit. REST with typed JSON payloads is simpler and sufficient |

---

## 6. Reference Implementation Stack

| Layer | Technology | Why |
|---|---|---|
| **Identity** | VOPRF (primary) + DPoP/Passport (agents) | Privacy-preserving, sybil-resistant, no PII |
| **Compute** | Edge workers (e.g., Cloudflare Workers) | Global, edge-native, sub-100ms latency |
| **Ordering + Integrity** | Strongly-consistent store with hash-chain per topic | Single-threaded consistency, tamper-evident |
| **Fast Reads** | Globally-replicated KV (indexes, state cache) | Fast reads worldwide |
| **Archive** | Object storage (immutable backup) | Cheap, immutable |
| **Budget Enforcement** | Atomic per-device counters | Sybil resistance |
| **Schema Validation** | Pure functions | Deterministic, no dependencies |
| **Content Classification** | LLM API | Tier 2 tagging only, never gatekeeping |
| **Agent Access** | MCP plugin + REST API | Interoperable agent integration |
| **Web UI** | Static site | Minimal, read-first |
| **Crypto** | @noble/curves + Web Crypto API | Audited, well-maintained |

---

## 7. Commercial Implementations

[ScopeBlind](https://scopeblind.com) provides a commercial implementation of Acta with managed issuance, dashboards, and enforcement. The protocol itself is MIT-licensed and can be implemented independently by anyone.
